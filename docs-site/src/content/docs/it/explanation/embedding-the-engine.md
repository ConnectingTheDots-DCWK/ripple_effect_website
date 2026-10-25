---
title: Incorporare il motore
description: Perché ogni binding del motore è la stessa piccola API (una campagna, una sessione e un elenco ordinato di effetti) e che cosa questa forma chiede al programma che esegue una storia.
---

Una campagna esportata dall'editor viene eseguita dal **motore**: lo stesso che fa girare il pulsante Gioca dell'editor, pubblicato a parte perché anche altri programmi possano usarlo. Un gioco, un'app, una pagina o uno strumento lo raggiungono tramite un **binding**, una libreria scritta nel linguaggio di quel programma. Oggi sono quattro: JavaScript e TypeScript, C e C++, C# e Dart. Ognuno si esprime come fa il proprio linguaggio, ma sotto sono tutti la stessa API: impara quella una volta e li capisci tutti e quattro.

L'intero progetto sta in una frase. **L'host non decide nulla della storia né del suono: mostra ciò che gli viene detto, riferisce al motore che cosa ha fatto il giocatore e gli consegna ciò che gli serve del mondo esterno, a cominciare dall'orologio.** Tutto il resto di questa pagina ne discende.

## È l'host a guidare la storia

Il motore non si blocca mai, non dorme mai, non legge mai un orologio, non sceglie mai un proprio seme casuale, non avvia mai un thread e non chiama mai il tuo codice. È una macchina con una sola manovella, e la giri tu con un verbo. Il motore porta avanti la storia fino a dove può arrivare senza il lettore, poi si ferma e dice che cosa sta aspettando: un passaggio da mostrare, un modulo da compilare, un'attesa da far passare oppure una conclusione.

È la forma che ha ogni runtime narrativo maturo già ospitato da un motore di gioco, ed è stata scelta per le stesse ragioni. Non richiede un event loop né da una parte né dall'altra di un confine tra linguaggi. Si adatta altrettanto bene al ciclo dei fotogrammi di un gioco, ai gestori di eventi di un framework di interfaccia e al ciclo di lettura di un terminale. E si compila anche per il browser, dove c'è un solo thread e niente può bloccarsi.

Ne derivano tre conseguenze che contano nella pratica:

- **Il tempo è tuo.** Una scheda Delay non attende: chiede al tuo programma di attendere, e la storia resta dov'è finché non dici che il tempo è scaduto. Il conto alla rovescia di un passaggio funziona allo stesso modo: due attese sul tuo orologio, e un verbo alla fine di ciascuna. Usa il tempo di gioco se il tuo mondo può andare in pausa.
- **Il caso è tuo.** Ogni sessione parte da un seme che scegli tu. Lo stesso seme e le stesse risposte riproducono la stessa storia, ed è ciò che rende riproducibile una segnalazione di bug e deterministico un test.
- **Il mondo è tuo.** Una storia può leggere l'ora del giorno o dove si trova il lettore, e il motore continua a non leggere nessun orologio e a non toccare nessun sensore. I dati vengono spinti, mai tirati: il tuo programma consegna l'istante e la posizione, e la storia legge ciò che le è stato consegnato.

## Tre cose: una campagna, una sessione e gli effetti

Una **campagna** è il bundle aperto. È immutabile e può essere condivisa per tutta la vita del tuo programma. Contiene il manifest (le lingue, le lavagne di ingresso, se il testo è Markdown o HTML, la tabella dei file multimediali) e due ricerche che userai di continuo: un nodo per lavagna e id, per quando una traccia ne nomina uno, e un file multimediale per indice, per quando lo nomina un passaggio o il suono. Una campagna si apre da una cartella, oppure dai suoi file tenuti in memoria quando il tuo programma impacchetta le risorse a modo suo.

Una **sessione** è una partita di una campagna: la posizione del lettore, le variabili della storia e i dadi. Creane una per partita, o per slot di salvataggio. I suoi verbi sono l'unico modo in cui la storia si muove.

Gli **effetti** sono ciò che un verbo restituisce.

## Un verbo risponde con l'elenco di ciò che è successo

Ogni verbo restituisce un **elenco ordinato di effetti**: tutto ciò che la storia ha fatto tra la tua chiamata e il momento in cui si è fermata. L'ultimo effetto è il **turno**, che dice dove si trova ora la storia:

