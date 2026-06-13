import { z } from "zod";

/**
 * Zod schema for the user profile update form fields.
 *
 * Validates fields before transformation to the backend request format.
 */
export const userUpdateFormSchema = z
    .object({
        username: z
            .string()
            .min(1, "Username is required.")
            .max(255, "Username must be at most 255 characters."),
        newPassword: z
            .string()
            .max(255, "Password must be at most 255 characters."),
        newPasswordRepeat: z
            .string()
            .max(255, "Password must be at most 255 characters."),
        currentPassword: z
            .string()
            .min(1, "Current password is required.")
            .max(255, "Current password must be at most 255 characters."),
    })
    .refine((data) => data.newPassword === data.newPasswordRepeat, {
        message: "Passwords do not match.",
        path: ["newPasswordRepeat"],
    });

/** Inferred TypeScript type from `userUpdateFormSchema`. */
export type UserUpdateForm = z.infer<typeof userUpdateFormSchema>;
