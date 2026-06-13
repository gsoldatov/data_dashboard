import type { RouteHandler } from "../route-dispatcher";

const knownPasswords: Record<string, string> = {
    "1": "pass",
    "2": "pass",
};

/**
 * Default handler for `PATCH /api/users/{id}`.
 *
 * Validates ``current_user_password`` against known passwords and returns
 * an updated ``User`` object.  Tests override this handler for error cases.
 */
export const updateUserHandler: RouteHandler = async (req: Request, _backend) => {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop() ?? "";

    const body: unknown = await req.json();
    const { username, current_user_password } = body as {
        username?: string;
        current_user_password: string;
    };

    const expectedPassword = knownPasswords[userId];
    if (expectedPassword === undefined || current_user_password !== expectedPassword) {
        return new Response(
            JSON.stringify({ detail: "Incorrect current password" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    return new Response(
        JSON.stringify({
            id: Number(userId),
            username: username ?? "viewer",
            role: "viewer",
            created_at: "2025-01-01T00:00:00Z",
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        },
    );
};
