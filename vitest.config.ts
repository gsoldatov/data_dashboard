import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "dashboard_frontend", "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./dashboard_frontend/tests/setup.ts"],
    css: true,
    include: ["dashboard_frontend/tests/**/test_*.{ts,tsx}"],
  },
});
