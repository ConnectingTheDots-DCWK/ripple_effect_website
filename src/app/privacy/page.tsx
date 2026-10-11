import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ConsentControls } from "@/components/consent-controls";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cookies and analytics",
  description:
    "What this site collects, the one optional cookie, and where the full privacy notice is.",
  alternates: { canonical: "/privacy" },
};

/** Links out of the prose, so the styling is written once. */
function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
    >
      {children}
    </a>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground text-pretty">
        {children}
      </div>
    </section>
  );
}

/**
 * Written as a description of what happens rather than as a policy, because a
 * site this size can afford to be specific and a policy would have to be
 * vague. Everything on it is either measurable in a browser or written down in
 * the code it describes.
 *
 * **Its scope narrowed when the legal site arrived, and that was the point.**
 * The formal notice now lives at `legal.ripplefx.app/privacy` and covers the
 * application, this site and the hosted service; this page covers *this site*
 * and stops. The version of it that also described the app had to be
 * corrected every time the app changed, and had drifted into claiming there
 * was no telemetry some months after a crash reporter shipped. Two documents
 * that must agree is the drift worth designing out — so there is one
 * paragraph of overlap and a link, rather than a second account of the same
 * facts.
 *
 * What is kept here is what the consent banner needs to land on: the cookie,
 * who counts the page views, and the control that changes your mind.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="What this site knows"
        description="What actually happens when you read a page here, take a download, or say yes to the one cookie. The formal notice, covering the app and the service too, is on the legal site."
      />

      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-24 lg:px-8">
        <Section title="Reading a page">
          <p>
            Page views are counted by Vercel Web Analytics, which sets no cookie
            and stores nothing on your device. Visitors are told apart by a hash
            derived from the request itself, and it is discarded after
            twenty-four hours — it cannot be reversed, and it cannot be used to
            recognise you here tomorrow or anywhere else ever.
          </p>
          <p>
            What a recorded view may contain: the time, the path, the referring
            page, filtered query parameters, an approximate location down to a
            city, your operating system and browser and their versions, and
            whether the device is a phone, a tablet or a desktop. There is
            nothing in that list that names anybody, and nothing is joined up
            across sites. Vercel describes it in full in their{" "}
            <Out href="https://vercel.com/docs/analytics/privacy-policy">
              analytics privacy documentation
            </Out>
            .
          </p>
        </Section>

        <Section title="Downloading">
          <p>
            The installers live in a private GitHub repository. This site holds
            a read-only token so it can ask GitHub what the current release is
            and where its files are; the token stays on the server, never
            reaches your browser, and can read that one repository and nothing
            else. It is used to look up a file, not to look at you.
          </p>
          <p>
            The download itself is a redirect: the button hands you to GitHub
            and GitHub serves the bytes, so the request for the file is between
            you and them under their{" "}
            <Out href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">
              privacy statement
            </Out>
            . That is also how the download is counted — GitHub keeps a tally
            per file, which is the only download figure anybody here has.
          </p>
          <p>
            The address of the thanks page carries an asset number. That
            identifies which file you asked for, and nothing about who asked.
          </p>
        </Section>

        <Section title="The coffee button">
          <p>
            The floating Buy Me a Coffee button is a script of theirs, and it
            sets a single first-party cookie named{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              visited
            </code>{" "}
            which records that it has been shown to you. It is the only cookie
            this site sets beyond what it technically needs, which is why it is
            the only thing you are asked about. Decline and the script is never
            requested at all — not loaded and hidden, not loaded.
          </p>
          <p>
            The button on the thanks page is a different thing: a plain image
            served by Buy Me a Coffee, so loading that page fetches it from
            them. It sets nothing here, and following either of them takes you
            to <Out href={siteConfig.links.funding}>their site</Out>, on their
            terms.
          </p>
        </Section>

        <Section title="The forms">
          <p>
            The paid-tier waitlist is a form hosted by{" "}
            <Out href="https://tally.so">Tally</Out> and linked to rather than
            built as a field of ours. An address you give it is held by them and
            reaches us through them; this site runs no database for it to sit
            in, which is the reason it was done that way.
          </p>
          <p>
            The <Out href={siteConfig.links.survey}>satisfaction survey</Out> is
            the same arrangement — the same host, nothing of it stored here. It
            asks for a name and an address at the end and neither is required:
            leave them blank and what you sent is anonymous, which is the point
            of saying so on the form itself.
          </p>
        </Section>

        <Section title="The app itself">
          <p>
            Ripple Effect works on files on your own disk and needs no network
            to do it. Nothing you write is sent anywhere, and nothing counts
            what you do: there are no performance measurements and no record of
            which boards you open or how long you spend in them. From version
            1.5 the app can send anonymous usage statistics, and they are{" "}
            <strong>opt-in</strong> — asked once, with the complete list of what
            would be sent in front of the question, neither answer preselected,
            and switchable off afterwards. No build before 1.5 collected any.
          </p>
          <p>
            <strong>
              From version 1.5 the app asks you to accept the licence at first
              launch, and makes no network request of any kind until you have.
            </strong>{" "}
            Everything below happens after that, and only then.
          </p>
          <p>
            A few requests then leave the machine without your having to ask
            for them. Once per
            launch it asks this site whether a newer version exists — a plain
            request for a release number, carrying nothing about you, your
            projects or what you were doing. From version 1.5 it also asks,
            once per launch and unless you switch it off in Settings, whether a
            fix exists for its engine — the part that plays and compiles
            campaigns — naming that engine&apos;s version and the platform; a fix
            is downloaded from GitHub and used from the next launch. And if you
            open the About box, it asks this site for the contributor list,
            which the site fetches from GitHub on its own behalf — versions
            before 1.5 asked api.github.com directly. Their pictures are the one
            exception: each contributor&apos;s avatar is loaded from
            avatars.githubusercontent.com by your machine rather than through
            this site, so opening the About box does make a request to GitHub
            for the images. The rest reach this
            site the way any other request does, so an address and a
            browser-style identifier appear in a server log; nothing
            distinguishes one installation from another, because nothing in
            the request is unique to one.
          </p>
          <p>
            The one thing that can carry anything of yours is a{" "}
            <strong>crash report</strong>, and it is asked for one report at a
            time. After a crash, the next launch shows you what it saved — every
            file, its size, and what is in it — and sends nothing unless you
            answer yes to that report. There is no setting that answers in
            advance, in either direction. Your username, your home folder, the
            folders of your projects, e-mail and network addresses and anything
            shaped like a key are masked before you are even shown the question;
            a memory snapshot may still hold fragments of the text the app was
            working on, which is the one thing no masking can promise and the
            dialog says so.
          </p>
          <p>
            <strong>
              The full notice — what is processed, on what basis, for how long,
              and who else touches it — is the{" "}
              <Out href={siteConfig.legal.privacy}>Privacy Notice</Out>.
            </strong>{" "}
            It is the formal one, it covers the hosted service as well as the
            app, and it is the document to read if you want the complete answer
            rather than this page&apos;s summary of the part about the website.
          </p>
        </Section>

        <Section title="Fonts, and what is not here">
          <p>
            The typefaces are built into the site at compile time and served
            from it, so reading a page here sends no request to Google Fonts.
            There are no advertising scripts, no tag manager, no session
            recorder, no heat map and no embedded video.
          </p>
        </Section>

        <Section title="Changing your mind">
          <p>
            Withdrawing is meant to be exactly as easy as agreeing was, so the
            choice lives here as well as in the notice that asked for it.
          </p>
          <ConsentControls />
        </Section>

        <Section title="Asking about any of this">
          <p>
            Write to{" "}
            <Out href={`mailto:${siteConfig.publisher.legalEmail}`}>
              {siteConfig.publisher.legalEmail}
            </Out>
            , which is also where a request to see, correct or delete your data
            goes. For help with the app rather than a question about data,{" "}
            <Out href={`mailto:${siteConfig.publisher.supportEmail}`}>
              {siteConfig.publisher.supportEmail}
            </Out>{" "}
            or a thread in{" "}
            <Out href={siteConfig.links.discussions}>Discussions</Out> will get
            there faster.
          </p>
          <p className="text-sm">Last updated 30 September 2026.</p>
        </Section>
      </div>
    </>
  );
}
