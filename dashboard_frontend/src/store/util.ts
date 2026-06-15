import { type ZodSchema } from "zod";

/**
 * Validate response data against a Zod schema.
 * Returns parsed data on success, or a CUSTOM_ERROR on failure.
 */
export function validateResponseData<T>(
    data: unknown,
    schema: ZodSchema<T>,
    url: string,
): { data: T } | { error: { status: "CUSTOM_ERROR"; error: string } } {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        console.error(`Response validation failed for ${url}:`, parsed.error);
        return {
            error: {
                status: "CUSTOM_ERROR",
                error: "Response data validation failed.",
            },
        };
    }
    return { data: parsed.data };
}

/**
 * Parse an RTK Query error object into structured fields.
 *
 * If RTK Query error was provided with a zod error (status === "ZOD_VALIDATION_ERROR"),
 * returns `validation` object, containing zod field (`fieldErrors` map) & schema (`formErrors` list) errors.
 *
 * Otherwise, returns response `status` and `message` provided by RTK Query .
 */
export function parseRTKQError(error: unknown): {
    status?: number;
    validation?: { formErrors: string[]; fieldErrors: Record<string, string[]> };
    message?: string;
} {
    // ── Zod validation errors ─────────────────────────
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status: unknown }).status === "ZOD_VALIDATION_ERROR" &&
        "data" in error
    ) {
        const data = (error as { data: unknown }).data;
        if (
            typeof data === "object" &&
            data !== null &&
            "fieldErrors" in data
        ) {
            return {
                validation: data as {
                    formErrors: string[];
                    fieldErrors: Record<string, string[]>;
                },
            };
        }
    }

    // ── status ──────────────────────────────────────────────────────────
    let status: number | undefined;
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
    ) {
        status = (error as { status: number }).status;
    }

    // ── message ─────────────────────────────────────────────────────────
    let message: string | undefined;
    if (
        typeof error === "object" &&
        error !== null &&
        "data" in error
    ) {
        const data = (error as { data: unknown }).data;
        if (
            typeof data === "object" &&
            data !== null &&
            "detail" in data &&
            typeof (data as { detail: unknown }).detail === "string"
        ) {
            message = (data as { detail: string }).detail;
        }
    }
    if (
        message === undefined &&
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        message = (error as { message: string }).message;
    }

    return { status, message };
}
