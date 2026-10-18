---
title: How the engine ships
description: What a binding puts into your build, where it comes from, how it is checked, why there are two variants of every build, and why only the web has a ready-made speaker.
---

Adding a binding to your program adds two things: the binding's own code, in your language and under the MIT licence, and a **build of the engine**, which is where every rule of a story runs. The second is a compiled library or a WebAssembly module that you ship inside your product. This page is about that half: where it comes from, how it gets into your build, which build you get, and what you agree to by shipping it.

## The engine is released on its own

The engine is not built by the bindings. It is built from its own source, which is not published, and every release is put up as binaries in a public repository, [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases), under a tag `engine-v<version>`. A release holds:

- an archive per platform and per variant (below);
- a **manifest** listing every archive with its size and SHA-256 digest, **signed** with Ed25519, and a `SHA256SUMS` file beside it;
- the **conformance fixtures**, the small campaigns every binding plays through its own API to prove it is the engine.

A published archive is never replaced. A release that turns out wrong is superseded by the next patch rather than edited, so a digest you pinned keeps meaning the same bytes.

## A version number is a contract

The first two parts of a version, `1.5`, name a **contract**: the campaign format, the formats the editor writes, the engine's interfaces and the fixtures, frozen together and given a codename (1.5 is *Multiclassing*). The editor, the engine and every binding count their own third part within it. So `@ripplefx/player` 1.5.0, the C# packages 1.5.0 and an engine 1.5.4 all speak the same contract, and a binding's patch is its own fix, not the engine's.

What that buys you is a short rule. **A binding of contract 1.5 plays any campaign exported by an editor of contract 1.5**, and those of the earlier contracts the engine still reads (1.3 and 1.4, for engine 1.5). A campaign from a newer editor is refused at open, with a sentence saying which version made it and to update. An engine patch within a contract keeps every interface a binding compiled against, which is why a binding can move to a newer engine patch without changing its own API.

## Three ways in: a C library, a component, and Emscripten

The engine is written in Rust and is reached from outside in one of three forms, all built from one description of its interface:

- **A C library**, for every native platform. A header, a shared library and a static one, with a list of the system libraries a static link needs. The C, C++, C# and native Dart bindings are all built on it. It is typed rather than a set of JSON calls, so a host does not need a JSON parser to play a story and never has to guess whether `7` is an integer.
- **A WebAssembly component**, for browsers and Node. The JavaScript binding and Dart's web backend transpile it with jco and run it in the page.
- **A static library for Emscripten**, for a program that compiles itself to the browser, such as a C++ engine built for the web. It is the C library again, built for the browser, and it needs Emscripten 4.0 or later.

Because the C surface and the WebAssembly one are generated from the same description, they cannot disagree. Every binding has the same records in the same order and the same failures, and [the API](/explanation/embedding-the-engine/) is one design rather than four.

## How a binding gets the engine into your build

**Every binding pins one engine release**: its version and the digest of every archive it uses, committed in the binding's repository. The manifest's signature is checked against the engine's public key when the pin is written, so a pin names a release the engine's maintainers signed. After that, **every download is checked against the pinned digest before anything is unpacked**, and a mismatch stops the build. What reaches your build is therefore exactly what was pinned.

How the archive arrives depends on what the language's tooling expects:

| Binding | How the engine arrives |
| --- | --- |
| C and C++ | CMake downloads the pinned archive for the platform you configure for, at configure time, and checks it. You can also point it at an archive you vendored. |
| C# | The engine is inside a NuGet package, as NuGet ships native code: one library per runtime identifier, picked by the build. |
| Dart | A build hook downloads the archive for the platform you build into a per-user cache, checks it, and bundles the library with your app. The web engine is inside the package. |
| JavaScript and TypeScript | The engine is inside the npm package, and a bundler copies it beside your page. The package's build also checks the manifest's signature, since thousands of other builds take an npm package on trust. |

The web is the one place the engine cannot be downloaded when the page needs it. GitHub's release downloads send no CORS headers, so a browser may not read them. That is why the web engine is shipped inside the package and served by your own site.

From then on, the engine travels with your product like any other native dependency: inside your installer, your app bundle, your APK or your page's assets.

## Two variants of every build

Every release builds every target twice: **`python`**, with the sandboxed Python interpreter that runs Script nodes and snippets in passages, and **`no-python`**, without it. The two have the same API, so switching is a build setting and not a code change. The `no-python` build is about half the size natively. On the web the difference is larger, about 1.36 MB over the wire against about 0.31 MB, because the interpreter is most of the module.

