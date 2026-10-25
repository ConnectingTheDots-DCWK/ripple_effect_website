import type { CSSProperties, ReactNode } from "react";
import { ChevronDownIcon, ArrowRightIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A card from the editor's canvas, drawn in HTML.
 *
 * Transcribed from `NarrativeNodeCard` and `CardMetrics` in the app
 * (`apps/editor/lib/src/graph/ui/`): 268px wide, the card in
 * `surfaceContainerHigh` (`--accent` here) inside an `outlineVariant`
 * hairline at `AppRadius.md`, a 36px header tinted with its family's accent
 * at 14% and rounded on all four corners, then the body's rows at the
 * heights the card declares — a field row 44, a port row 26, a choice row 22.
 * What is left out is what a picture never shows: hover states, tooltips,
 * the caution frames.
 *
 * A port is drawn on the card's edge exactly as `fl_nodes_v2` places it, a
 * triangle for the flow and a dot for data, and carries `data-port` so a
 * `Board` can find it and draw a wire to it.
 */

export type Family = "entry" | "terminal" | "flow" | "prose" | "data";

const accent: Record<Family, string> = {
  entry: "var(--node-entry)",
  terminal: "var(--node-terminal)",
  flow: "var(--node-flow)",
  prose: "var(--node-prose)",
  data: "var(--node-data)",
};

export const cardWidth = 268;

export function NodeCard({
  family,
  icon: Icon,
  title,
  width = cardWidth,
  className,
  style,
  inId,
  outId,
  children,
}: {
  family: Family;
  icon: LucideIcon;
  title: string;
  width?: number;
  className?: string;
  style?: CSSProperties;
  /** A control port on the header, where a card with one unlabelled way in
      or out keeps it (`CardMetrics.headerAnchorY`). */
  inId?: string;
  outId?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[12px] border border-border bg-accent font-ui text-foreground",
        className
      )}
      style={{ width, ...style }}
    >
      <div
        className="relative flex h-9 items-center gap-2 rounded-[11px] px-2.5"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent[family]} 14%, transparent)`,
        }}
      >
        <Icon className="size-4 shrink-0" style={{ color: accent[family] }} />
        <span className="truncate text-sm leading-none font-medium">
          {title}
        </span>
        {inId && <Port id={inId} side="in" />}
        {outId && <Port id={outId} side="out" />}
      </div>
      {children}
    </div>
  );
}

/** `fl_nodes_v2`'s two port shapes, centred on the card's edge. */
export function Port({
  id,
  side,
  kind = "control",
}: {
  id: string;
  side: "in" | "out";
  kind?: "control" | "data";
}) {
  return (
    <span
      data-port={id}
      aria-hidden
      className={cn(
        "absolute top-1/2 size-3 -translate-y-1/2",
        side === "in" ? "-left-[6.5px]" : "-right-[6.5px]"
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3 overflow-visible">
        {kind === "control" ? (
          <path
            d="M2 1.5 L10.5 6 L2 10.5 Z"
            fill="var(--board)"
            stroke="var(--outline)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ) : (
          <circle
            cx={6}
            cy={6}
            r={4.5}
            fill="var(--board)"
            stroke="var(--outline)"
            strokeWidth={1.5}
          />
        )}
      </svg>
    </span>
  );
}

/** A 26px row: an input on the left, an output on the right, or both. */
export function PortRow({
  input,
  output,
  inputKind = "control",
  outputKind = "control",
  inputId,
  outputId,
  children,
}: {
  input?: string;
  output?: string;
  inputKind?: "control" | "data";
  outputKind?: "control" | "data";
  inputId?: string;
  outputId?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex h-[26px] items-center gap-2 px-2.5 text-[13px] text-foreground/85">
      {inputId && <Port id={inputId} side="in" kind={inputKind} />}
      {input && <span className="truncate">{input}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {output && <span className="truncate">{output}</span>}
      {outputId && <Port id={outputId} side="out" kind={outputKind} />}
    </div>
  );
}

/** A 22px choice row on a Narration card: the choice's name and its exit. */
export function ChoiceRow({
  label,
  outputId,
  muted,
  className,
}: {
  label: string;
  outputId: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[22px] items-center justify-end px-2.5 text-[13px]",
        muted ? "text-muted-foreground italic" : "text-foreground/85",
        className
      )}
    >
      <span className="truncate">{label}</span>
      <Port id={outputId} side="out" />
    </div>
  );
}

/** A 44px field row holding the card's picker, with the arrow that opens it. */
export function PickerRow({ value }: { value: string }) {
  return (
    <div className="flex h-11 items-center gap-2 px-2.5">
      <div className="flex h-8 min-w-0 flex-1 items-center rounded-[8px] border border-outline bg-card px-3 text-[13px]">
        <span className="truncate">{value}</span>
        <ChevronDownIcon className="ml-auto size-4 shrink-0" />
      </div>
      <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </div>
  );
}

/**
 * The passage preview: six lines of 18 in the author's face, fading into the
 * card at the bottom as `MarkdownPreview` does — with a gradient, not a mask.
 */
export function ProsePreview({
  children,
  className,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  /** Off for a preview short enough to be read whole. */
  fade?: boolean;
}) {
  return (
    <div className={cn("relative mx-2.5 mb-2 h-[108px] overflow-hidden", className)}>
      <div className="font-prose text-[13px] leading-[18px] text-foreground/90">
        {children}
      </div>
      {fade && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-accent" />
      )}
    </div>
  );
}

/** A hairline between a card's sections, as the app rules its rows. */
export function CardRule() {
  return <div className="mx-0 h-px bg-border" />;
}

/**
 * A 44px text field row: outlined, its name always floating on the border
 * (`FloatingLabelBehavior.always`), so a field with a value still says what
 * it is.
 */
export function TextFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-11 items-end px-2.5 pb-1">
      <div className="relative flex h-8 w-full items-center rounded-[8px] border border-outline px-3 text-[13px]">
        <span className="absolute -top-2 left-2 bg-accent px-1 text-[11px] leading-none text-muted-foreground">
          {label}
        </span>
        <span className="truncate font-code">{value}</span>
      </div>
    </div>
  );
}
