---
title: Open source
description: Ripple Effect is proprietary, but several packages it stands on are open source, four of them ours, and this page explains which, why, and whose the rest is.
---

Ripple Effect is [proprietary](/about/licensing/) and its source is not published. Several of the packages it is built on are open source, and four of them are ours: the node editor, the docking layout the workspace is drawn with, the reading-time estimate and the crash reporter. The distinction is worth keeping straight, because the two halves are easy to blur: **the packages are open, the app is not.** The four are published on their own and take pull requests. `fl_nodes_v2`, `fl_panel` and `fl_crashpad` are Flutter packages and need Flutter; `dart_read_time` is pure Dart.

## fl_nodes_v2: the node editor

[github.com/ConnectingTheDots-DCWK/fl_nodes_v2](https://github.com/ConnectingTheDots-DCWK/fl_nodes_v2) · MIT

This is the canvas: geometry, wiring, selection, undo, the execution model (control pushed, data pulled) and the minimap. It knows nothing about narrative. A node is whatever the host says a node is, and Ripple Effect is one host. Everything about how a card behaves on the canvas, described in [Boards, nodes and macros](/explanation/boards-nodes-and-macros/), is this package behaving, and a contribution there reaches Ripple Effect and every other application built on it.

## fl_panel: the docking layout

[github.com/ConnectingTheDots-DCWK/fl_panel](https://github.com/ConnectingTheDots-DCWK/fl_panel) · MIT

This is a tree of splits, single panels and tab groups that you resize, dock and rearrange. You can tear a tab out of its strip, drop a panel beside another and get the same layout back tomorrow. Every panel holds ordinary Flutter widgets, and nothing about files or documents is in the package: a tab is a name the host resolves. What may go where is answered by the tabs themselves and by a policy the host writes, so an application can say that its tool panels only share a strip with tool panels.

It is what the [workspace](/reference/workspace-window/) is drawn with. The project page is one docking area over this package: the documents are tabs and splits, and the layout is kept per project in `.ripple/workspace.json`. The package went public first so that it was built in the open rather than around one application's shape. Its tree, solver and file format import nothing from Flutter, so a layout can be built, edited and saved headless. The [post that introduces it](https://ripplefx.app/blog/docking-is-a-tree-and-a-tab-is-a-name) says why the tree is the shape it is.

## dart_read_time: how long a passage takes to read

[github.com/ConnectingTheDots-DCWK/dart_read_time](https://github.com/ConnectingTheDots-DCWK/dart_read_time) · MIT

This is the estimate under every passage: fifty-four languages, mixed scripts counted a run at a time, and an honest word about whether the figure for a language is measured or reasoned. It is pure Dart with no Flutter in it, so a browser or a command line can use it too. [Passages, choices, languages and reading time](/reference/passages/) says what the row under the editor does with it.

## fl_crashpad: native crash reports

[github.com/ConnectingTheDots-DCWK/fl_crashpad](https://github.com/ConnectingTheDots-DCWK/fl_crashpad) · MIT

This is native crash reporting for Flutter over Google Crashpad, on desktop, Android and iOS. It knows nothing about any app, logger or backend. In Ripple Effect it catches a native crash; every report is sanitised before it can be read or sent. [Updates, logs and Messages](/explanation/updates-logs-and-privacy/) covers what the app does with a report.

## monty: Python, in a sandbox

[github.com/pydantic/monty](https://github.com/pydantic/monty) · MIT

**Not ours.** `monty` is a sandboxed Python interpreter written in Rust by the pydantic team, and it is how a Script node, a `{{ … }}` span in a passage and the console run Python at all. Our thanks to [runyaga](https://github.com/runyaga), whose [`dart_monty`](https://pub.dev/packages/dart_monty) first brought the interpreter to Dart. The engine links the interpreter directly, and a runaway script is stopped at its deadline.

The interpreter is a subset of Python: no filesystem, no network, no `class`, and a standard library that is a short list. That restriction is what makes it safe to run a stranger's story. [Python in a story](/explanation/python-in-a-story/) explains the trade, [The sandbox and its limits](/reference/python/sandbox/) says what it allows, and the [Python reference](/reference/python/) lists what the app binds into it.

## Everything else

The complete list of third-party components and their licences is in the application, under **Settings → About → Third-party licences**. Each is governed by its own licence, which the app's does not touch.

## Related

- [Licensing](/about/licensing/): the terms the app itself is under.
- [The workspace window, menus and palette](/reference/workspace-window/): what the docking layout looks like in use.
- [Python in a story](/explanation/python-in-a-story/): why scripts run in a sandbox.
- [A project is a folder](/explanation/projects-are-folders/): where `.ripple/workspace.json` sits.
- [The sandbox and its limits](/reference/python/sandbox/): what a script may do.
- [What the app sends](/about/what-the-app-sends/): what leaves the machine, including crash reports.
