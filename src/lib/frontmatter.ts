import "server-only";

/**
 * Frontmatter, parsed strictly and by hand — the blog's and the news's.
 *
 * It is a handful of scalar keys, so a YAML engine in the dependency tree
 * would be paying for a language to read `key: value` a few times. The cost of
 * doing it by hand is that it must be *strict*: an unknown key, a missing one
 * or an empty one stops the build and names the file. A lenient parser here
 * would drop a typo'd `discription` on the floor and publish a card with no
 * excerpt. What each value *means* — a date, a category, a banner — is the
 * caller's to check, because that is where the list of meanings lives.
 *
 * What it understands: `key: value` on one line, with the value optionally
 * wrapped in matching single or double quotes. Nothing else — no lists, no
 * nesting, no folded blocks. A file that needs one of those wants a real
 * parser, and that is the moment to add one rather than now.
 *
 * One function for both collections, because two copies of a strict parser
 * are two parsers that are strict about different things by the second edit.
 */
export function readFrontmatter(
  where: string,
  raw: string,
  required: readonly string[],
  optional: readonly string[] = []
): { fields: Map<string, string>; body: string } {
  if (!raw.startsWith("---\n")) {
    throw new Error(`${where}: no frontmatter — the file must open with ---`);
  }
  const end = raw.indexOf("\n---\n", 3);
  if (end === -1) {
    throw new Error(`${where}: the frontmatter block is never closed`);
  }

  const known = [...required, ...optional];
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
    if (!known.includes(key)) {
      throw new Error(
        `${where}: unknown frontmatter key \`${key}\` — expected one of ${known.join(", ")}`
      );
    }
    if (value === "") {
      throw new Error(`${where}: frontmatter key \`${key}\` is empty`);
    }
    fields.set(key, value);
  }

  for (const field of required) {
    if (!fields.has(field)) {
      throw new Error(`${where}: frontmatter is missing \`${field}\``);
    }
  }

  return { fields, body: raw.slice(end + 5) };
}

/** `YYYY-MM-DD`, or the build stops naming the file. */
export function checkDate(where: string, date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`${where}: \`date\` must be YYYY-MM-DD — got ${date}`);
  }
  return date;
}
