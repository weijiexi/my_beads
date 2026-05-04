import { prisma } from "@/lib/db";

export async function resetDb(): Promise<void> {
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
}
