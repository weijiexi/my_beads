import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    env: {
      DATABASE_URL: "file:./test.db",
      SESSION_COOKIE_NAME: "mb_session",
      SESSION_TTL_DAYS: "30",
      RESET_TOKEN_TTL_MINUTES: "60",
      APP_URL: "http://localhost:3000",
    },
  },
});
