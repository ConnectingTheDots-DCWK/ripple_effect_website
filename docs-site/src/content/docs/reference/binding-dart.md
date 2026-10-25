---
title: Dart binding
description: The ripplefx_engine package for Dart, Flutter and Flame, native and web — installing it, choosing the variant, and every class, member, effect, record and exception it exports.
---

`ripplefx_engine` on [pub.dev](https://pub.dev/packages/ripplefx_engine), published by `connecting-the-dots.dev`, plays a compiled campaign from Dart: a command-line program, a server, a Flutter app or a [Flame](https://flame-engine.org) game. Natively it runs over `dart:ffi`, and on the web over `dart:js_interop`, with one API for both. Version 1.6.x binds Ripple Effect contract 1.6, *Grammar Lich*. The `PATCH` is the binding's own, and each version pins one engine release (1.6.0 pins engine 1.6.0). The source is public at [ConnectingTheDots-DCWK/ripple_effect_dart_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration). The package is MIT. The engine it loads is under the [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/), and its `NOTICE` must be reproduced wherever your product lists the third-party software it contains.

Everything below is exported from one library:

```dart
import 'package:ripplefx_engine/ripplefx_engine.dart';
```

## Packages and installing

```sh
dart pub add ripplefx_engine        # or: flutter pub add ripplefx_engine
```

| | |
| --- | --- |
| SDK floor | Dart 3.10 or Flutter 3.38, the first releases that run build hooks without an experiment flag. |
| Dependencies | `archive`, `code_assets`, `crypto`, `ffi`, `hooks`, `web`. Nothing else to install. |
| Native engine | Not in the package. The build hook brings it (below). |
| Web engine | In the package, under `lib/src/web/engine/`: the component's JavaScript glue and `.wasm` files for both variants, about 12 MB in all. A page downloads only the variant it loads. |

### The build hook

On a native platform, every build that runs hooks — `dart run`, `dart test`, `dart build cli`, any `flutter run` or `flutter build` — runs the package's `hook/build.dart`, which:

1. works out the engine target for the platform being built;
2. downloads that target's C archive of the pinned engine release, from `ripplefx.app/go/engine/…` and then from the [engine releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases/releases), into the hook's shared output directory;
3. checks its SHA-256 against the digest `engine.json` pins (taken from the release's signed manifest) before anything is unpacked;
4. hands the shared library to the SDK, which bundles it beside your program.

The download happens once per project and platform; later builds reuse it. A program built without the SDK's hooks, such as a plain `dart compile exe`, bundles no library, and the first call that needs the engine throws `EngineNotFoundException`.

A target with no engine build — 32-bit Android, a 32-bit desktop — gets no library and still builds; on such a device the first call throws `EngineNotFoundException`.

### User-defines

The hook reads user-defines from **your** pubspec, the one at the root of your workspace. It sees no environment variables, proxy settings included.

```yaml
hooks:
  user_defines:
    ripplefx_engine:
      python: false                              # the engine without Python
      engine_dir: third_party/ripple-engine/lib  # a library of your own
      engine_tree: ../ripple_effect              # an engine checkout: cargo builds it
```

| User-define | Value | Effect |
| --- | --- | --- |
| `python` | `true` (default) or `false` | Picks the variant. Any other value fails the build. |
| `engine_dir` | a directory | Uses the library in it as it is, with nothing checked: `libripple_effect_engine.so`, `libripple_effect_engine.dylib` or `ripple_effect_engine.dll`. Download `ripple-engine-c-<version>[-no-python]-<triple>.tar.gz` from the engine releases and point at its `lib/`. For a build with no network, behind a proxy, or a vendored library. |
| `engine_tree` | an engine checkout | Builds the engine with `cargo`, desktop targets only, and prints that the engine is UNVERIFIED. A phone build fails and names `engine_dir` instead. |

A relative path is relative to the pubspec that names it. `engine_dir` wins over `engine_tree`, and either replaces the download.

## Choosing the variant

Every engine release is two builds: **with Python**, the default, and **without**, about half the size, which plays every campaign exported with *Needs no Python*.

| Platform | How to choose the engine without Python |
| --- | --- |
| Native | `python: false` under `hooks: user_defines: ripplefx_engine:` in your pubspec. |
| Web | `--dart-define=RIPPLEFX_PYTHON=false` on the build or run command. No hook runs for the web. Without the define, a page loads the engine with Python. |

A campaign whose manifest `needs` names `python`, opened on the engine without Python, is refused at open with `NeedsPythonException`, on both backends. `RippleEngine.hasPython` and `Session.pythonAvailable` report which engine is loaded.

## Platforms

| Platform | Architectures | Floor | Notes |
| --- | --- | --- | --- |
| Windows | x64, arm64 | | `ripple_effect_engine.dll`, built against the dynamic CRT. |
| macOS | arm64, x64 | 12.0 | One library per architecture; a universal Flutter app takes both, wrapped in a framework with an `@rpath` install name. No entitlement needed. A plugin pod that keeps an older deployment target is pinned up in a `post_install` hook, as the example's `macos/Podfile` shows. |
| Linux | x64, arm64 | glibc 2.35 | No build for musl (Alpine). |
| Android | arm64, x86_64 | API 24 | Packed under `lib/arm64-v8a/` and `lib/x86_64/`. No 32-bit build: an APK that includes `armeabi-v7a` still builds, and throws `EngineNotFoundException` on a 32-bit device. `--target-platform android-arm64,android-x64` leaves that ABI out. |
| iOS | device (arm64), Apple-silicon simulator | 13.0 | Wrapped in a framework with an `@rpath` install name. No Intel simulator build. No entitlement needed. Xcode 15 and later require a simulator deployment target of 15.0 or more; set `IPHONEOS_DEPLOYMENT_TARGET` and pin older plugin pods in a `post_install` hook, as the example's `ios/Podfile` shows. |
| Web | dart2js, dart2wasm | | Flutter web (`flutter build web`, with or without `--wasm`) or any other Dart web app. |

The engine's own target list is in [Engine targets](/reference/engine-targets/).

### What differs on the web

| | Native | Web |
| --- | --- | --- |
| Backend | `dart:ffi` over the C ABI | `dart:js_interop` over the engine's WebAssembly component |
| Engine files | bundled by the build hook | Flutter web: `assets/packages/ripplefx_engine/…`, declared `platforms: [web]`, so no other build carries them. Other web builds: served from `packages/ripplefx_engine/src/web/engine/`. |
| `RippleEngine.load(base:)` | answers at once | fetches, compiles and instantiates the engine. `base` names another place the files are served from, such as a CDN: a URL holding `python/`, `no-python/`, `wasi.js` and `bridge.js`. Copy the package's `lib/src/web/engine/` folder there and call `load(base:)` before anything else. |
| Engine-level calls | work at once | `RippleEngine.version`, `contract`, `hasPython`, a `Mixer` made on its own and `Value.toStoryText` throw `EngineNotFoundException` until `load()` has been awaited. Opening a campaign awaits it. |
| `Campaign.openDirectory` | opens a folder | throws `UnsupportedError`. Use `Campaign.openFiles`. |
| `Campaign.mediaFile` | the file on disk, for a campaign opened from a folder | always `null` |
| A trap | poisons the handle it happened on | each campaign runs in an engine instance of its own, so a trap poisons that campaign and its sessions only |
| `RippleEngine.outstanding` | the engine's count | always `0` |
| A 64-bit Int | exact | exact under dart2wasm. Under dart2js an Int beyond ±2^53 rounds to the nearest double, and `Value.from(7.0)` is an Int; build a Float as `FloatValue(7.0)`. A story that counts past ±2^53 needs `--wasm`. |
| Content Security Policy | | must allow `script-src 'wasm-unsafe-eval'` and the engine's files from wherever they are served |

## The engine

`RippleEngine` is a class of static members.

| Member | Type | Meaning |
| --- | --- | --- |
| `boundContract` | `String` (const) | The contract these bindings bind, `'1.6'`. |
| `load({Uri? base})` | `Future<void>` | Loads the engine and checks it binds `boundContract`. A no-op natively; on the web the one await before the engine-level getters work. `base` is web-only. Throws `EngineNotFoundException`. |
| `ensureLoaded()` | `void` | Natively, loads the library and checks its contract, once; every handle's constructor calls it. On the web, checks that `load()` has been awaited. Throws `EngineNotFoundException`. |
| `version` | `String` | The loaded engine's version, such as `1.6.0`. |
| `contract` | `String` | The contract the loaded engine binds, such as `1.6`. |
| `hasPython` | `bool` | `false` for the engine without Python. |
| `outstanding` | `int` | How many things the engine handed out and has not had back. Zero whenever no call is in flight. Always `0` on the web. |

## Campaign

A bundle, opened. Immutable and shared by every session made from it. It may be disposed before its sessions, which go on working.

### Opening

| Factory | Answers | Notes |
| --- | --- | --- |
| `Campaign.openDirectory(String folder)` | `Future<Campaign>` | The folder that holds `campaign.json`. Files are read as the story asks for them, never from outside the folder. Native only; `UnsupportedError` on the web. |
| `Campaign.openFiles(Iterable<BundleFile> files)` | `Future<Campaign>` | Every file of the bundle, by its path inside it. The bytes are copied. For a Flutter app's assets, a packed archive, or the web. |

`BundleFile(String path, Uint8List bytes)` is one file held in memory, by its path inside the bundle (`campaign.json`, `boards/…`).

Opening throws `BundleException` for a malformed, missing or newer bundle, and `NeedsPythonException` on the engine without Python.

### Members

| Member | Type | Meaning |
| --- | --- | --- |
| `manifest` | `Manifest` | `campaign.json`, read afresh on every call. Keep it rather than ask again. |
| `board(int index)` | `Board` | A board, by index into `manifest.boards`. |
| `soundscape(int index)` | `Soundscape` | A soundscape, by index into `manifest.soundscapes`. |
| `boardWithId(String id)` | `int?` | A board's index by its id; `null` when there is none. |
| `node(int board, String id)` | `Node?` | A node of a board, for when a trace names one; `null` when there is none. |
| `validate()` | `List<BundleProblem>` | Everything wrong with the bundle the engine can see without playing it. Each `BundleProblem` has `message` and `location`. |
| `mediaPath(int index)` | `String?` | A medium's path inside the bundle; `null` when there is no such medium. |
| `mediaFile(int index)` | `String?` | A medium's file on disk, for a campaign opened from a folder; `null` otherwise, and always on the web. |
| `mediaBytes(int index)` | `Uint8List?` | A medium's bytes; `null` when there is no such medium (on the web, also when its bytes were not among the files opened). |
| `folder` | `String?` | The folder it was opened from; `null` for a bundle in memory, and always on the web. |
| `handle` | `Pointer<RippleCampaign>` natively, `JSObject` on the web | The engine's handle, for a call the binding does not wrap. Good while the campaign is neither disposed nor collected. |
| `dispose()` | `void` | Frees the campaign now. Anything else on it then throws `StateError`. A second call does nothing. |

### Manifest

| Field | Type | Meaning |
| --- | --- | --- |
| `format` | `int` | The bundle format. |
| `generator` | `String?` | What compiled the bundle. |
| `textFormat` | `String` | `markdown` or `html`: what every passage's text is written in. |
| `project` | `Project` | `title`, `description`, `defaultLocale`, `locales` (`List<String>`), `cover` (`String?`). |
| `entries` | `List<int>` | The boards a story may begin on, by index into `boards`. Usually `entries.first` is `SessionConfig.board`. |
| `boards`, `passages`, `components`, `scripts`, `media`, `machines`, `soundscapes` | `List<Entry>` | The bundle's tables. An `Entry` is `id`, `name`, `path`. |
| `cvars` | `List<Cvar>` | The console variables the campaign declares: `name`, `type` (`String`), `defaultValue` (`Value`). |
| `needs` | `List<String>` | What the campaign needs of its host: `python` when it runs scripts. |
| `permissions` | `List<String>` | What the story reads of the world outside it, by wire name, `dateTime` and `location` (`PermissionKind.wire`). The compiler lists them, and a session asks about each before the story begins. |

### Board and Node

| Record | Fields |
| --- | --- |
| `Board` | `id`, `name`, `start` (`int`), `prime` (`List<int>`), `nodes` (`List<Node>`) |
| `Node` | `id`, `type`, `title`, `inputs` and `outputs` (`List<Port>`), `data` and `metadata` (`Value`) |
| `Port` | `id`, `kind` (`PortKind.control` or `PortKind.data`), `edges` (`List<Edge>`) |
| `Edge` | `node` (`int`), `port` (`int`) |

## Session

One story being played. Every verb answers the effects it led to, in the order they are applied, the Turn last.

### Creating and resuming

| Factory | Notes |
| --- | --- |
| `Session.create(Campaign campaign, SessionConfig config)` | A new session, before its first turn. Call `start()` next. |
| `Session.resume(Campaign campaign, String save, {int seed = 0, SessionOptions? options})` | A session picking up a save — the JSON text `pause()` or `checkpoint()` answered — over the same campaign. Call `start()` next; it answers the turn the save was on. A save whose board or node the campaign no longer has throws `ResumeException`. |

### SessionConfig

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `board` | `int` | required | The board, by index into `manifest.boards`; usually `manifest.entries.first`. |
| `entryNode` | `String?` | `null` | A node to begin at instead of the board's start. |
| `locale` | `String?` | `null` | The language to read in; `null` for the default. A locale the campaign does not have is refused. |
| `seed` | `int` | `0` | The dice: the same seed and the same moves play the same story. |
| `digest` | `String?` | `null` | The bundle digest a save made from this session is stamped with. |
| `options` | `SessionOptions?` | `null` | `null` is `SessionOptions()`. |

### SessionOptions

`const SessionOptions()` is the engine's own budgets and policies. Change one with `copyWith(...)`, which takes every field as an optional named argument.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `stepBudget` | `int` | `1048576` | Steps a run may take before it is stopped; `0` stops on the first. |
| `silentJumpLimit` | `int` | `64` | Silent jumps between boards before the story is stopped. |
| `loopLimit` | `int` | `512` | Times a loop may go round; `0` is no ceiling. |
| `scriptDeadlineMs` | `int` | `2000` | How long a script may run. |
| `scriptMemoryBytes` | `int` | `67108864` | How much memory a script may use. |
| `scriptRecursionDepth` | `int` | `200` | How deep a script may recurse. |
| `untranslated` | `Untranslated` | `Untranslated.report` | `report`: a passage with no text in the locale says so in `Passage.untranslated`. `fallBack`: it shows the default locale's text. |
| `trace` | `bool` | `false` | Whether every batch carries the run's trace, as `Trace` effects. |
| `tracePayloads` | `bool` | `false` | Whether the trace carries the values that flowed, not only that they did. |

### Verbs

| Verb | Answers | Answers which Turn | Notes |
| --- | --- | --- | --- |
| `start()` | `List<Effect>` | any | Steps the story to its first turn, or, resumed, back to the turn it was saved on. While a kind in `manifest.permissions` has no answer, that turn is `Permit` and nothing else. |
| `choose(int index)` | `List<Effect>` | `Show` | The choice at `index` among `passage.choices`. A negative index throws `RangeError`. An unavailable choice throws `HostException` (`Code.choiceSpent`); an index past the end, `Code.noSuchChoice`. |
| `leave()` | `List<Effect>` | `Show` | The reader leaves the passage without choosing. |
| `answer(Map<String, Value>? fields)` | `List<Effect>` | `Ask` | The form's fields by name, in the order given; `null` leaves the form. An optional field left empty is left out; a field with `options` is answered with the picked `id`s, a `TextValue` or a `ListValue` of them. |
| `elapsed()` | `List<Effect>` | `Hold` | Answers a wait once your clock says it is over. |
| `beginCountdown()` | `List<Effect>` | `Show` | Your clock says the shown passage's countdown begins, its `ChoiceTimer.afterMs` after the passage was shown. Moves nothing: the batch is the callbacks an author aimed at it, and empty when there are none. `Code.noCountdown` on a passage with none. |
| `expire()` | `List<Effect>` | `Show` | Your clock says the countdown ran out: the passage's default is taken, as `choose` would take it, and the story runs to its next Turn. `Code.countdownNotBegun` before `beginCountdown`; `Code.noCountdown` on a passage with none. |
| `permit(PermissionKind kind, {required bool granted})` | `List<Effect>` | `Permit`, or before `start` | The reader's answer for one kind, at any time, before `start` included, which is how a host that already knows never shows the `Permit` turn. On that turn, the answer to the last kind unanswered begins the story. Answers are not saved: a resumed session asks again. |
| `setLocale(String locale)` | `List<Effect>` | any | Changes the language; the turn the story is on is answered again in it: a form re-worded with its names and ids kept, a passage with its countdown kept. |
| `restart()` | `List<Effect>` | any | Starts the story over from its first turn. |
| `stop()` | `List<Effect>` | any | Stops the story for good. |
| `pause()` | `Paused` | any | Puts the story down: `save` (`String?`, `null` when there is nothing to save) and `effects`. Pausing stops the story; resuming is a new session from the save. |
| `checkpoint()` | `String?` | | A save of the turn the story is on, without stopping it; `null` when there is nothing to save. |
| `writeCvar(String name, Value value)` | `CvarChange` | | Writes a console variable, coerced to its type. |
| `resetCvar(String name)` | `CvarChange` | | Puts a console variable back to its default. |
| `resetAllCvars()` | `List<Effect>` | | Puts every console variable back to its default. |
| `removeEntity(String key)` | `EntityRemoval` | | Removes an entity from the story: `removed` (`bool`) and `effects`. |
| `consoleFeed(String code)` | `ConsoleResult` | | Runs a line of Python in the story's interpreter, as the editor's console does: `result` (`PythonResult`) and `effects`. The engine without Python answers that it is unavailable. |

The readings a host hands in. None of them moves the story or answers effects:

| Member | Meaning |
| --- | --- |
| `setNow(Moment? now)` | What time it is; `null` for no clock. Before every verb that can step, by a host that granted `PermissionKind.dateTime`; within one verb time does not move. |
| `setPosition(Position? position)` | The host's last fix; `null` for none. A fix given before the answer is kept, and read only if it is yes. Throws `HostException` (`Code.notPermitted`) once the reader said no to `PermissionKind.location`. |
| `setStandIn(PermissionKind kind, String? typed, {int? localOffsetMinutes})` | The reader's stand-in for `kind`, as they typed it, told to the story whenever the real value is missing; `null` takes it away. A clock is ISO 8601, and one typed without an offset is read at `localOffsetMinutes`, this machine's zone on the date typed unless given. A position is `"lat, lon"`, or a place's name. One that does not read throws `HostException` (`Code.standIn`), its message saying why. |

| Type | Meaning |
| --- | --- |
| `PermissionKind` | `dateTime`, `location`, in `RipplePermissionKind`'s order; `wire` is the manifest's name for it, and `PermissionKind.fromWire(String)` the kind a name names, or `null`. |
| `Moment` | An instant: `utcMs` (milliseconds since the epoch) and `offsetMinutes` (the offset the reader's wall clock is at). `Moment(utcMs, offsetMinutes)`, `Moment.of(DateTime)` at the time's own offset, and `Moment.now()`, this machine's clock in its zone. |
| `Position` | A fix, any field of which may be absent, shaped after the web's `GeolocationPosition`: `label` (`String?`), `latitude`, `longitude`, `accuracy` (`double?`, the last in metres), `when` (`Moment?`). |

A verb the story was not asking for throws `HostException` and moves nothing. `CvarChange` carries `outcome` (`CvarWrite.done`, `unknown` or `refused`), `refusal` (the sentence, when refused) and `effects`.

### Readers

| Reader | Type | Meaning |
| --- | --- | --- |
| `board` | `int` | The board the story is on, by index into `manifest.boards`. |
| `locale` | `String` | The language the story reads in. |
| `defaultLocale` | `String` | The campaign's default language. |
| `ambience` | `Ambience?` | The soundscape in force; `null` for silence. |
| `entities` | `List<Entity>` | Every entity the story holds. |
| `memory` | `Memory` | What the story remembers. |
| `cvars` | `List<CvarSnapshot>` | Every console variable, with its value. |
| `guard` | `GuardReport` | What the script guard has had to do so far: `abandoned` (the nodes whose scripts were abandoned), `refused` (`int`), `exhausted` (`bool`). |
| `pythonAvailable` | `bool` | Whether this session can run scripts; `false` on the engine without Python. |
| `describeCvarWrite(String name, Value value)` | `String?` | Why writing `value` would be refused; `null` when it would be taken. Writes nothing. |
| `generator` | `Generator` | The dice's state (`lo`, `hi`). Settable. |
| `handle` | `Pointer<RippleSession>` natively, `JSObject` on the web | The engine's handle, for a call the binding does not wrap. |

| Setter | Meaning |
| --- | --- |
| `setTrace(bool enabled)` | Turns `Trace` effects on or off. |
| `setTracePayloads(bool enabled)` | Turns a traced value's payload on or off. |
| `generator = Generator(lo, hi)` | Sets the dice's state. |
| `dispose()` | Frees the session now. Anything else on it then throws `StateError`. |

### Saving

A save is JSON text, from `checkpoint()` (the story goes on) or `pause()` (the story stops). It carries no dice state and no soundscape position: the same seed gives the same future rolls, and a soundscape starts from the top. To keep the dice's exact continuation, read `generator` from the old session and set it on the resumed one.

```dart
final save = session.checkpoint();           // null unless on a passage or a form
final dice = session.generator;

final resumed = Session.resume(campaign, save!, seed: seed);
resumed.generator = dice;
final batch = resumed.start();               // the passage again
```

## Effects

`Effect` is a sealed class. `Turn` and `Over` are sealed middles, so a `switch` over `batch.last` is exhaustive over the seven Turns.

| Effect | Fields | `isTurn` | `isOver` | Answered with |
| --- | --- | --- | --- | --- |
| `Show` | `passage` (`Passage`) | yes | | `choose` or `leave`; when its `timer` runs out, `expire` |
| `Ask` | `prompt` (`Prompt`) | yes | | `answer` |
| `Hold` | `ms` (`int`) | yes | | `elapsed`, once your clock says so |
| `Permit` | `kinds` (`List<PermissionKind>`): what the story reads and nobody has answered, before it begins | yes | | `permit`, once per kind; the answer to the last begins the story |
| `Ended` | `title` (`String?`), `ranOut` (`bool`: the story ran out of road rather than reaching an End) | yes | yes | |
| `Failed` | `message` (`String`), `node` (`String?`) | yes | yes | |
| `Stopped` | | yes | yes | |
| `Trace` | `event` (`RunEvent`) | | | |
| `Callback` | `event` (`CallbackEvent`) | | | |
| `Jumped` | `board` (`int`, by index into `manifest.boards`), `node` (`String?`) | | | |
| `AmbienceChanged` | `ambience` (`Ambience?`; `null` for silence) | | | |
| `Audio` | `command` (`AudioCommand`) | | | give it to `SoundscapeDriver.apply` |
| `Changed` | `entities` (`List<Entity>?`), `memory` (`Memory?`), `cvars` (`List<CvarSnapshot>?`); a store that did not move is `null` | | | |
| `Notice` | `code` (`String`: `I.RT.05` a stand-in, `W.RT.06` a refusal, `I.RT.07` nothing; the letter is the severity), `kind` (`PermissionKind`), `node` (`String?`, the node whose read it was), `message` (the engine's English sentence) | | | a read of the world outside the story that did not get the real value, once per kind and outcome in a playthrough, before its Turn |

`Ended`, `Failed` and `Stopped` extend `Over`, which extends `Turn`.

### Records

Every record is a copy: it outlives the verb that made it, the session and the campaign. Times are milliseconds throughout.

| Record | Fields |
| --- | --- |
| `Passage` | `node`, `title`, `text` (Markdown, or HTML when `manifest.textFormat` says so), `choices` (`List<Choice>`), `sources` (`List<LocaleText>?`), `snippets` (`List<Snippet>`), `media` (`List<MediaLink>`), `untranslated` (`String?`: the locale this passage fell back from), `soundscape` (`Soundscape?`), `silence` (`bool`), `timer` (`ChoiceTimer?`: its countdown; `null` when it waits for the reader as long as they like) |
| `ChoiceTimer` | `afterMs` (how long before the countdown begins; zero is at once), `timeoutMs` (how long it runs once begun; never zero), `visible` (`bool`: whether the author meant the reader to see it count), `defaultChoice` (the index into the passage's choices taken when it runs out). The engine measures none of it. |
| `Choice` | `port`, `text`, `available` (`false` for a choice that is not open now; draw it greyed) |
| `LocaleText` | `locale`, `text` |
| `Snippet` | `code`, `isInline` |
| `MediaLink` | `link` (the name in the prose), `media` (index into `manifest.media`) |
| `Prompt` | `node`, `title`, `fields` (`List<PromptField>`) |
| `PromptField` | `name` (its ID, what an answer is keyed by), `type` (`String`), `defaultValue` (`Value`: what the control is filled in with; a default nobody edits is the answer), `label` (what the reader is shown, in the reader's language: `name` where the author wrote nothing), `placeholder` (the hint drawn while the field is empty; empty for none, never the answer), `optional` (`bool`: whether the reader may leave it empty, which answers null; a required field is not submitted empty), `options` (`List<PromptOption>`: the fixed answers to pick from, in order, one for a scalar type and any number for a `…List`; empty for a field the reader types into) |
| `PromptOption` | `id` (what a host answers with, the same in every language), `label` (what the reader is shown, in the reader's language), `value` (`Value`: what the story is handed when it is picked, of the field's type) |
| `Ambience` | `soundscape` (`Soundscape`), `board` (`int`), `node` (`String`): the soundscape in force and the node that set it |
| `Entity` | `key`, `component` (`String?`), `label`, `values` (a map `Value`, field by field) |
| `Memory` | `nodes` (a map `Value`, node by node), `machines` (`List<(String machine, String state)>`, each state machine and its state, in order) |
| `CvarSnapshot` | `name`, `type`, `defaultValue`, `value` |
| `CallbackEvent` | `callback` (the name the author gave it), `event` (`int`), `eventName` (the event, such as `cvar.changed`), `board` (`int?`), `node`, `name` (`String?`), `from`, `to` (`Value?`), `index` (`int?`) |
| `AudioCommand` | `kind` (`AudioKind`), `soundscape` (`Soundscape?`, for `play`), `fadeMs` (`play`: the fade-in; `stop`: the fade-out), `media` (`cue`: index into `manifest.media`), `volume`, `speed`, `node` (`String?`) |
| `Soundscape` | `id`, `name`, `length`, `looping`, `fadeIn`, `fadeOut`, `volume`, `tied`, `tracks` (`List<Track>`) |
| `Track` | `media`, `lane`, `start`, `clipStart`, `clipEnd` (`int?`), `volume`, `speed`, `fadeIn`, `fadeOut`, `mode` (`TrackMode.once`, `looping` or `auto`), `interval` |
| `RunEvent` | `kind` (`RunEventKind`), `run`, `board`, `sequence`, `node`, `step`, `entry`, `primed` (`List<String>`), `enteredVia` (`String?`), `pulled`, `inputs` and `outputs` (`List<TraceValue>`), `outcome` (`int`), `flowed` (`List<String>`), `error` (`String?`), `diagnostic` (`RunDiagnostic?`), `level` (`int`), `message`, `data` (`Value?`), `steps`, `cancelled`, `failedNode` (`String?`). Read the fields by `kind`. |
| `TraceValue` | `fromNode`, `fromPort`, `toNode`, `toPort` (`String?`), `payload` (`PayloadKind.present`, `withheld` or `absent`), `value` (set when `present`) |
| `RunDiagnostic` | `issue` (`int`, a `RippleRunIssue`; 4 is nothing on wire, the run remark `W.RT.08`), `message`, `node`, `port` (`String?`), `wires` (`int?`) |
| `PythonResult` | `value` (`Value`), `output` (`String`), `error` (`PythonFailure?`) |
| `PythonFailure` | `kind` (`int`), `exception` (`String?`), `message`, `line` (`int?`), `traceback` (`String?`) |

| Enum | Values |
| --- | --- |
| `AudioKind` | `play`, `stop`, `cut`, `cue` |
| `RunEventKind` | `runStarted`, `nodeStarted`, `nodeFinished`, `memoHit`, `diagnostic`, `log`, `runFinished` |
| `Untranslated` | `report`, `fallBack` |
| `CvarWrite` | `done`, `unknown`, `refused` |

## Values

`Value` is a sealed class with one subclass per kind. An Int and a Float never become each other, and a map keeps the order it was written in. Values are immutable and equal when they hold the same thing, a map's order included.

| Class | Field | Dart type | Notes |
| --- | --- | --- | --- |
| `NullValue` | | | Also `Value.nil`. |
| `BoolValue` | `value` | `bool` | |
| `IntValue` | `value` | `int` | 64 bits; see the dart2js row under [What differs on the web](#what-differs-on-the-web). |
| `FloatValue` | `value` | `double` | `FloatValue(7)` is `7.0`. `NaN` equals `NaN`. |
| `TextValue` | `value` | `String` | |
| `ListValue` | `items` | `List<Value>` | Unmodifiable. |
| `MapValue` | `entries` | `Map<String, Value>` | Unmodifiable, in written order. |

| Member | Meaning |
| --- | --- |
| `Value.from(Object? dart)` | `null`, `bool`, `int` (an Int), `double` (a Float), `String`, `List`, `Map` with `String` keys, or a `Value` as it is. Anything else throws `ArgumentError`. |
| `isNull` | Whether this is `NullValue`. |
| `operator [](String key)` | A map's value under `key`, or `null` (also for anything that is not a map). |
| `toStoryText()` | The value as a passage prints it, asked of the engine. On the web, needs `RippleEngine.load()` first. |
| `toString()` | JSON-like text for a log: `7` and `7.0` differ. |

```dart
switch (value) {
  case IntValue(:final value): print('a whole number, $value');
  case TextValue(:final value): print('text, $value');
  default: print(value);
}
```

## Player

The loop over a session, written once. It delivers every effect in order, keeps the last Turn, answers a `Hold` from its clock when `update()` finds it due, runs a passage's countdown the same way, tells the session the time before every verb, applies `Audio` effects to a driver, and dispatches named callbacks.

```dart
Player(
  Session session, {
  void Function(Effect effect)? onEffect,
  void Function(Object error, StackTrace stack)? onError,
  SoundscapeDriver? audio,
  Clock? now,
  bool countdowns = true,
  Moment Function()? wallClock,
})
```

| Parameter | Meaning |
| --- | --- |
| `session` | The session to play. The player owns it from here and disposes it. |
| `onEffect` | Hears every effect, in the order the engine produced it. |
| `onError` | Hears the failure of a verb the player made by itself (the `elapsed` after a hold, a countdown's `beginCountdown` and `expire`) and any handler's exception; delivery goes on either way. Without it, a self-made verb's failure is thrown from `update()`, and a handler's exception is lost. |
| `audio` | Where `Audio` effects go. Without one, nothing is heard. |
| `now` | The clock, in milliseconds. `Clocks.steady()` when omitted. |
| `countdowns` | Runs a passage's countdown on that clock: `beginCountdown` its wait after the passage was shown, `expire` when it runs out, timed from when each was due rather than from the frame that noticed. Turn it off to offer the reader no time limit at all (WCAG 2.2.1), or to say when yourself. |
| `wallClock` | What time it is for the story, handed to the session before every verb that can step: `Moment.now` for the reader's own clock. Without it the story has no clock, whatever the reader allowed. |

| Member | Type | Meaning |
| --- | --- | --- |
| `session` | `Session` | The session underneath. A verb called on it goes round the player. |
| `turn` | `Turn?` | The last Turn delivered, or, once `permit` has answered some of a `Permit` turn's kinds, that turn less them, so a host asks about what is left. |
| `holdDue` | `int?` | When the pending hold is due, by the player's clock; `null` when none is. |
| `countdown` | `Countdown?` | The shown passage's countdown and where it stands: `timer` (`ChoiceTimer`), `begun` (`bool`) and `due` (`int`), when its next step is due by the player's clock, its beginning or, once begun, its end. A host that draws it shows `due - now` while `begun` and the timer is `visible`. `null` when the passage has none, or when the player was made with `countdowns: false`. Kept across `setLocale`, which is the same visit. |
| `callbackMisses` | `int` | How many callbacks fired with nothing registered under their name. Not a failure. |
| `start()`, `choose(int index)`, `leave()`, `answer(Map<String, Value>? fields)`, `setLocale(String locale)`, `restart()`, `stop()` | `void` | The session's verbs; the effects go to the handlers. After `dispose()` they do nothing. |
| `permit(PermissionKind kind, {required bool granted})` | `void` | The reader's answer for one kind; the answer to the last a `Permit` turn asked about begins the story. |
| `beginCountdown()` | `void` | Begins the shown passage's countdown now. The player does it by itself unless it was made with `countdowns: false`; called sooner, the countdown runs from now. |
| `expire()` | `void` | Runs the shown passage's countdown out now: its default is taken. |
| `pause()` | `String?` | Puts the story down and answers its save — `null`, with nothing stopped, unless the story is on a passage or a prompt. Its effects are delivered. |
| `update()` | `void` | Call from your loop (Flame's `update(dt)`): answers a hold whose time has come, and moves a countdown on when its time has. |
| `onCallback(String name, handler)` | `void` | Calls `handler` whenever the callback named `name` fires, replacing any handler under that name. |
| `removeCallback(String name)` | `void` | Removes the handler under `name`. |
| `onAnyCallback(handler)` | `void` | Calls `handler` for every callback that fires, registered or not. |
| `clearCallbacks()` | `void` | Removes every handler. |
| `dispose()` | `void` | Delivers nothing more, moves the story no further, and disposes the session. |

A player verb called from inside a handler throws `ReentrantVerbException`: the rest of the batch would arrive after the new one. Call the verb after the handler returns.

## Named callbacks

A callback the author declared arrives as a `Callback` effect carrying a `CallbackEvent`, in its place in the batch. With `Player`, register handlers by the author's name:

```dart
player
  ..onCallback('chapterTwoBegan', (event) => unlock('chapter-two'))
  ..onAnyCallback((event) => log('${event.eventName} ${event.callback}'));
```

| `CallbackEvent` field | Meaning |
| --- | --- |
| `callback` | The name the author gave it, which a handler is registered by. |
| `eventName` | The event in the author's vocabulary, such as `cvar.changed`. |
| `event` | The same event as the engine's number. |
| `board`, `node` | Where it happened, when the event has a place. |
| `name`, `from`, `to`, `index` | What changed, when the event carries it. |

A callback with nothing registered under its name counts in `Player.callbackMisses`. A handler's exception goes to `onError`, and delivery goes on. Without `Player`, match `Callback(:final event)` in your own dispatch. The events and their targets are in [Host callbacks](/reference/host-callbacks/).

## Sound

The package ships no speaker. The session says what the story asks for as `Audio` effects; the engine's scheduler (`Mixer`) decides every voice; `SoundscapeDriver` drives the scheduler; a `Speaker` of yours makes the sound. The full contract is [`doc/speaker.md`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration/blob/main/doc/speaker.md).

```dart
final audio = SoundscapeDriver(campaign, MySpeaker());
final player = Player(Session.create(campaign, config), audio: audio);
// every frame:
audio.update();
player.update();
```

### SoundscapeDriver

```dart
SoundscapeDriver(
  Campaign campaign,
  Speaker speaker, {
  int maxCues = 8,
  double gainStep = 0.004,
  bool muted = false,
  Clock? now,
})
```

| Option | Default | Meaning |
| --- | --- | --- |
| `maxCues` | `8` | At most this many cues at once. |
| `gainStep` | `0.004` | A gain is written only when it moved by more than this. |
| `muted` | `false` | Starts muted. |
| `now` | `Clocks.steady()` | The clock, in milliseconds. |

| Member | Type | Meaning |
| --- | --- | --- |
| `apply(AudioCommand command)` | `void` | Obeys one of the session's audio commands. A `cue` whose medium has no path is ignored. |
| `update()` | `void` | Hears what the voices reported and moves the timeline on. Every 25 ms or so is the editor's pace; every frame is fine. |
| `pause()`, `resume()` | `void` | Holds every voice, and the timeline with them — not the story — and lets them go on. |
| `muted` | `bool` | Get or set. Mutes at once; the scheduler writes every gain as zero and remembers the rest. |
| `playing` | `String?` | The soundscape in force, by id: sounding, or waiting its turn. |
| `idle` | `bool` | Whether nothing sounds, waits or cues. |
| `voices` | `int` | How many voices the speaker holds open now. |
| `dispose()` | `void` | Stops every voice the speaker holds, and the scheduler. |

The driver adds how late a voice came to `fromMs` (times `rate`), wraps a late loop inside its loop, reports a clip already over as ended, tells the scheduler about voices that ended or were measured, and plays tracks with no file as silence. A failure from the scheduler stops the sound, not the story. It owns no timer: your loop is the timer.

`Clock` is `int Function()`, milliseconds and monotonic. `Clocks.steady()` is one over a `Stopwatch`.

### Speaker and Voice

```dart
abstract interface class Speaker {
  Voice? open(VoiceSource source, VoiceRole role, VoiceEvents events);
  bool resolves(VoiceSource source);
}

abstract interface class Voice {
  void play(VoicePlay request);
  void setGain(double gain);
  void pause();
  void resume();
  void stop();
}
```

| Member | Obligation |
| --- | --- |
| `Speaker.open(source, role, events)` | Return a voice that can begin at once, or `null` when the file cannot be played; `null` is heard as silence and never retried. Synchronous: over an asynchronous audio API, create the player here and start it when ready. Keep `events` with the voice. |
| `Speaker.resolves(source)` | Whether the speaker can play the medium at all, asked before a soundscape plays; a track it cannot is silence up front. Answer `true` when unsure. |
| `Voice.play(request)` | Begin at once, replacing whatever the voice was playing. May be called again on the same voice, for a gapless bed coming round. Play from `fromMs` to `toMs`, or to the file's end; when `looping`, reaching `toMs` comes round to `loopFromMs`, not `fromMs`. |
| `Voice.setGain(gain)` | Write a new gain, smoothed over a few milliseconds where the API can. |
| `Voice.pause()`, `Voice.resume()` | Hold the voice exactly where it is, and let it go again. |
| `Voice.stop()` | End the voice for good and let its resources go. No `ended()` follows. |
| `VoiceEvents.ended()` | Call once per play when a non-looping voice reaches the end of what it was given. Never after `stop()`, never for a looping voice. |
| `VoiceEvents.duration(double ms)` | Call once, when the file's length is known. |

Either `VoiceEvents` call may come at any time, from any callback; the driver hears it on its next `update()`. A call from a stopped voice, or after the driver is disposed, is ignored.

| Type | Fields |
| --- | --- |
| `VoiceSource` | `media` (index into `manifest.media`), `path` (inside the bundle), `file` (`String?`: on disk, for a campaign opened from a folder). For a campaign opened from its files, read bytes with `campaign.mediaBytes(source.media)` or from your assets by `source.path`. |
| `VoicePlay` | `fromMs`, `toMs` (`double?`; the file's end when `null`), `gain` (0 to 1), `rate` (1 is as recorded), `looping`, `loopFromMs` |
| `VoiceRole` | `track` (may be minutes long; usually better streamed) or `cue` (short, must start on time; usually better decoded whole) |

**The gain scale is cubic.** A speaker that writes amplitude writes `gain * gain * gain`.

On the web a speaker is usually Web Audio. The JavaScript binding's `@ripplefx/soundscape` has a whole `WebAudioSpeaker` to model one on, and the Flame example's flame_audio speaker runs in the browser as it is.

### Mixer

The engine's scheduler, raw, for a host that does not use the driver: commands in, `List<VoiceCommand>` out, your clock on every verb. On the web a `Mixer` made on its own needs `RippleEngine.load()` first.

`Mixer({int maxCues = 8, double gainStep = 0.004})`

| Member | Type | Meaning |
| --- | --- | --- |
| `play(int nowMs, Soundscape scape, {List<int> unresolved = const [], int atMs = 0, bool muted = false})` | `List<VoiceCommand>` | Plays a soundscape `atMs` into its timeline, handing over from whatever is sounding. Tracks in `unresolved`, by index, are silence and never retried. |
| `stop(int nowMs)` | `List<VoiceCommand>` | Stops what is sounding, fading it out. |
| `cut(int nowMs)` | `List<VoiceCommand>` | Silences everything at once, cues included. |
| `cue(int nowMs, int media, double volume, double speed)` | `List<VoiceCommand>` | Plays one cue. |
| `pause(int nowMs)`, `resume(int nowMs)` | `List<VoiceCommand>` | Holds everything where it is, and lets it go on. |
| `tick(int nowMs)` | `List<VoiceCommand>` | Moves the timeline on: what is due opens, ramps move, what is done stops. |
| `voiceEnded(int nowMs, int voice)` | `List<VoiceCommand>` | The speaker's report that a voice reached its end. |
| `durationKnown(int voice, int ms)` | `void` | The speaker's report of a file's length. |
| `muted` | `bool` | Get or set. The timeline runs on, every gain written as 0. |
| `playingId`, `finishingId` | `String?` | The soundscape playing, and the one fading out under it. |
| `state` | `Phase?` | The playing soundscape's phase; `null` when none is playing. |
| `trackState(int track)` | `Phase` | A track's phase, by index into the playing soundscape's tracks. |
| `positionMs` | `int` | How far into its timeline the playing soundscape is. |
| `pass` | `int` | How many times the playing soundscape has gone round. |
| `ranOut` | `bool` | Whether it has played to its end and will not loop. |
| `isPaused`, `isIdle` | `bool` | Paused; nothing sounding or due. |
| `dispose()` | `void` | Frees the mixer. |

| `VoiceCommand` field | Meaning |
| --- | --- |
| `kind` | `VoiceKind.open`, `gain`, `stop`, `pause` or `resume` |
| `voice` | The voice's id. |
| `media`, `role`, `track` | For `open`: the medium, `VoiceRole`, and the track's index. |
| `fromMs`, `toMs` (`int?`), `rate`, `looping`, `loopFromMs` | For `open`: what to play. |
| `gain` | For `open` and `gain`. |

`Phase` is `queued`, `starting`, `playing`, `finishing` or `finished`.

## Errors

Every failure the engine reports is a `RippleException`, a sealed class carrying a `Failure`. `code` and `message` are read through from it.

| Exception | Codes | Thrown when | Met in use |
| --- | --- | --- | --- |
| `BundleException` | `bundleFormat`, `bundleVersion` | A document of the bundle is malformed, missing, or from a newer engine. | yes, at open |
| `NeedsPythonException` | `needsPython` | The bundle needs Python and this is the engine without it. | yes, at open |
| `ResumeException` | `boardGone`, `nodeGone` | A save cannot be reunited with this campaign: its board or node is gone. | yes, at resume |
| `HostException` | `wrongTurn`, `noSuchChoice`, `choiceSpent`, `stopped`, `nothingAsked`, `unknownLocale`, `notPermitted`, `standIn`, `noCountdown`, `countdownNotBegun` | A verb the story was not asking for, or a reading it will not take: a position for a kind the reader denied, a stand-in that does not read, a countdown verb on a passage with none, `expire` before `beginCountdown`. Nothing moved. | a host bug, except `unknownLocale` and `standIn` when what was given comes from the reader |
| `InvalidArgumentException` | `invalidArgument`, and any unknown code | A malformed argument. Nothing was done. | a host bug |
| `EngineTrapException` | `trap` | The engine panicked, now or earlier on this handle. | rare |
| `ReentrantVerbException` | `reentrant` | A `Player` verb called from inside a handler. | a host bug |

`Code` holds the engine's numbers: `success` (0), `bundleFormat` (1), `bundleVersion` (2), `needsPython` (3), `wrongTurn` (10), `noSuchChoice` (11), `choiceSpent` (12), `stopped` (13), `nothingAsked` (14), `unknownLocale` (15), `notPermitted` (16), `standIn` (17), `noCountdown` (18), `countdownNotBegun` (19), `boardGone` (20), `nodeGone` (21), `invalidArgument` (-1), `trap` (-2), and the binding's own `reentrant` (-100). `Code.value` is the number; `Code.of(int)` maps one back.

| `Failure` field | Set for |
| --- | --- |
| `code`, `message` | every failure |
| `location` | `bundleFormat`: the document at fault |
| `found`, `supported`, `oldest` | `bundleVersion`: the bundle's format, the newest this engine reads, the oldest when there is a floor |
| `asked`, `answered` | `wrongTurn`: what the story was asking, and the verb that answered it |
| `offered`, `chosen` | `noSuchChoice`: how many choices were offered, and the index taken |
| `subject` | the choice, locale, board or node a host or resume error is about; for `notPermitted` and `standIn`, the kind's `PermissionKind.wire` name |
| `node` | `nodeGone`: the node |

Two failures are not `RippleException`:

| Exception | Thrown when |
| --- | --- |
| `EngineNotFoundException` (`message`, `cause`) | The engine library could not be loaded or binds another contract (natively: not bundled, a 32-bit device, an `engine_dir` of another contract); on the web, the engine could not be fetched, or `load()` has not been awaited. |
| `StateError` | Any call on a disposed `Campaign`, `Session` or `Mixer`. |

**A trap poisons the handle**: every later call on it throws `EngineTrapException` again. Dispose the session and the campaign, open the campaign again, and resume from the last checkpoint. On the web a trap poisons only the campaign it happened in and that campaign's sessions.

## Threading and lifetime

- **Opening is the one `Future`.** `Campaign.openDirectory`, `Campaign.openFiles` and `RippleEngine.load` are asynchronous; every verb and reader after them is synchronous, fast enough to call from a frame.
- **Everything a verb answers is a copy.** Effects, passages and values are Dart objects that outlive the session and the campaign.
- **`dispose()`** is on `Campaign`, `Session`, `Mixer`, `SoundscapeDriver` and `Player`. A campaign, session or mixer never disposed is freed when it is collected (natively by a `NativeFinalizer`). A second `dispose()` does nothing.
- **A session outlives its campaign.** Disposing a campaign leaves its sessions working.
- **One caller at a time.** A handle belongs to the isolate that made it, and one isolate at a time may use it.
- **The driver and the player own no timer.** Both read the `Clock` they were given; call their `update()` from your loop. A hold and a countdown are answered from it, and the time a story reads is the player's `wallClock` or what you hand `setNow`.

## A complete host

A terminal host over a bundle folder. It opens the campaign, plays it through `Player` with a speaker and a driver, asks before a story reads the clock or the place, greys out a spent choice, fills a form by its labels and picks its fixed answers by id, lets `update()` answer holds, registers callbacks, checkpoints before every answer, and recovers from a trap by resuming the last checkpoint. A game reads input from its own loop instead of `stdin`.

```dart
import 'dart:io';

import 'package:ripplefx_engine/ripplefx_engine.dart';

/// One playthrough: the campaign, its sound, the player and the last save.
final class StoryHost {
  StoryHost._(this.folder, this.campaign, this.audio);

  static Future<StoryHost> open(String folder) async {
    final campaign = await Campaign.openDirectory(folder);
    return StoryHost._(
      folder,
      campaign,
      SoundscapeDriver(campaign, ConsoleSpeaker()),
    );
  }

  static final options = const SessionOptions().copyWith(
    untranslated: Untranslated.fallBack,
  );

  final String folder;
  Campaign campaign;
  SoundscapeDriver audio;
  late Player player;
  int seed = 0;
  String? lastSave;
  Generator? lastDice;

  void begin({required int seed, String? locale}) {
    this.seed = seed;
    _play(
      Session.create(
        campaign,
        SessionConfig(
          board: campaign.manifest.entries.first,
          seed: seed,
          locale: locale,
          options: options,
        ),
      ),
    );
  }

  void _play(Session session) {
    player =
        Player(
            session,
            audio: audio,
            onEffect: _onEffect,
            onError: (error, stack) => stderr.writeln('ripple: $error'),
            wallClock: Moment.now, // read by the story only once it is allowed
            // A terminal waits on the reader's line, so no frame could run a
            // countdown out: the reader is given all the time they like.
            countdowns: false,
          )
          ..onCallback('chapterTwoBegan', (event) => stdout.writeln('*'))
          ..onAnyCallback(
            (event) => stdout.writeln('[${event.eventName}] ${event.callback}'),
          );
    player.start();
  }

  // Every effect, in order. No player verb from here.
  void _onEffect(Effect effect) {
    switch (effect) {
      case Show(:final passage):
        stdout.writeln('\n== ${passage.title} ==\n${passage.text}');
      case Changed(:final cvars?):
        for (final cvar in cvars) {
          stdout.writeln('  ${cvar.name} = ${cvar.value}');
        }
      case Ended(:final title):
        stdout.writeln('The end${title == null ? '' : ': $title'}');
      case Failed(:final message):
        stderr.writeln('The story could not go on: $message');
      case Notice(:final code, :final message): // a stand-in, a refusal or nothing
        stdout.writeln('  [$code] $message');
      default:
    }
  }

  void pick(Passage passage, int index) {
    if (!passage.choices[index].available) return; // spent: never offered
    _save();
    player.choose(index);
  }

  void fill(Prompt prompt) {
    final answers = <String, Value>{
      for (final field in prompt.fields)
        if (readField(field) case final answer?) field.name: answer,
    };
    _save();
    player.answer(answers); // an optional field left out reads as nothing
  }

  void _save() {
    lastSave = player.session.checkpoint();
    lastDice = player.session.generator;
  }

  /// Once a frame: the sound moves on, and a due Hold is answered.
  void frame() {
    audio.update();
    player.update();
  }

  /// After a trap: drop everything on the old campaign and resume.
  Future<void> recover() async {
    dispose();
    campaign = await Campaign.openDirectory(folder);
    audio = SoundscapeDriver(campaign, ConsoleSpeaker());
    final save = lastSave;
    if (save == null) {
      begin(seed: seed);
      return;
    }
    final session = Session.resume(campaign, save, seed: seed, options: options);
    if (lastDice case final dice?) session.generator = dice;
    _play(session);
  }

  void dispose() {
    player.dispose();
    audio.dispose();
    campaign.dispose();
  }
}

Future<void> main(List<String> args) async {
  final StoryHost host;
  try {
    host = await StoryHost.open(args.first);
  } on NeedsPythonException {
    stderr.writeln('This campaign needs the engine with Python.');
    exitCode = 1;
    return;
  } on BundleException catch (e) {
    stderr.writeln('Not a campaign this engine reads: ${e.message}');
    exitCode = 1;
    return;
  } on EngineNotFoundException catch (e) {
    stderr.writeln(e.message);
    exitCode = 1;
    return;
  }
  host.begin(seed: DateTime.now().microsecondsSinceEpoch);

  for (
    var turn = host.player.turn;
    turn != null && !turn.isOver;
    turn = host.player.turn
  ) {
    try {
      switch (turn) {
        case Show(:final passage) when passage.choices.isEmpty:
          host.player.leave();
        case Show(:final passage):
          host.pick(passage, readChoice(passage));
        case Ask(:final prompt):
          host.fill(prompt);
        case Permit(:final kinds): // before it begins; the last answer begins it
          host.player.permit(kinds.first, granted: allow(kinds.first));
        default: // a Hold: update() answers it when its time comes
          host.frame();
          await Future<void>.delayed(const Duration(milliseconds: 16));
      }
    } on EngineTrapException {
      await host.recover();
    } on HostException catch (e) {
      stderr.writeln('refused: ${e.code.name}'); // nothing moved
    }
  }
  host.dispose();
}

int readChoice(Passage passage) {
  for (final (i, choice) in passage.choices.indexed) {
    final spent = choice.available ? '' : ' (spent)';
    stdout.writeln('  ${i + 1}. ${choice.text}$spent');
  }
  stdout.write('> ');
  final picked = int.tryParse(stdin.readLineSync() ?? '') ?? 1;
  return picked < 1 || picked > passage.choices.length ? 0 : picked - 1;
}

bool allow(PermissionKind kind) {
  stdout.write(switch (kind) {
    PermissionKind.dateTime => 'May this story read the date and time? ',
    PermissionKind.location => 'May this story read where you are? ',
  });
  return (stdin.readLineSync() ?? '').trim().toLowerCase().startsWith('y');
}

/// One field, shown by its label in the reader's language; null leaves it out.
Value? readField(PromptField field) {
  stdout.writeln('${field.label}${field.optional ? ' (optional)' : ''}');
  for (final (i, option) in field.options.indexed) {
    stdout.writeln('  ${i + 1}. ${option.label}');
  }
  while (true) {
    stdout.write(field.options.isEmpty ? '${field.placeholder}> ' : '> ');
    final line = stdin.readLineSync() ?? '';
    if (line.isEmpty && field.optional) return null;
    if (field.options.isNotEmpty) {
      // A pick is answered with the option's id, never its words.
      final picked = int.tryParse(line);
      if (picked == null || picked < 1 || picked > field.options.length) continue;
      final id = TextValue(field.options[picked - 1].id);
      return field.type.endsWith('List') ? ListValue([id]) : id;
    }
    // The default is the answer if nobody edits it; this host types only text.
    if (line.isEmpty || field.type != 'string') return field.defaultValue;
    return TextValue(line);
  }
}

/// Your audio API goes here; the driver decides when, how loud and from where.
final class ConsoleSpeaker implements Speaker {
  @override
  Voice? open(VoiceSource source, VoiceRole role, VoiceEvents events) =>
      _ConsoleVoice(source.path, events);

  @override
  bool resolves(VoiceSource source) => true;
}

final class _ConsoleVoice implements Voice {
  _ConsoleVoice(this.path, this.events);

  final String path;
  final VoiceEvents events; // ended() and duration(ms), from your API's callbacks

  @override
  void play(VoicePlay request) {
    final amplitude = request.gain * request.gain * request.gain;
    stdout.writeln('[sound] $path from ${request.fromMs} ms at $amplitude');
  }

  @override
  void setGain(double gain) {}

  @override
  void pause() {}

  @override
  void resume() {}

  @override
  void stop() {}
}
```

The terminal example in the package (`example/ripplefx_engine_example.dart`) and the Flame game in [`example/flame_player`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration/tree/main/example/flame_player), which opens a campaign from its assets with `Campaign.openFiles` and plays its sound over flame_audio, are complete programs.

### The engine's notice in a Flutter app

```dart
LicenseRegistry.addLicense(() async* {
  yield LicenseEntryWithLineBreaks(
    ['Ripple Effect Engine'],
    await rootBundle.loadString('assets/ENGINE-NOTICE.txt'),
  );
});
```

The notice is the `NOTICE` file in the engine archive, the same text in every archive of a release.

## Related

- [Embedding the engine](/explanation/embedding-the-engine/) — why a host drives the story and the engine never calls back.
- [How the engine ships](/explanation/how-the-engine-ships/) — the engine releases, the two variants, and the contract a binding pins.
- [Play a campaign in your program](/how-to/play-a-campaign-in-your-program/) — the steps from an exported campaign to a running host.
- [Host callbacks](/explanation/host-callbacks/) — what a named callback is for, on the author's side and yours.
