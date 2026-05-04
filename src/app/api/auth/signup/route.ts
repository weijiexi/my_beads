import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { signupSchema } from "@/lib/auth/schemas";
import { badRequest, ok, parseJson, serverError } from "@/lib/http";

export async function POST(req: Request) {
  const parsed = await parseJson(req, signupSchema);
  if (!parsed.ok) return parsed.response;

  const { email, password, name } = parsed.data;
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? null },
      select: { id: true, email: true, name: true },
    });

    await createSession(user.id);
    return ok({ user }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return badRequest("This email is already registered.", {
        email: ["This email is already registered."],
      });
    }
    return serverError();
  }
}
