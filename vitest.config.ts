import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Couverture sur les utilitaires purs testables (sans dépendances serveur)
      include: [
        "src/lib/format.ts",
        "src/lib/currency.ts",
        "src/lib/parsers/banque-populaire.ts",
        "src/lib/parsers/mcb-csv.ts",
        "src/lib/parsers/utils.ts",
      ],
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
