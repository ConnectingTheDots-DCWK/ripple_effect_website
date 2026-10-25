---
title: JavaScript and TypeScript binding
description: "The JavaScript and TypeScript binding of the Ripple Effect engine: @ripplefx/player and @ripplefx/soundscape on npm, every class, member, option, effect and error."
---

The engine's binding for JavaScript and TypeScript is two packages on npm, for a browser page or for Node. [`@ripplefx/player`](https://www.npmjs.com/package/@ripplefx/player) carries the engine as a WebAssembly component, in both variants, and the TypeScript API over it. [`@ripplefx/soundscape`](https://www.npmjs.com/package/@ripplefx/soundscape) is the Web Audio speaker for a campaign's soundscapes, and is optional. Version 1.6.x of each binds Ripple Effect contract 1.6, *Grammar Lich*, and carries the engine's world `ripple:engine@1.6.0`: a package's `MAJOR.MINOR` is the contract, and its `PATCH` is the package's own. The source is public at [ConnectingTheDots-DCWK/ripple_effect_js_ts_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_js_ts_integration).

`@ripplefx/player`'s code is MIT. The engine inside it is under the [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/): free to ship, unmodified in function, as part of your own product. Reproduce the package's `ENGINE-NOTICE` wherever your product lists the third-party software it uses. `@ripplefx/soundscape` carries no engine and is plain MIT.

## Packages and installing

```sh
npm install @ripplefx/player                        # the player
npm install @ripplefx/player @ripplefx/soundscape   # and the Web Audio speaker
```

| Package | Exports | Runs in | Needs |
| --- | --- | --- | --- |
| `@ripplefx/player` | `Campaign`, `Session`, `Player`, `SoundscapeDriver`, the effects, the values, the errors | browsers, Node 22.18 or later | nothing else |
| `@ripplefx/soundscape` | `WebAudioSpeaker`, `amplitude` | browsers (Web Audio) | `@ripplefx/player` 1.6, which it peers on |

Both are ES modules. The player ships `dist/`, both engine variants under `generated/`, `LICENSE` and `ENGINE-NOTICE`.

### Bundlers

The package names each engine file as `new URL(…, import.meta.url)`, which Vite, webpack 5, esbuild and Astro all follow: the bundler copies the `.wasm` files beside the page with no configuration. In Node the files are read from disk.

To serve the engine's files from somewhere else, a CDN say, pass `wasmBase` to `Campaign.load` or `Campaign.fromFiles`. It is a URL, resolved against the page, holding a `python/` and a `no-python/` directory laid out as the package's `generated/` is; each holds `engine.core.wasm`, `engine.core2.wasm` and `engine.core3.wasm`. Serve the engine with the page, never from a GitHub release: release downloads send no `Access-Control-Allow-Origin`, so a browser cannot read them.

### Serving

