import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/auth/mailer";
import { generateResetToken, resetTokenExpiry } from "@/lib/auth/tokens";
import { resetRequestSchema } from "@/lib/auth/schemas";
import { ok, parseJson } from "@/lib/http";

export async function POST(req: Request) {
  const parsed = await parseJson(req, resetRequestSchema);
  if (!parsed.ok) return parsed.response;

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (user) {
    const { raw, hash } = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: resetTokenExpiry(),
      },
    });
    await sendPasswordResetEmail({ to: user.email, token: raw });
  }

  return ok({ ok: true });
}
