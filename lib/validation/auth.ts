import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(256),
});

export const tokenSchema = z.object({
  token: z.string().trim().min(1, "Please paste a token first.").max(8000),
  tool: z.enum(["neo", "orbit"]).default("neo"),
});