| Turno | Che cosa fa il tuo programma |
| --- | --- |
| permit | Chiede al lettore se la storia può leggere l'orologio o la sua posizione, prima che cominci. |
| show | Disegna un passaggio e le sue scelte. |
| ask | Mostra un modulo e raccoglie le risposte digitate. |
| hold | Avvia un timer e dice al motore quando scatta. |
| ended | La storia ha raggiunto un End scritto dall'autore. |
| failed | La storia si è fermata per un errore, indicando la scheda se può. |
| stopped | La sessione è stata fermata o messa in pausa. |

Prima del turno arrivano i fatti lungo la strada. La storia ha cambiato lavagna. È cambiato il soundscape in vigore. Un comando sonoro per il tuo speaker. Si è mossa una variabile di console, un'entità o la memoria della storia. È scattata una callback con nome pubblicata dall'autore. Una lettura del mondo non ha avuto il valore vero, e la storia ha ricevuto il sostituto del lettore, un rifiuto oppure niente: è un **avviso** (notice), detto una volta per tipo ed esito in una partita, perché gli snippet di un passaggio girano di nuovo a ogni ridisegno e un avviso per ridisegno seppellirebbe quello che contava. Con la traccia attiva c'è anche un passo di traccia per ogni scheda che la storia ha attraversato.

**La risposta è un valore, non un insieme di callback**, ed è la decisione su cui poggia tutto il resto. Un elenco di semplici record attraversa ogni confine tra linguaggi allo stesso modo: una struct C, un record WebAssembly o un oggetto JavaScript. Una callback va reinventata per ogni linguaggio, e con lei le domande su quale thread la esegue e su che cosa succede se lancia un'eccezione. Un binding è quindi uno smistamento su un elenco, e il tuo programma gestisce un caso per ogni tipo di effetto e nient'altro riguardo alla storia. Ogni effetto è una copia, quindi nulla al suo interno rimanda al motore.

**L'ordine fa parte della risposta.** Una modifica allo stato della storia arriva prima del passaggio che riguarda, così un indicatore di stato è giusto nel momento in cui compare la finestra di dialogo. Un soundscape che si ferma arriva prima che inizi il successivo. Una callback su un passaggio arriva prima del passaggio. Applica l'elenco nell'ordine e non devi mai ragionarci sopra.

## Rispondere al turno

Ci sono cinque modi di rispondere a un turno: dare la risposta del lettore a un permesso, selezionare una scelta, lasciare il passaggio senza scegliere, rispondere al modulo, oppure segnalare che l'attesa è finita. Un passaggio con un conto alla rovescia ne aggiunge altri due, far partire il conto alla rovescia e lasciarlo scadere, e la scadenza prende la scelta predefinita dell'autore come la prenderebbe un lettore. Anche riavviare, fermare, mettere in pausa e cambiare lingua sono verbi.

**A un modulo si risponde per nome, mai con le sue parole.** Ogni campo arriva con un'etichetta e un segnaposto nella lingua del lettore, che il tuo programma disegna, mentre il suo nome resta la chiave sotto cui va la risposta. Un campo che l'autore ha segnato come facoltativo può restare vuoto, e allora la storia non legge niente invece del valore vuoto del suo tipo, così può distinguere *saltato* da *risposto 0*. A un campo che offre risposte fisse si risponde con gli ID delle opzioni scelte dal lettore, mai con le loro parole, così una storia non si dirama sulla lingua del lettore.

**Un verbo sbagliato viene rifiutato e nulla si muove.** Scegliere mentre è visibile un modulo, o scegliere un indice che non esiste, è un errore che il tuo programma può intercettare, e la storia resta esattamente dov'era. Nella maggior parte dei casi sono bug dell'host. Alcuni si incontrano nell'uso normale e vale la pena gestirli:

- **Una scelta che ora non è aperta.** Ogni scelta collegata viene offerta, ma una che l'autore ha limitato può essere esaurita o dietro una condizione falsa. Arriva contrassegnata come non disponibile: disegnala in grigio e non renderla selezionabile: selezionarla comunque viene rifiutato.
- **Una lingua che la campagna non ha.** Cambiare lingua mostra di nuovo il passaggio corrente nella nuova, riformula un modulo in attesa e lo annuncia di nuovo, e lascia un conto alla rovescia dov'era; una lingua sconosciuta viene rifiutata e nulla cambia.
- **Un sostituto che non si legge.** Ciò che il lettore ha scritto come sua ora o suo luogo viene rifiutato, con il motivo, quando non è un'ora o un luogo che il motore sa leggere.
- **Una posizione per un tipo che il lettore ha rifiutato.** Una volta che il lettore ha detto no alla sua posizione, una rilevazione che il tuo programma consegna viene rifiutata, così un bug dalla tua parte non può dare a una storia ciò che il lettore ha negato.

