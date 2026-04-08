import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
) as {
  version?: string;
};

export default defineConfig({
  root: path.resolve(__dirname, "src/client"),
  define: {
    "globalThis.__TERMIWEB_VERSION__": JSON.stringify(packageJson.version ?? "0.1.0"),
  },
  build: {
    outDir: path.resolve(__dirname, "dist/client"),
    emptyOutDir: true,
  },
  test: {
    environment: "node",
  },
});
