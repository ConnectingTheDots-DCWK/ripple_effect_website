---
title: C and C++ binding
description: "The C and C++ binding of the Ripple Effect engine: the CMake project, its options and targets, the C++17 layer's every type and member, and the C ABI's conventions and functions."
---

The C and C++ binding is a CMake project that fetches the pinned engine release for the target you are building, refuses it unless its SHA-256 is the pinned one, and adds `ripple/ripple.hpp`, a header-only C++17 layer over the engine's C ABI. A C host uses the C header, `include/ripple/ripple.h` inside the engine archive, directly. Version 1.6.x binds Ripple Effect contract 1.6; the `PATCH` is the binding's own. The source is public at [ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration). The binding is MIT. The engine library and `ripple.h` are under the [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/), whose one condition is that the engine archive's `NOTICE` is reproduced wherever your product lists the third-party software it contains.

| Release | Engine pinned | Added |
| --- | --- | --- |
| 1.5.0 | 1.5.2 | The C ABI, the C++17 layer, `Player`, `SoundscapeDriver`, CMake that fetches the engine. |
| 1.5.1 | 1.5.3 | The web, through Emscripten. |
| 1.5.2 | 1.5.3 | iOS, device and simulator. |
| 1.6.0 | 1.6.0 | Contract 1.6, *Grammar Lich*: a story that asks before it reads the clock or the location, a passage's countdown, and a form in the reader's language with optional fields and fixed answers. |

## Packages and installing

No package manager carries the binding. Take it one of three ways.

### FetchContent

```cmake
include(FetchContent)
FetchContent_Declare(
    ripple_effect
    GIT_REPOSITORY https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration
    GIT_TAG v1.6.0)
FetchContent_MakeAvailable(ripple_effect)
target_link_libraries(my_game PRIVATE Ripple::cpp)
```

Or the release's source tarball, pinned by the digest in that release's `SHA256SUMS`:

```cmake
FetchContent_Declare(
    ripple_effect
    URL https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration/releases/download/v1.6.0/ripple_effect_c_cpp_integration-1.6.0.tar.gz
    URL_HASH SHA256=<from SHA256SUMS>)
```

### A submodule

```sh
git submodule add https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration third_party/ripple_effect
git -C third_party/ripple_effect checkout v1.6.0
```

```cmake
add_subdirectory(third_party/ripple_effect)
target_link_libraries(my_game PRIVATE Ripple::cpp)
ripple_effect_copy_runtime(my_game)   # the DLL beside the .exe, on Windows
```

As a subproject it builds no tests and no examples and downloads nothing but the engine.

### find_package, after an install

```sh
cmake --preset linux-clang && cmake --build --preset linux-clang
cmake --install out/build/linux-clang --prefix /opt/ripple_effect
```

```cmake
find_package(RippleEffect 1.6 REQUIRED)   # CMAKE_PREFIX_PATH=/opt/ripple_effect
target_link_libraries(my_game PRIVATE Ripple::cpp)
```

The package version is **SameMinorVersion**: a request for 1.6 takes any 1.6.x and nothing else. The installed tree:

| Path | Holds |
| --- | --- |
| `include/ripple/ripple.h`, `include/ripple/ripple.hpp` | The C header and the C++ layer. |
| `lib/` | The library; on Windows the shared library's import library. |
| `bin/` | The Windows DLL. |
| `lib/cmake/RippleEffect/` | The package config, and `native-static-libs.txt` for a static install. |
| `share/ripple_effect/ENGINE-NOTICE` | The engine's `NOTICE`. |

The package config also sets `RippleEffect_ENGINE_VERSION` and `RippleEffect_ENGINE_TRIPLE`.

### Targets

| Target | What it is |
| --- | --- |
| `Ripple::engine` | The C library, shared or static, with `ripple/ripple.h` on its include path. A static link carries the system libraries the archive lists. |
| `Ripple::cpp` | `Ripple::engine`, and `ripple/ripple.hpp` over it. Requires C++17. |

### Options and cache variables

| Name | Default | What it does |
| --- | --- | --- |
| `RIPPLE_ENGINE_PYTHON` | `ON` | The engine with the Python interpreter. `OFF` links the `no-python` engine. |
| `RIPPLE_ENGINE_SHARED` | `ON` | The shared library. `OFF` links the static one and the system libraries its archive lists in `lib/native-static-libs.txt`. Forced `OFF` on iOS and under Emscripten. |
| `RIPPLE_ENGINE_TARGET` | empty: worked out from the toolchain | The engine's triple, for a toolchain the configure cannot name. |
| `RIPPLE_ENGINE_DIR` | empty | An unpacked `ripple-engine-c` archive, for an offline, vendored or separately audited build. Nothing is downloaded. |
| `RIPPLE_ENGINE_CACHE` | `<build tree>/_ripple_engine` | Where downloaded archives are kept, to share them between build trees. |
| `RIPPLE_ENGINE_TREE` | empty | A checkout of the engine's own source, built with cargo. For the engine's developers: the result is marked UNVERIFIED and a release of the binding refuses it. |
| `RIPPLE_BUILD_TESTS` | `ON` when top-level | This repository's tests. |
| `RIPPLE_BUILD_EXAMPLES` | `ON` when top-level | The two example players. |
| `RIPPLE_INSTALL` | `ON` when top-level | The install rules and the package config. |
| `RIPPLE_WARNINGS_AS_ERRORS` | `OFF` | Warnings as errors, for this repository's own targets. |
| `RIPPLE_SANITIZE` | empty | `address` or `thread`, for this repository's own targets. |

After the configure, `RIPPLE_ENGINE_VERSION`, `RIPPLE_ENGINE_TRIPLE`, `RIPPLE_ENGINE_ROOT` (where the archive was unpacked) and `RIPPLE_ENGINE_UNVERIFIED` are set, and the configure prints the binding's version, the engine's, the triple, the variant and the linkage.

| CMake function | What it does |
| --- | --- |
| `ripple_effect_copy_runtime(<target>)` | Copies the engine's DLL beside `<target>` after it links. Does nothing off Windows and nothing for a static link. |

### Where the engine comes from

The pinned release is `engine-v<version>` of the public [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases), whose signed manifest names every archive. The binding's `engine.json` holds the version, the signing key's id and every archive's digest. A download is tried from `https://ripplefx.app/go/engine/<tag>/<file>` first and the GitHub release second; an archive whose digest is not the pinned one is refused. An archive is `ripple-engine-c-<version>[-no-python]-<triple>.tar.gz` and holds:

| Path | Holds |
| --- | --- |
| `include/ripple/ripple.h` | The C header. The binding never copies it, so the header you compile against is always the library's own. |
| `lib/` | `libripple_effect_engine.so`, `.dylib` or `.a`; on Windows `ripple_effect_engine.dll`, its import library `ripple_effect_engine.dll.lib`, and the static `ripple_effect_engine.lib`. |
| `lib/native-static-libs.txt` | The system libraries a static link needs. |
| `NOTICE` | The notice the Runtime Licence asks you to reproduce. |

### Requirements

| | |
| --- | --- |
| CMake | 3.24 or later. The presets file is version 5. |
| C | `ripple.h` is C99. |
| C++ | `ripple.hpp` is C++17. |
| Presets | `linux-gcc`, `linux-clang`, `linux-asan`, `linux-static`, `linux-no-python`, `macos-clang`, `windows-msvc` (from a developer prompt), `android-arm64`, `ios-arm64`, `ios-simulator`, `emscripten`, `emscripten-no-python`. Each builds under `out/build/<preset>`. |

### Under Emscripten

Configure with Emscripten's toolchain file, through `emcmake cmake` or the `emscripten` preset; the `wasm32-unknown-emscripten` archive is fetched and linked statically. The engine asks for no exception flag. `ripple.hpp` reports a refusal by throwing, so a C++ host that catches `ripple::Error` compiles and links with `-fwasm-exceptions`, adding `-sSUPPORT_LONGJMP=wasm` for Emscripten 4.0.10, as `examples/cpp_player` does; one Emscripten link takes one exception model. Without exceptions, define `RIPPLE_HPP_NO_EXCEPTIONS`.

## Choosing the variant

The variant is a configure-time choice: `RIPPLE_ENGINE_PYTHON=ON` links the engine with the Python interpreter and `OFF` links the `no-python` engine, about half the size.

- **Opening.** The `no-python` engine refuses a campaign that needs Python when it is opened, with `RIPPLE_ERROR_NEEDS_PYTHON` (`ripple::NeedsPython`). A campaign exported with **Needs no Python** is checked for exactly that host.
- **Asking.** `ripple::engine_has_python()` (`ripple_engine_has_python()`) answers which library is loaded; `Session::python_available()` answers for a session. A manifest's `needs` lists `python` when the campaign runs scripts.
- **The console.** `Session::console_feed` on the `no-python` engine answers a failure of kind `RIPPLE_PYTHON_FAILURE_KIND_UNAVAILABLE`.

## Platforms

| Platform | Architectures | Floor | Notes |
| --- | --- | --- | --- |
| Linux | x86_64, aarch64 | glibc 2.35 | The soname is `libripple_effect_engine.so`. Ship it beside your binary with an `$ORIGIN` RPATH, or link statically. |
| macOS | x86_64, arm64 | 12.0 | One architecture per configure; the release has no universal library, so build twice and `lipo`. The install name is `@rpath/libripple_effect_engine.dylib`. |
| Windows | x64, arm64 | | MSVC's ABI only; MinGW is refused. The shared engine is a DLL with an import library. The static library is built against the dynamic CRT (`/MD`). |
| Android | arm64-v8a, x86_64 | API 24 | With the NDK's toolchain file. The `.so` goes in your APK's `jniLibs`; the static library links into your own native library. |
| iOS | arm64 device, arm64 simulator | 13.0 | Static only. `CMAKE_SYSTEM_NAME=iOS` fetches `aarch64-apple-ios`; adding `CMAKE_OSX_SYSROOT=iphonesimulator` fetches `aarch64-apple-ios-sim`. A simulator runtime's own minimum may raise the deployment target. |
| The web, through Emscripten | wasm32 | Emscripten 4.0 | Static only. From engine 1.5.3. |

On Emscripten:

- **Emscripten 4.0 or later.** Each release is linked and played with 4.0.10, 4.0.19 and the newest it was built with. Before 4.0 the optimiser rejects a feature the engine's objects carry, and 3.1.38 links and then cannot open a bundle's folder, with nothing reporting it.
- **Unity** 6000.5 and later bundle Emscripten 4.0.19 and are supported; 6000.0 to 6000.4 bundle 3.1.38 and are not. The archive's `.a` is the plugin.
- **.NET in the browser is not supported**: its `wasm-tools` workload links with an Emscripten below the floor.
- **Single-threaded.** A program linked with `-pthread` refuses the library.
- **A panic aborts the module** rather than unwinding. A trap is not recoverable in place: the page reopens and resumes from its last checkpoint.
- **Open a campaign from memory.** A page has no folder; fetch the bundle's files and pass them to `Campaign::open_files` (`ripple_campaign_open_memory`). A folder works under `-sNODERAWFS` or in Emscripten's virtual filesystem.
- **Size.** A linked program with the interpreter is about 5.4 MB of WebAssembly, 2.0 MB gzipped; without it, about 0.8 MB and 0.3 MB.

The full matrix of what each engine release ships is in [Engine targets](/reference/engine-targets/).

## The engine

| C++ | C | Answers |
| --- | --- | --- |
| `ripple::engine_version()` | `ripple_engine_version()` | The loaded library's version, not the one built against. |
| `ripple::engine_contract()` | `ripple_engine_contract()` | The contract the loaded library binds, `1.6`. |
| `ripple::engine_has_python()` | `ripple_engine_has_python()` | False for the `no-python` library. |
| | `ripple_bundle_format()` | The bundle format the engine writes, and reads up to. |
| | `ripple_save_format()` | The save format the engine writes. |
| `ripple::contract_major`, `ripple::contract_minor` | `RIPPLE_CONTRACT_MAJOR`, `RIPPLE_CONTRACT_MINOR` | The contract the header binds, `1` and `6`, at compile time. |

The C++ functions return `std::string_view` over strings the library owns; the C ones return NUL-terminated `const char *`. An engine of the same `MAJOR.MINOR` keeps every function, struct and constant of the header. `ripple.hpp` fails to compile with `#error` against a `ripple.h` of another contract.

| Constant | Value | Meaning |
| --- | --- | --- |
| `RIPPLE_CHOICE_NONE` | `4294967295` | The choice index that means the reader is leaving the passage; `ripple::leave` in C++. |
| `RIPPLE_MIXER_DEFAULT_MAX_CUES` | `8` | Cues that may sound at once; the oldest gives way. |
| `RIPPLE_MIXER_DEFAULT_GAIN_STEP` | `0.004` | The smallest change of gain worth a `gain` command. |

## Campaign

`ripple::Campaign` is a bundle, opened: a move-only handle shared by every session made from it. It may be destroyed before its sessions, which go on working.

| Member | Answers | Notes |
| --- | --- | --- |
| `static open_dir(folder)` | `Campaign` | The folder that holds `campaign.json`. Files are read as the story asks for them, never from outside the folder. |
| `static open_files(files)` | `Campaign` | A bundle in memory: a `std::vector<BundleFile>`, each a `path` inside the bundle and its `bytes`. The bytes are copied. |
| `handle()` | `RippleCampaign*` | The C handle, for a call the layer does not wrap. |
| `folder()` | `const std::optional<std::string>&` | The folder it was opened from; none for a bundle in memory. |
| `manifest()` | `Manifest` | |
| `board(index)` | `Board` | By index into the manifest's boards. |
| `soundscape(index)` | `Soundscape` | By index into the manifest's soundscapes. |
| `board_with_id(id)` | `std::optional<std::uint32_t>` | The index of the board with that catalog id. |
| `node(board, id)` | `std::optional<Node>` | A node of a board, by its id. |
| `validate()` | `std::vector<BundleProblem>` | Everything wrong with the bundle as a whole; empty when it is sound. Each has a `message` and a `location`. |
| `media_path(index)` | `std::optional<std::string>` | A medium's path inside the bundle; never absolute and never leaving it. |
| `media_file(index)` | `std::optional<std::string>` | The folder joined with the path, for a campaign opened from a folder; none otherwise. Never fails. |
| `media_bytes(index)` | `std::optional<std::vector<std::uint8_t>>` | A medium's bytes, read whole; none when the bundle does not hold it. A long track is better streamed from its path. |

### Manifest

`campaign.json`, table by table.

| Field | Type | Meaning |
| --- | --- | --- |
| `format` | `std::int64_t` | The bundle format. |
| `generator` | `std::optional<std::string>` | Who compiled it. |
| `text_format` | `std::string` | `markdown` or `html`: what a passage's text is. |
| `project` | `Project` | `title`, `description`, `default_locale`, `locales`, and `cover`, the cover picture's path inside the bundle when there is one. |
| `entries` | `std::vector<std::uint32_t>` | The entry boards, by index into `boards`. |
| `boards`, `passages`, `components`, `scripts`, `media`, `machines`, `soundscapes` | `std::vector<Entry>` | One row each: `id`, `name`, and `path`, the document's path inside the bundle (for a medium, the file's). |
| `cvars` | `std::vector<Cvar>` | The console variables declared: `name`, `type`, `default_value`. |
| `needs` | `std::vector<std::string>` | What a host must have to play it: `python`, when it runs scripts. |
| `permissions` | `std::vector<std::string>` | What the story reads of the world outside it, by wire name: `dateTime`, `location`. A session asks about each before it begins. |

### Board, Node, Port

| Type | Fields |
| --- | --- |
| `Board` | `id`, `name`, `start` (`std::int64_t`), `prime` (`std::vector<std::uint32_t>`), `nodes`. |
| `Node` | `id`, `type`, `title`, `inputs`, `outputs` (`std::vector<Port>`), `data`, `metadata` (`Value`). |
| `Port` | `id`, `kind` (`PortKind::control` or `PortKind::data`), `edges`. |
| `Edge` | `node`, `port`: one end of a wire, by index on its board. |

### Soundscape and Track

A soundscape is a timeline of clips a passage plays. Times are milliseconds.

| `Soundscape` field | Type |
| --- | --- |
| `id`, `name` | `std::string` |
| `length`, `fade_in`, `fade_out` | `std::int64_t` |
| `looping`, `tied` | `bool` |
| `volume` | `double`, default `1.0` |
| `tracks` | `std::vector<Track>` |

| `Track` field | Type | Meaning |
| --- | --- | --- |
| `media` | `std::int64_t` | The medium, by index into the manifest's media. |
| `lane`, `start`, `clip_start` | `std::int64_t` | |
| `clip_end` | `std::optional<std::int64_t>` | |
| `volume`, `speed` | `double`, default `1.0` | |
| `fade_in`, `fade_out`, `interval` | `std::int64_t` | |
| `mode` | `TrackMode` | `once`, `looping` or `automatic` (`RIPPLE_TRACK_MODE_AUTO`). |

## Session

`ripple::Session` is one story being played, a move-only handle. Every verb answers the effects it led to, in the order they are applied, the Turn last. Destroyed with its object.

### Creating and resuming

| Member | Answers | Notes |
| --- | --- | --- |
| `static create(campaign, config)` | `Session` | Before its first turn: call `start()` next. |
| `static resume(campaign, save, seed, options = SessionOptions())` | `Session` | A save, as `pause()` or `checkpoint()` answered it, over the same campaign. Call `start()` next; it answers the turn the save was on. Refused with `ResumeError` when the save names a board or node the campaign no longer has. |
| `handle()` | `RippleSession*` | The C handle. |

`SessionConfig`, where a new session begins:

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `board` | `std::uint32_t` | `0` | The board, by index into the manifest's boards; usually `manifest.entries[0]`. |
| `entry_node` | `std::optional<std::string>` | none | A node to begin at instead of the board's start. |
| `locale` | `std::optional<std::string>` | none | The language to read in; none for the default. |
| `seed` | `std::uint64_t` | `0` | The dice: the same seed rolls the same story. |
| `digest` | `std::optional<std::string>` | none | The bundle digest a save made from this session is stamped with. |
| `options` | `SessionOptions` | the engine's | |

`SessionOptions`, the engine's budgets and policies. A default-constructed `SessionOptions` holds the engine's own values, read from `ripple_session_options_default`.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `step_budget` | `std::uint32_t` | the engine's | Steps a run may take before it is stopped; `0` stops on the first. |
| `silent_jump_limit` | `std::uint32_t` | the engine's | Silent jumps between boards before the story is stopped. |
| `loop_limit` | `std::uint32_t` | the engine's | Times a loop may go round; `0` is no ceiling. |
| `script_deadline_ms` | `std::uint64_t` | the engine's | How long a script may run. |
| `script_memory_bytes` | `std::uint64_t` | the engine's | How much memory a script may take. |
| `script_recursion_depth` | `std::uint32_t` | the engine's | How deep a script may recurse. |
| `untranslated` | `Untranslated` | `report` | A passage missing in the reader's language: `report` gives empty text and names the language; `fall_back` gives the default language's text and still names it. |
| `trace` | `bool` | `false` | Whether verbs answer `Trace` effects. |
| `trace_payloads` | `bool` | `false` | Whether a traced value carries its payload. |

`raw()` answers the options as a `RippleSessionOptions`.

### Verbs

| Verb | Answers | Notes |
| --- | --- | --- |
| `start()` | `Effects` | The story's first turn; on a resumed session, the turn it was saved on. A verb before it is refused with `nothing_asked`. |
| `choose(index)` | `Effects` | Answers a `Show`: the choice by index into its `choices`, or `ripple::leave` for the reader leaving the passage. An index past the offered ones is `no_such_choice`; a choice whose `available` is false is `choice_spent`. |
| `answer(values)` | `Effects` | Answers an `Ask`: a `Value::Map` of the form's fields by name, or `std::nullopt` for the reader leaving it. |
| `elapsed()` | `Effects` | Answers a `Hold`, once the host's clock says it is over. |
| `begin_countdown()` | `Effects` | The host's clock says the shown passage's countdown begins, after its timer's `after_ms`. Moves nothing: the effects are only the callbacks an author aimed at it, and empty when there are none or it already began. On a passage with no timer it is `no_countdown`. |
| `expire()` | `Effects` | The host's clock says the countdown ran out: the passage's default is taken as `choose` would take it. Before `begin_countdown` it is `countdown_not_begun`; on a passage with none, `no_countdown`. |
| `permit(kind, granted)` | `Effects` | The host's answer for one `PermissionKind`, at any time, before `start` included, which is how a host that already knows its reader's answers never has them asked. On a `Permit` turn, the last kind answered begins the story. |
| `set_locale(locale)` | `Effects` | The turn the story is on, answered again in the new language: a passage re-rendered with its countdown kept, a form re-worded with its field names unchanged. A language the campaign is not readable in is `unknown_locale`. |
| `restart()` | `Effects` | The story over from its first turn, the same seed rolling again. |
| `stop()` | `Effects` | Stops the story for good; a verb after it is `stopped`. |
| `pause()` | `Paused` | `save`, the save as JSON text (none when there was nothing to save), and `effects`, what pausing did. Pausing stops the story; resuming is a new session from the save. |
| `checkpoint()` | `std::optional<std::string>` | A save of the turn the story is on, without stopping it; none unless the story is on a passage or a form. |
| `console_feed(code)` | `ConsoleResult` | A line of Python run against the story, as the editor's console runs it: `result` and `effects`. |
| `write_cvar(name, value)` | `CvarChange` | Writes a console variable, coerced to its type. |
| `reset_cvar(name)` | `CvarChange` | Puts a console variable back to its default. |
| `reset_all_cvars()` | `Effects` | Puts every console variable back to its default. |
| `remove_entity(key)` | `EntityRemoval` | `removed`, and `effects`. |

