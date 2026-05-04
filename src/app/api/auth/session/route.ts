import { getCurrentUser } from "@/lib/auth/session";
import { ok } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  return ok({ user });
}
