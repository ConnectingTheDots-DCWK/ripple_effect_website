---
title: Binding C#
description: "Il binding C# del motore di Ripple Effect: i pacchetti NuGet, le varianti e le piattaforme, e ogni tipo pubblico: Campaign, Session, gli effetti, Value, Player, il contratto dello speaker e le eccezioni."
---

Il binding C# è composto da tre pacchetti NuGet: `RippleFx.Engine`, i binding gestiti, e uno dei due pacchetti del motore, `RippleFx.Engine.Native` o `RippleFx.Engine.Native.NoPython`. La versione 1.6.x collega il contratto 1.6 di Ripple Effect, *Grammar Lich*. `MAJOR.MINOR` è il contratto del motore, e `PATCH` è quello del binding. Ogni release del binding fissa una release del motore, `engine-v<version>` del repository pubblico [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases), e i pacchetti del motore contengono esattamente le librerie degli archivi firmati di quella release. Il binding 1.6.0 fissa il motore 1.6.0. Il sorgente è su [ConnectingTheDots-DCWK/ripple_effect_csharp_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration). I binding sono MIT. Il binario del motore che i pacchetti nativi contengono è sotto la [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/), e la sua nota va riprodotta ovunque il tuo prodotto elenchi il software di terze parti che contiene.

Tutto ciò che segue sta nel namespace `RippleFx.Engine`. I tempi sono sempre in millisecondi.

## Pacchetti e installazione

