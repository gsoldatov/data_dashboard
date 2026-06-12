import type { RouteHandler } from "../route-dispatcher";
import type { MockBackend } from "../../mock-backend";

/**
 * Default handler for `GET /api/visualization-settings/`.
 *
 * Parses ``slugs`` from the query string and returns
 * ``{ [slug]: { is_published: true } }`` for each slug.
 */
export const batchVisualizationSettingsHandler: RouteHandler = async (req: Request, _backend: MockBackend) => {
    const url = new URL(req.url);
    const slugs = url.searchParams.get("slugs")?.split(",").filter(Boolean) ?? [];

    const result: Record<string, { is_published: boolean }> = {};
    for (const slug of slugs) {
        result[slug] = { is_published: true };
    }

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
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
