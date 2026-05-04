import { describe, expect, it } from "vitest";
import { POST as signup } from "@/app/api/auth/signup/route";
import { prisma } from "@/lib/db";
import { jsonRequest } from "./helpers/request";
import { getRawCookie } from "./helpers/cookies";

const URL = "http://localhost/api/auth/signup";

describe("POST /api/auth/signup", () => {
  it("creates a user, hashes the password, and sets a session cookie", async () => {
    const res = await signup(
      jsonRequest(URL, { email: "ada@example.com", password: "hunter2hunter2", name: "Ada" }),
    );
    expect(res.status).toBe(201);

    const body = (await res.json()) as { user: { id: string; email: string; name: string | null } };
    expect(body.user.email).toBe("ada@example.com");
    expect(body.user.name).toBe("Ada");
    expect(body.user.id).toBeTruthy();

    const stored = await prisma.user.findUnique({ where: { email: "ada@example.com" } });
    expect(stored).not.toBeNull();
    expect(stored?.passwordHash).not.toBe("hunter2hunter2");
    expect(stored?.passwordHash).toMatch(/^\$argon2id\$/);

    const cookie = getRawCookie("mb_session");
    expect(cookie).toBeTruthy();
    const session = await prisma.session.findUnique({ where: { id: cookie! } });
    expect(session?.userId).toBe(stored!.id);
  });

  it("normalizes email to lowercase and trims", async () => {
    const res = await signup(
      jsonRequest(URL, { email: "  Mixed@Example.com ", password: "hunter2hunter2" }),
    );
    expect(res.status).toBe(201);

    const stored = await prisma.user.findUnique({ where: { email: "mixed@example.com" } });
    expect(stored).not.toBeNull();
  });

  it("rejects an invalid email", async () => {
    const res = await signup(jsonRequest(URL, { email: "not-an-email", password: "hunter2hunter2" }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { fieldErrors: Record<string, string[]> };
    expect(body.fieldErrors.email).toBeDefined();
  });

  it("rejects a password under 8 characters", async () => {
    const res = await signup(jsonRequest(URL, { email: "a@b.com", password: "short" }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { fieldErrors: Record<string, string[]> };
    expect(body.fieldErrors.password).toBeDefined();
  });

  it("rejects a duplicate email", async () => {
    const first = await signup(jsonRequest(URL, { email: "dup@example.com", password: "hunter2hunter2" }));
    expect(first.status).toBe(201);

    const second = await signup(jsonRequest(URL, { email: "dup@example.com", password: "hunter2hunter2" }));
    expect(second.status).toBe(400);
    const body = (await second.json()) as { error: string };
    expect(body.error).toMatch(/already registered/i);
  });

  it("rejects an empty body", async () => {
    const req = new Request(URL, { method: "POST", headers: { "content-type": "application/json" } });
    const res = await signup(req);
    expect(res.status).toBe(400);
  });
});
