---
title: Open source underneath
description: The app is proprietary; the packages it stands on, and the one being built for it, are not. Which ones, whose they are, and where to find them.
sidebar:
  order: 3
---

Ripple Effect is [proprietary](/about/licensing/) and its source is not
published. Several of the packages it is built on are open source, and four of
them are ours: the node editor, the docking layout the workspace is drawn
with, the reading-time estimate and the crash reporter. This page is the distinction, kept straight: **the packages are
open, the app is not.**

## fl_nodes_v2 — the node editor

[github.com/ConnectingTheDots-DCWK/fl_nodes_v2](https://github.com/ConnectingTheDots-DCWK/fl_nodes_v2) · MIT

The canvas. Geometry, wiring, selection, undo, the execution model — control
pushed, data pulled — and the minimap. It knows nothing about narrative: a
node is whatever the host says a node is, and Ripple Effect is one host.
Everything in the [boards overview](/overviews/boards-and-nodes/) about how a
card behaves on the canvas is this package behaving, which is why a
contribution there reaches Ripple Effect and every other app built on it.

It is a Flutter package, published on its own, and it takes pull requests.

## fl_panel — the docking layout

[github.com/ConnectingTheDots-DCWK/fl_panel](https://github.com/ConnectingTheDots-DCWK/fl_panel) · MIT

A tree of splits, single panels and tab groups that the user resizes, docks
and rearranges — tear a tab out of its strip, drop a panel beside another,
get the same layout back tomorrow — with ordinary Flutter widgets inside
every panel and nothing about files or documents in it: a tab is a name the
host resolves. What may go where is answered by the tabs themselves and by a
policy the host writes, so an application can say that its tool panels only
share a strip with tool panels.

**It is what the [workspace](/overviews/the-workspace/) is drawn with.**
The project page is one docking area over this package: the documents are
tabs and splits you drag out, drop beside one another and resize, and the
layout is kept per project in `.ripple/workspace.json`. The package went
public first so that it was built in the open rather than around one
application's shape. Its tree, solver and file format import nothing from
Flutter, so a layout can be built, edited and saved headless.
The [post that introduces it](https://ripplefx.app/blog/docking-is-a-tree-and-a-tab-is-a-name)
says why the tree is the shape it is.

It is a Flutter package, published on its own, and it takes pull requests.

## dart_read_time — how long a passage takes to read

[github.com/ConnectingTheDots-DCWK/dart_read_time](https://github.com/ConnectingTheDots-DCWK/dart_read_time) · MIT

The estimate under every passage: fifty-four languages, mixed scripts counted
a run at a time, and an honest word about whether the figure for a language
is measured or reasoned. Pure Dart, no Flutter in it, so a browser or a
command line can use it too. The [passages
overview](/overviews/passages-and-languages/) says what the row under the
editor does with it.

## fl_crashpad — native crash reports

[github.com/ConnectingTheDots-DCWK/fl_crashpad](https://github.com/ConnectingTheDots-DCWK/fl_crashpad) · MIT

Native crash reporting for Flutter over Google Crashpad, on desktop, Android
and iOS. It knows nothing about any app, logger or backend. In Ripple Effect it
catches a native crash; the next launch offers you the newest report, and it
is sent only if you say yes. Every report is sanitised before it can be read
or sent. The [updates, logs and support
overview](/overviews/updates-logs-and-support/) covers what the app does with
what it keeps.

It is a Flutter package, published on its own, and it takes pull requests.

## monty — Python, in a sandbox

[github.com/pydantic/monty](https://github.com/pydantic/monty) · MIT

**Not ours.** `monty` is a sandboxed Python interpreter written in Rust by
the pydantic team, and it is how a Script node, a `{{ … }}` span in a passage
and the console run Python at all. Earlier releases reached it through
[`dart_monty`](https://pub.dev/packages/dart_monty), written and maintained
by [runyaga](https://github.com/runyaga), someone we know, which handed Dart a
way to run a snippet with a time limit; it was instrumental in making
Ripple Effect what it is. As of 1.5 the native engine links the interpreter
directly, and a runaway script is stopped at its deadline.

The interpreter is a subset of Python — no filesystem, no network, no
`class`, and a standard library that is a short list — which is exactly what
makes it safe to run a stranger's story. The [Python
overview](/overviews/python-scripting/) says how to find out what the sandbox
allows on the day you ask, and the [reference](/reference/python/) lists what
the app binds into it.

## Everything else

The complete list of third-party components and their licences is in the
application, under **Settings → About → Third-party licences**. Each is governed by its
own licence, which the app's does not touch.
