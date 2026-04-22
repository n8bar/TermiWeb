import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "src/site"),
  publicDir: path.resolve(__dirname, "assets"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist/site"),
    emptyOutDir: true,
  },
});
