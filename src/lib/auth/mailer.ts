type ResetEmail = {
  to: string;
  token: string;
};

export async function sendPasswordResetEmail({ to, token }: ResetEmail): Promise<void> {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/reset?token=${encodeURIComponent(token)}`;

  console.log("[mailer:stub] password reset");
  console.log(`  to:   ${to}`);
  console.log(`  link: ${link}`);
  console.log(`  ttl:  ${process.env.RESET_TOKEN_TTL_MINUTES ?? 60} min`);
}
