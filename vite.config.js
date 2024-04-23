import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    target: "es5",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        QMG: resolve(__dirname, "QMG/index.html"),
        QMGHP: resolve(__dirname, "QMGHeaderParser/index.html"),
        LCEE: resolve(__dirname, "SGExtractor/index.html"),
        403: resolve(__dirname, "403/index.html"),
        404: resolve(__dirname, "404/index.html"),
      }
    }
  },
  server: {
    port: 5500,
    strictPort: true
  },
  preview: {
    port: 5500,
    strictPort: true
  }
});
