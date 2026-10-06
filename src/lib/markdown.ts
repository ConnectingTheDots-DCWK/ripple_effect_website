import "server-only";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "@shikijs/rehype";
import type { BuiltinLanguage } from "shiki";
import type { Element, Parent, Root } from "hast";

/**
 * Markdown to HTML, at build time.
 *
 * Nothing in this file reaches the browser: the blog's two routes are
 * prerendered, so the whole chain runs during `next build` and what ships is
 * the HTML it produced. That is the reason it is allowed to be seven packages
 * — none of them is a byte of anybody's bundle.
 *
 * **Raw HTML in a post is dropped, deliberately.** `remark-rehype` discards it
 * unless `rehype-raw` is added, and it is not: the posts are Markdown, the
 * whole point of the format here is that writing one needs no React, and an
 * escape hatch into arbitrary markup is how a content directory turns back
 * into a component directory. A post that genuinely needs a widget wants a
 * page of its own.
 */

/**
 * The languages a post may fence.
 *
 * Named rather than taking Shiki's whole bundle, so the build loads ten
 * grammars instead of three hundred. An unlisted language falls back to
 * `text` rather than throwing — a post is content, and a plain block is a far
 * better failure than a broken build. Add to this list when a post wants a
 * language that is not here — and it is typed, so a misremembered name is a
 * build error rather than every block in that language silently going plain.
 */
const LANGUAGES: BuiltinLanguage[] = [
  "dart",
  "python",
  "bash",
  "json",
  "yaml",
  "typescript",
  "tsx",
  "css",
  "markdown",
  "diff",
];

/**
 * Wrap every table in a scrolling div.
 *
 * A wide table has to scroll inside itself — the page must never scroll
 * sideways — and the obvious way to get that is `display: block;
 * overflow-x: auto` on the table. It works, and it costs the table its
 * table-ness: a block box shrinks to its content, so a two-column table sits
 * at half the column width looking unfinished.
 *
 * So the container is a real container. Nine lines here buys back
 * `width: 100%` on the table itself, and `remark-gfm` is the only thing that
 * makes tables in the first place, so nothing else in the tree is affected.
 */
function rehypeWrapTables() {
  return (tree: Root) => {
    const walk = (node: Parent) => {
      node.children = node.children.map((child) => {
        if (child.type === "element") walk(child);
        if (child.type !== "element" || child.tagName !== "table") return child;
        return {
          type: "element",
          tagName: "div",
          properties: { className: ["post-scroll"] },
          children: [child],
        } satisfies Element;
      });
    };
    walk(tree);
  };
}

/*
 * The syntax colours are Shiki's `github-light` and `github-dark`, which are
 * also what Expressive Code uses by default on the documentation site — so a
 * code block here and a code block there are coloured the same way without
 * either one being told about the other. That was a decision made over there
 * and the reasoning carries: the app's Python editor has a palette of its own,
 * matching it properly is real work, and a half-matched one would be worse
 * than an honest borrowed one.
 *
 * `defaultColor: false` emits both themes as `--shiki-light` / `--shiki-dark`
 * custom properties instead of baking one of them into `style` attributes, so
 * the theme toggle switches the code with the page and no second render is
 * needed. `src/app/blog/post.css` is the two lines that read them — and it
 * overrides the *background*, because the frame is ours: the card surface, a
 * hairline and `--radius-sm`, the same frame the documentation site puts round
 * its own blocks.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeWrapTables)
  .use(rehypeShiki, {
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    langs: LANGUAGES,
    fallbackLanguage: "text",
  })
  .use(rehypeStringify);

export async function renderMarkdown(source: string): Promise<string> {
  return String(await processor.process(source));
}
