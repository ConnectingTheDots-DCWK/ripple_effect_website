import type { CSSProperties, ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCodeIcon,
  FileTextIcon,
  FolderIcon,
  WorkflowIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The editor's chrome around a canvas: the side bar's file tree, a file
 * opened as text, the play window. Drawn at the app's proportions in its
 * faces, as `NodeCard` is; what they leave out is everything a picture
 * would not show.
 */

/** A pane with the workspace's title strip, as a docked panel carries it. */
export function Pane({
  title,
  className,
  style,
  children,
}: {
  title: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={style}
      className={cn(
        "overflow-hidden rounded-[16px] border border-border bg-card font-ui text-foreground",
        className
      )}
    >
      <div className="flex h-9 items-center border-b border-border px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}

type Entry = { name: string; depth: number; kind: "folder" | "board" | "passage" | "script" | "file"; open?: boolean };

const icons = {
  folder: FolderIcon,
  board: WorkflowIcon,
  passage: FileTextIcon,
  script: FileCodeIcon,
  file: FileTextIcon,
};

/** The side bar's Explorer over a folder somebody already had. */
export function FileTree({
  entries,
  className,
  style,
}: {
  entries: Entry[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Pane title="Explorer" className={className} style={style}>
      <ul className="py-1.5 text-[13px]">
        {entries.map((entry) => {
          const Icon = icons[entry.kind];
          const Chevron = entry.open ? ChevronDownIcon : ChevronRightIcon;
          return (
            <li
              key={`${entry.depth}-${entry.name}`}
              data-tree-row
              className="flex h-7 items-center gap-1.5 pr-3"
              style={{ paddingLeft: 10 + entry.depth * 14 }}
            >
              {entry.kind === "folder" ? (
                <Chevron className="size-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{entry.name}</span>
            </li>
          );
        })}
      </ul>
    </Pane>
  );
}

/** A file open as text in a tab: its name, then its lines, numbered. */
export function TextFile({
  name,
  lines,
  className,
  style,
  prose,
}: {
  name: string;
  lines: string[];
  className?: string;
  style?: CSSProperties;
  /** The passage editor sets the author's words in the book face. */
  prose?: boolean;
}) {
  return (
    <div
      style={style}
      className={cn(
        "overflow-hidden rounded-[16px] border border-border bg-card font-ui text-foreground",
        className
      )}
    >
      <div className="flex h-9 items-center gap-2 border-b border-border px-3 text-[13px]">
        <FileTextIcon className="size-4 text-muted-foreground" />
        <span className="truncate">{name}</span>
        <XIcon className="ml-auto size-3.5 text-muted-foreground" />
      </div>
      <ol className={cn("py-2 text-[13px] leading-6", prose ? "font-prose" : "font-code")}>
        {lines.map((line, i) => (
          <li key={i} className="flex gap-3 px-3">
            <span className="w-4 shrink-0 text-right font-code text-muted-foreground/70 select-none">
              {i + 1}
            </span>
            <span className="min-w-0 whitespace-pre-wrap">{line || " "}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The play window's slide: the passage at `AppType.slide` — Literata at 20px
 * and 1.6 — inside the reading measure, and the choices as numbered tiles,
 * the keys that pick them.
 */
export function PlaySlide({
  title,
  prose,
  choices,
  className,
  style,
}: {
  title: string;
  prose: string;
  choices: string[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "overflow-hidden rounded-[24px] border border-border bg-card font-ui text-foreground",
        className
      )}
    >
      <div className="flex h-10 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground">Playing</span>
        <span>·</span>
        <span className="truncate">{title}</span>
        <XIcon className="ml-auto size-4" />
      </div>
      <div className="px-10 py-8">
        <p className="max-w-[33em] font-prose text-xl leading-[1.6]">{prose}</p>
        <div className="mt-8 grid max-w-[33em] gap-2">
          {choices.map((choice, i) => (
            <div
              key={choice}
              data-play-choice
              className="flex items-center gap-3 rounded-[12px] border border-border bg-background px-4 py-2.5 text-[15px]"
            >
              <span className="font-code text-xs text-muted-foreground">{i + 1}</span>
              {choice}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
