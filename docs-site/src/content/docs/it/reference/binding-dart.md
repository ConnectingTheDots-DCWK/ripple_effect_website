---
title: Binding Dart
description: Il pacchetto ripplefx_engine per Dart, Flutter e Flame, nativo e web — come installarlo, come scegliere la variante, e ogni classe, membro, effetto, record ed eccezione che esporta.
---

`ripplefx_engine` su [pub.dev](https://pub.dev/packages/ripplefx_engine), pubblicato da `connecting-the-dots.dev`, esegue una campagna compilata da Dart: un programma da riga di comando, un server, un'app Flutter o un gioco [Flame](https://flame-engine.org). In modo nativo funziona su `dart:ffi`, sul web su `dart:js_interop`, con un'unica API per entrambi. La versione 1.6.x collega il contratto 1.6 di Ripple Effect, *Grammar Lich*. Il `PATCH` è del binding stesso, e ogni versione fissa una release del motore (la 1.6.0 fissa il motore 1.6.0). Il sorgente è pubblico su [ConnectingTheDots-DCWK/ripple_effect_dart_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration). Il pacchetto è MIT. Il motore che carica è sotto la [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/), e il suo `NOTICE` va riprodotto ovunque il tuo prodotto elenchi il software di terze parti che contiene.

Tutto ciò che segue è esportato da un'unica libreria:

```dart
import 'package:ripplefx_engine/ripplefx_engine.dart';
```

## Pacchetti e installazione

```sh
dart pub add ripplefx_engine        # or: flutter pub add ripplefx_engine
```

| | |
| --- | --- |
| Versione minima dell'SDK | Dart 3.10 o Flutter 3.38, le prime release che eseguono gli hook di build senza un flag sperimentale. |
| Dipendenze | `archive`, `code_assets`, `crypto`, `ffi`, `hooks`, `web`. Nient'altro da installare. |
| Motore nativo | Non è nel pacchetto. Lo porta l'hook di build (vedi sotto). |
| Motore web | Nel pacchetto, sotto `lib/src/web/engine/`: il codice JavaScript di collegamento del componente e i file `.wasm` di entrambe le varianti, circa 12 MB in tutto. Una pagina scarica soltanto la variante che carica. |

### L'hook di build

Su una piattaforma nativa, ogni build che esegue gli hook — `dart run`, `dart test`, `dart build cli`, ogni `flutter run` o `flutter build` — esegue l'`hook/build.dart` del pacchetto, che:

1. individua il target del motore per la piattaforma che si sta compilando;
2. scarica l'archivio C di quel target dalla release del motore fissata, da `ripplefx.app/go/engine/…` e poi dalle [release del motore](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases/releases), nella cartella di output condivisa dell'hook;
3. controlla il suo SHA-256 contro il digest fissato da `engine.json` (preso dal manifest firmato della release) prima di decomprimere qualsiasi cosa;
4. consegna la libreria condivisa all'SDK, che la include accanto al tuo programma.

Il download avviene una volta per progetto e per piattaforma; le build successive lo riusano. Un programma compilato senza gli hook dell'SDK, come un semplice `dart compile exe`, non include alcuna libreria, e la prima chiamata che ha bisogno del motore lancia `EngineNotFoundException`.

Un target senza build del motore — Android a 32 bit, un desktop a 32 bit — non riceve alcuna libreria e viene comunque compilato; su un dispositivo del genere la prima chiamata lancia `EngineNotFoundException`.

### User-define

L'hook legge gli user-define dal **tuo** pubspec, quello alla radice del tuo workspace. Non vede alcuna variabile d'ambiente, nemmeno le impostazioni del proxy.

```yaml
hooks:
  user_defines:
    ripplefx_engine:
      python: false                              # the engine without Python
      engine_dir: third_party/ripple-engine/lib  # a library of your own
      engine_tree: ../ripple_effect              # an engine checkout: cargo builds it
```

| User-define | Valore | Effetto |
| --- | --- | --- |
| `python` | `true` (predefinito) o `false` | Sceglie la variante. Qualsiasi altro valore fa fallire la build. |
| `engine_dir` | una cartella | Usa così com'è la libreria che contiene, senza alcun controllo: `libripple_effect_engine.so`, `libripple_effect_engine.dylib` o `ripple_effect_engine.dll`. Scarica `ripple-engine-c-<version>[-no-python]-<triple>.tar.gz` dalle release del motore e punta al suo `lib/`. Per una build senza rete, dietro un proxy, o con una libreria inclusa nel repository. |
| `engine_tree` | un checkout del motore | Compila il motore con `cargo`, solo per i target desktop, e stampa che il motore è UNVERIFIED. Una build per telefono fallisce e nomina invece `engine_dir`. |

Un percorso relativo è relativo al pubspec che lo nomina. `engine_dir` ha la precedenza su `engine_tree`, ed entrambi sostituiscono il download.

## Scegliere la variante

Ogni release del motore è fatta di due build: **con Python**, quella predefinita, e **senza**, grande circa la metà, che esegue ogni campagna esportata con *Non richiede Python*.

| Piattaforma | Come scegliere il motore senza Python |
| --- | --- |
| Nativa | `python: false` sotto `hooks: user_defines: ripplefx_engine:` nel tuo pubspec. |
| Web | `--dart-define=RIPPLEFX_PYTHON=false` sul comando di build o di esecuzione. Per il web non viene eseguito alcun hook. Senza il define, una pagina carica il motore con Python. |

Una campagna il cui manifest ha `needs` con `python`, aperta sul motore senza Python, viene rifiutata all'apertura con `NeedsPythonException`, su entrambi i backend. `RippleEngine.hasPython` e `Session.pythonAvailable` indicano quale motore è caricato.

## Piattaforme

| Piattaforma | Architetture | Minimo | Note |
| --- | --- | --- | --- |
| Windows | x64, arm64 | | `ripple_effect_engine.dll`, compilata contro la CRT dinamica. |
| macOS | arm64, x64 | 12.0 | Una libreria per architettura; un'app Flutter universale le prende entrambe, racchiuse in un framework con un install name `@rpath`. Nessun entitlement necessario. Un pod di plugin che mantiene un deployment target più vecchio viene portato su in un hook `post_install`, come mostra il `macos/Podfile` dell'esempio. |
| Linux | x64, arm64 | glibc 2.35 | Nessuna build per musl (Alpine). |
| Android | arm64, x86_64 | API 24 | Inclusa sotto `lib/arm64-v8a/` e `lib/x86_64/`. Nessuna build a 32 bit: un APK che include `armeabi-v7a` viene comunque compilato, e lancia `EngineNotFoundException` su un dispositivo a 32 bit. `--target-platform android-arm64,android-x64` esclude quell'ABI. |
| iOS | dispositivo (arm64), simulatore Apple silicon | 13.0 | Racchiusa in un framework con un install name `@rpath`. Nessuna build per il simulatore Intel. Nessun entitlement necessario. Xcode 15 e successivi richiedono per il simulatore un deployment target di 15.0 o superiore; imposta `IPHONEOS_DEPLOYMENT_TARGET` e porta su i pod di plugin più vecchi in un hook `post_install`, come mostra il `ios/Podfile` dell'esempio. |
| Web | dart2js, dart2wasm | | Flutter web (`flutter build web`, con o senza `--wasm`) o qualsiasi altra app web Dart. |

L'elenco dei target del motore è in [Target del motore](/it/reference/engine-targets/).

### Cosa cambia sul web

| | Nativo | Web |
| --- | --- | --- |
| Backend | `dart:ffi` sull'ABI C | `dart:js_interop` sul componente WebAssembly del motore |
| File del motore | inclusi dall'hook di build | Flutter web: `assets/packages/ripplefx_engine/…`, dichiarati `platforms: [web]`, così nessun'altra build li porta. Altre build web: serviti da `packages/ripplefx_engine/src/web/engine/`. |
| `RippleEngine.load(base:)` | risponde subito | scarica, compila e istanzia il motore. `base` indica un altro luogo da cui i file vengono serviti, come una CDN: un URL che contiene `python/`, `no-python/`, `wasi.js` e `bridge.js`. Copia lì la cartella `lib/src/web/engine/` del pacchetto e chiama `load(base:)` prima di ogni altra cosa. |
| Chiamate a livello di motore | funzionano subito | `RippleEngine.version`, `contract`, `hasPython`, un `Mixer` creato da solo e `Value.toStoryText` lanciano `EngineNotFoundException` finché non si è atteso `load()`. Aprire una campagna lo attende. |
| `Campaign.openDirectory` | apre una cartella | lancia `UnsupportedError`. Usa `Campaign.openFiles`. |
| `Campaign.mediaFile` | il file su disco, per una campagna aperta da una cartella | sempre `null` |
| Una trap | avvelena l'handle su cui è avvenuta | ogni campagna gira in un'istanza del motore tutta sua, quindi una trap avvelena soltanto quella campagna e le sue sessioni |
| `RippleEngine.outstanding` | il conteggio del motore | sempre `0` |
| Un Int a 64 bit | esatto | esatto con dart2wasm. Con dart2js un Int oltre ±2^53 viene arrotondato al double più vicino, e `Value.from(7.0)` è un Int; costruisci un Float come `FloatValue(7.0)`. Una storia che conta oltre ±2^53 richiede `--wasm`. |
| Content Security Policy | | deve consentire `script-src 'wasm-unsafe-eval'` e i file del motore da dovunque vengano serviti |

## Il motore

`RippleEngine` è una classe di membri statici.

| Membro | Tipo | Significato |
| --- | --- | --- |
| `boundContract` | `String` (const) | Il contratto che questi binding collegano, `'1.6'`. |
| `load({Uri? base})` | `Future<void>` | Carica il motore e controlla che colleghi `boundContract`. Non fa nulla in modo nativo; sul web è l'unico await prima che i getter a livello di motore funzionino. `base` è solo per il web. Lancia `EngineNotFoundException`. |
| `ensureLoaded()` | `void` | In modo nativo, carica la libreria e ne controlla il contratto, una sola volta; il costruttore di ogni handle la chiama. Sul web, controlla che si sia atteso `load()`. Lancia `EngineNotFoundException`. |
| `version` | `String` | La versione del motore caricato, come `1.6.0`. |
| `contract` | `String` | Il contratto che il motore caricato collega, come `1.6`. |
| `hasPython` | `bool` | `false` per il motore senza Python. |
| `outstanding` | `int` | Quante cose il motore ha consegnato senza che gli fossero restituite. Zero ogni volta che nessuna chiamata è in corso. Sempre `0` sul web. |

## Campaign

Un bundle, aperto. Immutabile e condiviso da ogni sessione creata a partire da esso. Può essere rilasciato prima delle sue sessioni, che continuano a funzionare.

### Apertura

| Factory | Risponde | Note |
| --- | --- | --- |
| `Campaign.openDirectory(String folder)` | `Future<Campaign>` | La cartella che contiene `campaign.json`. I file vengono letti man mano che la storia li richiede, mai da fuori della cartella. Solo nativo; `UnsupportedError` sul web. |
| `Campaign.openFiles(Iterable<BundleFile> files)` | `Future<Campaign>` | Ogni file del bundle, con il suo percorso al suo interno. I byte vengono copiati. Per gli asset di un'app Flutter, un archivio compresso, o il web. |

`BundleFile(String path, Uint8List bytes)` è un file tenuto in memoria, con il suo percorso dentro il bundle (`campaign.json`, `boards/…`).

L'apertura lancia `BundleException` per un bundle malformato, mancante o più recente, e `NeedsPythonException` sul motore senza Python.

### Membri

| Membro | Tipo | Significato |
| --- | --- | --- |
| `manifest` | `Manifest` | `campaign.json`, riletto a ogni chiamata. Conservalo invece di chiederlo di nuovo. |
| `board(int index)` | `Board` | Una lavagna, per indice in `manifest.boards`. |
| `soundscape(int index)` | `Soundscape` | Un soundscape, per indice in `manifest.soundscapes`. |
| `boardWithId(String id)` | `int?` | L'indice di una lavagna dal suo id; `null` se non ce n'è nessuna. |
| `node(int board, String id)` | `Node?` | Un nodo di una lavagna, per quando una trace ne nomina uno; `null` se non c'è. |
| `validate()` | `List<BundleProblem>` | Tutto ciò che non va nel bundle e che il motore può vedere senza eseguirlo. Ogni `BundleProblem` ha `message` e `location`. |
| `mediaPath(int index)` | `String?` | Il percorso di un medium dentro il bundle; `null` se non esiste un medium simile. |
| `mediaFile(int index)` | `String?` | Il file di un medium su disco, per una campagna aperta da una cartella; altrimenti `null`, e sempre `null` sul web. |
| `mediaBytes(int index)` | `Uint8List?` | I byte di un medium; `null` se non esiste un medium simile (sul web, anche quando i suoi byte non erano tra i file aperti). |
| `folder` | `String?` | La cartella da cui è stata aperta; `null` per un bundle in memoria, e sempre `null` sul web. |
| `handle` | `Pointer<RippleCampaign>` in modo nativo, `JSObject` sul web | L'handle del motore, per una chiamata che il binding non incapsula. Valido finché la campagna non è né rilasciata né raccolta dal garbage collector. |
| `dispose()` | `void` | Libera subito la campagna. Qualsiasi altra chiamata su di essa lancia poi `StateError`. Una seconda chiamata non fa nulla. |

### Manifest

| Campo | Tipo | Significato |
| --- | --- | --- |
| `format` | `int` | Il formato del bundle. |
| `generator` | `String?` | Che cosa ha compilato il bundle. |
| `textFormat` | `String` | `markdown` o `html`: in che cosa è scritto il testo di ogni passaggio. |
| `project` | `Project` | `title`, `description`, `defaultLocale`, `locales` (`List<String>`), `cover` (`String?`). |
| `entries` | `List<int>` | Le lavagne su cui una storia può cominciare, per indice in `boards`. Di solito `entries.first` è `SessionConfig.board`. |
| `boards`, `passages`, `components`, `scripts`, `media`, `machines`, `soundscapes` | `List<Entry>` | Le tabelle del bundle. Un `Entry` è `id`, `name`, `path`. |
| `cvars` | `List<Cvar>` | Le variabili di console che la campagna dichiara: `name`, `type` (`String`), `defaultValue` (`Value`). |
| `needs` | `List<String>` | Di che cosa la campagna ha bisogno dal suo host: `python` quando esegue script. |
| `permissions` | `List<String>` | Ciò che la storia legge del mondo fuori da lei, per nome di wire, `dateTime` e `location` (`PermissionKind.wire`). Li elenca il compilatore, e una sessione chiede di ciascuno prima che la storia cominci. |

### Board e Node

| Record | Campi |
| --- | --- |
| `Board` | `id`, `name`, `start` (`int`), `prime` (`List<int>`), `nodes` (`List<Node>`) |
| `Node` | `id`, `type`, `title`, `inputs` e `outputs` (`List<Port>`), `data` e `metadata` (`Value`) |
| `Port` | `id`, `kind` (`PortKind.control` o `PortKind.data`), `edges` (`List<Edge>`) |
| `Edge` | `node` (`int`), `port` (`int`) |

## Session

Una storia in corso. Ogni verbo risponde con gli effetti a cui ha portato, nell'ordine in cui vengono applicati, con il Turn per ultimo.

### Creare e riprendere

| Factory | Note |
| --- | --- |
| `Session.create(Campaign campaign, SessionConfig config)` | Una nuova sessione, prima del suo primo turno. Chiama `start()` subito dopo. |
| `Session.resume(Campaign campaign, String save, {int seed = 0, SessionOptions? options})` | Una sessione che riprende da un salvataggio — il testo JSON che `pause()` o `checkpoint()` hanno restituito — sulla stessa campagna. Chiama `start()` subito dopo; restituisce il turno su cui si trovava il salvataggio. Un salvataggio la cui lavagna o il cui nodo la campagna non ha più lancia `ResumeException`. |

### SessionConfig

| Campo | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `board` | `int` | obbligatorio | La lavagna, per indice in `manifest.boards`; di solito `manifest.entries.first`. |
| `entryNode` | `String?` | `null` | Un nodo da cui cominciare al posto dell'inizio della lavagna. |
| `locale` | `String?` | `null` | La lingua in cui leggere; `null` per quella predefinita. Una lingua che la campagna non ha viene rifiutata. |
| `seed` | `int` | `0` | I dadi: lo stesso seed e le stesse mosse giocano la stessa storia. |
| `digest` | `String?` | `null` | Il digest del bundle con cui è marcato un salvataggio fatto da questa sessione. |
| `options` | `SessionOptions?` | `null` | `null` equivale a `SessionOptions()`. |

### SessionOptions

`const SessionOptions()` sono i budget e le politiche propri del motore. Cambiane uno con `copyWith(...)`, che accetta ogni campo come argomento nominato facoltativo.

| Campo | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `stepBudget` | `int` | `1048576` | Passi che un'esecuzione può compiere prima di essere fermata; `0` ferma al primo. |
| `silentJumpLimit` | `int` | `64` | Salti silenziosi tra lavagne prima che la storia venga fermata. |
| `loopLimit` | `int` | `512` | Quante volte un ciclo può ripetersi; `0` significa nessun limite. |
| `scriptDeadlineMs` | `int` | `2000` | Per quanto tempo uno script può girare. |
| `scriptMemoryBytes` | `int` | `67108864` | Quanta memoria può usare uno script. |
| `scriptRecursionDepth` | `int` | `200` | Quanto in profondità può ricorrere uno script. |
| `untranslated` | `Untranslated` | `Untranslated.report` | `report`: un passaggio senza testo nella lingua lo dichiara in `Passage.untranslated`. `fallBack`: mostra il testo della lingua predefinita. |
| `trace` | `bool` | `false` | Se ogni batch porta la trace dell'esecuzione, come effetti `Trace`. |
| `tracePayloads` | `bool` | `false` | Se la trace porta i valori che sono passati, e non solo il fatto che siano passati. |

### Verbi

| Verbo | Risponde | Risponde a quale Turn | Note |
| --- | --- | --- | --- |
| `start()` | `List<Effect>` | qualsiasi | Porta la storia al suo primo turno oppure, se ripresa, di nuovo al turno su cui era stata salvata. Finché un tipo in `manifest.permissions` non ha risposta, quel turno è `Permit` e nient'altro. |
| `choose(int index)` | `List<Effect>` | `Show` | La scelta all'indice `index` tra `passage.choices`. Un indice negativo lancia `RangeError`. Una scelta non disponibile lancia `HostException` (`Code.choiceSpent`); un indice oltre la fine, `Code.noSuchChoice`. |
| `leave()` | `List<Effect>` | `Show` | Il lettore lascia il passaggio senza scegliere. |
| `answer(Map<String, Value>? fields)` | `List<Effect>` | `Ask` | I campi del modulo per nome, nell'ordine dato; `null` abbandona il modulo. Un campo facoltativo lasciato vuoto si omette; a un campo con `options` si risponde con gli `id` scelti, un `TextValue` o un `ListValue` di essi. |
| `elapsed()` | `List<Effect>` | `Hold` | Risponde a un'attesa quando il tuo orologio dice che è finita. |
| `beginCountdown()` | `List<Effect>` | `Show` | Il tuo orologio dice che il conto alla rovescia del passaggio mostrato comincia, `ChoiceTimer.afterMs` dopo che il passaggio è stato mostrato. Non muove nulla: il lotto sono le callback che un autore vi ha puntato, e vuoto quando non ce ne sono. `Code.noCountdown` su un passaggio senza. |
| `expire()` | `List<Effect>` | `Show` | Il tuo orologio dice che il conto alla rovescia è scaduto: viene presa la scelta predefinita del passaggio, come la prenderebbe `choose`, e la storia corre fino al suo prossimo Turn. `Code.countdownNotBegun` prima di `beginCountdown`; `Code.noCountdown` su un passaggio senza. |
| `permit(PermissionKind kind, {required bool granted})` | `List<Effect>` | `Permit`, o prima di `start` | La risposta del lettore per un tipo, in qualsiasi momento, anche prima di `start`, ed è così che un host che sa già non mostra mai il turno `Permit`. Su quel turno, la risposta all'ultimo tipo senza risposta fa cominciare la storia. Le risposte non vengono salvate: una sessione ripresa chiede di nuovo. |
| `setLocale(String locale)` | `List<Effect>` | qualsiasi | Cambia la lingua; il turno su cui si trova la storia viene restituito di nuovo in quella lingua: un modulo riformulato con nomi e id mantenuti, un passaggio con il suo conto alla rovescia mantenuto. |
| `restart()` | `List<Effect>` | qualsiasi | Fa ricominciare la storia dal suo primo turno. |
| `stop()` | `List<Effect>` | qualsiasi | Ferma la storia definitivamente. |
| `pause()` | `Paused` | qualsiasi | Mette giù la storia: `save` (`String?`, `null` quando non c'è nulla da salvare) ed `effects`. Mettere in pausa ferma la storia; riprendere è una nuova sessione dal salvataggio. |
| `checkpoint()` | `String?` | | Un salvataggio del turno su cui si trova la storia, senza fermarla; `null` quando non c'è nulla da salvare. |
| `writeCvar(String name, Value value)` | `CvarChange` | | Scrive una variabile di console, convertita al suo tipo. |
| `resetCvar(String name)` | `CvarChange` | | Riporta una variabile di console al suo valore predefinito. |
| `resetAllCvars()` | `List<Effect>` | | Riporta ogni variabile di console al suo valore predefinito. |
| `removeEntity(String key)` | `EntityRemoval` | | Rimuove un'entità dalla storia: `removed` (`bool`) ed `effects`. |
| `consoleFeed(String code)` | `ConsoleResult` | | Esegue una riga di Python nell'interprete della storia, come fa la console dell'editor: `result` (`PythonResult`) ed `effects`. Il motore senza Python risponde che non è disponibile. |

Le letture che un host consegna. Nessuna muove la storia o risponde con effetti:

| Membro | Significato |
| --- | --- |
| `setNow(Moment? now)` | Che ora è; `null` per nessun orologio. Prima di ogni verbo che può avanzare, da un host che ha concesso `PermissionKind.dateTime`; dentro un verbo il tempo non si muove. |
| `setPosition(Position? position)` | L'ultima rilevazione dell'host; `null` per nessuna. Una rilevazione data prima della risposta viene tenuta, e letta solo se è sì. Lancia `HostException` (`Code.notPermitted`) una volta che il lettore ha detto no a `PermissionKind.location`. |
| `setStandIn(PermissionKind kind, String? typed, {int? localOffsetMinutes})` | Il sostituto del lettore per `kind`, come l'ha scritto, detto alla storia ogni volta che manca il valore vero; `null` lo toglie. Un orologio è ISO 8601, e uno scritto senza scostamento viene letto a `localOffsetMinutes`, il fuso di questa macchina nella data scritta se non indicato. Una posizione è `"lat, lon"`, o il nome di un luogo. Uno che non si legge lancia `HostException` (`Code.standIn`), con un messaggio che dice perché. |

| Tipo | Significato |
| --- | --- |
| `PermissionKind` | `dateTime`, `location`, nell'ordine di `RipplePermissionKind`; `wire` è il nome che gli dà il manifest, e `PermissionKind.fromWire(String)` il tipo che un nome nomina, o `null`. |
| `Moment` | Un istante: `utcMs` (millisecondi dall'epoch) e `offsetMinutes` (lo scostamento a cui sta l'orologio del lettore). `Moment(utcMs, offsetMinutes)`, `Moment.of(DateTime)` allo scostamento dell'ora stessa, e `Moment.now()`, l'orologio di questa macchina nel suo fuso. |
| `Position` | Una rilevazione, di cui ogni campo può mancare, modellata sul `GeolocationPosition` del web: `label` (`String?`), `latitude`, `longitude`, `accuracy` (`double?`, l'ultimo in metri), `when` (`Moment?`). |

Un verbo che la storia non stava aspettando lancia `HostException` e non sposta nulla. `CvarChange` porta `outcome` (`CvarWrite.done`, `unknown` o `refused`), `refusal` (la frase, quando rifiutata) ed `effects`.

### Lettori

| Lettore | Tipo | Significato |
| --- | --- | --- |
| `board` | `int` | La lavagna su cui si trova la storia, per indice in `manifest.boards`. |
| `locale` | `String` | La lingua in cui la storia viene letta. |
| `defaultLocale` | `String` | La lingua predefinita della campagna. |
| `ambience` | `Ambience?` | Il soundscape in vigore; `null` per il silenzio. |
| `entities` | `List<Entity>` | Ogni entità che la storia tiene. |
| `memory` | `Memory` | Ciò che la storia ricorda. |
| `cvars` | `List<CvarSnapshot>` | Ogni variabile di console, con il suo valore. |
| `guard` | `GuardReport` | Che cosa ha dovuto fare finora la protezione degli script: `abandoned` (i nodi i cui script sono stati abbandonati), `refused` (`int`), `exhausted` (`bool`). |
| `pythonAvailable` | `bool` | Se questa sessione può eseguire script; `false` sul motore senza Python. |
| `describeCvarWrite(String name, Value value)` | `String?` | Perché scrivere `value` verrebbe rifiutato; `null` se verrebbe accettato. Non scrive nulla. |
| `generator` | `Generator` | Lo stato dei dadi (`lo`, `hi`). Modificabile. |
| `handle` | `Pointer<RippleSession>` in modo nativo, `JSObject` sul web | L'handle del motore, per una chiamata che il binding non incapsula. |

| Setter | Significato |
| --- | --- |
| `setTrace(bool enabled)` | Attiva o disattiva gli effetti `Trace`. |
| `setTracePayloads(bool enabled)` | Attiva o disattiva il payload di un valore tracciato. |
| `generator = Generator(lo, hi)` | Imposta lo stato dei dadi. |
| `dispose()` | Libera subito la sessione. Qualsiasi altra chiamata su di essa lancia poi `StateError`. |

### Salvataggio

Un salvataggio è testo JSON, da `checkpoint()` (la storia prosegue) o da `pause()` (la storia si ferma). Non porta né lo stato dei dadi né la posizione del soundscape: lo stesso seed dà gli stessi lanci futuri, e un soundscape riparte dall'inizio. Per mantenere l'esatta continuazione dei dadi, leggi `generator` dalla vecchia sessione e impostalo su quella ripresa.

```dart
final save = session.checkpoint();           // null unless on a passage or a form
final dice = session.generator;

final resumed = Session.resume(campaign, save!, seed: seed);
resumed.generator = dice;
final batch = resumed.start();               // the passage again
```

## Effetti

`Effect` è una classe sealed. `Turn` e `Over` sono intermedie sealed, quindi uno `switch` su `batch.last` è esaustivo sui sette Turn.

| Effetto | Campi | `isTurn` | `isOver` | Si risponde con |
| --- | --- | --- | --- | --- |
| `Show` | `passage` (`Passage`) | sì | | `choose` o `leave`; quando il suo `timer` scade, `expire` |
| `Ask` | `prompt` (`Prompt`) | sì | | `answer` |
| `Hold` | `ms` (`int`) | sì | | `elapsed`, una volta che il tuo orologio lo dice |
| `Permit` | `kinds` (`List<PermissionKind>`): ciò che la storia legge e a cui nessuno ha risposto, prima che cominci | sì | | `permit`, una volta per tipo; la risposta all'ultimo fa cominciare la storia |
| `Ended` | `title` (`String?`), `ranOut` (`bool`: la storia è rimasta senza strada invece di raggiungere un End) | sì | sì | |
| `Failed` | `message` (`String`), `node` (`String?`) | sì | sì | |
| `Stopped` | | sì | sì | |
| `Trace` | `event` (`RunEvent`) | | | |
| `Callback` | `event` (`CallbackEvent`) | | | |
| `Jumped` | `board` (`int`, per indice in `manifest.boards`), `node` (`String?`) | | | |
| `AmbienceChanged` | `ambience` (`Ambience?`; `null` per il silenzio) | | | |
| `Audio` | `command` (`AudioCommand`) | | | consegnalo a `SoundscapeDriver.apply` |
| `Changed` | `entities` (`List<Entity>?`), `memory` (`Memory?`), `cvars` (`List<CvarSnapshot>?`); un archivio che non si è mosso è `null` | | | |
| `Notice` | `code` (`String`: `I.RT.05` un sostituto, `W.RT.06` un rifiuto, `I.RT.07` niente; la lettera è la gravità), `kind` (`PermissionKind`), `node` (`String?`, il nodo che ha fatto la lettura), `message` (la frase inglese del motore) | | | una lettura del mondo fuori dalla storia che non ha avuto il valore vero, una volta per tipo ed esito in una partita, prima del suo Turn |

`Ended`, `Failed` e `Stopped` estendono `Over`, che estende `Turn`.

### Record

Ogni record è una copia: sopravvive al verbo che l'ha prodotto, alla sessione e alla campagna. I tempi sono sempre in millisecondi.

| Record | Campi |
| --- | --- |
| `Passage` | `node`, `title`, `text` (Markdown, o HTML quando lo dice `manifest.textFormat`), `choices` (`List<Choice>`), `sources` (`List<LocaleText>?`), `snippets` (`List<Snippet>`), `media` (`List<MediaLink>`), `untranslated` (`String?`: la lingua da cui questo passaggio è ricaduto), `soundscape` (`Soundscape?`), `silence` (`bool`), `timer` (`ChoiceTimer?`: il suo conto alla rovescia; `null` quando aspetta il lettore quanto vuole) |
| `ChoiceTimer` | `afterMs` (quanto prima che il conto alla rovescia cominci; zero è subito), `timeoutMs` (quanto scorre una volta cominciato; mai zero), `visible` (`bool`: se l'autore voleva che il lettore lo vedesse scorrere), `defaultChoice` (l'indice nelle scelte del passaggio preso quando scade). Il motore non ne misura nulla. |
| `Choice` | `port`, `text`, `available` (`false` per una scelta che ora non è aperta; disegnala in grigio) |
| `LocaleText` | `locale`, `text` |
| `Snippet` | `code`, `isInline` |
| `MediaLink` | `link` (il nome nel testo), `media` (indice in `manifest.media`) |
| `Prompt` | `node`, `title`, `fields` (`List<PromptField>`) |
| `PromptField` | `name` (il suo ID, la chiave di una risposta), `type` (`String`), `defaultValue` (`Value`: ciò con cui il controllo è riempito; un valore predefinito che nessuno modifica è la risposta), `label` (ciò che viene mostrato al lettore, nella sua lingua: `name` dove l'autore non ha scritto nulla), `placeholder` (il suggerimento disegnato mentre il campo è vuoto; vuoto se non c'è, mai la risposta), `optional` (`bool`: se il lettore può lasciarlo vuoto, che risponde null; un campo obbligatorio non si invia vuoto), `options` (`List<PromptOption>`: le risposte fisse tra cui scegliere, in ordine, una per un tipo scalare e un numero qualsiasi per un `…List`; vuoto per un campo in cui il lettore scrive) |
| `PromptOption` | `id` (ciò con cui risponde un host, uguale in ogni lingua), `label` (ciò che viene mostrato al lettore, nella sua lingua), `value` (`Value`: ciò che viene consegnato alla storia quando è scelto, del tipo del campo) |
| `Ambience` | `soundscape` (`Soundscape`), `board` (`int`), `node` (`String`): il soundscape in vigore e il nodo che lo ha impostato |
| `Entity` | `key`, `component` (`String?`), `label`, `values` (una mappa `Value`, campo per campo) |
| `Memory` | `nodes` (una mappa `Value`, nodo per nodo), `machines` (`List<(String machine, String state)>`, ogni state machine e il suo stato, in ordine) |
| `CvarSnapshot` | `name`, `type`, `defaultValue`, `value` |
| `CallbackEvent` | `callback` (il nome che l'autore le ha dato), `event` (`int`), `eventName` (l'evento, come `cvar.changed`), `board` (`int?`), `node`, `name` (`String?`), `from`, `to` (`Value?`), `index` (`int?`) |
| `AudioCommand` | `kind` (`AudioKind`), `soundscape` (`Soundscape?`, per `play`), `fadeMs` (`play`: la dissolvenza in entrata; `stop`: la dissolvenza in uscita), `media` (`cue`: indice in `manifest.media`), `volume`, `speed`, `node` (`String?`) |
| `Soundscape` | `id`, `name`, `length`, `looping`, `fadeIn`, `fadeOut`, `volume`, `tied`, `tracks` (`List<Track>`) |
| `Track` | `media`, `lane`, `start`, `clipStart`, `clipEnd` (`int?`), `volume`, `speed`, `fadeIn`, `fadeOut`, `mode` (`TrackMode.once`, `looping` o `auto`), `interval` |
| `RunEvent` | `kind` (`RunEventKind`), `run`, `board`, `sequence`, `node`, `step`, `entry`, `primed` (`List<String>`), `enteredVia` (`String?`), `pulled`, `inputs` e `outputs` (`List<TraceValue>`), `outcome` (`int`), `flowed` (`List<String>`), `error` (`String?`), `diagnostic` (`RunDiagnostic?`), `level` (`int`), `message`, `data` (`Value?`), `steps`, `cancelled`, `failedNode` (`String?`). Leggi i campi in base a `kind`. |
| `TraceValue` | `fromNode`, `fromPort`, `toNode`, `toPort` (`String?`), `payload` (`PayloadKind.present`, `withheld` o `absent`), `value` (impostato quando `present`) |
| `RunDiagnostic` | `issue` (`int`, un `RippleRunIssue`; 4 è niente sul collegamento, l'osservazione di partita `W.RT.08`), `message`, `node`, `port` (`String?`), `wires` (`int?`) |
| `PythonResult` | `value` (`Value`), `output` (`String`), `error` (`PythonFailure?`) |
| `PythonFailure` | `kind` (`int`), `exception` (`String?`), `message`, `line` (`int?`), `traceback` (`String?`) |

| Enum | Valori |
| --- | --- |
| `AudioKind` | `play`, `stop`, `cut`, `cue` |
| `RunEventKind` | `runStarted`, `nodeStarted`, `nodeFinished`, `memoHit`, `diagnostic`, `log`, `runFinished` |
| `Untranslated` | `report`, `fallBack` |
| `CvarWrite` | `done`, `unknown`, `refused` |

## Valori

`Value` è una classe sealed con una sottoclasse per ogni tipo. Un Int e un Float non si trasformano mai l'uno nell'altro, e una mappa mantiene l'ordine in cui è stata scritta. I valori sono immutabili e uguali quando contengono la stessa cosa, ordine di una mappa compreso.

| Classe | Campo | Tipo Dart | Note |
| --- | --- | --- | --- |
| `NullValue` | | | Anche `Value.nil`. |
| `BoolValue` | `value` | `bool` | |
| `IntValue` | `value` | `int` | 64 bit; vedi la riga su dart2js in [Cosa cambia sul web](#cosa-cambia-sul-web). |
| `FloatValue` | `value` | `double` | `FloatValue(7)` è `7.0`. `NaN` è uguale a `NaN`. |
| `TextValue` | `value` | `String` | |
| `ListValue` | `items` | `List<Value>` | Non modificabile. |
| `MapValue` | `entries` | `Map<String, Value>` | Non modificabile, nell'ordine di scrittura. |

| Membro | Significato |
| --- | --- |
| `Value.from(Object? dart)` | `null`, `bool`, `int` (un Int), `double` (un Float), `String`, `List`, `Map` con chiavi `String`, o un `Value` così com'è. Qualsiasi altra cosa lancia `ArgumentError`. |
| `isNull` | Se questo è `NullValue`. |
| `operator [](String key)` | Il valore di una mappa sotto `key`, oppure `null` (anche per qualsiasi cosa non sia una mappa). |
| `toStoryText()` | Il valore come lo stampa un passaggio, chiesto al motore. Sul web richiede prima `RippleEngine.load()`. |
| `toString()` | Testo in stile JSON per un log: `7` e `7.0` differiscono. |

```dart
switch (value) {
  case IntValue(:final value): print('a whole number, $value');
  case TextValue(:final value): print('text, $value');
  default: print(value);
}
```

## Player

Il ciclo su una sessione, scritto una volta sola. Consegna ogni effetto in ordine, tiene l'ultimo Turn, risponde a un `Hold` con il proprio orologio quando `update()` lo trova scaduto, fa scorrere allo stesso modo il conto alla rovescia di un passaggio, dice alla sessione l'ora prima di ogni verbo, applica gli effetti `Audio` a un driver, e smista le callback con nome.

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

| Parametro | Significato |
| --- | --- |
| `session` | La sessione da eseguire. Da qui in poi il player ne è il proprietario e la rilascia. |
| `onEffect` | Sente ogni effetto, nell'ordine in cui il motore l'ha prodotto. |
| `onError` | Sente il fallimento di un verbo che il player ha emesso da sé (l'`elapsed` dopo un hold, `beginCountdown` ed `expire` di un conto alla rovescia) e l'eccezione di qualsiasi gestore; la consegna prosegue in entrambi i casi. Senza di esso, il fallimento di un verbo emesso da sé viene lanciato da `update()`, e l'eccezione di un gestore va persa. |
| `audio` | Dove vanno gli effetti `Audio`. Senza, non si sente nulla. |
| `now` | L'orologio, in millisecondi. `Clocks.steady()` se omesso. |
| `countdowns` | Fa scorrere su quell'orologio il conto alla rovescia di un passaggio: `beginCountdown` dopo la sua attesa da quando il passaggio è stato mostrato, `expire` quando scade, misurati da quando ciascuno era dovuto e non dal fotogramma che se n'è accorto. Disattivalo per non offrire al lettore nessun limite di tempo (WCAG 2.2.1), o per dire tu quando. |
| `wallClock` | Che ora è per la storia, passata alla sessione prima di ogni verbo che può avanzare: `Moment.now` per l'orologio del lettore. Senza, la storia non ha orologio, qualunque cosa il lettore abbia consentito. |

| Membro | Tipo | Significato |
| --- | --- | --- |
| `session` | `Session` | La sessione sottostante. Un verbo chiamato su di essa aggira il player. |
| `turn` | `Turn?` | L'ultimo Turn consegnato, oppure, una volta che `permit` ha risposto ad alcuni dei tipi di un turno `Permit`, quel turno senza di essi, così un host chiede ciò che resta. |
| `holdDue` | `int?` | Quando scade l'hold in sospeso, secondo l'orologio del player; `null` se non ce n'è. |
| `countdown` | `Countdown?` | Il conto alla rovescia del passaggio mostrato e a che punto è: `timer` (`ChoiceTimer`), `begun` (`bool`) e `due` (`int`), quando è dovuto il suo prossimo passo secondo l'orologio del player, l'inizio o, una volta cominciato, la fine. Un host che lo disegna mostra `due - now` mentre `begun` e il timer è `visible`. `null` quando il passaggio non ne ha, o quando il player è stato creato con `countdowns: false`. Mantenuto attraverso `setLocale`, che è la stessa visita. |
| `callbackMisses` | `int` | Quante callback sono scattate senza nulla di registrato sotto il loro nome. Non è un fallimento. |
| `start()`, `choose(int index)`, `leave()`, `answer(Map<String, Value>? fields)`, `setLocale(String locale)`, `restart()`, `stop()` | `void` | I verbi della sessione; gli effetti vanno ai gestori. Dopo `dispose()` non fanno nulla. |
| `permit(PermissionKind kind, {required bool granted})` | `void` | La risposta del lettore per un tipo; la risposta all'ultimo che un turno `Permit` ha chiesto fa cominciare la storia. |
| `beginCountdown()` | `void` | Fa cominciare adesso il conto alla rovescia del passaggio mostrato. Il player lo fa da sé a meno che non sia stato creato con `countdowns: false`; chiamato prima, il conto alla rovescia scorre da adesso. |
| `expire()` | `void` | Fa scadere adesso il conto alla rovescia del passaggio mostrato: viene presa la sua scelta predefinita. |
| `pause()` | `String?` | Mette giù la storia e restituisce il suo salvataggio — `null`, senza fermare nulla, a meno che la storia non sia su un passaggio o su un prompt. I suoi effetti vengono consegnati. |
| `update()` | `void` | Chiamalo dal tuo ciclo (l'`update(dt)` di Flame): risponde a un hold il cui momento è arrivato, e fa avanzare un conto alla rovescia quando è il suo momento. |
| `onCallback(String name, handler)` | `void` | Chiama `handler` ogni volta che scatta la callback chiamata `name`, sostituendo qualsiasi gestore sotto quel nome. |
| `removeCallback(String name)` | `void` | Rimuove il gestore sotto `name`. |
| `onAnyCallback(handler)` | `void` | Chiama `handler` per ogni callback che scatta, registrata o no. |
| `clearCallbacks()` | `void` | Rimuove ogni gestore. |
| `dispose()` | `void` | Non consegna più nulla, non muove più la storia, e rilascia la sessione. |

Un verbo del player chiamato dall'interno di un gestore lancia `ReentrantVerbException`: il resto del batch arriverebbe dopo quello nuovo. Chiama il verbo dopo che il gestore è tornato.

## Callback con nome

Una callback dichiarata dall'autore arriva come un effetto `Callback` che porta un `CallbackEvent`, al suo posto nel batch. Con `Player`, registra i gestori per nome, quello dato dall'autore:

```dart
player
  ..onCallback('chapterTwoBegan', (event) => unlock('chapter-two'))
  ..onAnyCallback((event) => log('${event.eventName} ${event.callback}'));
```

| Campo di `CallbackEvent` | Significato |
| --- | --- |
| `callback` | Il nome che l'autore le ha dato, con cui si registra un gestore. |
| `eventName` | L'evento nel vocabolario dell'autore, come `cvar.changed`. |
| `event` | Lo stesso evento come numero del motore. |
| `board`, `node` | Dove è avvenuto, quando l'evento ha un luogo. |
| `name`, `from`, `to`, `index` | Che cosa è cambiato, quando l'evento lo porta. |

Una callback senza nulla di registrato sotto il suo nome viene contata in `Player.callbackMisses`. L'eccezione di un gestore va a `onError`, e la consegna prosegue. Senza `Player`, fai il match di `Callback(:final event)` nel tuo smistamento. Gli eventi e le loro destinazioni sono in [Callback dell'host](/it/reference/host-callbacks/).

## Suono

Il pacchetto non include alcuno speaker. La sessione dice che cosa la storia chiede tramite gli effetti `Audio`; lo scheduler del motore (`Mixer`) decide ogni voce; `SoundscapeDriver` pilota lo scheduler; uno `Speaker` tuo produce il suono. Il contratto completo è [`doc/speaker.md`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration/blob/main/doc/speaker.md).

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

| Opzione | Predefinito | Significato |
| --- | --- | --- |
| `maxCues` | `8` | Al massimo questo numero di cue alla volta. |
| `gainStep` | `0.004` | Un guadagno viene scritto solo se si è mosso di più di questo valore. |
| `muted` | `false` | Parte in muto. |
| `now` | `Clocks.steady()` | L'orologio, in millisecondi. |

| Membro | Tipo | Significato |
| --- | --- | --- |
| `apply(AudioCommand command)` | `void` | Esegue uno dei comandi audio della sessione. Un `cue` il cui medium non ha un percorso viene ignorato. |
| `update()` | `void` | Ascolta ciò che le voci hanno riferito e fa avanzare la timeline. Ogni 25 ms circa è il ritmo dell'editor; ogni frame va bene. |
| `pause()`, `resume()` | `void` | Blocca ogni voce, e la timeline con loro — non la storia — e le lascia riprendere. |
| `muted` | `bool` | Lettura o scrittura. Silenzia subito; lo scheduler scrive ogni guadagno come zero e ricorda il resto. |
| `playing` | `String?` | Il soundscape in vigore, per id: in riproduzione, o in attesa del suo turno. |
| `idle` | `bool` | Se nulla suona, attende o ha cue. |
| `voices` | `int` | Quante voci lo speaker tiene ora aperte. |
| `dispose()` | `void` | Ferma ogni voce che lo speaker tiene, e lo scheduler. |

Il driver aggiunge a `fromMs` (moltiplicato per `rate`) quanto in ritardo è arrivata una voce, riavvolge un loop in ritardo dentro il suo loop, segnala come terminato un clip già finito, informa lo scheduler delle voci terminate o misurate, e riproduce come silenzio le tracce senza file. Un fallimento dello scheduler ferma il suono, non la storia. Non possiede alcun timer: il timer è il tuo ciclo.

`Clock` è `int Function()`, in millisecondi e monotono. `Clocks.steady()` ne è uno costruito su uno `Stopwatch`.

### Speaker e Voice

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

| Membro | Obbligo |
| --- | --- |
| `Speaker.open(source, role, events)` | Restituisci una voce che può cominciare subito, oppure `null` quando il file non può essere riprodotto; `null` viene inteso come silenzio e non viene mai ritentato. Sincrono: con un'API audio asincrona, crea qui il player e avvialo quando è pronto. Tieni `events` insieme alla voce. |
| `Speaker.resolves(source)` | Se lo speaker può riprodurre il medium: viene chiesto prima che un soundscape parta; una traccia che non può essere riprodotta è silenzio fin dall'inizio. Rispondi `true` nel dubbio. |
| `Voice.play(request)` | Comincia subito, sostituendo qualsiasi cosa la voce stesse riproducendo. Può essere richiamato sulla stessa voce, per un letto sonoro continuo che ricomincia il giro. Riproduci da `fromMs` a `toMs`, o fino alla fine del file; con `looping`, arrivare a `toMs` riporta a `loopFromMs`, non a `fromMs`. |
| `Voice.setGain(gain)` | Scrivi un nuovo guadagno, attenuato su pochi millisecondi dove l'API lo consente. |
| `Voice.pause()`, `Voice.resume()` | Blocca la voce esattamente dov'è, e lasciala ripartire. |
| `Voice.stop()` | Termina la voce per sempre e rilascia le sue risorse. Non segue alcun `ended()`. |
| `VoiceEvents.ended()` | Chiamalo una volta per riproduzione, quando una voce non in loop raggiunge la fine di ciò che le è stato dato. Mai dopo `stop()`, mai per una voce in loop. |
| `VoiceEvents.duration(double ms)` | Chiamalo una volta, quando la lunghezza del file è nota. |

Ciascuna delle due chiamate di `VoiceEvents` può arrivare in qualsiasi momento, da qualsiasi callback; il driver la sente al suo `update()` successivo. Una chiamata da una voce fermata, o dopo che il driver è stato rilasciato, viene ignorata.

| Tipo | Campi |
| --- | --- |
| `VoiceSource` | `media` (indice in `manifest.media`), `path` (dentro il bundle), `file` (`String?`: su disco, per una campagna aperta da una cartella). Per una campagna aperta dai suoi file, leggi i byte con `campaign.mediaBytes(source.media)` o dai tuoi asset tramite `source.path`. |
| `VoicePlay` | `fromMs`, `toMs` (`double?`; la fine del file quando `null`), `gain` (da 0 a 1), `rate` (1 è come registrato), `looping`, `loopFromMs` |
| `VoiceRole` | `track` (può durare minuti; di solito meglio in streaming) o `cue` (breve, deve partire in tempo; di solito meglio decodificato per intero) |

**La scala del guadagno è cubica.** Uno speaker che scrive l'ampiezza scrive `gain * gain * gain`.

Sul web uno speaker di solito è Web Audio. Il `@ripplefx/soundscape` del binding JavaScript ha un `WebAudioSpeaker` completo su cui modellarne uno, e lo speaker flame_audio dell'esempio Flame gira nel browser così com'è.

### Mixer

Lo scheduler del motore, grezzo, per un host che non usa il driver: comandi in ingresso, `List<VoiceCommand>` in uscita, con il tuo orologio a ogni verbo. Sul web un `Mixer` creato da solo ha bisogno prima di `RippleEngine.load()`.

`Mixer({int maxCues = 8, double gainStep = 0.004})`

| Membro | Tipo | Significato |
| --- | --- | --- |
| `play(int nowMs, Soundscape scape, {List<int> unresolved = const [], int atMs = 0, bool muted = false})` | `List<VoiceCommand>` | Riproduce un soundscape partendo da `atMs` nella sua timeline, passando il testimone a ciò che sta suonando. Le tracce in `unresolved`, per indice, sono silenzio e non vengono mai ritentate. |
| `stop(int nowMs)` | `List<VoiceCommand>` | Ferma ciò che sta suonando, con una dissolvenza in uscita. |
| `cut(int nowMs)` | `List<VoiceCommand>` | Silenzia tutto subito, cue compresi. |
| `cue(int nowMs, int media, double volume, double speed)` | `List<VoiceCommand>` | Riproduce un cue. |
| `pause(int nowMs)`, `resume(int nowMs)` | `List<VoiceCommand>` | Blocca tutto dov'è, e lo lascia ripartire. |
| `tick(int nowMs)` | `List<VoiceCommand>` | Fa avanzare la timeline: ciò che è in scadenza si apre, le rampe si muovono, ciò che è finito si ferma. |
| `voiceEnded(int nowMs, int voice)` | `List<VoiceCommand>` | La segnalazione dello speaker che una voce ha raggiunto la fine. |
| `durationKnown(int voice, int ms)` | `void` | La segnalazione dello speaker della lunghezza di un file. |
| `muted` | `bool` | Lettura o scrittura. La timeline prosegue, ogni guadagno scritto come 0. |
| `playingId`, `finishingId` | `String?` | Il soundscape in riproduzione, e quello che sfuma sotto di esso. |
| `state` | `Phase?` | La fase del soundscape in riproduzione; `null` se nessuno è in riproduzione. |
| `trackState(int track)` | `Phase` | La fase di una traccia, per indice tra le tracce del soundscape in riproduzione. |
| `positionMs` | `int` | A che punto della sua timeline è il soundscape in riproduzione. |
| `pass` | `int` | Quante volte il soundscape in riproduzione ha fatto il giro. |
| `ranOut` | `bool` | Se ha suonato fino alla fine e non ricomincerà. |
| `isPaused`, `isIdle` | `bool` | In pausa; nulla suona o è in scadenza. |
| `dispose()` | `void` | Libera il mixer. |

| Campo di `VoiceCommand` | Significato |
| --- | --- |
| `kind` | `VoiceKind.open`, `gain`, `stop`, `pause` o `resume` |
| `voice` | L'id della voce. |
| `media`, `role`, `track` | Per `open`: il medium, il `VoiceRole` e l'indice della traccia. |
| `fromMs`, `toMs` (`int?`), `rate`, `looping`, `loopFromMs` | Per `open`: che cosa riprodurre. |
| `gain` | Per `open` e `gain`. |

`Phase` è `queued`, `starting`, `playing`, `finishing` o `finished`.

## Errori

Ogni fallimento riportato dal motore è una `RippleException`, una classe sealed che porta un `Failure`. `code` e `message` vengono letti da esso.

| Eccezione | Codici | Lanciata quando | Si incontra nell'uso |
| --- | --- | --- | --- |
| `BundleException` | `bundleFormat`, `bundleVersion` | Un documento del bundle è malformato, mancante, o di un motore più recente. | sì, all'apertura |
| `NeedsPythonException` | `needsPython` | Il bundle ha bisogno di Python e questo è il motore senza. | sì, all'apertura |
| `ResumeException` | `boardGone`, `nodeGone` | Un salvataggio non può essere riunito a questa campagna: la sua lavagna o il suo nodo non ci sono più. | sì, alla ripresa |
| `HostException` | `wrongTurn`, `noSuchChoice`, `choiceSpent`, `stopped`, `nothingAsked`, `unknownLocale`, `notPermitted`, `standIn`, `noCountdown`, `countdownNotBegun` | Un verbo che la storia non stava aspettando, o una lettura che non accetta: una posizione per un tipo che il lettore ha negato, un sostituto che non si legge, un verbo del conto alla rovescia su un passaggio senza, `expire` prima di `beginCountdown`. Nulla si è mosso. | un bug dell'host, tranne `unknownLocale` e `standIn` quando ciò che è stato dato viene dal lettore |
| `InvalidArgumentException` | `invalidArgument`, e qualsiasi codice sconosciuto | Un argomento malformato. Non è stato fatto nulla. | un bug dell'host |
| `EngineTrapException` | `trap` | Il motore è andato in panic, ora o prima su questo handle. | raro |
| `ReentrantVerbException` | `reentrant` | Un verbo di `Player` chiamato dall'interno di un gestore. | un bug dell'host |

`Code` contiene i numeri del motore: `success` (0), `bundleFormat` (1), `bundleVersion` (2), `needsPython` (3), `wrongTurn` (10), `noSuchChoice` (11), `choiceSpent` (12), `stopped` (13), `nothingAsked` (14), `unknownLocale` (15), `notPermitted` (16), `standIn` (17), `noCountdown` (18), `countdownNotBegun` (19), `boardGone` (20), `nodeGone` (21), `invalidArgument` (-1), `trap` (-2), e il `reentrant` (-100) proprio del binding. `Code.value` è il numero; `Code.of(int)` ne risale al codice.

| Campo di `Failure` | Impostato per |
| --- | --- |
| `code`, `message` | ogni fallimento |
| `location` | `bundleFormat`: il documento in difetto |
| `found`, `supported`, `oldest` | `bundleVersion`: il formato del bundle, il più recente che questo motore legge, il più vecchio quando c'è un limite inferiore |
| `asked`, `answered` | `wrongTurn`: che cosa la storia stava chiedendo, e il verbo che ha risposto |
| `offered`, `chosen` | `noSuchChoice`: quante scelte erano offerte, e l'indice scelto |
| `subject` | la scelta, la lingua, la lavagna o il nodo a cui si riferisce un errore dell'host o di ripresa; per `notPermitted` e `standIn`, il nome `PermissionKind.wire` del tipo |
| `node` | `nodeGone`: il nodo |

Due fallimenti non sono `RippleException`:

| Eccezione | Lanciata quando |
| --- | --- |
| `EngineNotFoundException` (`message`, `cause`) | La libreria del motore non ha potuto essere caricata o collega un altro contratto (in modo nativo: non inclusa, un dispositivo a 32 bit, un `engine_dir` di un altro contratto); sul web, il motore non ha potuto essere scaricato, o non si è atteso `load()`. |
| `StateError` | Qualsiasi chiamata su un `Campaign`, `Session` o `Mixer` rilasciato. |

**Una trap avvelena l'handle**: ogni chiamata successiva su di esso lancia di nuovo `EngineTrapException`. Rilascia la sessione e la campagna, riapri la campagna, e riprendi dall'ultimo checkpoint. Sul web una trap avvelena soltanto la campagna in cui è avvenuta e le sessioni di quella campagna.

## Thread e ciclo di vita

- **L'apertura è l'unico `Future`.** `Campaign.openDirectory`, `Campaign.openFiles` e `RippleEngine.load` sono asincroni; ogni verbo e lettore successivo è sincrono, abbastanza veloce da essere chiamato da un frame.
- **Tutto ciò che un verbo restituisce è una copia.** Effetti, passaggi e valori sono oggetti Dart che sopravvivono alla sessione e alla campagna.
- **`dispose()`** è su `Campaign`, `Session`, `Mixer`, `SoundscapeDriver` e `Player`. Una campagna, una sessione o un mixer mai rilasciati vengono liberati quando vengono raccolti (in modo nativo da un `NativeFinalizer`). Un secondo `dispose()` non fa nulla.
- **Una sessione sopravvive alla sua campagna.** Rilasciare una campagna lascia funzionanti le sue sessioni.
- **Un chiamante alla volta.** Un handle appartiene all'isolate che lo ha creato, e un solo isolate alla volta può usarlo.
- **Il driver e il player non possiedono alcun timer.** Entrambi leggono il `Clock` che è stato dato loro; chiama il loro `update()` dal tuo ciclo. Un hold e un conto alla rovescia vengono risposti da lì, e l'ora che una storia legge è il `wallClock` del player o ciò che passi a `setNow`.

## Un host completo

Un host da terminale su una cartella di bundle. Apre la campagna, la esegue con `Player` con uno speaker e un driver, chiede prima che una storia legga l'orologio o il luogo, disegna in grigio una scelta esaurita, compila un modulo dalle sue etichette e sceglie le sue risposte fisse per id, lascia che `update()` risponda agli hold, registra le callback, fa un checkpoint prima di ogni risposta, e si riprende da una trap riprendendo dall'ultimo checkpoint. Un gioco legge l'input dal proprio ciclo invece che da `stdin`.

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

L'esempio da terminale nel pacchetto (`example/ripplefx_engine_example.dart`) e il gioco Flame in [`example/flame_player`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration/tree/main/example/flame_player), che apre una campagna dai suoi asset con `Campaign.openFiles` e ne riproduce il suono tramite flame_audio, sono programmi completi.

### L'avviso del motore in un'app Flutter

```dart
LicenseRegistry.addLicense(() async* {
  yield LicenseEntryWithLineBreaks(
    ['Ripple Effect Engine'],
    await rootBundle.loadString('assets/ENGINE-NOTICE.txt'),
  );
});
```

L'avviso è il file `NOTICE` nell'archivio del motore, lo stesso testo in ogni archivio di una release.

## Vedi anche

- [Incorporare il motore](/it/explanation/embedding-the-engine/) — perché è l'host a guidare la storia e il motore non richiama mai.
- [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/) — le release del motore, le due varianti e il contratto che un binding fissa.
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/) — i passi da una campagna esportata a un host in esecuzione.
- [Callback dell'host](/it/explanation/host-callbacks/) — a che cosa serve una callback con nome, dal lato dell'autore e dal tuo.
