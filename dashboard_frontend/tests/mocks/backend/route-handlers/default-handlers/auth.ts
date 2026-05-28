import type { RouteHandler } from "../route-dispatcher";
import type { MockBackend } from "../../mock-backend";
import { loginRequestSchema } from "@/types/backend/requests/auth";

/**
 * Default handler for `POST /api/auth/login`.
 *
 * Accepts `{ username: "admin", password: "admin" }` and returns a
 * `User` object.  Sets a `session_token` cookie.  Rejects everything else with 401.
 */
export const loginHandler: RouteHandler = async (req: Request, _backend: MockBackend) => {
    const body: unknown = await req.json();
    const { username, password } = loginRequestSchema.parse(body);

    if (username === "admin" && password === "admin") {
        return new Response(
            JSON.stringify({
                id: 1,
                username: "admin",
                role: "admin",
                created_at: "2025-01-01T00:00:00Z",
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Set-Cookie": "session_token=mock-token; HttpOnly; Path=/",
                },
            },
        );
    }

    return new Response(JSON.stringify({ detail: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
    });
};
