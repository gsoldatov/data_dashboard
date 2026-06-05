import type { RootState } from "@/store";

/** Preloaded state with no authenticated user. */
export function preloadedNullUserState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: null,
                },
            },
        },
    } as unknown as Partial<RootState>;
}


/** Preloaded state with a viewer (non-admin) user. */
export function preloadedViewerState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: {
                        id: 1,
                        username: "viewer",
                        role: "viewer" as const,
                        created_at: "2025-01-01T00:00:00Z",
                    },
                },
            },
        },
    } as unknown as Partial<RootState>;
}


/** Preloaded state with an admin user. */
export function preloadedAdminState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: {
                        id: 1,
                        username: "admin",
                        role: "admin" as const,
                        created_at: "2025-01-01T00:00:00Z",
                    },
                },
            },
        },
    } as unknown as Partial<RootState>;
}

/** Preloaded state with a pending UI redirect. */
export const redirectState: Partial<RootState> = {
    ui: { redirectOnRender: "/login" },
};
