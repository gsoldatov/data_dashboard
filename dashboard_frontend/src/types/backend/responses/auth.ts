import { z } from "zod";

/**
 * Zod schema for the public user object returned by the backend.
 * Mirrors the backend Pydantic `UserResponse` model.
 */
export const userResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    role: z.enum(["admin", "viewer"]),
    created_at: z.string(),
});

/** Inferred TypeScript type from `userResponseSchema`. */
export type UserResponse = z.infer<typeof userResponseSchema>;
