import type { RouteDispatcher } from "./route-dispatcher";

/**
 * Override a route handler to simulate a network error.
 *
 * The dispatched handler returns `Response.error()` which causes `fetch`
 * to reject, mimicking a connection failure.
 */
export function addNetworkErrorOverride(
    dispatcher: RouteDispatcher,
    url: string,
    method: string,
): void {
    dispatcher.addHandlerOverride(url, method, async () => Response.error());
}

/**
 * Override a route handler to return a 500 response.
 *
 * When `body` is provided it is JSON-stringified and sent with
 * `Content-Type: application/json`.
 */
export function add500Override(
    dispatcher: RouteDispatcher,
    url: string,
    method: string,
    body?: unknown,
): void {
    const headers: HeadersInit = body != null
        ? { "Content-Type": "application/json" }
        : {};

    dispatcher.addHandlerOverride(url, method, async () =>
        new Response(
            body != null ? JSON.stringify(body) : null,
            { status: 500, headers },
        ),
    );
}
