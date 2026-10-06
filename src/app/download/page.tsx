import type { Metadata } from "next";
import Link from "next/link";
import { DownloadIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { DetectedPlatform } from "@/components/detected-platform";
import { PlatformIcon } from "@/components/platform-icon";
import { fetchLatestRelease } from "@/lib/releases";
import { formatBytes, platforms } from "@/lib/platforms";
import { siteConfig } from "@/lib/site-config";
import { softwareApplication } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Download",
  description: `Download ${siteConfig.name} for Linux, Windows and macOS.`,
  alternates: { canonical: "/download" },
};

// The release is cached for five minutes in `fetchLatestRelease`, so a
// published release appears here without a redeploy.
export const revalidate = 300;

function Snippet({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">
      <code>{children}</code>
    </pre>
  );
}

export default async function DownloadPage() {
  const latest = await fetchLatestRelease();

  return (
    <>
      <JsonLd data={softwareApplication(latest?.version)} />
      <PageHeader
        eyebrow={latest ? `Version ${latest.version}` : "Downloads"}
        title="Get Ripple Effect"
        description={
          latest
            ? // "Nothing that phones home once it is installed" was here, and
              // it was not true: the app checks this site for a newer release
              // once per launch. A download page is the wrong place to make a
              // privacy claim a reader cannot check, so it names the one
              // thing that happens and points at the page that lists the rest.
              "One file per platform, and nothing to sign up for. It checks here for updates and sends nothing else without asking."
            : "The installers are not published yet. They will appear here the moment the first release goes out."
        }
      />

      <section className="mx-auto max-w-4xl px-4 pb-16 lg:px-8">
        {!latest && (
          <div className="mb-10 flex gap-3 rounded-lg border border-border bg-card p-4 text-sm">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground">
              There is no published release to download yet. Everything below
              describes what each platform will need when there is.
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {platforms.map((platform) => {
            const asset = latest?.assets.find((a) => a.platform === platform.key);
            // Always null now: Windows ships an unsigned .exe rather than an
            // MSIX, so no certificate rides along. See `certificate` in
            // lib/releases.ts, which is where this would come back from.
            const cert = platform.key === "windows" ? latest?.certificate : null;

            return (
              <div
                key={platform.key}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={platform.key} />
                      <h2 className="text-lg font-semibold tracking-tight">
                        {platform.name}
                      </h2>
                      <span className="font-mono text-xs text-muted-foreground">
                        {platform.format}
                      </span>
                      <DetectedPlatform platform={platform.key} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {platform.distros}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requires {platform.requires}
                    </p>
                  </div>

                  {asset ? (
                    <div className="text-right">
                      <Button asChild className="h-10 px-5">
                        <Link href={`/thanks?asset=${asset.id}`}>
                          <DownloadIcon />
                          Download
                        </Link>
                      </Button>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {formatBytes(asset.size)}
                      </p>
                    </div>
                  ) : (
                    <Button disabled variant="outline" className="h-10 px-5">
                      Not published yet
                    </Button>
                  )}
                </div>

                {platform.caveat && (
                  <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    {platform.caveat}
                  </p>
                )}

                {/* Dormant, with the MSIX it belonged to. Uncomment together
                    with `certificate` in lib/releases.ts and the FileBadgeIcon
                    import above.

                {cert && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button asChild variant="outline" size="lg">
                      <a href={`/api/download/${cert.id}`}>
                        <FileBadgeIcon />
                        Signing certificate
                      </a>
                    </Button>
                    <span className="font-mono text-xs text-muted-foreground">
                      {cert.name} · {formatBytes(cert.size)}
                    </span>
                  </div>
                )}
                */}

                {platform.install && (
                  <Snippet>
                    {platform.install
                      .replace("%s", asset?.name ?? `ripple_effect${platform.format}`)
                      // %c was the certificate filename, for the MSIX's
                      // import step. No snippet uses it now; it stays so that
                      // uncommenting that step does not need this found again.
                      .replace(
                        "%c",
                        cert?.name ?? "ripple-effect-signing-certificate.cer"
                      )}
                  </Snippet>
                )}

                {platform.after && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {platform.after}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-lg border border-border p-6">
          <h2 className="font-semibold tracking-tight">
            About those warnings
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing here is code-signed by an authority your machine already
            trusts, so Windows and macOS each say so once, in their own words.
            Neither warning is about what the installer does — both are about
            the absence of a certificate, and they would appear identically for
            any small unsigned application.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Linux needs none of this. A real code-signing certificate would
            remove the SmartScreen warning on Windows and, with notarisation,
            the Gatekeeper prompt on macOS; both are a known next step rather
            than an oversight. Signing with a certificate we made ourselves was
            tried and dropped, because it asked more of you and told you
            nothing you could check.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Something wrong?{" "}
            <a
              href={siteConfig.links.issues}
              target="_blank"
              rel="noopener"
              className="text-primary underline underline-offset-4"
            >
              Open an issue
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
