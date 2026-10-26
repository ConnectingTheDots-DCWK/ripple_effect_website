---
title: Binding C e C++
description: "Il binding C e C++ del motore di Ripple Effect: il progetto CMake, le sue opzioni e i suoi target, ogni tipo e ogni membro del livello C++17, e le convenzioni e le funzioni della ABI C."
---

Il binding C e C++ è un progetto CMake che scarica la release del motore fissata per il target che stai compilando, la rifiuta se il suo SHA-256 non è quello fissato, e aggiunge `ripple/ripple.hpp`, un livello C++17 header-only sopra la ABI C del motore. Un host C usa direttamente l'header C, `include/ripple/ripple.h` dentro l'archivio del motore. La versione 1.6.x collega il contratto 1.6 di Ripple Effect; la `PATCH` è del binding. Il sorgente è pubblico su [ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration). Il binding è MIT. La libreria del motore e `ripple.h` sono sotto la [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/), la cui unica condizione è che il `NOTICE` dell'archivio del motore sia riprodotto ovunque il tuo prodotto elenchi il software di terze parti che contiene.

| Release | Motore fissato | Aggiunto |
| --- | --- | --- |
| 1.5.0 | 1.5.2 | La ABI C, il livello C++17, `Player`, `SoundscapeDriver`, CMake che scarica il motore. |
| 1.5.1 | 1.5.3 | Il web, tramite Emscripten. |
| 1.5.2 | 1.5.3 | iOS, dispositivo e simulatore. |
| 1.6.0 | 1.6.0 | Il contratto 1.6, *Grammar Lich*: una storia che chiede prima di leggere l'orologio o la posizione, il conto alla rovescia di un passaggio, e un modulo nella lingua del lettore con campi facoltativi e risposte fisse. |

## Pacchetti e installazione

Nessun gestore di pacchetti distribuisce il binding. Prendilo in uno di tre modi.

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

Oppure il tarball dei sorgenti della release, fissato dal digest nel `SHA256SUMS` di quella release:

```cmake
FetchContent_Declare(
    ripple_effect
    URL https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration/releases/download/v1.6.0/ripple_effect_c_cpp_integration-1.6.0.tar.gz
    URL_HASH SHA256=<from SHA256SUMS>)
```

### Un submodule

```sh
git submodule add https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration third_party/ripple_effect
git -C third_party/ripple_effect checkout v1.6.0
```

```cmake
add_subdirectory(third_party/ripple_effect)
target_link_libraries(my_game PRIVATE Ripple::cpp)
ripple_effect_copy_runtime(my_game)   # the DLL beside the .exe, on Windows
```

Come sottoprogetto non compila né test né esempi e non scarica altro che il motore.

### find_package, dopo un'installazione

```sh
cmake --preset linux-clang && cmake --build --preset linux-clang
cmake --install out/build/linux-clang --prefix /opt/ripple_effect
```

```cmake
find_package(RippleEffect 1.6 REQUIRED)   # CMAKE_PREFIX_PATH=/opt/ripple_effect
target_link_libraries(my_game PRIVATE Ripple::cpp)
```

La versione del pacchetto è **SameMinorVersion**: una richiesta di 1.6 accetta qualsiasi 1.6.x e nient'altro. L'albero installato:

| Percorso | Contiene |
| --- | --- |
| `include/ripple/ripple.h`, `include/ripple/ripple.hpp` | L'header C e il livello C++. |
| `lib/` | La libreria; su Windows la libreria di importazione di quella condivisa. |
| `bin/` | La DLL di Windows. |
| `lib/cmake/RippleEffect/` | La configurazione del pacchetto, e `native-static-libs.txt` per un'installazione statica. |
| `share/ripple_effect/ENGINE-NOTICE` | Il `NOTICE` del motore. |

La configurazione del pacchetto imposta anche `RippleEffect_ENGINE_VERSION` e `RippleEffect_ENGINE_TRIPLE`.

### Target

| Target | Che cos'è |
| --- | --- |
| `Ripple::engine` | La libreria C, condivisa o statica, con `ripple/ripple.h` nel suo percorso di include. Un link statico porta con sé le librerie di sistema elencate dall'archivio. |
| `Ripple::cpp` | `Ripple::engine`, e `ripple/ripple.hpp` sopra di esso. Richiede C++17. |

### Opzioni e variabili di cache

| Nome | Predefinito | Che cosa fa |
| --- | --- | --- |
| `RIPPLE_ENGINE_PYTHON` | `ON` | Il motore con l'interprete Python. `OFF` collega il motore `no-python`. |
| `RIPPLE_ENGINE_SHARED` | `ON` | La libreria condivisa. `OFF` collega quella statica e le librerie di sistema che il suo archivio elenca in `lib/native-static-libs.txt`. Forzato a `OFF` su iOS e con Emscripten. |
| `RIPPLE_ENGINE_TARGET` | vuoto: ricavato dalla toolchain | Il triple del motore, per una toolchain che la configurazione non sa nominare. |
| `RIPPLE_ENGINE_DIR` | vuoto | Un archivio `ripple-engine-c` decompresso, per una build offline, vendorizzata o verificata a parte. Non scarica nulla. |
| `RIPPLE_ENGINE_CACHE` | `<build tree>/_ripple_engine` | Dove si conservano gli archivi scaricati, per condividerli tra alberi di build. |
| `RIPPLE_ENGINE_TREE` | vuoto | Un checkout dei sorgenti del motore, compilato con cargo. Per chi sviluppa il motore: il risultato è marcato UNVERIFIED e una release del binding lo rifiuta. |
| `RIPPLE_BUILD_TESTS` | `ON` se top-level | I test di questo repository. |
| `RIPPLE_BUILD_EXAMPLES` | `ON` se top-level | I due player di esempio. |
| `RIPPLE_INSTALL` | `ON` se top-level | Le regole di installazione e la configurazione del pacchetto. |
| `RIPPLE_WARNINGS_AS_ERRORS` | `OFF` | Avvisi come errori, per i target di questo repository. |
| `RIPPLE_SANITIZE` | vuoto | `address` o `thread`, per i target di questo repository. |

