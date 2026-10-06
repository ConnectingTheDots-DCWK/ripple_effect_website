import manifest from "../manifest.json";

/**
 * `manifest.json`, typed.
 *
 * It is the index both this site and the application read: the site builds
 * its routes from it, and the app's own table of documents is checked against
 * it by a test. That makes it the one place a version number is stated, which
 * is the point — a version spelled in the Markdown's front matter *and* in a
 * page component *and* in the app would be three things to keep in step, and
 * this file is what stops there being three.
 *
 * A document that is drafted but not served — the DPA is the one, today — is
 * simply not in here. There is no `published: false`: a flag somebody has to
 * remember to read is a flag that gets read wrong once, and an absent entry
 * cannot be rendered by a route that is built from the entries.
 */
export interface DocumentVersion {
  version: string;
  /** ISO date. In the future while a change is inside its notice period. */
  effective: string;
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
 * True while a version is announced but not yet binding.
 *
 * The amendment articles give thirty days' notice of a change that moves the
 * terms, and `effective` in the future is how that notice is expressed. The
 * page says so rather than leaving a reader to compare dates.
 */
export function isPending(version: DocumentVersion, now: Date = new Date()): boolean {
  return new Date(version.effective).getTime() > now.getTime();
}

/** `15 October 2026` — the spelling every document uses in its own prose. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
