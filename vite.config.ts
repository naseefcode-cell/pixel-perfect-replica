// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * The dev-only source tagger adds `data-tsd-source` to every JSX element.
 * react-three-fiber reads dashed props as nested object paths (data.tsd.source)
 * and throws on three.js elements, blanking the 3D scene. Strip the attribute
 * from the files that render inside <Canvas>.
 */
function stripSourceTagsFrom3D(): Plugin {
  return {
    name: "strip-source-tags-3d",
    enforce: "post",
    apply: "serve",
    transform(code, id) {
      if (!/src[\\/]components[\\/]game[\\/]/.test(id)) return null;
      if (!code.includes("data-tsd-source")) return null;
      return {
        code: code.replace(/\s*"data-tsd-source":\s*"[^"]*",?/g, "").replace(
          /\s*data-tsd-source="[^"]*"/g,
          "",
        ),
        map: null,
      };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [stripSourceTagsFrom3D()],
  },
});
