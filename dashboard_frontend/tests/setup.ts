/**
 * Test-file level setup (imports are done once per test worker)
 **/

// Load additional matchers for `expect`
import "@testing-library/jest-dom/vitest";

// Initialize document.app.config from env vars (same as main.tsx).
// Must run before any store module imports — vitest env config
// provides VITE_BACKEND_URL to import.meta.env.
import "@/util/config";
