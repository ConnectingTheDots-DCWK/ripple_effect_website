import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { BuyMeACoffee } from "@/components/buy-me-a-coffee";
import { StartDownload } from "@/components/start-download";
import { fetchLatestRelease } from "@/lib/releases";
import { platformLabels } from "@/components/platform-icon";

export const metadata: Metadata = {
  title: "Thanks",
  // Not a destination: it exists for the seconds after a click, and its URL
  // carries an asset id that stops meaning anything at the next release.
  robots: { index: false, follow: true },
};

export const revalidate = 300;

/**
 * Shown while the download runs.
 *
 * **The asset id is looked up rather than trusted**, which is what lets the
 * page name the file it is handing over. `fetchLatestRelease` is the same
 * cached call the hero and `/download` make, and an id that is not in the
 * current release simply does not match — so a stale link, a guessed number or
 * an id from the previous version lands on the "it did not start" copy instead
 * of firing a request at `/api/download`. That route validates the id itself
 * and always did; this is not the security boundary, it is what keeps the page
 * from saying something untrue about what is downloading.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const { asset: requested } = await searchParams;
  const latest = await fetchLatestRelease();
  const asset = latest?.assets.find((a) => String(a.id) === requested);

  return (
    <>
      {asset && <StartDownload href={`/api/download/${asset.id}`} />}

      <PageHeader
        eyebrow={asset ? `Version ${latest?.version}` : undefined}
        title="Thanks — your download is starting"
        description={
          asset
            ? `${platformLabels[asset.platform]}. If nothing happened, the link below starts it again.`
            : "That link has expired, which usually means a newer version has been released since it was made."
        }
      >
        <div className="mt-8 flex flex-col items-center gap-4">
          {asset ? (
            <a
              href={`/api/download/${asset.id}`}
              className="inline-flex items-center gap-2 text-sm text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              <DownloadIcon className="size-4" />
              {asset.name}
            </a>
          ) : (
            <Link
              href="/download"
              className="inline-flex items-center gap-1 text-sm text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              Go to the download page
              <ArrowRightIcon className="size-3.5" />
            </Link>
          )}
        </div>
      </PageHeader>

      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-4 text-center lg:px-8">
          <BuyMeACoffee />
        </div>
      </section>
    </>
  );
}
