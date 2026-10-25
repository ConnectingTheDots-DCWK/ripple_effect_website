import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Code on the page, tokenised here and rendered as elements.
 *
 * **Not Shiki, and not HTML.** The blog's highlighting is the one
 * `dangerouslySetInnerHTML` this site allows (CLAUDE.md, *The one
 * `dangerouslySetInnerHTML`*), and a snippet on a landing page is short
 * enough for a tokeniser that knows five things — a comment, a string, a
 * number, a keyword, and a type or a call. It is deliberately generic: one
 * keyword list across the languages shown, which is wrong at the margins
 * and right for a reader glancing at twelve lines.
 *
 * The colours are the app's own Python editor's (`PythonPalette`), as
 * `--syntax-*` tokens, so code on the site and code in the app look alike.
 *
 * Each line carries `data-line` (1-based), so an animation can light it.
 */

export type Lang = "ts" | "cpp" | "cs" | "dart" | "python" | "sh" | "json" | "weir" | "cmake";

const KEYWORDS = new Set(
  (
    // TypeScript, C++, C#, Dart and Python, with the words they share once.
    "import from export const let var await async new switch case return break " +
    "continue if else for while do throw try catch finally function class extends " +
    "using auto final static void true false null None True False def in is not " +
    "and or lambda pass with as yield this self typeof default " +
    // Weir.
    "expr test allows"
  ).split(" ")
);

const HASH_COMMENTS = new Set<Lang>(["python", "sh", "weir", "cmake"]);

const TOKEN =
  /(\/\/.*$|#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|@[A-Za-z_]\w*|\b\d[\w.]*\b|\b[A-Za-z_]\w*\b|\s+|.)/gm;

function tokenise(line: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  const tokens = [...line.matchAll(TOKEN)].map((m) => m[0]);
  tokens.forEach((t, i) => {
    const next = tokens.slice(i + 1).find((n) => n.trim() !== "");
    let cls: string | undefined;
    if (t.startsWith("//") && lang !== "sh" && lang !== "weir") cls = "text-muted-foreground italic";
    else if (t.startsWith("#") && HASH_COMMENTS.has(lang)) cls = "text-muted-foreground italic";
    else if (/^["'`]/.test(t)) cls = lang === "json" && next === ":" ? "text-syntax-type" : "text-syntax-string";
    else if (t.startsWith("@")) cls = "text-syntax-decorator";
    else if (/^\d/.test(t)) cls = "text-syntax-number";
    else if (KEYWORDS.has(t)) cls = "text-syntax-keyword";
    else if (/^[A-Za-z_]/.test(t) && (/^[A-Z]/.test(t) || next === "(")) cls = "text-syntax-type";
    out.push(cls ? <span key={i} className={cls}>{t}</span> : t);
  });
  return out;
}

export function Code({
  code,
  lang = "ts",
  className,
  title,
  plain,
}: {
  code: string;
  lang?: Lang;
  className?: string;
  /** The tab's or the file's name, on a strip above the code. */
  title?: ReactNode;
  /** No colour at all, for a diff, whose colour is its own. */
  plain?: boolean;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border border-border bg-card font-ui",
        className
      )}
    >
      {title && (
        <div className="flex h-9 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto py-3 font-code text-[13px] leading-6">
        <code>
          {lines.map((line, n) => (
            <span
              key={n}
              data-line={n + 1}
              // The ember marks a lit line as a pointer, two pixels at its
              // edge, never as a fill.
              className="block px-4 transition-colors data-[lit]:bg-foreground/[0.06] data-[lit]:shadow-[inset_2px_0_0_var(--primary)]"
            >
              {plain ? line : tokenise(line, lang)}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
