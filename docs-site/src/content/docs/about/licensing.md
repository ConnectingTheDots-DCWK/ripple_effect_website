---
title: Licensing
description: The licences that govern the app, the engine and the hosted service, what each permits and forbids, and where each document is published.
sidebar:
  order: 1
---

Ripple Effect is **proprietary software**. It is not open source, and its source is not published.

The licence for the app is the **End-User Licence Agreement** (EULA), published at [legal.ripplefx.app/eula](https://legal.ripplefx.app/eula/). That document is the authority; this page states it in plain words, and where the two differ the document is right.

## Documents

| Document | Governs | Address |
| --- | --- | --- |
| End-User Licence Agreement | The app | [legal.ripplefx.app/eula](https://legal.ripplefx.app/eula/) |
| Runtime Licence | The engine, published on its own | [legal.ripplefx.app/runtime](https://legal.ripplefx.app/runtime/) |
| Terms of Service | The website and the hosted service | [legal.ripplefx.app/terms](https://legal.ripplefx.app/terms/) |
| Privacy Notice | What is processed, on what basis, for how long | [legal.ripplefx.app/privacy](https://legal.ripplefx.app/privacy/) |
| Sub-processors | Who else touches it | [legal.ripplefx.app/subprocessors](https://legal.ripplefx.app/subprocessors/) |
| Ripple Effect Licence 1.0 | Builds earlier than 1.5 | [legal.ripplefx.app/v/ripple-effect-licence-1.0](https://legal.ripplefx.app/v/ripple-effect-licence-1.0/) |

## Which licence governs a build

| Build | Governing licence |
| --- | --- |
| Earlier than 1.5 | The short Ripple Effect Licence that shipped with it, for as long as you use it. 1.4 was the last release that did not ask you to accept anything. The notice stays published, unchanged. |
| 1.5 and later | The EULA, from the first build that asks you to accept it. It replaces the earlier licence rather than sitting on top of it. Everything the earlier licence permitted, the EULA permits. |

## Acceptance at first launch

| Item | Behaviour |
| --- | --- |
| Agreement | Shown at first launch. |
| Network requests | None of any kind, including an update check, until you accept. |
| Mechanism | The app underneath is not started until you answer. |
| Privacy Notice | Shown alongside the Agreement, to read rather than to accept. |

## The EULA

### What it permits

| Item | Provision |
| --- | --- |
| Use | Install and run the official builds on machines you own or control, for any purpose, personal or commercial. |
| Cost | Free. |
| Seats, keys, activation | No seat count, no licence key, no activation. |
| Account | None required. Signing in is optional and only for the hosted service. |

An account exists only for the hosted service, which is a separate thing under the [Terms of Service](https://legal.ripplefx.app/terms/). If you never create one, those terms never apply to you, and nothing in the app requires you to.

### What stays yours

Article 3 of the EULA:

> Stories, projects, boards, components, scripts and exports you author with it are yours, and nothing in this licence claims any interest in them.

| Item | Provision |
| --- | --- |
| Interest in your work | The app claims none. |
| Selling or publishing | Permitted, with no obligation back. |
| Origin of the wording | Carried word for word from the licence the EULA replaced. |
| Survival | Article 3 survives termination of the agreement, for any reason. |
| Checkable | The formats are plain text: a project is a folder of Markdown and JSON that opens without the app. |

### What is not permitted

Without prior written permission you may not:

- copy, redistribute, sell, sublicense, rent or host the software;
- modify, translate or create derivative works from it;
- reverse engineer, decompile or disassemble it, except to the extent that law expressly permits despite this term;
- remove or alter any notice of copyright, authorship or licence it carries.

### Source code

| Item | Position |
| --- | --- |
| Source | Not published. |
| Access | Where granted, granted separately and in writing, and carries no rights beyond those stated in that grant. |
| Pull requests against the app | Not open. |

### Third-party components

Ripple Effect is built on software written by other people, each under its own licence. Those licences govern those components and are unaffected by the EULA. The complete list is in the application, under **About → Third-party licences**.

### No warranty

The software is provided as is, without warranty of any kind. To the fullest extent permitted by law the author is not liable for any claim, damages or other liability arising from the software or its use, including loss of or damage to any data, project or document. The agreement states this at length. Nothing in it limits anyone's rights as a consumer; the agreement says so in its own consumer-protection article. [Version control](/reference/version-control/) is built into the app.

### Termination

| Case | Effect |
| --- | --- |
| Breach that can be put right | The agreement ends automatically after thirty days' notice. |
| Breach that cannot | The agreement ends immediately. |
| On termination | You must stop using the software and remove your copies of it. Your work is unaffected. |

### Changes to the agreement

| Kind of version | Effect |
| --- | --- |
| Minor | Changes the wording without changing the terms. Applies when published. |
| Major | Changes the terms. You are told in the app and on the website, and asked to accept it no sooner than thirty days after that. Until you do, the version you accepted governs you. |

- The licence carries no effective date. It takes effect for your installation when you accept it. Nothing about a release of the app is scheduled around a date on a document.
- A new feature is not a new version. The licence covers Ripple Effect including every component shipped with it, so a part of the app that did not exist when you accepted the agreement is already covered. A new version follows a change to what the agreement says: what you may do, what is owed to you, who is liable for what.
- A version nobody has accepted yet can still be corrected. Once a version has been accepted, or published as final, the text at its own address never changes, and the version you accepted is never altered.
- Every version that has ever been in force stays published at its own permanent address.

## The Runtime Licence

The engine that plays a story is published on its own, as native libraries, command-line tools and WebAssembly components, so that a game, a story player or another tool can play campaigns made here. It is under the [Runtime Licence](https://legal.ripplefx.app/runtime/), not the EULA, because the EULA forbids what an integrator needs to do: ship it to other people.

| Term | Provision |
| --- | --- |
| Cost | Free and royalty-free, for any product, commercial or not. No fee, no revenue threshold, no registration. |
| Redistribution | Unmodified in function, as part of your product, not on its own. Signing it, stripping its symbols, wrapping it in a framework or transpiling its WebAssembly is permitted. Changing what it does, or passing it off as your own, is not. |
| Credit | Its `NOTICE` text, wherever your product lists the third-party software it uses. No logo, no splash screen. |
| Your users | Get no more than you have. The `NOTICE` says so, which is enough for a product shipped with no terms. If your product has terms, they must not contradict it; the licence's annex has a clause you can paste. |
| Versions | A version of the licence stays with the releases it came with. A product shipped with one engine release is never re-licensed; a later licence governs later releases only. |
| Bindings | A library that calls the engine from another language can be under any licence, an open-source one included; the engine's own bindings are MIT. The engine it carries stays under the Runtime Licence. |
| Replacement | Not permitted: no engine, runtime or authoring tool that plays or writes the same campaigns, built with the engine, its documentation or its test material. |

## Open-source packages

Several packages underneath the app are separate projects with their own repositories, published under the MIT licence, most of them written by the author, one not. They are named on the [open source page](/about/open-source/). The packages are open source; the app is not.

## The hosted service and the paid tier

The hosted service is governed by the [Terms of Service](https://legal.ripplefx.app/terms/).

A paid tier is planned: media storage, real-time collaboration and team workspaces, reached by signing in. The Terms exist now and describe it in advance; Part B applies from the release that introduces each feature. The Terms state that no feature that is free in the application on the date they take effect will be moved behind an account or a subscription.

## Contact

Licensing, redistribution or a source grant: [legal@ripplefx.app](mailto:legal@ripplefx.app).

Copyright © 2026 ConnectingTheDots, a trade name of William Karol Di Cioccio, VAT IT02224180667. All rights reserved.

## Related

- [Open source](/about/open-source/): which packages are published, and under what.
- [Updates, logs and Messages](/explanation/updates-logs-and-privacy/): the privacy side of what the app keeps and sends.
- [What the app sends](/about/what-the-app-sends/): every request the app makes.
- [Version control in the app](/reference/version-control/): the built-in history.
- [A project is a folder](/explanation/projects-are-folders/): why your work opens without the app.
