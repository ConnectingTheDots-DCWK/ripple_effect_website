import manifest from "../manifest.json";

/**
 * `manifest.json`, typed.
 *
 * It is the index both this site and the application read: the site builds
 * its routes from it, and the app's own snapshot of it is held against it by
 * `melos run legal:check`. That makes it the one place a version number is
 * stated, which is the point — a version spelled in the Markdown's front
 * matter *and* in a page component *and* in the app would be three things to
 * keep in step, and this file is what stops there being three.
 *
 * A document that is drafted but not served is simply not in here. There is
 * no `published: false`: a flag somebody has to remember to read is a flag
 * that gets read wrong once, and an absent entry cannot be rendered by a
 * route that is built from the entries. A draft is not in this repository at
 * all, for the stronger reason in `README.md` — it is public.
 */

/**
 * How a version comes into force. ADR *a-licence-follows-the-product*.
 *
 * There is no single answer because the four documents are not accepted the
 * same way, and pretending otherwise is what tied a release date to a
 * calendar:
 *
 * - `acceptance` — the reader accepts it, so it takes effect per installation
 *   at the moment they do. `effectiveFrom` is the application version that
 *   first asks. The EULA.
 * - `date` — nobody accepts it explicitly, so a date is the only anchor
 *   available. `effectiveFrom` is an ISO date. The Terms, which are accepted
 *   by using a website that has no versions.
 * - `processing` — not an agreement at all but an information duty under
 *   arts. 13–14, discharged when the processing starts. The document names
 *   the release in each section. `effectiveFrom` is null. The Privacy Notice.
 * - `publication` — a list rather than terms: current as published, kept
 *   current as it changes. `effectiveFrom` is null. Sub-processors.
 */
export type EffectiveOn = "acceptance" | "date" | "processing" | "publication";

export interface DocumentVersion {
  version: string;
  /** What brings this version into force. */
  effectiveOn: EffectiveOn;
  /**
   * The application version (`acceptance`) or ISO date (`date`) it comes into
   * force from; null for the two kinds that have no single moment.
   */
  effectiveFrom: string | null;
  /**
   * Whether this version is closed to correction.
   *
   * A version freezes when somebody first accepts it, or when the text is
   * declared final — and until then it binds nobody and is evidence of
   * nothing, so correcting it in place is a correction rather than a rewrite
   * of the record. `sha256` is set in the same edit, and `tool/check_legal.mjs`
   * is what makes the promise checkable rather than remembered.
   */
  frozen: boolean;
  /** sha256 of `source`, hex, set if and only if `frozen`. */
  sha256: string | null;
  /** The published path, without a leading slash. */
  path: string;
  /** The source file, relative to `legal/`. */
  source: string;
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  /** The version in force. Always one of `versions`. */
  current: string;
  languages: string[];
  versions: DocumentVersion[];
}

export interface Manifest {
  version: number;
  origin: string;
  documents: LegalDocument[];
}

export const legal = manifest as Manifest;

export const documents: LegalDocument[] = legal.documents;

export function documentBySlug(slug: string): LegalDocument {
  const found = documents.find((d) => d.slug === slug);
  if (!found) throw new Error(`legal: no document with slug "${slug}"`);
  return found;
}

/** The entry for a version, or a thrown error naming what was missing. */
export function versionOf(document: LegalDocument, version: string): DocumentVersion {
  const found = document.versions.find((v) => v.version === version);
  if (!found) {
    throw new Error(`legal: ${document.slug} has no version "${version}" in the manifest`);
  }
  return found;
}

/** The content-collection id for a version — `eula/1.0`. */
export function entryId(slug: string, version: string): string {
  return `${slug}/${version}`;
}

/**
 * True while a dated version is announced but not yet binding.
 *
 * Only `date` can be pending, and that is not a limitation: a version that
 * comes into force on acceptance is in force for whoever has accepted it and
 * not for anybody else, which no page rendered at build time can know. The
 * other three say what brings them into force instead of comparing clocks —
 * see `effectiveClause`.
 */
export function isPending(version: DocumentVersion, now: Date = new Date()): boolean {
  if (version.effectiveOn !== "date" || version.effectiveFrom === null) return false;
  return new Date(version.effectiveFrom).getTime() > now.getTime();
}

/**
 * The sentence after "Version 1.0 — ", saying what brings it into force.
 *
 * One function rather than a conditional in each of the three pages that
 * needs it, for the same reason the version number is in one file.
 */
export function effectiveClause(version: DocumentVersion, now: Date = new Date()): string {
  switch (version.effectiveOn) {
    case "acceptance":
      return (
        `takes effect for an installation when the application first asks you ` +
        `to accept it, which it does from Ripple Effect ${version.effectiveFrom}.`
      );
    case "date":
      return isPending(version, now)
        ? `published, and takes effect on ${formatDate(version.effectiveFrom!)}.`
        : `in force since ${formatDate(version.effectiveFrom!)}.`;
    case "processing":
      return (
        `applies to each kind of processing from the release that introduces ` +
        `it, which the notice names where it describes it.`
      );
    case "publication":
      return `in force as published, and kept current as the list changes.`;
  }
}

/** The same thing in a few words, for a list of versions. */
export function effectiveShort(version: DocumentVersion, now: Date = new Date()): string {
  switch (version.effectiveOn) {
    case "acceptance":
      return `on acceptance, from ${version.effectiveFrom}`;
    case "date":
      return isPending(version, now)
        ? `takes effect ${formatDate(version.effectiveFrom!)}`
        : `in force since ${formatDate(version.effectiveFrom!)}`;
    case "processing":
      return `per processing`;
    case "publication":
      return `as published`;
  }
}

/** `15 October 2026` — the spelling a document uses in its own prose. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
