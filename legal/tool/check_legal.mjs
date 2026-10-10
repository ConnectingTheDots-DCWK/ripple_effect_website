// Fails if `manifest.json` and the documents under `en/` disagree.
//
// Six rules, and every one of them is here because something could otherwise
// go wrong without a word. The site's build already refuses a manifest naming
// a current version whose file is missing — `getStaticPaths` throws — and
// `legal-links.yml` already checks that every published URL resolves. What
// neither of them can see:
//
//   1. A file under `en/` that no manifest entry names. The content loader
//      ingests `**/*.md` unconditionally, so a draft committed here is loaded,
//      never routed, and completely silent. **This repository is public**, so
//      that is the rule that matters most: a draft here is published whether
//      or not a route renders it. See README.md, "drafted but not published".
//   2. A `source` that names a file that does not exist. `source` is read
//      nowhere but inside two error-message template strings, so a wrong one
//      builds green — and then the error that fires on a genuinely missing
//      file names the wrong path.
//   3. Front matter that contradicts the manifest. The content schema checks
//      types and cannot see the manifest, so a page can state one version
//      while the index states another.
//   4. An edit to a frozen version. ADR *a-licence-follows-the-product*: a
//      version freezes on first acceptance or when its text is declared
//      final, and from then the text at its `/v/` path never changes again.
//      The digest is what makes that checkable rather than remembered.
//   5. A `path` that is not `v/<slug>-<version>`, or a `current` that is not
//      in `versions`.
//   6. A version entry removed since `origin/main`. Its `/v/` path is a
//      promise, and an acceptance record points at it.
//
// Run from `legal/`: `node tool/check_legal.mjs`, which `pnpm check` does.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const failures = [];
const notes = [];

const fail = (rule, detail) => failures.push([rule, detail]);

/** Every `.md` under a directory, as paths relative to `legal/`. */
function markdownUnder(dir) {
  const found = [];
  const walk = (at) => {
    for (const name of readdirSync(at).sort()) {
      const full = join(at, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".md")) found.push(relative(".", full));
    }
  };
  if (existsSync(dir)) walk(dir);
  return found;
}

/**
 * The front matter of a document, parsed by hand and strictly.
 *
 * Six scalar keys do not justify a YAML engine in this project's dependency
 * tree — the same call the website's blog parser makes, and for the same
 * reason: what they justify is a parser that stops and names the file. Only
 * the first colon splits, so a title containing one survives; matching quotes
 * are stripped; `null` is the literal.
 */
function frontMatter(path) {
  const text = readFileSync(path, "utf8");
  if (!text.startsWith("---\n")) return { error: "no front matter" };
  const end = text.indexOf("\n---\n", 3);
  if (end === -1) return { error: "front matter is not closed" };
  const keys = {};
  for (const line of text.slice(4, end + 1).split("\n")) {
    if (line.trim() === "") continue;
    const colon = line.indexOf(":");
    if (colon === -1) return { error: `cannot read front-matter line "${line}"` };
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (value === "null") value = null;
    else if (/^(".*"|'.*')$/s.test(value)) value = value.slice(1, -1);
    keys[key] = value;
  }
  return { keys };
}

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

// ---------------------------------------------------------------------------

if (!existsSync("manifest.json") || !existsSync("en")) {
  process.stderr.write("legal: run from the legal/ directory.\n");
  process.exit(2);
}

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const kinds = new Set(["acceptance", "date", "processing", "publication"]);

/** Every version entry, flattened, with its document beside it. */
const entries = manifest.documents.flatMap((document) =>
  document.versions.map((version) => ({ document, version })),
);

// 1 — every file under `en/` is named as a source.
const named = new Set(entries.map(({ version }) => version.source));
for (const file of markdownUnder("en")) {
  if (!named.has(file)) {
    fail(
      "a document under en/ is in no manifest entry",
      `${file} — this repository is public, so a file here is published ` +
        `whether a route renders it or not. A draft belongs in the ` +
        `application repository's docs/legal-drafts/, not here.`,
    );
  }
}

