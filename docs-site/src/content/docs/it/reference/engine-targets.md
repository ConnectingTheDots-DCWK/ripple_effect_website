---
title: Piattaforme e varianti del motore
description: Ogni piattaforma per cui è costruito il motore, il suo requisito minimo, che cosa contiene ogni archivio di release, le due varianti e quale binding distribuisce quale target.
---

Il motore viene rilasciato come `engine-v<version>` in [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases). Ogni target è costruito in entrambe le varianti, e ogni archivio è nominato nel manifest firmato della release insieme al suo digest SHA-256. Perché sia fatto così lo spiega [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/).

## Target

| Target | Piattaforma | Minimo | C e C++ | C# | Dart | JavaScript |
| --- | --- | --- | --- | --- | --- | --- |
| `x86_64-unknown-linux-gnu` | Linux, x64 | glibc 2.35 | sì | `linux-x64` | sì | |
| `aarch64-unknown-linux-gnu` | Linux, arm64 | glibc 2.35 | sì | `linux-arm64` | sì | |
| `x86_64-apple-darwin` | macOS, Intel | macOS 12.0 | sì | `osx-x64` | sì | |
| `aarch64-apple-darwin` | macOS, Apple silicon | macOS 12.0 | sì | `osx-arm64` | sì | |
| `x86_64-pc-windows-msvc` | Windows, x64 | | sì | `win-x64` | sì | |
| `aarch64-pc-windows-msvc` | Windows, arm64 | | sì | `win-arm64` | sì | |
| `aarch64-linux-android` | Android, arm64 | API 24 | sì | `android-arm64` | sì | |
| `x86_64-linux-android` | Android, x86_64 (l'emulatore) | API 24 | sì | `android-x64` | sì | |
| `aarch64-apple-ios` | iOS, dispositivo | iOS 13.0 | solo statica | `ios-arm64`, solo statica | sì | |
| `aarch64-apple-ios-sim` | iOS, simulatore arm64 | iOS 13.0 | solo statica | `iossimulator-arm64`, solo statica | sì | |
| `wasm32-unknown-emscripten` | un programma compilato con Emscripten | Emscripten 4.0 | sì | | | |
| `wasm32-component` | browser e Node | | | | web | sì |

- **Gli archivi C** sono presenti in ogni release dal motore 1.5.1; la 1.5.0 conteneva solo il componente web e le librerie dell'editor.
- **Niente di più vecchio né a 32 bit** viene costruito: niente Android a 32 bit, niente simulatore iOS Intel, niente Linux musl.
- **Android** è collegato con segmenti allineati per pagine da 16 KB.
- **iOS** ha distribuito solo una libreria statica fino al motore 1.5.4, che ne ha aggiunta una condivisa. I binding C, C++ e C# collegano la libreria statica.
- **La libreria condivisa macOS del motore 1.5.1** riporta il percorso della sua macchina di build invece di `@rpath`, e non si può caricare. È corretta dalla 1.5.2. La libreria statica non è interessata.
- **`wasm32-unknown-emscripten`** è disponibile dal motore 1.5.3. È a thread singolo, e un panic termina il modulo invece di avvelenare un solo handle. Emscripten 3.1.38, incluso in Unity da 6000.0 a 6000.4, collega il motore ma non riesce ad aprire una campagna da una cartella; Unity 6000.5 e successivi includono Emscripten 4.0.19. La build per browser di .NET include un Emscripten più vecchio, quindi non è un target.
- **`wasm32-component`** non è un triple di rustc: il componente `python` è costruito per `wasm32-wasip2` e importa l'orologio e i numeri casuali di WASI, mentre quello `no-python` è costruito per `wasm32-unknown-unknown` e non importa nulla.

## Varianti

| Variante | Che cos'è | Nome dell'archivio |
| --- | --- | --- |
| `python` | Il motore con il suo interprete Python in sandbox. | `ripple-engine-c-<version>-<target>.tar.gz`, `ripple-engine-<version>-wasm32-component.tar.gz` |
| `no-python` | Lo stesso motore e la stessa API senza di esso. Circa la metà delle dimensioni in nativo. Rifiuta all'apertura una campagna il cui manifest dice che richiede Python. | gli stessi nomi con `-no-python` dopo la versione |

| Binding | Come si sceglie la variante |
| --- | --- |
| C e C++ | `RIPPLE_ENGINE_PYTHON`, un'opzione di CMake, `ON` per impostazione predefinita. |
| C# | Il pacchetto referenziato: `RippleFx.Engine.Native` oppure `RippleFx.Engine.Native.NoPython`. |
| Dart | Nativo: la user-define `python` nel pubspec, `true` per impostazione predefinita. Web: `--dart-define=RIPPLEFX_PYTHON=false`. |
| JavaScript e TypeScript | L'opzione `python` di `Campaign.load`: `'auto'` per impostazione predefinita, che legge il `needs` della campagna, oppure `true` o `false`. |

## Che cosa contiene un archivio

**L'archivio C**, `ripple-engine-c-<version>[-no-python]-<target>.tar.gz`, per ogni target nativo e per Emscripten:

| Percorso | Che cos'è |
| --- | --- |
| `include/ripple/ripple.h` | L'header C, C99. |
| `lib/libripple_effect_engine.so`, `.dylib` o `ripple_effect_engine.dll` | La libreria condivisa, con `ripple_effect_engine.dll.lib`, la sua libreria di importazione, su Windows. Linux e Android portano il soname `libripple_effect_engine.so`; macOS e iOS l'install name `@rpath/libripple_effect_engine.dylib`. Assente dall'archivio Emscripten. |
| `lib/libripple_effect_engine.a` o `ripple_effect_engine.lib` | La libreria statica. |
| `lib/native-static-libs.txt` | Le librerie di sistema che servono a un collegamento statico, per questo target. Una riga vuota per Emscripten, il cui compilatore le collega da sé. |
| `NOTICE` | L'avviso della Runtime Licence e gli avvisi di terze parti, con il nome della variante. |

**Il componente web**, `ripple-engine-<version>[-no-python]-wasm32-component.tar.gz`:

| Percorso | Che cos'è |
| --- | --- |
| `lib/ripple_engine.wasm` | Il componente. |
| `wit/` | L'interfaccia che esporta, `ripple:engine@1.5.0`. |
| `NOTICE` | Come sopra. |

**L'archivio desktop**, `ripple-engine-<version>[-no-python]-<target>.tar.gz`, contiene anche due strumenti a riga di comando: `bin/ripple`, il player da terminale, che esegue un bundle (`ripple <bundle> --auto --seed N` per un'esecuzione senza intervento), e `bin/compile`, che compila un progetto in un bundle.

