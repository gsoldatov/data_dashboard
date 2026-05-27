import { z } from "zod";

/**
 * Zod schema for `POST /api/auth/login` request body.
 * Mirrors the backend Pydantic `LoginRequest` model.
 */
export const loginRequestSchema = z.object({
    username: z.string().min(1).max(255),
    password: z.string().min(1).max(255),
});

/** Inferred TypeScript type from `loginRequestSchema`. */
export type LoginRequest = z.infer<typeof loginRequestSchema>;