A campaign records in its manifest whether it needs Python. The engine treats that as information. **The bindings use it to refuse early**: a `no-python` build given a campaign that needs Python refuses it at open, with an error that names the reason, instead of letting it fail halfway through a story. How each binding picks its variant:

| Binding | The setting |
| --- | --- |
| C and C++ | A CMake option, chosen when you configure. |
| C# | Which engine package you reference: the one with Python, or the one without. |
| Dart | A user-define on the package in your pubspec for native builds, and a compile-time define on the web. |
| JavaScript and TypeScript | Chosen at load by default: the campaign's manifest says whether it needs Python, and only then is the larger module fetched. A page can insist on either. |

The author can guarantee a campaign for the smaller build. Exporting with **Needs no Python** stops the export if any part of the story runs Python, so a campaign that passes is one the `no-python` build will open. [What an export is](/explanation/what-an-export-is/) explains that check, and [How to export for a player without Python](/how-to/export-for-a-player-without-python/) is the steps.

## Where it runs

Natively, the engine is built for Windows, macOS and Linux on x64 and arm64, Android on arm64 and x86_64, and iOS on devices and the arm64 simulator, with nothing 32-bit. Each target has a floor: glibc 2.35 for Linux, macOS 12, iOS 13 and Android API 24. In a browser it runs as the component, or as the Emscripten library for a program built with Emscripten. Not every binding covers every target. .NET's own browser build, for example, uses an Emscripten older than the engine's floor, so C# does not run in a browser yet. [Engine platforms and variants](/reference/engine-targets/) has the full table.

## Why only the web has a ready-made speaker

Every binding ships the soundscape driver, the part that turns the engine's schedule into voices. None of them makes a sound except one: the JavaScript binding has a second, optional package, **`@ripplefx/soundscape`**, a speaker built on Web Audio.

The reason is that the browser is the one place with a single answer. **Every page has Web Audio**, and it is the same API in every current browser, so one speaker serves every page that will ever play a campaign. Making it well is real work: a music bed streams through a media element instead of being decoded whole, which would take about 23 MB a minute; a sound effect is decoded once, so it is never late; every gain goes through Web Audio, because iOS ignores a media element's own volume; and WebKit stalls a media element that is routed into Web Audio before it starts playing. That work is worth doing once for everyone. The package carries no engine, so it is plain MIT, and a page that would rather play sound its own way leaves it out.

Outside a browser there is no such answer. A C or C++ host might use miniaudio, SDL, FMOD, Wwise, XAudio, OpenAL or a game engine's own mixer. A C# host might use NAudio, OpenAL, FMOD, or Unity's or Godot's audio. A Dart app might use flame_audio, audioplayers, just_audio or SoLoud. They have nothing in common, each is a dependency bigger than the engine, and which one a game uses is the game's decision, usually made long before a story arrives. A speaker shipped with the binding would either drag in an audio stack you did not choose or sit unused beside the one you did. So those bindings ship the **speaker contract** instead: a small interface, the same in every language, that you implement over the audio you already have. The driver does everything else.

Dart is the edge case, since its web backend runs in a browser. It ships no speaker either, because one package serves native and web from the same API, and a Web Audio speaker would cover only half of its hosts. A Flutter web app writes one against the same contract, with `@ripplefx/soundscape` as the model.

## What you ship it under

The engine you build into your product is under the **[Runtime Licence](https://legal.ripplefx.app/runtime/)**, not the licence agreement the editor is under. It is free and royalty-free for any product. You redistribute it unmodified in function and as part of your product: signing it, stripping its symbols, wrapping it in a framework or transpiling the component are all fine, but changing what it does is not. Every archive carries a `NOTICE`, and you reproduce it wherever your product lists its third-party software. That notice also tells your users what they may do with the engine, so a product with no terms of its own needs nothing more. A version of the licence stays with the releases published while it was current, so a product you shipped is never re-licensed under you. [Licensing](/about/licensing/) has the terms in full.

## Related

- [Engine platforms and variants](/reference/engine-targets/): every target, its floor, what each archive holds and which binding ships it.
- [How to play a campaign in your own program](/how-to/play-a-campaign-in-your-program/): installing a binding and playing a story, in all four languages.
- [Embedding the engine](/explanation/embedding-the-engine/): the API every binding shares.
- [Licensing](/about/licensing/): the Runtime Licence next to the app's own terms.
