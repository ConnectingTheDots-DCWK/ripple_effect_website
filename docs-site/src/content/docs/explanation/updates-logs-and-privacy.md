---
title: Updates, logs and Messages
description: Why updates are verified and never silent, why the session log has no always-send setting, and why Messages and the log are kept apart.
---

The app does three things on its own account: it keeps itself current, it writes down what it did, and it tells you things about your folder. Each has a different audience, and the design choices below follow from keeping the audiences apart. The page takes them in turn: updates, engine fixes, the news, the session log and what leaves it, reporting a bug, then Messages and files from a newer version.

## An update is something you can refuse

After the first install, the app installs its own updates. Once per launch it asks the website whether a newer release exists. When one does, the notice can do the update: it fetches the installer for the way *this* copy was installed (the `.deb`, the `.rpm`, the Windows Setup or the `.dmg`), checks it against the checksum the release publishes, hands it to Setup, Finder or your package manager, and closes so that can happen. On Windows, Setup offers to reopen the app when it has finished; on macOS and Linux you start it again yourself.

Handing the installer to the platform's own installer window, rather than replacing files from inside the running app, means you get the ordinary window and can still say no to it. A download that does not match its checksum is thrown away. Where the app cannot tell how it arrived, it opens the download page instead. An update never closes the app over unsaved work: a file that changed on disk while you were editing it stops the update, and the app says which one.

Previews are the same mechanism with one more choice. A copy following the Preview release channel is offered early builds of the next version as well as every stable release, whichever is newer. The website answers every copy with every channel's latest release, so the request never says which channel you follow; the choice is made on your machine. Nothing older than the version you are running is ever offered, on either channel. That is why switching back to Stable from a preview never downgrades you. It stops the previews, and the app waits for Stable to catch up, because a project a newer version has saved is exactly what an older one may refuse to open, as the section on files from a newer version explains. [Settings](/reference/settings/#release-channel) has the controls.

Installing a downloaded installer is a step the platform may question, because nothing is code-signed yet; [Why the installers are unsigned](/explanation/unsigned-installers/) gives the reasoning, and [Installers and first launch](/reference/installers/) says what each platform asks.

## Engine fixes travel separately

The part of the app that plays and compiles campaigns can be fixed without a new installer. A fix is fetched in the background, checked against a signature before it is trusted, and used from the next launch. If the app crashes with a fix in place, the fix is set aside automatically. A fix never changes what the app can do.