**Un'attesa è una richiesta, non un sonno.** Se il lettore mette in pausa, riavvia o ferma nel mezzo di un'attesa, la segnalazione che il tempo è scaduto è innocua quando alla fine arriva. I verbi del conto alla rovescia sono più severi, perché due timer in sequenza sono il punto più comune in cui un host fa scattare il secondo senza il primo: lasciar scadere un conto alla rovescia prima che sia partito viene rifiutato, invece di diventare una scelta predefinita che il lettore non si è visto arrivare, e anche l'uno o l'altro verbo su un passaggio che non ha un conto alla rovescia viene rifiutato.

**Un limite di tempo è una questione di accessibilità, e la risposta sta nel tuo programma.** Le WCAG 2.2.1 chiedono che un lettore possa disattivare o prolungare un limite di tempo. L'orologio è dell'host, quindi può fare l'una o l'altra cosa, non facendo partire nessun conto alla rovescia o facendolo scorrere più lento, senza l'aiuto della storia, e un host per un pubblico generale dovrebbe offrirlo. Un host il cui orologio non attende, come un test o un giro su ogni ramo, non fa partire nessun conto alla rovescia da solo, perché uno risposto subito prenderebbe ogni volta la scelta predefinita.

## Una storia chiede prima di leggere il mondo

Una storia che legge l'orologio o la posizione del lettore lo dichiara nel manifest: il compilatore elenca ogni tipo che legge, e l'autore non tiene mai l'elenco. Ogni tipo parte senza risposta, l'orologio compreso, e finché ne resta uno, il primo turno della sessione è **permit**, che nomina i tipi ancora da rispondere, e nient'altro: nessuna prima pagina e nessuno `story.started`. La risposta che sistema l'ultimo tipo fa cominciare la storia.

Puoi rispondere in qualsiasi momento, anche prima che la storia cominci. Un host che ricorda le risposte del suo lettore le dà prima del primo verbo, e al lettore la domanda non viene mai mostrata.

Ciò che segue un sì spetta al tuo programma. Prima di ogni verbo che può muovere la storia, consegna l'ora, e consegna una posizione ogni volta che ne hai una nuova rilevazione. Una rilevazione consegnata prima della risposta viene tenuta, e letta solo se la risposta è sì, così puoi procurartene una nel momento in cui il lettore acconsente e darla prima della risposta che fa cominciare la storia. Un lettore che preferisce non condividere né l'una né l'altra può dare un **sostituto**: un'ora o un luogo che preferirebbe la storia credesse. Una lettura prende il valore vero quando il tipo è consentito e tu ne hai uno, altrimenti il sostituto, altrimenti viene rifiutata, e una storia non sa distinguere un sostituto dal valore vero, che è proprio lo scopo di darne uno. Ogni lettura che non ha avuto il valore vero è l'avviso di cui sopra.

## Il player è il ciclo, scritto una volta sola

Smistare l'elenco, tenere traccia dell'ultimo turno e far girare il timer è lo stesso codice in ogni host. Per questo ogni binding include un **player**: uno strato facoltativo sopra una sessione che consegna ogni effetto a un unico gestore, in ordine, tiene il turno corrente, risponde da solo a un'attesa quando il tuo ciclo dei fotogrammi o degli eventi la trova scaduta, inoltra il suono al tuo speaker e tiene la tabella delle callback con nome. I suoi verbi sono quelli della sessione. La maggior parte dei programmi usa il player. Quelli che vogliono ogni passo nelle proprie mani usano direttamente la sessione, e non ci perdono nulla.

## Le callback con nome sono l'API dell'autore verso di te

Un autore può pubblicare nella storia dei punti con nome, come `chapterTwoBegan` o `achievementHit`, ciascuno legato a un evento e, se vuole, puntato a una lavagna, a una scheda o a una variabile. Un nome non porta codice: dice che un punto esiste e come si chiama. Il tuo programma registra un gestore per quel nome. Il motore non vede mai la tua tabella: consegna un effetto di callback come tutti gli altri, e il player cerca il nome.

Quattro regole rendono sicuro costruirci sopra:

