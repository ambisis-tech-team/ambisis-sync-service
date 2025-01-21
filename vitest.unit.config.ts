import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  test: {
    name: "unit",
    include: ["**/unit/**/*.test.ts"],
  },
});
