import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Reverse the scroll direction */
  reverse?: boolean;
  /** Pause the animation while hovered */
  pauseOnHover?: boolean;
  /** Scroll vertically instead of horizontally */
  vertical?: boolean;
  /** Number of content copies (keep >=2 for a seamless loop) */
  repeat?: number;
  /** Fade the edges with a mask */
  fade?: boolean;
  children: React.ReactNode;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  fade = true,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      data-slot="marquee"
      className={cn(
        "group flex gap-(--gap) overflow-hidden [--duration:40s] [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        fade &&
          (vertical
            ? "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
            : "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"),
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around gap-(--gap)",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
