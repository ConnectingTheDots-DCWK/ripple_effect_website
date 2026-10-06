import type { Platform } from "@/lib/releases";

/**
 * What each platform needs, and what it will complain about.
 *
 * The commands and caveats are the ones in the release workflow's own notes
 * (`.github/workflows/release.yml`), so there is one wording rather than two
 * that drift. Somebody finds all of this out within a minute of downloading,
 * and finding out here is better than finding out from Gatekeeper.
 */
export interface PlatformInfo {
  key: Platform;
  name: string;
  format: string;
  distros: string;
  requires: string;
  caveat?: string;
  /** `%s` is replaced with the asset's real filename. */
  install?: string;
  /** Shell the snippet is written in, for the label above it. */
  shell?: string;
  after?: string;
}

export const platforms: PlatformInfo[] = [
  {
    key: "linux-deb",
    name: "Linux",
    format: ".deb",
    distros: "Debian, Ubuntu, Mint, Pop!_OS",
    // 2.38, not 2.34, since 1.2: the libgit2 the version control feature
    // ships imports two symbols that only appeared in 2.38, and a package
    // claiming 2.34 installs on 22.04 and then cannot open a repository. The
    // deb's `libc6 (>= 2.38)`, the app's README and this line say one number.
    requires: "glibc 2.38 or newer — Ubuntu 24.04+, Debian 13+",
    install: "sudo apt install ./%s",
    shell: "bash",
  },
  {
    key: "linux-rpm",
    name: "Linux",
    format: ".rpm",
    distros: "Fedora, RHEL, openSUSE",
    requires: "glibc 2.38 or newer — Fedora 39+, RHEL 10+",
    install: "sudo dnf install ./%s",
    shell: "bash",
  },
  {
    key: "windows",
    name: "Windows",
    format: ".exe",
    distros: "Windows 10 and 11",
    requires: "Nothing — it installs for you alone, with no administrator",
    // This was an MSIX, which cannot be installed unsigned at all, so it
    // shipped with a self-signed certificate for the user to import first.
    // That was a lot of ceremony to arrive at "Windows still does not trust
    // this", which is where an unsigned .exe starts — one click away.
    caveat:
      "The installer is not code-signed, so SmartScreen stops it once with “Windows protected your PC”. Choose More info, then Run anyway. The warning is about the missing certificate, not about anything the installer does.",
    after:
      "It installs into %LOCALAPPDATA%\\Programs\\Ripple Effect for your account only, so it never asks for an administrator. Running a later installer over it upgrades in place.",
  },
  {
    key: "macos",
    name: "macOS",
    format: ".dmg",
    distros: "Apple silicon and Intel, in one universal build",
    requires: "macOS 11 Big Sur or newer",
    caveat:
      "The .dmg is neither signed nor notarised, so Gatekeeper blocks it on first launch. Drag the app to Applications, then either right-click it and choose Open, or run the command below.",
    install: 'xattr -dr com.apple.quarantine "/Applications/Ripple Effect.app"',
    shell: "bash",
  },
];

export function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}
