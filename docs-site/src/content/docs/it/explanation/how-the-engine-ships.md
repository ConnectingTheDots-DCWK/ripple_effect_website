---
title: Come viene distribuito il motore
description: Che cosa un binding mette nella tua build, da dove viene, come viene verificato, perché ogni build ha due varianti e perché solo il web ha uno speaker già pronto.
---

Aggiungere un binding al tuo programma aggiunge due cose: il codice del binding, nel tuo linguaggio e sotto licenza MIT, e una **build del motore**, che è il luogo in cui gira ogni regola di una storia. La seconda è una libreria compilata o un modulo WebAssembly che distribuisci dentro il tuo prodotto. Questa pagina parla di quella metà: da dove viene, come entra nella tua build, quale build ottieni e a che cosa ti impegni distribuendola.

## Il motore viene rilasciato per conto suo

Il motore non è compilato dai binding. È compilato dal proprio sorgente, che non è pubblicato, e ogni release viene messa a disposizione come binari in un repository pubblico, [ripple_engine_releases](https://github.com/ConnectingTheDots-DCWK/ripple_engine_releases), con un tag `engine-v<version>`. Una release contiene:

- un archivio per piattaforma e per variante (più sotto);
- un **manifest** che elenca ogni archivio con la sua dimensione e il suo digest SHA-256, **firmato** con Ed25519, e accanto un file `SHA256SUMS`;
- le **fixture di conformità**, le piccole campagne che ogni binding esegue attraverso la propria API per dimostrare di essere il motore.

Un archivio pubblicato non viene mai sostituito. Una release che si rivela sbagliata viene superata dalla patch successiva invece di essere modificata, così un digest che hai fissato continua a indicare gli stessi byte.

## Un numero di versione è un contratto

Le prime due parti di una versione, `1.6`, indicano un **contratto**: il formato delle campagne, i formati che scrive l'editor, le interfacce del motore e le fixture, congelati insieme e battezzati con un nome in codice (1.6 è *Grammar Lich*). L'editor, il motore e ogni binding contano la propria terza parte all'interno del contratto. Così `@ripplefx/player` 1.6.0, i pacchetti C# 1.6.0 e il motore 1.6.0 parlano tutti lo stesso contratto, e quando uno di loro riceve una patch avanza per conto suo: la patch di un binding è una correzione sua, non del motore.

Ne ricavi una regola breve. **Un binding del contratto 1.6 esegue qualsiasi campagna esportata da un editor del contratto 1.6**, e quelle dei contratti precedenti che il motore legge ancora (1.3, 1.4 e 1.5, per il motore 1.6). Una campagna di un editor più recente viene rifiutata all'apertura, con una frase che dice quale versione l'ha creata e di aggiornare. Una patch del motore all'interno di un contratto mantiene ogni interfaccia su cui un binding è stato compilato, ed è per questo che un binding può passare a una patch più recente del motore senza cambiare la propria API.

## Tre vie d'accesso: una libreria C, un componente ed Emscripten

Il motore è scritto in Rust e si raggiunge dall'esterno in una di tre forme, tutte costruite da un'unica descrizione della sua interfaccia:

- **Una libreria C**, per ogni piattaforma nativa. Un header, una libreria condivisa e una statica, con l'elenco delle librerie di sistema che serve a un collegamento statico. I binding C, C++, C# e Dart nativo sono tutti costruiti su di essa. È tipizzata invece di essere un insieme di chiamate JSON, quindi un host non ha bisogno di un parser JSON per eseguire una storia e non deve mai indovinare se `7` è un intero.
- **Un componente WebAssembly**, per i browser e Node. Il binding JavaScript e il backend web di Dart lo trasformano con jco e lo eseguono nella pagina.
- **Una libreria statica per Emscripten**, per un programma che si compila da solo per il browser, come un motore C++ costruito per il web. È di nuovo la libreria C, costruita per il browser, e richiede Emscripten 4.0 o successivo.

Poiché la superficie C e quella WebAssembly sono generate dalla stessa descrizione, non possono contraddirsi. Ogni binding ha gli stessi record nello stesso ordine e gli stessi errori, e [l'API](/it/explanation/embedding-the-engine/) è un unico progetto e non quattro.

## Come un binding porta il motore nella tua build

**Ogni binding fissa una release del motore**: la sua versione e il digest di ogni archivio che usa, registrati nel repository del binding. La firma del manifest viene verificata con la chiave pubblica del motore nel momento in cui il pin viene scritto, quindi un pin nomina una release firmata dai responsabili del motore. Da quel momento, **ogni download viene verificato con il digest fissato prima che qualunque cosa venga estratta**, e una discordanza ferma la build. Ciò che arriva nella tua build è quindi esattamente ciò che era stato fissato.

Il modo in cui l'archivio arriva dipende da ciò che si aspettano gli strumenti del linguaggio:

| Binding | Come arriva il motore |
| --- | --- |
| C e C++ | CMake scarica l'archivio fissato per la piattaforma per cui configuri, al momento della configurazione, e lo verifica. Puoi anche indicargli un archivio che hai incluso nel tuo repository. |
| C# | Il motore è dentro un pacchetto NuGet, come NuGet distribuisce il codice nativo: una libreria per identificatore di runtime, scelta dalla build. |
| Dart | Un hook di build scarica l'archivio per la piattaforma che stai compilando in una cache per utente, lo verifica e include la libreria nella tua app. Il motore web è dentro il pacchetto. |
| JavaScript e TypeScript | Il motore è dentro il pacchetto npm, e un bundler lo copia accanto alla tua pagina. La build del pacchetto verifica anche la firma del manifest, dato che migliaia di altre build prendono un pacchetto npm sulla fiducia. |

Il web è l'unico posto in cui il motore non si può scaricare nel momento in cui serve alla pagina. I download delle release di GitHub non inviano header CORS, quindi un browser non può leggerli. Per questo il motore web viene distribuito dentro il pacchetto e servito dal tuo sito.

Da lì in poi il motore viaggia con il tuo prodotto come qualunque altra dipendenza nativa: dentro il tuo installer, il tuo pacchetto d'app, il tuo APK o le risorse della tua pagina.

## Due varianti di ogni build

Ogni release costruisce ogni target due volte: **`python`**, con l'interprete Python in sandbox che esegue le schede Script e gli snippet nei passaggi, e **`no-python`**, senza. Le due hanno la stessa API, quindi passare dall'una all'altra è un'impostazione di build e non una modifica del codice. La build `no-python` pesa circa la metà in nativo. Sul web la differenza è maggiore, circa 1,36 MB in rete contro circa 0,31 MB, perché l'interprete è la maggior parte del modulo.

Una campagna registra nel proprio manifest se richiede Python. Il motore lo tratta come un'informazione. **I binding la usano per rifiutare in anticipo**: una build `no-python` a cui viene data una campagna che richiede Python la rifiuta all'apertura, con un errore che ne indica il motivo, invece di lasciarla fallire a metà di una storia. Ecco come ogni binding sceglie la variante:

| Binding | L'impostazione |
| --- | --- |
| C e C++ | Un'opzione di CMake, scelta quando configuri. |
| C# | Quale pacchetto del motore referenzi: quello con Python o quello senza. |
| Dart | Una user-define sul pacchetto nel tuo pubspec per le build native, e una define a tempo di compilazione sul web. |
| JavaScript e TypeScript | Scelta al caricamento per impostazione predefinita: il manifest della campagna dice se richiede Python, e solo allora viene scaricato il modulo più grande. Una pagina può imporre l'una o l'altra. |

L'autore può garantire una campagna per la build più piccola. Esportare con **Non richiede Python** ferma l'esportazione se una qualunque parte della storia esegue Python, quindi una campagna che supera il controllo è una che la build `no-python` aprirà. [Che cos'è un'esportazione](/it/explanation/what-an-export-is/) spiega quel controllo, e [Come esportare per un player senza Python](/it/how-to/export-for-a-player-without-python/) ne dà i passaggi.

## Dove gira

In nativo, il motore è costruito per Windows, macOS e Linux su x64 e arm64, per Android su arm64 e x86_64 e per iOS su dispositivi e sul simulatore arm64, senza nulla a 32 bit. Ogni target ha un requisito minimo: glibc 2.35 per Linux, macOS 12, iOS 13 e Android API 24. In un browser gira come componente, oppure come libreria Emscripten per un programma costruito con Emscripten. Non ogni binding copre ogni target. La build per browser di .NET, per esempio, usa un Emscripten più vecchio del minimo richiesto dal motore, quindi C# non gira ancora in un browser. [Piattaforme e varianti del motore](/it/reference/engine-targets/) ha la tabella completa.

## Perché solo il web ha uno speaker già pronto

Ogni binding include il driver dei soundscape, la parte che trasforma il programma del motore in voci. Nessuno di loro produce un suono, tranne uno: il binding JavaScript ha un secondo pacchetto facoltativo, **`@ripplefx/soundscape`**, uno speaker costruito su Web Audio.

La ragione è che il browser è l'unico posto con una risposta sola. **Ogni pagina ha Web Audio**, ed è la stessa API in ogni browser attuale, quindi un solo speaker serve ogni pagina che eseguirà mai una campagna. Farlo bene è un lavoro vero: un sottofondo musicale passa in streaming attraverso un elemento media invece di essere decodificato per intero, il che richiederebbe circa 23 MB al minuto; un effetto sonoro viene decodificato una volta sola, così non è mai in ritardo; ogni guadagno passa per Web Audio, perché iOS ignora il volume proprio di un elemento media; e WebKit blocca un elemento media instradato in Web Audio prima che abbia iniziato a riprodurre. È un lavoro che vale la pena fare una volta per tutti. Il pacchetto non contiene il motore, quindi è semplicemente MIT, e una pagina che preferisce riprodurre il suono a modo suo lo lascia fuori.

Fuori da un browser una risposta così non esiste. Un host C o C++ potrebbe usare miniaudio, SDL, FMOD, Wwise, XAudio, OpenAL o il mixer di un motore di gioco. Un host C# potrebbe usare NAudio, OpenAL, FMOD, oppure l'audio di Unity o di Godot. Un'app Dart potrebbe usare flame_audio, audioplayers, just_audio o SoLoud. Non hanno nulla in comune, ciascuna è una dipendenza più grande del motore, e quale usare è una decisione del gioco, di solito presa molto prima che arrivi una storia. Un speaker distribuito con il binding o trascinerebbe con sé uno stack audio che non hai scelto, o resterebbe inutilizzato accanto a quello che hai scelto. Quei binding distribuiscono quindi il **contratto dello speaker**: una piccola interfaccia, uguale in ogni linguaggio, che implementi sopra l'audio che hai già. Il driver fa tutto il resto.

Dart è il caso limite, dato che il suo backend web gira in un browser. Non include nemmeno lui uno speaker, perché un solo pacchetto serve nativo e web con la stessa API, e uno speaker Web Audio coprirebbe solo metà dei suoi host. Un'app Flutter web ne scrive uno sullo stesso contratto, prendendo `@ripplefx/soundscape` come modello.

## A quali condizioni lo distribuisci

Il motore che inserisci nel tuo prodotto è sotto la **[Runtime Licence](https://legal.ripplefx.app/runtime/)**, non sotto il contratto di licenza dell'editor. È gratuita e senza royalty per qualsiasi prodotto. Lo ridistribuisci senza modifiche di funzione e come parte del tuo prodotto: firmarlo, rimuoverne i simboli, avvolgerlo in un framework o trasformare il componente con un transpiler va bene, ma cambiare ciò che fa no. Ogni archivio contiene un `NOTICE`, e tu lo riproduci ovunque il tuo prodotto elenchi il software di terze parti. Quell'avviso dice anche ai tuoi utenti che cosa possono fare con il motore, quindi un prodotto senza condizioni proprie non ha bisogno di altro. Una versione della licenza resta legata alle release pubblicate mentre era in vigore, così un prodotto che hai distribuito non viene mai rilicenziato sotto i tuoi piedi. [Licenze](/it/about/licensing/) riporta le condizioni per intero.

## Vedi anche

- [Piattaforme e varianti del motore](/it/reference/engine-targets/): ogni target, il suo requisito minimo, che cosa contiene ogni archivio e quale binding lo distribuisce.
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): installare un binding ed eseguire una storia, in tutti e quattro i linguaggi.
- [Incorporare il motore](/it/explanation/embedding-the-engine/): l'API che ogni binding condivide.
- [Licenze](/it/about/licensing/): la Runtime Licence accanto alle condizioni dell'app.
