---
title: Un progetto è una cartella
description: Perché un progetto di Ripple Effect è una vista su una normale cartella di file di testo semplice, e cosa ne deriva per il salvataggio, la condivisione e le versioni più recenti dell'app.
---

Un progetto è una cartella che hai già, oppure una che crea l'app per te. In
ogni caso l'app è una *vista su di essa*: l'albero dei file è la directory così
com'è sul disco, e ogni file che mostra è uno che potresti aprire in un altro
programma. Quasi tutto ciò che c'è di insolito nel comportamento dell'app nasce
dal prendere sul serio questa frase.

## Una vista, non un proprietario

L'alternativa è quella più nota: un progetto è un database, o un pacchetto che
l'app crea e gestisce, e i file a cui tieni sono al suo interno. È più comodo
per l'applicazione, perché può dare per scontato che nessun altro tocchi il
contenuto. È più scomodo per te. Una storia custodita in un contenitore opaco
può essere spostata, salvata in backup, cercata o rivista solo dal programma che
l'ha creata, e smette di essere tua da gestire il giorno in cui vuoi usare un
altro strumento.

Ripple Effect fa il compromesso opposto. Indichi all'app una directory e lei ti
mostra ciò che c'è. Non scrive alcuna struttura di base nella tua storia, non
impone alcuna organizzazione e non rivendica alcuna proprietà. Sposta un
progetto, rinominalo, eliminalo dal gestore file: non c'è nient'altro da tenere
allineato. Un progetto che un altro programma ha spostato o eliminato scompare
dalla griglia della home, e basta. Una cartella che è già stata un progetto
arriva con titolo, descrizione, copertina e lingua già compilati, perché erano
nella cartella da sempre, e non viene scritto nulla. Per una cartella semplice
l'app scrive soltanto `.ripple/project.json`, con il titolo impostato per
default sul nome della cartella, a meno che tu non ne indichi un altro.

Il prezzo è che l'app non può dare per scontato di essere sola, ed è per questo
che il salvataggio e il rifiuto di un file più recente funzionano come
descritto più avanti.

## Testo semplice, di proposito

Ogni file di proprietà dell'app è testo semplice. Le lavagne, i componenti e i
soundscape sono JSON, con un nome distintivo dentro `.json` così che gli
strumenti comuni possano comunque leggerli. Una state machine è un diagramma in
un formato che non è affatto nostro. Un passaggio in più lingue è una cartella
di normali file Markdown, e uno script è un file `.py` che puoi aprire in
qualsiasi editor. I tipi di file, e cosa contiene ciascuno, sono in [File del
progetto e cartella .ripple](/it/reference/project-files/).

Dietro questa scelta ci sono due motivi. Il primo è che un formato che uno
script può leggere è un formato da cui non sei vincolato. I tipi degli
attributi, per esempio, sono scritti con i nomi fissi usati nel file, e numeri e
booleani sono veri numeri e booleani JSON anziché stringhe, perché chi legge il
file non dovrebbe dover sapere come il codice li chiama.

Il secondo è il controllo di versione. La prosa vive in Markdown, gli script in
`.py` e i grafi sono JSON con id stabili, così un diff mostra cosa è cambiato e
un conflitto di unione è qualcosa che una persona può leggere. Lo stato per
cartella dell'app è scritto con percorsi relativi e ordinati, così resta
silenzioso in `git diff` e viaggia correttamente in un clone. Non devi portare
un tuo strumento per la cronologia, perché il controllo di versione è integrato
nell'app; [Cronologia, condivisione e
conflitti](/it/explanation/history-and-sharing/) spiega come si appoggia a una
cartella che vedono anche altri programmi.

## Cosa conserva l'app, e perché lo tiene a parte

L'app conserva effettivamente alcune cose di un progetto: il titolo, l'indice
dei suoi file, la disposizione della finestra, le variabili di console che
dichiara, le partite in pausa, i profili di esportazione. Tutto vive in una
sola cartella, `.ripple/`, accanto ai tuoi file, e nulla viene scritto nella
storia stessa. La contabilità interna dell'app ha un posto tutto suo, così non
deve mai imporre una convenzione alla tua.

Lo stesso ragionamento decide dove va a finire un file copiato dentro.
Un'immagine o un suono che scegli da fuori del progetto, per esempio dai tuoi
Download, viene copiato in `.ripple/external/` anziché in una cartella che
l'app inventa in cima alla tua storia. Pescare da fuori del progetto è un modo
per dire che non intendi archiviare quel file, quindi finisce dove finiscono le
cose dell'app. La copia è un interruttore; se è disattivato il file viene
collegato, e un collegamento che esce dal progetto viene segnalato: sotto il
campo e in Messaggi a ogni apertura del progetto.

