import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * The blog, read off disk at build time.
 *
 * A post is one Markdown file in `content/blog/`, and the file is the whole
 * record: the slug is its name, the metadata is its frontmatter, the reading
 * time is counted from its body. **There is no second list to keep in step.**
 * The template shipped one — `src/lib/blog-posts.ts`, holding a title, an
 * excerpt, a date, a category and a hand-typed "4 min read" for each post,
 * beside an MDX file that repeated most of it — and a list like that is
 * already wrong by the second post.
 *
 * Everything here runs at build time only. The two routes are prerendered
 * (`generateStaticParams` names every slug), so nothing reads the filesystem
 * when somebody asks for a page. **If either route is ever made dynamic, this
 * directory has to be named in `outputFileTracingIncludes`** — Next traces the
 * files a server bundle needs by reading the code, and a `readdirSync` of a
 * path it computed cannot be traced.
 */

const DIR = path.join(process.cwd(), "content", "blog");

/**
 * Typed rather than free text, so a category invented in a hurry is a build
 * error rather than a fifth chip nobody meant to add. They are the four things
 * this blog is for: what the app does, how it is built, what shipped, and
 * where it is going.
 */
export const categories = [
  "Feature",
  "Engineering",
  "Release",
  "Roadmap",
] as const;

export type Category = (typeof categories)[number];

export interface Post {
  /** The file name without its extension. */
  slug: string;
  title: string;
  /** One sentence. The card's excerpt, and the page's meta description. */
  description: string;
  /** `YYYY-MM-DD`. */
  date: string;
  category: Category;
  /**
   * The `<title>` and the social title, when the post's own title would make
   * a poor search result. Optional, and usually absent.
   *
   * **The two are allowed to differ because they are answering different
   * questions.** `title` is what the piece is called — it is the `<h1>`, the
   * card, the social card image, and it gets to be evocative. `seoTitle` is
   * what somebody typed into a search box, so it is literal and contains the
   * words they used. "A node body is an ordinary widget" is a good name for
   * an essay and a bad search result: it has none of the words a Flutter
   * developer would look for.
   *
   * This is a licence to be plain, not a licence to stuff. If it does not
   * read as a sentence a person would write, it is wrong.
   */
  seoTitle?: string;
  /** Whole minutes, never less than one. See `readingMinutes`. */
  minutes: number;
  /** Everything after the frontmatter, unparsed. */
  body: string;
}

/** Required in every post. */
const REQUIRED = ["title", "description", "date", "category"] as const;

/** Accepted, and absent from most posts. */
const OPTIONAL = ["seoTitle"] as const;

const FIELDS = [...REQUIRED, ...OPTIONAL] as const;

/**
 * Frontmatter, parsed strictly and by hand.
 *
 * It is four scalar keys, so a YAML engine in the dependency tree would be
 * paying for a language to read `key: value` four times. The cost of doing it
 * by hand is that it must be *strict*: an unknown key, a missing one, a
 * malformed date or a category that is not in the list stops the build and
 * names the file. A lenient parser here would drop a typo'd `discription` on
 * the floor and publish a card with no excerpt.
 *
 * What it understands: `key: value` on one line, with the value optionally
 * wrapped in matching single or double quotes. Nothing else — no lists, no
 * nesting, no folded blocks. A post that needs one of those wants a real
 * parser, and that is the moment to add one rather than now.
 */
function parse(slug: string, raw: string): Omit<Post, "minutes"> {
  const where = `content/blog/${slug}.md`;

  if (!raw.startsWith("---\n")) {
    throw new Error(`${where}: no frontmatter — the file must open with ---`);
  }
  const end = raw.indexOf("\n---\n", 3);
  if (end === -1) {
    throw new Error(`${where}: the frontmatter block is never closed`);
  }

  const fields = new Map<string, string>();
  for (const line of raw.slice(4, end).split("\n")) {
    if (line.trim() === "") continue;
    const colon = line.indexOf(":");
    if (colon === -1) {
      throw new Error(`${where}: frontmatter line is not \`key: value\` — ${line}`);
    }
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // A title with a colon in it is the common case, and it survives because
    // only the *first* colon splits the line.
    if (
      value.length > 1 &&
      (value.startsWith('"') || value.startsWith("'")) &&
      value.endsWith(value[0])
    ) {
      value = value.slice(1, -1);
    }
    if (!(FIELDS as readonly string[]).includes(key)) {
      throw new Error(
        `${where}: unknown frontmatter key \`${key}\` — expected one of ${FIELDS.join(", ")}`
      );
    }
    if (value === "") {
      throw new Error(`${where}: frontmatter key \`${key}\` is empty`);
    }
    fields.set(key, value);
  }

  for (const field of REQUIRED) {
    if (!fields.has(field)) {
      throw new Error(`${where}: frontmatter is missing \`${field}\``);
    }
  }

  const date = fields.get("date")!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`${where}: \`date\` must be YYYY-MM-DD — got ${date}`);
  }

  const category = fields.get("category")!;
  if (!(categories as readonly string[]).includes(category)) {
    throw new Error(
      `${where}: \`category\` must be one of ${categories.join(", ")} — got ${category}`
    );
  }

  return {
    slug,
    title: fields.get("title")!,
    description: fields.get("description")!,
    date,
    category: category as Category,
    seoTitle: fields.get("seoTitle"),
    body: raw.slice(end + 5),
  };
}