// 2–5 — per entry.
for (const { document, version } of entries) {
  const where = `${document.slug} ${version.version}`;

  // 2 — the source resolves.
  if (!existsSync(version.source)) {
    fail("a manifest source does not exist", `${where}: source is ${version.source}`);
    continue;
  }

  // 3 — the front matter agrees.
  const { keys, error } = frontMatter(version.source);
  if (error) {
    fail("front matter cannot be read", `${version.source}: ${error}`);
  } else {
    for (const key of ["slug", "version", "effectiveOn", "effectiveFrom"]) {
      const mine = key === "slug" ? document.slug : version[key];
      if (keys[key] !== mine) {
        fail(
          "front matter disagrees with the manifest",
          `${version.source}: ${key} is ${JSON.stringify(keys[key])} in the ` +
            `document and ${JSON.stringify(mine)} in the manifest`,
        );
      }
    }
  }

  // 4 — a frozen version is the file it was frozen as.
  if (version.frozen) {
    if (typeof version.sha256 !== "string") {
      fail("a frozen version has no digest", `${where}: frozen with sha256 ${version.sha256}`);
    } else {
      const actual = sha256(version.source);
      if (actual !== version.sha256) {
        fail(
          "a frozen version has been edited",
          `${where}: ${version.source} hashes to ${actual}, the manifest says ` +
            `${version.sha256}. A frozen version never changes again — this is ` +
            `a new version, not an edit.`,
        );
      }
    }
  } else if (version.sha256 !== null) {
    fail(
      "an unfrozen version carries a digest",
      `${where}: sha256 is set but frozen is false, so nothing checks it`,
    );
  }

  // 5 — the shapes.
  const expected = `v/${document.slug}-${version.version}`;
  if (version.path !== expected) {
    fail("a published path is not v/<slug>-<version>", `${where}: path is ${version.path}`);
  }
  if (!kinds.has(version.effectiveOn)) {
    fail("an unknown effectiveOn", `${where}: ${JSON.stringify(version.effectiveOn)}`);
  }
  const needsFrom = version.effectiveOn === "acceptance" || version.effectiveOn === "date";
  if (needsFrom && typeof version.effectiveFrom !== "string") {
    fail(
      "effectiveOn needs an effectiveFrom",
      `${where}: ${version.effectiveOn} says what it comes into force from, ` +
        `and effectiveFrom is ${JSON.stringify(version.effectiveFrom)}`,
    );
  }
  if (!needsFrom && version.effectiveFrom !== null) {
    fail(
      "effectiveOn takes no effectiveFrom",
      `${where}: ${version.effectiveOn} has no single moment, and ` +
        `effectiveFrom is ${JSON.stringify(version.effectiveFrom)}`,
    );
  }
}

for (const document of manifest.documents) {
  if (!document.versions.some((v) => v.version === document.current)) {
    fail("current is not in versions", `${document.slug}: current is ${document.current}`);
  }
}

// 6 — nothing has been removed from `versions`.
//
// Against `origin/main` rather than the merge base: what must not disappear is
// what is *published*, and `main` is what is deployed. A shallow clone with no
// `origin/main` is a note rather than a failure — the workflow fetches depth 0
// so that it is a real check there.
let published;
try {
  published = JSON.parse(
    execFileSync("git", ["show", "origin/main:legal/manifest.json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
} catch {
  notes.push("origin/main is not available, so removals were not checked");
}
if (published) {
  const have = new Set(entries.map(({ document, version }) => `${document.slug} ${version.version}`));
  for (const document of published.documents ?? []) {
    for (const version of document.versions ?? []) {
      const key = `${document.slug} ${version.version}`;
      if (!have.has(key)) {
        fail(
          "a published version has been removed",
          `${key} is in origin/main and not here. Its /v/ path is a promise, ` +
            `and an acceptance record points at it.`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------

for (const note of notes) process.stdout.write(`legal: ${note}\n`);

if (failures.length > 0) {
  for (const [rule, detail] of failures) {
    process.stderr.write(`legal: ${rule} —\n  ${detail}\n`);
  }
  process.exit(1);
}

process.stdout.write(
  `legal: the manifest and the documents agree ` +
    `(${manifest.documents.length} documents, ${entries.length} versions).\n`,
);