## Accanto agli archivi

| File | Che cos'è |
| --- | --- |
| `engine-manifest.json` | Ogni archivio con dimensione e SHA-256, la versione del motore, il suo contratto e i contratti che legge, e i formati di bundle e di salvataggio. |
| `engine-manifest.json.sig` | Una firma Ed25519 sui byte esatti del manifest. |
| `ripple-conformance-<version>.tar.gz` | Le fixture di conformità, ciascuna un bundle con gli input da riprodurre e ciò che vede un host corretto, e un `FORMAT.md` che spiega come pilotarne una. |
| `SHA256SUMS` | Il digest di ogni file qui sopra. |

## Versioni

| Contratto | Nome in codice | Legge campagne di | Release del motore |
| --- | --- | --- | --- |
| 1.5 | Multiclassing | 1.3, 1.4 e 1.5 | da 1.5.0 a 1.5.4 |

La versione di un binding è il `MAJOR.MINOR` del contratto più la sua patch. La release del motore che ogni binding fissa si trova nel file `engine.json` del suo repository.

## Vedi anche

- [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/): release, pinning, varianti e licenza.
- [Incorporare il motore](/it/explanation/embedding-the-engine/): l'API che ogni binding condivide.
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): installare un binding per la tua piattaforma.
- [Come esportare per un player senza Python](/it/how-to/export-for-a-player-without-python/): una campagna che la variante `no-python` apre.