/**
 * How long the post takes to read, in whole minutes.
 *
 * A word count at 200 wpm, which is the ordinary web figure and is honest
 * about being English-only. **The app itself does this properly** — fifty-four
 * languages, mixed scripts counted a run at a time, `dart_read_time` — and
 * none of that is reachable from here: it is a Dart package, and this is a
 * Next site. What is borrowed is the one rule that matters at this scale.
 * Code is not prose, so fenced blocks and inline code come out first; and a
 * link is worth the words you read rather than the length of its URL, so the
 * label survives the stripping and the target does not.
 */
function readingMinutes(body: string): number {
  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[#>\-*+\s]+/gm, " ");

  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * A post's body as plain text, for the search index.
 *
 * **Deliberately not the same stripping as `readingMinutes`, and the
 * difference is the point.** That one takes code *out*, because a Python
 * snippet is not read at reading speed. This one leaves code *in*, because
 * `Element.updateChild` is exactly the sort of thing somebody comes to a
 * search box with. Two questions, two answers; collapsing them into one
 * helper would silently pick a side.
 *
 * Markdown syntax goes, its content stays: a fence keeps its lines, a link
 * keeps its label and loses its URL, an image goes entirely. The result is
 * the prose a reader would have seen, which is what they will be searching
 * for.
 *
 * **A heading gets a full stop if it does not have one**, because everything
 * here ends up on one line and a heading is the only block that does not
 * close itself. Without it, "The trap this gets most wrong" runs straight
 * into "Korean." and an excerpt lifted from that seam reads as a sentence
 * nobody wrote.
 */
export function searchableText(body: string): string {
  return body
    .replace(/^```[^\n]*$/gm, " ")
    .replace(/^#{1,6}\s+(.*)$/gm, (_, heading: string) =>
      /[.?!:]$/.test(heading.trim()) ? heading : `${heading}.`
    )
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|]/g, " ")
    .replace(/^\s*[-+]\s+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let cache: Post[] | null = null;

/**
 * Every post, newest first.
 *
 * Memoised because the list page, every post page, every post's social card,
 * the sitemap and the feed all ask for it during one build, and the answer
 * cannot change while a build is running.
 */
export function allPosts(): Post[] {
  if (cache) return cache;

  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((name) => name.endsWith(".md"))
    : [];

  const posts = files.map((name) => {
    const slug = name.slice(0, -3);
    const parsed = parse(slug, fs.readFileSync(path.join(DIR, name), "utf8"));
    return { ...parsed, minutes: readingMinutes(parsed.body) };
  });

  // Newest first, and by slug within a day so that two posts published
  // together do not swap places between builds.
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  cache = posts;
  return posts;
}

export function findPost(slug: string): Post | undefined {
  return allPosts().find((post) => post.slug === slug);
}

/**
 * A post without its body — everything a card needs and nothing more.
 *
 * **`dateLabel` is formatted here rather than at the point of display**, and
 * that is load-bearing rather than tidy. The card is rendered by a client
 * component now, so it cannot call `formatDate`: this module is `server-only`
 * and importing it into a browser bundle is a build error, which is the whole
 * point of the marker. Handing the finished string across the boundary also
 * removes any chance of the server's `Intl` and the browser's disagreeing
 * about a month name mid-hydration.
 */
export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  category: Category;
  /** `YYYY-MM-DD`, for the `datetime` attribute. */
  date: string;
  /** "9 September 2026". */
  dateLabel: string;
  minutes: number;
}

export function summaries(): PostSummary[] {
  return allPosts().map(({ slug, title, description, category, date, minutes }) => ({
    slug,
    title,
    description,
    category,
    date,
    dateLabel: formatDate(date),
    minutes,
  }));
}

/**
 * "9 September 2026", in UTC.
 *
 * The timezone is pinned because the date is a plain `YYYY-MM-DD` with no time
 * in it: parsed as UTC midnight and formatted in a timezone behind it, every
 * post would be dated the day before.
 */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}
