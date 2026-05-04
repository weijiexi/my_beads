import { beforeEach, describe, expect, it } from "vitest";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as login } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/db";
import { jsonRequest } from "./helpers/request";
import { getRawCookie, resetCookies } from "./helpers/cookies";

const SIGNUP_URL = "http://localhost/api/auth/signup";
const LOGIN_URL = "http://localhost/api/auth/login";

async function seedUser() {
  const res = await signup(
    jsonRequest(SIGNUP_URL, { email: "user@example.com", password: "hunter2hunter2", name: "User" }),
  );
  expect(res.status).toBe(201);
  resetCookies();
}

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await seedUser();
  });

  it("logs in with the correct credentials and sets a session cookie", async () => {
    const res = await login(jsonRequest(LOGIN_URL, { email: "user@example.com", password: "hunter2hunter2" }));
    expect(res.status).toBe(200);

    const body = (await res.json()) as { user: { email: string; id: string } };
    expect(body.user.email).toBe("user@example.com");

    const cookie = getRawCookie("mb_session");
    expect(cookie).toBeTruthy();
    const session = await prisma.session.findUnique({ where: { id: cookie! } });
    expect(session?.userId).toBe(body.user.id);
  });

  it("rejects a wrong password with 401", async () => {
    const res = await login(jsonRequest(LOGIN_URL, { email: "user@example.com", password: "wrong-password" }));
    expect(res.status).toBe(401);
    expect(getRawCookie("mb_session")).toBeUndefined();
  });

  it("rejects an unknown email with 401 (same generic message)", async () => {
    const res = await login(jsonRequest(LOGIN_URL, { email: "ghost@example.com", password: "hunter2hunter2" }));
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/incorrect/i);
  });

  it("normalizes email casing", async () => {
    const res = await login(jsonRequest(LOGIN_URL, { email: "USER@example.com", password: "hunter2hunter2" }));
    expect(res.status).toBe(200);
  });
});
