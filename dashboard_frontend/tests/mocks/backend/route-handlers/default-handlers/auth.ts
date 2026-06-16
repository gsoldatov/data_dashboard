import type { RouteHandler } from "../route-dispatcher";
import type { MockBackend } from "../../mock-backend";
import { loginRequestSchema } from "@/types/backend/requests/auth";

/**
 * Default handler for `POST /api/auth/login`.
 *
 * Accepts `{ username: "admin", password: "admin" }` and returns a
 * `User` object.  Sets a `session_token` cookie.  Rejects everything else with 401.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

/**
 * Default handler for `GET /api/auth/me`.
 *
 * Returns the user if a ``session_token`` cookie is present, 404 otherwise.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const meHandler: RouteHandler = async (req: Request, _backend: MockBackend) => {
    const cookie = req.headers.get("cookie") ?? "";
    if (cookie.includes("session_token=")) {
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
                    "x-is-authenticated": "true",
                },
            },
        );
    }
    return new Response(null, {
        status: 404,
        headers: { "x-is-authenticated": "false" },
    });
};

/**
 * Default handler for `POST /api/auth/logout`.
 *
 * Always returns 204 and clears the session cookie.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const logoutHandler: RouteHandler = async (_req: Request, _backend: MockBackend) => {
    return new Response(null, {
        status: 204,
        headers: {
            "Set-Cookie": "session_token=; HttpOnly; Path=/; Max-Age=0",
        },
    });
};
