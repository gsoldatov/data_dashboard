import { getDocumentApp } from "@/util/document-app";

import type { MockBackend } from "../mock-backend";
import { loginHandler, meHandler, logoutHandler } from "./default-handlers/auth";
import {
    isPublishedHandler,
    visualizationDataHandler,
} from "./default-handlers/visualizations";


/** Handler for a single API route. */
export type RouteHandler = (
    req: Request,
    backend: MockBackend,
) => Promise<Response>;

/** `{ [URL]: { [method]: RouteHandler } }` */
type HandlerMap = Record<string, Record<string, RouteHandler>>;

/**
 * Matches incoming `fetch` requests to corresponding route handlers.
 *
 * Default route handlers are stored in `defaultHandlers` map.
 *
 * Custom overrides for route handlers can be changed via `addHandlerOverride` & `removeHandlerOverride`.
 *
 * Both defaults and overrides support ``{param}`` placeholders
 * (e.g. ``/api/visualization-data/{slug}``).
 *
 * The ``xIsAuthenticated`` flag (default ``true``) controls the
 * ``x-is-authenticated`` header on every response.  If a handler
 * already sets the header the flag is ignored for that response.
 */
export class RouteDispatcher {
    /** Whether responses should carry ``x-is-authenticated: true``. */
    xIsAuthenticated: boolean = true;

    /** Module-scope default handlers. */
    private static readonly defaultHandlers: HandlerMap = {
        "/api/auth/login": { POST: loginHandler },
        "/api/auth/me": { GET: meHandler },
        "/api/auth/logout": { POST: logoutHandler },
        "/api/visualization-data/{slug}": { GET: visualizationDataHandler },
        "/api/visualization-settings/{slug}/is-published": { GET: isPublishedHandler },
    };

    /** Per-instance overrides (checked before defaults). */
    private readonly overrides: HandlerMap = {};

    /**
     * Register a handler override for a single URL + method.
     *
     * `url` should be the backend-relative path (e.g. `"/api/auth/login"`).
     */
    addHandlerOverride(url: string, method: string, handler: RouteHandler): void {
        this.overrides[url] ??= {};
        this.overrides[url][method.toUpperCase()] = handler;
    }

    /** Remove a previously-registered override. */
    removeHandlerOverride(url: string, method: string): void {
        const entry = this.overrides[url];
        if (entry) {
            delete entry[method.toUpperCase()];
            if (Object.keys(entry).length === 0) {
                delete this.overrides[url];
            }
        }
    }

    /**
     * Dispatch a fetch `Request` to the appropriate handler.
     *
     * Strips the backend base URL before matching so keys are
     * always backend-relative paths.  Supports ``{param}`` placeholders
     * in default handler paths (e.g. ``/api/users/{id}``).
     */
    async handleRequest(req: Request, backend: MockBackend): Promise<Response> {
        const path = stripBackendPrefix(req.url);
        const method = req.method.toUpperCase();

        const handler = findHandlerInMap(this.overrides, path, method)
            ?? findHandlerInMap(RouteDispatcher.defaultHandlers, path, method);

        if (!handler) {
            const error = `[mock-backend] Missing route handler for ${req.method} ${path}`;
            // Throw outside of the test case (test case may still complete, based on its logic,
            // but the error will be output by vitest and the test process will have a non-zero exit code)
            setTimeout(() => { throw error; }, 0);
            return Promise.reject(error);
        }

        // Process request
        try {
            const response = await handler(req, backend);
            this.postProcessResponse(response);
            return response;
        } catch (error) {
            // Throw outside of the test case (test case may still complete, based on its logic,
            // but the error will be output by vitest and the test process will have a non-zero exit code)
            setTimeout(() => { throw error; }, 0);
            return Promise.reject(error);
        }
    }

    /**
     * Ensure the ``x-is-authenticated`` header is present on the response.
     *
     * If the handler already set it the flag is a no-op.
     */
    postProcessResponse(response: Response): void {
        // If a network error is simulated via Response.error(),
        // we can't change its headers
        if (response.type === "error") return;

        if (!response.headers.has("x-is-authenticated")) {
            response.headers.set("x-is-authenticated", String(this.xIsAuthenticated));
        }
    }
}


/** Remove `document.app.config.backendUrl` prefix from a request URL. */
const stripBackendPrefix = (url: string): string => {
    const { backendUrl } = getDocumentApp().config;
    if (url.startsWith(backendUrl)) {
        return url.slice(backendUrl.length);
    }
    return url;
};


/**
 * Try to find a handler in `map` for the given path and method.
 *
 * Checks exact match first, then falls back to parametrized-route
 * pattern matching (``{param}`` placeholders).
 */
const findHandlerInMap = (
    map: HandlerMap,
    path: string,
    method: string,
): RouteHandler | undefined => {
    const exact = map[path]?.[method];
    if (exact) return exact;

    for (const [pattern, methods] of Object.entries(map)) {
        if (!pattern.includes("{")) continue;
        const regex = patternToRegex(pattern);
        if (regex.test(path)) {
            return methods[method];
        }
    }
    return undefined;
};


/** Convert a path pattern like ``/api/users/{id}`` to a RegExp. */
const patternToRegex = (pattern: string): RegExp => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const regexStr = escaped.replace(/\\\{[^}]+\}/g, "[^/]+");
    return new RegExp(`^${regexStr}$`);
};
