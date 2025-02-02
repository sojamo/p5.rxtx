import { defineConfig } from "vite";
import { terser } from "rollup-plugin-terser";
import vitePluginVersion from './vite.plugin.version';

export default defineConfig({
  plugins: [
    vitePluginVersion()
  ],
  build: {
    outDir: "lib", // Output directory
    sourcemap: true, // Enable sourcemaps
    minify: false, // Prevent default minification for human-readable files
    lib: {
      entry: "./src/main.js", // Entry file for the library
      name: "rxtx", // Global variable name for IIFE builds
      formats: ["es", "iife"], // Generate both ES module and IIFE formats
      fileName: (format) => {
        if (format === "es") return "p5.rxtx.es.js"; // Human-readable ES module
        if (format === "iife") return "p5.rxtx.js"; // Human-readable IIFE
      },
    },
    rollupOptions: {
      output: [
        {
          format: "es", // Human-readable ES module
          entryFileNames: "p5.rxtx.es.js",
          sourcemap: true,
          plugins: [], // No minification or comment removal
        },
        {
          format: "iife", // Human-readable IIFE
          name: "rxtx",
          entryFileNames: "p5.rxtx.js",
          sourcemap: true,
          plugins: [], // No minification or comment removal
        },
        {
          format: "es", // Minified ES module
          entryFileNames: "p5.rxtx.es.min.js",
          sourcemap: true,
          plugins: [
            terser({
              format: { comments: (node, comment) => {} },
            }),
          ],
        },
        {
          format: "iife", // Minified IIFE
          name: "rxtx",
          entryFileNames: "p5.rxtx.min.js",
          sourcemap: true,
          plugins: [
            terser({
              format: { comments: (node, comment) => {} },
            }),
          ],
        },
      ],
    },
  },
});
