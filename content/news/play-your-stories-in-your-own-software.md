---
title: Play your stories in your own software
description: The engine that plays Ripple Effect campaigns now has bindings for JavaScript and TypeScript, C and C++, C# and Dart.
date: 2026-10-19
banner: gradient #15171c #4a5868
---

A campaign you export from Ripple Effect is played by the same engine as the
editor's **Play** button. That engine can now go into other software: a game,
an app, a web page or a tool of your own. There is a binding for each of four
languages:

- **JavaScript and TypeScript**: `@ripplefx/player` on npm, for a web page or
  Node. `@ripplefx/soundscape` plays the story's sound in the browser.
- **C and C++**: for native games and engines.
- **C#**: `RippleFx.Engine` on NuGet, for .NET apps and games.
- **Dart**: `ripplefx_engine` on pub.dev, for Flutter apps, Flame games and
  Dart programs, natively and on the web.

## What you get

- **The story as the author wrote it**: passages and choices, forms, timed
  waits, variables, entities, state machines, and Python scripts where the
  campaign has them.
- **Sound that follows the story.** The engine decides which soundscape plays,
  when it fades and when a sound effect is cued. Your program plays the files
  through whatever audio it already uses.
- **The author's callbacks**, so the story can tell your game when something
  happens in it.
- **Saves the player can resume.**
- **One engine everywhere**: desktop, phones and the web, with the same API in
  every language.

The bindings are MIT-licensed. The engine they carry is free to ship as part
of your product, under the [Runtime Licence](https://legal.ripplefx.app/runtime/).

## What comes next

Bindings for more languages are planned. So are direct integrations with
third-party software, such as game engines. Both are coming in the near
future.

## Where to start

[Embedding the engine](https://docs.ripplefx.app/explanation/embedding-the-engine/)
explains how a program plays a story, whatever its language. Each binding then
has a reference page:

- [JavaScript and TypeScript](https://docs.ripplefx.app/reference/binding-javascript/)
- [C and C++](https://docs.ripplefx.app/reference/binding-c-cpp/)
- [C#](https://docs.ripplefx.app/reference/binding-csharp/)
- [Dart](https://docs.ripplefx.app/reference/binding-dart/)
