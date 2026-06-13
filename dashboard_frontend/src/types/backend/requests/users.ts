import { z } from "zod";

/**
 * Zod schema for the backend request body of `PATCH /api/users/{id}`.
 *
 * Mirrors the backend Pydantic `UserUpdate` model.
 */
export const userUpdateRequestSchema = z.object({
    username: z
        .string()
        .min(1)
        .max(255)
        .optional(),
    password: z
        .string()
        .min(1)
        .max(255)
        .optional(),
    current_user_password: z
        .string()
        .min(1)
        .max(255),
});

/** Inferred TypeScript type from `userUpdateRequestSchema`. */
export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>;
