import { z } from "zod";

export const toolSchema = z.enum(["neo", "orbit"]).default("neo");
