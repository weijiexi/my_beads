import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/mailer", () => ({
  sendPasswordResetEmail: vi.fn(async () => undefined),
}));

import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as resetRequest } from "@/app/api/auth/password-reset/request/route";
import { POST as resetConfirm } from "@/app/api/auth/password-reset/confirm/route";
import { GET as getSession } from "@/app/api/auth/session/route";
import { sendPasswordResetEmail } from "@/lib/auth/mailer";
import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/auth/tokens";
import { jsonRequest } from "./helpers/request";
import { getRawCookie, resetCookies } from "./helpers/cookies";

const SIGNUP_URL = "http://localhost/api/auth/signup";
const LOGIN_URL = "http://localhost/api/auth/login";
const REQUEST_URL = "http://localhost/api/auth/password-reset/request";
const CONFIRM_URL = "http://localhost/api/auth/password-reset/confirm";

const mockMailer = vi.mocked(sendPasswordResetEmail);

async function createUser(email = "reset@example.com", password = "hunter2hunter2") {
  await signup(jsonRequest(SIGNUP_URL, { email, password }));
  resetCookies();
  return { email, password };
}

async function requestResetAndCaptureToken(email: string): Promise<string> {
  mockMailer.mockClear();
  const res = await resetRequest(jsonRequest(REQUEST_URL, { email }));
  expect(res.status).toBe(200);
  expect(mockMailer).toHaveBeenCalledTimes(1);
  const args = mockMailer.mock.calls[0]![0];
  return args.token;
}

describe("password reset", () => {
  beforeEach(() => {
    mockMailer.mockClear();
  });

  describe("POST /password-reset/request", () => {
    it("returns 200 and stores a hashed token for a known email", async () => {
      await createUser("known@example.com");
      const token = await requestResetAndCaptureToken("known@example.com");
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);

      const stored = await prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashResetToken(token) },
      });
      expect(stored).not.toBeNull();
      expect(stored?.usedAt).toBeNull();
      expect(stored?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("returns 200 for an unknown email and does NOT send an email (no enumeration)", async () => {
      const res = await resetRequest(jsonRequest(REQUEST_URL, { email: "ghost@example.com" }));
      expect(res.status).toBe(200);
      expect(mockMailer).not.toHaveBeenCalled();

      const tokens = await prisma.passwordResetToken.findMany();
      expect(tokens).toHaveLength(0);
    });

    it("rejects an invalid email format with 400", async () => {
      const res = await resetRequest(jsonRequest(REQUEST_URL, { email: "not-an-email" }));
      expect(res.status).toBe(400);
    });
  });

  describe("POST /password-reset/confirm", () => {
    it("updates the password with a valid token and lets the user log in with the new password", async () => {
      const { email } = await createUser("rotate@example.com", "old-password-1");
      const token = await requestResetAndCaptureToken(email);

      const res = await resetConfirm(jsonRequest(CONFIRM_URL, { token, password: "new-password-9" }));
      expect(res.status).toBe(200);

      const oldLogin = await login(jsonRequest(LOGIN_URL, { email, password: "old-password-1" }));
      expect(oldLogin.status).toBe(401);

      const newLogin = await login(jsonRequest(LOGIN_URL, { email, password: "new-password-9" }));
      expect(newLogin.status).toBe(200);
    });

    it("rejects an expired token (1h enforced)", async () => {
      const { email } = await createUser("expire@example.com");
      const token = await requestResetAndCaptureToken(email);

      await prisma.passwordResetToken.update({
        where: { tokenHash: hashResetToken(token) },
        data: { expiresAt: new Date(Date.now() - 1_000) },
      });

      const res = await resetConfirm(jsonRequest(CONFIRM_URL, { token, password: "another-password-x" }));
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toMatch(/invalid|expired/i);
    });

    it("rejects a token that has already been used (single-use)", async () => {
      const { email } = await createUser("once@example.com");
      const token = await requestResetAndCaptureToken(email);

      const first = await resetConfirm(jsonRequest(CONFIRM_URL, { token, password: "first-new-pass-1" }));
      expect(first.status).toBe(200);

      const second = await resetConfirm(jsonRequest(CONFIRM_URL, { token, password: "second-new-pass-2" }));
      expect(second.status).toBe(400);
    });

    it("rejects a token that does not exist", async () => {
      const res = await resetConfirm(jsonRequest(CONFIRM_URL, { token: "fake-token-value", password: "whatever-12" }));
      expect(res.status).toBe(400);
    });

    it("invalidates all active sessions for the user after confirm", async () => {
      const { email } = await createUser("sessions@example.com");

      const loginA = await login(jsonRequest(LOGIN_URL, { email, password: "hunter2hunter2" }));
      expect(loginA.status).toBe(200);
      resetCookies();
      const loginB = await login(jsonRequest(LOGIN_URL, { email, password: "hunter2hunter2" }));
      expect(loginB.status).toBe(200);
      resetCookies();

      const user = await prisma.user.findUnique({ where: { email } });
      const before = await prisma.session.count({ where: { userId: user!.id } });
      expect(before).toBeGreaterThanOrEqual(2);

      const token = await requestResetAndCaptureToken(email);
      const res = await resetConfirm(jsonRequest(CONFIRM_URL, { token, password: "rotated-pw-zzz" }));
      expect(res.status).toBe(200);

      const after = await prisma.session.count({ where: { userId: user!.id } });
      expect(after).toBe(0);

      const me = await getSession();
      const body = (await me.json()) as { user: unknown };
      expect(body.user).toBeNull();
    });

    it("invalidates all other unused reset tokens after a successful confirm", async () => {
      const { email } = await createUser("multi-token@example.com");
      const token1 = await requestResetAndCaptureToken(email);
      const token2 = await requestResetAndCaptureToken(email);
      expect(token1).not.toBe(token2);

      const ok = await resetConfirm(jsonRequest(CONFIRM_URL, { token: token2, password: "fresh-password-7" }));
      expect(ok.status).toBe(200);

      const stale = await resetConfirm(jsonRequest(CONFIRM_URL, { token: token1, password: "another-pw-8" }));
      expect(stale.status).toBe(400);
    });

    it("rejects a new password under 8 characters", async () => {
      const { email } = await createUser("weakpw@example.com");
      const token = await requestResetAndCaptureToken(email);

      const res = await resetConfirm(jsonRequest(CONFIRM_URL, { token, password: "short" }));
      expect(res.status).toBe(400);
    });
  });
});