| Pacchetto | Che cos'è | Target |
| --- | --- | --- |
| `RippleFx.Engine` | I binding gestiti: `Campaign`, `Session`, `Effect`, `Value`, i record, le eccezioni, `Mixer`, `ISpeaker` e `IVoice`, `SoundscapeDriver`, `Player`. Nessuna dipendenza. Non contiene il motore. | `netstandard2.1`, `net8.0`; compilato come C# 9 |
| `RippleFx.Engine.Native` | Il motore con il suo interprete Python, nel modo in cui NuGet distribuisce il codice nativo: `runtimes/<rid>/native/`. | ogni runtime identifier elencato in [Piattaforme](#piattaforme) |
| `RippleFx.Engine.Native.NoPython` | Il motore senza Python: circa metà delle dimensioni. | gli stessi |

```sh
dotnet add package RippleFx.Engine
dotnet add package RippleFx.Engine.Native            # with Python
dotnet add package RippleFx.Engine.Native.NoPython   # or without
```

- **Fai riferimento a un solo pacchetto del motore.** Un progetto che li referenzia entrambi non compila, con un errore che nomina tutti e due. Un progetto che non ne referenzia nessuno compila, e la prima chiamata che ha bisogno del motore lancia `EngineNotFoundException`, che nomina i due pacchetti.
- **I pacchetti del motore portano `ENGINE-NOTICE.txt` e `LICENSE-ENGINE.txt`** nella loro radice. `ENGINE-NOTICE.txt` è la nota da riprodurre.
- **`netstandard2.1` e C# 9** sono ciò che Unity compila e carica.
- **Ahead of time.** Ogni firma in `RippleFx.Engine.Interop` è blittable e nulla richiama codice gestito, quindi a runtime non viene generato alcuno stub di marshalling. L'assembly è marcato come compatibile con AOT per `net8.0` (NativeAOT), e lo stesso vale con IL2CPP.
- **Una pubblicazione self-contained o a file singolo** si porta dietro la libreria del motore, come per qualsiasi asset nativo NuGet.
- **`RippleFx.Engine.Interop`** è l'ABI C del motore come P/Invoke, generata da `ripple.h` del motore con i nomi C mantenuti: la classe statica `Native` e le struct e gli enum C. Usala, insieme a `Campaign.DangerousHandle` e `Session.DangerousHandle`, per una chiamata che i binding non incapsulano.

## Scegliere la variante

La variante si sceglie in base al pacchetto del motore che referenzi. Il pacchetto gestito non nomina nessuna delle due.

| | `RippleFx.Engine.Native` | `RippleFx.Engine.Native.NoPython` |
| --- | --- | --- |
| Esegue le schede Script e gli snippet Python | sì | no |
| Una campagna il cui `Manifest.Needs` contiene `python` | viene riprodotta | rifiutata all'apertura con `NeedsPythonException` |
| `RippleEngine.HasPython`, `Session.PythonAvailable` | `true` | `false` |
| `Session.ConsoleFeed` | esegue la riga | risponde con un `PythonFailure` di tipo unavailable |

L'esportazione **Non richiede Python** dell'editor è verificata dal compilatore proprio per l'host `NoPython`.

## Piattaforme

| Runtime identifier | Libreria | Requisiti minimi e note |
| --- | --- | --- |
| `win-x64`, `win-arm64` | `ripple_effect_engine.dll` | Compilata contro la CRT dinamica. |
| `osx-x64`, `osx-arm64` | `libripple_effect_engine.dylib` | macOS 12.0 e successivi. Una libreria per architettura; un'app universale prende entrambi gli identifier. |
| `linux-x64`, `linux-arm64` | libreria condivisa | glibc 2.35 e successive. Non musl: per Alpine non esiste una build del motore. |
| `android-arm64`, `android-x64` | libreria condivisa | API 24 e successive. .NET per Android la impacchetta sotto `lib/arm64-v8a/` e `lib/x86_64/`. |
| `ios-arm64`, `iossimulator-arm64` | `libripple_effect_engine.a`, statica | iOS 13.0 e successivi; il minimo di un runtime del simulatore può alzare il deployment target. I build target del pacchetto collegano l'archivio alla tua app e mantengono ed esportano ogni entry point C, così gli stessi P/Invoke si risolvono attraverso l'immagine principale. Compila un runtime identifier alla volta con `-r`, e non elencarli entrambi in `RuntimeIdentifiers`: una lista che nomina un simulatore fa sì che una build per dispositivo punti al simulatore. |

**Non supportato: .NET nel browser** (`browser-wasm`). La build web del motore per il collegamento nativo richiede Emscripten 4.0 o successivo, mentre il workload `wasm-tools` di .NET collega con un suo Emscripten più vecchio (3.1.34 in .NET 8, 3.1.56 in .NET 10), il cui ottimizzatore rifiuta gli oggetti del motore.

La matrice completa delle build del motore è in [Piattaforme e varianti del motore](/it/reference/engine-targets/).

## Il motore

`RippleEngine` è una classe statica che descrive la libreria caricata da questo processo.

| Membro | Tipo | Che cos'è |
| --- | --- | --- |
| `BoundContract` | `const string` | Il contratto che questi binding collegano: `"1.6"`. |
| `Version` | `string` | La versione della libreria caricata, ad esempio `1.6.0`: quella caricata, non quella con cui si è compilato. |
| `Contract` | `string` | Il contratto che la libreria caricata collega. |
| `HasPython` | `bool` | Se la libreria caricata esegue gli script: `false` per quella `NoPython`. |
| `Outstanding` | `long` | Quante cose il motore ha consegnato e non si è ancora visto restituire. Zero ogni volta che nessuna chiamata è in corso. |
| `EnsureLoaded()` | `void` | Carica la libreria e ne verifica il contratto rispetto a `BoundContract`, una sola volta. Lo chiama il costruttore di ogni handle. Lancia `EngineNotFoundException`. |

## Campaign

Una `Campaign` è un bundle aperto: immutabile, condiviso da ogni sessione creata a partire da essa, e `IDisposable`. Può essere rilasciata prima delle sue sessioni, che continuano a funzionare.

### Apertura

| Factory | Apre | Note |
| --- | --- | --- |
| `Campaign.OpenDirectory(string folder)` | Il bundle nella cartella che contiene `campaign.json`. | I file vengono letti man mano che la storia li richiede, mai da fuori della cartella. |
| `Campaign.OpenFiles(IReadOnlyList<BundleFile> files)` | Un bundle tenuto in memoria: tutti i suoi file, per percorso all'interno del bundle. | I byte vengono copiati. Per un sistema di asset impacchettato, gli asset inclusi in un telefono o una console. |

`BundleFile(string Path, byte[] Bytes)` è un file di un bundle in memoria. Entrambe le factory lanciano `BundleException` per un bundle malformato o prodotto da un motore più recente, e `NeedsPythonException` sul motore `NoPython` per un bundle che richiede Python.

### Membri

| Membro | Risponde | Note |
| --- | --- | --- |
| `Manifest` | `Manifest` | `campaign.json`, riletto a ogni chiamata: conservalo invece di chiederlo di nuovo. |
| `Board(uint index)` | `Board` | Una lavagna, per indice in `Manifest.Boards`. |
| `Soundscape(uint index)` | `Soundscape` | Un soundscape, per indice in `Manifest.Soundscapes`. |
| `BoardWithId(string id)` | `uint?` | L'indice di una lavagna a partire dal suo id; null se non esiste. |
| `Node(uint board, string id)` | `Node?` | Un nodo di una lavagna, per quando una traccia ne nomina uno; null se non esiste. |
| `Validate()` | `IReadOnlyList<BundleProblem>` | Tutto ciò che non va nel bundle e che il motore riesce a vedere senza riprodurlo; vuota se il bundle è a posto. |
| `MediaPath(uint index)` | `string?` | Il percorso di un media all'interno del bundle; null se quel media non esiste. |
| `MediaFile(uint index)` | `string?` | La cartella unita al percorso del media, per una campagna aperta da una cartella; altrimenti null. |
| `MediaBytes(uint index)` | `byte[]?` | I byte di un media; null se quel media non esiste. |
| `Folder` | `string?` | La cartella da cui è stata aperta; null per un bundle in memoria. |
| `DangerousHandle` | `IntPtr` | L'handle del motore. Valido finché la campagna non è né rilasciata né raccolta dal garbage collector. |
| `Dispose()` | | Rilascia l'handle. |

`BundleProblem(string Message, string Location)` è un singolo rilievo di `Validate()`.

### Manifest

| Campo | Tipo | Che cos'è |
| --- | --- | --- |
| `Format` | `long` | Il formato del bundle. |
| `Generator` | `string?` | Chi l'ha compilato; null se non lo dice. |
| `TextFormat` | `string` | `markdown` o `html`: il formato in cui è scritto il testo di un passaggio. |
| `Project` | `Project` | Titolo, descrizione e lingue. |
| `Entries` | `IReadOnlyList<uint>` | Le lavagne da cui una storia può cominciare, per indice in `Boards`. |
| `Boards`, `Passages`, `Components`, `Scripts`, `Media`, `Machines`, `Soundscapes` | `IReadOnlyList<Entry>` | Le tabelle del manifest. |
| `Cvars` | `IReadOnlyList<Cvar>` | Le variabili di console che la campagna dichiara. |
| `Needs` | `IReadOnlyList<string>` | Ciò che la campagna richiede al suo host: `python`, quando esegue script. |
| `Permissions` | `IReadOnlyList<string>` | Ciò che la storia legge del mondo fuori da lei, per nome di wire, `dateTime` e `location`, elencato dal compilatore. Una sessione chiede di ciascuno prima che la storia cominci (`Effect.Permit`). |

| Record | Campi |
| --- | --- |
| `Project` | `Title`, `Description`, `DefaultLocale` (`string`); `Locales` (`IReadOnlyList<string>`); `Cover` (`string?`, il percorso dell'immagine di copertina all'interno del bundle) |
| `Entry` | `Id`, `Name`, `Path` (`string`): una riga di una tabella |
| `Cvar` | `Name`, `Type` (`string`); `Default` (`Value`) |

### Lavagne, nodi e soundscape

| Record | Campi |
| --- | --- |
| `Board` | `Id`, `Name` (`string`); `Start` (`long`); `Prime` (`IReadOnlyList<uint>`); `Nodes` (`IReadOnlyList<Node>`) |
| `Node` | `Id`, `Type`, `Title` (`string`); `Inputs`, `Outputs` (`IReadOnlyList<Port>`); `Data`, `Metadata` (`Value`) |
| `Port` | `Id` (`string`); `Kind` (`PortKind`: `Control`, `Data`); `Edges` (`IReadOnlyList<Edge>`) |
| `Edge` | `Node`, `Port` (`long`) |
| `Soundscape` | `Id`, `Name` (`string`); `Length`, `FadeIn`, `FadeOut` (`long`); `Looping`, `Tied` (`bool`); `Volume` (`double`, predefinito 1.0); `Tracks` (`IReadOnlyList<Track>`) |
| `Track` | `Media` (`long`, per indice nei media del manifest); `Lane`, `Start`, `ClipStart`, `FadeIn`, `FadeOut`, `Interval` (`long`); `ClipEnd` (`long?`); `Volume`, `Speed` (`double`, predefinito 1.0); `Mode` (`TrackMode`: `Once`, `Looping`, `Auto`) |

## Session

Una `Session` è una storia in corso di riproduzione: `IDisposable`, usata da un chiamante alla volta. Ogni verbo risponde con `IReadOnlyList<Effect>`, gli effetti a cui ha portato, nell'ordine in cui vanno applicati, con il turno in fondo.

### Creazione e ripresa

| Factory | Note |
| --- | --- |
| `Session.Create(Campaign campaign, SessionConfig config)` | Una nuova sessione prima del suo primo turno. Chiama subito dopo `Start()`. |
| `Session.Resume(Campaign campaign, string save, ulong seed, SessionOptions? options = null)` | Una sessione che riprende un salvataggio di `Pause()` o `Checkpoint()` sulla stessa campagna. Chiama subito dopo `Start()`; risponde con il turno in cui si trovava il salvataggio. Lancia `ResumeException` quando il salvataggio nomina una lavagna o un nodo che la campagna non ha più. |

### SessionConfig

| Campo | Tipo | Predefinito | Che cos'è |
| --- | --- | --- | --- |
| `Board` | `uint` | `0` | La lavagna, per indice nelle lavagne del manifest: di solito `Manifest.Entries[0]`. |
| `EntryNode` | `string?` | `null` | Un nodo da cui cominciare invece dell'inizio della lavagna. |
| `Locale` | `string?` | `null` | La lingua in cui leggere; null per quella predefinita. Una lingua in cui la campagna non è leggibile viene rifiutata. |
| `Seed` | `ulong` | `0` | Il seed dei dadi: lo stesso seed e le stesse mosse riproducono la stessa storia. |
| `Digest` | `string?` | `null` | Il digest del bundle con cui viene marcato un salvataggio fatto da questa sessione; null per nessuno. |
| `Options` | `SessionOptions?` | `null` | Null equivale a `new SessionOptions()`. |

### SessionOptions

`new SessionOptions()` legge i limiti propri del motore dalla libreria caricata. Imposta solo ciò che intendi cambiare.

| Campo | Tipo | Predefinito | Che cos'è |
| --- | --- | --- | --- |
| `StepBudget` | `uint` | quello del motore | I passi che un'esecuzione può compiere prima di essere fermata; 0 si ferma subito. |
| `SilentJumpLimit` | `uint` | quello del motore | I salti silenziosi tra lavagne prima che la storia venga fermata. |
| `LoopLimit` | `uint` | quello del motore | Quante volte un ciclo può girare; 0 significa nessun tetto. |
| `ScriptDeadlineMs` | `ulong` | quello del motore | Per quanto tempo uno script può girare prima di essere fermato. Ignorato senza Python. |
| `ScriptMemoryBytes` | `ulong` | quello del motore | Quanta memoria può usare uno script. Ignorato senza Python. |
| `ScriptRecursionDepth` | `uint` | quello del motore | Quanto in profondità può ricorrere uno script. Ignorato senza Python. |
| `Untranslated` | `Untranslated` | `Report` | `Report`: un passaggio senza testo nella lingua ha testo vuoto e nomina la lingua in `Passage.Untranslated`. `FallBack`: mostra il testo della lingua predefinita e nomina comunque la lingua. |
| `Trace` | `bool` | `false` | Se il gruppo di effetti di ogni verbo porta la traccia dell'esecuzione come `Effect.Trace`. |
| `TracePayloads` | `bool` | `false` | Se la traccia porta i valori che sono passati, e non solo il fatto che siano passati. |

### Verbi

| Verbo | Risponde | Note |
| --- | --- | --- |
| `Start()` | effetti | Il primo turno, o il turno in cui si trovava un salvataggio ripreso. Finché un tipo in `Manifest.Permissions` è senza risposta, la risposta è `Effect.Permit` e nient'altro. |
| `Choose(int index)` | effetti | Prende la scelta all'indice `index` tra quelle offerte dal passaggio. Un indice negativo lancia `ArgumentOutOfRangeException`. |
| `Leave()` | effetti | Il lettore lascia il passaggio senza scegliere. |
| `Answer(IEnumerable<KeyValuePair<string, Value>>? fields)` | effetti | Risponde al modulo mostrato, campo per campo nell'ordine dato, ciascuno con la chiave del `Name` del campo. Un campo facoltativo lasciato vuoto si omette, o è `Value.Null`; a un campo con `Options` si risponde con gli `Id` scelti. `null` significa che il lettore lascia il modulo. |
| `Elapsed()` | effetti | Risponde a un `Hold` quando il tuo orologio dice che è finito. |
| `BeginCountdown()` | effetti | Il tuo orologio dice che il conto alla rovescia del passaggio mostrato comincia, `ChoiceTimer.AfterMs` dopo che è stato mostrato. Non muove nulla: gli effetti sono solo le callback che un autore vi ha puntato. Una seconda chiamata, o una dopo che il lettore ha scelto, non risponde nulla. Lancia `HostException` con `Code.NoCountdown` su un passaggio senza. |
| `Expire()` | effetti | Il tuo orologio dice che il conto alla rovescia è scaduto: viene presa la `ChoiceTimer.Default` del passaggio come la prenderebbe un lettore. `Code.CountdownNotBegun` prima di `BeginCountdown`; `Code.NoCountdown` su un passaggio senza. |
| `Permit(PermissionKind kind, bool granted)` | effetti | La risposta del lettore per un tipo, in qualsiasi momento, anche prima di `Start`, quando non risponde nulla. Su un turno `Effect.Permit`, la risposta all'ultimo tipo senza risposta fa cominciare la storia. Le risposte non fanno parte di un salvataggio: a una sessione ripresa si risponde di nuovo. |
| `SetLocale(string locale)` | effetti | Cambia la lingua; il turno in cui si trova la storia viene risposto di nuovo in quella lingua: un modulo riformulato con nomi e `Id` mantenuti, un passaggio con il suo conto alla rovescia mantenuto. |
| `Restart()` | effetti | Fa ricominciare la storia dal suo primo turno. |
| `Stop()` | effetti | Ferma la storia per sempre. |
| `Pause()` | `Paused` | Mette giù la storia: il suo salvataggio e ciò che la pausa ha fatto. La pausa ferma la storia; riprendere significa una nuova sessione dal salvataggio. |
| `Checkpoint()` | `string?` | Un salvataggio del turno in cui si trova la storia, senza fermarla; null se non c'è nulla da salvare. |
| `ConsoleFeed(string code)` | `ConsoleResult` | Esegue una riga di Python nell'interprete della storia, come fa la console dell'editor. |
| `WriteCvar(string name, Value value)` | `CvarChange` | Scrive una variabile di console. |
| `ResetCvar(string name)` | `CvarChange` | Riporta una variabile di console al suo valore predefinito. |
| `ResetAllCvars()` | effetti | Riporta ogni variabile di console al suo valore predefinito. |
| `RemoveEntity(string key)` | `EntityRemoval` | Rimuove un'entità dalla storia. |

Le letture che un host consegna. Nessuna muove la storia o risponde con effetti:

| Membro | Che cosa fa |
| --- | --- |
| `SetNow(Moment? now)` | Che ora è; null per nessun orologio. Prima di ogni verbo che può avanzare, da un host che ha concesso `PermissionKind.DateTime`; dentro un verbo il tempo non si muove. |
| `SetPosition(Position? position)` | L'ultima rilevazione dell'host; null per nessuna. Una rilevazione consegnata prima che il lettore rispondesse viene tenuta, e letta solo se la risposta è sì. Lancia `HostException` con `Code.NotPermitted` una volta negata la posizione. |
| `SetStandIn(PermissionKind kind, string? typed, int localOffsetMinutes)` | Il sostituto del lettore per un tipo, come l'ha scritto, che risponde ogni volta che manca il valore vero; null lo toglie. Un'ora è ISO 8601 (`2026-10-19T18:30:00+02:00`, o una data sola per la sua mezzanotte), letta a `localOffsetMinutes` quando è scritta senza scostamento: passa quello del lettore per quella data. Una posizione è `"lat, lon"` in gradi decimali, o qualsiasi altra cosa come nome di un luogo. Lancia `HostException` con `Code.StandIn`, dicendo perché, per uno che non si legge. |

| Tipo | Che cos'è |
| --- | --- |
| `PermissionKind` | `enum : uint`: `DateTime` (`dateTime`), `Location` (`location`), numerati come il `RipplePermissionKind` dell'header. Aperto ad aggiunte: un tipo che questo binding non nomina arriva come il suo numero. |
| `PermissionKinds` | `Wire(this PermissionKind)`, il nome di wire (un tipo che questo binding non nomina, come il suo numero), e `FromWire(string)`, il tipo che un nome di wire nomina, o null. |
| `Moment(long UtcMs, int OffsetMinutes)` | Un istante: millisecondi dall'epoch Unix, e lo scostamento in minuti a cui sta l'orologio del lettore. `Moment.Of(DateTimeOffset)`, `Moment.Now()` (l'orologio di questa macchina al suo scostamento) e `ToDateTimeOffset()`. |
| `Position` | Una rilevazione, di cui ogni parte può mancare, modellata sul `GeolocationPosition` del web: `Label` (`string?`), `Latitude`, `Longitude`, `Accuracy` (`double?`, l'ultimo in metri), `When` (`Moment?`). |

| Record di risultato | Campi |
| --- | --- |
| `Paused` | `Save` (`string?`, JSON; null quando non c'era nulla da salvare); `Effects` |
| `CvarChange` | `Outcome` (`CvarWrite`: `Done`, `Unknown`, `Refused`); `Refusal` (`string?`, la frase quando rifiutata); `Effects` |
| `EntityRemoval` | `Removed` (`bool`); `Effects` |
| `ConsoleResult` | `Result` (`PythonResult`); `Effects` |
| `PythonResult` | `Value` (`Value`); `Output` (`string`); `Error` (`PythonFailure?`) |
| `PythonFailure` | `Kind` (`uint`: 0 Python, 1 timeout, 2 rifiutato, 3 chiuso, 4 errore dell'host, 5 non disponibile); `Exception` (`string?`, il tipo dell'eccezione per il tipo 0); `Message` (`string`); `Line` (`uint?`); `Traceback` (`string?`) |

Ogni campo `Effects` è una `IReadOnlyList<Effect>` da smistare come la risposta di qualsiasi verbo.

### Letture

| Membro | Tipo | Che cos'è |
| --- | --- | --- |
| `Board` | `uint` | La lavagna su cui si trova la storia, per indice nelle lavagne del manifest. |
| `Locale` | `string` | La lingua in cui la storia viene letta. |
| `DefaultLocale` | `string` | La lingua predefinita della campagna. |
| `Ambience` | `Ambience?` | Il soundscape in vigore; null per il silenzio. |
| `Entities` | `IReadOnlyList<Entity>` | Ciò che la storia ha creato. |
| `Memory` | `Memory` | L'archivio proprio della storia. |
| `Cvars` | `IReadOnlyList<CvarSnapshot>` | Ogni variabile di console e il suo valore. |
| `Guard` | `GuardReport` | Ciò che la guardia degli script ha dovuto fare finora: `Abandoned` (`IReadOnlyList<string>`, i nodi i cui script sono stati abbandonati), `Refused` (`uint`), `Exhausted` (`bool`). |
| `PythonAvailable` | `bool` | Se questa sessione può eseguire script: `false` sul motore `NoPython`. |
| `DescribeCvarWrite(string name, Value value)` | `string?` | Perché la scrittura verrebbe rifiutata; null se non lo sarebbe. Non scrive nulla. |
| `SetTrace(bool enabled)` | `void` | Attiva o disattiva `Effect.Trace`. |
| `SetTracePayloads(bool enabled)` | `void` | Attiva o disattiva i payload tracciati. |
| `DangerousHandle` | `IntPtr` | L'handle del motore, per una chiamata che i binding non incapsulano. |

### Salvataggio e generatore

- Un salvataggio è testo JSON. Conservalo insieme al seed e alla lingua.
- Un salvataggio non porta con sé lo stato del generatore né la posizione del soundscape: lo stesso seed dà gli stessi lanci futuri, e un soundscape riparte dall'inizio alla ripresa.
- `Generator` (get e set) è lo stato dei dadi, `Generator(uint Lo, uint Hi)`. Leggilo prima di salvare e impostalo sulla sessione ripresa perché i dadi proseguano esattamente.

## Effetti

`Effect` è un record astratto con un insieme chiuso di record sealed annidati, così `Effect.Trace` non entra mai in collisione con `System.Diagnostics.Trace`. Ogni effetto è una copia: nulla al suo interno punta dentro il motore, e sopravvive alla sessione e alla campagna.

| Membro | Che cos'è |
| --- | --- |
| `IsTurn` | `true` per un turno: dove si trova ora la storia, `Show`, `Ask`, `Hold`, `Permit`, `Ended`, `Failed` o `Stopped`. Esattamente uno chiude ogni gruppo di effetti che ha mosso la storia. |
| `IsOver` | `true` per `Ended`, `Failed` e `Stopped`. |

### Turni

| Effetto | Campi | Si risponde con |
| --- | --- | --- |
| `Effect.Show` | `Passage` (`Passage`) | `Choose` o `Leave`; quando porta un `Passage.Timer`, anche dal tuo orologio con `BeginCountdown` ed `Expire` |
| `Effect.Ask` | `Prompt` (`Prompt`) | `Answer` |
| `Effect.Hold` | `Ms` (`ulong`) | `Elapsed`, una volta che il tuo orologio dice che sono passati `Ms` |
| `Effect.Permit` | `Kinds` (`IReadOnlyList<PermissionKind>`): ciò che la storia legge e a cui nessuno ha risposto, prima che cominci | `Permit`, una volta per tipo; la risposta all'ultimo fa cominciare la storia |
| `Effect.Ended` | `Title` (`string?`); `RanOut` (`bool`, true quando la storia ha finito la strada anziché raggiungere una scheda End) | niente; `IsOver` |
| `Effect.Failed` | `Message` (`string`); `Node` (`string?`) | niente; `IsOver` |
| `Effect.Stopped` | nessuno | niente; `IsOver` |

### Lungo il percorso

| Effetto | Campi | Che cos'è |
| --- | --- | --- |
| `Effect.Jumped` | `Board` (`uint`); `Node` (`string?`) | La storia si è spostata su un'altra lavagna, per indice nelle lavagne del manifest. |
| `Effect.AmbienceChanged` | `Ambience` (`Ambience?`) | Il soundscape ora in vigore; null per il silenzio. Un fatto per un HUD o una schermata di salvataggio, non un comando per lo speaker. |
| `Effect.Audio` | `Command` (`AudioCommand`) | Un comando per il suono: passalo a `SoundscapeDriver.Apply`. |
| `Effect.Changed` | `Entities` (`IReadOnlyList<Entity>?`); `Memory` (`Memory?`); `Cvars` (`IReadOnlyList<CvarSnapshot>?`) | Quali archivi si sono mossi; un archivio che non si è mosso è null. Il primo `Changed` dopo `Start` nomina tutti e tre. |
| `Effect.Callback` | `Event` (`CallbackEvent`) | Una callback con nome dichiarata dall'autore, scattata. |
| `Effect.Trace` | `Event` (`RunEvent`) | Un evento della traccia dell'esecuzione, quando la sessione traccia. |
| `Effect.Notice` | `Code` (`string`); `Kind` (`PermissionKind`); `Node` (`string?`); `Message` (`string`) | Una lettura del mondo fuori dalla storia che non ha avuto il valore vero, una volta per tipo ed esito in una partita, prima del turno del verbo che l'ha letta. `Code` è `I.RT.05` un sostituto, `W.RT.06` un rifiuto, `I.RT.07` niente, e la sua lettera è la gravità; `Node` è il nodo che ha fatto la lettura; `Message` è la frase inglese del motore. |

### Record

| Record | Campi |
| --- | --- |
| `Passage` | `Node`, `Title` (`string`); `Text` (`string`, Markdown, o HTML quando lo dice `Manifest.TextFormat`); `Choices` (`IReadOnlyList<Choice>`); `Sources` (`IReadOnlyList<LocaleText>?`, il testo in ogni lingua quando il compilatore le ha conservate); `Snippets` (`IReadOnlyList<Snippet>`); `Media` (`IReadOnlyList<MediaLink>`); `Untranslated` (`string?`, la lingua in cui manca il testo); `Soundscape` (`Soundscape?`, quello nominato dal passaggio); `Silence` (`bool`, true quando il passaggio chiede il silenzio); `Timer` (`ChoiceTimer?`, il suo conto alla rovescia; null quando aspetta il lettore quanto vuole) |
| `ChoiceTimer` | `AfterMs` (`ulong`, quanto prima che il conto alla rovescia cominci; zero è subito); `TimeoutMs` (`ulong`, quanto scorre una volta cominciato; mai zero); `Visible` (`bool`, se l'autore voleva che il lettore lo vedesse scorrere); `Default` (`int`, l'indice nelle scelte del passaggio preso quando scade). Il motore non ne misura nulla. |
| `Choice` | `Port` (`string`, l'uscita di controllo da cui il flusso parte); `Text` (`string`); `Available` (`bool`, false per una scelta non aperta ora; viene mostrata comunque, e sceglierla lancia `HostException` con `Code.ChoiceSpent`) |
| `LocaleText` | `Locale`, `Text` (`string`) |
| `Snippet` | `Code` (`string`); `IsInline` (`bool`) |
| `MediaLink` | `Link` (`string`, il nome con cui l'autore l'ha collegato); `Media` (`uint`, per indice nei media del manifest) |
| `Prompt` | `Node`, `Title` (`string`); `Fields` (`IReadOnlyList<PromptField>`) |
| `PromptField` | `Name` (`string`, la chiave di una risposta); `Type` (`string`: `number`, `bool`, `string`, `numberList`, `boolList`, `stringList` o `json`); `Default` (`Value`, ciò con cui il controllo è riempito, e la risposta se nessuno lo modifica); `Label` (`string`, ciò che viene mostrato al lettore, nella sua lingua: il nome dove l'autore non ha scritto nulla); `Placeholder` (`string`, il suggerimento disegnato mentre il campo è vuoto; vuoto se non c'è, mai la risposta); `Optional` (`bool`, se il lettore può lasciarlo vuoto, che risponde null; un campo obbligatorio non si invia vuoto); `Options` (`IReadOnlyList<PromptOption>`, le risposte fisse tra cui scegliere, in ordine: una per un tipo scalare, un numero qualsiasi per un `…List`; vuoto per un campo in cui il lettore scrive). Rispondi con il tipo corrispondente, o con gli `Id` delle opzioni scelte. |
| `PromptOption` | `Id` (`string`, ciò con cui risponde un host; uguale in ogni lingua); `Label` (`string`, ciò che viene mostrato al lettore, nella sua lingua); `Value` (`Value`, ciò che viene consegnato alla storia quando è scelto, del tipo del campo) |
| `Ambience` | `Soundscape` (`Soundscape`); `Board` (`uint`); `Node` (`string`, il nodo che l'ha impostato) |
| `Entity` | `Key`, `Label` (`string`); `Component` (`string?`); `Values` (`Value`, una mappa, campo per campo) |
| `Memory` | `Nodes` (`Value`, una mappa, nodo per nodo); `Machines` (`IReadOnlyList<KeyValuePair<string, string>>`, ogni state machine e lo stato in cui si trova) |
| `CvarSnapshot` | `Name`, `Type` (`string`); `Default`, `Value` (`Value`) |
| `CallbackEvent` | `Callback` (`string`, il nome con cui è registrato un gestore); `Event` (`uint`, un `RippleCallbackKind`); `EventName` (`string`, ad esempio `cvar.changed`); `Board` (`uint?`); `Node`, `Name` (`string?`); `From`, `To` (`Value?`); `Index` (`uint?`). Quali campi opzionali sono impostati dipende dall'evento. |
| `AudioCommand` | `Kind` (`AudioKind`: `Play`, `Stop`, `Cut`, `Cue`); `Soundscape` (`Soundscape?`, Play: che cosa riprodurre); `FadeMs` (`ulong`, Play: la dissolvenza in entrata, Stop: quella in uscita); `Media` (`uint`, Cue: il media); `Volume`, `Speed` (`double`, predefinito 1.0); `Node` (`string?`, Cue: il nodo che l'ha richiesto) |
| `RunEvent` | `Kind` (`RunEventKind`: `RunStarted`, `NodeStarted`, `NodeFinished`, `MemoHit`, `Diagnostic`, `Log`, `RunFinished`); `Run`, `Board`, `Sequence`, `Step`, `Steps` (`uint`); `Node`, `Entry`, `Message` (`string`); `Primed`, `Flowed` (`IReadOnlyList<string>`); `EnteredVia`, `Error`, `FailedNode` (`string?`); `Pulled`, `Cancelled` (`bool`); `Inputs`, `Outputs` (`IReadOnlyList<TraceValue>`); `Outcome` (`uint`: 0 riuscito, 1 fallito); `Diagnostic` (`RunDiagnostic?`); `Level` (`uint`: 0 debug, 1 info, 2 warning, 3 error); `Data` (`Value?`). Leggi i campi in base a `Kind`. |
| `TraceValue` | `FromNode`, `FromPort` (`string`); `ToNode`, `ToPort` (`string?`); `Payload` (`PayloadKind`: `Present`, `Withheld`, `Absent`); `Value` (`Value`, impostato quando `Payload` è `Present`) |
| `RunDiagnostic` | `Issue` (`uint`: 0 flusso ambiguo, 1 più ingressi, 2 produttore non eseguito, 3 rientrato, 4 niente sul collegamento, l'osservazione di partita `W.RT.08`); `Message` (`string`); `Node`, `Port` (`string?`); `Wires` (`uint?`) |

I tipi `uint` corrispondono agli enum con lo stesso nome in `RippleFx.Engine.Interop`, come `RippleCallbackKind` e `RippleRunIssue`.

## Valori

`Value` è una classe sealed e immutabile: un valore di una storia. `ValueKind` è `Null`, `Bool`, `Int`, `Float`, `Text`, `List` o `Map`.

| C# | Valore della storia | Come crearne uno | Come leggerlo |
| --- | --- | --- | --- |
| nessuno | null | `Value.Null` | `IsNull` |
| `bool` | Bool | `Value.Bool(b)`, o implicito da `bool` | `AsBool()` |
| `long` | Int | `Value.Int(n)`, o implicito da `int` o `long` | `AsInt()` |
| `double` | Float | `Value.Float(x)`, o implicito da `double` | `AsFloat()` |
| `string` | Text | `Value.Text(s)`, o implicito da `string` (`null` diventa `Value.Null`) | `AsText()` |
| `IReadOnlyList<Value>` | List | `Value.List(IEnumerable<Value>)`, `Value.List(params Value[])` | `AsList()` |
| `IReadOnlyList<KeyValuePair<string, Value>>` | Map | `Value.Map(IEnumerable<KeyValuePair<string, Value>>)`, `Value.Map(params (string Key, Value Value)[])` | `AsMap()`, `Find(key)` |

- **Un Int e un Float non diventano mai l'uno l'altro.** `7` e `7.0` sono valori diversi, e `ToString()` li stampa in modo diverso.
- **Una mappa conserva l'ordine in cui è stata scritta**, e la sua uguaglianza include quell'ordine. Una chiave di mappa non è mai null.
- **Un elemento o un valore di mappa null diventa `Value.Null`.**
- `AsBool()`, `AsInt()` e gli altri lanciano `InvalidOperationException` per un valore di un altro tipo.
- `Find(string key)` risponde con il valore di una mappa sotto quella chiave, o null per una chiave mancante o per un valore che non è una mappa.
- `Equals` e `==` confrontano ciò che è contenuto; un valore implementa `IEquatable<Value>`.
- `ToString()` è testo simil-JSON per un log o un debugger. `ToStoryText()` chiede al motore il testo che un passaggio stamperebbe.

## Player

`Player` è il ciclo che sta sopra una sessione, scritto una volta sola: `IDisposable`, non possiede né un orologio né un thread.

```csharp
public Player(Session session, PlayerHandlers handlers, Func<ulong>? now = null)
```

Da quel momento il player possiede `session` e la rilascia. `now` è l'orologio in millisecondi; `Clocks.Steady()` quando è null.

### PlayerHandlers

| Campo | Tipo | Che cos'è |
| --- | --- | --- |
| `OnEffect` | `Action<Effect>?` | Ogni effetto, nell'ordine in cui il motore l'ha prodotto. |
| `OnError` | `Action<Exception>?` | Il fallimento di un verbo che il player ha eseguito da sé (l'`Elapsed` dopo un hold), o un'eccezione di un gestore. La consegna prosegue in entrambi i casi. Senza di esso, il fallimento di un verbo eseguito dal player viene lanciato da `Update()` e quello di un gestore va perso. |
| `Audio` | `SoundscapeDriver?` | Dove va il suono della storia: il player applica a esso ogni `Effect.Audio`. Senza, non si sente nulla. |
| `Countdowns` | `bool`, predefinito `true` | Se il player fa scorrere sul suo orologio il conto alla rovescia di un passaggio, facendolo cominciare e scadere da `Update()`. False per un lettore che ha chiesto nessun limite di tempo (WCAG 2.2.1), o per un host che li fa scorrere da sé con `BeginCountdown` ed `Expire`. |
| `Now` | `Func<Moment?>?` | Che ora è per la storia, passata a `Session.SetNow` prima di ogni verbo che il player esegue o gli viene chiesto, per un host che ha concesso `PermissionKind.DateTime`. `Moment.Now` è quella di questa macchina. Senza, la storia non ha orologio a meno che l'host non lo imposti sulla sessione. |

### Membri

| Membro | Che cosa fa |
| --- | --- |
| `Start()`, `Choose(int)`, `Leave()`, `Answer(fields)`, `SetLocale(string)`, `Restart()`, `Stop()` | I verbi della sessione. Il player consegna il gruppo di effetti a cui rispondono invece di restituirlo. Dopo `Dispose` non fanno nulla. |
| `Permit(PermissionKind, bool)` | La risposta del lettore per un tipo; la risposta all'ultimo chiesto fa cominciare la storia. |
| `BeginCountdown()` | Fa cominciare adesso il conto alla rovescia del passaggio mostrato, per un host che fa scorrere da sé i conti alla rovescia; con `Countdowns` attivo, il player poi lo fa scadere sul suo orologio. |
| `Expire()` | Fa scadere adesso il conto alla rovescia del passaggio mostrato: viene presa la sua scelta predefinita. |
| `Pause()` | Mette giù la storia e risponde con il suo salvataggio, `string?`. Null, e nulla viene fermato, a meno che la storia non sia su un passaggio o un prompt. |
| `Update()` | Chiamalo dal tuo ciclo. Risponde con `Elapsed()` a un hold il cui momento è arrivato, e fa cominciare o scadere un conto alla rovescia il cui momento è arrivato. |
| `Turn` | `Effect?`: l'ultimo turno consegnato; null prima di `Start()`. |
| `HoldDue` | `ulong?`: quando scade l'hold in attesa secondo l'orologio del player; null se non ce n'è. |
| `CountdownBegins` | `ulong?`: quando comincia il conto alla rovescia del passaggio mostrato, secondo l'orologio del player; null quando è già cominciato, o non ce n'è nessuno da far scorrere. |
| `CountdownExpires` | `ulong?`: quando scade il conto alla rovescia, secondo l'orologio del player, una volta cominciato; null altrimenti. Un host che disegna un `ChoiceTimer` visibile conta alla rovescia fino a questo. |
| `Session` | La sessione sottostante, per ciò che il player non incapsula. Un verbo chiamato su di essa aggira il player e il suo gruppo di effetti non viene consegnato. |
| `OnCallback`, `RemoveCallback`, `OnAnyCallback`, `ClearCallbacks`, `CallbackMisses` | La tabella delle callback: [Callback con nome](#callback-con-nome). |
| `Dispose()` | Non consegna più nulla, non muove più la storia, e rilascia la sessione. |

### Consegna di un gruppo di effetti

Per ogni effetto, nell'ordine, il player:

1. lo registra come `Turn` se è un turno;
2. applica un `Effect.Audio` a `Audio`;
3. smista un `Effect.Callback` attraverso la tabella delle callback;
4. chiama `OnEffect`.

Quando il gruppo termina con `Effect.Hold`, `HoldDue` viene impostato all'orologio più `Ms`, e il successivo `Update()` a quel momento o dopo chiama `Elapsed()`. Quando termina con un `Effect.Show` il cui passaggio porta un `Timer`, e `Countdowns` è attivo, `CountdownBegins` viene impostato all'orologio più `AfterMs`; l'`Update()` a quel momento o dopo chiama `BeginCountdown()` e imposta `CountdownExpires` al momento in cui era dovuto più `TimeoutMs`, così un fotogramma lento non allunga il conto alla rovescia, e l'`Update()` a quel momento o dopo chiama `Expire()`.

**Un verbo che ha mosso la storia cancella un hold in attesa e un conto alla rovescia in corso.** Uno rifiutato dal motore, e uno che non ha risposto nulla, non hanno mosso nulla: un permit dopo che la storia è cominciata, un cambio di lingua su un hold, un secondo start. L'hold e il conto alla rovescia che aspettava restano dovuti. Un cambio di lingua mantiene un conto alla rovescia anche quando risponde, perché il passaggio mostrato di nuovo è la stessa visita.

Con `Now` impostato, ogni verbo che il player esegue o gli viene chiesto è preceduto da `Session.SetNow(Now())`.

**Un verbo chiamato dall'interno di un gestore** lancia `ReentrantVerbException` (`Code.Reentrant`): il resto del gruppo arriverebbe dopo quello nuovo. Metti il verbo in coda e chiamalo dopo che il gestore è tornato.

## Callback con nome

L'autore dichiara il nome e l'evento di una callback; tu registri un gestore su quel nome nel `Player`. Il motore non vede mai la tabella.

| Membro | Che cosa fa |
| --- | --- |
| `OnCallback(string name, Action<CallbackEvent> handler)` | Chiama `handler` ogni volta che scatta la callback di nome `name`, sostituendo l'eventuale gestore già presente con quel nome. I nomi si confrontano in modo ordinale. |
| `RemoveCallback(string name)` | Rimuove il gestore sotto `name`. |
| `OnAnyCallback(Action<CallbackEvent> handler)` | Chiama `handler` per ogni callback che scatta, registrata o no. Si aggiunge a quelli già presenti. |
| `ClearCallbacks()` | Rimuove ogni gestore con nome e ogni gestore generico. |
| `CallbackMisses` | `long`: quante callback sono scattate senza nulla registrato sotto il loro nome. |

- **Un gestore è di sola lettura.** Non può cambiare ciò che fa la storia; la storia prosegue identica anche senza nessuno in ascolto.
- **Un mancato abbinamento è ordinario**, non un fallimento: viene contato in `CallbackMisses` e la consegna prosegue.
- **Un gestore che lancia un'eccezione** viene assorbito: l'eccezione va a `OnError`, e il resto del gruppo viene comunque consegnato.
- **Un gestore gira dentro il verbo**, sul thread che l'ha chiamato, e non può chiamare un verbo (vedi [Player](#player)).
- **Il nome è l'unico legame** tra la dichiarazione dell'autore e il tuo codice. Un cambio di nome da parte dell'autore rompe l'abbinamento senza alcuna diagnostica.

Un host che non usa `Player` legge `Effect.Callback` dal gruppo di effetti e cerca `Event.Callback` in una tabella propria.

## Suono

Non viene fornito alcuno speaker. La sessione dice ciò che la storia chiede come `Effect.Audio`; lo scheduler del motore (`Mixer`) decide ogni voce; `SoundscapeDriver` guida lo scheduler; il tuo `ISpeaker` produce il suono. Il contratto è [`docs/speaker.md`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration/blob/main/docs/speaker.md).

### AudioCommand

| `Kind` | Campi usati | Che cosa chiede |
| --- | --- | --- |
| `Play` | `Soundscape`, `FadeMs` (dissolvenza in entrata) | Riprodurre un soundscape. |
| `Stop` | `FadeMs` (dissolvenza in uscita) | Fermare il soundscape. |
| `Cut` | nessuno | Fermare tutto subito, cue compresi. |
| `Cue` | `Media`, `Volume`, `Speed`, `Node` | Riprodurre un suono una volta. |

### SoundscapeDriver

```csharp
public SoundscapeDriver(Campaign campaign, ISpeaker speaker, SoundscapeOptions? options = null)
```

| Campo di `SoundscapeOptions` | Tipo | Predefinito | Che cos'è |
| --- | --- | --- | --- |
| `MaxCues` | `uint` | `8` | Quanti cue possono suonare insieme; il più vecchio cede il posto. |
| `GainStep` | `double` | `0.004` | La più piccola variazione di guadagno che valga un comando di guadagno. |
| `Muted` | `bool` | `false` | Parte in muto. |
| `Now` | `Func<ulong>?` | `null` | L'orologio in millisecondi; `Clocks.Steady()` quando è null. |

| Membro | Che cosa fa |
| --- | --- |
| `Apply(AudioCommand command)` | Esegue uno dei comandi audio della sessione. Un `Play` senza soundscape, e un `Cue` il cui media non ha un percorso, vengono ignorati. |
| `Update()` | Chiamalo dal tuo ciclo: ascolta ciò che le voci hanno segnalato e fa avanzare la timeline. L'editor fa un tick ogni 25 ms, e farlo più spesso non fa perdere nulla. |
| `Pause()`, `Resume()` | Trattiene ogni voce e, con loro, la timeline, e poi le lascia andare. Non mette in pausa la storia. |
| `Muted` | `bool`, get e set: mette o toglie il muto subito. Lo scheduler scrive ogni guadagno a zero e ricorda il resto. |
| `Playing` | `string?`: il soundscape in vigore, per id, che suona o attende il suo turno. |
| `Idle` | `bool`: se nulla suona, attende o ha cue. |
| `Voices` | `int`: quante voci lo speaker tiene aperte ora. |
| `Dispose()` | Ferma ogni voce che lo speaker tiene, e con loro lo scheduler. |

Il driver fa ciò che lo scheduler chiede a un host, quindi uno speaker non deve farlo: il tick, una voce in ritardo (il tempo che `Open` ha impiegato, moltiplicato per `Rate`, viene aggiunto a `FromMs`, e una clip in loop si avvolge dentro il suo loop; una clip già finita viene segnalata come terminata), segnalare le voci terminate o misurate, comunicare allo scheduler le tracce senza file, il muto e il passaggio di consegne tra soundscape. Un fallimento dentro lo scheduler ferma il suono anziché la storia: il driver lo inghiotte. Il driver legge i percorsi dei media dalla sua campagna, quindi tieni la campagna non rilasciata finché il driver è in uso.

### ISpeaker e IVoice

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

Sono interfacce, quindi uno speaker può essere un `MonoBehaviour` o un `Node` di Godot.

| Membro | Obbligo |
| --- | --- |
| `ISpeaker.Open` | Restituisci quando la voce può cominciare subito: il file aperto, o abbastanza decodificato. Restituisci null quando il file non può essere riprodotto; si sente come silenzio e non viene mai ritentato. Conserva `events` con la voce. `role` è un suggerimento: un `Track` può durare minuti ed è di solito meglio in streaming, un `Cue` è breve e deve partire in orario. Per una campagna aperta dalla memoria `source.File` è null: leggi `Campaign.MediaBytes(source.Media)`. |
| `ISpeaker.Resolves` | Viene chiamato prima che un soundscape parta. Rispondi false per un media che lo speaker non può riprodurre, così la traccia viene comunicata allo scheduler come silenzio fin dall'inizio. Rispondi true nel dubbio. Obbligatorio; non esiste un'implementazione predefinita. |
| `IVoice.Play` | Parti subito, sostituendo ciò che la voce stava riproducendo. Può essere richiamato sulla stessa voce per un letto sonoro senza interruzioni il cui file è finito. Riproduci da `FromMs` a `ToMs`, o fino alla fine del file. Con `Looping`, arrivare a `ToMs` riporta a `LoopFromMs`, non a `FromMs`. |
| `IVoice.SetGain` | Scrivi un nuovo guadagno. Lo scheduler ne scrive uno a ogni tick in cui una dissolvenza si muove, quindi addolcisci il passaggio tra l'uno e l'altro nell'arco di pochi millisecondi. |
| `IVoice.Pause`, `IVoice.Resume` | Trattieni la voce esattamente dov'è, e lasciala andare di nuovo. |
| `IVoice.Stop` | Termina la voce per sempre e rilascia le sue risorse. Non segue alcun `Ended`. |
| `VoiceEvents.Ended()` | Chiamalo una volta per riproduzione, quando una voce non in loop arriva alla fine di ciò che le è stato dato. Mai dopo `Stop()`, mai per una voce in loop. |
| `VoiceEvents.Duration(double ms)` | Chiamalo una volta, quando la lunghezza del file è nota. |

Entrambe le chiamate di `VoiceEvents` sono thread-safe e possono arrivare da un thread audio; il driver le sente al suo prossimo `Update()`. Una chiamata da una voce che è stata fermata, o dopo che il driver non c'è più, viene ignorata.

**La scala del guadagno è cubica.** Uno speaker che scrive un'ampiezza scrive `gain * gain * gain`.

| Record o enum | Campi |
| --- | --- |
| `VoiceSource` | `Media` (`uint`, per indice nei media del manifest); `Path` (`string`, all'interno del bundle); `File` (`string?`, su disco, per una campagna aperta da una cartella) |
| `VoicePlay` | `FromMs` (`double`); `ToMs` (`double?`, la fine del file quando è null); `Gain` (`double`, da 0 a 1 sulla scala cubica); `Rate` (`double`, 1 è come registrato); `Looping` (`bool`); `LoopFromMs` (`double`) |
| `VoiceRole` | `Track`, `Cue` |
| `Clocks.Steady()` | `Func<ulong>`: millisecondi da quando l'orologio è stato creato, monotono, da `Stopwatch` |

### Mixer

`Mixer` è lo scheduler del motore, grezzo, per un host che non usa il driver: comandi in ingresso, `IReadOnlyList<VoiceCommand>` in uscita, il tuo orologio su ogni verbo. Un host che lo usa direttamente deve a mano i compiti del driver descritti sopra.

| Membro | Che cosa fa |
| --- | --- |
| `Mixer.Create(uint maxCues = 8, double gainStep = 0.004)` | Un nuovo scheduler. |
| `Play(ulong nowMs, Soundscape scape, IReadOnlyList<uint>? unresolved = null, ulong atMs = 0, bool muted = false)` | Riproduce un soundscape a partire da `atMs` al suo interno. Le tracce elencate in `unresolved`, per indice, si sentono come silenzio. |
| `Stop(nowMs)`, `Cut(nowMs)`, `Pause(nowMs)`, `Resume(nowMs)`, `Tick(nowMs)` | I verbi dello scheduler. |
| `Cue(ulong nowMs, uint media, double volume, double speed)` | Riproduce un suono una volta. |
| `VoiceEnded(ulong nowMs, ulong voice)` | Una voce ha raggiunto la fine. |
| `DurationKnown(ulong voice, ulong ms)` | La lunghezza del file di una voce è nota. |
| `Muted` | `bool`, get e set. |
| `PlayingId`, `FinishingId` | `string?`: il soundscape in vigore e quello che sta sfumando in uscita, per id. |
| `State` | `Phase?`; `TrackState(uint track)` risponde con `Phase`. `Phase` è `Queued`, `Starting`, `Playing`, `Finishing`, `Finished`. |
| `PositionMs` (`ulong`), `Pass` (`uint`), `RanOut`, `IsPaused`, `IsIdle` (`bool`) | Dove si trova lo scheduler. `IsIdle` indica quando un tick può riposare. |
| `Dispose()` | Rilascia lo scheduler. |

Campi di `VoiceCommand`: `Kind` (`VoiceKind`: `Open`, `Gain`, `Stop`, `Pause`, `Resume`); `Voice` (`ulong`); `Media`, `Track` (`uint`); `FromMs`, `LoopFromMs` (`ulong`); `ToMs` (`ulong?`); `Gain` (`double`); `Rate` (`double`, predefinito 1.0); `Looping` (`bool`); `Role` (`VoiceRole`).

## Errori

Ogni fallimento che il motore segnala è una sottoclasse di `RippleException`. `Failure` porta ciò che ha detto il motore, e `Code` è `Failure.Code`. Un verbo rifiutato con una `HostException` non ha mosso nulla.

| Eccezione | Valori di `Code` | Significato | Dove si incontra |
| --- | --- | --- | --- |
| `BundleException` | `BundleFormat` (1), `BundleVersion` (2) | Un documento del bundle è malformato o mancante, o è di una versione che questo motore non sa leggere. | Uso normale: l'apertura di un bundle errato o più recente. |
| `NeedsPythonException` | `NeedsPython` (3) | Il bundle richiede Python, e questo è il motore `NoPython`. | Uso normale: l'apertura. |
| `HostException` | `WrongTurn` (10), `NoSuchChoice` (11), `ChoiceSpent` (12), `Stopped` (13), `NothingAsked` (14), `UnknownLocale` (15), `NotPermitted` (16), `StandIn` (17), `NoCountdown` (18), `CountdownNotBegun` (19) | Un verbo che non risponde al turno, una scelta oltre quelle offerte, una scelta esaurita o chiusa, una sessione che si è fermata, un verbo prima di `Start()`, una lingua in cui la campagna non è leggibile, una posizione per un tipo che il lettore ha negato, un sostituto che non si legge, un verbo del conto alla rovescia su un passaggio senza, `Expire` prima di `BeginCountdown`. | Un bug dell'host, tranne `ChoiceSpent` quando offri una scelta non disponibile, e `UnknownLocale` e `StandIn` da input dell'utente. |
| `ResumeException` | `BoardGone` (20), `NodeGone` (21) | Un salvataggio nomina una lavagna o un nodo che la campagna non ha più. | Uso normale: un salvataggio di una build più vecchia della storia. |
| `InvalidArgumentException` | `InvalidArgument` (-1) | Un argomento malformato: un handle null, un testo che non è UTF-8, un valore fuori intervallo. Anche qualsiasi codice che il binding non conosce. | Un bug. |
| `EngineTrapException` | `Trap` (-2) | Il motore è andato in panic, ora o prima su questo handle. | Un bug del motore. |
| `ReentrantVerbException` | `Reentrant` (-100) | Un verbo di `Player` chiamato mentre stava consegnando un gruppo di effetti. Codice proprio del binding. | Un bug dell'host. |
| `EngineNotFoundException` | nessuno; deriva da `Exception` | La libreria del motore non ha potuto essere caricata per questa piattaforma, oppure collega un altro contratto. | Impacchettamento: referenzia un solo pacchetto del motore con lo stesso `MAJOR.MINOR`. |

`Code.Success` (0) non viene mai lanciato.

| Campo di `Failure` | Tipo | Impostato per |
| --- | --- | --- |
| `Code`, `Message` | `Code`, `string` | ogni fallimento |
| `Location` | `string?` | `BundleFormat`: il documento in difetto |
| `Found`, `Supported` | `long` | `BundleVersion`: il formato del bundle, e il più recente che questo motore legge |
| `Oldest` | `long?` | `BundleVersion`: il più vecchio, quando esiste un limite inferiore |
| `Asked`, `Answered` | `uint` | `WrongTurn`: ciò che la storia stava chiedendo (`RippleTurnKind`: 0 present, 1 ask, 2 wait, 3 ended, 4 failed, 5 stopped, 6 permit) e il verbo che ha risposto (`RippleVerb`: 0 choose, 1 answer, 2 elapsed, 3 begin countdown, 4 expire) |
| `Offered`, `Chosen` | `uint` | `NoSuchChoice`: quante scelte erano offerte, e l'indice preso |
| `Subject` | `string` | la scelta, la lingua, la lavagna o il nodo di cui parla un errore dell'host o di ripresa, e per `NotPermitted` e `StandIn` il nome di wire del tipo |
| `Node` | `string` | `NodeGone`: il nodo |

Altre eccezioni che i binding lanciano:

- `ObjectDisposedException` da qualsiasi membro di una `Campaign`, `Session` o `Mixer` rilasciata.
- `ArgumentOutOfRangeException` da `Choose` con un indice negativo; per lasciare usa `Leave()`.
- `InvalidOperationException` da `Value.AsBool()` e dagli altri lettori per un valore di un altro tipo.

**Un trap avvelena l'handle.** Dopo `EngineTrapException`, rilascia la sessione (e la campagna, se il trap è venuto da lei), riapri, e riprendi dall'ultimo checkpoint. Ogni chiamata successiva su un handle avvelenato lancia di nuovo `EngineTrapException`.

## Thread e ciclo di vita

- **Un chiamante alla volta per handle.** Una `Campaign`, `Session` o `Mixer` non è thread-safe. Un handle può passare da un thread all'altro.
- **Il motore non avvia alcun thread, non dorme mai e non legge mai un orologio.** Un `Hold` e un conto alla rovescia vengono risposti dal tuo orologio, e l'ora che una storia legge è quella che passi a `SetNow`. `Player` e `SoundscapeDriver` leggono l'orologio che è stato dato loro e non possiedono alcun thread: il tuo ciclo di gioco è il timer.
- **`VoiceEvents` è l'unica cosa chiamabile da qualsiasi thread.**
- **Ogni verbo è sincrono.** Uno script gira dentro il verbo che lo raggiunge, per al massimo `ScriptDeadlineMs`. Se quel tempo non può essere speso sul tuo thread principale, tieni la sessione su un worker e riporta gli effetti indietro: sono valori.
- **Tutto ciò che un verbo risponde è una copia.** Effetti, passaggi e valori sono record C# che sopravvivono alla sessione e alla campagna. Il gruppo di effetti del motore viene liberato prima che il verbo ritorni, e `RippleEngine.Outstanding` è zero ogni volta che nessuna chiamata è in corso.
- **`Campaign`, `Session`, `Mixer`, `SoundscapeDriver` e `Player` sono `IDisposable`.** Un `Dispose` dimenticato viene raccolto dal finalizer anziché perso. Un handle rilasciato lancia `ObjectDisposedException` anziché raggiungere il motore.
- **Una sessione sopravvive alla sua campagna:** rilascia prima la campagna e la sessione continua a funzionare.
- **`Player` possiede la sua sessione** e la rilascia. Non possiede il suo `SoundscapeDriver`.

## Un host completo

Un host da terminale su una cartella bundle: due sedute con un salvataggio in mezzo, la domanda che una storia fa prima di leggere l'orologio o il luogo, un modulo disegnato dalle sue etichette, uno speaker che stampa ciò che riprodurrebbe, le callback dell'autore, e il recupero da un trap.

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
            Now = Moment.Now,                                     // read by the story only once it is allowed
            OnError = error => Console.Error.WriteLine($"host: {error.Message}"),
            OnEffect = effect =>
            {
                if (effect is Effect.Changed { Cvars: { } cvars })
                    foreach (var cvar in cvars)
                        Console.WriteLine($"  [{cvar.Name} = {cvar.Value}]");
                if (effect is Effect.Notice notice)               // a stand-in, a refusal or nothing
                    Console.WriteLine($"  [{notice.Code}] {notice.Message}");
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
            player.Update();                                      // answers a Hold, and runs a countdown, that has come due
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
                case Effect.Permit permit:
                    // Before the story begins; a resumed session asks again, since a save
                    // carries no answer. The answer to the last kind begins the story.
                    foreach (var kind in permit.Kinds)
                        player.Permit(kind, Allowed(kind));
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

    static bool Allowed(PermissionKind kind)
    {
        Console.Write(kind == PermissionKind.Location
            ? "May this story read where you are? [y/N] "
            : "May this story read the date and time? [y/N] ");
        return Console.ReadLine()?.Trim().StartsWith("y", StringComparison.OrdinalIgnoreCase) == true;
    }

    static IEnumerable<KeyValuePair<string, Value>>? Fill(Prompt prompt)
    {
        Console.WriteLine($"\n-- {prompt.Title} --");
        var answers = new List<KeyValuePair<string, Value>>();
        foreach (var field in prompt.Fields)
        {
            // Shown by its label, in the reader's language; answered under its Name.
            Console.WriteLine($"{field.Label}{(field.Optional ? " (optional)" : "")}");
            for (var i = 0; i < field.Options.Count; i++)
                Console.WriteLine($"  {i + 1}. {field.Options[i].Label}");
            Value? value = null;
            while (value == null)
            {
                Console.Write(field.Options.Count > 0 ? "> " : $"{field.Placeholder} [{field.Default}]: ");
                var line = Console.ReadLine();
                if (line == null) return null;                    // the reader leaves the form
                if (line.Length == 0 && field.Optional) break;    // left out: the story reads nothing
                value = field.Options.Count > 0 ? Pick(field, line) : Typed(field, line);
            }
            if (value != null) answers.Add(new KeyValuePair<string, Value>(field.Name, value));
        }
        return answers;
    }

    // A pick is answered with the option's Id, never its words; null asks again.
    static Value? Pick(PromptField field, string line)
    {
        if (!int.TryParse(line, NumberStyles.Integer, CultureInfo.InvariantCulture, out var picked)
            || picked < 1 || picked > field.Options.Count)
            return null;
        var id = Value.Text(field.Options[picked - 1].Id);
        return field.Type.EndsWith("List", StringComparison.Ordinal) ? Value.List(id) : id;
    }

    // An empty line keeps the default; a required field with none asks again.
    static Value? Typed(PromptField field, string line) => line.Length == 0
        ? (field.Default.IsNull ? null : field.Default)
        : field.Type switch
        {
            "number" => long.TryParse(line, NumberStyles.Integer, CultureInfo.InvariantCulture, out var whole)
                ? Value.Int(whole)
                : Value.Float(double.Parse(line, CultureInfo.InvariantCulture)),
            "bool" => Value.Bool(line == "y"),
            _ => Value.Text(line),                                // the list types and json need parsing of their own
        };

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

L'[`examples/ConsolePlayer`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration/tree/main/examples/ConsolePlayer) del repository è un player da terminale eseguibile su qualsiasi cartella bundle.

## Vedi anche

- [Incorporare il motore](/it/explanation/embedding-the-engine/): di che cosa è responsabile un host e che cosa fa il motore da sé.
- [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/): le release del motore, i contratti e le due varianti.
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): i passaggi dal bundle esportato a una storia in esecuzione.
- [Callback dell'host](/it/explanation/host-callbacks/): perché l'autore dichiara una callback e l'host la registra.
- [Come esportare una copia del progetto o una campagna](/it/how-to/export-a-project-or-campaign/): creare il bundle che questo binding apre.
