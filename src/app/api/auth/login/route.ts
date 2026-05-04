import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/schemas";
import { ok, parseJson, unauthorized } from "@/lib/http";

export async function POST(req: Request) {
  const parsed = await parseJson(req, loginSchema);
  if (!parsed.ok) return parsed.response;

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (!user) {
    return unauthorized("Email or password is incorrect.");
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return unauthorized("Email or password is incorrect.");
  }

  await createSession(user.id);

  return ok({
    user: { id: user.id, email: user.email, name: user.name },
  });
}
