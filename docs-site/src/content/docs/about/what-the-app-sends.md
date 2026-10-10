---
title: What the app sends
description: The complete list of what leaves your machine, what never does, what a crash report contains, and what an account will and will not change.
sidebar:
  order: 2
---

Ripple Effect works on files on your own disk and needs no network to do it.
This page is the complete list of what leaves your machine anyway — four
things, three of them trivial and one of them asked for every time.

The [Privacy Notice](https://legal.ripplefx.app/privacy/) is the formal
version, with legal bases and retention periods. This page is the same facts
in the order you would want to read them.

## Nothing, until you accept the licence — from 1.6

**From version 1.6** the app will ask you to accept the [End-User Licence
Agreement](https://legal.ripplefx.app/eula/) at first launch and **make no
network request of any kind until you have** — not an update check, not
anything. Closing that window will mean nothing has been sent.

**The build you are running today does not ask.** That window is part of 1.6
and is not built yet, so this release makes the update check below on first
launch like any other. It is written here in the future tense on purpose: the
licence describes the same thing, and a page claiming a dialog the software
does not have is worse than a page admitting the gap.

## An update check, once per launch

The app asks `ripplefx.app` what the most recent release is, and compares it
with your own version on your machine.

The request carries **no identifier, no version number and nothing about
you** — it is a plain question with no subject. As with any request over the
internet, the server sees the address it came from, which is how the internet
works rather than something the app chose to send. Nothing distinguishes one
installation from another, because nothing in the request is unique to one.

## A list of contributors, when you open the About box

The About box shows who has contributed, and fetches that list from GitHub's
public API when you open it. Nothing about you goes with it.

## A crash report — if you say yes to that report

This is the only thing the app sends that can contain anything of yours, and
it is the only one that asks.

**How it asks.** If the app crashes, it saves a report on your machine and
sends nothing. The next time you start the app, a window tells you it crashed,
lists **every file it would send** with its size and a sentence about what is
in it, and offers *Show files* so you can open them and look. It goes only if
you press *Send report*.

**There is no setting.** No "always send", no "never send". The question is
asked once per crash, at the moment you can actually see what it is about, and
whichever way you answer is final for that report. A report you decline stays
on your machine and is never offered again.

**What is in one:**

- **A memory snapshot** of the app at the moment it crashed — what each part
  of it was running, the libraries it had loaded, and small pieces of memory
  around them.
- **The crashed run's diagnostic files** — the session record and the logs,
  each cut to its last 2 MiB, and the window tells you when one was cut.
- **A short manifest** naming the files, the version that sent them and when
  the crash happened.
- **A few labels**: the app's version, whether you were on the home screen or
  inside a project — never *which* project — and an id tying the snapshot to
  its own logs.

**What is masked before you are even asked.** Your username and home folder,
the folder of every project the app knows about, e-mail addresses, network
addresses, and anything shaped like a password or a key are replaced
throughout, before the window opens.

:::caution[The one thing masking cannot promise]
A memory snapshot may hold fragments of whatever text the app was working on.
No automatic rule can know that a passage you wrote is private. The window
says this too, because "everything is anonymised" is a claim nobody can check
and therefore nobody should believe.
:::

**Is it anonymous?** There is no account and nothing in it names you. It does
carry a random number the crash reporter made for your installation, so that
crashes from one computer can be told apart from crashes from different ones.
It is not derived from your hardware or anything about you, it is used for
nothing else, and if you never send a report it never leaves your machine.

## What never leaves

- **Your work.** Passages, boards, projects, components, scripts, exports —
  none of it is sent anywhere. There is no background sync.
- **Usage statistics.** Nothing counts what you do, which boards you open or
  how long you spend. There are none, opt-in or otherwise.
- **The session log**, unless it goes inside a crash report you sent. It is
  written on your machine, with private things replaced as they are written,
  and a run where nothing went wrong is deleted the next time you start the
  app. See [Updates, logs and
  support](/overviews/updates-logs-and-support/).
- **Your version-control credentials.** They live in your operating system's
  own credential store, and pushes go to a repository you configured.

## What is planned, and on what terms

**Anonymous usage statistics** will be **opt-in**. The shape is decided
already: you are asked once, with the complete list of what would be sent in
front of the question rather than behind a link; neither answer is
preselected; and you can turn it off afterwards. No text you wrote would ever
be included, and adding a new thing to the list means asking again.

Turning it off does something worth understanding before you rely on it.
While it is on, the app holds a random identifier it made when you switched it
on — so the data is *pseudonymous*, and while that identifier exists you can
give it to us and have the rows deleted. **Turning it off destroys the
identifier**, which stops collection and severs the only link between you and
what was already sent. After that nobody can connect those rows to you,
including us — so there is nothing left to delete, and nothing we could hand
back if you asked. Switching it on again mints a new identifier; you are a new
installation and nothing joins the two.

**An account** is for the [hosted
service](https://legal.ripplefx.app/terms/) — media storage, real-time
collaboration, team workspaces — and for nothing else. **The editor does not
change when you are signed out**, and no feature that is free today will move
behind an account. If you never sign in, none of it applies to you.

When a feature sends something to a third party, it will do so **only on an
action you take**, the provider will be named in the
[sub-processors list](https://legal.ripplefx.app/subprocessors/) before the
feature ships rather than after, and what is sent will not be used to train
anybody's models.

## The documents

- [Privacy Notice](https://legal.ripplefx.app/privacy/) — the formal account
- [End-User Licence Agreement](https://legal.ripplefx.app/eula/) — the app
- [Terms of Service](https://legal.ripplefx.app/terms/) — the site and the
  service
- [Sub-processors](https://legal.ripplefx.app/subprocessors/) — who else
  touches it

Questions about any of it:
[legal@ripplefx.app](mailto:legal@ripplefx.app).
