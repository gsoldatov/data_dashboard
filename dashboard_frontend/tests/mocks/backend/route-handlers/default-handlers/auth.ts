import type { RouteHandler } from "../route-dispatcher";
import type { MockBackend } from "../../mock-backend";
import { loginRequestSchema } from "@/types/backend/requests/auth";

/**
 * Default handler for `POST /api/auth/login`.
 *
 * Accepts `{ username: "admin", password: "admin" }` and returns a
 * `SessionResponse`.  Rejects everything else with 401.
 */
export const loginHandler: RouteHandler = async (req: Request, _backend: MockBackend) => {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ detail: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const result = loginRequestSchema.safeParse(body);
    if (!result.success) {
        const formatted = result.error.flatten();
        console.error(
            "[mock-backend] POST /api/auth/login validation error:",
            JSON.stringify(formatted, null, 2),
        );
        return new Response(JSON.stringify({ detail: formatted }), {
            status: 422,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { username, password } = result.data;

    if (username === "admin" && password === "admin") {
        return new Response(
            JSON.stringify({
                user_id: 1,
                expires_at: new Date(Date.now() + 86_400_000).toISOString(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    return new Response(JSON.stringify({ detail: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
    });
};
