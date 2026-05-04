import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["argon2", "@prisma/client"],
};

export default config;
