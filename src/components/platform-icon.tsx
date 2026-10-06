import { AppleIcon, Grid2x2Icon, TerminalIcon } from "lucide-react";

import type { Platform } from "@/lib/releases";

/**
 * Lucide, not brand logos, and that is the house rule rather than a shortcut:
 * *one icon family*, so nothing on a row can end up in a different face. Four
 * panes, an apple and a terminal read as Windows, macOS and Linux in a row
 * that says the operating system's name next to them anyway — and none of them
 * is somebody's trademark being redrawn from memory.
 */
export const platformIcons = {
  "linux-deb": TerminalIcon,
  "linux-rpm": TerminalIcon,
  windows: Grid2x2Icon,
  macos: AppleIcon,
} as const satisfies Record<Platform, unknown>;

/**
 * What the button calls it: the operating system, then the format.
 *
 * The format is named on **every** platform rather than only where it is
 * ambiguous. It is load-bearing on Linux, where nothing in a user agent
 * distinguishes apt from dnf and a silent pick would be a guess presented as
 * an answer — but a button that says the format on Linux and hides it
 * everywhere else reads as a warning about Linux. Saying it four times says
 * instead that this is simply what you are about to get, which is also the
 * answer to "will this work on my machine".
 */
export const platformLabels = {
  "linux-deb": "Linux (DEB)",
  "linux-rpm": "Linux (RPM)",
  windows: "Windows (installer)",
  macos: "macOS (DMG)",
} as const satisfies Record<Platform, string>;

export function PlatformIcon({
  platform,
  ...props
}: { platform: Platform } & React.ComponentProps<"svg">) {
  const Icon = platformIcons[platform];
  // Callers inside a button pass `data-icon`, which is what the button
  // variants read to tighten the padding on whichever side the icon sits.
  // Outside one it means nothing, so it is not set here.
  return <Icon {...props} />;
}
