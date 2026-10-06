import { cn } from "@/lib/utils";
// A type-only import, which is erased before this file reaches a browser
// bundle. `@/lib/blog` is `server-only` and a value import from here would be
// a build error — correctly, since this component is rendered by a client one.
import type { PostSummary } from "@/lib/blog";

/**
 * The byline row: category, date, reading time. One component because the
 * card on `/blog` and the header of a post are the same three facts, and a
 * second copy would be a second thing to change.
 *
 * **The category chip is the quiet one and stays that way.** The roadmap's
 * chips are toned because shipped-versus-planned is a status a reader acts on,
 * and a category is not: it says which of four things a post is. The title is
 * what carries a card.
 */
export function PostMeta({
  post,
  className,
}: {
  post: Pick<PostSummary, "category" | "date" | "dateLabel" | "minutes">;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
        className
      )}
    >
      <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium">
        {post.category}
      </span>
      <time dateTime={post.date}>{post.dateLabel}</time>
      <span aria-hidden>·</span>
      <span>{post.minutes} min read</span>
    </div>
  );
}
