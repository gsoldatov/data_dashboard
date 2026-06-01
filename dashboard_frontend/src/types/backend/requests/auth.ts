import { z } from "zod";

/**
 * Zod schema for `POST /api/auth/login` request body.
 * Mirrors the backend Pydantic `LoginRequest` model.
 */
export const loginRequestSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required.")
        .max(255, "Username must be at most 255 characters."),
    password: z
        .string()
        .min(1, "Password is required.")
        .max(255, "Password must be at most 255 characters."),
});

/** Inferred TypeScript type from `loginRequestSchema`. */
export type LoginRequest = z.infer<typeof loginRequestSchema>;
