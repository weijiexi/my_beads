import { describe, expect, it } from "vitest";
import {
  generateResetToken,
  generateSessionId,
  hashResetToken,
  resetTokenExpiry,
  sessionExpiry,
} from "@/lib/auth/tokens";

describe("tokens", () => {
  it("generateSessionId is url-safe and unique", () => {
    const a = generateSessionId();
    const b = generateSessionId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });

  it("generateResetToken returns matching raw + hash", () => {
    const { raw, hash } = generateResetToken();
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashResetToken(raw)).toBe(hash);
  });

  it("hashResetToken is deterministic", () => {
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"));
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abd"));
  });

  it("resetTokenExpiry is ~60 minutes in the future", () => {
    const now = Date.now();
    const exp = resetTokenExpiry().getTime();
    expect(exp - now).toBeGreaterThanOrEqual(59 * 60_000);
    expect(exp - now).toBeLessThanOrEqual(61 * 60_000);
  });

  it("sessionExpiry is ~30 days in the future", () => {
    const now = Date.now();
    const exp = sessionExpiry().getTime();
    const days = (exp - now) / (24 * 60 * 60_000);
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThan(30.1);
  });
});
