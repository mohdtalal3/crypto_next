import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(256),
});

export const tokenSchema = z.object({
  token: z.string().trim().min(1, "Please paste a token first.").max(8000),
  tool: z.enum(["neo", "orbit", "backoffice"]).default("neo"),
});

export const toolLoginSchema = z.object({
  tool: z.enum(["orbit", "backoffice"]),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(1, "Enter your password.").max(256),
});

export const toolOtpSchema = z.object({
  tool: z.enum(["orbit", "backoffice"]),
  otp: z.string().trim().min(4, "Enter the code from your authenticator app.").max(10),
});
