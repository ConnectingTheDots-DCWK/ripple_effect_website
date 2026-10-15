import "server-only";

import fs from "node:fs";
import path from "node:path";

import { checkDate, readFrontmatter } from "@/lib/frontmatter";

export { formatDate } from "@/lib/blog";

/**
 * The news, read off disk at build time.
 *
 * **News is not the blog, and the difference is who it is for.** A post is an
 * essay for somebody who follows the project. A news item is a few
 * paragraphs for somebody who *uses* the app, and its main reader is the app
 * itself: `/news/feed.xml` is fetched once per launch by every installation
 * that has accepted EULA 2.0 and not switched *News* off, and drawn on the
 * home screen as a card with a banner. So an item is short, it says what
 * changed for the reader, and it is about the things the editor's own release
 * notes never carry — a binding, an integration, a page that moved, something
 * that needs doing.
 *
 * An item is one Markdown file in `content/news/`, and the file is the whole
 * record, exactly as a post is: the slug is its name, the metadata its
 * frontmatter. The parser is the blog's (`src/lib/frontmatter.ts`); what is
 * checked here is what only the news has.
 *
 * Like the blog, everything here runs at build time only — every route over
 * it is prerendered. **If one is ever made dynamic, `content/news` has to be
 * named in `outputFileTracingIncludes`.**
 */

const DIR = path.join(process.cwd(), "content", "news");

/** Where an item's own files live under `public/`, and are served from. */
export const ASSET_ROOT = "/news";

/**
 * What sits behind the title.
 *
 * Three kinds, written as one flat frontmatter value because the parser reads
 * scalars and nothing else:
 *
 * ```
 * banner: image banner.webp           # public/news/<slug>/banner.webp
 * banner: colour #2a2e37
 * banner: gradient #2B4C7E #5FA8D3
 * ```
 *
 * **An image is a file in this repository, never an address.** The app fetches
 * a banner from `ripplefx.app` and its subdomains and refuses every other host
 * — Privacy Notice 2.0 §4.7 promises it — so an item pointing elsewhere would
 * be an item whose banner nobody sees. Refusing it here is cheaper than finding
 * out from a screenshot.
 *
 * **A gradient is the author's choice, and the house style's third
 * exception.** *No glass, no gradients* holds for chrome; a banner is content
 * somebody chose for one item, like the generated cover standing in for a
 * missing project picture. Two stops, top left to bottom right, and nothing
 * more elaborate, because both renderers — this page and the app — have to
 * draw it identically.
 */
export type Banner =
  | { kind: "image"; src: string }
  | { kind: "colour"; colour: string }
  | { kind: "gradient"; from: string; to: string };

export interface Article {
  slug: string;
  title: string;
  /** One sentence. The card's excerpt, the feed's `<description>`. */
  description: string;
  /** `YYYY-MM-DD`. */
  date: string;
  banner: Banner;
  /** What a screen reader says for an image banner. Required for one. */
  bannerAlt?: string;
  body: string;
}

const REQUIRED = ["title", "description", "date", "banner"] as const;
const OPTIONAL = ["bannerAlt"] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;

function parseBanner(where: string, slug: string, value: string): Banner {
  const [kind, ...rest] = value.split(/\s+/);
  const wrong = (why: string) =>
    new Error(
      `${where}: \`banner\` ${why} — expected \`image <file>\`, ` +
        `\`colour #RRGGBB\` or \`gradient #RRGGBB #RRGGBB\`, got ${value}`
    );

  switch (kind) {
    case "image": {
      if (rest.length !== 1) throw wrong("names one file");
      const file = rest[0];
      if (file.includes("/") || file.includes(":")) {
        throw wrong(`is a file name beside the item, not a path or an address`);
      }
      const onDisk = path.join(process.cwd(), "public", "news", slug, file);
      if (!fs.existsSync(onDisk)) {
        throw new Error(`${where}: banner image public/news/${slug}/${file} does not exist`);
      }
      return { kind: "image", src: `${ASSET_ROOT}/${slug}/${file}` };
    }
    case "colour":
      if (rest.length !== 1 || !HEX.test(rest[0])) throw wrong("takes one #RRGGBB");
      return { kind: "colour", colour: rest[0].toLowerCase() };
    case "gradient":
      if (rest.length !== 2 || !rest.every((c) => HEX.test(c))) {
        throw wrong("takes two #RRGGBB");
      }
      return { kind: "gradient", from: rest[0].toLowerCase(), to: rest[1].toLowerCase() };
    default:
      throw wrong("is of an unknown kind");
  }
}

/**
 * What a body may not contain, because of where it is read.
 *
 * - **An image by address.** The app loads pictures from this site only, so
 *   `![…](https://elsewhere/…)` would be a hole in the article; an image is a
 *   site-relative path, `/news/<slug>/…`, and the feed makes it absolute.
 * - **A ```ripple fence.** The app draws a body with the same Markdown widget
 *   as a passage, which runs a ```ripple block as a snippet. News is not a
 *   campaign, and a block that means something in one renderer and nothing
 *   in the other is a block that should not be there.
 *
 * Raw HTML needs no rule of its own: this site's pipeline drops it, and so
 * does the app's.
 */
function checkBody(where: string, slug: string, body: string) {
  for (const match of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
    const target = match[1];
    if (!target.startsWith(`${ASSET_ROOT}/${slug}/`)) {
      throw new Error(
        `${where}: image ${target} — an image in a news item is a file under ` +
          `public/news/${slug}/, written as ${ASSET_ROOT}/${slug}/<file>`
      );
    }
    if (!fs.existsSync(path.join(process.cwd(), "public", target))) {
      throw new Error(`${where}: image public${target} does not exist`);
    }
  }
  if (/^\s*```\s*ripple/m.test(body)) {
    throw new Error(`${where}: a \`\`\`ripple fence — news is not a campaign`);
  }
}

function parse(slug: string, raw: string): Article {
  const where = `content/news/${slug}.md`;
  const { fields, body } = readFrontmatter(where, raw, REQUIRED, OPTIONAL);
  const date = checkDate(where, fields.get("date")!);
  const banner = parseBanner(where, slug, fields.get("banner")!);
  const bannerAlt = fields.get("bannerAlt");
  if (banner.kind === "image" && !bannerAlt) {
    throw new Error(`${where}: an image banner needs \`bannerAlt\``);
  }
  if (banner.kind !== "image" && bannerAlt) {
    throw new Error(`${where}: \`bannerAlt\` describes an image, and this banner is a ${banner.kind}`);
  }
  checkBody(where, slug, body);
  return {
    slug,
    title: fields.get("title")!,
    description: fields.get("description")!,
    date,
    banner,
    bannerAlt,
    body,
  };
}

let cache: Article[] | null = null;

/** Every item, newest first, and by slug within a day so builds agree. */
export function allArticles(): Article[] {
  if (cache) return cache;
  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((name) => name.endsWith(".md"))
    : [];
  const articles = files.map((name) =>
    parse(name.slice(0, -3), fs.readFileSync(path.join(DIR, name), "utf8"))
  );
  articles.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  cache = articles;
  return articles;
}

export function findArticle(slug: string): Article | undefined {
  return allArticles().find((article) => article.slug === slug);
}
