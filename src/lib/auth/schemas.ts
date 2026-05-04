import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(256, "Password is too long.");

export const signupSchema = z.object({
  email,
  password,
  name: z.string().trim().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required.").max(256),
});

export const resetRequestSchema = z.object({
  email,
});

export const resetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type ResetConfirmInput = z.infer<typeof resetConfirmSchema>;