Dopo la configurazione sono impostati `RIPPLE_ENGINE_VERSION`, `RIPPLE_ENGINE_TRIPLE`, `RIPPLE_ENGINE_ROOT` (dove è stato decompresso l'archivio) e `RIPPLE_ENGINE_UNVERIFIED`, e la configurazione stampa la versione del binding, quella del motore, il triple, la variante e il tipo di linking.

| Funzione CMake | Che cosa fa |
| --- | --- |
| `ripple_effect_copy_runtime(<target>)` | Copia la DLL del motore accanto a `<target>` dopo il link. Non fa nulla fuori da Windows e nulla per un link statico. |

### Da dove viene il motore

La release fissata è `engine-v<version>` del repository pubblico [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases), il cui manifest firmato nomina ogni archivio. Il file `engine.json` del binding contiene la versione, l'id della chiave di firma e il digest di ogni archivio. Il download si tenta prima da `https://ripplefx.app/go/engine/<tag>/<file>` e poi dalla release di GitHub; un archivio il cui digest non è quello fissato viene rifiutato. Un archivio è `ripple-engine-c-<version>[-no-python]-<triple>.tar.gz` e contiene:

| Percorso | Contiene |
| --- | --- |
| `include/ripple/ripple.h` | L'header C. Il binding non lo copia mai, quindi l'header con cui compili è sempre quello della libreria. |
| `lib/` | `libripple_effect_engine.so`, `.dylib` o `.a`; su Windows `ripple_effect_engine.dll`, la sua libreria di importazione `ripple_effect_engine.dll.lib` e quella statica `ripple_effect_engine.lib`. |
| `lib/native-static-libs.txt` | Le librerie di sistema necessarie a un link statico. |
| `NOTICE` | L'avviso che la Runtime Licence ti chiede di riprodurre. |

### Requisiti

| | |
| --- | --- |
| CMake | 3.24 o successivo. Il file dei preset è alla versione 5. |
| C | `ripple.h` è C99. |
| C++ | `ripple.hpp` è C++17. |
| Preset | `linux-gcc`, `linux-clang`, `linux-asan`, `linux-static`, `linux-no-python`, `macos-clang`, `windows-msvc` (da un prompt per sviluppatori), `android-arm64`, `ios-arm64`, `ios-simulator`, `emscripten`, `emscripten-no-python`. Ciascuno compila in `out/build/<preset>`. |

### Con Emscripten

Configura con il file di toolchain di Emscripten, tramite `emcmake cmake` o il preset `emscripten`; l'archivio `wasm32-unknown-emscripten` viene scaricato e collegato staticamente. Il motore non richiede nessun flag per le eccezioni. `ripple.hpp` segnala un rifiuto lanciando un'eccezione, quindi un host C++ che cattura `ripple::Error` compila e collega con `-fwasm-exceptions`, aggiungendo `-sSUPPORT_LONGJMP=wasm` per Emscripten 4.0.10, come fa `examples/cpp_player`; un link Emscripten ammette un solo modello di eccezioni. Senza eccezioni, definisci `RIPPLE_HPP_NO_EXCEPTIONS`.

## Scegliere la variante

La variante è una scelta fatta alla configurazione: `RIPPLE_ENGINE_PYTHON=ON` collega il motore con l'interprete Python e `OFF` collega il motore `no-python`, grande circa la metà.

- **All'apertura.** Il motore `no-python` rifiuta all'apertura una campagna che ha bisogno di Python, con `RIPPLE_ERROR_NEEDS_PYTHON` (`ripple::NeedsPython`). Una campagna esportata con **Non richiede Python** viene controllata proprio per quell'host.
- **Chiedere.** `ripple::engine_has_python()` (`ripple_engine_has_python()`) risponde quale libreria è caricata; `Session::python_available()` risponde per una sessione. Il campo `needs` di un manifest elenca `python` quando la campagna esegue script.
- **La console.** `Session::console_feed` sul motore `no-python` risponde con un errore di tipo `RIPPLE_PYTHON_FAILURE_KIND_UNAVAILABLE`.

## Piattaforme

| Piattaforma | Architetture | Soglia minima | Note |
| --- | --- | --- | --- |
| Linux | x86_64, aarch64 | glibc 2.35 | Il soname è `libripple_effect_engine.so`. Distribuiscila accanto al tuo binario con un RPATH `$ORIGIN`, oppure collega staticamente. |
| macOS | x86_64, arm64 | 12.0 | Un'architettura per configurazione; la release non ha una libreria universale, quindi compila due volte e usa `lipo`. L'install name è `@rpath/libripple_effect_engine.dylib`. |
| Windows | x64, arm64 | | Solo la ABI di MSVC; MinGW è rifiutato. Il motore condiviso è una DLL con una libreria di importazione. La libreria statica è compilata contro la CRT dinamica (`/MD`). |
| Android | arm64-v8a, x86_64 | API 24 | Con il file di toolchain dell'NDK. Il `.so` va in `jniLibs` del tuo APK; la libreria statica si collega nella tua libreria nativa. |
| iOS | arm64 dispositivo, arm64 simulatore | 13.0 | Solo statica. `CMAKE_SYSTEM_NAME=iOS` scarica `aarch64-apple-ios`; aggiungere `CMAKE_OSX_SYSROOT=iphonesimulator` scarica `aarch64-apple-ios-sim`. Il minimo proprio di un runtime del simulatore può alzare il deployment target. |
| Il web, tramite Emscripten | wasm32 | Emscripten 4.0 | Solo statica. Dal motore 1.5.3. |

Con Emscripten:

- **Emscripten 4.0 o successivo.** Ogni release viene collegata ed eseguita con 4.0.10, 4.0.19 e la più recente con cui è stata compilata. Prima della 4.0 l'ottimizzatore rifiuta una funzionalità che gli oggetti del motore portano con sé, e la 3.1.38 collega e poi non riesce ad aprire la cartella di un bundle, senza che nulla lo segnali.
- **Unity** 6000.5 e successive includono Emscripten 4.0.19 e sono supportate; da 6000.0 a 6000.4 includono la 3.1.38 e non lo sono. Il `.a` dell'archivio è il plugin.
- **.NET nel browser non è supportato**: il suo workload `wasm-tools` collega con un Emscripten sotto la soglia minima.
- **Single-thread.** Un programma collegato con `-pthread` rifiuta la libreria.
- **Un panic interrompe il modulo** invece di srotolare lo stack. Un trap non è recuperabile sul posto: la pagina si riapre e riprende dall'ultimo checkpoint.
- **Apri una campagna dalla memoria.** Una pagina non ha una cartella; scarica i file del bundle e passali a `Campaign::open_files` (`ripple_campaign_open_memory`). Una cartella funziona con `-sNODERAWFS` o nel filesystem virtuale di Emscripten.
- **Dimensione.** Un programma collegato con l'interprete pesa circa 5,4 MB di WebAssembly, 2,0 MB compressi con gzip; senza, circa 0,8 MB e 0,3 MB.

La matrice completa di ciò che ogni release del motore distribuisce è in [Piattaforme e varianti del motore](/it/reference/engine-targets/).

## Il motore

| C++ | C | Risponde |
| --- | --- | --- |
| `ripple::engine_version()` | `ripple_engine_version()` | La versione della libreria caricata, non quella con cui hai compilato. |
| `ripple::engine_contract()` | `ripple_engine_contract()` | Il contratto che la libreria caricata collega, `1.6`. |
| `ripple::engine_has_python()` | `ripple_engine_has_python()` | Falso per la libreria `no-python`. |
| | `ripple_bundle_format()` | Il formato di bundle che il motore scrive, e legge fino a quello. |
| | `ripple_save_format()` | Il formato di salvataggio che il motore scrive. |
| `ripple::contract_major`, `ripple::contract_minor` | `RIPPLE_CONTRACT_MAJOR`, `RIPPLE_CONTRACT_MINOR` | Il contratto che l'header collega, `1` e `6`, a tempo di compilazione. |

Le funzioni C++ restituiscono `std::string_view` su stringhe di proprietà della libreria; quelle C restituiscono `const char *` terminati da NUL. Un motore con la stessa `MAJOR.MINOR` mantiene ogni funzione, struct e costante dell'header. `ripple.hpp` non compila, con `#error`, contro un `ripple.h` di un altro contratto.

| Costante | Valore | Significato |
| --- | --- | --- |
| `RIPPLE_CHOICE_NONE` | `4294967295` | L'indice di scelta che significa che il lettore sta lasciando il passaggio; `ripple::leave` in C++. |
| `RIPPLE_MIXER_DEFAULT_MAX_CUES` | `8` | I cue che possono suonare insieme; il più vecchio cede il posto. |
| `RIPPLE_MIXER_DEFAULT_GAIN_STEP` | `0.004` | La più piccola variazione di guadagno che vale un comando `gain`. |

## Campaign

`ripple::Campaign` è un bundle, aperto: un handle move-only condiviso da ogni sessione creata a partire da esso. Può essere distrutto prima delle sue sessioni, che continuano a funzionare.

| Membro | Risponde | Note |
| --- | --- | --- |
| `static open_dir(folder)` | `Campaign` | La cartella che contiene `campaign.json`. I file vengono letti quando la storia li richiede, mai da fuori della cartella. |
| `static open_files(files)` | `Campaign` | Un bundle in memoria: un `std::vector<BundleFile>`, ciascuno con un `path` dentro il bundle e i suoi `bytes`. I byte vengono copiati. |
| `handle()` | `RippleCampaign*` | L'handle C, per una chiamata che il livello non incapsula. |
| `folder()` | `const std::optional<std::string>&` | La cartella da cui è stato aperto; nessuna per un bundle in memoria. |
| `manifest()` | `Manifest` | |
| `board(index)` | `Board` | Per indice nelle lavagne del manifest. |
| `soundscape(index)` | `Soundscape` | Per indice nei soundscape del manifest. |
| `board_with_id(id)` | `std::optional<std::uint32_t>` | L'indice della lavagna con quell'id di catalogo. |
| `node(board, id)` | `std::optional<Node>` | Un nodo di una lavagna, per id. |
| `validate()` | `std::vector<BundleProblem>` | Tutto ciò che non va nel bundle nel suo insieme; vuoto quando è sano. Ognuno ha un `message` e una `location`. |
| `media_path(index)` | `std::optional<std::string>` | Il percorso di un medium dentro il bundle; mai assoluto e mai fuori da esso. |
| `media_file(index)` | `std::optional<std::string>` | La cartella unita al percorso, per una campagna aperta da una cartella; nessuno altrimenti. Non fallisce mai. |
| `media_bytes(index)` | `std::optional<std::vector<std::uint8_t>>` | I byte di un medium, letti per intero; nessuno quando il bundle non lo contiene. Un brano lungo è meglio farlo scorrere in streaming dal suo percorso. |

### Manifest

`campaign.json`, tabella per tabella.

| Campo | Tipo | Significato |
| --- | --- | --- |
| `format` | `std::int64_t` | Il formato del bundle. |
| `generator` | `std::optional<std::string>` | Chi l'ha compilato. |
| `text_format` | `std::string` | `markdown` o `html`: che cos'è il testo di un passaggio. |
| `project` | `Project` | `title`, `description`, `default_locale`, `locales`, e `cover`, il percorso dell'immagine di copertina dentro il bundle quando ce n'è una. |
| `entries` | `std::vector<std::uint32_t>` | Le lavagne d'ingresso, per indice in `boards`. |
| `boards`, `passages`, `components`, `scripts`, `media`, `machines`, `soundscapes` | `std::vector<Entry>` | Una riga ciascuno: `id`, `name` e `path`, il percorso del documento dentro il bundle (per un medium, quello del file). |
| `cvars` | `std::vector<Cvar>` | Le variabili di console dichiarate: `name`, `type`, `default_value`. |
| `needs` | `std::vector<std::string>` | Ciò che un host deve avere per riprodurla: `python`, quando esegue script. |
| `permissions` | `std::vector<std::string>` | Ciò che la storia legge del mondo fuori da lei, per nome di wire: `dateTime`, `location`. Una sessione chiede di ciascuno prima di cominciare. |

### Board, Node, Port

| Tipo | Campi |
| --- | --- |
| `Board` | `id`, `name`, `start` (`std::int64_t`), `prime` (`std::vector<std::uint32_t>`), `nodes`. |
| `Node` | `id`, `type`, `title`, `inputs`, `outputs` (`std::vector<Port>`), `data`, `metadata` (`Value`). |
| `Port` | `id`, `kind` (`PortKind::control` o `PortKind::data`), `edges`. |
| `Edge` | `node`, `port`: un'estremità di un collegamento, per indice nella sua lavagna. |

### Soundscape e Track

Un soundscape è una timeline di clip che un passaggio riproduce. I tempi sono in millisecondi.

| Campo di `Soundscape` | Tipo |
| --- | --- |
| `id`, `name` | `std::string` |
| `length`, `fade_in`, `fade_out` | `std::int64_t` |
| `looping`, `tied` | `bool` |
| `volume` | `double`, predefinito `1.0` |
| `tracks` | `std::vector<Track>` |

| Campo di `Track` | Tipo | Significato |
| --- | --- | --- |
| `media` | `std::int64_t` | Il medium, per indice nei media del manifest. |
| `lane`, `start`, `clip_start` | `std::int64_t` | |
| `clip_end` | `std::optional<std::int64_t>` | |
| `volume`, `speed` | `double`, predefinito `1.0` | |
| `fade_in`, `fade_out`, `interval` | `std::int64_t` | |
| `mode` | `TrackMode` | `once`, `looping` o `automatic` (`RIPPLE_TRACK_MODE_AUTO`). |

## Session

`ripple::Session` è una storia in corso di riproduzione, un handle move-only. Ogni verbo risponde con gli effetti a cui ha portato, nell'ordine in cui vanno applicati, con il turno per ultimo. Viene distrutta insieme al suo oggetto.

### Creare e riprendere

| Membro | Risponde | Note |
| --- | --- | --- |
| `static create(campaign, config)` | `Session` | Prima del suo primo turno: chiama poi `start()`. |
| `static resume(campaign, save, seed, options = SessionOptions())` | `Session` | Un salvataggio, come lo ha restituito `pause()` o `checkpoint()`, sulla stessa campagna. Chiama poi `start()`; risponde con il turno su cui si trovava il salvataggio. Rifiutato con `ResumeError` quando il salvataggio nomina una lavagna o un nodo che la campagna non ha più. |
| `handle()` | `RippleSession*` | L'handle C. |

`SessionConfig`, da dove inizia una nuova sessione:

| Campo | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `board` | `std::uint32_t` | `0` | La lavagna, per indice nelle lavagne del manifest; di solito `manifest.entries[0]`. |
| `entry_node` | `std::optional<std::string>` | nessuno | Un nodo da cui iniziare al posto dell'inizio della lavagna. |
| `locale` | `std::optional<std::string>` | nessuno | La lingua in cui leggere; nessuna per quella predefinita. |
| `seed` | `std::uint64_t` | `0` | I dadi: lo stesso seed tira la stessa storia. |
| `digest` | `std::optional<std::string>` | nessuno | Il digest del bundle con cui è marcato un salvataggio fatto da questa sessione. |
| `options` | `SessionOptions` | quelle del motore | |

`SessionOptions`, i limiti e le politiche del motore. Un `SessionOptions` costruito di default contiene i valori propri del motore, letti da `ripple_session_options_default`.

| Campo | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `step_budget` | `std::uint32_t` | quello del motore | I passi che un'esecuzione può compiere prima di essere fermata; `0` ferma al primo. |
| `silent_jump_limit` | `std::uint32_t` | quello del motore | I salti silenziosi tra lavagne prima che la storia venga fermata. |
| `loop_limit` | `std::uint32_t` | quello del motore | Quante volte un ciclo può girare; `0` significa nessun tetto. |
| `script_deadline_ms` | `std::uint64_t` | quello del motore | Per quanto tempo uno script può girare. |
| `script_memory_bytes` | `std::uint64_t` | quello del motore | Quanta memoria può occupare uno script. |
| `script_recursion_depth` | `std::uint32_t` | quello del motore | Quanto in profondità può ricorrere uno script. |
| `untranslated` | `Untranslated` | `report` | Un passaggio mancante nella lingua del lettore: `report` dà testo vuoto e nomina la lingua; `fall_back` dà il testo della lingua predefinita e la nomina comunque. |
| `trace` | `bool` | `false` | Se i verbi rispondono con effetti `Trace`. |
| `trace_payloads` | `bool` | `false` | Se un valore tracciato porta con sé il suo payload. |

`raw()` risponde con le opzioni come `RippleSessionOptions`.

### Verbi

| Verbo | Risponde | Note |
| --- | --- | --- |
| `start()` | `Effects` | Il primo turno della storia; su una sessione ripresa, il turno su cui era stata salvata. Un verbo prima di esso viene rifiutato con `nothing_asked`. |
| `choose(index)` | `Effects` | Risponde a uno `Show`: la scelta per indice nelle sue `choices`, o `ripple::leave` se il lettore lascia il passaggio. Un indice oltre quelli offerti è `no_such_choice`; una scelta con `available` falso è `choice_spent`. |
| `answer(values)` | `Effects` | Risponde a un `Ask`: una `Value::Map` dei campi del modulo per nome, o `std::nullopt` se il lettore lo lascia. |
| `elapsed()` | `Effects` | Risponde a un `Hold`, quando l'orologio dell'host dice che è finito. |
| `begin_countdown()` | `Effects` | L'orologio dell'host dice che il conto alla rovescia del passaggio mostrato comincia, dopo l'`after_ms` del suo timer. Non muove nulla: gli effetti sono solo le callback che un autore vi ha puntato, e vuoti quando non ce ne sono o era già cominciato. Su un passaggio senza timer è `no_countdown`. |
| `expire()` | `Effects` | L'orologio dell'host dice che il conto alla rovescia è scaduto: viene presa la scelta predefinita del passaggio come la prenderebbe `choose`. Prima di `begin_countdown` è `countdown_not_begun`; su un passaggio senza, `no_countdown`. |
| `permit(kind, granted)` | `Effects` | La risposta dell'host per un `PermissionKind`, in qualsiasi momento, anche prima di `start`, ed è così che un host che conosce già le risposte del suo lettore non gliele fa mai chiedere. Su un turno `Permit`, l'ultimo tipo a cui si risponde fa cominciare la storia. |
| `set_locale(locale)` | `Effects` | Il turno su cui è la storia, risposto di nuovo nella nuova lingua: un passaggio ridisegnato con il suo conto alla rovescia mantenuto, un modulo riformulato con i nomi dei campi invariati. Una lingua in cui la campagna non è leggibile è `unknown_locale`. |
| `restart()` | `Effects` | La storia da capo dal primo turno, con lo stesso seed che tira di nuovo. |
| `stop()` | `Effects` | Ferma la storia definitivamente; un verbo dopo di esso è `stopped`. |
| `pause()` | `Paused` | `save`, il salvataggio come testo JSON (nessuno quando non c'era nulla da salvare), ed `effects`, ciò che la pausa ha fatto. La pausa ferma la storia; riprendere è una nuova sessione dal salvataggio. |
| `checkpoint()` | `std::optional<std::string>` | Un salvataggio del turno su cui è la storia, senza fermarla; nessuno a meno che la storia non sia su un passaggio o su un modulo. |
| `console_feed(code)` | `ConsoleResult` | Una riga di Python eseguita sulla storia, come la esegue la console dell'editor: `result` ed `effects`. |
| `write_cvar(name, value)` | `CvarChange` | Scrive una variabile di console, convertita al suo tipo. |
| `reset_cvar(name)` | `CvarChange` | Riporta una variabile di console al valore predefinito. |
| `reset_all_cvars()` | `Effects` | Riporta ogni variabile di console al valore predefinito. |
| `remove_entity(key)` | `EntityRemoval` | `removed`, ed `effects`. |

Le letture che un host consegna. Nessuna muove la storia o risponde con effetti:

| Membro | Risponde | Note |
| --- | --- | --- |
| `set_now(now)` | `void` | Che ora è, uno `std::optional<Moment>`; nessuno per nessun orologio. Prima di ogni verbo che può avanzare, da un host che ha concesso `date_time`; dentro un verbo il tempo non si muove. |
| `set_position(fix)` | `void` | L'ultima rilevazione dell'host, uno `std::optional<Position>`; nessuno per nessuna. Rifiutato con `not_permitted` una volta negato `location`; una rilevazione data prima della risposta viene tenuta, e letta solo se è sì. |
| `set_stand_in(kind, typed, local_offset_minutes = 0)` | `void` | Il sostituto del lettore per un tipo, come l'ha scritto, uno `std::optional<std::string_view>`; nessuno lo toglie. ISO 8601 per l'orologio, letto a `local_offset_minutes` quando non porta uno scostamento; `"lat, lon"` o il nome di un luogo per una posizione. Risponde ogni volta che manca il valore vero. Rifiutato con `stand_in`, dicendo perché, per uno che non si legge. |

Le risposte che portano effetti accanto a un risultato:

| Tipo | Campi |
| --- | --- |
| `CvarChange` | `outcome` (`CvarWrite::done`, `unknown` per una variabile che la campagna non dichiara, `refused` per un valore che il suo tipo non accetta), `refusal` (perché), `effects`. |
| `EntityRemoval` | `removed`, `effects`. |
| `ConsoleResult` | `result` (`PythonResult`), `effects`. |
| `PythonResult` | `value`, `output` (ciò che ha stampato), `error` (`std::optional<PythonFailure>`, nessuno quando è terminato). |
| `PythonFailure` | `kind` (un `RipplePythonFailureKind`: `PYTHON`, `TIMEOUT`, `REFUSED`, `CLOSED`, `HOST_ERROR`, `UNAVAILABLE`), `exception` (il tipo dell'eccezione, per `PYTHON`), `message`, `line`, `traceback`. |

### Lettori

| Membro | Risponde | Note |
| --- | --- | --- |
| `board()` | `std::uint32_t` | La lavagna su cui è la storia, per indice nelle lavagne del manifest. |
| `locale()` | `std::string` | La lingua in cui la storia legge. |
| `default_locale()` | `std::string` | La lingua predefinita della campagna. |
| `ambience()` | `std::optional<Ambience>` | Il soundscape in vigore; nessuno per il silenzio. |
| `entities()` | `std::vector<Entity>` | Ogni entità che la storia contiene. |
| `memory()` | `Memory` | Ciò che la storia ricorda. |
| `cvars()` | `std::vector<CvarSnapshot>` | Ogni variabile di console, con il suo valore. |
| `guard()` | `GuardReport` | Ciò che la guardia degli script ha dovuto fare finora: `abandoned` (i nodi i cui script sono stati abbandonati), `refused`, `exhausted`. |
| `python_available()` | `bool` | Falso sul motore `no-python`. |
| `describe_cvar_write(name, value)` | `std::optional<std::string>` | Perché la scrittura di una variabile di console verrebbe rifiutata; nessuno quando verrebbe accettata. |
| `set_trace(enabled)` | `void` | Attiva o disattiva gli effetti `Trace`. |
| `set_trace_payloads(enabled)` | `void` | Attiva o disattiva il payload di un valore tracciato. |

### Il generatore

Un salvataggio non porta né lo stato del generatore né la posizione del soundscape: lo stesso seed dà gli stessi tiri futuri, e un soundscape riparte dall'inizio. Per portare oltre una ripresa l'esatta continuazione dei dadi, leggi il `generator()` della vecchia sessione e applicalo con `set_generator` alla nuova.

| Membro | Risponde |
| --- | --- |
| `generator()` | `Generator`, due `std::uint32_t`: `lo` e `hi`. |
| `set_generator(state)` | `void` |

### Il mondo fuori dalla storia

| Tipo | Che cos'è |
| --- | --- |
| `PermissionKind` | `enum class` su `std::uint32_t`: `date_time`, `location`, numerati come il `RipplePermissionKind` di `ripple.h` (`RIPPLE_PERMISSION_KIND_DATE_TIME` 0, `_LOCATION` 1). Aperto ad aggiunte; il microfono non è tra questi. |
| `permission_kind_name(kind)` | Il nome di wire di un tipo, `dateTime` o `location`, come lo scrivono il manifest e un avviso; vuoto per un numero che l'header non conosce. |
| `Moment` | Un istante dall'host: `utc_ms` (`std::int64_t`, millisecondi dall'epoch) e `offset_minutes` (`std::int32_t`, lo scostamento a cui sta l'orologio del lettore). |
| `local_moment()` | L'ora di questa macchina al suo scostamento: ciò che un host che ha concesso `date_time` passa a `set_now`, o che un `Player` chiede tramite `PlayerHandlers::moment`. |
| `Position` | Una rilevazione, di cui ogni campo può mancare, modellata sul `GeolocationPosition` del web: `label` (`std::optional<std::string>`), `latitude`, `longitude`, `accuracy` (`std::optional<double>`, gradi e metri), e `when` (`std::optional<Moment>`), quando è stata presa. |

## Effetti

`ripple::Effect` è uno `std::variant` di quattordici alternative, nell'ordine del motore; `ripple::Effects` è uno `std::vector<Effect>`. Applica un batch in ordine. L'ultimo effetto di un batch è il suo turno. Ogni effetto possiede le proprie stringhe: il batch C viene copiato e liberato prima che il verbo ritorni.

| Alternativa | Turno | Campi | Significato |
| --- | --- | --- | --- |
| `Trace` | | `event` (`RunEvent`) | Un evento dell'esecuzione, quando il tracciamento è attivo. |
| `Callback` | | `event` (`CallbackEvent`) | Una callback con nome dichiarata dall'autore. |
| `Jumped` | | `board` (`std::uint32_t`), `node` (`std::optional<std::string>`) | La storia è passata a un'altra lavagna. |
| `AmbienceChanged` | | `ambience` (`std::optional<Ambience>`) | Il soundscape ora in vigore; nessuno per il silenzio. |
| `Audio` | | `command` (`AudioCommand`) | Che cosa dovrebbe fare lo speaker, per il mixer. |
| `Changed` | | `entities`, `memory`, `cvars`, ciascuno opzionale | Quali archivi si sono mossi; un archivio che non si è mosso è assente. |
| `Show` | sì | `passage` (`Passage`) | Un passaggio. Rispondi con `choose`. |
| `Ask` | sì | `prompt` (`Prompt`) | Un modulo. Rispondi con `answer`. |
| `Hold` | sì | `ms` (`std::uint64_t`) | Un'attesa. Chiama `elapsed` quando il tuo orologio dice che è finita. |
| `Ended` | sì | `title` (`std::optional<std::string>`), `ran_out` (`bool`) | La storia è finita. `ran_out` è vero quando la strada è finita invece di arrivare a una scheda End. |
| `Failed` | sì | `message`, `node` (`std::optional<std::string>`) | La storia non ha potuto proseguire. |
| `Stopped` | sì | nessuno | La sessione si è fermata. |
| `Permit` | sì | `kinds` (`std::vector<PermissionKind>`) | La storia non è cominciata, e legge questi tipi a cui nessuno ha risposto. Rispondi a ciascuno con `permit`; l'ultima risposta fa cominciare la storia. |
| `Notice` | | `code`, `kind` (`PermissionKind`), `node` (`std::optional<std::string>`), `message` | Una lettura del mondo fuori dalla storia che non ha avuto il valore vero, una volta per tipo ed esito in una partita, prima del turno per cui è stata letta. `code` è `I.RT.05` un sostituto, `W.RT.06` un rifiuto, `I.RT.07` niente; la lettera è la gravità. `node` è il nodo il cui Python l'ha letta; `message` è la frase inglese del motore. |

`Permit` e `Notice` sono stati aggiunti in coda nella 1.6, quindi uno `std::visit` senza un ramo per loro non compila.

| Funzione | Risponde |
| --- | --- |
| `is_turn(effect)` | Se l'effetto è un turno. |
| `is_over(effect)` | Se un turno è la fine della storia: `Ended`, `Failed` o `Stopped`. |

### Record

**`Passage`**, un passaggio su cui si trova il lettore:

| Campo | Tipo | Significato |
| --- | --- | --- |
| `node`, `title` | `std::string` | |
| `text` | `std::string` | Markdown, o HTML quando lo dice il `text_format` del manifest. |
| `choices` | `std::vector<Choice>` | Ciascuna: `port` (l'uscita di controllo da cui il flusso parte), `text`, e `available`, falso per una scelta che l'autore ha limitato e il lettore ha esaurito. Una scelta esaurita viene comunque offerta, così il lettore può vederla. |
| `sources` | `std::optional<std::vector<LocaleText>>` | Il testo in ogni lingua, ciascuno con un `locale` e un `text`, quando il compilatore li ha conservati. |
| `snippets` | `std::vector<Snippet>` | Python nella prosa: `code`, `is_inline`. |
| `media` | `std::vector<MediaLink>` | Ogni collegamento nel testo che nomina un medium: `link` come l'ha scritto l'autore, e `media`, per indice nei media del manifest. |
| `untranslated` | `std::optional<std::string>` | La lingua in cui manca il testo, quando manca. |
| `soundscape` | `std::optional<Soundscape>` | Il soundscape che il passaggio nomina. |
| `silence` | `bool` | Vero quando il passaggio chiede il silenzio. |
| `timer` | `std::optional<ChoiceTimer>` | Il conto alla rovescia del passaggio; nessuno quando il passaggio aspetta il lettore quanto vuole. |

**`ChoiceTimer`**, il conto alla rovescia di un passaggio. L'orologio dell'host aspetta `after_ms`, chiama `begin_countdown`, aspetta `timeout_ms` e chiama `expire`; il motore non misura nulla di tutto ciò. Un `Player` fa tutte e tre le cose.

| Campo | Tipo | Significato |
| --- | --- | --- |
| `after_ms` | `std::uint64_t` | Quanto prima che il conto alla rovescia cominci; zero è subito. |
| `timeout_ms` | `std::uint64_t` | Quanto scorre una volta cominciato; mai zero. |
| `visible` | `bool` | Se l'autore voleva che il lettore lo vedesse scorrere. |
| `default_choice` | `std::uint32_t` | L'indice nelle scelte del passaggio preso quando scade. |

**`Prompt`**, un modulo che la storia chiede al lettore di compilare: `node`, `title`, e `fields`, ciascuno un `PromptField`:

| Campo | Tipo | Significato |
| --- | --- | --- |
| `name` | `std::string` | La chiave di una risposta: l'ID del campo, mai mostrato. |
| `type` | `std::string` | Il tipo del campo. |
| `default_value` | `Value` | Ciò con cui il controllo è riempito; un valore predefinito che nessuno modifica è la risposta. |
| `label` | `std::string` | Ciò che viene mostrato al lettore, nella sua lingua: `name` dove l'autore non ha scritto nulla. |
| `placeholder` | `std::string` | Il suggerimento disegnato mentre il campo è vuoto; vuoto se non c'è. |
| `optional` | `bool` | Se il lettore può lasciarlo vuoto, che risponde null. Un campo obbligatorio non si invia vuoto. |
| `options` | `std::vector<PromptOption>` | Le risposte fisse tra cui scegliere, in ordine: una per un tipo scalare, un numero qualsiasi per un `…List`. Vuoto per un campo in cui il lettore scrive. Si risponde con gli id delle opzioni scelte. |

Un **`PromptOption`** è `id`, ciò con cui risponde un host, uguale in ogni lingua; `label`, ciò che viene mostrato al lettore, nella sua lingua; e `value` (`Value`), ciò che viene consegnato alla storia quando è scelto, del tipo del campo.

**`Ambience`**, il soundscape in vigore: `soundscape`, `board` (`std::uint32_t`), e `node`, il nodo che l'ha impostato.

**`AudioCommand`**, ciò che la sessione chiede allo speaker:

| Campo | Tipo | Significato |
| --- | --- | --- |
| `kind` | `AudioKind` | `play` un soundscape, con dissolvenza in entrata di `fade_ms`; `stop` ciò che sta suonando, con dissolvenza in uscita di `fade_ms`; `cut` tutto subito, cue compresi; `cue` un suono. |
| `soundscape` | `std::optional<Soundscape>` | `play`: che cosa riprodurre. |
| `fade_ms` | `std::uint64_t` | `play`: la dissolvenza in entrata. `stop`: la dissolvenza in uscita. |
| `media` | `std::uint32_t` | `cue`: il medium, per indice nei media del manifest. |
| `volume`, `speed` | `double`, predefinito `1.0` | `cue`. |
| `node` | `std::optional<std::string>` | `cue`: il nodo che l'ha richiesto, quando c'è stato. |

**`CallbackEvent`**, una callback con nome scattata. Quali campi sono impostati dipende da `event`.

| Campo | Tipo | Significato |
| --- | --- | --- |
| `callback` | `std::string` | Il nome che le ha dato l'autore, con cui si registra un gestore. |
| `event` | `std::uint32_t` | Un `RippleCallbackKind`. |
| `board` | `std::optional<std::uint32_t>` | |
| `node`, `name` | `std::optional<std::string>` | |
| `from`, `to` | `std::optional<Value>` | |
| `index` | `std::optional<std::uint32_t>` | |
| `event_name()` | `std::string_view` | L'evento nel vocabolario dell'autore, come `cvar.changed`. |

**`Entity`**: `key`, `component` (`std::optional<std::string>`), `label`, e `values`, una mappa dei suoi campi.

**`Memory`**: `nodes`, una mappa nodo per nodo, e `machines`, uno `std::vector` di coppie (macchina, stato).

**`CvarSnapshot`**: `name`, `type`, `default_value`, `value`.

**`RunEvent`**, un evento della traccia dell'esecuzione, letto per `kind`; un campo che un altro tipo non usa è vuoto.

| Campo | Impostato da | Significato |
| --- | --- | --- |
| `kind` | tutti | `RunEventKind`: `run_started`, `node_started`, `node_finished`, `memo_hit`, `diagnostic`, `log`, `run_finished`. |
| `run`, `board`, `sequence` | tutti | Dove in un'esecuzione è avvenuto l'evento. |
| `node` | node started, node finished, memo hit, log | |
| `step` | node started, node finished, log | |
| `entry` | run started | Il nodo da cui è entrata l'esecuzione. |
| `primed` | run started | I nodi preparati prima di essa. |
| `entered_via` | node started | |
| `pulled` | node started | Se è stato eseguito perché un collegamento dati lo ha richiamato. |
| `inputs` | node started | `std::vector<TraceValue>`. |
| `outcome` | node finished | Un `RippleTurnOutcome`: `DONE` o `FAILED`. |
| `outputs` | node finished | `std::vector<TraceValue>`. |
| `flowed` | node finished | Le porte di controllo da cui è uscito il flusso. |
| `error` | node finished, run finished | |
| `diagnostic` | diagnostic | `RunDiagnostic`: `issue` (un `RippleRunIssue`: `AMBIGUOUS_FLOW`, `MULTIPLE_INPUTS`, `PRODUCER_NOT_RUN`, `REENTERED`, `NOTHING_ON_WIRE`, l'osservazione di partita `W.RT.08`), `message`, `node`, `port`, `wires`. |
| `level` | log | Un `RippleLogLevel`: `DEBUG`, `INFO`, `WARNING`, `ERROR`. |
| `message` | log | |
| `data` | log | `std::optional<Value>`; nessuno quando il nodo non ha registrato dati. |
| `steps`, `cancelled`, `failed_node` | run finished | |

**`TraceValue`**, un valore su un collegamento come l'ha visto la traccia: `from_node`, `from_port`, `to_node`, `to_port`, `payload` (`PayloadKind::present` quando `value` è ciò che è passato, `withheld` quando un valore è passato e i payload non sono tracciati, `absent` quando non è passato nulla), e `value`, impostato quando `payload` è `present`.

## Valori

`ripple::Value` è un valore di una storia. Un Int e un Float non diventano mai l'uno l'altro, e una mappa conserva l'ordine in cui è stata scritta.

| Tipo della storia | `Value` contiene | `RippleValueKind` in C | Campo C |
| --- | --- | --- | --- |
| null | `std::nullptr_t` | `RIPPLE_VALUE_KIND_NULL` | |
| Bool | `bool` | `RIPPLE_VALUE_KIND_BOOLEAN` | `data.boolean` |
| Int | `std::int64_t` | `RIPPLE_VALUE_KIND_INTEGER` | `data.integer` |
| Float | `double` | `RIPPLE_VALUE_KIND_REAL` | `data.real` |
| testo | `std::string` | `RIPPLE_VALUE_KIND_TEXT` | `data.text` |
| lista | `Value::List`, uno `std::vector<Value>` | `RIPPLE_VALUE_KIND_ITEMS` | `data.items`: indici dei figli |
| mappa | `Value::Map`, uno `std::vector<std::pair<std::string, Value>>` | `RIPPLE_VALUE_KIND_ENTRIES` | `data.entries`: una chiave e un indice di figlio ciascuna |

| Membro | Risponde |
| --- | --- |
| Costruttori | Da `nullptr`, `bool`, qualsiasi tipo integrale (memorizzato come `std::int64_t`), `double`, `std::string`, `const char*`, `std::string_view`, `List`, `Map`. Un `Value` di default è null. |
| `is_null()`, `is_bool()`, `is_int()`, `is_float()`, `is_text()`, `is_list()`, `is_map()` | Quale tipo contiene. |
| `get_if<T>()` | Un puntatore al `T` contenuto, o `nullptr`. |
| `storage()` | Lo `std::variant` sottostante. |
| `find(key)` | Il valore di una mappa sotto `key`, o `nullptr`, anche per qualsiasi cosa non sia una mappa. |
| `ripple::as_text(value)` | Il valore come testo, nel modo in cui lo stamperebbe un passaggio. |

### L'arena in C

Un valore C è un `RippleValue`: `nodes`, un array piatto di `RippleValueNode`, e `count`. La radice è il nodo 0. Ogni nodo è un `uint32_t kind` e una `union data` letta in base a esso; i figli di una lista o di una mappa sono indici nello stesso array. Un'arena vuota è null. Un indice di figlio che non viene dopo il suo genitore, o che è oltre la fine, si legge come null, quindi un'arena non può ciclare. Un host costruisce un'arena per ogni valore che consegna; `RippleFields` è una lista di `RippleField`, ciascuno con una `key` e un `value`, per i campi di una risposta.

## Player

`ripple::Player` è il ciclo sopra una sessione, scritto una volta sola. Consegna ogni effetto in ordine, tiene l'ultimo turno, risponde a un `Hold` dal suo orologio quando `update()` lo trova scaduto, fa scorrere allo stesso modo il conto alla rovescia di un passaggio, dice alla sessione l'ora prima di ogni verbo, applica gli effetti `Audio` a un `SoundscapeDriver`, e smista le callback con nome dell'autore. Ciò che non incapsula sta su `session()`: `set_position` e `set_stand_in` non muovono la storia e non rispondono con effetti.

```cpp
Player(Session session, PlayerHandlers handlers, Clock now = {});
```

Il player possiede la sessione. Senza un orologio legge `ripple::steady_clock()`.

`PlayerHandlers`:

| Campo | Tipo | Significato |
| --- | --- | --- |
| `on_effect` | `std::function<void(const Effect&)>` | Ogni effetto, nell'ordine in cui lo ha prodotto il motore. |
| `on_error` | `std::function<void(const Failure&)>` | Un errore di un verbo che il player ha invocato da solo, l'`elapsed` dopo un'attesa, o l'eccezione di un gestore. La consegna prosegue comunque. L'eccezione di un gestore che non è una `ripple::Error` arriva come `Code::invalid_argument` con il suo `what()`. |
| `audio` | `SoundscapeDriver*` | Dove va il suono della storia; senza, non si sente nulla. |
| `moment` | `std::function<std::optional<Moment>()>` | Che ora è per la storia, `local_moment` per quella di questa macchina: chiesta prima di ogni verbo che può avanzare e passata a `set_now`. Vuota per un host che non consegna nessun orologio, o a cui non è stato concesso. |
| `countdowns` | `bool`, predefinito `true` | Se il player fa scorrere il conto alla rovescia di un passaggio sul proprio orologio, da `update()`. Disattivalo per un host che tiene il tempo in un altro modo, un test, un giro su ogni ramo, un lettore che ha chiesto nessun limite di tempo (WCAG 2.2.1), che chiama da sé `begin_countdown` ed `expire`, o mai. |

| Membro | Risponde | Note |
| --- | --- | --- |
| `start()`, `choose(index)`, `answer(values)`, `set_locale(locale)`, `restart()`, `stop()` | `void` | I verbi della sessione, con i loro effetti consegnati tramite i gestori. Ciascuno annulla un'attesa in sospeso. |
| `permit(kind, granted)` | `void` | La risposta del lettore per un tipo; su un turno `Permit`, l'ultima fa cominciare la storia. Mantiene un conto alla rovescia. |
| `begin_countdown()` | `void` | Il conto alla rovescia comincia adesso, qualunque cosa dicesse il suo `after_ms`, per un host che fa scorrere da sé i conti alla rovescia. Con `countdowns` attivo lo dice `update()`. |
| `expire()` | `void` | Il conto alla rovescia è scaduto adesso: viene presa la scelta predefinita del passaggio. |
| `pause()` | `std::optional<std::string>` | Mette giù la storia e risponde con il suo salvataggio: nessuno, e nulla viene fermato, a meno che la storia non sia su un passaggio o su un modulo. Un salvataggio non porta con sé il tempo: una storia ripresa su un passaggio a tempo ricomincia ad aspettare da capo. |
| `update()` | `void` | Chiamala dal tuo ciclo. Risponde a un'attesa il cui momento è arrivato, e fa cominciare o scadere un conto alla rovescia il cui momento è arrivato. Con le eccezioni e senza `on_error`, un errore di quel verbo viene lanciato. |
| `turn()` | `const std::optional<Effect>&` | L'ultimo turno consegnato. |
| `hold_due()` | `std::optional<std::uint64_t>` | Quando scade l'attesa in sospeso, secondo l'orologio del player. |
| `countdown()` | `const std::optional<Countdown>&` | Il conto alla rovescia del passaggio mostrato, per un host che ne disegna uno; nessuno quando il passaggio non ne ha. Mantenuto attraverso un `set_locale`, che è la stessa visita; lasciato cadere quando il lettore sceglie o viene mostrato qualcos'altro. |
| `session()` | `Session&` | La sessione, per ciò che il player non incapsula. Un verbo chiamato su di essa aggira il player. |
| `on_callback(name, handler)` | `void` | Chiama `handler` ogni volta che scatta la callback chiamata `name`, sostituendo qualsiasi gestore sotto quel nome. |
| `remove_callback(name)` | `void` | |
| `on_any_callback(handler)` | `void` | Chiama `handler` per ogni callback che scatta, registrata o no. |
| `clear_callbacks()` | `void` | Rimuove entrambi i tipi. |
| `callback_misses()` | `std::uint64_t` | Quante callback sono scattate senza nulla di registrato sotto il loro nome. |
| `dispose()` | `void` | Non consegna più nulla. Un verbo dopo di esso non fa nulla. |

Per ogni effetto di un batch, in ordine, il player lo registra se è un turno, lo applica ad `audio` se è `Audio`, lo smista se è `Callback`, poi chiama `on_effect`. Un verbo chiamato sul player dall'interno di un gestore viene rifiutato con `Code::reentrant` (`ripple::ReentrantVerb`), perché il resto del batch arriverebbe dopo quello nuovo: mettilo in coda e chiamalo quando il gestore ritorna.

Un **`Countdown`** è `timer` (`ChoiceTimer`), `begun` (se `begin_countdown` è stato detto) e `due` (`std::uint64_t`), quando scade il prossimo dei due secondo l'orologio del player: l'inizio, o una volta cominciato la fine. Un conto alla rovescia cominciato in ritardo è misurato da quando era dovuto e non da quando `update()` se n'è accorto, così un ciclo lento non allunga il tempo del lettore.

`Clock` è `std::function<std::uint64_t()>`, in millisecondi, monotono. `ripple::steady_clock()` ne restituisce uno su `std::chrono::steady_clock`, che parte da zero.

## Callback con nome

L'autore dichiara il nome e l'evento di una callback; il motore emette un effetto `Callback` quando scatta; l'host registra un gestore per nome. Il motore non vede mai la tabella dei gestori, e una callback non può cambiare la storia.

| Regola | |
| --- | --- |
| Registrare | `Player::on_callback(name, handler)`; un `CallbackHandler` è `std::function<void(const CallbackEvent&)>`. Un host C confronta da sé `RippleCallbackEvent.callback`. |
| Un nome che nessuno ha registrato | Ordinario, non un errore. `Player` lo conta in `callback_misses()`. |
| Un gestore che lancia un'eccezione | Assorbita: passata a `on_error`, e il resto del batch viene comunque consegnato. |
| Un verbo da un gestore | Rifiutato con `ReentrantVerb`; mettilo in coda. |
| Il nome dell'evento | `CallbackEvent::event_name()`, oppure `ripple_callback_kind_name(kind)` in C, che risponde NULL per un valore che non è un `RippleCallbackKind`. |

| `RippleCallbackKind` | Valore | Nome |
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

Su che cosa scatta ogni evento e a che cosa può essere puntato è spiegato in [Callback dell'host](/it/reference/host-callbacks/).

## Suono

Non viene distribuito nessuno speaker. La sessione dice ciò che la storia chiede sotto forma di effetti `Audio`; lo scheduler del motore, `ripple::Mixer`, decide ogni voce a partire da essi; uno speaker che scrivi tu produce i suoni. `ripple::SoundscapeDriver` pilota lo scheduler per uno speaker, ed è la metà dell'host. Il [contratto dello speaker](https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration/blob/main/docs/speaker.md) del binding contiene note di corrispondenza per miniaudio, SDL3 e FMOD Core.

```cpp
MySpeaker speaker;
auto audio = ripple::SoundscapeDriver::create(campaign, speaker);
ripple::PlayerHandlers handlers;
handlers.audio = audio.get();
ripple::Player player(ripple::Session::create(campaign, config), handlers);
// every frame:  audio->update();  player.update();
```

### SoundscapeDriver

| Membro | Risponde | Note |
| --- | --- | --- |
| `static create(campaign, speaker, options = {})` | `std::unique_ptr<SoundscapeDriver>` | Mantiene riferimenti a `campaign` e `speaker`, che devono sopravviverle. Non copiabile. |
| `apply(command)` | `void` | Esegue un `AudioCommand`. `Player` lo chiama per ogni effetto `Audio`. Un cue il cui medium non ha un file viene ignorato. |
| `update()` | `void` | Chiamala dal tuo ciclo: sente ciò che le voci hanno riferito e fa avanzare la timeline. Il ritmo dell'editor è ogni 25 ms; più spesso non fa perdere nulla. |
| `set_muted(muted)` | `void` | Attiva o disattiva il muto subito: ogni guadagno scritto a zero, il resto ricordato. |
| `muted()` | `bool` | |
| `pause()`, `resume()` | `void` | Ferma ogni voce e la timeline con esse, non la storia. |
| `playing()` | `std::optional<std::string>` | L'id del soundscape in vigore, che suona o aspetta il suo turno. |
| `idle()` | `bool` | Se nulla suona, aspetta o ha cue. |
| `voices()` | `std::size_t` | Quante voci lo speaker tiene aperte ora. |
| distruttore | | Ferma ogni voce. |

Un errore del mixer ferma il suono, non la storia: il driver non lo segnala.

`SoundscapeOptions`:

| Campo | Tipo | Predefinito |
| --- | --- | --- |
| `max_cues` | `std::uint32_t` | `RIPPLE_MIXER_DEFAULT_MAX_CUES` |
| `gain_step` | `double` | `RIPPLE_MIXER_DEFAULT_GAIN_STEP` |
| `muted` | `bool` | `false` |
| `now` | `Clock` | `ripple::steady_clock()` |

Che cosa fa il driver, perché non debba farlo uno speaker: l'orologio e il tick; i comandi dello scheduler, in ordine; una voce in ritardo, il cui inizio si sposta in avanti del tempo che `open` ha impiegato moltiplicato per `rate`, una clip in loop che si riavvolge dentro il suo loop e una clip già finita riferita come terminata; le voci riferite come terminate o misurate, comunicate allo scheduler; le tracce senza file, comunicate come silenzio; il muto; e il passaggio di consegne tra soundscape, che non si sovrappongono mai: quello che esce sfuma in uscita lungo il proprio `fade_out` prima che inizi il successivo.

### Speaker e Voice

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

| Membro | Obbligo |
| --- | --- |
| `Speaker::open(source, role, events)` | Ritorna quando la voce può iniziare subito: il file aperto, o abbastanza di esso decodificato. Ritorna `nullptr` quando il file non può essere riprodotto, il che si sente come silenzio e non viene mai ritentato. Conserva `events` con la voce. `role` è un suggerimento: `VoiceRole::track` di solito è lungo e meglio da far scorrere in streaming, `VoiceRole::cue` breve e meglio da decodificare per intero e avviare con precisione. |
| `Speaker::resolves(source)` | Chiesto prima che un soundscape suoni: una traccia che il tuo speaker non può riprodurre viene comunicata subito allo scheduler come silenzio. Vero a meno che non venga sovrascritto. |
| `Voice::play(request)` | Inizia subito, sostituendo qualunque cosa la voce stesse riproducendo. Può essere richiamato sulla stessa voce, per un letto senza interruzioni il cui file è finito e ricomincia; segui il più da vicino possibile che la tua API consente. |
| `Voice::set_gain(gain)` | Un nuovo guadagno sulla stessa scala cubica. Lo scheduler ne scrive uno a ogni tick in cui una dissolvenza si muove; ammorbidisci tra l'uno e l'altro lungo qualche millisecondo. |
| `Voice::pause()`, `Voice::resume()` | Tengono la voce esattamente dov'è, e la lasciano ripartire. Il driver mette in pausa tutte le voci insieme. |
| `Voice::stop()` | Termina la voce definitivamente e ne libera le risorse. Non segue nessun `ended`. |

`VoicePlay`, ciò che una voce deve riprodurre:

| Campo | Tipo | Significato |
| --- | --- | --- |
| `from_ms` | `double` | Da dove nel file iniziare. |
| `to_ms` | `std::optional<double>` | Dove fermarsi; la fine del file quando assente. |
| `gain` | `double` | Da 0 a 1, sulla scala cubica del motore. |
| `rate` | `double` | Velocità di riproduzione; 1 è come registrato. |
| `looping` | `bool` | Se raggiungere `to_ms` fa ricominciare. |
| `loop_from_ms` | `double` | Il punto a cui ritorna ogni giro di un loop: `loop_from_ms`, non `from_ms`. |

**La scala del guadagno è cubica.** Uno speaker che scrive l'ampiezza scrive `gain * gain * gain`.

`VoiceSource`: `media` (per indice nei media del manifest), `path` (dentro il bundle) e `file` (su disco, per una campagna aperta da una cartella).

`VoiceEvents`, ciò che una voce riferisce. Entrambe le chiamate sono thread-safe e possono arrivare da un thread audio; il driver le sente al suo `update()` successivo. Una chiamata da una voce che nel frattempo è stata fermata viene ignorata.

| Membro | Quando |
| --- | --- |
| `ended()` | Una volta per riproduzione, quando una voce non in loop raggiunge la fine di ciò che le è stato dato. Mai dopo `stop()`, mai per una voce in loop. |
| `duration(ms)` | Una volta, quando la lunghezza del file è nota. Una traccia riprodotta fino alla fine del suo file non ha, finché non lo è, una fine per cui lo scheduler possa pianificare una dissolvenza in uscita o un giro senza interruzioni. |

### Mixer

`ripple::Mixer` è lo scheduler dei soundscape del motore, allo stato grezzo: comandi in ingresso, `VoiceCommands` in uscita, l'orologio dell'host su ogni verbo, e nessun orologio, file o voce propri. Un host con uno `Speaker` usa invece il driver; un host che pilota il mixer da sé gli deve tutto ciò che fa il driver.

| Membro | Risponde | Note |
| --- | --- | --- |
| `static create(max_cues = RIPPLE_MIXER_DEFAULT_MAX_CUES, gain_step = RIPPLE_MIXER_DEFAULT_GAIN_STEP)` | `Mixer` | Al più `max_cues` cue insieme; un guadagno scritto solo quando si è mosso di più di `gain_step`. |
| `handle()` | `RippleMixer*` | |
| `play(now_ms, soundscape, unresolved = {}, at_ms = 0, muted = false)` | `VoiceCommands` | Un audio `play`, `at_ms` dentro la timeline, che prende il testimone da ciò che sta suonando. `unresolved` nomina le tracce per cui non hai un file, per indice: sentite come silenzio, mai ritentate. |
| `stop(now_ms)` | `VoiceCommands` | Un audio `stop`: sfuma in uscita ciò che sta suonando. |
| `cut(now_ms)` | `VoiceCommands` | Un audio `cut`: azzittisce tutto subito, cue compresi. |
| `cue(now_ms, media, volume, speed)` | `VoiceCommands` | Un audio `cue`. |
| `pause(now_ms)`, `resume(now_ms)` | `VoiceCommands` | |
| `tick(now_ms)` | `VoiceCommands` | Fa avanzare la timeline: ciò che è in scadenza si apre, le rampe si muovono, ciò che è finito si ferma. |
| `voice_ended(now_ms, voice)` | `VoiceCommands` | La segnalazione dello speaker che una voce ha raggiunto la fine. |
| `duration_known(voice, ms)` | `void` | La segnalazione dello speaker della lunghezza di un file. |
| `set_muted(muted)` | `void` | La timeline prosegue, ogni guadagno scritto a 0. |
| `playing_id()` | `std::optional<std::string>` | Il soundscape in riproduzione. |
| `finishing_id()` | `std::optional<std::string>` | Il soundscape che sfuma in uscita sotto quello in riproduzione. |
| `state()` | `std::optional<Phase>` | La fase del soundscape in riproduzione. |
| `track_state(track)` | `Phase` | La fase di una traccia, per indice nelle tracce del soundscape in riproduzione. |
| `position_ms()` | `std::uint64_t` | A che punto della sua timeline è il soundscape in riproduzione. |
| `pass()` | `std::uint32_t` | Quante volte ha girato. |
| `ran_out()` | `bool` | Se è arrivato alla fine e non andrà in loop. |
| `is_paused()`, `muted()` | `bool` | |
| `is_idle()` | `bool` | Se nulla suona o è in scadenza: quando un host può smettere di inviare tick. |

`Phase` è `queued`, `starting`, `playing`, `finishing` o `finished`.

`VoiceCommand`, letto per `kind`; un campo che un altro tipo non usa è zero:

| Campo | Tipo | Significato |
| --- | --- | --- |
| `kind` | `VoiceKind` | `open` una voce su `media` e riprodurla; `gain`, un nuovo guadagno; `stop` la voce definitivamente, il che non segnala alcuna fine; `pause` ogni voce; `resume` ogni voce. |
| `voice` | `std::uint64_t` | `open`, `gain`, `stop`: la voce. |
| `media` | `std::uint32_t` | `open`: per indice nei media del manifest. |
| `from_ms` | `std::uint64_t` | `open`. |
| `to_ms` | `std::optional<std::uint64_t>` | `open`: nessuno per la fine del file. |
| `gain` | `double` | `open`, `gain`: sulla scala cubica. |
| `rate` | `double` | `open`. |
| `looping`, `loop_from_ms` | `bool`, `std::uint64_t` | `open`. |
| `role` | `VoiceRole` | `open`: `track` o `cue`. |
| `track` | `std::uint32_t` | `open`, come traccia: il suo indice nel soundscape. |

## Errori

Con le eccezioni, ogni chiamata che può fallire lancia una classe derivata da `ripple::Error`, uno `std::runtime_error` il cui `failure()` risponde con il `Failure` e `code()` con il suo `Code`. Con `RIPPLE_HPP_NO_EXCEPTIONS` definito, le stesse chiamate rispondono con `ripple::Result<T>`. `ripple::Returns<T>` è `T` con le eccezioni e `Result<T>` senza, così il codice che legge i risultati tramite esso compila in entrambi i modi.

| `RippleResult` | Valore | `ripple::Code` | Classe C++ | Incontrato |
| --- | --- | --- | --- | --- |
| `RIPPLE_SUCCESS` | 0 | `success` | | |
| `RIPPLE_ERROR_BUNDLE_FORMAT` | 1 | `bundle_format` | `BundleError` | In uso: un documento del bundle è malformato o manca. |
| `RIPPLE_ERROR_BUNDLE_VERSION` | 2 | `bundle_version` | `BundleError` | In uso: un documento è di una versione che questo motore non sa leggere. |
| `RIPPLE_ERROR_NEEDS_PYTHON` | 3 | `needs_python` | `NeedsPython` | In uso: il bundle ha bisogno di Python e questa è la libreria `no-python`. |
| `RIPPLE_ERROR_WRONG_TURN` | 10 | `wrong_turn` | `HostError` | Un bug dell'host: il verbo non risponde al turno su cui è la storia. |
| `RIPPLE_ERROR_NO_SUCH_CHOICE` | 11 | `no_such_choice` | `HostError` | Un bug dell'host: una scelta oltre quelle offerte. |
| `RIPPLE_ERROR_CHOICE_SPENT` | 12 | `choice_spent` | `HostError` | Un bug dell'host: una scelta con `available` falso. |
| `RIPPLE_ERROR_STOPPED` | 13 | `stopped` | `HostError` | Un bug dell'host: la sessione si è fermata. |
| `RIPPLE_ERROR_NOTHING_ASKED` | 14 | `nothing_asked` | `HostError` | Un bug dell'host: `start` non è stato chiamato. |
| `RIPPLE_ERROR_UNKNOWN_LOCALE` | 15 | `unknown_locale` | `HostError` | Una lingua in cui la campagna non è leggibile. |
| `RIPPLE_ERROR_NOT_PERMITTED` | 16 | `not_permitted` | `HostError` | Un bug dell'host: una lettura consegnata per un tipo che il lettore non ha concesso. |
| `RIPPLE_ERROR_STAND_IN` | 17 | `stand_in` | `HostError` | In uso: un sostituto del lettore che non si legge come tale; il messaggio dice perché. |
| `RIPPLE_ERROR_NO_COUNTDOWN` | 18 | `no_countdown` | `HostError` | Un bug dell'host: `begin_countdown` o `expire` su un passaggio senza conto alla rovescia. |
| `RIPPLE_ERROR_COUNTDOWN_NOT_BEGUN` | 19 | `countdown_not_begun` | `HostError` | Un bug dell'host: `expire` prima di `begin_countdown`. |
| `RIPPLE_ERROR_BOARD_GONE` | 20 | `board_gone` | `ResumeError` | In uso: un salvataggio nomina una lavagna che la campagna non ha più. |
| `RIPPLE_ERROR_NODE_GONE` | 21 | `node_gone` | `ResumeError` | In uso: un salvataggio nomina un nodo che la lavagna non ha più. |
| `RIPPLE_ERROR_INVALID_ARGUMENT` | -1 | `invalid_argument` | `InvalidArgument` | Un bug dell'host: un handle o un puntatore NULL, una stringa che non è UTF-8, un valore fuori intervallo. Non è stato fatto nulla. |
| `RIPPLE_ERROR_TRAP` | -2 | `trap` | `EngineTrap` | Il motore è andato in panic, ora o in precedenza su questo handle. |
| | -100 | `reentrant` | `ReentrantVerb` | Un bug dell'host, solo C++: un verbo di `Player` dall'interno di un gestore. |

`Failure` porta tutto ciò che il motore ha detto. Quali campi hanno significato dipende da `code`; gli altri sono zero o vuoti.

| Campo | Impostato per |
| --- | --- |
| `code`, `message` | Sempre. `message` è la frase del motore, per un log o per uno sviluppatore. |
| `location` | `bundle_format`: dove nel documento, quando è noto. |
| `found`, `supported`, `oldest` | `bundle_version`: la versione che il documento porta, la più recente che questo motore legge, e la più vecchia quando c'è una soglia minima. |
| `asked`, `answered` | `wrong_turn`: il turno su cui è la storia (un `RippleTurnKind`: `PRESENT`, `ASK`, `WAIT`, `ENDED`, `FAILED`, `STOPPED`, `PERMIT`) e il verbo chiamato (un `RippleVerb`: `CHOOSE`, `ANSWER`, `ELAPSED`, `BEGIN_COUNTDOWN`, `EXPIRE`). |
| `offered`, `chosen` | `no_such_choice`: quante scelte sono state offerte, e l'indice preso. |
| `subject` | `choice_spent` (la porta), `unknown_locale` (la lingua), `board_gone` e `node_gone` (la lavagna), `not_permitted` e `stand_in` (il nome del tipo). |
| `node` | `node_gone`. |

`Result<T>`: `ok()` e `explicit operator bool`, `value()`, `operator->`, `operator*` e `failure()`. `Result<void>` ha `ok()`, `operator bool` e `failure()`, il cui codice è `success` quando nulla è fallito.

**Un trap avvelena l'handle.** Dopo `RIPPLE_ERROR_TRAP` da qualsiasi chiamata, distruggi quell'handle, riapri e riprendi dall'ultimo checkpoint. Con Emscripten un panic interrompe invece il modulo, e la pagina si riapre e riprende.

## Thread e ciclo di vita

- **Un solo chiamante alla volta per handle.** Una `Campaign`, una `Session` o un `Mixer` può passare da un thread all'altro; per eseguire il motore fuori dal tuo thread principale, sposta lì l'handle.
- **Il motore non avvia nessun thread, non dorme mai e non legge mai un orologio.** Un `Hold` e un conto alla rovescia vengono risposti dal tuo orologio, tramite `elapsed()`, `begin_countdown()` ed `expire()` o `Player::update()`, e l'ora che una storia legge è quella che passi a `set_now`.
- **`Player` e `SoundscapeDriver` non possiedono né orologio né thread.** Leggono il loro `Clock` quando chiami `update()`; il tuo ciclo è il timer. Le loro chiamate arrivano da un solo thread; `VoiceEvents` può essere chiamato da qualsiasi thread.
- **RAII.** `Campaign`, `Session` e `Mixer` sono move-only e distruggono il loro handle C insieme a sé. Una campagna può essere distrutta prima delle sue sessioni. Un `Player` possiede la sua `Session`. Un `SoundscapeDriver` mantiene riferimenti alla sua `Campaign` e al suo `Speaker`, quindi entrambi devono sopravvivergli.
- **Niente in C++ punta dentro il motore.** Ogni risposta è copiata fuori dal risultato C, che viene liberato prima che la chiamata ritorni; il costo è una copia per verbo.
- **In C, i puntatori di un batch muoiono con esso.** Tutto ciò che una chiamata scrive tramite un puntatore di uscita è valido finché non viene consegnato a `ripple_free`.

## Il livello C

`ripple.h` è C99 e mantiene le stesse convenzioni in ogni funzione:

- **Risultati.** Una chiamata che può fallire restituisce un `RippleResult` e prende come ultimo argomento un `const RippleError **error`, che può essere NULL. In caso di errore `*error` lo descrive; restituiscilo con `ripple_free`.
- **Puntatori di uscita.** Tutto ciò che viene scritto tramite un puntatore di uscita è del motore e torna indietro con `ripple_free`. NULL, un puntatore che il motore non ha mai dato e uno già liberato vengono tutti ignorati.
- **Un controllo delle perdite.** `ripple_outstanding()` risponde quanti oggetti il motore ha consegnato e non si è visto restituire: zero una volta liberato tutto.
- **Handle.** `RippleCampaign`, `RippleSession` e `RippleMixer` sono opachi e tornano indietro con il proprio `ripple_*_destroy`, che ignora NULL.
- **Unioni etichettate.** Un `uint32_t kind` e una `union data` letta in base a esso: un effetto, un nodo valore, un comando di voce. Un effetto `Permit` è `RIPPLE_EFFECT_KIND_PERMIT` (12) con `data.permit`, un `RipplePermit` di `kinds` e `kind_count`; un `Notice` è `RIPPLE_EFFECT_KIND_NOTICE` (13) con `data.notice`, un `RippleNotice` di `code`, `kind`, `node` e `message`. Il `timer` di un passaggio è un puntatore a `RippleChoiceTimer`, NULL se non c'è, e un `RipplePromptField` porta `label`, `placeholder`, `optional` e `options`, `option_count` di `RipplePromptOption` (`id`, `label`, `value`).
- **Stringhe.** Una `RippleStr` è `{ptr, len}`, UTF-8. `ptr` è NULL per una stringa opzionale assente; una presente ma vuota ha un `ptr` non NULL e `len` 0. Dal motore è terminata da NUL oltre `len`; da un host non è necessario.
- **Opzionali.** `RippleOptionalU32`, `RippleOptionalU64` e `RippleOptionalI64` sono `{present, value}`.
- **Liste.** Un puntatore e un conteggio, o come struct (`RippleEffects`, `RippleStrList`, `RippleEntityList`…) o come coppia di campi (`choices`, `choice_count`).
- **Valori.** L'arena descritta in *Valori*.
- **Opzioni.** Parti da `ripple_session_options_default` e cambia ciò che intendi cambiare.

### Funzioni

**Il motore e i suoi formati**

| Funzione | Fa |
| --- | --- |
| `ripple_engine_version` | La versione della libreria, una stringa di sua proprietà. |
| `ripple_engine_contract` | Il contratto che la libreria collega, una stringa di sua proprietà. |
| `ripple_engine_has_python` | Falso per la libreria `no-python`. |
| `ripple_bundle_format` | Il formato di bundle che il motore scrive, e legge fino a quello. |
| `ripple_save_format` | Il formato di salvataggio che il motore scrive. |
| `ripple_save_check` | Legge un salvataggio memorizzato e lo restituisce come lo scriverebbe questo motore, rifiutandone uno malformato o di un motore più recente prima che a una sessione venga chiesto di riprenderlo. Nessun wrapper C++. |
| `ripple_callback_kind_name` | Il nome di un `RippleCallbackKind`, come `cvar.changed`; NULL per qualsiasi altro valore. |
| `ripple_cvar_types` | I tipi di variabile di console che una campagna può dichiarare, per nome sul filo. Nessun wrapper C++. |
| `ripple_cvar_coerce` | Un valore convertito al tipo di una variabile di console, come lo accetterebbe una scrittura; `*out` NULL quando il tipo lo rifiuta. Nessun wrapper C++. |
| `ripple_cvar_describe_refusal` | La frase con cui verrebbe rifiutata la scrittura rifiutata di una variabile di console. Nessun wrapper C++. |
| `ripple_value_as_text` | Un valore come testo, nel modo in cui lo stamperebbe un passaggio. |
| `ripple_value_as_truth` | Se un valore è vero, secondo le regole di verità della storia. Nessun wrapper C++. |
| `ripple_value_deep_equals` | Se due valori sono uguali secondo le regole della storia: una mappa per appartenenza, un Int e un Float per numero. Nessun wrapper C++. |

**Campaign**

| Funzione | Fa |
| --- | --- |
| `ripple_campaign_open_dir` | Apre il bundle in una cartella. |
| `ripple_campaign_open_memory` | Apre un bundle da un array di `RippleFile` (`path`, `bytes`, `len`); i byte vengono copiati. |
| `ripple_campaign_destroy` | Distrugge una campagna; le sue sessioni continuano a funzionare. |
| `ripple_campaign_manifest` | Il manifest. |
| `ripple_campaign_board` | Una lavagna, per indice. |
| `ripple_campaign_soundscape` | Un soundscape, per indice. |
| `ripple_campaign_board_with_id` | L'indice di una lavagna per id di catalogo, come `RippleOptionalU32`. |
| `ripple_campaign_node` | Un nodo di una lavagna per id; `*out` NULL quando non ce n'è. |
| `ripple_campaign_validate` | Tutto ciò che non va nel bundle nel suo insieme. |
| `ripple_campaign_media_path` | Il percorso di un medium dentro il bundle; `*out` NULL quando non c'è quel medium. |
| `ripple_campaign_has_media` | Se il bundle contiene il file del medium. Nessun wrapper C++. |
| `ripple_campaign_media_bytes` | I byte di un medium, letti per intero; `*out` NULL quando il bundle non lo contiene. |

**Session**

| Funzione | Fa |
| --- | --- |
| `ripple_session_options_default` | Riempie un `RippleSessionOptions` con i limiti e le politiche proprie del motore. |
| `ripple_session_create` | Una nuova sessione da un `RippleSessionConfig`. |
| `ripple_session_resume` | Una sessione da un salvataggio, un seed e delle opzioni. |
| `ripple_session_destroy` | Distrugge una sessione. |
| `ripple_session_start` | Il primo turno, o quello salvato. |
| `ripple_session_choose` | Risponde a un passaggio; `RIPPLE_CHOICE_NONE` per lasciarlo. |
| `ripple_session_answer` | Risponde a un modulo con `RippleFields`; NULL per lasciarlo. |
| `ripple_session_elapsed` | Risponde a un'attesa. |
| `ripple_session_begin_countdown` | Il conto alla rovescia del passaggio mostrato comincia; non muove nulla. |
| `ripple_session_expire` | Il conto alla rovescia è scaduto; viene presa la scelta predefinita del passaggio. |
| `ripple_session_permit` | La risposta dell'host per un `RipplePermissionKind`, in qualsiasi momento, anche prima di `ripple_session_start`. |
| `ripple_session_set_now` | Che ora è, un `RippleMoment` (`utc_ms`, `offset_minutes`); NULL per nessun orologio. |
| `ripple_session_set_position` | L'ultima rilevazione dell'host, una `RipplePosition` (`label`, poi `latitude`, `longitude` e `accuracy` come `RippleOptionalF64`, e `when`, un puntatore a `RippleMoment`); NULL per nessuna. |
| `ripple_session_set_stand_in` | Il sostituto del lettore per un tipo, come scritto, letto a `local_offset_minutes` quando non porta uno scostamento; una stringa NULL lo toglie. |
| `ripple_session_set_locale` | Cambia la lingua; il turno viene risposto di nuovo. |
| `ripple_session_restart` | Ricomincia dal primo turno. |
| `ripple_session_pause` | Il salvataggio e ciò che la pausa ha fatto, come `RipplePaused`. |
| `ripple_session_stop` | Ferma la storia definitivamente. |
| `ripple_session_checkpoint` | Un salvataggio senza fermarsi; `*out` NULL quando non c'è ancora nulla da salvare. |
| `ripple_session_console_feed` | Esegue una riga di Python, come `RippleConsoleResult`. |
| `ripple_session_write_cvar` | Scrive una variabile di console, come `RippleCvarChange`. |
| `ripple_session_reset_cvar` | Riporta una variabile di console al valore predefinito. |
| `ripple_session_reset_all_cvars` | Riporta ogni variabile di console al valore predefinito. |
| `ripple_session_remove_entity` | Rimuove un'entità, come `RippleEntityRemoval`. |
| `ripple_session_board` | La lavagna su cui è la storia. |
| `ripple_session_locale` | La lingua in cui legge. |
| `ripple_session_default_locale` | La lingua predefinita della campagna. |
| `ripple_session_ambience` | Il soundscape in vigore; `*out` NULL per il silenzio. |
| `ripple_session_entities` | Ogni entità. |
| `ripple_session_memory` | Ciò che la storia ricorda. |
| `ripple_session_cvars` | Ogni variabile di console con il suo valore. |
| `ripple_session_guard` | Ciò che la guardia degli script ha dovuto fare. |
| `ripple_session_python_available` | Se la sessione può eseguire script. |
| `ripple_session_describe_cvar_write` | Perché una scrittura verrebbe rifiutata; `*out` NULL quando verrebbe accettata. |
| `ripple_session_set_trace` | Attiva o disattiva gli effetti `trace`. |
| `ripple_session_set_trace_payloads` | Attiva o disattiva i payload tracciati. |
| `ripple_session_generator` | Lo stato dei dadi. |
| `ripple_session_set_generator` | Imposta lo stato dei dadi. |

**Mixer**

| Funzione | Fa |
| --- | --- |
| `ripple_mixer_create` | Un mixer con `max_cues` e `gain_step`. |
| `ripple_mixer_destroy` | Distrugge un mixer; le tue voci sono tue da fermare. |
| `ripple_mixer_play` | Riproduce un soundscape, con le tracce non risolte e `at_ms`. |
| `ripple_mixer_stop` | Sfuma in uscita ciò che sta suonando. |
| `ripple_mixer_cut` | Azzittisce tutto subito. |
| `ripple_mixer_cue` | Riproduce un cue. |
| `ripple_mixer_pause` | Tiene tutto dov'è. |
| `ripple_mixer_resume` | Lascia proseguire tutto. |
| `ripple_mixer_tick` | Fa avanzare la timeline fino a `now_ms`. |
| `ripple_mixer_voice_ended` | Una voce ha raggiunto la fine. |
| `ripple_mixer_duration_known` | La lunghezza di un file è nota. |
| `ripple_mixer_set_muted` | Attiva o disattiva il muto. |
| `ripple_mixer_playing_id` | Il soundscape in riproduzione; `*out` NULL quando non ce n'è. |
| `ripple_mixer_finishing_id` | Il soundscape che sfuma in uscita sotto di esso. |
| `ripple_mixer_state` | Il `RipplePhase` del soundscape in riproduzione, assente quando non ne suona nessuno. |
| `ripple_mixer_track_state` | Il `RipplePhase` di una traccia. |
| `ripple_mixer_position_ms` | A che punto della sua timeline è. |
| `ripple_mixer_pass` | Quante volte ha girato. |
| `ripple_mixer_ran_out` | Se è arrivato alla fine e non andrà in loop. |
| `ripple_mixer_is_paused` | Se il mixer è in pausa. |
| `ripple_mixer_muted` | Se è in muto. |
| `ripple_mixer_is_idle` | Se nulla suona o è in scadenza. |

**Memoria**

| Funzione | Fa |
| --- | --- |
| `ripple_free` | Restituisce qualsiasi cosa il motore abbia consegnato: un batch, un manifest, una stringa, un errore. Tollera NULL e un doppio free. |
| `ripple_outstanding` | Quanti oggetti sono stati consegnati e non restituiti. |

Un host che pilota il mixer da C chiama `ripple_mixer_play` con il `RippleSoundscape` che porta un effetto audio, `ripple_mixer_tick` dal suo ciclo finché `ripple_mixer_is_idle` dice che qualcosa sta suonando, e `ripple_mixer_voice_ended` dal suo speaker, ed esegue ogni `RippleVoiceCommands` con la propria API audio, dovendo allo scheduler i compiti elencati in *SoundscapeDriver*.

### Un ciclo di turni in C

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

## Un host completo

Un host da terminale in C++17: uno speaker che annota ciò che riprodurrebbe, il driver e il player, una scelta che salta le opzioni esaurite, la domanda che una storia fa prima di leggere l'orologio o la posizione, un modulo disegnato dalle sue etichette con le risposte fisse scelte per id, attese e conti alla rovescia risposti da `update()`, la storia a cui si dice l'ora di questa macchina, callback con nome con un verbo messo in coda da un gestore, un checkpoint a ogni passaggio, e un trap recuperato riaprendo e riprendendo.

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

## Correlati

- [Incorporare il motore](/it/explanation/embedding-the-engine/): di che cosa è responsabile un host, e perché il motore non tiene alcun orologio e non riproduce alcun suono.
- [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/): release del motore, contratti e le due varianti.
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): i passi da una campagna esportata a un host funzionante.
- [Piattaforme e varianti del motore](/it/reference/engine-targets/): ogni target che una release del motore distribuisce, con la sua soglia minima.
- [Callback dell'host](/it/explanation/host-callbacks/): perché una callback è un nome che l'autore pubblica e a cui l'host risponde.
