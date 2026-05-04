import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

export default async function globalSetup() {
  const dbFile = path.resolve(__dirname, "../prisma/test.db");
  const journal = `${dbFile}-journal`;

  if (existsSync(dbFile)) unlinkSync(dbFile);
  if (existsSync(journal)) unlinkSync(journal);

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });
}
