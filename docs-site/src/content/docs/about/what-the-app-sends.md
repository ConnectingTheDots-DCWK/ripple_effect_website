---
title: What the app sends
description: Every request that leaves your machine, what each carries, what never leaves, what a crash report contains, and what an account will and will not change.
sidebar:
  order: 3
---

Ripple Effect works on files on your own disk and needs no network to do it. This page lists what leaves your machine anyway. Some of it the app asks the website for without being told to (the update check, the engine fix check, the news and the contributor list with its avatars), one you have to switch on, one asked for every time, and one that is only ever something you did yourself.

From version 2.0 of the [End-User Licence Agreement](https://legal.ripplefx.app/eula/) the agreement does not list these one by one. It sets four rules every request has to keep: nothing before you accept; nothing you author and no identifier without your say; anything about you only if you switch it on or answer yes; and nobody but us reached unless the agreement names them. A request carrying nothing about you, made only to `ripplefx.app` or a subdomain, is allowed as a kind. The [Privacy Notice](https://legal.ripplefx.app/privacy/) is still the complete list, and says each new one before the release that makes it.

The [Privacy Notice](https://legal.ripplefx.app/privacy/) is the formal version, with legal bases and retention periods. This page states the same facts.

## Summary

| Request | Destination | When | Switch | Carries anything of yours |
| --- | --- | --- | --- | --- |
| [Update check](#update-check) | `ripplefx.app` | Once per launch | None | No |
| [Engine fix check](#engine-fix-check) | `ripplefx.app` | Once per launch, half a minute after start | Settings ▸ Updates | No |
| [News](#news) | `ripplefx.app`, and pictures from `ripplefx.app` or a subdomain only | Once per launch, from 1.5.1, once you have accepted EULA 2.0 | Settings ▸ Updates | No |
| [Contributor list and avatars](#contributor-list-and-avatars) | `ripplefx.app` for the list, `avatars.githubusercontent.com` for the images | When the About box opens | None | No |
| [Usage statistics](#usage-statistics) | Ripple Effect's hosted backend | At most one row a day, after an hour on | Settings ▸ Data control, off until you switch it on | No |
| [Crash report](#crash-report) | Ripple Effect's hosted backend | Only when you press *Send report* | Asked once per crash | It can |
| [Dictation model download](#requests-you-cause) | `huggingface.co`, and the storage it redirects to | Only when you press *Download* or *Resume*, or said yes to it at first launch | None: made only when you ask, under Settings ▸ General ▸ *Dictation* | No |
| [Your own actions](#requests-you-cause) | Where you point them | When you act | n/a | Depends |

## Before the licence is accepted

From version 1.5 the app asks you to accept the [End-User Licence Agreement](https://legal.ripplefx.app/eula/) at first launch and makes no network request of any kind until you have: not an update check, not anything. If you close that window, nothing has been sent.

A copy that accepted version 1.0 is shown version 2.0 on its first launch of 1.5.1, may accept it then or choose **Not now**, and is required to accept it no sooner than thirty days later. Until then 1.0 governs it, and it makes only the requests 1.0 lists.

Until you answer, the app underneath has not been built, so there is nothing there to make a request.

## Update check

| Field | Detail |
| --- | --- |
| Destination | `ripplefx.app` |
| Frequency | Once per launch |
| Question | What is the most recent release on each release channel? The answer lists Stable and Preview both, and the app picks the one for the channel you follow and compares it with its own version on your machine. |
| Carries | No identifier, no version number, not which release channel you follow, and nothing about you. |
| Server sees | The address the request came from, as with any request over the internet. |
| Distinguishes installations | No. Nothing in the request is unique to one. |
| Switch | None. It carries nothing at all, and the agreement names it as the one request of its kind with no switch. |

## Engine fix check

| Field | Detail |
| --- | --- |
| Destination | `ripplefx.app` |
| Frequency | Once per launch, half a minute after the app has started |
| Question | Does a fix exist for the engine the app is running? |
| Carries | The engine's version, its milestone, your platform and an identifier of the interface between the app and its engine. Nothing about you. |
| A fix that exists | Downloaded, checked against our signature, and used from the next launch. It never changes what the app can do. |
| Switch | *Engine updates* under **Settings ▸ Updates**. *Use the bundled engine* there goes back to the engine that shipped with the app. |
| Safeguard | A fix is set aside automatically if the app crashes with it. |

## News

| Field | Detail |
| --- | --- |
| Destination | `ripplefx.app`, which serves the feed at `get.ripplefx.app/news/feed.xml` |
| Availability | From version 1.5.1, and only once you have accepted version 2.0 of the licence agreement. A copy that accepted 1.0 asks nothing until then. |
| Frequency | Once per launch. If it fails, the next launch tries again; nothing retries in between. |
| Question | What is the current news? |
| Carries | No identifier, no version number, no cookie and nothing about you. No conditional header either, so the site cannot tell what your copy saw last time. |
| Pictures | Fetched from `ripplefx.app` or one of its subdomains, and from nowhere else. A picture an item points at anywhere else is not fetched. |
| What you have read | Recorded on your machine only, as the date of the newest item you opened. Never sent. |
| Switch | *News* under **Settings ▸ Updates**. Off, nothing is fetched and the News button is hidden. |

## Contributor list and avatars

| Field | List | Avatars |
| --- | --- | --- |
| Trigger | Opening the About box | Opening the About box |
| Destination | `ripplefx.app` | `avatars.githubusercontent.com`, from your machine and not through the site |
| Carries | The app's name and version, nothing else about you | A request for each image; GitHub sees the address it came from, as any image host would |
| Notes | The site fetches the list from GitHub on its own behalf and keeps it for an hour, so your request does not reach GitHub. | One of the avatar addresses is built into the app, so the request is made even when the list itself cannot be fetched. |

GitHub is named in the [sub-processors list](https://legal.ripplefx.app/subprocessors/) as an independent controller for requests made to it.

## Usage statistics

| Field | Detail |
| --- | --- |
| Destination | Ripple Effect's hosted backend |
| Availability | From version 1.5. |
| Default | Off. Opt-in. |
| Asked | Once, with the complete list of what would be sent in front of the question rather than behind a link. Neither answer is preselected. |
| Where to change it | **Settings ▸ Data control**, where the same list stays in front of you. |
| Frequency | At most one row a day. Nothing at all until the statistics have been on for an hour, so switching them on and straight off again sends nothing. |
| Adding to the list | Asks again. |
| Never included | Any text you wrote; anything about your projects; anything about what you did in them. |

### What a row carries

| Field | Content |
| --- | --- |
| Use | Whether the app was in use on the given day |
| Day | The day |
| Identifier | A random identifier for the installation |
| Version | The app's version |
| System | Your operating system's family |

### The identifier

| State | Behaviour |
| --- | --- |
| On | The app holds a random identifier it made when you switched statistics on, shown in the same settings row. The data is pseudonymous: while the identifier exists you can quote it to us and have the rows deleted. |
| Turned off | The identifier is destroyed. Collection stops and the only link between you and what was already sent is severed. Nobody can then connect those rows to you, including us, so there is nothing left to delete and nothing we could hand back if you asked. |
| Turned on again | A new identifier is made. You are a new installation and nothing joins the two. |

## Crash report

The only thing the app sends that can contain anything of yours, and the only one that asks. It goes to Ripple Effect's hosted backend.

### How it asks

| Step | Behaviour |
| --- | --- |
| The app crashes | It saves a report on your machine and sends nothing. |
| Next start | A window says the app crashed. It lists every file it would send with its size and a sentence about what is in it, shows a report id to quote if you later want a sent report deleted, and offers *Show files* so you can open them. |
| Your answer | The report goes only if you press *Send report*. |
| Declined | The report stays on your machine and is never offered again. |

There is no setting: no "always send", no "never send". The question is asked once per crash, at the moment you can see what it is about, and your answer is final for that report.

### What a report contains

| Item | Content |
| --- | --- |
| Memory snapshot | The app at the moment it crashed: what each part of it was running, the libraries it had loaded, and small pieces of memory around them. |
| Diagnostic files | The crashed run's session record and logs, each cut to its last 2 MiB. The window tells you when one was cut. |
| Manifest | A short file naming the files, the version that sent them and when the crash happened. |
| Labels | The app's version; whether you were on the home screen or inside a project, never which project; an id tying the snapshot to its own logs. |

### Masking

Before the window opens, the following are replaced throughout:

- your username and home folder
- the folder of every project the app knows about
- e-mail addresses
- network addresses
- anything shaped like a password or a key

:::caution[What masking cannot promise]
A memory snapshot may hold fragments of whatever text the app was working on. No automatic rule can know that a passage you wrote is private. The window says this too.
:::

### Identity

There is no account and nothing in a report names you. It does carry a random number the crash reporter made for your installation, so that crashes from one computer can be told apart from crashes from different ones. The number is not derived from your hardware or anything about you and is used for nothing else. If you never send a report it never leaves your machine.

## Requests you cause

These are yours rather than the app's, and are listed because they put bytes on the wire.

| Action | What happens |
| --- | --- |
| Version-control push | Goes to the repository you configured, with credentials you supplied. The credentials live in your operating system's own credential store and never in a file of ours. |
| Opening a documentation or support page | Hands a URL to your browser. From version 1.5 it goes through a redirect on `ripplefx.app`, which sees the request and nothing else. What your browser does next is between you and wherever it went. |
| Image in a document, referenced by `http` or `https` | Drawing the document fetches the image from whoever hosts it, and that host sees the request. The app does not ask before making it, and an image small enough to be invisible is still a request. This includes a project somebody sent you, whose documents you did not write. |
| Image in the project folder | Read from your disk. No network is involved. |
| Downloading a dictation model | From version 1.6. Pressing *Download* or *Resume* under **Settings ▸ General ▸ Dictation**, or answering yes to dictation at first launch, fetches the model's files from `huggingface.co` at a fixed address, following the redirect to where Hugging Face stores them. Each request asks for one file, and a resumed one asks from where the last stopped; it carries nothing about you or your projects. Hugging Face sees the address the request came from. Nothing is fetched until you ask, and nothing is fetched again once the model is on your computer. |

## What never leaves

| Item | Detail |
| --- | --- |
| Your work | Passages, boards, projects, components, scripts and exports are not sent anywhere. There is no background sync. |
| Spelling and grammar | Checked on your machine, as you type. Your words, the project's dictionary and its style rules are not sent anywhere. |
| The clock and the location | From version 1.6, a story you allowed may read the date and time or where your computer is. The location comes from your operating system's own location service, to about the nearest town, and the app makes no request of its own for it: it is not turned into a place name. What a story reads is not sent to us. A story an agent plays is never told the location. |
| Dictation | Heard on your machine, by the model you downloaded. The sound from the microphone and the words heard in it are not sent anywhere, and neither is written to the session log. |
| What you do in the app | Which boards you open, how long you spend and what you click are not recorded or sent, with or without statistics switched on. The statistics say that the app was used on a day, and nothing about how. |
| The session log | Not sent, unless it goes inside a crash report you sent. It is written on your machine, with private things replaced as they are written, and a run where nothing went wrong is deleted the next time you start the app. |
| Network responses | The update check, the news, the contributor list and an installer download each leave a line in the session log saying where the request went, what came back and how long it took. The address is recorded without anything after the `?`, and no response content is written. |

## What is planned

An account for the hosted service, and any feature that sends something to a third party, are covered by the [Terms of Service](https://legal.ripplefx.app/terms/) and the [sub-processors list](https://legal.ripplefx.app/subprocessors/), which name a provider before a feature ships.

| Topic | Terms |
| --- | --- |
| What an account is for | The hosted service: media storage, real-time collaboration and team workspaces. Nothing else. |
| Signed out | The editor does not change. No feature that is free today will move behind an account. If you never sign in, none of it applies to you. |
| A feature that sends something to a third party | It does so only on an action you take. The provider is named in the sub-processors list before the feature ships. What is sent is not used to train anybody's models. |

## The documents

| Document | Covers |
| --- | --- |
| [Privacy Notice](https://legal.ripplefx.app/privacy/) | The formal account |
| [End-User Licence Agreement](https://legal.ripplefx.app/eula/) | The app |
| [Terms of Service](https://legal.ripplefx.app/terms/) | The site and the service |
| [Sub-processors](https://legal.ripplefx.app/subprocessors/) | Who else touches it |

Questions: [legal@ripplefx.app](mailto:legal@ripplefx.app).

## Related

- [Updates, logs and Messages](/explanation/updates-logs-and-privacy/)
- [The session log and reports](/reference/session-log/)
- [Settings, accessibility and updates controls](/reference/settings/)
- [How to report a bug](/how-to/report-a-bug/)
