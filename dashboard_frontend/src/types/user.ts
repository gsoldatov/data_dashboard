import { z } from "zod";

/**
 * Zod schema for the public user object returned by the backend.
 * Mirrors the backend Pydantic `UserResponse` model.
 */
export const user = z.object({
    id: z.number(),
    username: z.string(),
    role: z.enum(["admin", "viewer"]),
    created_at: z.string(),
});

/** Inferred TypeScript type from `user` schema. */
export type User = z.infer<typeof user>;
