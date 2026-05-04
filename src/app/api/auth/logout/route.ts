import { destroyCurrentSession } from "@/lib/auth/session";
import { ok } from "@/lib/http";

export async function POST() {
  await destroyCurrentSession();
  return ok({ ok: true });
}
