---
title: C# binding
description: "The C# binding of the Ripple Effect engine: its NuGet packages, the variants and platforms, and every public type: Campaign, Session, the effects, Value, Player, the speaker contract and the exceptions."
---

The C# binding is three NuGet packages: `RippleFx.Engine`, the managed bindings, and one of two engine packages, `RippleFx.Engine.Native` or `RippleFx.Engine.Native.NoPython`. Version 1.5.x binds Ripple Effect contract 1.5. `MAJOR.MINOR` is the engine contract, and the `PATCH` is the binding's own. Each binding release pins one engine release, `engine-v<version>` of the public [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases) repository, and the engine packages carry exactly the libraries of that release's signed archives. Binding 1.5.0 pins engine 1.5.3. The source is at [ConnectingTheDots-DCWK/ripple_effect_csharp_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration). The bindings are MIT. The engine binary the native packages carry is under the [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/), and its notice must be reproduced wherever your product lists the third-party software it contains.

Everything below is in the `RippleFx.Engine` namespace. Times are milliseconds throughout.

## Packages and installing

| Package | What it is | Targets |
| --- | --- | --- |
| `RippleFx.Engine` | The managed bindings: `Campaign`, `Session`, `Effect`, `Value`, the records, the exceptions, `Mixer`, `ISpeaker` and `IVoice`, `SoundscapeDriver`, `Player`. No dependencies. Carries no engine. | `netstandard2.1`, `net8.0`; compiled as C# 9 |
| `RippleFx.Engine.Native` | The engine with its Python interpreter, as NuGet ships native code: `runtimes/<rid>/native/`. | every runtime identifier under [Platforms](#platforms) |
| `RippleFx.Engine.Native.NoPython` | The engine without Python: about half the size. | the same |

```sh
dotnet add package RippleFx.Engine
dotnet add package RippleFx.Engine.Native            # with Python
dotnet add package RippleFx.Engine.Native.NoPython   # or without
```

- **Reference exactly one engine package.** A project that references both fails to build, with an error naming both. A project that references neither builds, and the first call that needs the engine throws `EngineNotFoundException` naming the two packages.
- **The engine packages carry `ENGINE-NOTICE.txt` and `LICENSE-ENGINE.txt`** at their root. `ENGINE-NOTICE.txt` is the notice to reproduce.
- **`netstandard2.1` and C# 9** are what Unity compiles and loads.
- **Ahead of time.** Every signature in `RippleFx.Engine.Interop` is blittable and nothing calls back into managed code, so no marshalling stub is generated at run time. The assembly is marked AOT-compatible for `net8.0` (NativeAOT), and the same holds under IL2CPP.
- **A self-contained or single-file publish** takes the engine library with it, as it does any NuGet native asset.
- **`RippleFx.Engine.Interop`** is the engine's C ABI as P/Invoke, generated from the engine's `ripple.h` with the C names kept: the static class `Native` and the C structs and enums. Use it, with `Campaign.DangerousHandle` and `Session.DangerousHandle`, for a call the bindings do not wrap.

## Choosing the variant

The variant is chosen by which engine package you reference. The managed package names neither.

| | `RippleFx.Engine.Native` | `RippleFx.Engine.Native.NoPython` |
| --- | --- | --- |
| Runs Script nodes and Python snippets | yes | no |
| A campaign whose `Manifest.Needs` contains `python` | plays | refused at open with `NeedsPythonException` |
| `RippleEngine.HasPython`, `Session.PythonAvailable` | `true` | `false` |
| `Session.ConsoleFeed` | runs the line | answers a `PythonFailure` of kind unavailable |

The editor's **Needs no Python** export is checked by the compiler for exactly the `NoPython` host.

## Platforms

| Runtime identifiers | Library | Floor and notes |
| --- | --- | --- |
| `win-x64`, `win-arm64` | `ripple_effect_engine.dll` | Built against the dynamic CRT. |
| `osx-x64`, `osx-arm64` | `libripple_effect_engine.dylib` | macOS 12.0 and up. One library per architecture; a universal app takes both identifiers. |
| `linux-x64`, `linux-arm64` | shared library | glibc 2.35 and up. Not musl: Alpine has no engine build. |
| `android-arm64`, `android-x64` | shared library | API 24 and up. .NET for Android packs it under `lib/arm64-v8a/` and `lib/x86_64/`. |
| `ios-arm64`, `iossimulator-arm64` | `libripple_effect_engine.a`, static | iOS 13.0 and up; a simulator runtime's own minimum may raise the deployment target. The package's build targets link the archive into your app and keep and export every C entry point, so the same P/Invokes resolve through the main image. Build one runtime identifier at a time with `-r`, and do not list both in `RuntimeIdentifiers`: a list naming a simulator makes a device build target the simulator. |

**Not supported: .NET in the browser** (`browser-wasm`). The engine's web build for native linking needs Emscripten 4.0 or later, and .NET's `wasm-tools` workload links with its own older Emscripten (3.1.34 in .NET 8, 3.1.56 in .NET 10), whose optimiser refuses the engine's objects.

The full matrix of engine builds is [Engine targets](/reference/engine-targets/).

## The engine

`RippleEngine` is a static class describing the library this process loaded.

| Member | Type | What it is |
| --- | --- | --- |
| `BoundContract` | `const string` | The contract these bindings bind: `"1.5"`. |
| `Version` | `string` | The loaded library's version, such as `1.5.3`: the one loaded, not the one built against. |
| `Contract` | `string` | The contract the loaded library binds. |
| `HasPython` | `bool` | Whether the loaded library runs scripts: `false` for the `NoPython` one. |
| `Outstanding` | `long` | How many things the engine handed out and has not had back. Zero whenever no call is in flight. |
| `EnsureLoaded()` | `void` | Loads the library and checks its contract against `BoundContract`, once. Every handle's constructor calls it. Throws `EngineNotFoundException`. |

## Campaign

A `Campaign` is an opened bundle: immutable, shared by every session made from it, and `IDisposable`. It may be disposed before its sessions, and they go on working.

### Opening

| Factory | Opens | Notes |
| --- | --- | --- |
| `Campaign.OpenDirectory(string folder)` | The bundle in the folder that holds `campaign.json`. | Files are read as the story asks for them, never from outside the folder. |
| `Campaign.OpenFiles(IReadOnlyList<BundleFile> files)` | A bundle held in memory: every file of it, by its path inside the bundle. | The bytes are copied. For a packed asset system, a phone's bundled assets or a console. |

`BundleFile(string Path, byte[] Bytes)` is one file of a bundle in memory. Both factories throw `BundleException` for a malformed bundle or one from a newer engine, and `NeedsPythonException` on the `NoPython` engine for a bundle that needs Python.

### Members

| Member | Answers | Notes |
| --- | --- | --- |
| `Manifest` | `Manifest` | `campaign.json`, read afresh on every call: keep it rather than ask again. |
| `Board(uint index)` | `Board` | A board, by index into `Manifest.Boards`. |
| `Soundscape(uint index)` | `Soundscape` | A soundscape, by index into `Manifest.Soundscapes`. |
| `BoardWithId(string id)` | `uint?` | A board's index by its id; null when there is no such board. |
| `Node(uint board, string id)` | `Node?` | A node of a board, for when a trace names one; null when there is none. |
| `Validate()` | `IReadOnlyList<BundleProblem>` | Everything wrong with the bundle the engine can see without playing it; empty when it is sound. |
| `MediaPath(uint index)` | `string?` | A medium's path inside the bundle; null when there is no such medium. |
| `MediaFile(uint index)` | `string?` | The folder joined with the medium's path, for a campaign opened from a folder; null otherwise. |
| `MediaBytes(uint index)` | `byte[]?` | A medium's bytes; null when there is no such medium. |
| `Folder` | `string?` | The folder it was opened from; null for a bundle in memory. |
| `DangerousHandle` | `IntPtr` | The engine's handle. Good while the campaign is neither disposed nor collected. |
| `Dispose()` | | Releases the handle. |

`BundleProblem(string Message, string Location)` is one finding of `Validate()`.

### Manifest

| Field | Type | What it is |
| --- | --- | --- |
| `Format` | `long` | The bundle format. |
| `Generator` | `string?` | Who compiled it; null when it does not say. |
| `TextFormat` | `string` | `markdown` or `html`: what a passage's text is written in. |
| `Project` | `Project` | Title, description and languages. |
| `Entries` | `IReadOnlyList<uint>` | The boards a story may begin on, by index into `Boards`. |
| `Boards`, `Passages`, `Components`, `Scripts`, `Media`, `Machines`, `Soundscapes` | `IReadOnlyList<Entry>` | The manifest's tables. |
| `Cvars` | `IReadOnlyList<Cvar>` | The console variables the campaign declares. |
| `Needs` | `IReadOnlyList<string>` | What the campaign needs of its host: `python`, when it runs scripts. |

| Record | Fields |
| --- | --- |
| `Project` | `Title`, `Description`, `DefaultLocale` (`string`); `Locales` (`IReadOnlyList<string>`); `Cover` (`string?`, the cover picture's path inside the bundle) |
| `Entry` | `Id`, `Name`, `Path` (`string`): one row of a table |
| `Cvar` | `Name`, `Type` (`string`); `Default` (`Value`) |

### Boards, nodes and soundscapes

| Record | Fields |
| --- | --- |
| `Board` | `Id`, `Name` (`string`); `Start` (`long`); `Prime` (`IReadOnlyList<uint>`); `Nodes` (`IReadOnlyList<Node>`) |
| `Node` | `Id`, `Type`, `Title` (`string`); `Inputs`, `Outputs` (`IReadOnlyList<Port>`); `Data`, `Metadata` (`Value`) |
| `Port` | `Id` (`string`); `Kind` (`PortKind`: `Control`, `Data`); `Edges` (`IReadOnlyList<Edge>`) |
| `Edge` | `Node`, `Port` (`long`) |
| `Soundscape` | `Id`, `Name` (`string`); `Length`, `FadeIn`, `FadeOut` (`long`); `Looping`, `Tied` (`bool`); `Volume` (`double`, default 1.0); `Tracks` (`IReadOnlyList<Track>`) |
| `Track` | `Media` (`long`, by index into the manifest's media); `Lane`, `Start`, `ClipStart`, `FadeIn`, `FadeOut`, `Interval` (`long`); `ClipEnd` (`long?`); `Volume`, `Speed` (`double`, default 1.0); `Mode` (`TrackMode`: `Once`, `Looping`, `Auto`) |

## Session

A `Session` is one story being played: `IDisposable`, used by one caller at a time. Every verb answers `IReadOnlyList<Effect>`, the effects it led to in the order they are applied, with the Turn last.

### Creating and resuming

| Factory | Notes |
| --- | --- |
| `Session.Create(Campaign campaign, SessionConfig config)` | A new session before its first turn. Call `Start()` next. |
| `Session.Resume(Campaign campaign, string save, ulong seed, SessionOptions? options = null)` | A session picking up a save from `Pause()` or `Checkpoint()` over the same campaign. Call `Start()` next; it answers the turn the save was on. Throws `ResumeException` when the save names a board or node the campaign no longer has. |

### SessionConfig

| Field | Type | Default | What it is |
| --- | --- | --- | --- |
| `Board` | `uint` | `0` | The board, by index into the manifest's boards: usually `Manifest.Entries[0]`. |
| `EntryNode` | `string?` | `null` | A node to begin at instead of the board's start. |
| `Locale` | `string?` | `null` | The language to read in; null for the default. A locale the campaign is not readable in is refused. |
| `Seed` | `ulong` | `0` | The dice's seed: the same seed and the same moves play the same story. |
| `Digest` | `string?` | `null` | The bundle digest a save made from this session is stamped with; null for none. |
| `Options` | `SessionOptions?` | `null` | Null means `new SessionOptions()`. |

### SessionOptions

`new SessionOptions()` reads the engine's own budgets from the loaded library. Set only what you mean to change.

| Field | Type | Default | What it is |
| --- | --- | --- | --- |
| `StepBudget` | `uint` | the engine's | Steps a run may take before it is stopped; 0 stops on the first. |
| `SilentJumpLimit` | `uint` | the engine's | Silent jumps between boards before the story is stopped. |
| `LoopLimit` | `uint` | the engine's | Times a loop may go round; 0 is no ceiling. |
| `ScriptDeadlineMs` | `ulong` | the engine's | How long a script may run before it is stopped. Ignored without Python. |
| `ScriptMemoryBytes` | `ulong` | the engine's | How much memory a script may use. Ignored without Python. |
| `ScriptRecursionDepth` | `uint` | the engine's | How deep a script may recurse. Ignored without Python. |
| `Untranslated` | `Untranslated` | `Report` | `Report`: a passage with no text in the locale has empty text and names the locale in `Passage.Untranslated`. `FallBack`: it shows the default locale's text and still names it. |
| `Trace` | `bool` | `false` | Whether every verb's batch carries the run's trace as `Effect.Trace`. |
| `TracePayloads` | `bool` | `false` | Whether the trace carries the values that flowed, not only that they did. |

### Verbs

| Verb | Answers | Notes |
| --- | --- | --- |
| `Start()` | effects | The first turn, or the turn a resumed save was on. |
| `Choose(int index)` | effects | Takes the choice at `index` among those the passage offers. A negative index throws `ArgumentOutOfRangeException`. |
| `Leave()` | effects | The reader leaves the passage without choosing. |
| `Answer(IEnumerable<KeyValuePair<string, Value>>? fields)` | effects | Answers the form showing, field by field in the order given. `null` is the reader leaving the form. |
| `Elapsed()` | effects | Answers a `Hold` once your clock says it is over. |
| `SetLocale(string locale)` | effects | Changes the language; the turn the story is on is answered again in it. |
| `Restart()` | effects | Starts the story over from its first turn. |
| `Stop()` | effects | Stops the story for good. |
| `Pause()` | `Paused` | Puts the story down: its save and what pausing did. Pausing stops the story; resuming is a new session from the save. |
| `Checkpoint()` | `string?` | A save of the turn the story is on, without stopping it; null when there is nothing to save. |
| `ConsoleFeed(string code)` | `ConsoleResult` | Runs a line of Python in the story's interpreter, as the editor's console does. |
| `WriteCvar(string name, Value value)` | `CvarChange` | Writes a console variable. |
| `ResetCvar(string name)` | `CvarChange` | Puts a console variable back to its default. |
| `ResetAllCvars()` | effects | Puts every console variable back to its default. |
| `RemoveEntity(string key)` | `EntityRemoval` | Removes an entity from the story. |

| Result record | Fields |
| --- | --- |
| `Paused` | `Save` (`string?`, JSON; null when there was nothing to save); `Effects` |
| `CvarChange` | `Outcome` (`CvarWrite`: `Done`, `Unknown`, `Refused`); `Refusal` (`string?`, the sentence when refused); `Effects` |
| `EntityRemoval` | `Removed` (`bool`); `Effects` |
| `ConsoleResult` | `Result` (`PythonResult`); `Effects` |
| `PythonResult` | `Value` (`Value`); `Output` (`string`); `Error` (`PythonFailure?`) |
| `PythonFailure` | `Kind` (`uint`: 0 Python, 1 timeout, 2 refused, 3 closed, 4 host error, 5 unavailable); `Exception` (`string?`, the exception's type for kind 0); `Message` (`string`); `Line` (`uint?`); `Traceback` (`string?`) |

Every `Effects` field is an `IReadOnlyList<Effect>` to dispatch like any verb's answer.

### Readers

| Member | Type | What it is |
| --- | --- | --- |
| `Board` | `uint` | The board the story is on, by index into the manifest's boards. |
| `Locale` | `string` | The language the story reads in. |
| `DefaultLocale` | `string` | The campaign's default language. |
| `Ambience` | `Ambience?` | The soundscape in force; null for silence. |
| `Entities` | `IReadOnlyList<Entity>` | What the story has made. |
| `Memory` | `Memory` | The story's own store. |
| `Cvars` | `IReadOnlyList<CvarSnapshot>` | Every console variable and its value. |
| `Guard` | `GuardReport` | What the script guard has had to do so far: `Abandoned` (`IReadOnlyList<string>`, the nodes whose scripts were abandoned), `Refused` (`uint`), `Exhausted` (`bool`). |
| `PythonAvailable` | `bool` | Whether this session can run scripts: `false` on the `NoPython` engine. |
| `DescribeCvarWrite(string name, Value value)` | `string?` | Why the write would be refused; null when it would not. Writes nothing. |
| `SetTrace(bool enabled)` | `void` | Turns `Effect.Trace` on or off. |
| `SetTracePayloads(bool enabled)` | `void` | Turns traced payloads on or off. |
| `DangerousHandle` | `IntPtr` | The engine's handle, for a call the bindings do not wrap. |

### Saving and the generator

- A save is JSON text. Keep it with the seed and the locale.
- A save carries no generator state and no soundscape position: the same seed gives the same future rolls, and a soundscape starts from the top on resume.
- `Generator` (get and set) is the dice's state, `Generator(uint Lo, uint Hi)`. Read it before saving and set it on the resumed session for the dice to run on exactly.

## Effects

`Effect` is an abstract record with a closed set of nested sealed records, so `Effect.Trace` never collides with `System.Diagnostics.Trace`. Every effect is a copy: nothing in it points into the engine, and it outlives the session and the campaign.

| Member | What it is |
| --- | --- |
| `IsTurn` | `true` for a Turn: where the story now is. Exactly one closes every batch that moved the story. |
| `IsOver` | `true` for `Ended`, `Failed` and `Stopped`. |

### Turns

| Effect | Fields | Answered with |
| --- | --- | --- |
| `Effect.Show` | `Passage` (`Passage`) | `Choose` or `Leave` |
| `Effect.Ask` | `Prompt` (`Prompt`) | `Answer` |
| `Effect.Hold` | `Ms` (`ulong`) | `Elapsed`, once your clock says `Ms` have passed |
| `Effect.Ended` | `Title` (`string?`); `RanOut` (`bool`, true when the story ran out of road rather than reaching an End) | nothing; `IsOver` |
| `Effect.Failed` | `Message` (`string`); `Node` (`string?`) | nothing; `IsOver` |
| `Effect.Stopped` | none | nothing; `IsOver` |

### Along the way

| Effect | Fields | What it is |
| --- | --- | --- |
| `Effect.Jumped` | `Board` (`uint`); `Node` (`string?`) | The story moved to another board, by index into the manifest's boards. |
| `Effect.AmbienceChanged` | `Ambience` (`Ambience?`) | The soundscape now in force; null for silence. A fact for a HUD or a save screen, not a command for the speaker. |
| `Effect.Audio` | `Command` (`AudioCommand`) | A command for the sound: give it to `SoundscapeDriver.Apply`. |
| `Effect.Changed` | `Entities` (`IReadOnlyList<Entity>?`); `Memory` (`Memory?`); `Cvars` (`IReadOnlyList<CvarSnapshot>?`) | Which stores moved; a store that did not is null. The first `Changed` after `Start` names all three. |
| `Effect.Callback` | `Event` (`CallbackEvent`) | A named callback the author declared, fired. |
| `Effect.Trace` | `Event` (`RunEvent`) | One event of the run's trace, when the session traces. |

### Records

| Record | Fields |
| --- | --- |
| `Passage` | `Node`, `Title` (`string`); `Text` (`string`, Markdown, or HTML when `Manifest.TextFormat` says so); `Choices` (`IReadOnlyList<Choice>`); `Sources` (`IReadOnlyList<LocaleText>?`, the text in every language when the compiler kept them); `Snippets` (`IReadOnlyList<Snippet>`); `Media` (`IReadOnlyList<MediaLink>`); `Untranslated` (`string?`, the language the text is missing in); `Soundscape` (`Soundscape?`, the one the passage names); `Silence` (`bool`, true when the passage asks for silence) |
| `Choice` | `Port` (`string`, the control output the flow leaves by); `Text` (`string`); `Available` (`bool`, false for a choice not open now; still shown, and choosing it throws `HostException` with `Code.ChoiceSpent`) |
| `LocaleText` | `Locale`, `Text` (`string`) |
| `Snippet` | `Code` (`string`); `IsInline` (`bool`) |
| `MediaLink` | `Link` (`string`, the name the author linked it under); `Media` (`uint`, by index into the manifest's media) |
| `Prompt` | `Node`, `Title` (`string`); `Fields` (`IReadOnlyList<PromptField>`) |
| `PromptField` | `Name`, `Type` (`string`: `number`, `bool`, `string`, `numberList`, `boolList`, `stringList` or `json`); `Default` (`Value`). Answer with the matching type. |
| `Ambience` | `Soundscape` (`Soundscape`); `Board` (`uint`); `Node` (`string`, the node that set it) |
| `Entity` | `Key`, `Label` (`string`); `Component` (`string?`); `Values` (`Value`, a map, field by field) |
| `Memory` | `Nodes` (`Value`, a map, node by node); `Machines` (`IReadOnlyList<KeyValuePair<string, string>>`, each state machine and the state it is in) |
| `CvarSnapshot` | `Name`, `Type` (`string`); `Default`, `Value` (`Value`) |
| `CallbackEvent` | `Callback` (`string`, the name a handler is registered by); `Event` (`uint`, a `RippleCallbackKind`); `EventName` (`string`, such as `cvar.changed`); `Board` (`uint?`); `Node`, `Name` (`string?`); `From`, `To` (`Value?`); `Index` (`uint?`). Which optional fields are set depends on the event. |
| `AudioCommand` | `Kind` (`AudioKind`: `Play`, `Stop`, `Cut`, `Cue`); `Soundscape` (`Soundscape?`, Play: what to play); `FadeMs` (`ulong`, Play: the fade-in, Stop: the fade-out); `Media` (`uint`, Cue: the medium); `Volume`, `Speed` (`double`, default 1.0); `Node` (`string?`, Cue: the node that asked for it) |
| `RunEvent` | `Kind` (`RunEventKind`: `RunStarted`, `NodeStarted`, `NodeFinished`, `MemoHit`, `Diagnostic`, `Log`, `RunFinished`); `Run`, `Board`, `Sequence`, `Step`, `Steps` (`uint`); `Node`, `Entry`, `Message` (`string`); `Primed`, `Flowed` (`IReadOnlyList<string>`); `EnteredVia`, `Error`, `FailedNode` (`string?`); `Pulled`, `Cancelled` (`bool`); `Inputs`, `Outputs` (`IReadOnlyList<TraceValue>`); `Outcome` (`uint`: 0 done, 1 failed); `Diagnostic` (`RunDiagnostic?`); `Level` (`uint`: 0 debug, 1 info, 2 warning, 3 error); `Data` (`Value?`). Read the fields by `Kind`. |
| `TraceValue` | `FromNode`, `FromPort` (`string`); `ToNode`, `ToPort` (`string?`); `Payload` (`PayloadKind`: `Present`, `Withheld`, `Absent`); `Value` (`Value`, set when `Payload` is `Present`) |
| `RunDiagnostic` | `Issue` (`uint`: 0 ambiguous flow, 1 multiple inputs, 2 producer not run, 3 re-entered); `Message` (`string`); `Node`, `Port` (`string?`); `Wires` (`uint?`) |

The `uint` kinds match the enums of the same name in `RippleFx.Engine.Interop`, such as `RippleCallbackKind` and `RippleRunIssue`.

## Values

`Value` is a sealed, immutable class: a story's value. `ValueKind` is `Null`, `Bool`, `Int`, `Float`, `Text`, `List` or `Map`.

| C# | Story value | Make one | Read it |
| --- | --- | --- | --- |
| none | null | `Value.Null` | `IsNull` |
| `bool` | Bool | `Value.Bool(b)`, or implicit from `bool` | `AsBool()` |
| `long` | Int | `Value.Int(n)`, or implicit from `int` or `long` | `AsInt()` |
| `double` | Float | `Value.Float(x)`, or implicit from `double` | `AsFloat()` |
| `string` | Text | `Value.Text(s)`, or implicit from `string` (`null` becomes `Value.Null`) | `AsText()` |
| `IReadOnlyList<Value>` | List | `Value.List(IEnumerable<Value>)`, `Value.List(params Value[])` | `AsList()` |
| `IReadOnlyList<KeyValuePair<string, Value>>` | Map | `Value.Map(IEnumerable<KeyValuePair<string, Value>>)`, `Value.Map(params (string Key, Value Value)[])` | `AsMap()`, `Find(key)` |

- **An Int and a Float never become each other.** `7` and `7.0` are different values, and `ToString()` prints them differently.
- **A map keeps the order it was written in**, and its equality includes that order. A map key is never null.
- **A null item or map value becomes `Value.Null`.**
- `AsBool()`, `AsInt()` and the rest throw `InvalidOperationException` for a value of another kind.
- `Find(string key)` answers a map's value under the key, or null for a missing key or for a value that is not a map.
- `Equals` and `==` compare what is held; a value implements `IEquatable<Value>`.
- `ToString()` is JSON-like text for a log or a debugger. `ToStoryText()` asks the engine for the text a passage would print.

## Player

`Player` is the loop over a session, written once: `IDisposable`, owning no clock and no thread.

```csharp
public Player(Session session, PlayerHandlers handlers, Func<ulong>? now = null)
```

The player owns `session` from then on and disposes it. `now` is the clock in milliseconds; `Clocks.Steady()` when null.

### PlayerHandlers

| Field | Type | What it is |
| --- | --- | --- |
| `OnEffect` | `Action<Effect>?` | Every effect, in the order the engine produced it. |
| `OnError` | `Action<Exception>?` | The failure of a verb the player made by itself (the `Elapsed` after a hold), or an exception from a handler. Delivery goes on either way. Without one, a self-made verb's failure is thrown from `Update()` and a handler's is lost. |
| `Audio` | `SoundscapeDriver?` | Where the story's sound goes: the player applies every `Effect.Audio` to it. Without one, nothing is heard. |

### Members

| Member | What it does |
| --- | --- |
| `Start()`, `Choose(int)`, `Leave()`, `Answer(fields)`, `SetLocale(string)`, `Restart()`, `Stop()` | The session's verbs. The player delivers the batch they answer instead of returning it. After `Dispose` they do nothing. |
| `Pause()` | Puts the story down and answers its save, `string?`. Null, and nothing stopped, unless the story is on a passage or a prompt. |
| `Update()` | Call it from your loop. Answers a hold whose time has come with `Elapsed()`. |
| `Turn` | `Effect?`: the last Turn delivered; null before `Start()`. |
| `HoldDue` | `ulong?`: when the pending hold is due by the player's clock; null when none is. |
| `Session` | The session underneath, for what the player does not wrap. A verb called on it goes round the player and its batch is not delivered. |
| `OnCallback`, `RemoveCallback`, `OnAnyCallback`, `ClearCallbacks`, `CallbackMisses` | The callback table: [Named callbacks](#named-callbacks). |
| `Dispose()` | Delivers nothing more, moves the story no further, and disposes the session. |

### Delivering a batch

For each effect in order, the player:

1. records it as `Turn` when it is a Turn;
2. applies an `Effect.Audio` to `Audio`;
3. dispatches an `Effect.Callback` through the callback table;
4. calls `OnEffect`.

When the batch ends with `Effect.Hold`, `HoldDue` is set to the clock plus `Ms`, and the next `Update()` at or after it calls `Elapsed()`. Any verb clears a pending hold.

**A verb called from inside a handler** throws `ReentrantVerbException` (`Code.Reentrant`): the rest of the batch would arrive after the new one. Queue the verb and call it after the handler returns.

## Named callbacks

The author declares a callback's name and event; you register a handler against the name on the `Player`. The engine never sees the table.

| Member | What it does |
| --- | --- |
| `OnCallback(string name, Action<CallbackEvent> handler)` | Calls `handler` whenever the callback named `name` fires, replacing any handler already under that name. Names are compared ordinally. |
| `RemoveCallback(string name)` | Removes the handler under `name`. |
| `OnAnyCallback(Action<CallbackEvent> handler)` | Calls `handler` for every callback that fires, registered or not. Adds to any already there. |
| `ClearCallbacks()` | Removes every named and every catch-all handler. |
| `CallbackMisses` | `long`: how many callbacks fired with nothing registered under their name. |

- **A handler is read-only.** It cannot change what the story does; the story plays on identically with nobody listening.
- **A miss is ordinary**, not a failure: it is counted in `CallbackMisses` and delivery goes on.
- **A handler that throws** is absorbed: the exception goes to `OnError`, and the rest of the batch is still delivered.
- **A handler runs inside the verb**, on the thread that called it, and cannot call a verb (see [Player](#player)).
- **A name is the only join** between the author's declaration and your code. A rename on the author's side breaks the match without any diagnostic.

A host not using `Player` reads `Effect.Callback` from the batch and looks up `Event.Callback` in a table of its own.

## Sound

No speaker ships. The session says what the story asks for as `Effect.Audio`; the engine's scheduler (`Mixer`) decides every voice; `SoundscapeDriver` drives the scheduler; your `ISpeaker` makes the sound. The contract is [`docs/speaker.md`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration/blob/main/docs/speaker.md).

### AudioCommand

| `Kind` | Fields used | What it asks |
| --- | --- | --- |
| `Play` | `Soundscape`, `FadeMs` (fade-in) | Play a soundscape. |
| `Stop` | `FadeMs` (fade-out) | Stop the soundscape. |
| `Cut` | none | Stop everything at once, cues included. |
| `Cue` | `Media`, `Volume`, `Speed`, `Node` | Play a sound once. |

### SoundscapeDriver

```csharp
public SoundscapeDriver(Campaign campaign, ISpeaker speaker, SoundscapeOptions? options = null)
```

| `SoundscapeOptions` field | Type | Default | What it is |
| --- | --- | --- | --- |
| `MaxCues` | `uint` | `8` | How many cues may sound at once; the oldest gives way. |
| `GainStep` | `double` | `0.004` | The smallest change of gain worth a gain command. |
| `Muted` | `bool` | `false` | Start muted. |
| `Now` | `Func<ulong>?` | `null` | The clock in milliseconds; `Clocks.Steady()` when null. |

| Member | What it does |
| --- | --- |
| `Apply(AudioCommand command)` | Obeys one of the session's audio commands. A `Play` with no soundscape, and a `Cue` whose medium has no path, are ignored. |
| `Update()` | Call it from your loop: hears what the voices reported and moves the timeline on. The editor ticks every 25 ms, and more often loses nothing. |
| `Pause()`, `Resume()` | Holds every voice and the timeline with them, and lets them go. Does not pause the story. |
| `Muted` | `bool`, get and set: mutes or unmutes at once. The scheduler writes every gain as zero and remembers the rest. |
| `Playing` | `string?`: the soundscape in force, by id, sounding or waiting its turn. |
| `Idle` | `bool`: whether nothing sounds, waits or cues. |
| `Voices` | `int`: how many voices the speaker holds open now. |
| `Dispose()` | Stops every voice the speaker holds, and the scheduler with them. |

The driver does what the scheduler asks of a host, so a speaker must not: the tick, a late voice (the time `Open` took, times `Rate`, is added to `FromMs`, and a looping clip wraps inside its loop; a clip already over is reported ended), reporting voices ended or measured, telling the scheduler about tracks with no file, mute, and the handover between soundscapes. A failure inside the scheduler stops the sound rather than the story: the driver swallows it. The driver reads media paths from its campaign, so keep the campaign undisposed while the driver is in use.

### ISpeaker and IVoice

```csharp
public interface ISpeaker
{
    IVoice? Open(VoiceSource source, VoiceRole role, VoiceEvents events);
    bool Resolves(VoiceSource source);
}

public interface IVoice
{
    void Play(VoicePlay request);
    void SetGain(double gain);
    void Pause();
    void Resume();
    void Stop();
}
```

They are interfaces, so a `MonoBehaviour` or a Godot `Node` can be the speaker.

| Member | Obligation |
| --- | --- |
| `ISpeaker.Open` | Return once the voice can begin at once: the file opened, or enough of it decoded. Return null when the file cannot be played; that is heard as silence and never retried. Keep `events` with the voice. `role` is a hint: a `Track` may be minutes long and is usually better streamed, a `Cue` is short and must start on time. For a campaign opened from memory `source.File` is null: read `Campaign.MediaBytes(source.Media)`. |
| `ISpeaker.Resolves` | Asked before a soundscape plays. Answer false for a medium the speaker cannot play, so the track is told to the scheduler as silence up front. Answer true when unsure. Required; there is no default. |
| `IVoice.Play` | Begin at once, replacing whatever the voice was playing. May be called again on the same voice for a gapless bed whose file ended. Play from `FromMs` to `ToMs`, or to the file's end. When `Looping`, reaching `ToMs` comes round to `LoopFromMs`, not `FromMs`. |
| `IVoice.SetGain` | Write a new gain. The scheduler writes one every tick a fade moves, so smooth between them over a few milliseconds. |
| `IVoice.Pause`, `IVoice.Resume` | Hold the voice exactly where it is, and let it go again. |
| `IVoice.Stop` | End the voice for good and release its resources. No `Ended` follows. |
| `VoiceEvents.Ended()` | Call once per play, when a non-looping voice reaches the end of what it was given. Never after `Stop()`, never for a looping voice. |
| `VoiceEvents.Duration(double ms)` | Call once, when the file's length is known. |

Both `VoiceEvents` calls are thread-safe and may come from an audio thread; the driver hears them on its next `Update()`. A call from a voice that was stopped, or after the driver is gone, is ignored.

**The gain scale is cubic.** A speaker writing amplitude writes `gain * gain * gain`.

| Record or enum | Fields |
| --- | --- |
| `VoiceSource` | `Media` (`uint`, by index into the manifest's media); `Path` (`string`, inside the bundle); `File` (`string?`, on disk, for a campaign opened from a folder) |
| `VoicePlay` | `FromMs` (`double`); `ToMs` (`double?`, the file's end when null); `Gain` (`double`, 0 to 1 on the cubic scale); `Rate` (`double`, 1 is as recorded); `Looping` (`bool`); `LoopFromMs` (`double`) |
| `VoiceRole` | `Track`, `Cue` |
| `Clocks.Steady()` | `Func<ulong>`: milliseconds since the clock was made, monotonic, from `Stopwatch` |

### Mixer

`Mixer` is the engine's scheduler, raw, for a host not using the driver: commands in, `IReadOnlyList<VoiceCommand>` out, your clock on every verb. A host that uses it directly owes the driver's duties above by hand.

| Member | What it does |
| --- | --- |
| `Mixer.Create(uint maxCues = 8, double gainStep = 0.004)` | A new scheduler. |
| `Play(ulong nowMs, Soundscape scape, IReadOnlyList<uint>? unresolved = null, ulong atMs = 0, bool muted = false)` | Plays a soundscape from `atMs` into it. Tracks listed in `unresolved`, by index, are heard as silence. |
| `Stop(nowMs)`, `Cut(nowMs)`, `Pause(nowMs)`, `Resume(nowMs)`, `Tick(nowMs)` | The scheduler's verbs. |
| `Cue(ulong nowMs, uint media, double volume, double speed)` | Plays a sound once. |
| `VoiceEnded(ulong nowMs, ulong voice)` | A voice reached its end. |
| `DurationKnown(ulong voice, ulong ms)` | A voice's file length is known. |
| `Muted` | `bool`, get and set. |
| `PlayingId`, `FinishingId` | `string?`: the soundscape in force, and the one fading out, by id. |
| `State` | `Phase?`; `TrackState(uint track)` answers `Phase`. `Phase` is `Queued`, `Starting`, `Playing`, `Finishing`, `Finished`. |
| `PositionMs` (`ulong`), `Pass` (`uint`), `RanOut`, `IsPaused`, `IsIdle` (`bool`) | Where the scheduler is. `IsIdle` is when a tick may rest. |
| `Dispose()` | Releases the scheduler. |

`VoiceCommand` fields: `Kind` (`VoiceKind`: `Open`, `Gain`, `Stop`, `Pause`, `Resume`); `Voice` (`ulong`); `Media`, `Track` (`uint`); `FromMs`, `LoopFromMs` (`ulong`); `ToMs` (`ulong?`); `Gain` (`double`); `Rate` (`double`, default 1.0); `Looping` (`bool`); `Role` (`VoiceRole`).

## Errors

Every failure the engine reports is a `RippleException` subclass. `Failure` carries what the engine said, and `Code` is `Failure.Code`. A verb refused with a `HostException` moved nothing.

| Exception | `Code` values | Meaning | Met in |
| --- | --- | --- | --- |
| `BundleException` | `BundleFormat` (1), `BundleVersion` (2) | A document of the bundle is malformed or missing, or is from a version this engine cannot read. | Normal use: opening a bad or newer bundle. |
| `NeedsPythonException` | `NeedsPython` (3) | The bundle needs Python, and this is the `NoPython` engine. | Normal use: opening. |
| `HostException` | `WrongTurn` (10), `NoSuchChoice` (11), `ChoiceSpent` (12), `Stopped` (13), `NothingAsked` (14), `UnknownLocale` (15) | A verb that does not answer the turn, a choice past those offered, a choice used up or closed, a session that has stopped, a verb before `Start()`, a language the campaign is not readable in. | A host bug, except `ChoiceSpent` when you offer an unavailable choice and `UnknownLocale` from user input. |
| `ResumeException` | `BoardGone` (20), `NodeGone` (21) | A save names a board or node the campaign no longer has. | Normal use: a save from an older build of the story. |
| `InvalidArgumentException` | `InvalidArgument` (-1) | A malformed argument: a null handle, text that is not UTF-8, a value out of range. Also any code the binding does not know. | A bug. |
| `EngineTrapException` | `Trap` (-2) | The engine panicked, now or earlier on this handle. | A bug in the engine. |
| `ReentrantVerbException` | `Reentrant` (-100) | A `Player` verb called while it was delivering a batch. The binding's own code. | A host bug. |
| `EngineNotFoundException` | none; derives from `Exception` | The engine library could not be loaded for this platform, or binds another contract. | Packaging: reference exactly one engine package of the same `MAJOR.MINOR`. |

`Code.Success` (0) is never thrown.

| `Failure` field | Type | Set for |
| --- | --- | --- |
| `Code`, `Message` | `Code`, `string` | every failure |
| `Location` | `string?` | `BundleFormat`: the document at fault |
| `Found`, `Supported` | `long` | `BundleVersion`: the bundle's format, and the newest this engine reads |
| `Oldest` | `long?` | `BundleVersion`: the oldest, when there is a floor |
| `Asked`, `Answered` | `uint` | `WrongTurn`: what the story was asking (`RippleTurnKind`: 0 present, 1 ask, 2 wait, 3 ended, 4 failed, 5 stopped) and the verb that answered (`RippleVerb`: 0 choose, 1 answer, 2 elapsed) |
| `Offered`, `Chosen` | `uint` | `NoSuchChoice`: how many choices were offered, and the index taken |
| `Subject` | `string` | the choice, locale, board or node a host or resume error is about |
| `Node` | `string` | `NodeGone`: the node |

Other exceptions the bindings throw:

- `ObjectDisposedException` from any member of a disposed `Campaign`, `Session` or `Mixer`.
- `ArgumentOutOfRangeException` from `Choose` with a negative index; leave with `Leave()`.
- `InvalidOperationException` from `Value.AsBool()` and the other readers for a value of another kind.

**A trap poisons the handle.** After `EngineTrapException`, dispose the session (and the campaign, if the trap came from it), open again, and resume from the last checkpoint. Every later call on a poisoned handle throws `EngineTrapException` again.

## Threading and lifetime

- **One caller at a time per handle.** A `Campaign`, `Session` or `Mixer` is not thread-safe. A handle may move between threads.
- **The engine starts no thread, never sleeps and never reads a clock.** A `Hold` is answered by your clock. `Player` and `SoundscapeDriver` read the clock they were given and own no thread: your game loop is the timer.
- **`VoiceEvents` is the one thing callable from any thread.**
- **Every verb is synchronous.** A script runs inside the verb that reached it, for up to `ScriptDeadlineMs`. If that cannot be spent on your main thread, own the session on a worker and marshal the effects back: they are values.
- **Everything a verb answers is a copy.** Effects, passages and values are C# records that outlive the session and the campaign. The engine's batch is freed before the verb returns, and `RippleEngine.Outstanding` is zero whenever no call is in flight.
- **`Campaign`, `Session`, `Mixer`, `SoundscapeDriver` and `Player` are `IDisposable`.** A forgotten `Dispose` is collected by the finalizer rather than leaked. A disposed handle throws `ObjectDisposedException` rather than reaching the engine.
- **A session outlives its campaign:** dispose the campaign first and the session goes on working.
- **`Player` owns its session** and disposes it. It does not own its `SoundscapeDriver`.

## A complete host

A terminal host over a bundle folder: two sittings with a save between them, a speaker that prints what it would play, the author's callbacks, and recovery from a trap.

```csharp
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using RippleFx.Engine;

public static class Host
{
    static readonly ulong Seed = (ulong)DateTime.UtcNow.Ticks;
    static readonly SessionOptions Options = new SessionOptions { Untranslated = Untranslated.FallBack };
    static readonly Queue<Action> Later = new Queue<Action>();   // verbs a handler asked for
    static string? autosave;                                      // the last Checkpoint(), kept with Seed

    public static int Main(string[] args)
    {
        var folder = args[0];
        try
        {
            Console.WriteLine($"engine {RippleEngine.Version}, contract {RippleEngine.Contract}, Python {RippleEngine.HasPython}");

            using var campaign = Campaign.OpenDirectory(folder);
            var manifest = campaign.Manifest;                     // read once and kept
            foreach (var problem in campaign.Validate())
                Console.Error.WriteLine($"{problem.Location}: {problem.Message}");

            var config = new SessionConfig
            {
                Board = manifest.Entries[0],
                Locale = manifest.Project.DefaultLocale,
                Seed = Seed,
                Options = Options,
            };

            using var audio = new SoundscapeDriver(campaign, new LoggingSpeaker(campaign));

            // The first sitting: three passages, then the story is put down.
            string? save;
            using (var player = NewPlayer(Session.Create(campaign, config), audio))
            {
                player.Start();
                save = Play(player, audio, passages: 3) ? player.Pause() : null;
            }

            // The second sitting: a new session from the save, with the same seed.
            if (save != null)
            {
                using var player = NewPlayer(Session.Resume(campaign, save, Seed, Options), audio);
                player.Start();                                   // re-shows the turn the save was on
                Play(player, audio, passages: int.MaxValue);
            }
            return 0;
        }
        catch (EngineNotFoundException error)
        {
            Console.Error.WriteLine(error.Message);               // names the packages to reference
            return 3;
        }
        catch (NeedsPythonException)
        {
            Console.Error.WriteLine("This campaign runs Python: reference RippleFx.Engine.Native.");
            return 2;
        }
        catch (BundleException error)
        {
            Console.Error.WriteLine($"{error.Failure.Location}: {error.Message}");
            return 2;
        }
        catch (ResumeException)
        {
            Console.Error.WriteLine("This save is from an older build of the story.");
            return 2;
        }
        catch (EngineTrapException) when (autosave != null)
        {
            // The handles that saw the trap are poisoned: open again and resume from the checkpoint.
            using var campaign = Campaign.OpenDirectory(folder);
            using var audio = new SoundscapeDriver(campaign, new LoggingSpeaker(campaign));
            using var player = NewPlayer(Session.Resume(campaign, autosave!, Seed, Options), audio);
            player.Start();
            Play(player, audio, passages: int.MaxValue);
            return 0;
        }
    }

    static Player NewPlayer(Session session, SoundscapeDriver audio)
    {
        var player = new Player(session, new PlayerHandlers
        {
            Audio = audio,                                        // every Effect.Audio goes to the driver
            OnError = error => Console.Error.WriteLine($"host: {error.Message}"),
            OnEffect = effect =>
            {
                if (effect is Effect.Changed { Cvars: { } cvars })
                    foreach (var cvar in cvars)
                        Console.WriteLine($"  [{cvar.Name} = {cvar.Value}]");
            },
        });

        player.OnCallback("chapterTwoBegan", fired => Console.WriteLine($"  [chapter two, board {fired.Board}]"));
        // A verb inside a handler throws ReentrantVerbException: queue it for after delivery.
        player.OnCallback("quitToTitle", fired => Later.Enqueue(() => player.Stop()));
        player.OnAnyCallback(fired => Console.WriteLine($"  [{fired.Callback}: {fired.EventName}]"));
        return player;
    }

    // Plays until the story is over (false) or `passages` passages have been answered (true).
    static bool Play(Player player, SoundscapeDriver audio, int passages)
    {
        var answered = 0;
        while (true)
        {
            audio.Update();                                       // the sound's tick
            player.Update();                                      // answers a Hold that has come due
            while (Later.Count > 0) Later.Dequeue()();

            switch (player.Turn)
            {
                case null:
                case Effect { IsOver: true }:
                    Report(player.Turn);
                    return false;
                case Effect.Hold:
                    Thread.Sleep(25);                             // a frame; the engine never sleeps
                    break;
                case Effect.Show shown:
                    if (answered++ == passages) return true;
                    autosave = player.Session.Checkpoint() ?? autosave;
                    Choose(player, shown.Passage);
                    break;
                case Effect.Ask asked:
                    player.Answer(Fill(asked.Prompt));            // null leaves the form
                    break;
            }
        }
    }

    static void Choose(Player player, Passage passage)
    {
        Console.WriteLine($"\n== {passage.Title} ==\n{passage.Text}");   // Markdown or HTML, by Manifest.TextFormat
        if (passage.Untranslated != null)
            Console.WriteLine($"(not translated into {passage.Untranslated})");
        if (passage.Choices.Count == 0)
        {
            player.Leave();                                       // a dead end: leaving is the only answer
            return;
        }
        for (var i = 0; i < passage.Choices.Count; i++)
        {
            var choice = passage.Choices[i];
            Console.WriteLine($"  {i + 1}. {choice.Text}{(choice.Available ? "" : " (unavailable)")}");
        }
        while (true)
        {
            Console.Write("> ");
            var line = Console.ReadLine();
            if (line == null)
            {
                player.Leave();                                   // the reader leaves the passage
                return;
            }
            if (!int.TryParse(line, NumberStyles.Integer, CultureInfo.InvariantCulture, out var picked)
                || picked < 1 || picked > passage.Choices.Count)
                continue;
            try
            {
                player.Choose(picked - 1);
                return;
            }
            catch (HostException error) when (error.Code == Code.ChoiceSpent)
            {
                Console.WriteLine("That way is closed.");          // nothing moved: ask again
            }
        }
    }

    static IEnumerable<KeyValuePair<string, Value>>? Fill(Prompt prompt)
    {
        Console.WriteLine($"\n-- {prompt.Title} --");
        var answers = new List<KeyValuePair<string, Value>>();
        foreach (var field in prompt.Fields)
        {
            Console.Write($"{field.Name} [{field.Default}]: ");
            var line = Console.ReadLine();
            if (line == null) return null;                        // the reader leaves the form
            var value = line.Length == 0 ? field.Default : field.Type switch
            {
                "number" => long.TryParse(line, NumberStyles.Integer, CultureInfo.InvariantCulture, out var whole)
                    ? Value.Int(whole)
                    : Value.Float(double.Parse(line, CultureInfo.InvariantCulture)),
                "bool" => Value.Bool(line == "y"),
                _ => Value.Text(line),                            // the list types and json need parsing of their own
            };
            answers.Add(new KeyValuePair<string, Value>(field.Name, value));
        }
        return answers;
    }

    static void Report(Effect? turn)
    {
        switch (turn)
        {
            case Effect.Ended ended:
                Console.WriteLine(ended.RanOut ? "\n(the story ran out)" : $"\n{ended.Title ?? "The end"}");
                break;
            case Effect.Failed failed:
                Console.WriteLine($"\nThe story could not go on at {failed.Node}: {failed.Message}");
                break;
            case Effect.Stopped:
                Console.WriteLine("\n(stopped)");
                break;
        }
    }
}

// Prints what it would play. A real speaker opens the file in your audio API.
sealed class LoggingSpeaker : ISpeaker
{
    private readonly Campaign campaign;

    public LoggingSpeaker(Campaign campaign) => this.campaign = campaign;

    public bool Resolves(VoiceSource source) => true;            // true when unsure

    public IVoice? Open(VoiceSource source, VoiceRole role, VoiceEvents events)
    {
        // A campaign opened from memory has no File: the bytes come from the campaign.
        var bytes = source.File == null ? campaign.MediaBytes(source.Media) : null;
        if (source.File == null && bytes == null) return null;   // silence, never retried
        return new LoggingVoice(source.Path, role);              // a real voice keeps `events`
    }
}

sealed class LoggingVoice : IVoice
{
    private readonly string path;
    private readonly VoiceRole role;

    public LoggingVoice(string path, VoiceRole role)
    {
        this.path = path;
        this.role = role;
    }

    public void Play(VoicePlay request) =>
        Console.WriteLine($"  [{role} {path}] from {request.FromMs:F0} ms, amplitude {Math.Pow(request.Gain, 3):F2}"
            + (request.Looping ? $", looping back to {request.LoopFromMs:F0} ms" : ""));

    public void SetGain(double gain) { }                          // amplitude is gain³, smoothed over a few ms
    public void Pause() { }
    public void Resume() { }
    public void Stop() => Console.WriteLine($"  [{role} {path}] stop");   // for good: no Ended after this

    // A real voice calls events.Ended() from its audio thread at the end of a non-looping play,
    // and events.Duration(ms) once the file's length is known.
}
```

The repository's [`examples/ConsolePlayer`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration/tree/main/examples/ConsolePlayer) is a runnable terminal player over any bundle folder.

## Related

- [Embedding the engine](/explanation/embedding-the-engine/): what a host is responsible for, and what the engine does itself.
- [How the engine ships](/explanation/how-the-engine-ships/): engine releases, contracts and the two variants.
- [Play a campaign in your program](/how-to/play-a-campaign-in-your-program/): the steps from an exported bundle to a running story.
- [Host callbacks](/explanation/host-callbacks/): why the author declares a callback and the host registers it.
- [Export a project or campaign](/how-to/export-a-project-or-campaign/): making the bundle this binding opens.
