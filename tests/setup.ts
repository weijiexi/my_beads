import { afterAll, afterEach, beforeEach, vi } from "vitest";

vi.mock("next/headers", async () => {
  const { cookieStore } = await import("./helpers/cookies");
  return {
    cookies: async () => ({
      get(name: string) {
        const value = cookieStore.get(name);
        return value !== undefined ? { name, value } : undefined;
      },
      set(name: string, value: string, _opts?: unknown) {
        if (value === "") cookieStore.delete(name);
        else cookieStore.set(name, value);
      },
      delete(name: string) {
        cookieStore.delete(name);
      },
    }),
  };
});

beforeEach(async () => {
  const { resetCookies } = await import("./helpers/cookies");
  const { resetDb } = await import("./helpers/db");
  resetCookies();
  await resetDb();
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  const { prisma } = await import("@/lib/db");
  await prisma.$disconnect();
});
