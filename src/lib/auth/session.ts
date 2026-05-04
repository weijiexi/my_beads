import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { generateSessionId, sessionExpiry } from "@/lib/auth/tokens";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "mb_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function createSession(userId: string): Promise<string> {
  const id = generateSessionId();
  const expiresAt = sessionExpiry();

  await prisma.session.create({
    data: { id, userId, expiresAt },
  });

  const jar = await cookies();
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return id;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE_NAME)?.value;
  if (!id) return null;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id } }).catch(() => undefined);
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const id = jar.get(COOKIE_NAME)?.value;

  if (id) {
    await prisma.session.delete({ where: { id } }).catch(() => undefined);
  }

  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function destroyAllSessionsFor(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
