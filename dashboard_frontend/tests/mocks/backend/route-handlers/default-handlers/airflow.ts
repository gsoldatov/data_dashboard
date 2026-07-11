import { createMockDagListResponse } from "../../../mock-data/airflow";

import type { RouteHandler } from "../route-dispatcher";
import type { MockBackend } from "../../mock-backend";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listDagsHandler: RouteHandler = async (req, _backend: MockBackend) => {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

    const body = createMockDagListResponse(limit, offset, 25);

    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateDagHandler: RouteHandler = async (_req, _backend: MockBackend) => {
    return new Response(null, { status: 204 });
};
