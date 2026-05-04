import { describe, expect, it } from "vitest";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as getSession } from "@/app/api/auth/session/route";
import { prisma } from "@/lib/db";
import { jsonRequest } from "./helpers/request";
import { getRawCookie, resetCookies, setRawCookie } from "./helpers/cookies";

const SIGNUP_URL = "http://localhost/api/auth/signup";

describe("GET /api/auth/session + POST /api/auth/logout", () => {
  it("returns the current user when a valid session cookie is set", async () => {
    await signup(jsonRequest(SIGNUP_URL, { email: "session@example.com", password: "hunter2hunter2" }));
    const res = await getSession();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: { email: string } | null };
    expect(body.user?.email).toBe("session@example.com");
  });

  it("returns null when no cookie is present", async () => {
    const res = await getSession();
    const body = (await res.json()) as { user: unknown };
    expect(body.user).toBeNull();
  });

  it("returns null when the session id is unknown", async () => {
    setRawCookie("mb_session", "no-such-session-id");
    const res = await getSession();
    const body = (await res.json()) as { user: unknown };
    expect(body.user).toBeNull();
  });

  it("logout deletes the session row and clears the cookie", async () => {
    await signup(jsonRequest(SIGNUP_URL, { email: "logout@example.com", password: "hunter2hunter2" }));
    const sid = getRawCookie("mb_session");
    expect(sid).toBeTruthy();

    const res = await logout();
    expect(res.status).toBe(200);

    expect(getRawCookie("mb_session")).toBeUndefined();
    const session = await prisma.session.findUnique({ where: { id: sid! } });
    expect(session).toBeNull();

    const after = await getSession();
    const body = (await after.json()) as { user: unknown };
    expect(body.user).toBeNull();
  });

  it("getCurrentUser drops an expired session", async () => {
    await signup(jsonRequest(SIGNUP_URL, { email: "expired@example.com", password: "hunter2hunter2" }));
    const sid = getRawCookie("mb_session")!;
    await prisma.session.update({
      where: { id: sid },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });

    const res = await getSession();
    const body = (await res.json()) as { user: unknown };
    expect(body.user).toBeNull();

    const stillThere = await prisma.session.findUnique({ where: { id: sid } });
    expect(stillThere).toBeNull();
  });

  it("logout is a no-op when no session cookie is present", async () => {
    resetCookies();
    const res = await logout();
    expect(res.status).toBe(200);
  });
});
