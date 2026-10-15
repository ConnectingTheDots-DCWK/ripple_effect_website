import Image from "next/image";

import { cn } from "@/lib/utils";
// Type-only, so nothing of the server-only module reaches a bundle.
import type { Article } from "@/lib/news";

/**
 * A news item's banner, with its title drawn on it.
 *
 * The same picture the app draws on its home screen (`apps/editor/lib/src/news/`
 * in the application repository), so the two are worth keeping in step: an
 * image, a flat colour, or a two-stop gradient running top left to bottom
 * right, under a **scrim** that the title sits on.
 *
 * **The scrim is what makes any banner legible, and it is fixed rather than
 * chosen.** The author picks the colour behind the title and so cannot be
 * trusted to pick one white text reads on — a pale banner is the ordinary
 * case, not an edge one. The ramp is black from nothing at the top to 55% a
 * third of the way down and 75% at the foot. White needs 54% black over pure
 * white, the worst a banner can be, to clear 4.5:1, so everything below that
 * third — where the title sits, three lines of it at the widest — clears it on
 * any banner at all, and a dark banner hardly changes. It is a gradient,
 * and it is the one the house style's *no gradients* rule would let through
 * anyway: it is not decoration, it is the contrast.
 */
export function NewsBanner({
  article,
  as: Heading = "h2",
  className,
  priority = false,
}: {
  article: Pick<Article, "title" | "banner" | "bannerAlt">;
  as?: "h1" | "h2";
  className?: string;
  priority?: boolean;
}) {
  const { banner } = article;
  const background =
    banner.kind === "colour"
      ? { backgroundColor: banner.colour }
      : banner.kind === "gradient"
        ? { backgroundImage: `linear-gradient(135deg, ${banner.from}, ${banner.to})` }
        : undefined;

  return (
    <div
      className={cn(
        "relative isolate flex aspect-[3/1] items-end overflow-hidden rounded-lg border border-border bg-muted",
        className
      )}
      style={background}
    >
      {banner.kind === "image" && (
        <Image
          src={banner.src}
          alt={article.bannerAlt ?? ""}
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          className="-z-10 object-cover"
          priority={priority}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-[5] bg-gradient-to-b from-black/0 via-black/55 via-35% to-black/75"
      />
      <Heading className="p-5 text-xl font-semibold tracking-tight text-balance text-white lg:p-6 lg:text-2xl">
        {article.title}
      </Heading>
    </div>
  );
}
