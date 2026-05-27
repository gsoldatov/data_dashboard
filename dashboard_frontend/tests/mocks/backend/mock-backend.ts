import { RouteDispatcher } from "./route-handlers/route-dispatcher";

/**
 * In-memory mock of the dashboard backend.
 * 
 * Uses `vitest-fetch-mock` for mocking fetch.
 * 
 * Adds a mock response to `fetchMock`, which dispatches request to a specific handler
 * (default or an override added during a test), based on request's URL & method.
 */
export class MockBackend {
    readonly dispatcher: RouteDispatcher;

    constructor() {
        this.dispatcher = new RouteDispatcher();
    }

    /** Activate this mock backend — routes all `fetch` calls through the dispatcher. */
    setup(): void {
        fetchMock.mockResponse((req) => this.dispatcher.handleRequest(req, this));
    }
}
