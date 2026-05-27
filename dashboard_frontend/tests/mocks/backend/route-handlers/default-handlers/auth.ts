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
    const body: unknown = await req.json();
    const { username, password } = loginRequestSchema.parse(body);

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
