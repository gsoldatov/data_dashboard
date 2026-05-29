import type { RouteHandler } from "../route-dispatcher";
import type { MockBackend } from "../../mock-backend";

/**
 * Default handler for `GET /api/visualization-settings/{slug}/is-published`.
 *
 * Returns ``"true"`` as plain text (the frontend uses ``responseHandler: "text"``).
 */
export const isPublishedHandler: RouteHandler = async (_req: Request, _backend: MockBackend) => {
    return new Response("true", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
};

/**
 * Default handler for `GET /api/visualization-data/{slug}`.
 *
 * Returns an empty JSON array.
 */
export const visualizationDataHandler: RouteHandler = async (_req: Request, _backend: MockBackend) => {
    return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