- **Una callback è una notifica.** Non restituisce nulla e non può cambiare la storia. La storia procede allo stesso modo che qualcuno stia ascoltando o no.
- **Un nome sconosciuto è normale.** I due lati sono scritti da persone diverse e nulla può verificarne uno contro l'altro, quindi un mancato riscontro viene contato, non sollevato come errore.
- **Un gestore che lancia un'eccezione non ferma la storia.** L'errore viene segnalato e il resto dell'elenco viene comunque consegnato.
- **Un gestore non deve chiamare un verbo.** La sessione non è rientrante, e un verbo chiamato dall'interno di un gestore viene rifiutato. Mettilo in coda ed eseguilo quando il gestore è tornato.

Il nome è l'unica cosa che unisce la dichiarazione dell'autore al tuo codice, quindi trattalo come il nome di una funzione che chiama qualcun altro: concordalo presto e rinominalo con cognizione di causa. [Callback dell'host](/it/explanation/host-callbacks/) spiega la metà dell'autore.

## I valori tengono separati interi e decimali

Tutto ciò che è dato e non struttura (una variabile di console, l'attributo di un'entità, la risposta a un modulo, il risultato di uno script) è di un solo tipo: JSON, con la differenza tra intero e decimale conservata. Il `7` e il `7.0` della storia sono valori diversi. Gli interi sono a 64 bit e le mappe mantengono l'ordine in cui l'autore le ha scritte.

Ogni binding traduce questo nei tipi propri del suo linguaggio. In un linguaggio in cui tutti i numeri sono double, il lato intero richiede un tipo più largo. JavaScript usa `bigint`, e Dart compilato in JavaScript arrotonda un intero oltre 2⁵³. Il riferimento di ciascun binding dice come si scrive il tipo.

## Salvare è una stringa

Un **checkpoint** è il turno su cui si trova la storia, scritto come JSON, senza fermarla. Una **pausa** scrive lo stesso salvataggio e poi termina la sessione, fermando il suono nel frattempo. Entrambi esistono solo mentre la storia è su un passaggio o su un modulo, perché una storia nel mezzo di un'attesa non ha un punto stabile da cui riprendere. Conserva il salvataggio insieme al seme e alla lingua, e riprendi con una nuova sessione sulla stessa campagna.

Due cose restano fuori da un salvataggio di proposito. **Le risposte del lettore ai permessi** non ci sono: una sessione ripresa chiede di nuovo, e un host che le ricorda risponde di nuovo senza mostrare la domanda. Un riavvio le mantiene, perché il computer del lettore non è cambiato quando la storia è ricominciata. **L'avanzamento di un conto alla rovescia** non c'è nemmeno lui: la metà già passata era il tuo orologio e mai quello del motore, quindi una storia ripresa su un passaggio a tempo ricomincia la sua attesa da capo.

Un salvataggio nomina la storia da cui proviene. Riprendere un salvataggio la cui lavagna o scheda la campagna non ha più viene rifiutato per nome. È il momento di dire al giocatore che il salvataggio viene da una versione più vecchia della storia. Un salvataggio non porta con sé né la posizione dei dadi né quella del soundscape: lo stesso seme dà gli stessi lanci futuri, e un sottofondo musicale riparte dall'inizio. Un host che ha bisogno dell'esatta continuazione dei dadi legge lo stato del generatore dalla vecchia sessione e lo imposta sulla nuova.

## Il suono ha tre strati

Il suono è dove la regola per cui l'host non decide nulla rende di più:

1. **La sessione** dice che cosa chiede la storia, sotto forma di comandi audio: riprodurre un soundscape, fermarlo con una dissolvenza, azzittire tutto, avviare un suono singolo.
2. **Lo scheduler**, il mixer del motore, li trasforma in singole voci: quale file, da quale punto, a che volume, quando sfuma, quando un soundscape passa il testimone al successivo. Non ha un orologio, né file, né voci proprie.
3. **Lo speaker** produce i suoni. È l'unica parte che tocca un'API audio, e l'unica che scrivi tu.

Tra il secondo e il terzo strato sta il **driver dei soundscape**, che ogni binding include. Fa avanzare lo scheduler dal tuo ciclo, sposta l'inizio di una voce del tempo che il suo file ha impiegato ad aprirsi, attende la dissolvenza di un passaggio di consegne e riferisce allo scheduler la fine di una voce e la durata di un file. Il contratto dello speaker che resta è piccolo. Aprire una voce restituisce il controllo solo quando può partire subito. Riprodurre una voce già in riproduzione la sostituisce. Fermare è per sempre. Le segnalazioni possono arrivare dal tuo thread audio. I guadagni sono sulla scala dell'editor, che è cubica, così uno speaker che converte un guadagno in ampiezza suona come l'ha sentito l'autore.

Un programma che non vuole nulla di tutto ciò può pilotare lo scheduler a mano, e allora si assume in prima persona i compiti del driver.

## Quando qualcosa va storto

Una **storia che fallisce** non è un errore: è il turno failed, con un messaggio e la scheda, e il tuo programma lo mostra come mostrerebbe una conclusione. Gli **errori** riguardano il programma attorno alla storia, e si presentano in una manciata di famiglie che ogni binding nomina:

- **Il bundle non si apre.** Manca un documento o è malformato, oppure la campagna è stata compilata per un contratto più recente di quello che questo motore esegue.
- **Il bundle richiede Python e questo motore non ce l'ha.** Per le due varianti vedi [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/).
- **Un verbo che la storia non stava chiedendo**, come sopra.
- **Un salvataggio che non si può riunire** a questa campagna.
- **Un argomento non valido**, per cui non è stato fatto nulla.
- **Una trap**: il motore stesso è andato in panic.

**Una trap avvelena il suo handle.** La storia potrebbe essere mossa a metà, quindi ogni chiamata successiva su quella campagna o sessione viene rifiutata senza essere eseguita. Il rimedio è lo stesso in ogni binding: eliminala, riapri la campagna e riprendi dall'ultimo checkpoint. È una buona ragione per fare checkpoint spesso, dato che un checkpoint costa poco.

Ogni messaggio è in inglese e pensato per un log. Ragiona sul codice e sui campi dell'errore, mai sul suo testo.

## Un chiamante alla volta

Una campagna o una sessione è usata da un chiamante alla volta e può passare da un thread all'altro. Ogni verbo è sincrono: un passaggio richiede microsecondi. L'eccezione è una storia che esegue Python, dove una scheda Script gira fino al termine dentro il verbo, entro la scadenza data alla sessione. Se è troppo tempo da spendere sul thread dell'interfaccia o del rendering, tieni la sessione su un thread di lavoro e rimanda indietro gli effetti. Sono semplici valori, quindi viaggiano.

## Come un host dimostra di essere corretto

Ogni release del motore porta con sé le **fixture di conformità**: piccole campagne, ciascuna con gli input da riprodurre e la traccia e le callback che un host corretto produce. Ogni binding esegue ogni fixture attraverso la propria API, sia con la sessione sia con il player, quindi un binding che le supera è il motore per quanto una storia riesca a distinguere. Un host costruito su un binding lo eredita e deve solo testare la propria interfaccia. Per una verifica rapida sulla tua campagna, il player da terminale presente in ogni archivio desktop del motore, `ripple <bundle> --auto --seed N`, racconta la storia che un host dovrebbe raccontare per quel seme. Con `--auto` dice no a ogni permesso e non fa mai partire un conto alla rovescia, così un giro con un seme è lo stesso giro domani; `--allow <tipo>` e `--stand-in <tipo>=<testo>`, con `dateTime` o `location` come tipo, rispondono a un permesso in anticipo. Senza `--auto` chiede sul suo input, una volta per tipo, e fa scorrere i conti alla rovescia su un thread di lettura.

## Che cosa viene dopo

Questi quattro binding sono lo strato generico: tutto ciò che c'è qui, nell'idioma di ciascun linguaggio, senza alcuna opinione su che cosa il tuo programma usi per disegnare o per riprodurre il suono. **Le integrazioni per software specifici, a cominciare dai motori di gioco, arriveranno presto.** Saranno costruite su questi binding e completeranno ciò che un binding lascia deliberatamente a te, come lo speaker, la finestra di dialogo e la pipeline delle risorse, nel modo in cui quel software se lo aspetta.

## Vedi anche

- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): i passaggi, in tutti e quattro i linguaggi.
- [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/): che cosa mette un binding nella tua build, le due varianti e perché solo il web ha uno speaker già pronto.
- [Piattaforme e varianti del motore](/it/reference/engine-targets/): ogni target, il suo requisito minimo e quale binding lo distribuisce.
- [JavaScript e TypeScript](/it/reference/binding-javascript/), [C e C++](/it/reference/binding-c-cpp/), [C#](/it/reference/binding-csharp/) e [Dart](/it/reference/binding-dart/): l'API completa di ciascun binding.
- [Riferimento delle callback dell'host](/it/reference/host-callbacks/): gli eventi per cui un autore può pubblicare un nome.
