// @ts-check
import { defineConfig } from "astro/config";

// The legal documents, rendered from the Markdown beside this file.
//
// Static output and nothing else: there is no route here that needs a server,
// and a legal document that cannot be served because a function cold-started
// badly is a worse failure than any it could fix. `legal.ripplefx.app` is its
// own Vercel project over this directory as Root Directory — see README.md.
export default defineConfig({
  site: "https://legal.ripplefx.app",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  markdown: {
    // No syntax highlighting: nothing here is code, and the default Shiki
    // theme would be the one thing on the page that ignores the colour
    // scheme.
    //
    // No smart-punctuation option either, deliberately. Astro 7 deprecated
    // `smartypants` in favour of configuring the processor, and the right
    // answer for a legal document is neither: the dashes and quotation marks
    // in `en/` are typed as the characters they are meant to be, so what a
    // reviewer reads in the diff is exactly what a reader gets. A transform
    // that rewrites punctuation between the source and the page is one more
    // thing standing between the text somebody approved and the text
    // somebody is asked to accept.
    syntaxHighlight: false,
  },
});
