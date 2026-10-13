// The demo is a plain Vite page. `public/` holds the bundle and Vite serves it
// as it is, with the range requests a media element needs to seek.
//
// `vite preview` is given vercel.json's headers, so a local preview runs under
// the same Content-Security-Policy production does: a policy that breaks the
// engine — WebAssembly needs 'wasm-unsafe-eval' — breaks it here first.
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

interface Rule {
  source: string;
  headers: { key: string; value: string }[];
}
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: Rule[];
};
const everywhere = vercel.headers.find((rule) => rule.source === '/(.*)');

export default defineConfig({
  // The engine is one chunk per variant, about 900 kB each, and only the one
  // a campaign needs is fetched; splitting it would buy nothing.
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000,
    // Vite inlines an asset under 4 kB as a `data:` URL, and two of jco's
    // shim modules are that small — which the Content-Security-Policy's
    // `connect-src 'self'` then refuses to fetch, and the campaign does not
    // open. Every WebAssembly module stays a file of its own.
    assetsInlineLimit: (file) => (file.endsWith('.wasm') ? false : undefined),
  },
  preview: {
    headers: Object.fromEntries((everywhere?.headers ?? []).map(({ key, value }) => [key, value])),
  },
});
