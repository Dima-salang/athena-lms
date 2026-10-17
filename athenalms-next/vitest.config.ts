import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["node_modules/**", "e2e/**", "**/*.spec.ts"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
      include: [
        "src/lib/**/*.ts",
      ],
      exclude: [
        "src/lib/db.ts", // Prisma singleton – integration tested via E2E
        "src/lib/auth.ts", // Better Auth config
        "src/lib/auth-client.ts", // Better Auth client
        "node_modules/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
