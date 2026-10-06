"use client";

import Link from "next/link";
import { DownloadIcon } from "lucide-react";

import { ShimmerButton } from "@/components/velora/shimmer-button";
import { PlatformIcon, platformLabels } from "@/components/platform-icon";
import { useDetectedPlatforms } from "@/lib/use-platform";
import type { ReleaseAsset } from "@/lib/releases";

/** `gap-2` rather than the variant's `gap-1.5`: six pixels is tight against a
 *  16px label, and the icon needs to read as a separate thing beside it. */
const BUTTON = "h-11 gap-2 px-6 text-base";

/**
 * The hero's download button, aimed at the machine it is being read on, so
 * that the ordinary visitor never has to choose anything.
 *
 * **The label survives when the release does not.** If the platform is known
 * but there is no asset for it — nothing published yet, or that platform
 * missing from the release — the button keeps saying what it would give you
 * and goes to `/download`, which explains the state in a sentence. The
 * alternative was falling back to a bare "Download", and that was wrong in
 * practice: before the first release the aiming was invisible, so the feature
 * looked absent rather than waiting.
 *
 * The icon trails the label. Leading, it reads as a bullet on a row of
 * controls; trailing, it reads as what you are being handed.
 *
 * **`data-icon="inline-end"` is deliberately not set on it**, though that is
 * the attribute the button variants look for. It exists to tuck a trailing
 * icon in on the compact sizes, and it does that by cutting the right padding
 * to `pr-2` — which on this button, at `px-6`, leaves the icon eight pixels
 * from an edge the label is twenty-four from, and reads as lopsided. Without
 * the attribute the padding stays symmetric, which is what a hero button
 * wants.
 *
 * Two things it deliberately does not do. It never *only* offers the detected
 * platform — the line beneath goes to the page with all four and the install
 * notes, because plenty of people download for a machine they are not sitting
 * at, and because the Windows build needs a second file. And on Linux it names
 * the format rather than picking apt or dnf quietly.
 */
export function HeroDownload({ assets }: { assets: ReleaseAsset[] }) {
  const detected = useDetectedPlatforms();
  const asset = detected
    .map((platform) => assets.find((a) => a.platform === platform))
    .find((a): a is ReleaseAsset => a !== undefined);

  const platform = asset?.platform ?? detected[0];

  // Before detection resolves — on the server, and for one client frame — and
  // for anything that is not one of the three desktops.
  if (!platform) {
    return (
      <ShimmerButton asChild className={BUTTON}>
        <Link href="/download">
          Download
          <DownloadIcon />
        </Link>
      </ShimmerButton>
    );
  }

  const label = (
    <>
      Download for {platformLabels[platform]}
      <PlatformIcon platform={platform} />
    </>
  );

  return (
    <ShimmerButton asChild className={BUTTON}>
      {asset ? (
        <Link href={`/thanks?asset=${asset.id}`}>{label}</Link>
      ) : (
        <Link href="/download">{label}</Link>
      )}
    </ShimmerButton>
  );
}
