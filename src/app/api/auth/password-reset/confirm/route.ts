import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { destroyAllSessionsFor } from "@/lib/auth/session";
import { hashResetToken } from "@/lib/auth/tokens";
import { resetConfirmSchema } from "@/lib/auth/schemas";
import { badRequest, ok, parseJson } from "@/lib/http";

export async function POST(req: Request) {
  const parsed = await parseJson(req, resetConfirmSchema);
  if (!parsed.ok) return parsed.response;

  const { token, password } = parsed.data;
  const tokenHash = hashResetToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt !== null || record.expiresAt.getTime() <= Date.now()) {
    return badRequest("This reset link is invalid or has expired.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
    }),
  ]);

  await destroyAllSessionsFor(record.userId);

  return ok({ ok: true });
}
