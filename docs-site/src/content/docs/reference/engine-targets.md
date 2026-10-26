---
title: Engine platforms and variants
description: Every platform the engine is built for, its floor, what each release archive holds, the two variants, and which binding ships which target.
---

The engine is released as `engine-v<version>` in [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases). Every target is built in both variants, and every archive is named in the release's signed manifest with its SHA-256 digest. Why it is shaped this way is [How the engine ships](/explanation/how-the-engine-ships/).

## Targets

| Target | Platform | Floor | C and C++ | C# | Dart | JavaScript |
| --- | --- | --- | --- | --- | --- | --- |
| `x86_64-unknown-linux-gnu` | Linux, x64 | glibc 2.35 | yes | `linux-x64` | yes | |
| `aarch64-unknown-linux-gnu` | Linux, arm64 | glibc 2.35 | yes | `linux-arm64` | yes | |
| `x86_64-apple-darwin` | macOS, Intel | macOS 12.0 | yes | `osx-x64` | yes | |
| `aarch64-apple-darwin` | macOS, Apple silicon | macOS 12.0 | yes | `osx-arm64` | yes | |
| `x86_64-pc-windows-msvc` | Windows, x64 | | yes | `win-x64` | yes | |
| `aarch64-pc-windows-msvc` | Windows, arm64 | | yes | `win-arm64` | yes | |
| `aarch64-linux-android` | Android, arm64 | API 24 | yes | `android-arm64` | yes | |
| `x86_64-linux-android` | Android, x86_64 (the emulator) | API 24 | yes | `android-x64` | yes | |
| `aarch64-apple-ios` | iOS, device | iOS 13.0 | static only | `ios-arm64`, static only | yes | |
| `aarch64-apple-ios-sim` | iOS, arm64 simulator | iOS 13.0 | static only | `iossimulator-arm64`, static only | yes | |
| `wasm32-unknown-emscripten` | a program compiled with Emscripten | Emscripten 4.0 | yes | | | |
| `wasm32-component` | browsers and Node | | | | web | yes |

- **The C archives** are in every release from engine 1.5.1; 1.5.0 carried the web component and the editor's own libraries only.
- **Nothing older or 32-bit** is built: no 32-bit Android, no Intel iOS simulator, no musl Linux.
- **Android** is linked with segments aligned for 16 KB pages.
- **iOS** shipped a static library only until engine 1.5.4, which added a shared one. The C, C++ and C# bindings link the static library.
- **Engine 1.5.1's macOS shared library** names its build machine's path instead of `@rpath`, and cannot be loaded. It is fixed from 1.5.2. The static library is unaffected.
- **`wasm32-unknown-emscripten`** is available from engine 1.5.3. It is single-threaded, and a panic ends the module instead of poisoning one handle. Emscripten 3.1.38, which Unity 6000.0 to 6000.4 bundle, links the engine but cannot open a campaign from a folder; Unity 6000.5 and later bundle Emscripten 4.0.19. .NET's own browser build bundles an older Emscripten, so it is not a target.
- **`wasm32-component`** is not a rustc triple: the `python` component is built for `wasm32-wasip2` and imports WASI's clock and random numbers, while the `no-python` one is built for `wasm32-unknown-unknown` and imports nothing.

## Variants

| Variant | What it is | Archive name |
| --- | --- | --- |
| `python` | The engine with its sandboxed Python interpreter. | `ripple-engine-c-<version>-<target>.tar.gz`, `ripple-engine-<version>-wasm32-component.tar.gz` |
| `no-python` | The same engine and API without it. About half the size natively. Refuses at open a campaign whose manifest says it needs Python. | the same names with `-no-python` after the version |

| Binding | How the variant is chosen |
| --- | --- |
| C and C++ | `RIPPLE_ENGINE_PYTHON`, a CMake option, `ON` by default. |
| C# | The package referenced: `RippleFx.Engine.Native` or `RippleFx.Engine.Native.NoPython`. |
| Dart | Native: the `python` user-define in the pubspec, `true` by default. Web: `--dart-define=RIPPLEFX_PYTHON=false`. |
| JavaScript and TypeScript | `Campaign.load`'s `python` option: `'auto'` by default, which reads the campaign's `needs`, or `true` or `false`. |

## What an archive holds

**The C archive**, `ripple-engine-c-<version>[-no-python]-<target>.tar.gz`, for every native target and for Emscripten:

| Path | What it is |
| --- | --- |
| `include/ripple/ripple.h` | The C header, C99. |
| `lib/libripple_effect_engine.so`, `.dylib` or `ripple_effect_engine.dll` | The shared library, with `ripple_effect_engine.dll.lib`, its import library, on Windows. Linux and Android carry the soname `libripple_effect_engine.so`; macOS and iOS the install name `@rpath/libripple_effect_engine.dylib`. Not in the Emscripten archive. |
| `lib/libripple_effect_engine.a` or `ripple_effect_engine.lib` | The static library. |
| `lib/native-static-libs.txt` | The system libraries a static link needs, for this target. One empty line for Emscripten, whose compiler links them itself. |
| `NOTICE` | The Runtime Licence notice and the third-party notices, naming the variant. |

**The web component**, `ripple-engine-<version>[-no-python]-wasm32-component.tar.gz`:

| Path | What it is |
| --- | --- |
| `lib/ripple_engine.wasm` | The component. |
| `wit/` | The interface it exports, `ripple:engine@1.6.0`. |
| `NOTICE` | As above. |

**The desktop archive**, `ripple-engine-<version>[-no-python]-<target>.tar.gz`, also carries two command-line tools: `bin/ripple`, the terminal player, which plays a bundle (`ripple <bundle> --auto --seed N` for an unattended run), and `bin/compile`, which compiles a project into a bundle.

## Beside the archives

| File | What it is |
| --- | --- |
| `engine-manifest.json` | Every archive with its size and SHA-256, the engine's version, its contract and the contracts it reads, and the bundle and save formats. |
| `engine-manifest.json.sig` | An Ed25519 signature over the manifest's exact bytes. |
| `ripple-conformance-<version>.tar.gz` | The conformance fixtures, each a bundle with the inputs to replay and what a correct host sees, and a `FORMAT.md` saying how to drive one. |
| `SHA256SUMS` | The digest of every file above. |

## Versions

| Contract | Codename | Reads campaigns of | Engine releases |
| --- | --- | --- | --- |
| 1.5 | Multiclassing | 1.3, 1.4 and 1.5 | 1.5.0 to 1.5.4 |
| 1.6 | Grammar Lich | 1.3, 1.4, 1.5 and 1.6 | 1.6.0 |

A binding's version is the contract's `MAJOR.MINOR` and its own patch. The engine release each binding pins is in its repository's `engine.json`.

## Related

- [How the engine ships](/explanation/how-the-engine-ships/): releases, pinning, the variants and the licence.
- [Embedding the engine](/explanation/embedding-the-engine/): the API every binding shares.
- [How to play a campaign in your own program](/how-to/play-a-campaign-in-your-program/): installing a binding for your platform.
- [How to export for a player without Python](/how-to/export-for-a-player-without-python/): a campaign the `no-python` variant opens.
