import { getDocumentApp } from "@/util/document-app";

import type { MockBackend } from "../mock-backend";
import { loginHandler } from "./default-handlers/auth";


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
 */
export class RouteDispatcher {
    /** Module-scope default handlers. */
    private static readonly defaultHandlers: HandlerMap = {
        "/api/auth/login": { POST: loginHandler },
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
     * always backend-relative paths.
     */
    async handleRequest(req: Request, backend: MockBackend): Promise<Response> {
        const path = this.stripBackendPrefix(req.url);

        // Overrides first
        const override = this.overrides[path]?.[req.method.toUpperCase()];
        if (override) {
            return await override(req, backend);
        }

        // Then defaults
        const defaultHandler =
            RouteDispatcher.defaultHandlers[path]?.[req.method.toUpperCase()];
        if (defaultHandler) {
            return await defaultHandler(req, backend);
        }

        return new Response(
            JSON.stringify({ detail: `No mock handler for ${req.method} ${path}` }),
            { status: 404, headers: { "Content-Type": "application/json" } },
        );
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