| What | Rule |
| --- | --- |
| `.wasm` files | Serve as `application/wasm`, so the engine compiles while it downloads. Any other type still works, after the download. A long cache lifetime on a hashed name. |
| Cross-origin isolation | Not needed. No `COOP` or `COEP` header: the engine uses no `SharedArrayBuffer` and no threads. |
| `X-Content-Type-Options: nosniff` | Set it; with the `.wasm` type it is the one header a static host has to be told about. |
| The campaign | A compiled campaign (the editor's *Export → Campaign*) served as a folder, as it is, `campaign.json` at its root. |
| A campaign on another origin | That origin sends CORS headers on every file of the bundle. |
| Media on another origin | That origin sends CORS headers, or Web Audio hears the file as silence. |

### Media paths

A media path is the author's own folder and file names, spaces, accents, `#` and `?` included. It is URL-encoded **a segment at a time**, never as a whole, because an encoded `/` names a different file. `Campaign.load` does this for you. For a resolver of your own, the package exports the function it uses.

| Export | Signature | Does |
| --- | --- | --- |
| `encodePath` | `(path: string) => string` | Encodes each `/`-separated segment with `encodeURIComponent` and joins them with `/`. |

## Choosing the variant

The engine comes in two variants, `python` (with the Python interpreter) and `no-python`. `Campaign.load` and `Campaign.fromFiles` read `campaign.json` before any engine exists and pick one from the `python` option.

| `python` | Loads |
| --- | --- |
| `'auto'` (default) | `python` when the bundle's `needs` includes `python`, otherwise `no-python`. A bundle older than format 15 cannot say, and gets `python`. From format 15 an absent `needs` means none. |
| `true` | `python`, always. |
| `false` | `no-python`, always. A bundle whose `needs` includes `python` is refused with `NeedsPython`. A bundle older than format 15 opens, with its scripts unavailable. |

| Variant | Over the wire |
| --- | --- |
| `python` | about 1.36 MB, and the WASI shim it imports |
| `no-python` | about 0.31 MB |

The `python` variant runs with a WASI that has nothing behind it: no files, no environment, no network. The engine asks it for a clock and for entropy.

In an engine without Python a Script node reports and a snippet renders a warning in place; `session.pythonAvailable` is `false`, and `consoleFeed` answers an `unavailable` failure rather than throwing.

## Platforms

| Platform | Status |
| --- | --- |
| Chromium | Tested: every conformance fixture through a Vite bundle loading each bundle over HTTP; the speaker's voices. |
| Firefox | Tested, as Chromium. |
| WebKit | Tested, as Chromium, in WebKitGTK. Safari on macOS and iOS is not yet confirmed for the speaker's tracks. |
| Node 22.18 or later | Tested: every conformance fixture, through `Session` and through `Player`, in both variants. No speaker. |

The fixtures are 33 with Python and 27 without.

The engine runs **on the calling thread**. There is no Worker transport: every verb is synchronous, and a Worker would make every verb a promise. A page whose campaign runs heavy scripts can run the binding in a Worker of its own and post the effects across.

For the engine's native and web targets, see [Engine targets](/reference/engine-targets/).

## The engine

No engine class is exported. A `Campaign` loads its engine: each `.wasm` file is compiled once per page and cached by URL, and each campaign gets an instance of its own, so a trap ruins one campaign and no other.

| Export | Kind | What it is |
| --- | --- | --- |
| `Variant` | type | `'python' \| 'no-python'`. |
| `EngineOptions` | interface | `{ wasmBase?: string \| URL }`, extended by `CampaignOptions`. |

| Member of `Campaign` | Type | What it is |
| --- | --- | --- |
| `variant` | `Variant` | Which engine the campaign was opened in. |
| `hasPython` | `boolean` | Whether that engine has the interpreter. |
| `engineVersion` | `string` | The engine's version, `MAJOR.MINOR.PATCH`. |

## Campaign

A compiled campaign, opened in an engine of the variant it needs. The constructor is private.

### Opening

```ts
static load(base: string | URL, options?: CampaignOptions): Promise<Campaign>
static fromFiles(files: BundleFiles, options?: CampaignOptions): Promise<Campaign>
```

| Function | Takes | Does |
| --- | --- | --- |
| `Campaign.load` | `base`: a URL ending in `/`, or the URL of `campaign.json` itself. A relative URL resolves against the page; a URL ending in neither gets a `/`. | Fetches `campaign.json` and every document its tables name (boards, passages, components, scripts, machines, soundscapes) while the engine loads, then opens the campaign. No media bytes are fetched. Media resolve against `base`, a segment at a time. |
| `Campaign.fromFiles` | `files`: a `Map` or a plain object of bundle path to `string` or `Uint8Array`. Must contain `campaign.json`. | Opens a bundle you already hold. A string is a document; bytes are an asset handed to the engine. **Media resolve only through `options.mediaUrl`**: without it no picture or sound has a URL. |

`BundleFiles` is `ReadonlyMap<string, string | Uint8Array>` or `Readonly<Record<string, string | Uint8Array>>`.

### `CampaignOptions`

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `python` | `boolean \| 'auto'` | `'auto'` | Which variant to load. See [Choosing the variant](#choosing-the-variant). |
| `fetch` | `RequestInit` | none | Passed to every `fetch` the loader makes: credentials, a signal. |
| `mediaUrl` | `(path: string) => URL \| string \| undefined` | none | Where a media file is, for a campaign opened with `fromFiles`. A string resolves against the page. Ignored by `load`. |
| `wasmBase` | `string \| URL` | beside the package | Where the engine's files are served. See [Bundlers](#bundlers). |

### Members

| Member | Signature | Answers |
| --- | --- | --- |
| `manifest` | `CampaignManifest` | The bundle's `campaign.json`, as the engine read it. |
| `variant`, `hasPython`, `engineVersion` | | See [The engine](#the-engine). |
| `mediaUrl` | `(index: number) => URL \| undefined` | Where the media file at `index` in `manifest.media` is, or `undefined`. |
| `mediaPath` | `(index: number) => string \| undefined` | That file's path in the bundle. |
| `coverUrl` | `URL \| undefined` | Where the project's cover picture is, if it has one. |
| `soundscape` | `(index: number) => Soundscape` | The soundscape at `index` in `manifest.soundscapes`. Throws `BundleError` for one that will not read. |
| `boardIndex` | `(id: string) => number \| undefined` | The index of the board whose catalog id is `id`. |
| `validate` | `() => { message: string; location: string }[]` | What is wrong with the bundle, each problem and where. Empty when nothing is. |
| `coerceCvar` | `(type: string, value: RippleValue) => RippleValue \| undefined` | The value as a console variable of `type` would hold it, or `undefined` when it does not fit. |
| `asText` | `(value: RippleValue) => string` | The value as the story prints it, the text a snippet shows. |
| `describeCvarRefusal` | `(name: string, type: string, value: RippleValue) => string` | The sentence the engine refuses writing `value` to a variable of `type` with. English, for showing. |
| `session` | `(start?: SessionStart) => Session` | A session on this campaign, not yet started. See [Session](#session). |

`coerceCvar`, `asText` and `describeCvarRefusal` need no session.

### `CampaignManifest`

| Field | Type | Meaning |
| --- | --- | --- |
| `format` | `number` | The bundle format. |
| `generator` | `string`, optional | What wrote the bundle. |
| `textFormat` | `string` | `markdown`, or `html` for a campaign exported as HTML. |
| `project.title` | `string` | |
| `project.description` | `string` | |
| `project.defaultLocale` | `string` | The language the story was written in. |
| `project.locales` | `readonly string[]` | Every language the campaign has. |
| `project.cover` | `string`, optional | The cover picture's path in the bundle. |
| `entries` | `readonly number[]` | The boards a story may begin on, as indices into `boards`. |
| `boards`, `passages`, `components`, `scripts`, `media`, `machines`, `soundscapes` | `readonly BundleEntry[]` | The bundle's tables. A `BundleEntry` is `{ id, name, path }`, all strings. |
| `cvars` | `readonly { name: string; type: string; default: RippleValue }[]` | The console variables the campaign declares. |
| `needs` | `readonly string[]` | What the campaign needs of an engine: `python` when it runs scripts. |
| `permissions` | `readonly string[]` | What the story reads of the world outside it, `dateTime` and `location`, listed by the compiler. A session asks about each before it begins, unless the host has answered already. Strings rather than `PermissionKind`, because the list is open for appending. |

## Session

The host API's verbs, one to one with the engine's. Every verb runs synchronously and answers the ordered effects it led to; the last of them says where the story now is.

```ts
campaign.session(start?: SessionStart): Session
Session.create(campaign: Campaign, start?: SessionStart): Session   // the same
Session.resume(campaign: Campaign, save: string, start?: ResumeStart): Session
```

`Session.create` throws `BundleError` when the campaign cannot be started as asked. `Session.resume` picks up a save that `pause()` or `checkpoint()` wrote, and throws `ResumeError` when the save no longer fits the campaign. A resumed session is started with `start()`, like a new one.

### `SessionStart`

`SessionStart` is `SessionOptions` and these fields.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `seed` | `number \| bigint` | `0` | What the dice are seeded with. The one setting to always choose: left out, every reader rolls the same dice. |
| `locale` | `string` | `project.defaultLocale` | The language to begin in. |
| `board` | `number` | `manifest.entries[0]`, or `0` | The board to begin on, by index into `manifest.boards`. |
| `entryNode` | `string` | the board's entry | The node to begin at. |
| `digest` | `string` | none | A label stamped on every save this session writes, a hash of the bundle say, so you can tell your own saves apart. The engine carries it and never compares it. |

### `ResumeStart`

`ResumeStart` is `SessionOptions` and `seed` (`number | bigint`, default `0`). A save carries no dice state: to roll on where the story was, copy `generator` from the old session to the resumed one.

### `SessionOptions`

Each defaults to the engine's own.

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `stepBudget` | `number` | `1048576` | How many node turns one board may take before the run is called a runaway and the story fails, rather than hang the page. |
| `silentJumpLimit` | `number` | `64` | How many boards may hand over in a row without a word of story before the story fails. `0` fails the first such jump. |
| `loopLimit` | `number` | `512` | How often one loop node may go round in one board run before the story fails. **`0` is no ceiling.** |
| `scriptLimits` | `ScriptLimits` | the engine's | `{ deadlineMs, memoryBytes, recursionDepth }`, all numbers: how long a script may run, how much it may hold, how deep it may recurse. |
| `untranslated` | `'report' \| 'fall-back'` | `'report'` | A passage with no text in the language being read: `report` shows it empty and names the language; `fall-back` shows the default language's text and still names it. |
| `trace` | `boolean` | `false` | Collect the run trace in every batch, as `trace` effects. |
| `tracePayloads` | `boolean` | `false` | Include payloads in the trace. |

### Verbs

| Verb | Answers | Notes |
| --- | --- | --- |
| `start()` | `Effect[]` | Begins the story, or a resumed one. While a kind in `manifest.permissions` has no answer, the answer is one `permit` effect and nothing else: no page and no callback, until `permit` has answered them all. |
| `choose(index?: number)` | `Effect[]` | Takes the choice at `index` among those offered. With none, the reader leaves: the passage flows nowhere and the story ends there. |
| `answer(values?: Answers)` | `Effect[]` | Answers the prompt showing. Values go to the engine exactly as given, keyed by each field's `name`. An optional field left empty is left out or `null`; a required one is not submitted empty, which is the host's rule to keep. A field with `options` is answered with the picked IDs: a string, or a list of them for a `…List`. With none, the reader leaves, as with `choose()`. |
| `elapsed()` | `Effect[]` | Says the wait a `hold` asked for is over. A `Player` calls it for you. |
| `beginCountdown()` | `Effect[]` | Says the showing passage's countdown begins: its `timer.afterMs` has passed on your clock. Nothing moves; the answer is only the `countdown.started` callback, if an author declared one. A second call answers nothing. A passage with no timer is refused with `no-countdown`. A `Player` calls it for you. |
| `expire()` | `Effect[]` | Says the countdown ran out: the passage's default is taken, as `choose(timer.default)` would, after a `countdown.expired` callback. Before `beginCountdown` it is refused with `countdown-not-begun`. A `Player` calls it for you. |
| `permit(kind: PermissionKind, granted: boolean)` | `Effect[]` | The reader's answer about one kind, at any time, before `start` included, and then nobody is asked. On a `permit` turn the answer to the last kind unanswered begins the story, and this answers everything up to its first real turn. Not part of a save: answer a resumed session again. |
| `setLocale(locale: string)` | `Effect[]` | Reads on in another language. The passage or the prompt showing is shown again in it, a prompt's labels, placeholders and options reworded and its field names and option IDs kept, and a countdown keeps running: it is the same visit. |
| `restart()` | `Effect[]` | Starts over, forgetting every entity and keeping the language. |
| `stop()` | `Effect[]` | Ends the session for good. |
| `pause()` | `Paused` | Puts the story down and ends the session, answering a save. Only on a passage or a prompt: anywhere else nothing stops, and there is no save and no effect. |
| `checkpoint()` | `string \| undefined` | A save of where the story is, without putting it down. `undefined` unless the story is on a passage or a prompt. |
| `writeCvar(name, value)` | `{ outcome, effects }` | Writes a console variable. |
| `resetCvar(name)` | `{ outcome, effects }` | Puts a console variable back to its default. |
| `resetAllCvars()` | `Effect[]` | Puts every console variable back. |
| `removeEntity(key)` | `{ removed: boolean; effects: Effect[] }` | Forgets the entity under `key`. |
| `consoleFeed(code: string)` | `{ result: PythonResult; effects: Effect[] }` | One line of Python against the live story: its entities, its variables, its sounds. |

### Reading the world

What the story may read of the clock and the reader's position is handed in; the engine reads no clock and touches no sensor of its own. None of these steps the story, and none answers effects.

| Member | Signature | Does |
| --- | --- | --- |
| `setNow` | `(now?: Moment) => void` | What time it is, before every verb that can step, from a host the reader allowed `dateTime`. `undefined` is no clock. Within one verb time does not move. A `Player` calls it for you. |
| `setPosition` | `(fix?: Position) => void` | The host's last position fix, or `undefined` for none. Refused with `not-permitted` once the reader has said no to `location`. A fix given before the answer is kept and read only if the answer is yes, so a host that fetches one on a yes hands it over before the `permit` that says so. |
| `setStandIn` | `(kind: PermissionKind, typed?: string, localOffsetMinutes?: number) => void` | What the reader would rather the story believed, as they typed it: an ISO 8601 time for `dateTime`, `"lat, lon"` or a place's name for `location`. It answers whenever the real value is missing. `undefined` takes it away. A time typed without an offset is read at `localOffsetMinutes`, this machine's own on that date unless given. One that does not read is refused with `stand-in`, and the one before stays. |

| Export | Kind | What it is |
| --- | --- | --- |
| `PermissionKind` | type | `'dateTime' \| 'location'`: the host API's spelling, not the WebAssembly world's `date-time`. |
| `Moment` | interface | `{ utcMs: number; offsetMinutes: number }`: milliseconds since the epoch, and the offset in minutes the reader's wall clock is at, east positive, so Rome in October is `120`. |
| `momentOf` | `(date?: Date) => Moment` | `date` with this machine's offset at that instant; now when no date is given. |
| `Position` | interface | A fix shaped after the web's `GeolocationPosition`, every part optional: `label?: string`, `latitude?: number`, `longitude?: number`, `accuracy?: number` (metres), `when?: Moment`. A place's name with no coordinates is a fix too. |
| `localOffsetFor` | `(typed: string) => number` | The offset this machine's clock is at on the date a reader typed, which is what a stand-in written without one is read at. The offset now, for text that names no date. |

A refused verb throws `HostError` and nothing moves. `Paused` is `{ save?: string; effects: Effect[] }`. `Answers` is a `Map` or a plain object of field name to value; a nested plain object is taken as a map.

A cvar write's `outcome` is `'done'`, `'unknown'` (no such variable), or `{ refused: string }`, carrying the engine's sentence in English, for showing and never for parsing.

### Readers

Each is a snapshot as of the last verb.

| Reader | Type | What it is |
| --- | --- | --- |
| `campaign` | `Campaign` | The campaign the session plays. |
| `board` | `number` | The index of the board the story is on. |
| `locale` | `string` | The language being read. |
| `defaultLocale` | `string` | The language the story was written in. |
| `ambience` | `Ambience \| null` | The soundscape in force, or `null` for silence. |
| `entities` | `Entity[]` | Everything the story has made. |
| `memory` | `Memory` | What the story remembers of its nodes and machines. |
| `cvars` | `CvarSnapshot[]` | Every console variable, with its default and value. |
| `guard` | `GuardReport` | What the script guard has given up on this playthrough. |
| `pythonAvailable` | `boolean` | Whether this session's engine can run the campaign's scripts. |
| `describeCvarWrite(name, value)` | `string \| undefined` | Why writing `value` to `name` would be refused, or `undefined` if it would not. |

`GuardReport` is `{ abandoned: readonly string[]; refused: number; exhausted: boolean }`: the names the scripts stopped at the deadline ran under, sorted with repeats kept; how many runs were never started; whether no script will be started again.

### Python results

| `PythonResult` field | Type | Meaning |
| --- | --- | --- |
| `value` | `RippleValue` | The last expression's value, or `null`. |
| `output` | `string` | Everything it printed. |
| `error` | `PythonFailure`, optional | Why it stopped. |

| `PythonFailure` field | Type | Meaning |
| --- | --- | --- |
| `type` | `string` | The Python exception's class (`NameError`, `SyntaxError`), or one of the engine's labels: `timeout`, `refused`, `closed`, `host-error`, `unavailable` (an engine without Python). |
| `message` | `string` | |
| `line` | `number`, optional | |
| `traceback` | `string`, optional | |

### Trace and dice

| Member | Signature | Does |
| --- | --- | --- |
| `setTrace` | `(enabled: boolean) => void` | Turns the run trace on or off. |
| `setTracePayloads` | `(enabled: boolean) => void` | Turns trace payloads on or off. |
| `generator` | `{ lo: number; hi: number }`, get and set | The dice's state. A save carries none; hand it to a resumed session to roll on where the story was. |

## Effects

An `Effect` is a plain object tagged on `kind`, so a `switch` over `effect.kind` is checked for exhaustiveness. Times and indices are numbers, story values are `RippleValue`s, and a picture or a sound comes with its URL.

| `kind` | Fields | Notes |
| --- | --- | --- |
| `show` | `passage: Passage` | A passage. A turn. |
| `ask` | `prompt: Prompt` | A prompt. A turn. |
| `hold` | `ms: number` | A wait. A turn. Call `elapsed()` once `ms` have passed; a `Player` does. |
| `ended` | `title?: string`, `ranOut: boolean` | The story is over as the author wrote it, or ran out of road (`ranOut`). A turn. |
| `failed` | `message: string`, `node?: string` | The story stopped on an error. `message` is English, for showing and never for parsing. A turn. |
| `stopped` | none | The session ended, after `stop()` or `pause()`. A turn. |
| `permit` | `kinds: readonly PermissionKind[]` | The story has not begun: it reads these of the world outside it, and nobody has answered. Answer each with `permit`; the answer to the last begins the story. A turn. |
| `notice` | `notice: Notice` | A read of the clock or the position did not get the real value. Said once per kind and outcome in a playthrough, before the turn of the read. |
| `jumped` | `board: number`, `node?: string` | The story moved to another board. `board` indexes `manifest.boards`; it is not the catalog id. |
| `ambience` | `ambience: Ambience \| null` | The soundscape in force changed. `null` is silence. |
| `audio` | `command: AudioCommand` | What a speaker is told. See [Sound](#sound). |
| `changed` | `entities?`, `memory?`, `cvars?` | Which of the stores moved, each with its new contents. |
| `callback` | `event: CallbackEvent` | A named callback the author declared. See [Named callbacks](#named-callbacks). |
| `trace` | `event: RunEvent` | Only with `trace` on. The engine's own `{ tag, val }` shape, kebab-case tags and all, unmapped. |

The seven turns (`show`, `ask`, `permit`, `hold`, `ended`, `failed`, `stopped`) are the type `Turn`; one is always the last effect of a batch. `isTurn(effect: Effect): effect is Turn` tells them apart.

### Records

#### `Passage`

| Field | Type | Meaning |
| --- | --- | --- |
| `node` | `string` | The passage's node. |
| `title` | `string` | |
| `text` | `string` | The prose, after its snippets ran, in the language being read. Markdown, or HTML when `manifest.textFormat` is `html`. Render it with a library and sanitise what it produces. |
| `choices` | `readonly Choice[]` | The choices offered, in order. |
| `snippets` | `readonly { code: string; isInline: boolean }[]` | The snippets the prose ran. |
| `media` | `ReadonlyMap<string, URL>` | Every link in the prose that names a file of the campaign, to that file's URL. Links with no URL are absent. |
| `mediaIndex` | `ReadonlyMap<string, number>` | The same links, to the media index each names. |
| `untranslated` | `string`, optional | The language the passage has no text in, when that is why it is empty. |
| `soundscape` | `Soundscape`, optional | The soundscape the passage plays. |
| `silence` | `boolean` | The passage asks for silence. |
| `timer` | `ChoiceTimer`, optional | The passage's countdown; absent for one that waits for ever. |

#### `ChoiceTimer`

A passage's countdown. The engine keeps no time for it: a host waits `afterMs`, calls `beginCountdown`, waits `timeoutMs` and calls `expire`. A `Player` does all of that itself.

| Field | Type | Meaning |
| --- | --- | --- |
| `afterMs` | `number` | How long before the countdown begins, in milliseconds; zero is at once. |
| `timeoutMs` | `number` | How long it runs once begun, in milliseconds; never zero. |
| `visible` | `boolean` | Whether the author meant the reader to see it count. |
| `default` | `number` | The index into `choices` taken when it runs out. |

#### `Choice`

| Field | Type | Meaning |
| --- | --- | --- |
| `port` | `string` | The choice's port. |
| `text` | `string` | |
| `available` | `boolean` | `false` for a choice that has run out: shown, and refused with `choice-spent` if taken. |

#### `Prompt` and `PromptField`

| Field | Type | Meaning |
| --- | --- | --- |
| `Prompt.node` | `string` | |
| `Prompt.title` | `string` | |
| `Prompt.fields` | `readonly PromptField[]` | |
| `PromptField.name` | `string` | The key to answer it under: an ID, the same in every language. |
| `PromptField.type` | `string` | The field's type. |
| `PromptField.default` | `RippleValue` | What the control is filled in with, and the answer if nobody edits it. Not a placeholder. |
| `PromptField.label` | `string` | What the reader is shown, in the language being read: `name` where the author wrote nothing. |
| `PromptField.placeholder` | `string` | The hint drawn while the field is empty; empty for none. Never the answer. |
| `PromptField.optional` | `boolean` | Whether the reader may leave it empty, which answers `null`. A field that is not optional is required: do not submit it empty. |
| `PromptField.options` | `readonly PromptOption[]` | The fixed answers to pick from, in order: one pick for a scalar type, any number for a `…List`. Empty for a field the reader types into. Answered with the picked options' `id`s, never their labels or values. |
| `PromptOption.id` | `string` | What a host answers with; the same in every language. |
| `PromptOption.label` | `string` | What the reader is shown, in the language being read. |
| `PromptOption.value` | `RippleValue` | What the story is handed, of the field's type. |

#### `Notice`

A read of the clock or the position that did not get the real value.

| Field | Type | Meaning |
| --- | --- | --- |
| `code` | `string` | The playthrough code, its letter the severity: `I.RT.05` a stand-in answered, `W.RT.06` the read was refused, `I.RT.07` the host had nothing to give. |
| `kind` | `PermissionKind` | |
| `node` | `string`, optional | The node whose read it was. |
| `message` | `string` | The engine's English sentence, for showing and never for parsing. |

#### `Ambience`

| Field | Type |
| --- | --- |
| `soundscape` | `Soundscape` |
| `board` | `number` |
| `node` | `string` |

#### `Soundscape` and `Track`

Every time is in milliseconds.

| Field | Type | Meaning |
| --- | --- | --- |
| `Soundscape.id` | `string` | |
| `Soundscape.name` | `string` | |
| `Soundscape.length` | `number` | |
| `Soundscape.looping` | `boolean` | |
| `Soundscape.fadeIn`, `fadeOut` | `number` | |
| `Soundscape.volume` | `number` | |
| `Soundscape.tied` | `boolean` | |
| `Soundscape.tracks` | `readonly Track[]` | One clip each. |
| `Track.media` | `number` | Index into `manifest.media`. |
| `Track.lane` | `number` | |
| `Track.start` | `number` | Where on the timeline the clip begins. |
| `Track.clipStart`, `clipEnd?` | `number` | Where in the file it begins and ends. |
| `Track.volume`, `speed` | `number` | |
| `Track.fadeIn`, `fadeOut` | `number` | The clip's own fades. |
| `Track.mode` | `TrackMode` | `auto`, `looping` or `once`. |
| `Track.interval` | `number` | For `auto` only: the silence between one play ending and the next; `0` is a gapless bed. |

#### `Entity`, `Memory`, `CvarSnapshot`, `Changed`

| Field | Type | Meaning |
| --- | --- | --- |
| `Entity.key` | `string` | |
| `Entity.component` | `string`, optional | |
| `Entity.label` | `string` | |
| `Entity.values` | `RippleValue` | |
| `Memory.nodes` | `RippleValue` | |
| `Memory.machines` | `readonly (readonly [string, string])[]` | Pairs of strings, one per state machine. |
| `CvarSnapshot.name`, `type` | `string` | |
| `CvarSnapshot.default`, `value` | `RippleValue` | |
| `Changed.entities` | `readonly Entity[]`, optional | Present when the entities moved. |
| `Changed.memory` | `Memory`, optional | Present when memory moved. |
| `Changed.cvars` | `readonly CvarSnapshot[]`, optional | Present when the console variables moved. |

#### `CallbackEvent`

| Field | Type | Meaning |
| --- | --- | --- |
| `callback` | `string` | The author's name for it, the key a handler is registered under. |
| `event` | `CallbackEventName` | What it was declared on, dotted: `cvar.changed`. |
| `board` | `number`, optional | |
| `node` | `string`, optional | |
| `name` | `string`, optional | |
| `from`, `to` | `RippleValue`, optional | |
| `index` | `number`, optional | |

`CallbackEventName` is one of `story.started`, `board.entered`, `soundscape.changed`, `passage.shown`, `choice.taken`, `delay.started`, `delay.elapsed`, `story.ended`, `story.failed`, `cvar.changed`, `entity.spawned`, `entity.removed`, `entity.renamed`, `entity.field.changed`, `machine.state.entered`, `node.entered`, `node.exited`, `node.failed`, `countdown.started`, `countdown.expired`. `CallbackKind` is the same set as the engine's WebAssembly interface spells it, with dashes (`cvar-changed`).

#### `AudioCommand`

| `kind` | Fields |
| --- | --- |
| `play` | `soundscape: Soundscape`, `fadeInMs: number` |
| `stop` | `fadeOutMs: number` |
| `cut` | none |
| `cue` | `media: number`, `url?: URL`, `volume: number`, `speed: number`, `node?: string` |

#### `RunEvent`

One step of the run trace, as the engine's WebAssembly interface spells it. A debugging view.

### `resolveLink`

```ts
resolveLink(passage: Passage, src: string): string
```

Rewrites one link in a passage's prose to the URL of the file it names, through `passage.media`, or answers `src` unchanged. The prose keeps the author's own links; give this to your renderer's image hook.

## Values

A story's value is a `RippleValue`.

| Story type | JavaScript |
| --- | --- |
| Null | `null` |
| Boolean | `boolean` |
| Int | `bigint`, all 64 bits |
| Float | `number`, NaN and the infinities included |
| String | `string` |
| List | `readonly RippleValue[]` |
| Map | `ReadonlyMap<string, RippleValue>`, in the engine's key order |

Int and Float are different types and stay different: `7n` is an Int and `7` a Float, and a story comparing them gets `false`. Times, indices and voice ids are JavaScript numbers. A seed takes either.

**Writing a value back:**
- a plain object is taken as a map, in its own key order, so `{ gold: 3n }` is accepted where a map is meant;
- `undefined` is written as `null`;
- a `bigint` outside 64 bits throws `RangeError`;
- any other type (a function, a symbol) throws `TypeError`.

| Export | Signature | Does |
| --- | --- | --- |
| `asRecord` | `(value: RippleValue) => Record<string, RippleValue>` | A map value's entries as a plain object; `{}` for anything else. |

## Player

The loop over a session: it delivers every effect in order, keeps the turn the last one named, waits out a `hold`, runs a passage's countdown, hands the story the time once the reader has allowed it, applies the story's sound and dispatches named callbacks.

```ts
new Player(session: Session, handlers: PlayerHandlers)
```

### `PlayerHandlers`

| Handler | Type | Meaning |
| --- | --- | --- |
| `onEffect` | `(effect: Effect) => void` | Required. Every effect, in the order the engine produced it. |
| `onError` | `(error: unknown) => void` | An error from a verb the player made by itself (the `elapsed()` after a hold, a countdown's `beginCountdown()` and `expire()`), or thrown by a handler while a batch was being delivered. **Without it, a failure after a hold is an uncaught exception** thrown from a timer, and a handler's error goes to `reportError`, or `console.error` where there is none. |
| `audio` | `SoundscapeDriver` | Where the story's sound goes. Every `audio` effect is applied to it as well as handed to `onEffect`. Without one, nothing is heard. |
| `now` | `() => Moment \| undefined` | What time it is, for the story: read before every verb once the reader has allowed `dateTime` through `permit`, and never before. `momentOf` unless given; a test passes a fixed instant, and `undefined` is no clock. |
| `countdowns` | `boolean` | Whether the player runs a passage's countdown by itself. On unless `false`. **Off for a host whose clock does not wait**, a test or an agent walking every branch, where a countdown would only ever take the default; off is also how a host honours a reader who asked for no time limits (WCAG 2.2.1). The host then calls `beginCountdown` and `expire` where it means them. |
| `onCountdown` | `(countdown: Countdown \| undefined) => void` | Where the showing passage's countdown stands, for drawing: waiting out its `afterMs`, then begun, and `undefined` once there is none, because the reader chose, it ran out or the story moved. A change of language says nothing: it is the same visit and the same countdown. |

`Countdown` is `{ timer: ChoiceTimer; begun: boolean }`: `begun` is `false` while it waits out `timer.afterMs` and `true` once it runs, for `timer.timeoutMs`.

### Members

| Member | Signature | Does |
| --- | --- | --- |
| `session` | `Session` | The session underneath, for what the player does not wrap: the state readers, `checkpoint`, cvars, entities. **A verb called on it goes round the player**: a pending hold is not cancelled and may wake a later turn, and nothing it answers reaches `onEffect` or the sound. |
| `handlers` | `PlayerHandlers` | As given. |
| `turn` | `Turn \| undefined` | The last passage, prompt, question, wait or ending delivered; once `permit` has answered some of a `permit` turn's kinds, that turn less them, so a host drawing from it asks only what is left. |
| `countdown` | `Countdown \| undefined` | Where the showing passage's countdown stands, or `undefined` for none running. |
| `start()` | `void` | `session.start()`, delivered. |
| `choose(index?)` | `void` | `session.choose(index)`, delivered. |
| `answer(values?)` | `void` | `session.answer(values)`, delivered. |
| `setLocale(locale)` | `void` | `session.setLocale(locale)`, delivered. A pending wait or countdown runs on: it is the same visit. |
| `permit(kind, granted)` | `void` | `session.permit(kind, granted)`, delivered, after noting whether `dateTime` may be read. A pending wait or countdown runs on: an answer moves nothing. |
| `setStandIn(kind, typed?, localOffsetMinutes?)` | `void` | `session.setStandIn`. One that does not read throws `HostError`, and the one before stays. |
| `setPosition(fix?)` | `void` | `session.setPosition`. Throws `HostError` once the reader has said no to `location`. |
| `beginCountdown()` | `void` | `session.beginCountdown()`, delivered, for a host that runs countdowns itself (`countdowns: false`). With `countdowns` on, the player calls it when the time comes; calling it takes the countdown over. |
| `expire()` | `void` | `session.expire()`, delivered: the countdown ran out, and its default is taken. |
| `restart()` | `void` | `session.restart()`, delivered. |
| `stop()` | `void` | `session.stop()`, delivered. |
| `pause()` | `string \| undefined` | `session.pause()`: delivers its effects and answers the save, or `undefined` and nothing stopped unless the story is on a passage or a prompt. Still answers after `dispose()`, so a page can save on its way out. Not `SoundscapeDriver.pause`. |
| `consoleFeed(code)` | `PythonResult` | `session.consoleFeed(code)`; what it led to is delivered like any verb's effects. |
| `onCallback`, `onAnyCallback`, `clearCallbacks()`, `callbackMisses` | | See [Named callbacks](#named-callbacks). |
| `dispose()` | `void` | Stops waiting on any hold or countdown and delivers nothing more. After it, every verb does nothing at all, and `pause` still answers a save. |

A verb on the player throws whatever the session's verb throws (`HostError`, `EngineTrap`), to you.

### Delivery

For each effect of a batch, in order:
1. a turn becomes `turn`;
2. an `audio` effect is applied to `audio`;
3. a `callback` effect is dispatched to its handlers;
4. the effect is handed to `onEffect`.

A handler that throws is reported, and the rest of the batch still arrives. A handler that calls `dispose()` stops the batch there.

### Holds

When the last effect of a batch is a `hold`, the player sets a timer for `ms` and then calls `session.elapsed()` and delivers what it answers. A verb the session answered while the hold is pending cancels the timer, so a restart during a pause in the story does not wake the story a moment later. A verb the session refused moved nothing and cancels nothing, and `setLocale` and `permit` never cancel a wait, nor does a `pause` anywhere but a passage or a prompt, where nothing stopped. An error from that `elapsed()` goes to `onError`.

### Countdowns

When the last effect of a batch is a passage with a `timer`, and `countdowns` is not `false`, the player waits `afterMs`, calls `session.beginCountdown()`, waits `timeoutMs`, calls `session.expire()`, and delivers what each answers, telling `onCountdown` where it stands at each step. It drops both waits the moment the story moves, under the same rule as a hold: not for a verb the session refused, and not for a change of language, which re-shows the same visit. An error from either verb goes to `onError`.

### The clock

Once the reader has allowed `dateTime` through `player.permit`, every verb the player makes is preceded by `session.setNow(now())`, with the `now` handler or `momentOf`; never before. On a bare `Session`, call `setNow(momentOf())` before each verb yourself.

## Named callbacks

An author publishes named points in the editor: `chapterTwo` when a board is entered, `goldChanged` when a variable moves. A callback carries no code; you register the handler against its name.

| Member | Signature | Does |
| --- | --- | --- |
| `onCallback` | `(name: string, handler: CallbackHandler) => () => void` | Calls `handler` whenever the callback the author named `name` fires, replacing any handler already under that name. Answers the function that removes it. |
| `onAnyCallback` | `(handler: CallbackHandler) => () => void` | Calls `handler` for every callback that fires, registered or not. Answers the function that removes it. |
| `clearCallbacks` | `() => void` | Forgets every callback handler. The miss count is kept. |
| `callbackMisses` | `number` | How many callbacks fired with nothing registered under their name. |

`CallbackHandler` is `(fired: CallbackEvent) => void`. The named handler runs first, then every `onAnyCallback` handler, then `onEffect` receives the same event as `{ kind: 'callback', event }`.

- **A handler runs where the engine placed the callback**, inside the verb: a callback about a passage arrives before the passage does.
- **A handler must not call a verb on the player.** A verb called while a batch is being delivered, from a handler or from `onEffect`, throws `ReentrantVerb`. Schedule it with `queueMicrotask` or `setTimeout`.
- **A name nobody registered is not an error.** The story plays the same, and `callbackMisses` counts it.
- **A handler that throws does not stop the story.** The error goes to `onError`, and the rest of the batch still arrives.
- **A name is a published API**, the only thing joining the author's declaration to your code. Renaming one in the editor breaks the handler registered under the old name.

The names and their events are listed in [Host callbacks](/reference/host-callbacks/).

## Sound

Three layers: the session says what the story asks for as `audio` effects; the engine's scheduler decides every voice, gain and handover from them; a **speaker** makes the sounds. `SoundscapeDriver` drives the scheduler and does every duty it asks of a host. A speaker is the only part that touches an audio API.

```ts
const audio = new SoundscapeDriver(campaign, speaker, options?);
const player = new Player(session, { onEffect, audio });
```

### `SoundscapeDriver`

```ts
new SoundscapeDriver(campaign: Campaign, speaker: Speaker, options?: SoundscapeOptions)
```

| `SoundscapeOptions` | Type | Default | Meaning |
| --- | --- | --- | --- |
| `maxCues` | `number` | `8` | How many cues may sound at once; the oldest gives way. |
| `gainStep` | `number` | `0.004` | The smallest change of gain worth writing. |
| `tickMs` | `number` | `25` | How often the scheduler is ticked while anything sounds. |
| `muted` | `boolean` | `false` | Starts muted: every gain written as zero, and remembered. |
| `now` | `() => number` | `performance.now` | The clock, in milliseconds, monotonic. |

| Member | Signature | Does |
| --- | --- | --- |
| `apply` | `(command: AudioCommand) => void` | Obeys one of the session's audio commands. A `Player` with `audio` calls it for you. **A `play` whose soundscape was copied, rebuilt or parsed from JSON throws `RippleError`**: pass the effect's own object, or one `campaign.soundscape()` answered. A `cue` with no `url` is ignored. Does nothing after `dispose()`. |
| `setMuted` | `(muted: boolean) => void` | Mutes or unmutes at once; the gains the scheduler would have written are kept. |
| `muted` | `boolean` | Whether it is muted. |
| `pause` | `() => void` | Holds every voice where it is, and the clock with them, a hidden tab say. The story is not touched: not `Player.pause`. |
| `resume` | `() => void` | Lets them go again. |
| `playing` | `string \| undefined` | The id of the soundscape in force: the one sounding, or the one waiting its turn while the last fades out. |
| `idle` | `boolean` | Whether nothing sounds, waits or cues. |
| `dispose` | `() => void` | Stops everything and lets every voice go. |

What the driver does, so that a speaker does not:
- the timer;
- the scheduler's commands;
- a late voice: the time `voice()` took, times `rate`, is added to `from`, and a looping clip wraps inside its loop; a clip already over plays nothing;
- gains written before a voice was ready, applied when it is;
- tracks whose file has no URL, told to the scheduler as silence rather than tried;
- mute, which is the scheduler's: it writes zero and remembers;
- the handover between soundscapes, which never overlap. A handover waits for the outgoing soundscape's fade-out.

### The `Speaker` contract

```ts
interface Speaker {
  voice(url: URL, role: VoiceRole): Promise<Voice>;
}

type VoiceRole = 'track' | 'cue';

interface Voice {
  play(request: VoicePlay): void;
  setGain(gain: number): void;
  pause(): void;
  resume(): void;
  stop(): void;
  onEnded?: () => void;              // set by the driver
  onDuration?: (ms: number) => void; // set by the driver
}

interface VoicePlay {
  from: number;      // ms into the file
  to?: number;       // ms into the file; the file's end when absent
  gain: number;      // 0 to 1, on the engine's gain scale
  rate: number;      // 1 is as recorded
  looping: boolean;
  loopFrom: number;  // ms: where each turn of a loop comes round to
}
```

| Member | Obligation |
| --- | --- |
| `Speaker.voice(url, role)` | Resolves once the voice can begin **at once**: load the file, or enough of it. **Rejects** when the file cannot be played; the scheduler hears that as silence and never retries. `role` is a hint: a `track` may be minutes long, a `cue` is a short sound effect that must start on time. |
| `Voice.play(request)` | Begins at once and replaces whatever the voice was playing. May be called again on the same voice for a gapless bed whose file ended coming round, and must follow on as closely as the API allows. Plays from `from` to `to`, or to the file's end. When `looping`, reaching `to` comes round to **`loopFrom`, not `from`**. |
| `Voice.setGain(gain)` | Writes a new gain, on the same scale as `VoicePlay.gain`. The scheduler writes one every tick a fade moves; smooth between them over a few milliseconds, or a fade is a staircase. |
| `Voice.pause()`, `resume()` | Hold the voice exactly where it is, and let it go again. The driver pauses every voice together. |
| `Voice.stop()` | Ends the voice for good and lets its resources go. No `onEnded` follows. |
| `Voice.onEnded` | Fire once per play, when a non-looping voice reaches the end of what it was given. Never after `stop()`, never for a looping voice. |
| `Voice.onDuration(ms)` | Fire once, when the file's length is known. Until then a track played to its file's end has no end the scheduler can plan a fade-out or a gapless turn for. |

**The gain scale is cubic.** The editor writes a gain to mpv's volume control, whose curve is cubic, so a speaker that writes amplitude writes `gain ** 3`: half the gain is an eighth of the amplitude. A speaker that writes the gain as amplitude mixes every soundscape louder in its quiet parts than its author heard it.

A speaker of your own should pass the checks `@ripplefx/soundscape` passes: a file ends near its length and reports it; a clip ends near its `to`; a loop never ends; a cue ends near its length; a paused cue ends later by the pause; a stopped voice never ends. The contract is also published as [`docs/speaker.md`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_js_ts_integration/blob/main/docs/speaker.md).

### `@ripplefx/soundscape`

```ts
new WebAudioSpeaker(options?: WebAudioSpeakerOptions)
```

| `WebAudioSpeakerOptions` | Type | Default | Meaning |
| --- | --- | --- | --- |
| `context` | `AudioContext` | a new one | The context to play in. |
| `destination` | `AudioNode` | the context's `destination` | Where every voice goes. |
| `crossOrigin` | `'anonymous' \| 'use-credentials'` | `'anonymous'` | The CORS mode for a track on another origin. |
| `cueCache` | `number` | `32` | How many decoded cues are kept for the next time they are cued; the least recently used goes first. |

| Member | Signature | Does |
| --- | --- | --- |
| `context` | `AudioContext` | The context it plays in. |
| `unlock` | `() => Promise<void>` | Resumes the context unless it is running. Browsers start no sound before the reader has clicked, tapped or pressed a key on the page, so call it from that gesture's handler: a *Begin* button. |
| `voice` | `(url: URL, role: VoiceRole) => Promise<Voice>` | The `Speaker` method. |
| `close` | `() => Promise<void>` | Closes the context; nothing plays through this speaker afterwards. |

| Export | Signature | Does |
| --- | --- | --- |
| `amplitude` | `(gain: number) => number` | A gain on the engine's scale as an amplitude: clamped to 0–1, a non-finite gain read as `0`, then cubed. |

How it makes each kind of sound:
- **A track streams** through a media element into a gain node. A music bed decoded whole is about 23 MB a minute. The element is routed into Web Audio once it is playing, muted until then, and the file's end is watched for as well as listened for.
- **A cue is decoded** once, cached, and started from its buffer, so a sound effect is never late. It is fetched with `mode: 'cors'`.
- **Every gain goes through a `GainNode`**, on the cubic scale, smoothed between the scheduler's steps. It never uses `HTMLMediaElement.volume`, which iOS ignores.

A file on another origin needs that origin's CORS headers, or Web Audio hears it as silence. MP3, AAC, FLAC and WAV play in every current browser; Ogg and Opus do not play in older Safari, and on iOS that is every browser.

## Errors

Every error the package throws is a `RippleError`, and each is a class you tell apart with `instanceof`. Every message is English, for a log; branch on the fields.

| Class | Thrown by | Fields | Met in use |
| --- | --- | --- | --- |
| `RippleError` | the base of the rest; also `SoundscapeDriver.apply` given a copied soundscape | `message` | no: a bug |
| `LoadError` | `Campaign.load`, and the engine's own download | `url: string`, `status: number \| undefined` (`undefined` when the fetch itself failed) | yes: a network or server failure |
| `BundleError` | `Campaign.load`, `Campaign.fromFiles`, `campaign.soundscape`, `Session.create` | `failure: BundleFailure` | yes: a bundle that will not open, or one from a newer engine |
| `NeedsPython` | `Campaign.load`, `Campaign.fromFiles` with `python: false` | none | yes, by your choice |
| `ResumeError` | `Session.resume` | `failure: ResumeFailure` | yes: a save that no longer fits the campaign |
| `HostError` | any session verb, `setPosition`, `setStandIn` | `failure: HostFailure` | three kinds only (below) |
| `ReentrantVerb` | a `Player` verb called while it delivers a batch | none | no: a bug |
| `EngineTrap` | any call into the engine after it panicked | `cause` | yes, and rare |

### `BundleFailure`

| `kind` | Fields | Meaning |
| --- | --- | --- |
| `format` | `message`, `location?` | The bundle is unreadable, and where. |
| `version` | `message`, `found`, `supported`, `oldest?` | The bundle's format is one this engine cannot open: `found`, against the newest it `supported` and the `oldest`. |

### `ResumeFailure`

| `kind` | Fields | Meaning |
| --- | --- | --- |
| `bundle` | `failure: BundleFailure` | The save itself will not read. |
| `board-gone` | `board` | The board the save was on is not in this campaign any more. |
| `node-gone` | `board`, `node` | The node the save was on is not on that board any more. |

### `HostFailure`

A refused verb leaves the story where it was.

| `kind` | Fields | Meaning | Met in use |
| --- | --- | --- | --- |
| `choice-spent` | `port` | A choice drawn as unavailable was taken. | yes: handle it |
| `unknown-locale` | `locale` | A language the campaign was not written in. | yes: handle it |
| `stand-in` | `permission`, `reason` | A stand-in that does not read as a time or a place, and the engine's English why. | yes: handle it |
| `wrong-turn` | `asked`, `answered` | A verb that does not fit the turn. `asked` is `present`, `ask`, `wait`, `ended`, `failed`, `stopped` or `permit`; `answered` is `choose`, `answer`, `elapsed`, `begin-countdown` or `expire`. | no: a bug |
| `no-such-choice` | `offered`, `chosen` | An index past the choices offered. | no: a bug |
| `stopped` | none | The session is stopped. | no: a bug |
| `nothing-asked` | none | The story is not waiting for anything. | no: a bug |
| `not-permitted` | `permission` | A position handed in for a kind the reader has said no to. | no: a bug |
| `no-countdown` | none | `beginCountdown` or `expire` on a passage with no countdown. | no: a bug |
| `countdown-not-begun` | none | `expire` before `beginCountdown`. | no: a bug |

### `EngineTrap`

The engine panicked. The campaign's instance is poisoned: every later call on that campaign, and on any session, player or driver over it, throws `EngineTrap` again. Other campaigns are unaffected. To recover, load the campaign again and resume your last save.

## Threading and lifetime

- **Every verb is synchronous** and runs on the calling thread. Nothing in `Session` returns a promise; only `Campaign.load`, `Campaign.fromFiles`, `Speaker.voice`, `WebAudioSpeaker.unlock` and `WebAudioSpeaker.close` do.
- **A passage costs microseconds.** A Script node runs under its deadline (`scriptLimits.deadlineMs`), and the page does not paint while it runs.
- **One queue, in call order.** Calls on a session are made one after another; a `Player` is that queue, and refuses a verb from inside its own delivery with `ReentrantVerb`.
- **The timers** are the `Player`'s, for a hold and a countdown, and the `SoundscapeDriver`'s, ticking every `tickMs` while anything sounds and stopping when it is idle or paused.

| Object | Lets go with |
| --- | --- |
| `Player` | `dispose()`: no more holds or countdowns, no more deliveries. |
| `SoundscapeDriver` | `dispose()`: cuts the sound and stops every voice. |
| `WebAudioSpeaker` | `close()`: closes its `AudioContext`. |
| `Session` | `stop()` ends it. It has no `dispose`. |
| `Campaign` | No `dispose`. Its compiled engine stays cached for the page. |

## A complete host

A page with a `#stage` element, a `#begin` button and a `#locale` select, rendering Markdown with `marked` and sanitising with `DOMPurify`. It asks before a story reads the clock or the place, and leaves the countdowns to the player. The callback names (`chapterTwo`, `goldChanged`, `skipAhead`) are the author's, agreed with you.

```ts
import {
  Campaign,
  type Effect,
  EngineTrap,
  HostError,
  LoadError,
  NeedsPython,
  momentOf,
  type Passage,
  type PermissionKind,
  Player,
  type Prompt,
  type PromptField,
  type RippleValue,
  ResumeError,
  resolveLink,
  Session,
  type SessionOptions,
  SoundscapeDriver,
} from '@ripplefx/player';
import { WebAudioSpeaker } from '@ripplefx/soundscape';
import DOMPurify from 'dompurify';
import { Marked } from 'marked';

const BASE = '/campaigns/the-city-of-elsenmar/';
const SAVE_KEY = 'elsenmar:save';
const stage = document.querySelector<HTMLElement>('#stage')!;
const begin = document.querySelector<HTMLButtonElement>('#begin')!;
const languages = document.querySelector<HTMLSelectElement>('#locale')!;

const OPTIONS: SessionOptions = { untranslated: 'fall-back' };

// --- Rendering ---------------------------------------------------------------

// The passage being drawn, for the image hook to resolve against.
let drawing: Passage | undefined;
const markdown = new Marked({
  walkTokens(token) {
    if (token.type === 'image' && drawing) token.href = resolveLink(drawing, token.href);
  },
});

let campaign: Campaign;
let player: Player | undefined;
let audio: SoundscapeDriver | undefined;
const speaker = new WebAudioSpeaker();

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

function prose(passage: Passage): HTMLElement {
  drawing = passage;
  const html =
    campaign.manifest.textFormat === 'html'
      ? passage.text
      : (markdown.parse(passage.text, { async: false }) as string);
  drawing = undefined;
  const body = el('div');
  body.innerHTML = DOMPurify.sanitize(html);
  return body;
}

function choose(index?: number): void {
  try {
    player?.choose(index);
  } catch (error) {
    // A choice drawn as unavailable is refused if pressed; nothing moved.
    if (error instanceof HostError && error.failure.kind === 'choice-spent') return;
    fail(error);
  }
}

function showPassage(passage: Passage): void {
  stage.replaceChildren(el('h2', passage.title), prose(passage));
  if (passage.choices.length === 0) {
    const next = el('button', 'Continue');
    next.onclick = () => choose();
    stage.append(next);
  }
  passage.choices.forEach((choice, index) => {
    const button = el('button', choice.text || 'Continue');
    button.disabled = !choice.available; // run out: shown, not taken
    button.onclick = () => choose(index);
    stage.append(button);
  });
}

// One field's control, and how to read it: undefined is left empty.
function control(field: PromptField): [HTMLElement, () => RippleValue | undefined] {
  if (field.options.length > 0) {
    // A pick, answered with the options' ids and never their words.
    const select = el('select');
    select.multiple = field.type.endsWith('List');
    if (field.optional && !select.multiple) select.append(new Option('—', ''));
    for (const option of field.options) select.append(new Option(option.label, option.id));
    select.required = !field.optional;
    return [
      select,
      () => {
        const picked = [...select.selectedOptions].map((option) => option.value).filter(Boolean);
        if (picked.length === 0) return undefined;
        return select.multiple ? picked : picked[0];
      },
    ];
  }
  const input = el('input');
  input.placeholder = field.placeholder; // a hint, never the answer
  if (field.type === 'bool') {
    input.type = 'checkbox';
    input.checked = field.default === true;
    return [input, () => input.checked];
  }
  if (field.type === 'number') {
    input.type = 'number';
    input.step = 'any';
  }
  if (field.default !== null && typeof field.default !== 'object') {
    input.value = String(field.default); // the answer if nobody edits it
  }
  input.required = !field.optional; // a required field is not submitted empty
  return [
    input,
    () =>
      input.value.trim() === ''
        ? undefined
        : field.type === 'number'
          ? Number(input.value)
          : input.value,
  ];
}

function showPrompt(prompt: Prompt): void {
  const form = el('form');
  const reads = prompt.fields.map((field) => {
    // The reader's words for the field; its name is the key the answer goes under.
    const label = el('label', field.optional ? `${field.label} (optional)` : field.label);
    const [input, read] = control(field);
    label.append(input);
    form.append(label);
    return [field, read] as const;
  });
  form.append(el('button', 'Continue'));
  form.onsubmit = (event) => {
    event.preventDefault();
    const values: Record<string, RippleValue> = {};
    for (const [field, read] of reads) {
      const value = read();
      if (value !== undefined) values[field.name] = value; // an optional field left out is skipped
    }
    try {
      player?.answer(values);
    } catch (error) {
      fail(error);
    }
  };
  stage.replaceChildren(el('h2', prompt.title), form);
}

const QUESTIONS: Record<PermissionKind, string> = {
  dateTime: 'This story would like to know the date and time.',
  location: 'This story would like to know where you are.',
};

// Before the story begins, a kind at a time. A reader who says no may give
// a stand-in: what the story should believe instead.
function showPermit(kinds: readonly PermissionKind[]): void {
  stage.replaceChildren(el('h2', 'Before the story begins'));
  for (const kind of kinds) {
    const row = el('div');
    const standIn = el('input');
    standIn.placeholder = kind === 'dateTime' ? '2026-10-31 23:00' : 'Rome, or 41.9, 12.5';
    const answered = (granted: boolean) => {
      row.remove();
      player?.permit(kind, granted); // the answer to the last kind begins the story
    };
    const allow = el('button', 'Allow');
    allow.onclick = () => {
      if (kind !== 'location' || !navigator.geolocation) return answered(true);
      // Hand the fix over before the yes that begins the story, or its first page reads nothing.
      navigator.geolocation.getCurrentPosition(
        (fix) => {
          player?.setPosition({
            latitude: fix.coords.latitude,
            longitude: fix.coords.longitude,
            accuracy: fix.coords.accuracy,
            when: momentOf(new Date(fix.timestamp)),
          });
          answered(true);
        },
        () => answered(true),
      );
    };
    const refuse = el('button', "Don't allow");
    refuse.onclick = () => {
      try {
        player?.setStandIn(kind, standIn.value.trim() || undefined);
      } catch (error) {
        // A stand-in that does not read is refused, and the one before stays.
        if (error instanceof HostError && error.failure.kind === 'stand-in') {
          standIn.setCustomValidity(error.failure.reason);
          standIn.reportValidity();
          return;
        }
        throw error;
      }
      answered(false);
    };
    row.append(el('p', QUESTIONS[kind]), allow, refuse, standIn);
    stage.append(row);
  }
}

function showHold(ms: number): void {
  // The Player waits the ms itself and calls elapsed(); this only draws it.
  const bar = el('progress');
  bar.max = ms;
  stage.append(bar);
  const started = performance.now();
  const step = () => {
    bar.value = performance.now() - started;
    if (bar.value < ms && bar.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// --- Saving ------------------------------------------------------------------

interface Stored {
  save: string;
  generator: { lo: number; hi: number };
}

function checkpoint(): void {
  const session = player?.session;
  const save = session?.checkpoint(); // undefined unless on a passage or a prompt
  if (!session || save === undefined) return;
  const stored: Stored = { save, generator: session.generator };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable: the reader starts over next time.
  }
}

function stored(): Stored | undefined {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    return text ? (JSON.parse(text) as Stored) : undefined;
  } catch {
    return undefined;
  }
}

function openSession(): Session {
  const seed = BigInt(Date.now());
  const last = stored();
  if (last) {
    try {
      const resumed = Session.resume(campaign, last.save, { ...OPTIONS, seed });
      resumed.generator = last.generator; // a save carries no dice
      return resumed;
    } catch (error) {
      if (!(error instanceof ResumeError)) throw error;
      // The campaign changed under the save: start afresh.
    }
  }
  const wanted = navigator.language.split('-')[0]!;
  const locale = campaign.manifest.project.locales.includes(wanted) ? wanted : undefined;
  return campaign.session({ ...OPTIONS, seed, ...(locale ? { locale } : {}) });
}

// --- Effects -----------------------------------------------------------------

function onEffect(effect: Effect): void {
  switch (effect.kind) {
    case 'show':
      showPassage(effect.passage);
      queueMicrotask(checkpoint);
      break;
    case 'ask':
      showPrompt(effect.prompt);
      queueMicrotask(checkpoint);
      break;
    case 'permit':
      showPermit(effect.kinds); // nothing else happens until each kind is answered
      break;
    case 'notice':
      console.info(effect.notice.message); // a read that got a stand-in, a refusal or nothing
      break;
    case 'hold':
      showHold(effect.ms);
      break;
    case 'ended':
      stage.replaceChildren(el('h2', effect.ranOut ? 'The story ran out.' : (effect.title ?? 'The End')));
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {}
      break;
    case 'failed':
      stage.replaceChildren(el('h2', 'The story stopped.'), el('p', effect.message));
      break;
    case 'stopped':
    case 'jumped':
    case 'ambience':
    case 'audio': // applied to the driver by the Player
    case 'changed':
    case 'callback': // dispatched through onCallback below
    case 'trace':
      break;
  }
}

function fail(error: unknown): void {
  if (error instanceof EngineTrap) {
    // This campaign's instance is poisoned: load it again, resume the last save.
    void open();
    return;
  }
  console.error(error);
}

// --- Playing -----------------------------------------------------------------

function play(): void {
  player?.dispose();
  audio?.dispose();
  audio = new SoundscapeDriver(campaign, speaker);
  player = new Player(openSession(), { onEffect, onError: fail, audio });

  player.onCallback('chapterTwo', () => console.info('chapter two unlocked'));
  player.onCallback('goldChanged', (fired) => {
    const gold = fired.to; // a bigint when the variable is an Int
    console.info('gold', gold === undefined ? '' : campaign.asText(gold));
  });
  player.onCallback('skipAhead', () => {
    // A verb from a handler throws ReentrantVerb: schedule it instead.
    queueMicrotask(() => choose(0));
  });

  player.start();
}

async function open(): Promise<void> {
  player?.dispose();
  audio?.dispose();
  begin.hidden = true;
  stage.replaceChildren(el('p', 'Loading…'));
  try {
    campaign = await Campaign.load(BASE); // python: 'auto'
  } catch (error) {
    const why =
      error instanceof LoadError
        ? `${error.url} could not be fetched`
        : error instanceof NeedsPython
          ? 'this campaign needs Python'
          : (error as Error).message;
    stage.replaceChildren(el('h2', 'This campaign would not open.'), el('p', why));
    return;
  }
  stage.replaceChildren(el('h1', campaign.manifest.project.title));
  begin.hidden = false;
}

// No browser makes a sound before the reader's first gesture.
begin.onclick = async () => {
  begin.hidden = true;
  await speaker.unlock();
  play();
};

function setLocale(locale: string): void {
  try {
    player?.setLocale(locale);
  } catch (error) {
    if (error instanceof HostError && error.failure.kind === 'unknown-locale') return;
    fail(error);
  }
}

languages.onchange = () => setLocale(languages.value);

// A hidden tab is not listening: hold the sound, keep the story.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio?.pause();
  else audio?.resume();
});

// Save on the way out.
window.addEventListener('pagehide', () => checkpoint());

void open();
```

## Related

- [Embedding the engine](/explanation/embedding-the-engine/): why a host is shaped as sessions, effects and a speaker.
- [How the engine ships](/explanation/how-the-engine-ships/): versions, variants and the Runtime Licence the player carries.
- [Play a campaign in your program](/how-to/play-a-campaign-in-your-program/): the steps from an exported campaign to a running host.
- [Engine targets](/reference/engine-targets/): every platform the engine is built for.
- [Host callbacks](/explanation/host-callbacks/): what an author's named callbacks are for, and how the two halves meet.
