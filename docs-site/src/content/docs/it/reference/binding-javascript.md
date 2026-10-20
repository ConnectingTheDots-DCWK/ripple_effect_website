---
title: Binding JavaScript e TypeScript
description: "Il binding JavaScript e TypeScript del motore di Ripple Effect: @ripplefx/player e @ripplefx/soundscape su npm, con ogni classe, membro, opzione, effetto ed errore."
---

Il binding del motore per JavaScript e TypeScript è composto da due pacchetti su npm, per una pagina di browser o per Node. [`@ripplefx/player`](https://www.npmjs.com/package/@ripplefx/player) porta il motore come componente WebAssembly, in entrambe le varianti, e l'API TypeScript costruita sopra. [`@ripplefx/soundscape`](https://www.npmjs.com/package/@ripplefx/soundscape) è lo speaker Web Audio per i soundscape di una campagna ed è facoltativo. La versione 1.5.x di ciascuno si lega al contratto 1.5 di Ripple Effect: il `MAJOR.MINOR` di un pacchetto è il contratto, e il suo `PATCH` è del pacchetto stesso. Il sorgente è pubblico su [ConnectingTheDots-DCWK/ripple_effect_js_ts_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_js_ts_integration).

Il codice di `@ripplefx/player` è MIT. Il motore al suo interno è sotto la [Ripple Effect Runtime Licence](https://legal.ripplefx.app/runtime/): libero da distribuire, non modificato nel funzionamento, come parte del tuo prodotto. Riproduci l'`ENGINE-NOTICE` del pacchetto ovunque il tuo prodotto elenchi il software di terze parti che usa. `@ripplefx/soundscape` non contiene alcun motore ed è semplicemente MIT.

## Pacchetti e installazione

```sh
npm install @ripplefx/player                        # the player
npm install @ripplefx/player @ripplefx/soundscape   # and the Web Audio speaker
```

| Pacchetto | Esporta | Gira in | Richiede |
| --- | --- | --- | --- |
| `@ripplefx/player` | `Campaign`, `Session`, `Player`, `SoundscapeDriver`, gli effetti, i valori, gli errori | browser, Node 22.18 o successivo | nient'altro |
| `@ripplefx/soundscape` | `WebAudioSpeaker`, `amplitude` | browser (Web Audio) | `@ripplefx/player` |

Entrambi sono moduli ES. Il player include `dist/`, entrambe le varianti del motore sotto `generated/`, `LICENSE` e `ENGINE-NOTICE`.

### Bundler

Il pacchetto indica ogni file del motore come `new URL(…, import.meta.url)`, e Vite, webpack 5, esbuild e Astro lo seguono tutti: il bundler copia i file `.wasm` accanto alla pagina senza alcuna configurazione. In Node i file vengono letti dal disco.

Per servire i file del motore da un altro posto, per esempio una CDN, passa `wasmBase` a `Campaign.load` o a `Campaign.fromFiles`. È un URL, risolto rispetto alla pagina, che contiene una cartella `python/` e una `no-python/` organizzate come il `generated/` del pacchetto; ciascuna contiene `engine.core.wasm`, `engine.core2.wasm` e `engine.core3.wasm`. Servi il motore insieme alla pagina, mai da una release di GitHub: i download delle release non inviano alcun `Access-Control-Allow-Origin`, quindi un browser non può leggerli.

### Distribuzione

| Cosa | Regola |
| --- | --- |
| File `.wasm` | Servili come `application/wasm`, così il motore viene compilato mentre scarica. Qualsiasi altro tipo funziona comunque, ma dopo il download. Una lunga durata della cache su un nome con hash. |
| Isolamento cross-origin | Non necessario. Nessuna intestazione `COOP` o `COEP`: il motore non usa `SharedArrayBuffer` né thread. |
| `X-Content-Type-Options: nosniff` | Impostala; insieme al tipo `.wasm` è l'unica intestazione di cui un host statico va informato. |
| La campagna | Una campagna compilata (*Esporta → Campagna* dell'editor) servita come cartella, così com'è, con `campaign.json` alla radice. |
| Una campagna su un'altra origine | Quell'origine invia le intestazioni CORS su ogni file del bundle. |
| Media su un'altra origine | Quell'origine invia le intestazioni CORS, altrimenti Web Audio sente il file come silenzio. |

### Percorsi dei media

Il percorso di un media è fatto dei nomi di cartelle e file dell'autore, con spazi, accenti, `#` e `?` inclusi. Viene codificato come URL **un segmento alla volta**, mai per intero, perché una `/` codificata indica un altro file. `Campaign.load` lo fa per te. Per un resolver tuo, il pacchetto esporta la funzione che usa.

| Export | Firma | Fa |
| --- | --- | --- |
| `encodePath` | `(path: string) => string` | Codifica ogni segmento separato da `/` con `encodeURIComponent` e li unisce con `/`. |

## Scegliere la variante

Il motore esiste in due varianti, `python` (con l'interprete Python) e `no-python`. `Campaign.load` e `Campaign.fromFiles` leggono `campaign.json` prima che esista un motore e ne scelgono una in base all'opzione `python`.

| `python` | Carica |
| --- | --- |
| `'auto'` (predefinito) | `python` quando i `needs` del bundle includono `python`, altrimenti `no-python`. Un bundle precedente al formato 15 non sa dirlo, e ottiene `python`. Dal formato 15 un `needs` assente significa nessuno. |
| `true` | `python`, sempre. |
| `false` | `no-python`, sempre. Un bundle i cui `needs` includono `python` viene rifiutato con `NeedsPython`. Un bundle precedente al formato 15 si apre, con i suoi script non disponibili. |

| Variante | In rete |
| --- | --- |
| `python` | circa 1,36 MB, più lo shim WASI che importa |
| `no-python` | circa 0,31 MB |

La variante `python` gira con un WASI che non ha nulla dietro: niente file, niente ambiente, niente rete. Il motore gli chiede un orologio e dell'entropia.

In un motore senza Python una scheda Script lo segnala e uno snippet mostra un avviso al suo posto; `session.pythonAvailable` è `false`, e `consoleFeed` risponde con un errore `unavailable` invece di lanciare un'eccezione.

## Piattaforme

| Piattaforma | Stato |
| --- | --- |
| Chromium | Testato: ogni fixture di conformità attraverso un bundle Vite che carica ogni bundle via HTTP; le voci dello speaker. |
| Firefox | Testato, come Chromium. |
| WebKit | Testato, come Chromium, in WebKitGTK. Safari su macOS e iOS non è ancora confermato per le tracce dello speaker. |
| Node 22.18 o successivo | Testato: ogni fixture di conformità, attraverso `Session` e attraverso `Player`, in entrambe le varianti. Nessuno speaker. |

Le fixture sono 24 con Python e 21 senza.

Il motore gira **sul thread chiamante**. Non c'è alcun trasporto via Worker: ogni verbo è sincrono, e un Worker renderebbe ogni verbo una promise. Una pagina la cui campagna esegue script pesanti può far girare il binding in un Worker proprio e inviare gli effetti oltre il confine con un messaggio.

Per i target nativi e web del motore, vedi [Target del motore](/it/reference/engine-targets/).

## Il motore

Non viene esportata alcuna classe del motore. Una `Campaign` carica il proprio motore: ogni file `.wasm` viene compilato una sola volta per pagina e messo in cache per URL, e ogni campagna ottiene un'istanza propria, così un trap rovina una campagna e nessun'altra.

| Export | Tipo | Che cos'è |
| --- | --- | --- |
| `Variant` | tipo | `'python' \| 'no-python'`. |
| `EngineOptions` | interfaccia | `{ wasmBase?: string \| URL }`, estesa da `CampaignOptions`. |

| Membro di `Campaign` | Tipo | Che cos'è |
| --- | --- | --- |
| `variant` | `Variant` | In quale motore è stata aperta la campagna. |
| `hasPython` | `boolean` | Se quel motore ha l'interprete. |
| `engineVersion` | `string` | La versione del motore, `MAJOR.MINOR.PATCH`. |

## Campaign

Una campagna compilata, aperta in un motore della variante di cui ha bisogno. Il costruttore è privato.

### Apertura

```ts
static load(base: string | URL, options?: CampaignOptions): Promise<Campaign>
static fromFiles(files: BundleFiles, options?: CampaignOptions): Promise<Campaign>
```

| Funzione | Prende | Fa |
| --- | --- | --- |
| `Campaign.load` | `base`: un URL che termina con `/`, o l'URL di `campaign.json` stesso. Un URL relativo si risolve rispetto alla pagina; un URL che non termina in nessuno dei due casi riceve una `/`. | Scarica `campaign.json` e ogni documento nominato dalle sue tabelle (lavagne, passaggi, componenti, script, macchine, soundscape) mentre il motore si carica, poi apre la campagna. Non viene scaricato alcun byte di media. I media si risolvono rispetto a `base`, un segmento alla volta. |
| `Campaign.fromFiles` | `files`: una `Map` o un oggetto semplice da percorso del bundle a `string` o `Uint8Array`. Deve contenere `campaign.json`. | Apre un bundle che hai già in mano. Una stringa è un documento; dei byte sono una risorsa passata al motore. **I media si risolvono solo tramite `options.mediaUrl`**: senza di essa nessuna immagine o suono ha un URL. |

`BundleFiles` è `ReadonlyMap<string, string | Uint8Array>` oppure `Readonly<Record<string, string | Uint8Array>>`.

### `CampaignOptions`

| Opzione | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `python` | `boolean \| 'auto'` | `'auto'` | Quale variante caricare. Vedi [Scegliere la variante](#scegliere-la-variante). |
| `fetch` | `RequestInit` | nessuno | Passato a ogni `fetch` che il loader esegue: credenziali, un signal. |
| `mediaUrl` | `(path: string) => URL \| string \| undefined` | nessuno | Dove si trova un file multimediale, per una campagna aperta con `fromFiles`. Una stringa si risolve rispetto alla pagina. Ignorata da `load`. |
| `wasmBase` | `string \| URL` | accanto al pacchetto | Da dove vengono serviti i file del motore. Vedi [Bundler](#bundler). |

### Membri

| Membro | Firma | Risponde con |
| --- | --- | --- |
| `manifest` | `CampaignManifest` | Il `campaign.json` del bundle, come l'ha letto il motore. |
| `variant`, `hasPython`, `engineVersion` | | Vedi [Il motore](#il-motore). |
| `mediaUrl` | `(index: number) => URL \| undefined` | Dove si trova il file multimediale all'indice `index` di `manifest.media`, oppure `undefined`. |
| `mediaPath` | `(index: number) => string \| undefined` | Il percorso di quel file nel bundle. |
| `coverUrl` | `URL \| undefined` | Dove si trova l'immagine di copertina del progetto, se ne ha una. |
| `soundscape` | `(index: number) => Soundscape` | Il soundscape all'indice `index` di `manifest.soundscapes`. Lancia `BundleError` per uno che non si lascia leggere. |
| `boardIndex` | `(id: string) => number \| undefined` | L'indice della lavagna il cui id di catalogo è `id`. |
| `validate` | `() => { message: string; location: string }[]` | Che cosa non va nel bundle, ogni problema e dove. Vuoto quando non c'è nulla. |
| `coerceCvar` | `(type: string, value: RippleValue) => RippleValue \| undefined` | Il valore come lo conserverebbe una variabile di console di tipo `type`, oppure `undefined` quando non ci sta. |
| `asText` | `(value: RippleValue) => string` | Il valore come lo stampa la storia, il testo che mostra uno snippet. |
| `describeCvarRefusal` | `(name: string, type: string, value: RippleValue) => string` | La frase con cui il motore rifiuta di scrivere `value` in una variabile di tipo `type`. In inglese, da mostrare. |
| `session` | `(start?: SessionStart) => Session` | Una sessione su questa campagna, non ancora avviata. Vedi [Session](#session). |

`coerceCvar`, `asText` e `describeCvarRefusal` non richiedono una sessione.

### `CampaignManifest`

| Campo | Tipo | Significato |
| --- | --- | --- |
| `format` | `number` | Il formato del bundle. |
| `generator` | `string`, facoltativo | Che cosa ha scritto il bundle. |
| `textFormat` | `string` | `markdown`, oppure `html` per una campagna esportata come HTML. |
| `project.title` | `string` | |
| `project.description` | `string` | |
| `project.defaultLocale` | `string` | La lingua in cui è stata scritta la storia. |
| `project.locales` | `readonly string[]` | Ogni lingua che la campagna ha. |
| `project.cover` | `string`, facoltativo | Il percorso dell'immagine di copertina nel bundle. |
| `entries` | `readonly number[]` | Le lavagne su cui una storia può iniziare, come indici in `boards`. |
| `boards`, `passages`, `components`, `scripts`, `media`, `machines`, `soundscapes` | `readonly BundleEntry[]` | Le tabelle del bundle. Un `BundleEntry` è `{ id, name, path }`, tutte stringhe. |
| `cvars` | `readonly { name: string; type: string; default: RippleValue }[]` | Le variabili di console che la campagna dichiara. |
| `needs` | `readonly string[]` | Di che cosa la campagna ha bisogno da un motore: `python` quando esegue script. |

## Session

I verbi dell'API dell'host, uno a uno con quelli del motore. Ogni verbo gira in modo sincrono e risponde con gli effetti ordinati a cui ha portato; l'ultimo di essi dice dove si trova ora la storia.

```ts
campaign.session(start?: SessionStart): Session
Session.create(campaign: Campaign, start?: SessionStart): Session   // the same
Session.resume(campaign: Campaign, save: string, start?: ResumeStart): Session
```

`Session.create` lancia `BundleError` quando la campagna non può essere avviata come richiesto. `Session.resume` riprende un salvataggio scritto da `pause()` o da `checkpoint()`, e lancia `ResumeError` quando il salvataggio non è più compatibile con la campagna. Una sessione ripresa si avvia con `start()`, come una nuova.

### `SessionStart`

`SessionStart` è `SessionOptions` più questi campi.

| Campo | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `seed` | `number \| bigint` | `0` | Con che cosa vengono inizializzati i dadi. L'unica impostazione da scegliere sempre: se la ometti, ogni lettore tira gli stessi dadi. |
| `locale` | `string` | `project.defaultLocale` | La lingua con cui iniziare. |
| `board` | `number` | `manifest.entries[0]`, oppure `0` | La lavagna su cui iniziare, per indice in `manifest.boards`. |
| `entryNode` | `string` | l'ingresso della lavagna | Il nodo da cui iniziare. |
| `digest` | `string` | nessuno | Un'etichetta impressa su ogni salvataggio che questa sessione scrive, per esempio un hash del bundle, così puoi distinguere i tuoi salvataggi. Il motore la porta con sé e non la confronta mai. |

### `ResumeStart`

`ResumeStart` è `SessionOptions` più `seed` (`number | bigint`, predefinito `0`). Un salvataggio non contiene lo stato dei dadi: per continuare a tirare da dove era arrivata la storia, copia `generator` dalla vecchia sessione a quella ripresa.

### `SessionOptions`

Ognuna ha come predefinito quello del motore.

| Opzione | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `stepBudget` | `number` | `1048576` | Quanti turni di scheda può compiere una lavagna prima che l'esecuzione sia considerata fuori controllo e la storia fallisca, invece di bloccare la pagina. |
| `silentJumpLimit` | `number` | `64` | Quante lavagne possono passarsi la mano di seguito senza una parola di storia prima che la storia fallisca. `0` fa fallire già il primo salto di questo tipo. |
| `loopLimit` | `number` | `512` | Quante volte una scheda ciclo può girare in una sola esecuzione di lavagna prima che la storia fallisca. **`0` significa nessun limite.** |
| `scriptLimits` | `ScriptLimits` | quelli del motore | `{ deadlineMs, memoryBytes, recursionDepth }`, tutti numeri: per quanto tempo può girare uno script, quanto può trattenere, con quale profondità può andare in ricorsione. |
| `untranslated` | `'report' \| 'fall-back'` | `'report'` | Un passaggio senza testo nella lingua che si sta leggendo: `report` lo mostra vuoto e nomina la lingua; `fall-back` mostra il testo della lingua predefinita e nomina comunque la lingua. |
| `trace` | `boolean` | `false` | Raccoglie la traccia dell'esecuzione in ogni lotto, come effetti `trace`. |
| `tracePayloads` | `boolean` | `false` | Include i payload nella traccia. |

### Verbi

| Verbo | Risponde con | Note |
| --- | --- | --- |
| `start()` | `Effect[]` | Avvia la storia, o una storia ripresa. |
| `choose(index?: number)` | `Effect[]` | Compie la scelta all'indice `index` tra quelle offerte. Senza indice, il lettore se ne va: il passaggio non porta da nessuna parte e la storia finisce lì. |
| `answer(values?: Answers)` | `Effect[]` | Risponde alla richiesta mostrata. I valori vanno al motore esattamente come sono dati. Senza valori, il lettore se ne va, come con `choose()`. |
| `elapsed()` | `Effect[]` | Segnala che l'attesa richiesta da un `hold` è finita. Un `Player` lo chiama per te. |
| `setLocale(locale: string)` | `Effect[]` | Continua a leggere in un'altra lingua; il passaggio mostrato viene mostrato di nuovo in quella lingua. |
| `restart()` | `Effect[]` | Ricomincia da capo, dimenticando ogni entità e mantenendo la lingua. |
| `stop()` | `Effect[]` | Termina la sessione per sempre. |
| `pause()` | `Paused` | Mette giù la storia e termina la sessione, rispondendo con un salvataggio. Solo su un passaggio o su una richiesta: altrove nulla si ferma, e non c'è né salvataggio né effetto. |
| `checkpoint()` | `string \| undefined` | Un salvataggio di dove si trova la storia, senza metterla giù. `undefined` a meno che la storia non sia su un passaggio o su una richiesta. |
| `writeCvar(name, value)` | `{ outcome, effects }` | Scrive una variabile di console. |
| `resetCvar(name)` | `{ outcome, effects }` | Riporta una variabile di console al suo valore predefinito. |
| `resetAllCvars()` | `Effect[]` | Riporta ogni variabile di console al suo valore predefinito. |
| `removeEntity(key)` | `{ removed: boolean; effects: Effect[] }` | Dimentica l'entità sotto `key`. |
| `consoleFeed(code: string)` | `{ result: PythonResult; effects: Effect[] }` | Una riga di Python contro la storia in corso: le sue entità, le sue variabili, i suoi suoni. |

Un verbo rifiutato lancia `HostError` e nulla si muove. `Paused` è `{ save?: string; effects: Effect[] }`. `Answers` è una `Map` o un oggetto semplice da nome di campo a valore; un oggetto semplice annidato viene preso come mappa.

L'`outcome` di una scrittura di cvar è `'done'`, `'unknown'` (nessuna variabile di quel nome) oppure `{ refused: string }`, che porta la frase del motore in inglese, da mostrare e mai da analizzare.

### Lettori

Ognuno è un'istantanea all'ultimo verbo.

| Lettore | Tipo | Che cos'è |
| --- | --- | --- |
| `campaign` | `Campaign` | La campagna che la sessione esegue. |
| `board` | `number` | L'indice della lavagna su cui si trova la storia. |
| `locale` | `string` | La lingua che si sta leggendo. |
| `defaultLocale` | `string` | La lingua in cui è stata scritta la storia. |
| `ambience` | `Ambience \| null` | Il soundscape in vigore, oppure `null` per il silenzio. |
| `entities` | `Entity[]` | Tutto ciò che la storia ha creato. |
| `memory` | `Memory` | Ciò che la storia ricorda delle sue schede e delle sue macchine. |
| `cvars` | `CvarSnapshot[]` | Ogni variabile di console, con il suo valore predefinito e il suo valore. |
| `guard` | `GuardReport` | Ciò a cui il guardiano degli script ha rinunciato in questa partita. |
| `pythonAvailable` | `boolean` | Se il motore di questa sessione può eseguire gli script della campagna. |
| `describeCvarWrite(name, value)` | `string \| undefined` | Perché scrivere `value` in `name` verrebbe rifiutato, oppure `undefined` se non lo sarebbe. |

`GuardReport` è `{ abandoned: readonly string[]; refused: number; exhausted: boolean }`: i nomi a cui si sono fermati gli script la cui scadenza è passata, ordinati e con le ripetizioni conservate; quante esecuzioni non sono mai state avviate; se nessuno script verrà più avviato.

### Risultati di Python

| Campo di `PythonResult` | Tipo | Significato |
| --- | --- | --- |
| `value` | `RippleValue` | Il valore dell'ultima espressione, oppure `null`. |
| `output` | `string` | Tutto ciò che ha stampato. |
| `error` | `PythonFailure`, facoltativo | Perché si è fermato. |

| Campo di `PythonFailure` | Tipo | Significato |
| --- | --- | --- |
| `type` | `string` | La classe dell'eccezione Python (`NameError`, `SyntaxError`), oppure una delle etichette del motore: `timeout`, `refused`, `closed`, `host-error`, `unavailable` (un motore senza Python). |
| `message` | `string` | |
| `line` | `number`, facoltativo | |
| `traceback` | `string`, facoltativo | |

### Traccia e dadi

| Membro | Firma | Fa |
| --- | --- | --- |
| `setTrace` | `(enabled: boolean) => void` | Attiva o disattiva la traccia dell'esecuzione. |
| `setTracePayloads` | `(enabled: boolean) => void` | Attiva o disattiva i payload della traccia. |
| `generator` | `{ lo: number; hi: number }`, get e set | Lo stato dei dadi. Un salvataggio non ne contiene; passalo a una sessione ripresa per continuare a tirare da dove era arrivata la storia. |

## Effetti

Un `Effect` è un oggetto semplice etichettato con `kind`, così uno `switch` su `effect.kind` viene controllato per esaustività. Tempi e indici sono numeri, i valori della storia sono `RippleValue`, e un'immagine o un suono arriva con il suo URL.

| `kind` | Campi | Note |
| --- | --- | --- |
| `show` | `passage: Passage` | Un passaggio. Un turno. |
| `ask` | `prompt: Prompt` | Una richiesta. Un turno. |
| `hold` | `ms: number` | Un'attesa. Un turno. Chiama `elapsed()` quando sono passati `ms`; un `Player` lo fa. |
| `ended` | `title?: string`, `ranOut: boolean` | La storia è finita come l'ha scritta l'autore, oppure ha esaurito la strada (`ranOut`). Un turno. |
| `failed` | `message: string`, `node?: string` | La storia si è fermata per un errore. `message` è in inglese, da mostrare e mai da analizzare. Un turno. |
| `stopped` | nessuno | La sessione è terminata, dopo `stop()` o `pause()`. Un turno. |
| `jumped` | `board: number`, `node?: string` | La storia è passata a un'altra lavagna. `board` è un indice in `manifest.boards`; non è l'id di catalogo. |
| `ambience` | `ambience: Ambience \| null` | Il soundscape in vigore è cambiato. `null` è il silenzio. |
| `audio` | `command: AudioCommand` | Ciò che viene detto a uno speaker. Vedi [Suono](#suono). |
| `changed` | `entities?`, `memory?`, `cvars?` | Quali archivi si sono mossi, ciascuno con il suo nuovo contenuto. |
| `callback` | `event: CallbackEvent` | Una callback con nome dichiarata dall'autore. Vedi [Callback con nome](#callback-con-nome). |
| `trace` | `event: RunEvent` | Solo con `trace` attivo. La forma `{ tag, val }` propria del motore, con i tag in kebab-case e tutto il resto, senza mappatura. |

I sei turni (`show`, `ask`, `hold`, `ended`, `failed`, `stopped`) sono il tipo `Turn`; uno è sempre l'ultimo effetto di un lotto. `isTurn(effect: Effect): effect is Turn` li distingue.

### Record

#### `Passage`

| Campo | Tipo | Significato |
| --- | --- | --- |
| `node` | `string` | Il nodo del passaggio. |
| `title` | `string` | |
| `text` | `string` | La prosa, dopo l'esecuzione dei suoi snippet, nella lingua che si sta leggendo. Markdown, oppure HTML quando `manifest.textFormat` è `html`. Rendila con una libreria e sanifica ciò che produce. |
| `choices` | `readonly Choice[]` | Le scelte offerte, in ordine. |
| `snippets` | `readonly { code: string; isInline: boolean }[]` | Gli snippet che la prosa ha eseguito. |
| `media` | `ReadonlyMap<string, URL>` | Ogni link nella prosa che nomina un file della campagna, verso l'URL di quel file. I link senza URL sono assenti. |
| `mediaIndex` | `ReadonlyMap<string, number>` | Gli stessi link, verso l'indice di media che ciascuno nomina. |
| `untranslated` | `string`, facoltativo | La lingua in cui il passaggio non ha testo, quando è questo il motivo per cui è vuoto. |
| `soundscape` | `Soundscape`, facoltativo | Il soundscape che il passaggio riproduce. |
| `silence` | `boolean` | Il passaggio chiede il silenzio. |

#### `Choice`

| Campo | Tipo | Significato |
| --- | --- | --- |
| `port` | `string` | La porta della scelta. |
| `text` | `string` | |
| `available` | `boolean` | `false` per una scelta esaurita: viene mostrata, e rifiutata con `choice-spent` se compiuta. |

#### `Prompt` e `PromptField`

| Campo | Tipo | Significato |
| --- | --- | --- |
| `Prompt.node` | `string` | |
| `Prompt.title` | `string` | |
| `Prompt.fields` | `readonly PromptField[]` | |
| `PromptField.name` | `string` | La chiave con cui rispondere. |
| `PromptField.type` | `string` | Il tipo del campo. |
| `PromptField.default` | `RippleValue` | |

#### `Ambience`

| Campo | Tipo |
| --- | --- |
| `soundscape` | `Soundscape` |
| `board` | `number` |
| `node` | `string` |

#### `Soundscape` e `Track`

Ogni tempo è in millisecondi.

| Campo | Tipo | Significato |
| --- | --- | --- |
| `Soundscape.id` | `string` | |
| `Soundscape.name` | `string` | |
| `Soundscape.length` | `number` | |
| `Soundscape.looping` | `boolean` | |
| `Soundscape.fadeIn`, `fadeOut` | `number` | |
| `Soundscape.volume` | `number` | |
| `Soundscape.tied` | `boolean` | |
| `Soundscape.tracks` | `readonly Track[]` | Una clip ciascuna. |
| `Track.media` | `number` | Indice in `manifest.media`. |
| `Track.lane` | `number` | |
| `Track.start` | `number` | Dove sulla timeline inizia la clip. |
| `Track.clipStart`, `clipEnd?` | `number` | Dove nel file inizia e finisce. |
| `Track.volume`, `speed` | `number` | |
| `Track.fadeIn`, `fadeOut` | `number` | Le dissolvenze proprie della clip. |
| `Track.mode` | `TrackMode` | `auto`, `looping` oppure `once`. |
| `Track.interval` | `number` | Solo per `auto`: il silenzio tra la fine di una riproduzione e la successiva; `0` è un letto continuo senza pause. |

#### `Entity`, `Memory`, `CvarSnapshot`, `Changed`

| Campo | Tipo | Significato |
| --- | --- | --- |
| `Entity.key` | `string` | |
| `Entity.component` | `string`, facoltativo | |
| `Entity.label` | `string` | |
| `Entity.values` | `RippleValue` | |
| `Memory.nodes` | `RippleValue` | |
| `Memory.machines` | `readonly (readonly [string, string])[]` | Coppie di stringhe, una per state machine. |
| `CvarSnapshot.name`, `type` | `string` | |
| `CvarSnapshot.default`, `value` | `RippleValue` | |
| `Changed.entities` | `readonly Entity[]`, facoltativo | Presente quando le entità si sono mosse. |
| `Changed.memory` | `Memory`, facoltativo | Presente quando la memoria si è mossa. |
| `Changed.cvars` | `readonly CvarSnapshot[]`, facoltativo | Presente quando le variabili di console si sono mosse. |

#### `CallbackEvent`

| Campo | Tipo | Significato |
| --- | --- | --- |
| `callback` | `string` | Il nome che l'autore le ha dato, la chiave con cui si registra un gestore. |
| `event` | `CallbackEventName` | Su che cosa era stata dichiarata, con i punti: `cvar.changed`. |
| `board` | `number`, facoltativo | |
| `node` | `string`, facoltativo | |
| `name` | `string`, facoltativo | |
| `from`, `to` | `RippleValue`, facoltativo | |
| `index` | `number`, facoltativo | |

`CallbackEventName` è uno tra `story.started`, `board.entered`, `soundscape.changed`, `passage.shown`, `choice.taken`, `delay.started`, `delay.elapsed`, `story.ended`, `story.failed`, `cvar.changed`, `entity.spawned`, `entity.removed`, `entity.renamed`, `entity.field.changed`, `machine.state.entered`, `node.entered`, `node.exited`, `node.failed`. `CallbackKind` è lo stesso insieme come lo scrive l'interfaccia WebAssembly del motore, con i trattini (`cvar-changed`).

#### `AudioCommand`

| `kind` | Campi |
| --- | --- |
| `play` | `soundscape: Soundscape`, `fadeInMs: number` |
| `stop` | `fadeOutMs: number` |
| `cut` | nessuno |
| `cue` | `media: number`, `url?: URL`, `volume: number`, `speed: number`, `node?: string` |

#### `RunEvent`

Un passo della traccia dell'esecuzione, come lo scrive l'interfaccia WebAssembly del motore. Una vista per il debug.

### `resolveLink`

```ts
resolveLink(passage: Passage, src: string): string
```

Riscrive un link nella prosa di un passaggio con l'URL del file che nomina, tramite `passage.media`, oppure risponde con `src` invariato. La prosa conserva i link dell'autore; passala all'hook per le immagini del tuo renderer.

## Valori

Il valore di una storia è un `RippleValue`.

| Tipo della storia | JavaScript |
| --- | --- |
| Null | `null` |
| Boolean | `boolean` |
| Int | `bigint`, tutti i 64 bit |
| Float | `number`, NaN e gli infiniti inclusi |
| String | `string` |
| List | `readonly RippleValue[]` |
| Map | `ReadonlyMap<string, RippleValue>`, nell'ordine delle chiavi del motore |

Int e Float sono tipi diversi e restano diversi: `7n` è un Int e `7` un Float, e una storia che li confronta ottiene `false`. Tempi, indici e id delle voci sono numeri JavaScript. Un seed accetta entrambi.

**Riscrivere un valore:**
- un oggetto semplice viene preso come mappa, nel suo ordine delle chiavi, quindi `{ gold: 3n }` è accettato dove si intende una mappa;
- `undefined` viene scritto come `null`;
- un `bigint` oltre i 64 bit lancia `RangeError`;
- qualsiasi altro tipo (una funzione, un symbol) lancia `TypeError`.

| Export | Firma | Fa |
| --- | --- | --- |
| `asRecord` | `(value: RippleValue) => Record<string, RippleValue>` | Le voci di un valore mappa come oggetto semplice; `{}` per qualsiasi altra cosa. |

## Player

Il ciclo sopra una sessione: consegna ogni effetto in ordine, conserva il turno nominato dall'ultimo, aspetta che finisca un `hold`, applica il suono della storia e smista le callback con nome.

```ts
new Player(session: Session, handlers: PlayerHandlers)
```

### `PlayerHandlers`

| Gestore | Tipo | Significato |
| --- | --- | --- |
| `onEffect` | `(effect: Effect) => void` | Obbligatorio. Ogni effetto, nell'ordine in cui il motore l'ha prodotto. |
| `onError` | `(error: unknown) => void` | Un errore di un verbo che il player ha eseguito da sé (l'`elapsed()` dopo un'attesa), o lanciato da un gestore mentre si consegnava un lotto. **Senza di esso, un errore dopo un'attesa è un'eccezione non catturata** lanciata da un timer, e l'errore di un gestore va a `reportError`, o a `console.error` dove non esiste. |
| `audio` | `SoundscapeDriver` | Dove va il suono della storia. Ogni effetto `audio` viene applicato a esso oltre a essere passato a `onEffect`. Senza uno, non si sente nulla. |

### Membri

| Membro | Firma | Fa |
| --- | --- | --- |
| `session` | `Session` | La sessione sottostante, per ciò che il player non avvolge: i lettori di stato, `checkpoint`, cvar, entità. **Un verbo chiamato su di essa aggira il player**: un'attesa in sospeso non viene annullata e può svegliare un turno successivo, e nulla di ciò che risponde raggiunge `onEffect` o il suono. |
| `handlers` | `PlayerHandlers` | Come dati. |
| `turn` | `Turn \| undefined` | L'ultimo passaggio, richiesta, attesa o finale consegnato. |
| `start()` | `void` | `session.start()`, consegnato. |
| `choose(index?)` | `void` | `session.choose(index)`, consegnato. |
| `answer(values?)` | `void` | `session.answer(values)`, consegnato. |
| `setLocale(locale)` | `void` | `session.setLocale(locale)`, consegnato. |
| `restart()` | `void` | `session.restart()`, consegnato. |
| `stop()` | `void` | `session.stop()`, consegnato. |
| `pause()` | `string \| undefined` | `session.pause()`: consegna i suoi effetti e risponde con il salvataggio, oppure `undefined` e nulla si è fermato a meno che la storia non sia su un passaggio o su una richiesta. Risponde ancora dopo `dispose()`, così una pagina può salvare mentre se ne va. Non è `SoundscapeDriver.pause`. |
| `consoleFeed(code)` | `PythonResult` | `session.consoleFeed(code)`; ciò a cui porta viene consegnato come gli effetti di qualsiasi verbo. |
| `onCallback`, `onAnyCallback`, `clearCallbacks()`, `callbackMisses` | | Vedi [Callback con nome](#callback-con-nome). |
| `dispose()` | `void` | Smette di attendere qualsiasi `hold` e non consegna più nulla. Dopo di esso, `start`, `choose`, `answer`, `setLocale`, `restart` e `stop` non fanno assolutamente nulla, e `pause` risponde ancora con un salvataggio. |

Un verbo del player lancia, verso di te, qualsiasi cosa lanci il verbo della sessione (`HostError`, `EngineTrap`).

### Consegna

Per ogni effetto di un lotto, in ordine:
1. un turno diventa `turn`;
2. un effetto `audio` viene applicato a `audio`;
3. un effetto `callback` viene smistato ai suoi gestori;
4. l'effetto viene passato a `onEffect`.

Un gestore che lancia un errore viene segnalato, e il resto del lotto arriva comunque. Un gestore che chiama `dispose()` ferma il lotto in quel punto.

### Attese

Quando l'ultimo effetto di un lotto è un `hold`, il player imposta un timer per `ms`, poi chiama `session.elapsed()` e consegna ciò che risponde. Qualsiasi verbo chiamato mentre l'attesa è in sospeso annulla prima il timer, così un riavvio durante una pausa nella storia non risveglia la storia un attimo dopo. Un errore di quell'`elapsed()` va a `onError`.

## Callback con nome

Un autore pubblica nell'editor dei punti con nome: `chapterTwo` quando si entra in una lavagna, `goldChanged` quando una variabile si muove. Una callback non porta codice; sei tu a registrare il gestore sul suo nome.

| Membro | Firma | Fa |
| --- | --- | --- |
| `onCallback` | `(name: string, handler: CallbackHandler) => () => void` | Chiama `handler` ogni volta che scatta la callback che l'autore ha chiamato `name`, sostituendo qualsiasi gestore già presente sotto quel nome. Risponde con la funzione che lo rimuove. |
| `onAnyCallback` | `(handler: CallbackHandler) => () => void` | Chiama `handler` per ogni callback che scatta, registrata o no. Risponde con la funzione che lo rimuove. |
| `clearCallbacks` | `() => void` | Dimentica ogni gestore di callback. Il conteggio delle mancate viene conservato. |
| `callbackMisses` | `number` | Quante callback sono scattate senza nulla di registrato sotto il loro nome. |

`CallbackHandler` è `(fired: CallbackEvent) => void`. Il gestore con nome gira per primo, poi ogni gestore di `onAnyCallback`, poi `onEffect` riceve lo stesso evento come `{ kind: 'callback', event }`.

- **Un gestore gira dove il motore ha collocato la callback**, dentro il verbo: una callback su un passaggio arriva prima del passaggio.
- **Un gestore non deve chiamare un verbo sul player.** Un verbo chiamato mentre si consegna un lotto, da un gestore o da `onEffect`, lancia `ReentrantVerb`. Programmalo con `queueMicrotask` o `setTimeout`.
- **Un nome che nessuno ha registrato non è un errore.** La storia procede allo stesso modo, e `callbackMisses` lo conta.
- **Un gestore che lancia un errore non ferma la storia.** L'errore va a `onError`, e il resto del lotto arriva comunque.
- **Un nome è un'API pubblicata**, l'unica cosa che unisce la dichiarazione dell'autore al tuo codice. Rinominarne uno nell'editor rompe il gestore registrato sotto il vecchio nome.

I nomi e i loro eventi sono elencati in [Callback dell'host](/it/reference/host-callbacks/).

## Suono

Tre livelli: la sessione dice che cosa chiede la storia come effetti `audio`; lo scheduler del motore decide da questi ogni voce, guadagno e passaggio di consegne; uno **speaker** produce i suoni. `SoundscapeDriver` pilota lo scheduler e svolge ogni compito che questo chiede a un host. Uno speaker è l'unica parte che tocca un'API audio.

```ts
const audio = new SoundscapeDriver(campaign, speaker, options?);
const player = new Player(session, { onEffect, audio });
```

### `SoundscapeDriver`

```ts
new SoundscapeDriver(campaign: Campaign, speaker: Speaker, options?: SoundscapeOptions)
```

| `SoundscapeOptions` | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `maxCues` | `number` | `8` | Quante cue possono suonare insieme; la più vecchia cede il posto. |
| `gainStep` | `number` | `0.004` | La più piccola variazione di guadagno che valga la pena di scrivere. |
| `tickMs` | `number` | `25` | Ogni quanto viene fatto avanzare lo scheduler mentre qualcosa suona. |
| `muted` | `boolean` | `false` | Parte silenziato: ogni guadagno scritto come zero, e ricordato. |
| `now` | `() => number` | `performance.now` | L'orologio, in millisecondi, monotono. |

| Membro | Firma | Fa |
| --- | --- | --- |
| `apply` | `(command: AudioCommand) => void` | Esegue uno dei comandi audio della sessione. Un `Player` con `audio` lo chiama per te. **Un `play` il cui soundscape è stato copiato, ricostruito o ricavato da JSON lancia `RippleError`**: passa l'oggetto proprio dell'effetto, o uno restituito da `campaign.soundscape()`. Una `cue` senza `url` viene ignorata. Non fa nulla dopo `dispose()`. |
| `setMuted` | `(muted: boolean) => void` | Silenzia o riattiva subito; i guadagni che lo scheduler avrebbe scritto vengono conservati. |
| `muted` | `boolean` | Se è silenziato. |
| `pause` | `() => void` | Tiene ogni voce dove si trova, e con loro l'orologio, per esempio quando la scheda del browser è nascosta. La storia non viene toccata: non è `Player.pause`. |
| `resume` | `() => void` | Le lascia ripartire. |
| `playing` | `string \| undefined` | L'id del soundscape in vigore: quello che suona, o quello che aspetta il suo turno mentre l'ultimo svanisce. |
| `idle` | `boolean` | Se nulla suona, attende o ha cue. |
| `dispose` | `() => void` | Ferma tutto e lascia andare ogni voce. |

Ciò che fa il driver, così che non debba farlo uno speaker:
- il timer;
- i comandi dello scheduler;
- una voce in ritardo: il tempo impiegato da `voice()`, moltiplicato per `rate`, viene aggiunto a `from`, e una clip in loop si avvolge dentro il suo loop; una clip già finita non riproduce nulla;
- i guadagni scritti prima che una voce fosse pronta, applicati quando lo è;
- le tracce il cui file non ha URL, comunicate allo scheduler come silenzio invece di essere tentate;
- il mute, che è dello scheduler: scrive zero e lo ricorda;
- il passaggio di consegne tra soundscape, che non si sovrappongono mai. Un passaggio di consegne attende la dissolvenza in uscita del soundscape uscente.

### Il contratto `Speaker`

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

| Membro | Obbligo |
| --- | --- |
| `Speaker.voice(url, role)` | Si risolve quando la voce può iniziare **subito**: carica il file, o abbastanza di esso. **Rifiuta** quando il file non può essere riprodotto; lo scheduler lo sente come silenzio e non riprova mai. `role` è un suggerimento: una `track` può durare minuti, una `cue` è un breve effetto sonoro che deve partire in orario. |
| `Voice.play(request)` | Inizia subito e sostituisce qualsiasi cosa la voce stesse riproducendo. Può essere richiamata sulla stessa voce per un letto continuo il cui file è finito ricominciando, e deve proseguire il più da vicino possibile, per quanto l'API lo consenta. Riproduce da `from` a `to`, o fino alla fine del file. Con `looping`, arrivare a `to` riporta a **`loopFrom`, non a `from`**. |
| `Voice.setGain(gain)` | Scrive un nuovo guadagno, sulla stessa scala di `VoicePlay.gain`. Lo scheduler ne scrive uno a ogni tick in cui una dissolvenza si muove; raccordali nell'arco di pochi millisecondi, altrimenti una dissolvenza diventa una scalinata. |
| `Voice.pause()`, `resume()` | Tengono la voce esattamente dove si trova, e la lasciano ripartire. Il driver mette in pausa tutte le voci insieme. |
| `Voice.stop()` | Termina la voce per sempre e ne rilascia le risorse. Non segue alcun `onEnded`. |
| `Voice.onEnded` | Scatta una volta per riproduzione, quando una voce senza loop arriva alla fine di ciò che le è stato dato. Mai dopo `stop()`, mai per una voce in loop. |
| `Voice.onDuration(ms)` | Scatta una volta, quando la lunghezza del file è nota. Fino ad allora una traccia riprodotta fino alla fine del suo file non ha una fine su cui lo scheduler possa pianificare una dissolvenza in uscita o un giro senza pause. |

**La scala del guadagno è cubica.** L'editor scrive un guadagno nel controllo del volume di mpv, la cui curva è cubica, quindi uno speaker che scrive un'ampiezza scrive `gain ** 3`: metà del guadagno è un ottavo dell'ampiezza. Uno speaker che scrive il guadagno come ampiezza mixa ogni soundscape più forte, nelle sue parti basse, di come lo ha sentito il suo autore.

Uno speaker tuo dovrebbe superare i controlli che supera `@ripplefx/soundscape`: un file termina vicino alla sua lunghezza e la comunica; una clip termina vicino al suo `to`; un loop non termina mai; una cue termina vicino alla sua lunghezza; una cue messa in pausa termina più tardi della durata della pausa; una voce fermata non termina mai. Il contratto è pubblicato anche come [`docs/speaker.md`](https://github.com/ConnectingTheDots-DCWK/ripple_effect_js_ts_integration/blob/main/docs/speaker.md).

### `@ripplefx/soundscape`

```ts
new WebAudioSpeaker(options?: WebAudioSpeakerOptions)
```

| `WebAudioSpeakerOptions` | Tipo | Predefinito | Significato |
| --- | --- | --- | --- |
| `context` | `AudioContext` | uno nuovo | Il contesto in cui riprodurre. |
| `destination` | `AudioNode` | la `destination` del contesto | Dove va ogni voce. |
| `crossOrigin` | `'anonymous' \| 'use-credentials'` | `'anonymous'` | La modalità CORS per una traccia su un'altra origine. |
| `cueCache` | `number` | `32` | Quante cue decodificate vengono conservate per la volta successiva in cui verranno richiamate; la meno usata di recente esce per prima. |

| Membro | Firma | Fa |
| --- | --- | --- |
| `context` | `AudioContext` | Il contesto in cui riproduce. |
| `unlock` | `() => Promise<void>` | Riprende il contesto a meno che non sia in esecuzione. I browser non avviano alcun suono finché il lettore non ha cliccato, toccato o premuto un tasto sulla pagina, quindi chiamalo dal gestore di quel gesto: un pulsante *Inizia*. |
| `voice` | `(url: URL, role: VoiceRole) => Promise<Voice>` | Il metodo di `Speaker`. |
| `close` | `() => Promise<void>` | Chiude il contesto; dopo, nulla viene riprodotto tramite questo speaker. |

| Export | Firma | Fa |
| --- | --- | --- |
| `amplitude` | `(gain: number) => number` | Un guadagno sulla scala del motore come ampiezza: limitato a 0–1, un guadagno non finito letto come `0`, poi elevato al cubo. |

Come produce ogni tipo di suono:
- **Una traccia viene riprodotta in streaming** attraverso un elemento media verso un nodo di guadagno. Un letto musicale decodificato per intero occupa circa 23 MB al minuto. L'elemento viene instradato in Web Audio una volta che sta riproducendo, silenziato fino ad allora, e la fine del file viene sorvegliata oltre che attesa.
- **Una cue viene decodificata** una sola volta, messa in cache e fatta partire dal suo buffer, così un effetto sonoro non è mai in ritardo. Viene scaricata con `mode: 'cors'`.
- **Ogni guadagno passa da un `GainNode`**, sulla scala cubica, raccordato tra i passi dello scheduler. Non usa mai `HTMLMediaElement.volume`, che iOS ignora.

Un file su un'altra origine richiede le intestazioni CORS di quell'origine, altrimenti Web Audio lo sente come silenzio. MP3, AAC, FLAC e WAV si riproducono in ogni browser attuale; Ogg e Opus non si riproducono nelle versioni più vecchie di Safari, e su iOS questo vale per ogni browser.

## Errori

Ogni errore lanciato dal pacchetto è un `RippleError`, e ciascuno è una classe che distingui con `instanceof`. Ogni messaggio è in inglese, per un log; decidi in base ai campi.

| Classe | Lanciata da | Campi | Si incontra nell'uso |
| --- | --- | --- | --- |
| `RippleError` | la base delle altre; anche `SoundscapeDriver.apply` quando riceve un soundscape copiato | `message` | no: un bug |
| `LoadError` | `Campaign.load`, e il download del motore stesso | `url: string`, `status: number \| undefined` (`undefined` quando a fallire è stato il fetch stesso) | sì: un errore di rete o del server |
| `BundleError` | `Campaign.load`, `Campaign.fromFiles`, `campaign.soundscape`, `Session.create` | `failure: BundleFailure` | sì: un bundle che non si apre, o uno proveniente da un motore più recente |
| `NeedsPython` | `Campaign.load`, `Campaign.fromFiles` con `python: false` | nessuno | sì, per tua scelta |
| `ResumeError` | `Session.resume` | `failure: ResumeFailure` | sì: un salvataggio che non è più compatibile con la campagna |
| `HostError` | qualsiasi verbo di sessione | `failure: HostFailure` | solo due tipi (sotto) |
| `ReentrantVerb` | un verbo di `Player` chiamato mentre consegna un lotto | nessuno | no: un bug |
| `EngineTrap` | qualsiasi chiamata nel motore dopo che è andato in panic | `cause` | sì, e raro |

### `BundleFailure`

| `kind` | Campi | Significato |
| --- | --- | --- |
| `format` | `message`, `location?` | Il bundle è illeggibile, e dove. |
| `version` | `message`, `found`, `supported`, `oldest?` | Il formato del bundle è uno che questo motore non può aprire: `found`, rispetto al più recente che `supported` e al più vecchio, `oldest`. |

### `ResumeFailure`

| `kind` | Campi | Significato |
| --- | --- | --- |
| `bundle` | `failure: BundleFailure` | Il salvataggio stesso non si lascia leggere. |
| `board-gone` | `board` | La lavagna su cui si trovava il salvataggio non è più in questa campagna. |
| `node-gone` | `board`, `node` | Il nodo su cui si trovava il salvataggio non è più su quella lavagna. |

### `HostFailure`

Un verbo rifiutato lascia la storia dov'era.

| `kind` | Campi | Significato | Si incontra nell'uso |
| --- | --- | --- | --- |
| `choice-spent` | `port` | È stata compiuta una scelta indicata come non disponibile. | sì: gestiscilo |
| `unknown-locale` | `locale` | Una lingua in cui la campagna non è stata scritta. | sì: gestiscilo |
| `wrong-turn` | `asked`, `answered` | Un verbo che non si adatta al turno. `asked` è `present`, `ask`, `wait`, `ended`, `failed` o `stopped`; `answered` è `choose`, `answer` o `elapsed`. | no: un bug |
| `no-such-choice` | `offered`, `chosen` | Un indice oltre le scelte offerte. | no: un bug |
| `stopped` | nessuno | La sessione è ferma. | no: un bug |
| `nothing-asked` | nessuno | La storia non sta aspettando nulla. | no: un bug |

### `EngineTrap`

Il motore è andato in panic. L'istanza della campagna è compromessa: ogni chiamata successiva su quella campagna, e su qualsiasi sessione, player o driver costruito sopra di essa, lancia di nuovo `EngineTrap`. Le altre campagne non sono toccate. Per recuperare, carica di nuovo la campagna e riprendi dall'ultimo salvataggio.

## Thread e ciclo di vita

- **Ogni verbo è sincrono** e gira sul thread chiamante. Nulla in `Session` restituisce una promise; solo `Campaign.load`, `Campaign.fromFiles`, `Speaker.voice`, `WebAudioSpeaker.unlock` e `WebAudioSpeaker.close` lo fanno.
- **Un passaggio costa microsecondi.** Una scheda Script gira entro la sua scadenza (`scriptLimits.deadlineMs`), e la pagina non viene disegnata mentre gira.
- **Una sola coda, nell'ordine delle chiamate.** Le chiamate su una sessione vengono fatte una dopo l'altra; un `Player` è quella coda, e rifiuta un verbo dall'interno della propria consegna con `ReentrantVerb`.
- **I timer** sono quelli del `Player`, per un'attesa, e quelli del `SoundscapeDriver`, che scatta ogni `tickMs` mentre qualcosa suona e si ferma quando è inattivo o in pausa.

| Oggetto | Si rilascia con |
| --- | --- |
| `Player` | `dispose()`: niente più attese, niente più consegne. |
| `SoundscapeDriver` | `dispose()`: interrompe il suono e ferma ogni voce. |
| `WebAudioSpeaker` | `close()`: chiude il suo `AudioContext`. |
| `Session` | `stop()` la termina. Non ha un `dispose`. |
| `Campaign` | Nessun `dispose`. Il suo motore compilato resta in cache per la pagina. |

## Un host completo

Una pagina con un elemento `#stage`, un pulsante `#begin` e una select `#locale`, che rende il Markdown con `marked` e lo sanifica con `DOMPurify`. I nomi delle callback (`chapterTwo`, `goldChanged`, `skipAhead`) sono quelli dell'autore, concordati con te.

```ts
import {
  Campaign,
  type Effect,
  EngineTrap,
  HostError,
  LoadError,
  NeedsPython,
  type Passage,
  Player,
  type Prompt,
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

function showPrompt(prompt: Prompt): void {
  const form = el('form');
  for (const field of prompt.fields) {
    const input = el('input');
    input.name = field.name;
    if (field.type === 'bool') input.type = 'checkbox';
    else if (field.type === 'int' || field.type === 'float') input.type = 'number';
    if (field.default !== null && typeof field.default !== 'object') {
      input.value = String(field.default);
    }
    const label = el('label', field.name);
    label.append(input);
    form.append(label);
  }
  form.append(el('button', 'Continue'));
  form.onsubmit = (event) => {
    event.preventDefault();
    const values: Record<string, RippleValue> = {};
    for (const field of prompt.fields) {
      const input = form.elements.namedItem(field.name) as HTMLInputElement;
      values[field.name] =
        field.type === 'bool'
          ? input.checked
          : field.type === 'int'
            ? BigInt(Math.trunc(Number(input.value || 0))) // an Int is a bigint
            : field.type === 'float'
              ? Number(input.value || 0)
              : input.value;
    }
    try {
      player?.answer(values);
    } catch (error) {
      fail(error);
    }
  };
  stage.replaceChildren(el('h2', prompt.title), form);
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

## Vedi anche

- [Incorporare il motore](/it/explanation/embedding-the-engine/): perché un host ha la forma di sessioni, effetti e uno speaker.
- [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/): versioni, varianti e la Runtime Licence che il player porta con sé.
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): i passi da una campagna esportata a un host funzionante.
- [Target del motore](/it/reference/engine-targets/): ogni piattaforma per cui il motore viene compilato.
- [Callback dell'host](/it/explanation/host-callbacks/): a che cosa servono le callback con nome di un autore, e come si incontrano le due metà.
