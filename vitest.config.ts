import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Couverture sur les utilitaires purs testables (sans dépendances serveur)
      include: ["src/lib/format.ts", "src/lib/currency.ts"],
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