Because it happens without a prompt, it is visible and reversible: the app bar shows a button while a fix arrives and when it is ready, and the fetching can be switched off, or the fixes removed, in Settings. [Settings, accessibility and updates controls](/reference/settings/) lists the controls, and [What the app sends](/about/what-the-app-sends/#engine-fix-check) says what the request carries.

## News without an update

Some things worth telling you are not about the editor at all: a new binding for the engine, an integration, a page that moved. They have no place in a release's notes, and waiting for the next release to say them would be the wrong way round. So the home page has a News button, and the items behind it come from a feed on the website rather than from the app.

It is held to the same rules as the update check. It asks once per launch, carries nothing about you, and fetches pictures from our own site and nowhere else. What you have read is a date kept on your machine. It also waits on a licence: version 1.0 of the agreement listed every request the app could make, and the news was not on the list. Version 2.0 allows a request that carries nothing about you, made only to our own site, as a kind, and a copy that accepted 1.0 is asked about it thirty days after being told. [Settings](/reference/settings/#news) has the switch, and [What the app sends](/about/what-the-app-sends/#news) says what the request carries.

## The session log is for a bug report, and you decide what leaves it

Ripple Effect keeps a diary of each run. The app never uploads it on its own, and when you want to report a bug you decide what to hand over.

One route can carry a copy of it away, and it asks you first. If the app crashes, the next launch shows you the crash report it saved: every file in it, its size, and what each one contains. It is sent only if you answer *Send report*. The session's logs are among those files. There is no "always send" setting and no "never send" one. Either would turn a decision about one crash into a standing policy made before you had seen what the crash contained. Instead the question is asked once per crash, at the moment you can see what it is about, and whichever way you answer is final for that report. [What the app sends](/about/what-the-app-sends/) goes through it in full.

Usage statistics follow the same logic with a different default. They are opt-in, and off until you switch them on. The app asks once, with the complete list in front of the question rather than behind a link, with neither answer preselected, and the answer can be changed afterwards. Switching off destroys the identifier, so nothing already sent can be tied to you again. The fields and the delay are in [What the app sends](/about/what-the-app-sends/#usage-statistics).

### A session is a folder

What the app records about a run lives in a folder named by a short id: the log, a separate file for each kind of crash, and which build you were on. Every file has one writer. The Rust engine, the part that plays and compiles campaigns, keeps its own `engine.log` in that folder with the same redaction, and a crash in it records the file and line it came from, even in a release build. Two sides writing to one file would need to agree on an order, so each writes its own. When a piece of work crosses from one to the other, a compile for instance, both sides write it down with the same number on it, so the two halves can be read together. A crash writes what happened and closes off the session log in one go, so the file is complete even when the app is not.

The rule behind what is recorded is to keep the outline of what happened and not the author's material: a query string can carry a credential, and an argument can be a passage you wrote. [The session log and reports](/reference/session-log/) lists what is recorded and where the folder is.

### A problem session is never mistaken for a clean one

The log is the evidence a bug report rests on, so the design avoids the ways a log loses it. Nothing is dropped. A message with a line break in it, such as a Python traceback, cannot make the next launch read a problem session as fine and remove it. Warnings and above reach the file at once with the run-up before them, and a very large run continues into a second file rather than growing one nobody can attach to an issue.

It does tidy up after itself, on the other side of the same bargain. A session where nothing went wrong is deleted the next time you start the app, so the folder holds the runs worth something and not a file for every time you opened a project. If the app falls over before it can write its own verdict, the next launch reads that file properly rather than guessing.

### Private things are taken out first

Redaction happens before anything is written down. Your username and home folder, the location of the project you have open, e-mail addresses, network addresses and anything shaped like a password or a key are replaced. That includes e-mail addresses with accented or non-Latin local parts and account names ending in an accented letter. Times are recorded in UTC rather than your local clock. A list of rules cannot know that a board's name is private, so a glance before you post is still worth it.

## Reporting a bug starts from what you saw

A bug report is where the log meets a person, so the app answers the questions it can itself: the version, your operating system and which installer this copy came from arrive already filled in, so a report starts from what you saw rather than from four questions. Links the app opens go through `ripplefx.app`, which sends you on to where that thing lives today, so a link in this version keeps working if the place moves. The steps are in [How to report a bug](/how-to/report-a-bug/).

## Messages are about your folder, the log is about the app

The **Messages** panel is a different thing from the log. Messages is what the app says to *you* about *your folder*: a translation that has fallen behind, a picture a passage points at that is not there, a board with no way in, a file written by a newer version. It is scoped to the open project and cleared when another one opens. The log is what the app says about *itself*, for whoever reads a bug report. The two have different readers, so each holds what its reader needs. [Diagnostics](/reference/diagnostics/) covers how Messages are grouped and what the codes mean.

### Files from a newer version are refused, not guessed at

A project file written by a newer Ripple Effect is never half-read. An older copy of the app says it cannot read the file, tells you to update, and writes nothing to it. Each of these files is something you could not get back if a copy that misunderstood it wrote it out again. Things that only cache something, such as a bundle's translation timestamps or the list of recent projects, rebuild by looking at the folder again, so those are never a reason to stop. [Project files and the .ripple folder](/reference/project-files/) lists the file kinds.

## Related

- [The session log and reports](/reference/session-log/)
- [Settings, accessibility and updates controls](/reference/settings/)
- [What the app sends](/about/what-the-app-sends/)
- [How to report a bug](/how-to/report-a-bug/)
- [Diagnostics](/reference/diagnostics/)