The readings a host hands in. None of them moves the story or answers effects:

| Member | Answers | Notes |
| --- | --- | --- |
| `set_now(now)` | `void` | What time it is, a `std::optional<Moment>`; none for no clock. Before every verb that can step, by a host that granted `date_time`; within one verb time does not move. |
| `set_position(fix)` | `void` | The host's last fix, a `std::optional<Position>`; none for none. Refused with `not_permitted` once `location` is denied; a fix given before the answer is kept, and read only if it is yes. |
| `set_stand_in(kind, typed, local_offset_minutes = 0)` | `void` | The reader's stand-in for one kind, as they typed it, a `std::optional<std::string_view>`; none takes it away. ISO 8601 for the clock, read at `local_offset_minutes` when it carries no offset; `"lat, lon"` or a place's name for a position. Answered whenever the real value is missing. Refused with `stand_in`, saying why, for one that does not read. |

The answers that carry effects beside a result:

| Type | Fields |
| --- | --- |
| `CvarChange` | `outcome` (`CvarWrite::done`, `unknown` for a variable the campaign does not declare, `refused` for a value its type does not take), `refusal` (why), `effects`. |
| `EntityRemoval` | `removed`, `effects`. |
| `ConsoleResult` | `result` (`PythonResult`), `effects`. |
| `PythonResult` | `value`, `output` (what it printed), `error` (`std::optional<PythonFailure>`, none when it finished). |
| `PythonFailure` | `kind` (a `RipplePythonFailureKind`: `PYTHON`, `TIMEOUT`, `REFUSED`, `CLOSED`, `HOST_ERROR`, `UNAVAILABLE`), `exception` (the exception's type, for `PYTHON`), `message`, `line`, `traceback`. |

### Readers

| Member | Answers | Notes |
| --- | --- | --- |
| `board()` | `std::uint32_t` | The board the story is on, by index into the manifest's boards. |
| `locale()` | `std::string` | The language the story reads in. |
| `default_locale()` | `std::string` | The campaign's default language. |
| `ambience()` | `std::optional<Ambience>` | The soundscape in force; none for silence. |
| `entities()` | `std::vector<Entity>` | Every entity the story holds. |
| `memory()` | `Memory` | What the story remembers. |
| `cvars()` | `std::vector<CvarSnapshot>` | Every console variable, with its value. |
| `guard()` | `GuardReport` | What the script guard has had to do so far: `abandoned` (the nodes whose scripts were abandoned), `refused`, `exhausted`. |
| `python_available()` | `bool` | False on the `no-python` engine. |
| `describe_cvar_write(name, value)` | `std::optional<std::string>` | Why a console-variable write would be refused; none when it would be taken. |
| `set_trace(enabled)` | `void` | Turns `Trace` effects on or off. |
| `set_trace_payloads(enabled)` | `void` | Turns a traced value's payload on or off. |

### The generator

A save carries no generator state and no soundscape position: the same seed gives the same future rolls, and a soundscape starts from the top. To carry the dice's exact continuation across a resume, read the old session's `generator()` and `set_generator` it on the new one.

| Member | Answers |
| --- | --- |
| `generator()` | `Generator`, two `std::uint32_t`: `lo` and `hi`. |
| `set_generator(state)` | `void` |

### The world outside the story

| Type | What it is |
| --- | --- |
| `PermissionKind` | `enum class` over `std::uint32_t`: `date_time`, `location`, numbered as `ripple.h`'s `RipplePermissionKind` (`RIPPLE_PERMISSION_KIND_DATE_TIME` 0, `_LOCATION` 1). Open for appending; the microphone is not one. |
| `permission_kind_name(kind)` | A kind's wire name, `dateTime` or `location`, as the manifest and a notice spell it; empty for a number the header does not know. |
| `Moment` | An instant from the host: `utc_ms` (`std::int64_t`, milliseconds since the epoch) and `offset_minutes` (`std::int32_t`, the offset the reader's wall clock is at). |
| `local_moment()` | This machine's time at its own offset: what a host that granted `date_time` hands `set_now`, or a `Player` asks for through `PlayerHandlers::moment`. |
| `Position` | A fix, any field of which may be absent, shaped after the web's `GeolocationPosition`: `label` (`std::optional<std::string>`), `latitude`, `longitude`, `accuracy` (`std::optional<double>`, degrees and metres), and `when` (`std::optional<Moment>`), when it was taken. |

## Effects

`ripple::Effect` is a `std::variant` of fourteen alternatives, in the engine's order; `ripple::Effects` is a `std::vector<Effect>`. Apply a batch in order. The last effect of a batch is its Turn. Each effect owns its strings: the C batch is copied and freed before the verb returns.

| Alternative | Turn | Fields | Meaning |
| --- | --- | --- | --- |
| `Trace` | | `event` (`RunEvent`) | An event of the run, when tracing is on. |
| `Callback` | | `event` (`CallbackEvent`) | A named callback the author declared. |
| `Jumped` | | `board` (`std::uint32_t`), `node` (`std::optional<std::string>`) | The story moved to another board. |
| `AmbienceChanged` | | `ambience` (`std::optional<Ambience>`) | The soundscape now in force; none for silence. |
| `Audio` | | `command` (`AudioCommand`) | What the speaker should do, for the mixer. |
| `Changed` | | `entities`, `memory`, `cvars`, each optional | Which stores moved; a store that did not is absent. |
| `Show` | yes | `passage` (`Passage`) | A passage. Answer with `choose`. |
| `Ask` | yes | `prompt` (`Prompt`) | A form. Answer with `answer`. |
| `Hold` | yes | `ms` (`std::uint64_t`) | A wait. Call `elapsed` once your clock says it is over. |
| `Ended` | yes | `title` (`std::optional<std::string>`), `ran_out` (`bool`) | The story is over. `ran_out` is true when it ran out of road rather than reaching an End. |
| `Failed` | yes | `message`, `node` (`std::optional<std::string>`) | The story could not go on. |
| `Stopped` | yes | none | The session stopped. |
| `Permit` | yes | `kinds` (`std::vector<PermissionKind>`) | The story has not begun, and reads these kinds that nobody has answered. Answer each with `permit`; the last answer begins the story. |
| `Notice` | | `code`, `kind` (`PermissionKind`), `node` (`std::optional<std::string>`), `message` | A read of the world outside the story that did not get the real value, once per kind and outcome in a playthrough, before the Turn it was read for. `code` is `I.RT.05` a stand-in, `W.RT.06` a refusal, `I.RT.07` nothing; the letter is the severity. `node` is the node whose Python read it; `message` is the engine's English sentence. |

`Permit` and `Notice` were appended in 1.6, so a `std::visit` with no arm for them does not compile.

| Function | Answers |
| --- | --- |
| `is_turn(effect)` | Whether the effect is a Turn. |
| `is_over(effect)` | Whether a Turn is the end of the story: `Ended`, `Failed` or `Stopped`. |

### Records

**`Passage`**, a passage the reader is on:

| Field | Type | Meaning |
| --- | --- | --- |
| `node`, `title` | `std::string` | |
| `text` | `std::string` | Markdown, or HTML when the manifest's `text_format` says so. |
| `choices` | `std::vector<Choice>` | Each: `port` (the control output the flow leaves by), `text`, and `available`, false for a choice the author limited and the reader used up. A spent choice is still offered so the reader can see it. |
| `sources` | `std::optional<std::vector<LocaleText>>` | The text in every language, each a `locale` and a `text`, when the compiler kept them. |
| `snippets` | `std::vector<Snippet>` | Python in the prose: `code`, `is_inline`. |
| `media` | `std::vector<MediaLink>` | Every link in the text that names a medium: `link` as the author wrote it, and `media`, by index into the manifest's media. |
| `untranslated` | `std::optional<std::string>` | The language the text is missing in, when it is. |
| `soundscape` | `std::optional<Soundscape>` | The soundscape the passage names. |
| `silence` | `bool` | True when the passage asks for silence. |
| `timer` | `std::optional<ChoiceTimer>` | The passage's countdown; none when the passage waits for the reader as long as they like. |

**`ChoiceTimer`**, a passage's countdown. The host's clock waits `after_ms`, calls `begin_countdown`, waits `timeout_ms` and calls `expire`; the engine measures none of it. A `Player` does all three.

| Field | Type | Meaning |
| --- | --- | --- |
| `after_ms` | `std::uint64_t` | How long before the countdown begins; zero is at once. |
| `timeout_ms` | `std::uint64_t` | How long it runs once begun; never zero. |
| `visible` | `bool` | Whether the author meant the reader to see it count. |
| `default_choice` | `std::uint32_t` | The index into the passage's choices taken when it runs out. |

**`Prompt`**, a form the story asks the reader to fill: `node`, `title`, and `fields`, each a `PromptField`:

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | `std::string` | What an answer is keyed by: the field's ID, never shown. |
| `type` | `std::string` | The field's type. |
| `default_value` | `Value` | What the control is filled in with; a default nobody edits is the answer. |
| `label` | `std::string` | What the reader is shown, in the reader's language: `name` where the author wrote nothing. |
| `placeholder` | `std::string` | The hint drawn while the field is empty; empty for none. |
| `optional` | `bool` | Whether the reader may leave it empty, which answers null. A required field is not submitted empty. |
| `options` | `std::vector<PromptOption>` | The fixed answers to pick from, in order: one for a scalar type, any number for a `…List`. Empty for a field the reader types into. Answered with the picked options' ids. |

A **`PromptOption`** is `id`, what a host answers with, the same in every language; `label`, what the reader is shown, in the reader's language; and `value` (`Value`), what the story is handed when it is picked, of the field's type.

**`Ambience`**, the soundscape in force: `soundscape`, `board` (`std::uint32_t`), and `node`, the node that set it.

**`AudioCommand`**, what the session asks the speaker:

| Field | Type | Meaning |
| --- | --- | --- |
| `kind` | `AudioKind` | `play` a soundscape, fading in over `fade_ms`; `stop` what is sounding, fading out over `fade_ms`; `cut` everything now, cues included; `cue` one sound. |
| `soundscape` | `std::optional<Soundscape>` | `play`: what to play. |
| `fade_ms` | `std::uint64_t` | `play`: the fade-in. `stop`: the fade-out. |
| `media` | `std::uint32_t` | `cue`: the medium, by index into the manifest's media. |
| `volume`, `speed` | `double`, default `1.0` | `cue`. |
| `node` | `std::optional<std::string>` | `cue`: the node that asked for it, when one did. |

**`CallbackEvent`**, a named callback fired. Which fields are set depends on `event`.

| Field | Type | Meaning |
| --- | --- | --- |
| `callback` | `std::string` | The name the author gave it, which a handler is registered by. |
| `event` | `std::uint32_t` | A `RippleCallbackKind`. |
| `board` | `std::optional<std::uint32_t>` | |
| `node`, `name` | `std::optional<std::string>` | |
| `from`, `to` | `std::optional<Value>` | |
| `index` | `std::optional<std::uint32_t>` | |
| `event_name()` | `std::string_view` | The event in the author's vocabulary, such as `cvar.changed`. |

**`Entity`**: `key`, `component` (`std::optional<std::string>`), `label`, and `values`, a map of its fields.

**`Memory`**: `nodes`, a map node by node, and `machines`, a `std::vector` of (machine, state) pairs.

**`CvarSnapshot`**: `name`, `type`, `default_value`, `value`.

**`RunEvent`**, one event of the run's trace, read by `kind`; a field another kind does not use is empty.

| Field | Set by | Meaning |
| --- | --- | --- |
| `kind` | all | `RunEventKind`: `run_started`, `node_started`, `node_finished`, `memo_hit`, `diagnostic`, `log`, `run_finished`. |
| `run`, `board`, `sequence` | all | Where in a run the event happened. |
| `node` | node started, node finished, memo hit, log | |
| `step` | node started, node finished, log | |
| `entry` | run started | The node the run entered by. |
| `primed` | run started | The nodes primed before it. |
| `entered_via` | node started | |
| `pulled` | node started | Whether it ran because a data edge pulled it. |
| `inputs` | node started | `std::vector<TraceValue>`. |
| `outcome` | node finished | A `RippleTurnOutcome`: `DONE` or `FAILED`. |
| `outputs` | node finished | `std::vector<TraceValue>`. |
| `flowed` | node finished | The control ports the flow left by. |
| `error` | node finished, run finished | |
| `diagnostic` | diagnostic | `RunDiagnostic`: `issue` (a `RippleRunIssue`: `AMBIGUOUS_FLOW`, `MULTIPLE_INPUTS`, `PRODUCER_NOT_RUN`, `REENTERED`, `NOTHING_ON_WIRE`, the run remark `W.RT.08`), `message`, `node`, `port`, `wires`. |
| `level` | log | A `RippleLogLevel`: `DEBUG`, `INFO`, `WARNING`, `ERROR`. |
| `message` | log | |
| `data` | log | `std::optional<Value>`; none when the node logged no data. |
| `steps`, `cancelled`, `failed_node` | run finished | |

**`TraceValue`**, a value on a wire as the trace saw it: `from_node`, `from_port`, `to_node`, `to_port`, `payload` (`PayloadKind::present` when `value` is what crossed, `withheld` when a value crossed and payloads are not traced, `absent` when nothing crossed), and `value`, set when `payload` is `present`.

## Values

`ripple::Value` is a story's value. An Int and a Float never become each other, and a map keeps the order it was written in.

| Story type | `Value` holds | C `RippleValueKind` | C field |
| --- | --- | --- | --- |
| null | `std::nullptr_t` | `RIPPLE_VALUE_KIND_NULL` | |
| Bool | `bool` | `RIPPLE_VALUE_KIND_BOOLEAN` | `data.boolean` |
| Int | `std::int64_t` | `RIPPLE_VALUE_KIND_INTEGER` | `data.integer` |
| Float | `double` | `RIPPLE_VALUE_KIND_REAL` | `data.real` |
| text | `std::string` | `RIPPLE_VALUE_KIND_TEXT` | `data.text` |
| list | `Value::List`, a `std::vector<Value>` | `RIPPLE_VALUE_KIND_ITEMS` | `data.items`: child indices |
| map | `Value::Map`, a `std::vector<std::pair<std::string, Value>>` | `RIPPLE_VALUE_KIND_ENTRIES` | `data.entries`: a key and a child index each |

| Member | Answers |
| --- | --- |
| Constructors | From `nullptr`, `bool`, any integral type (stored as `std::int64_t`), `double`, `std::string`, `const char*`, `std::string_view`, `List`, `Map`. A default `Value` is null. |
| `is_null()`, `is_bool()`, `is_int()`, `is_float()`, `is_text()`, `is_list()`, `is_map()` | Which it holds. |
| `get_if<T>()` | A pointer to the held `T`, or `nullptr`. |
| `storage()` | The underlying `std::variant`. |
| `find(key)` | A map's value under `key`, or `nullptr`, also for anything that is not a map. |
| `ripple::as_text(value)` | The value as text, the way a passage would print it. |

### The arena in C

A C value is a `RippleValue`: `nodes`, a flat array of `RippleValueNode`, and `count`. The root is node 0. Each node is a `uint32_t kind` and a `union data` read by it; a list's or a map's children are indices into the same array. An empty arena is null. A child index that is not after its parent, or is past the end, reads as null, so an arena cannot loop. A host builds one arena per value it hands in; `RippleFields` is a list of `RippleField`, each a `key` and a `value`, for an answer's fields.

## Player

`ripple::Player` is the loop over a session, written once. It delivers every effect in order, keeps the last Turn, answers a `Hold` from its clock when `update()` finds it due, runs a passage's countdown the same way, tells the session the time before every verb, applies `Audio` effects to a `SoundscapeDriver`, and dispatches the author's named callbacks. What it does not wrap is on `session()`: `set_position` and `set_stand_in` move no story and answer no effects.

```cpp
Player(Session session, PlayerHandlers handlers, Clock now = {});
```

The player owns the session. With no clock it reads `ripple::steady_clock()`.

`PlayerHandlers`:

| Field | Type | Meaning |
| --- | --- | --- |
| `on_effect` | `std::function<void(const Effect&)>` | Every effect, in the order the engine produced it. |
| `on_error` | `std::function<void(const Failure&)>` | A failure of a verb the player made by itself, the `elapsed` after a hold, or a handler's exception. Delivery goes on either way. A handler's exception that is not a `ripple::Error` arrives as `Code::invalid_argument` with its `what()`. |
| `audio` | `SoundscapeDriver*` | Where the story's sound goes; without one, nothing is heard. |
| `moment` | `std::function<std::optional<Moment>()>` | What time it is for the story, `local_moment` for this machine's: asked before every verb that can step and handed to `set_now`. Empty for a host that hands in no clock, or has not been granted it. |
| `countdowns` | `bool`, default `true` | Whether the player runs a passage's countdown on its own clock, from `update()`. Off for a host that keeps time some other way, a test, a walk of every branch, a reader who asked for no time limits (WCAG 2.2.1), which calls `begin_countdown` and `expire` itself, or never. |

| Member | Answers | Notes |
| --- | --- | --- |
| `start()`, `choose(index)`, `answer(values)`, `set_locale(locale)`, `restart()`, `stop()` | `void` | The session's verbs, their effects delivered through the handlers. Each clears a pending hold. |
| `permit(kind, granted)` | `void` | The reader's answer for one kind; on a `Permit` turn, the last one begins the story. Keeps a countdown. |
| `begin_countdown()` | `void` | The countdown begins now, whatever its `after_ms` said, for a host that runs countdowns itself. With `countdowns` on, `update()` says it. |
| `expire()` | `void` | The countdown ran out now: the passage's default is taken. |
| `pause()` | `std::optional<std::string>` | Puts the story down and answers its save: none, and nothing stopped, unless the story is on a passage or a form. A save carries no time: a story resumed on a timed passage waits afresh. |
| `update()` | `void` | Call from your loop. Answers a hold whose time has come, and begins or runs out a countdown whose time has. With exceptions and no `on_error`, a failure of that verb is thrown. |
| `turn()` | `const std::optional<Effect>&` | The last Turn delivered. |
| `hold_due()` | `std::optional<std::uint64_t>` | When the pending hold is due, by the player's clock. |
| `countdown()` | `const std::optional<Countdown>&` | The shown passage's countdown, for a host that draws one; none when the passage has none. Kept across a `set_locale`, which is the same visit; dropped once the reader chooses or anything else is shown. |
| `session()` | `Session&` | The session, for what the player does not wrap. A verb called on it goes round the player. |
| `on_callback(name, handler)` | `void` | Calls `handler` whenever the callback named `name` fires, replacing any handler under that name. |
| `remove_callback(name)` | `void` | |
| `on_any_callback(handler)` | `void` | Calls `handler` for every callback that fires, registered or not. |
| `clear_callbacks()` | `void` | Removes both kinds. |
| `callback_misses()` | `std::uint64_t` | How many callbacks fired with nothing registered under their name. |
| `dispose()` | `void` | Delivers nothing more. A verb after it does nothing. |

For each effect of a batch, in order, the player records it if it is a Turn, applies it to `audio` if it is `Audio`, dispatches it if it is `Callback`, then calls `on_effect`. A verb called on the player from inside a handler is refused with `Code::reentrant` (`ripple::ReentrantVerb`), because the rest of the batch would arrive after the new one: queue it and call it once the handler returns.

A **`Countdown`** is `timer` (`ChoiceTimer`), `begun` (whether `begin_countdown` was said) and `due` (`std::uint64_t`), when the next of the two is due by the player's clock: the beginning, or once begun the end. A countdown begun late is timed from when it was due rather than from when `update()` noticed, so a slow loop does not lengthen the reader's time.

`Clock` is `std::function<std::uint64_t()>`, milliseconds, monotonic. `ripple::steady_clock()` answers one over `std::chrono::steady_clock`, starting at zero.

## Named callbacks

The author declares a callback's name and event; the engine emits a `Callback` effect when it fires; the host registers a handler by name. The engine never sees the handler table, and a callback cannot change the story.

| Rule | |
| --- | --- |
| Registering | `Player::on_callback(name, handler)`; a `CallbackHandler` is `std::function<void(const CallbackEvent&)>`. A C host matches `RippleCallbackEvent.callback` itself. |
| A name nobody registered | Ordinary, not a failure. `Player` counts it in `callback_misses()`. |
| A handler that throws | Absorbed: handed to `on_error`, and the rest of the batch still delivered. |
| A verb from a handler | Refused with `ReentrantVerb`; queue it. |
| The event's name | `CallbackEvent::event_name()`, or `ripple_callback_kind_name(kind)` in C, which answers NULL for a value that is not a `RippleCallbackKind`. |

| `RippleCallbackKind` | Value | Name |
| --- | --- | --- |
| `RIPPLE_CALLBACK_KIND_STORY_STARTED` | 0 | `story.started` |
| `RIPPLE_CALLBACK_KIND_BOARD_ENTERED` | 1 | `board.entered` |
| `RIPPLE_CALLBACK_KIND_SOUNDSCAPE_CHANGED` | 2 | `soundscape.changed` |
| `RIPPLE_CALLBACK_KIND_PASSAGE_SHOWN` | 3 | `passage.shown` |
| `RIPPLE_CALLBACK_KIND_CHOICE_TAKEN` | 4 | `choice.taken` |
| `RIPPLE_CALLBACK_KIND_DELAY_STARTED` | 5 | `delay.started` |
| `RIPPLE_CALLBACK_KIND_DELAY_ELAPSED` | 6 | `delay.elapsed` |
| `RIPPLE_CALLBACK_KIND_STORY_ENDED` | 7 | `story.ended` |
| `RIPPLE_CALLBACK_KIND_STORY_FAILED` | 8 | `story.failed` |
| `RIPPLE_CALLBACK_KIND_CVAR_CHANGED` | 9 | `cvar.changed` |
| `RIPPLE_CALLBACK_KIND_ENTITY_SPAWNED` | 10 | `entity.spawned` |
| `RIPPLE_CALLBACK_KIND_ENTITY_REMOVED` | 11 | `entity.removed` |
| `RIPPLE_CALLBACK_KIND_ENTITY_RENAMED` | 12 | `entity.renamed` |
| `RIPPLE_CALLBACK_KIND_ENTITY_FIELD_CHANGED` | 13 | `entity.field.changed` |
| `RIPPLE_CALLBACK_KIND_MACHINE_STATE_ENTERED` | 14 | `machine.state.entered` |
| `RIPPLE_CALLBACK_KIND_NODE_ENTERED` | 15 | `node.entered` |
| `RIPPLE_CALLBACK_KIND_NODE_EXITED` | 16 | `node.exited` |
| `RIPPLE_CALLBACK_KIND_NODE_FAILED` | 17 | `node.failed` |
| `RIPPLE_CALLBACK_KIND_COUNTDOWN_STARTED` | 18 | `countdown.started` |
| `RIPPLE_CALLBACK_KIND_COUNTDOWN_EXPIRED` | 19 | `countdown.expired` |

What each event fires on and what it may be aimed at is in [Host callbacks](/reference/host-callbacks/).

## Sound

No speaker ships. The session says what the story asks for as `Audio` effects; the engine's scheduler, `ripple::Mixer`, decides every voice from them; a speaker you write makes the sounds. `ripple::SoundscapeDriver` drives the scheduler for a speaker, and is the host's half of it. The binding's [speaker contract](https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration/blob/main/docs/speaker.md) has mapping notes for miniaudio, SDL3 and FMOD Core.

```cpp
MySpeaker speaker;
auto audio = ripple::SoundscapeDriver::create(campaign, speaker);
ripple::PlayerHandlers handlers;
handlers.audio = audio.get();
ripple::Player player(ripple::Session::create(campaign, config), handlers);
// every frame:  audio->update();  player.update();
```

### SoundscapeDriver

| Member | Answers | Notes |
| --- | --- | --- |
| `static create(campaign, speaker, options = {})` | `std::unique_ptr<SoundscapeDriver>` | Keeps references to `campaign` and `speaker`, which must outlive it. Not copyable. |
| `apply(command)` | `void` | Obeys one `AudioCommand`. `Player` calls it for every `Audio` effect. A cue whose medium has no file is ignored. |
| `update()` | `void` | Call from your loop: hears what the voices reported and moves the timeline on. The editor's pace is every 25 ms; more often loses nothing. |
| `set_muted(muted)` | `void` | Mutes or unmutes at once: every gain written as zero, the rest remembered. |
| `muted()` | `bool` | |
| `pause()`, `resume()` | `void` | Holds every voice and the timeline with them, not the story. |
| `playing()` | `std::optional<std::string>` | The id of the soundscape in force, sounding or waiting its turn. |
| `idle()` | `bool` | Whether nothing sounds, waits or cues. |
| `voices()` | `std::size_t` | How many voices the speaker holds open now. |
| destructor | | Stops every voice. |

A failure from the mixer stops the sound rather than the story: the driver does not report it.

`SoundscapeOptions`:

| Field | Type | Default |
| --- | --- | --- |
| `max_cues` | `std::uint32_t` | `RIPPLE_MIXER_DEFAULT_MAX_CUES` |
| `gain_step` | `double` | `RIPPLE_MIXER_DEFAULT_GAIN_STEP` |
| `muted` | `bool` | `false` |
| `now` | `Clock` | `ripple::steady_clock()` |

What the driver does, so that a speaker does not: the clock and the tick; the scheduler's commands, in order; a late voice, whose start moves on by the time `open` took times `rate`, a looping clip wrapping inside its loop and a clip already over reported ended; voices reported ended or measured, told to the scheduler; tracks with no file, told as silence; mute; and the handover between soundscapes, which never overlap: the one leaving fades out over its own `fade_out` before the next begins.

### Speaker and Voice

```cpp
class Speaker {
  public:
    virtual std::unique_ptr<Voice> open(const VoiceSource& source, VoiceRole role,
                                        VoiceEvents events) = 0;
    virtual bool resolves(const VoiceSource& source) { return true; }
};

class Voice {
  public:
    virtual void play(const VoicePlay& request) = 0;
    virtual void set_gain(double gain) = 0;
    virtual void pause() = 0;
    virtual void resume() = 0;
    virtual void stop() = 0;
};
```

| Member | Obligation |
| --- | --- |
| `Speaker::open(source, role, events)` | Returns once the voice can begin at once: the file opened, or enough of it decoded. Returns `nullptr` when the file cannot be played, which is heard as silence and never retried. Keep `events` with the voice. `role` is a hint: `VoiceRole::track` is usually long and better streamed, `VoiceRole::cue` short and better decoded whole and started precisely. |
| `Speaker::resolves(source)` | Asked before a soundscape plays: a track your speaker cannot play is told to the scheduler as silence up front. True unless overridden. |
| `Voice::play(request)` | Begins at once, replacing whatever the voice was playing. May be called again on the same voice, for a gapless bed whose file ended and comes round; follow on as closely as your API allows. |
| `Voice::set_gain(gain)` | A new gain on the same cubic scale. The scheduler writes one each tick a fade moves; smooth between them over a few milliseconds. |
| `Voice::pause()`, `Voice::resume()` | Hold the voice exactly where it is, and let it go again. The driver pauses every voice together. |
| `Voice::stop()` | Ends the voice for good and lets its resources go. No `ended` follows. |

`VoicePlay`, what a voice is to play:

| Field | Type | Meaning |
| --- | --- | --- |
| `from_ms` | `double` | Where in the file to begin. |
| `to_ms` | `std::optional<double>` | Where to stop; the file's end when absent. |
| `gain` | `double` | 0 to 1, on the engine's cubic scale. |
| `rate` | `double` | Playback speed; 1 is as recorded. |
| `looping` | `bool` | Whether reaching `to_ms` comes round again. |
| `loop_from_ms` | `double` | Where each turn of a loop comes round to: `loop_from_ms`, not `from_ms`. |

**The gain scale is cubic.** A speaker that writes amplitude writes `gain * gain * gain`.

`VoiceSource`: `media` (by index into the manifest's media), `path` (inside the bundle), and `file` (on disk, for a campaign opened from a folder).

`VoiceEvents`, what a voice reports back. Both calls are thread-safe and may come from an audio thread; the driver hears them on its next `update()`. A call from a voice that was stopped meanwhile is ignored.

| Member | When |
| --- | --- |
| `ended()` | Once per play, when a non-looping voice reaches the end of what it was given. Never after `stop()`, never for a looping voice. |
| `duration(ms)` | Once, when the file's length is known. A track played to its file's end has no end the scheduler can plan a fade-out or a gapless turn for until then. |

### Mixer

`ripple::Mixer` is the engine's soundscape scheduler, raw: commands in, `VoiceCommands` out, the host's clock on every verb, and no clock, file or voice of its own. A host with a `Speaker` uses the driver instead; a host that drives the mixer itself owes it everything the driver does.

| Member | Answers | Notes |
| --- | --- | --- |
| `static create(max_cues = RIPPLE_MIXER_DEFAULT_MAX_CUES, gain_step = RIPPLE_MIXER_DEFAULT_GAIN_STEP)` | `Mixer` | At most `max_cues` cues at once; a gain written only when it moved by more than `gain_step`. |
| `handle()` | `RippleMixer*` | |
| `play(now_ms, soundscape, unresolved = {}, at_ms = 0, muted = false)` | `VoiceCommands` | An audio `play`, `at_ms` into the timeline, handing over from whatever is sounding. `unresolved` names the tracks you have no file for, by index: heard as silence, never retried. |
| `stop(now_ms)` | `VoiceCommands` | An audio `stop`: fades out what is sounding. |
| `cut(now_ms)` | `VoiceCommands` | An audio `cut`: silences everything at once, cues included. |
| `cue(now_ms, media, volume, speed)` | `VoiceCommands` | An audio `cue`. |
| `pause(now_ms)`, `resume(now_ms)` | `VoiceCommands` | |
| `tick(now_ms)` | `VoiceCommands` | Moves the timeline on: what is due opens, ramps move, what is done stops. |
| `voice_ended(now_ms, voice)` | `VoiceCommands` | The speaker's report that a voice reached its end. |
| `duration_known(voice, ms)` | `void` | The speaker's report of a file's length. |
| `set_muted(muted)` | `void` | The timeline runs on, every gain written as 0. |
| `playing_id()` | `std::optional<std::string>` | The soundscape playing. |
| `finishing_id()` | `std::optional<std::string>` | The soundscape fading out under the one playing. |
| `state()` | `std::optional<Phase>` | The playing soundscape's phase. |
| `track_state(track)` | `Phase` | A track's phase, by index into the playing soundscape's tracks. |
| `position_ms()` | `std::uint64_t` | How far into its timeline the playing soundscape is. |
| `pass()` | `std::uint32_t` | How many times it has gone round. |
| `ran_out()` | `bool` | Whether it has played to its end and will not loop. |
| `is_paused()`, `muted()` | `bool` | |
| `is_idle()` | `bool` | Whether nothing is sounding or due: when a host may stop ticking. |

`Phase` is `queued`, `starting`, `playing`, `finishing` or `finished`.

`VoiceCommand`, read by `kind`; a field another kind does not use is zero:

| Field | Type | Meaning |
| --- | --- | --- |
| `kind` | `VoiceKind` | `open` a voice on `media` and play it; `gain`, a new gain; `stop` the voice for good, which reports no end; `pause` every voice; `resume` every voice. |
| `voice` | `std::uint64_t` | `open`, `gain`, `stop`: the voice. |
| `media` | `std::uint32_t` | `open`: by index into the manifest's media. |
| `from_ms` | `std::uint64_t` | `open`. |
| `to_ms` | `std::optional<std::uint64_t>` | `open`: none for the file's end. |
| `gain` | `double` | `open`, `gain`: on the cubic scale. |
| `rate` | `double` | `open`. |
| `looping`, `loop_from_ms` | `bool`, `std::uint64_t` | `open`. |
| `role` | `VoiceRole` | `open`: `track` or `cue`. |
| `track` | `std::uint32_t` | `open`, as a track: its index in the soundscape. |

## Errors

With exceptions, every call that can fail throws a class derived from `ripple::Error`, a `std::runtime_error` whose `failure()` answers the `Failure` and `code()` its `Code`. With `RIPPLE_HPP_NO_EXCEPTIONS` defined, the same calls answer `ripple::Result<T>`. `ripple::Returns<T>` is `T` with exceptions and `Result<T>` without, so code that reads results through it compiles both ways.

| `RippleResult` | Value | `ripple::Code` | C++ class | Met |
| --- | --- | --- | --- | --- |
| `RIPPLE_SUCCESS` | 0 | `success` | | |
| `RIPPLE_ERROR_BUNDLE_FORMAT` | 1 | `bundle_format` | `BundleError` | In use: a document of the bundle is malformed or not there. |
| `RIPPLE_ERROR_BUNDLE_VERSION` | 2 | `bundle_version` | `BundleError` | In use: a document is from a version this engine cannot read. |
| `RIPPLE_ERROR_NEEDS_PYTHON` | 3 | `needs_python` | `NeedsPython` | In use: the bundle needs Python and this is the `no-python` library. |
| `RIPPLE_ERROR_WRONG_TURN` | 10 | `wrong_turn` | `HostError` | A host bug: the verb does not answer the turn the story is on. |
| `RIPPLE_ERROR_NO_SUCH_CHOICE` | 11 | `no_such_choice` | `HostError` | A host bug: a choice past the offered ones. |
| `RIPPLE_ERROR_CHOICE_SPENT` | 12 | `choice_spent` | `HostError` | A host bug: a choice whose `available` is false. |
| `RIPPLE_ERROR_STOPPED` | 13 | `stopped` | `HostError` | A host bug: the session has stopped. |
| `RIPPLE_ERROR_NOTHING_ASKED` | 14 | `nothing_asked` | `HostError` | A host bug: `start` was not called. |
| `RIPPLE_ERROR_UNKNOWN_LOCALE` | 15 | `unknown_locale` | `HostError` | A language the campaign is not readable in. |
| `RIPPLE_ERROR_NOT_PERMITTED` | 16 | `not_permitted` | `HostError` | A host bug: a reading handed in for a kind the reader has not granted. |
| `RIPPLE_ERROR_STAND_IN` | 17 | `stand_in` | `HostError` | In use: a reader's stand-in that does not read as one; the message says why. |
| `RIPPLE_ERROR_NO_COUNTDOWN` | 18 | `no_countdown` | `HostError` | A host bug: `begin_countdown` or `expire` on a passage with no countdown. |
| `RIPPLE_ERROR_COUNTDOWN_NOT_BEGUN` | 19 | `countdown_not_begun` | `HostError` | A host bug: `expire` before `begin_countdown`. |
| `RIPPLE_ERROR_BOARD_GONE` | 20 | `board_gone` | `ResumeError` | In use: a save names a board the campaign no longer has. |
| `RIPPLE_ERROR_NODE_GONE` | 21 | `node_gone` | `ResumeError` | In use: a save names a node the board no longer has. |
| `RIPPLE_ERROR_INVALID_ARGUMENT` | -1 | `invalid_argument` | `InvalidArgument` | A host bug: a NULL handle or pointer, a string that is not UTF-8, a value out of range. Nothing was done. |
| `RIPPLE_ERROR_TRAP` | -2 | `trap` | `EngineTrap` | The engine panicked, now or earlier on this handle. |
| | -100 | `reentrant` | `ReentrantVerb` | A host bug, C++ only: a `Player` verb from inside a handler. |

`Failure` carries everything the engine said. Which fields mean something depends on `code`; the rest are zero or empty.

| Field | Set for |
| --- | --- |
| `code`, `message` | Always. `message` is the engine's sentence, for a log or a developer. |
| `location` | `bundle_format`: where in the document, when known. |
| `found`, `supported`, `oldest` | `bundle_version`: the version the document carries, the newest this engine reads, and the oldest when there is a floor. |
| `asked`, `answered` | `wrong_turn`: the turn the story is on (a `RippleTurnKind`: `PRESENT`, `ASK`, `WAIT`, `ENDED`, `FAILED`, `STOPPED`, `PERMIT`) and the verb called (a `RippleVerb`: `CHOOSE`, `ANSWER`, `ELAPSED`, `BEGIN_COUNTDOWN`, `EXPIRE`). |
| `offered`, `chosen` | `no_such_choice`: how many choices were offered, and the index taken. |
| `subject` | `choice_spent` (the port), `unknown_locale` (the locale), `board_gone` and `node_gone` (the board), `not_permitted` and `stand_in` (the kind's name). |
| `node` | `node_gone`. |

`Result<T>`: `ok()` and `explicit operator bool`, `value()`, `operator->`, `operator*`, and `failure()`. `Result<void>` has `ok()`, `operator bool` and `failure()`, whose code is `success` when nothing failed.

**A trap poisons the handle.** After `RIPPLE_ERROR_TRAP` from any call, destroy that handle, open again and resume from the last checkpoint. Under Emscripten a panic aborts the module instead, and the page reopens and resumes.

## Threading and lifetime

- **One caller at a time per handle.** A `Campaign`, `Session` or `Mixer` may move between threads; to run the engine off your main thread, move the handle there.
- **The engine starts no thread, never sleeps and never reads a clock.** A `Hold` and a countdown are answered by your clock, through `elapsed()`, `begin_countdown()` and `expire()` or `Player::update()`, and the time a story reads is the one you hand `set_now`.
- **`Player` and `SoundscapeDriver` own no clock and no thread.** They read their `Clock` when you call `update()`; your loop is the timer. Their calls come from one thread; `VoiceEvents` may be called from any.
- **RAII.** `Campaign`, `Session` and `Mixer` are move-only and destroy their C handle with them. A campaign may be destroyed before its sessions. A `Player` owns its `Session`. A `SoundscapeDriver` holds references to its `Campaign` and `Speaker`, so both must outlive it.
- **Nothing in C++ points into the engine.** Every answer is copied out of the C result, which is freed before the call returns; the cost is a copy per verb.
- **In C, a batch's pointers die with it.** Everything a call writes through an out-pointer is valid until it is given to `ripple_free`.

## The C layer

`ripple.h` is C99 and keeps the same conventions in every function:

- **Results.** A call that can fail returns a `RippleResult` and takes a last `const RippleError **error`, which may be NULL. On failure `*error` describes it; give it back with `ripple_free`.
- **Out-pointers.** Everything written through an out-pointer is the engine's and goes back through `ripple_free`. NULL, a pointer the engine never gave and one already freed are all ignored.
- **A leak check.** `ripple_outstanding()` answers how many objects the engine has handed out and not had back: zero once everything has been freed.
- **Handles.** `RippleCampaign`, `RippleSession` and `RippleMixer` are opaque and go back through their own `ripple_*_destroy`, which ignores NULL.
- **Tagged unions.** A `uint32_t kind` and a `union data` read by it: an effect, a value node, a voice command. A `Permit` effect is `RIPPLE_EFFECT_KIND_PERMIT` (12) with `data.permit`, a `RipplePermit` of `kinds` and `kind_count`; a `Notice` is `RIPPLE_EFFECT_KIND_NOTICE` (13) with `data.notice`, a `RippleNotice` of `code`, `kind`, `node` and `message`. A passage's `timer` is a `RippleChoiceTimer` pointer, NULL for none, and a `RipplePromptField` carries `label`, `placeholder`, `optional` and `options`, `option_count` of `RipplePromptOption` (`id`, `label`, `value`).
- **Strings.** A `RippleStr` is `{ptr, len}`, UTF-8. `ptr` is NULL for an absent optional string; a present empty one has a non-NULL `ptr` and `len` 0. From the engine it is NUL-terminated past `len`; from a host it need not be.
- **Optionals.** `RippleOptionalU32`, `RippleOptionalU64` and `RippleOptionalI64` are `{present, value}`.
- **Lists.** A pointer and a count, either as a struct (`RippleEffects`, `RippleStrList`, `RippleEntityList`…) or as a field pair (`choices`, `choice_count`).
- **Values.** The arena under *Values*.
- **Options.** Start from `ripple_session_options_default` and change what you mean to.

### Functions

**The engine and its formats**

| Function | Does |
| --- | --- |
| `ripple_engine_version` | The library's version, a string it owns. |
| `ripple_engine_contract` | The contract the library binds, a string it owns. |
| `ripple_engine_has_python` | False for the `no-python` library. |
| `ripple_bundle_format` | The bundle format the engine writes, and reads up to. |
| `ripple_save_format` | The save format the engine writes. |
| `ripple_save_check` | Reads a stored save and answers it as this engine would write it, refusing one that is malformed or from a newer engine before a session is asked to resume it. No C++ wrapper. |
| `ripple_callback_kind_name` | A `RippleCallbackKind`'s name, such as `cvar.changed`; NULL for any other value. |
| `ripple_cvar_types` | The console variable types a campaign may declare, by wire name. No C++ wrapper. |
| `ripple_cvar_coerce` | A value coerced to a console variable's type, as a write would take it; `*out` NULL when the type refuses it. No C++ wrapper. |
| `ripple_cvar_describe_refusal` | The sentence a refused console-variable write would be refused with. No C++ wrapper. |
| `ripple_value_as_text` | A value as text, the way a passage would print it. |
| `ripple_value_as_truth` | Whether a value is true, by the story's rules of truth. No C++ wrapper. |
| `ripple_value_deep_equals` | Whether two values are equal by the story's rules: a map by membership, an Int and a Float by number. No C++ wrapper. |

**Campaign**

| Function | Does |
| --- | --- |
| `ripple_campaign_open_dir` | Opens the bundle in a folder. |
| `ripple_campaign_open_memory` | Opens a bundle from an array of `RippleFile` (`path`, `bytes`, `len`); the bytes are copied. |
| `ripple_campaign_destroy` | Destroys a campaign; its sessions go on working. |
| `ripple_campaign_manifest` | The manifest. |
| `ripple_campaign_board` | A board, by index. |
| `ripple_campaign_soundscape` | A soundscape, by index. |
| `ripple_campaign_board_with_id` | The index of a board by catalog id, as a `RippleOptionalU32`. |
| `ripple_campaign_node` | A node of a board by id; `*out` NULL when there is none. |
| `ripple_campaign_validate` | Everything wrong with the bundle as a whole. |
| `ripple_campaign_media_path` | A medium's path inside the bundle; `*out` NULL when there is no such medium. |
| `ripple_campaign_has_media` | Whether the bundle holds the medium's file. No C++ wrapper. |
| `ripple_campaign_media_bytes` | A medium's bytes, read whole; `*out` NULL when the bundle does not hold it. |

**Session**

| Function | Does |
| --- | --- |
| `ripple_session_options_default` | Fills a `RippleSessionOptions` with the engine's own budgets and policies. |
| `ripple_session_create` | A new session from a `RippleSessionConfig`. |
| `ripple_session_resume` | A session from a save, a seed and options. |
| `ripple_session_destroy` | Destroys a session. |
| `ripple_session_start` | The first turn, or the saved one. |
| `ripple_session_choose` | Answers a passage; `RIPPLE_CHOICE_NONE` for leaving. |
| `ripple_session_answer` | Answers a form with `RippleFields`; NULL for leaving. |
| `ripple_session_elapsed` | Answers a wait. |
| `ripple_session_begin_countdown` | The shown passage's countdown begins; moves nothing. |
| `ripple_session_expire` | The countdown ran out; the passage's default is taken. |
| `ripple_session_permit` | The host's answer for one `RipplePermissionKind`, at any time, before `ripple_session_start` included. |
| `ripple_session_set_now` | What time it is, a `RippleMoment` (`utc_ms`, `offset_minutes`); NULL for no clock. |
| `ripple_session_set_position` | The host's last fix, a `RipplePosition` (`label`, then `latitude`, `longitude` and `accuracy` as `RippleOptionalF64`, and `when`, a `RippleMoment` pointer); NULL for none. |
| `ripple_session_set_stand_in` | The reader's stand-in for one kind, as typed, read at `local_offset_minutes` when it carries no offset; a NULL string takes it away. |
| `ripple_session_set_locale` | Changes the language; the turn is answered again. |
| `ripple_session_restart` | Starts over from the first turn. |
| `ripple_session_pause` | The save and what pausing did, as a `RipplePaused`. |
| `ripple_session_stop` | Stops the story for good. |
| `ripple_session_checkpoint` | A save without stopping; `*out` NULL when there is nothing to save yet. |
| `ripple_session_console_feed` | Runs a line of Python, as a `RippleConsoleResult`. |
| `ripple_session_write_cvar` | Writes a console variable, as a `RippleCvarChange`. |
| `ripple_session_reset_cvar` | Puts one console variable back to its default. |
| `ripple_session_reset_all_cvars` | Puts every console variable back. |
| `ripple_session_remove_entity` | Removes an entity, as a `RippleEntityRemoval`. |
| `ripple_session_board` | The board the story is on. |
| `ripple_session_locale` | The language it reads in. |
| `ripple_session_default_locale` | The campaign's default language. |
| `ripple_session_ambience` | The soundscape in force; `*out` NULL for silence. |
| `ripple_session_entities` | Every entity. |
| `ripple_session_memory` | What the story remembers. |
| `ripple_session_cvars` | Every console variable with its value. |
| `ripple_session_guard` | What the script guard has had to do. |
| `ripple_session_python_available` | Whether the session can run scripts. |
| `ripple_session_describe_cvar_write` | Why a write would be refused; `*out` NULL when it would be taken. |
| `ripple_session_set_trace` | Turns `trace` effects on or off. |
| `ripple_session_set_trace_payloads` | Turns traced payloads on or off. |
| `ripple_session_generator` | The dice's state. |
| `ripple_session_set_generator` | Sets the dice's state. |

**Mixer**

| Function | Does |
| --- | --- |
| `ripple_mixer_create` | A mixer with `max_cues` and `gain_step`. |
| `ripple_mixer_destroy` | Destroys a mixer; your voices are yours to stop. |
| `ripple_mixer_play` | Plays a soundscape, with the unresolved tracks and `at_ms`. |
| `ripple_mixer_stop` | Fades out what is sounding. |
| `ripple_mixer_cut` | Silences everything at once. |
| `ripple_mixer_cue` | Plays one cue. |
| `ripple_mixer_pause` | Holds everything where it is. |
| `ripple_mixer_resume` | Lets everything go on. |
| `ripple_mixer_tick` | Moves the timeline on to `now_ms`. |
| `ripple_mixer_voice_ended` | A voice reached its end. |
| `ripple_mixer_duration_known` | A file's length is known. |
| `ripple_mixer_set_muted` | Mutes or unmutes. |
| `ripple_mixer_playing_id` | The soundscape playing; `*out` NULL when none is. |
| `ripple_mixer_finishing_id` | The soundscape fading out under it. |
| `ripple_mixer_state` | The playing soundscape's `RipplePhase`, absent when none is playing. |
| `ripple_mixer_track_state` | A track's `RipplePhase`. |
| `ripple_mixer_position_ms` | How far into its timeline it is. |
| `ripple_mixer_pass` | How many times it has gone round. |
| `ripple_mixer_ran_out` | Whether it played to its end and will not loop. |
| `ripple_mixer_is_paused` | Whether the mixer is paused. |
| `ripple_mixer_muted` | Whether it is muted. |
| `ripple_mixer_is_idle` | Whether nothing is sounding or due. |

**Memory**

| Function | Does |
| --- | --- |
| `ripple_free` | Gives back anything the engine handed out: a batch, a manifest, a string, an error. Forgives NULL and a double free. |
| `ripple_outstanding` | How many objects are handed out and not given back. |

A host driving the mixer from C calls `ripple_mixer_play` with the `RippleSoundscape` an audio effect carries, `ripple_mixer_tick` from its loop while `ripple_mixer_is_idle` says something is sounding, and `ripple_mixer_voice_ended` from its speaker, and carries out every `RippleVoiceCommands` with its own audio API, owing the scheduler the duties listed under *SoundscapeDriver*.

### A turn loop in C

```c
#include <ripple/ripple.h>

#include <stdio.h>
#include <string.h>

uint32_t pick(const RipplePassage *passage);   /* yours */
void wait_ms(uint64_t ms);                      /* yours */

static RippleStr str(const char *text)
{
    RippleStr s;
    s.ptr = text;
    s.len = strlen(text);
    return s;
}

static int report(RippleResult code, const RippleError *error)
{
    fprintf(stderr, "ripple (%d): %.*s\n", (int)code,
            error ? (int)error->message.len : 0, error ? error->message.ptr : "");
    ripple_free(error);
    return 1;
}

int play(const char *folder, uint64_t seed)
{
    RippleCampaign *campaign = NULL;
    RippleSession *session = NULL;
    const RippleManifest *manifest = NULL;
    const RippleEffects *batch = NULL;
    const RippleError *error = NULL;
    RippleSessionConfig config;
    RippleResult code;

    code = ripple_campaign_open_dir(str(folder), &campaign, &error);
    if (code != RIPPLE_SUCCESS) return report(code, error);

    code = ripple_campaign_manifest(campaign, &manifest, &error);
    if (code != RIPPLE_SUCCESS) {
        ripple_campaign_destroy(campaign);
        return report(code, error);
    }
    memset(&config, 0, sizeof config);           /* absent strings are {NULL, 0} */
    config.board = manifest->entry_count > 0 ? manifest->entries[0] : 0;
    config.seed = seed;
    ripple_session_options_default(&config.options);
    ripple_free(manifest);

    code = ripple_session_create(campaign, &config, &session, &error);
    if (code == RIPPLE_SUCCESS) code = ripple_session_start(session, &batch, &error);

    while (code == RIPPLE_SUCCESS && batch != NULL && batch->count > 0) {
        const RippleEffect *turn = &batch->items[batch->count - 1];   /* the Turn is last */
        const RippleEffects *next = NULL;
        size_t i;
        for (i = 0; i + 1 < batch->count; i++) {
            const RippleEffect *effect = &batch->items[i];
            if (effect->kind == RIPPLE_EFFECT_KIND_AUDIO) {
                /* effect->data.audio, to ripple_mixer_* */
            } else if (effect->kind == RIPPLE_EFFECT_KIND_CALLBACK) {
                /* effect->data.callback->callback, by name */
            }
        }
        if (turn->kind == RIPPLE_EFFECT_KIND_SHOW) {
            code = ripple_session_choose(session, pick(turn->data.show), &next, &error);
        } else if (turn->kind == RIPPLE_EFFECT_KIND_HOLD) {
            wait_ms(turn->data.hold_ms);
            code = ripple_session_elapsed(session, &next, &error);
        } else if (turn->kind == RIPPLE_EFFECT_KIND_ASK) {
            code = ripple_session_answer(session, NULL, &next, &error);   /* the reader leaves */
        } else if (turn->kind == RIPPLE_EFFECT_KIND_PERMIT) {
            /* Before it begins: each answer but the last answers nothing, and the
               last begins the story. Here every kind is refused. */
            size_t k;
            for (k = 0; k < turn->data.permit->kind_count && code == RIPPLE_SUCCESS; k++) {
                ripple_free(next);
                next = NULL;
                code = ripple_session_permit(session, turn->data.permit->kinds[k], false,
                                             &next, &error);
            }
        }
        ripple_free(batch);   /* every pointer into the batch dies here */
        batch = next;         /* NULL after ended, failed or stopped */
    }
    ripple_session_destroy(session);
    ripple_campaign_destroy(campaign);
    return code == RIPPLE_SUCCESS ? 0 : report(code, error);
}
```

## A complete host

A terminal host in C++17: a speaker that writes down what it would play, the driver and the player, a choice that skips spent options, the question a story asks before it reads the clock or the location, a form drawn by its labels with its fixed answers picked by id, holds and countdowns answered from `update()`, the story told this machine's time, named callbacks with a verb queued from a handler, a checkpoint at every passage, and a trap recovered by reopening and resuming.

```cpp
#include <ripple/ripple.hpp>

#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <deque>
#include <functional>
#include <iostream>
#include <optional>
#include <string>
#include <thread>
#include <vector>

namespace {

// A voice that prints what it is told. Yours opens the file with your audio API,
// and calls events_.ended() and events_.duration(ms) from its own thread.
class PrintedVoice : public ripple::Voice {
  public:
    PrintedVoice(std::string file, ripple::VoiceEvents events)
        : file_(std::move(file)), events_(std::move(events)) {}

    void play(const ripple::VoicePlay& r) override {
        const double amplitude = r.gain * r.gain * r.gain;   // the gain scale is cubic
        std::printf("[sound] %s from %.0f ms, amplitude %.3f%s\n", file_.c_str(), r.from_ms,
                    amplitude, r.looping ? ", looping" : "");
    }
    void set_gain(double gain) override { (void)gain; }   // smooth it over a few ms
    void pause() override {}
    void resume() override {}
    void stop() override { std::printf("[sound] stop %s\n", file_.c_str()); }

  private:
    std::string file_;
    ripple::VoiceEvents events_;
};

class PrintedSpeaker : public ripple::Speaker {
  public:
    std::unique_ptr<ripple::Voice> open(const ripple::VoiceSource& source, ripple::VoiceRole,
                                        ripple::VoiceEvents events) override {
        return std::make_unique<PrintedVoice>(source.file.value_or(source.path),
                                              std::move(events));
    }
};

std::optional<std::uint32_t> pick(const ripple::Passage& passage) {
    std::cout << "\n== " << passage.title << " ==\n" << passage.text << "\n\n";
    if (passage.choices.empty()) return ripple::leave;
    for (std::size_t i = 0; i < passage.choices.size(); ++i)
        std::cout << "  " << i + 1 << ". " << passage.choices[i].text
                  << (passage.choices[i].available ? "" : " (spent)") << "\n";
    for (std::string line; std::cout << "> " && std::getline(std::cin, line);) {
        const std::size_t n = std::strtoul(line.c_str(), nullptr, 10);
        // A spent choice is shown but never taken: choosing it is choice_spent.
        if (n >= 1 && n <= passage.choices.size() && passage.choices[n - 1].available)
            return static_cast<std::uint32_t>(n - 1);
    }
    return ripple::leave;
}

bool yes(const std::string& question) {
    std::string line;
    std::cout << question << " [y/N] " << std::flush;
    return std::getline(std::cin, line) && !line.empty() && (line[0] == 'y' || line[0] == 'Y');
}

bool is_list(const ripple::PromptField& field) {
    return field.type.size() > 4 && field.type.compare(field.type.size() - 4, 4, "List") == 0;
}

std::optional<ripple::Value::Map> fill(const ripple::Prompt& prompt) {
    std::cout << "\n(" << prompt.title << ")\n";
    ripple::Value::Map answers;
    for (const ripple::PromptField& field : prompt.fields) {
        if (field.options.empty() && field.type != "string") {
            answers.emplace_back(field.name, field.default_value);   // the rest keep their defaults
            continue;
        }
        // Shown by its label, in the reader's language; answered under its name.
        std::cout << field.label << (field.optional ? " (optional)" : "") << "\n";
        for (std::size_t i = 0; i < field.options.size(); ++i)
            std::cout << "  " << i + 1 << ". " << field.options[i].label << "\n";
        for (std::string line; std::cout << "> " && std::getline(std::cin, line);) {
            if (line.empty() && field.optional) break;   // left out: the story reads nothing
            if (field.options.empty()) {
                if (line.empty()) continue;   // a required field is not submitted empty
                answers.emplace_back(field.name, ripple::Value(line));
                break;
            }
            // A pick is answered with the option's id, never its words.
            const std::size_t n = std::strtoul(line.c_str(), nullptr, 10);
            if (n < 1 || n > field.options.size()) continue;
            const ripple::Value id(field.options[n - 1].id);
            answers.emplace_back(field.name,
                                 is_list(field) ? ripple::Value(ripple::Value::List{id}) : id);
            break;
        }
    }
    return answers;   // std::nullopt would leave the form instead
}

// A save, and the dice where they were when it was made.
struct Saved {
    std::string save;
    ripple::Generator dice;
};

// Plays from `last`, or from the start; keeps `last` up to date at every passage.
void play(const std::string& folder, std::optional<Saved>& last) {
    const ripple::Campaign campaign = ripple::Campaign::open_dir(folder);
    const ripple::Manifest manifest = campaign.manifest();

    PrintedSpeaker speaker;
    auto audio = ripple::SoundscapeDriver::create(campaign, speaker);

    ripple::SessionOptions options;
    options.untranslated = ripple::Untranslated::fall_back;
    const std::uint64_t seed = 20261019;

    std::optional<ripple::Session> session;
    if (last) {
        session.emplace(ripple::Session::resume(campaign, last->save, seed, options));
        session->set_generator(last->dice);
    } else {
        ripple::SessionConfig config;
        config.board = manifest.entries.empty() ? 0 : manifest.entries.front();
        config.seed = seed;
        config.options = options;
        session.emplace(ripple::Session::create(campaign, config));
    }

    std::optional<ripple::Failure> broke;
    ripple::PlayerHandlers handlers;
    handlers.audio = audio.get();
    // Asked before every verb; the story reads it only once the reader has said it may.
    handlers.moment = [] { return std::optional<ripple::Moment>(ripple::local_moment()); };
    handlers.on_effect = [](const ripple::Effect& effect) {
        // A read of the clock or the place that got a stand-in, a refusal or nothing.
        if (const auto* notice = std::get_if<ripple::Notice>(&effect))
            std::cout << "  [" << notice->code << "] " << notice->message << "\n";
    };
    handlers.on_error = [&](const ripple::Failure& failure) {
        std::cerr << "ripple: " << failure.message << "\n";
        if (failure.code == ripple::Code::trap) broke = failure;
    };
    ripple::Player player(std::move(*session), handlers);

    // A handler may not call a verb; it queues one for after it returns.
    std::deque<std::function<void()>> later;
    player.on_callback("achievementHit", [](const ripple::CallbackEvent& fired) {
        std::cout << "[achievement] " << fired.name.value_or(fired.callback) << "\n";
    });
    player.on_callback("returnToMenu", [&](const ripple::CallbackEvent&) {
        later.push_back([&] { player.stop(); });
    });
    player.on_any_callback([](const ripple::CallbackEvent& fired) {
        std::cout << "[callback] " << fired.callback << " (" << fired.event_name() << ")\n";
    });

    player.start();   // on a resumed session, the saved passage again
    for (;;) {
        audio->update();
        player.update();   // answers a Hold, and runs a countdown, once its time has come
        if (broke) throw ripple::EngineTrap(*broke);
        while (!later.empty()) {
            auto run = std::move(later.front());
            later.pop_front();
            run();
        }

        const std::optional<ripple::Effect>& turn = player.turn();
        if (!turn || ripple::is_over(*turn)) break;
        if (const auto* shown = std::get_if<ripple::Show>(&*turn)) {
            if (auto save = player.session().checkpoint())
                last = Saved{*save, player.session().generator()};
            player.choose(pick(shown->passage));
        } else if (const auto* asked = std::get_if<ripple::Ask>(&*turn)) {
            player.answer(fill(asked->prompt));
        } else if (const auto* permit = std::get_if<ripple::Permit>(&*turn)) {
            // A copy: the answer to the last kind begins the story, and its first
            // turn replaces this one.
            const std::vector<ripple::PermissionKind> kinds = permit->kinds;
            for (const ripple::PermissionKind kind : kinds)
                player.permit(kind, yes(kind == ripple::PermissionKind::location
                                            ? "May this story read where you are?"
                                            : "May this story read the date and time?"));
        } else {
            std::this_thread::sleep_for(std::chrono::milliseconds(25));   // a Hold
        }
    }

    if (const auto& turn = player.turn()) {
        if (const auto* ended = std::get_if<ripple::Ended>(&*turn))
            std::cout << "\nThe end" << (ended->title ? ": " + *ended->title : "") << "\n";
        else if (const auto* failed = std::get_if<ripple::Failed>(&*turn))
            std::cout << "\nThe story could not go on: " << failed->message << "\n";
    }
    std::cout << player.callback_misses() << " callbacks had no handler\n";
}

}  // namespace

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "usage: " << argv[0] << " <bundle folder>\n";
        return 2;
    }
    std::cout << "engine " << ripple::engine_version() << ", contract "
              << ripple::engine_contract() << "\n";

    std::optional<Saved> last;
    for (int attempt = 0; attempt < 3; ++attempt) {
        try {
            play(argv[1], last);
            return 0;
        } catch (const ripple::EngineTrap& trap) {
            // The handle is poisoned: everything was destroyed with play(); open again.
            std::cerr << "engine trap, resuming from the last passage: " << trap.what() << "\n";
            if (!last) return 1;
        } catch (const ripple::ResumeError&) {
            std::cerr << "This save is from an older build of the story.\n";
            last.reset();
        } catch (const ripple::NeedsPython&) {
            std::cerr << "This campaign needs the engine with Python.\n";
            return 1;
        } catch (const ripple::Error& error) {
            std::cerr << "ripple: " << error.what() << "\n";
            return 1;
        }
    }
    return 1;
}
```

## Related

- [Embedding the engine](/explanation/embedding-the-engine/): what a host is responsible for, and why the engine keeps no clock and plays no sound.
- [How the engine ships](/explanation/how-the-engine-ships/): engine releases, contracts and the two variants.
- [Play a campaign in your program](/how-to/play-a-campaign-in-your-program/): the steps from an exported campaign to a running host.
- [Engine targets](/reference/engine-targets/): every target an engine release ships, with its floor.
- [Host callbacks](/explanation/host-callbacks/): why a callback is a name the author publishes and the host answers.
