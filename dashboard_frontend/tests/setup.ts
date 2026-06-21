/**
 * Test-file level setup (imports are done once per test worker)
 **/

// Load additional matchers for `expect`
import "@testing-library/jest-dom/vitest";

// Initialize document.app.config from env vars (same as main.tsx).
// Must run before any store module imports — vitest env config
// provides VITE_BACKEND_URL to import.meta.env.
import "@/util/config";

// Workaround to fix 'Expected signal ("AbortSignal {}") to be an instance of AbortSignal.' error,
// occuring in tests with Node 24 + vite + jsdom combination
// https://github.com/reduxjs/redux-toolkit/issues/4966
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';

Object.defineProperty(global, 'fetch', {
  // MSW will overwrite this to intercept requests
  writable: true,
  value: fetchPolyfill,
});

Object.defineProperty(global, 'Request', {
  writable: false,
  value: RequestPolyfill,
});


// Globally replace `fetch` with a mock so RTK Query calls don't hit
// the network.  Individual tests activate routing via `MockBackend.setup()`.
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// jsdom does not implement ResizeObserver (required by recharts).
// The mock fires the size callback synchronously on `observe` so charts
// render their content immediately in tests.
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn().mockImplementation(() => {
        callback([{ contentRect: { width: 800, height: 400 } }]);
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
