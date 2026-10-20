import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // Backend functions import npm packages with Deno's "npm:" specifier; tests resolve them from node_modules.
      { find: /^npm:(pdf-lib)@[\d.]+$/, replacement: "$1" },
    ],
  },
});
