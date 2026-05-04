import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("produces an argon2id PHC string", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it("verifies the correct password", async () => {
    const hash = await hashPassword("hunter2hunter2");
    await expect(verifyPassword(hash, "hunter2hunter2")).resolves.toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("hunter2hunter2");
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });

  it("salts: same password yields different hashes", async () => {
    const a = await hashPassword("same-password-here");
    const b = await hashPassword("same-password-here");
    expect(a).not.toBe(b);
    await expect(verifyPassword(a, "same-password-here")).resolves.toBe(true);
    await expect(verifyPassword(b, "same-password-here")).resolves.toBe(true);
  });
});
