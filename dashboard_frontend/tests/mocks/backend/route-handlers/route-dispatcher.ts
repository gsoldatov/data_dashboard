import { getDocumentApp } from "@/util/document-app";

import type { MockBackend } from "../mock-backend";
import { loginHandler } from "./default-handlers/auth";
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
        const path = this.stripBackendPrefix(req.url);
        const method = req.method.toUpperCase();

        const handler =
            this.overrides[path]?.[method]
            ?? RouteDispatcher.defaultHandlers[path]?.[method]
            ?? this.matchPatternHandler(path, method);

        if (!handler) {
            const response = new Response(
                JSON.stringify({ detail: `No mock handler for ${req.method} ${path}` }),
                { status: 404, headers: { "Content-Type": "application/json" } },
            );
            this.postProcessResponse(response);
            return response;
        }

        try {
            const response = await handler(req, backend);
            this.postProcessResponse(response);
            return response;
        } catch (error) {
            // Throw outside the fetch promise chain so vitest fails the test
            // instead of RTK Query silently catching the rejection.
            console.error("[mock-backend] Handler error:", error);
            setTimeout(() => {
                throw error;
            }, 0);
            return Promise.reject(error);
        }
    }

    /**
     * Try to find a handler whose path pattern (with ``{param}``
     * placeholders) matches the request path.
     */
    private matchPatternHandler(
        path: string,
        method: string,
    ): RouteHandler | undefined {
        for (const [pattern, methods] of Object.entries(
            RouteDispatcher.defaultHandlers,
        )) {
            if (!pattern.includes("{")) continue;
            const regex = this.patternToRegex(pattern);
            if (regex.test(path)) {
                return methods[method];
            }
        }
        return undefined;
    }

    /** Convert a path pattern like ``/api/users/{id}`` to a RegExp. */
    private patternToRegex(pattern: string): RegExp {
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
        const regexStr = escaped.replace(/\\\{[^}]+\}/g, "[^/]+");
        return new RegExp(`^${regexStr}$`);
    }

    /**
     * Ensure the ``x-is-authenticated`` header is present on the response.
     *
     * If the handler already set it the flag is a no-op.
     */
    postProcessResponse(response: Response): void {
        if (!response.headers.has("x-is-authenticated")) {
            response.headers.set("x-is-authenticated", String(this.xIsAuthenticated));
        }
    }

    /** Remove `document.app.config.backendUrl` prefix from a request URL. */
    private stripBackendPrefix(url: string): string {
        const { backendUrl } = getDocumentApp().config;
        if (url.startsWith(backendUrl)) {
            return url.slice(backendUrl.length);
        }
        return url;
    }
}
