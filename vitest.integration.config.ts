import { defineConfig } from "vite";

export default defineConfig({
  test: {
    name: "integration",
    include: ["**/integration/**/*.test.ts"],
    setupFiles: [
      "./src/usecases/changes/trigger/functions/utils/setup_sync_db.ts",
    ],
  },
});