Fai il commit di `.ripple/`; il motivo è il registro.
Un Jump memorizza l'id di catalogo del proprio bersaglio anziché il suo
percorso, e gli id vivono nel registro, quindi è il registro a tenere un Jump
puntato sulla lavagna giusta dopo una ridenominazione. Il registro indicizza
anche ogni file del progetto, un'immagine, un video, un PDF o una nota oltre ai
file creati dall'app, non appena è nella cartella, così ciò che hai appena
trascinato dentro può essere proposto in un selettore. Questo non significa che
venga distribuito: le esportazioni e le campagne compilate portano i file in
base a ciò che li richiama. Non viene elencato nulla sotto una cartella il cui
nome inizia con un punto, né un file con il nome che inizia con un punto, né
nulla fuori dalla cartella del progetto.

Due cose in `.ripple/` riguardano *te* anziché la storia, e sono quelle che non
dovrebbero viaggiare. `workspace.json`, la disposizione e i documenti aperti, è
per macchina. Le partite salvate sono un fatto che riguarda la tua lettura
anziché la storia. Il controllo di versione integrato lascia fuori entrambi per
te.

## Salvare quando non sei solo

Tutto viene scritto mentre lavori, con un breve ritardo, e la chiusura della
finestra scrive quel che resta. `Ctrl+S` c'è per quando vuoi esserne sicuro.
Vale per ogni tipo di documento, quindi non esiste un «progetto non salvato» da
perdere, e la barra sopra ogni editor dice se il file è stato scritto.

Il salvataggio automatico è sicuro solo perché l'app si aspetta di condividere
la cartella. Un file che un altro programma modifica sotto i suoi occhi viene
notato anziché sovrascritto. È questo che rende ragionevole tenere un passaggio
aperto in un secondo editor, o fare un pull da un coautore, senza che l'app
rimetta silenziosamente al suo posto la propria copia più vecchia.

## Un file più recente non viene mai letto a metà

La stessa cautela vale quando il file è stato scritto da un Ripple Effect più
recente di quello che stai usando. I file portano una versione, e una copia più
vecchia dell'app che ne incontra una più recente non tira a indovinare. Dice
che non può leggere il file, ti dice di aggiornare e non vi scrive nulla.

Vale per i file che non potresti riavere indietro: l'indice, le impostazioni
del progetto, un componente, una lavagna e una partita salvata. Leggerne uno a
metà e salvarlo sovrascriverebbe il tuo lavoro con una copia lacunosa, quindi
l'app si ferma. Una partita salvata che l'app non sa leggere viene rifiutata ed
elencata anziché sovrascritta, e un rifiuto ferma quel solo file, non quelli
accanto. Le cose che fanno soltanto da cache, come gli orari di traduzione di
un bundle o l'elenco dei progetti recenti, sono diverse. Si ricostruiscono
guardando di nuovo la cartella, quindi non sono mai un motivo per fermarsi. La
regola è che tutto ciò che non puoi rigenerare viene rifiutato, e tutto ciò che
l'app può rigenerare viene rigenerato.

## I suggerimenti arrivano a fette

La prima volta che apri ciascun tipo di elemento, la schermata iniziale, una
lavagna, un bundle, un componente, la finestra della campagna, compare una
breve nota, una sola volta, che dice quali sono le parole per quell'elemento.
Non è un tour: non esiste un unico percorso attraverso l'app, dato che puoi
aprire un componente prima ancora di aprire una lavagna, quindi un suggerimento
appartiene a ciò che hai davanti anziché a una sequenza. Qualsiasi suggerimento
può essere richiamato dalla paletta dei comandi, e *Aiuto ▸ Risoluzione dei
problemi ▸ Mostra di nuovo ogni suggerimento* li riattiva tutti.

## Vedi anche

- [File del progetto e cartella .ripple](/it/reference/project-files/): ogni tipo di file, e cosa contiene ciascun file in `.ripple/`.
- [La finestra di lavoro, i menu e la paletta](/it/reference/workspace-window/): la finestra disposta attorno alla cartella.
- [Come creare o importare un progetto](/it/how-to/create-or-import-a-project/): creare un progetto o aprire una cartella che hai già.
- [Come tenere una cronologia e fare il backup di un progetto](/it/how-to/keep-a-history-and-back-up/): mettere la cartella sotto controllo di versione.
