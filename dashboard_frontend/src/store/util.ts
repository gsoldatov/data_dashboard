/**
 * Extract a human-readable error message from an RTK Query error object.
 *
 * RTK Query mutations return `FetchBaseQueryError | SerializedError | undefined`.
 * Both have a `data` property that may contain a `detail` string from the backend.
 */
export function rtkqErrorMessage(error: unknown, fallback: string): string {
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
            return (data as { detail: string }).detail;
        }
    }
    return fallback;
}

/**
 * Check whether an RTK Query error has a specific HTTP status code.
 */
export function rtkqErrorHasStatus(error: unknown, status: number): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status: unknown }).status === status
    );
}
