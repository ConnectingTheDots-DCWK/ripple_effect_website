import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `docs-site/` and `legal/` are the other applications in this repository
    // and each checks itself with `astro check`. Without this, a bare
    // `eslint` walks into their build output — `dist/_astro`,
    // `dist/pagefind`, `.astro` — and reports a thousand problems in minified
    // vendor bundles, which buries anything real. `tsconfig.json` excludes
    // the same two directories for the same reason.
    "docs-site/**",
    "legal/**",
  ]),
  {
    // shadcn/ui generated components are kept as upstream ships them
    files: ["src/components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
