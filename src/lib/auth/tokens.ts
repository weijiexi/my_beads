import { createHash, randomBytes } from "node:crypto";

export function generateSessionId(): string {
  return randomBytes(32).toString("base64url");
}

export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashResetToken(raw) };
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function resetTokenExpiry(): Date {
  const minutes = Number(process.env.RESET_TOKEN_TTL_MINUTES ?? 60);
  return new Date(Date.now() + minutes * 60_000);
}

export function sessionExpiry(): Date {
  const days = Number(process.env.SESSION_TTL_DAYS ?? 30);
  return new Date(Date.now() + days * 24 * 60 * 60_000);
}
