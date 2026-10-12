---
title: Aggiornamenti, log e Messaggi
description: Perché gli aggiornamenti sono verificati e mai silenziosi, perché il log di sessione non ha un'impostazione «invia sempre» e perché Messaggi e log sono tenuti separati.
---

L'app fa tre cose per conto proprio: si mantiene aggiornata, scrive ciò che ha fatto e ti dice cose sulla tua cartella. Ognuna ha un destinatario diverso, e le scelte di progettazione qui sotto nascono dal tenere separati i destinatari. La pagina le affronta una alla volta: gli aggiornamenti, le correzioni del motore, il log di sessione e ciò che ne esce, la segnalazione di un bug, poi Messaggi e i file di una versione più recente.

## Un aggiornamento è qualcosa che puoi rifiutare

Dopo la prima installazione, l'app installa da sola i propri aggiornamenti. Una volta per avvio chiede al sito web se esiste una versione più recente. Quando c'è, l'avviso può eseguire l'aggiornamento: scarica il programma di installazione adatto al modo in cui è stata installata *questa* copia (il `.deb`, il `.rpm`, il Setup di Windows o il `.dmg`), lo verifica con il checksum pubblicato dalla versione, lo passa a Setup, a Finder o al tuo gestore di pacchetti e si chiude perché questo possa avvenire. Su Windows, Setup offre di riaprire l'app quando ha finito; su macOS e Linux la riavvii tu.

Passare il programma di installazione alla finestra di installazione della piattaforma, invece di sostituire i file dall'interno dell'app in esecuzione, significa che ottieni la finestra consueta e puoi ancora dire di no. Un download che non corrisponde al suo checksum viene scartato. Dove l'app non riesce a capire come è arrivata, apre invece la pagina di download. Un aggiornamento non chiude mai l'app lasciando lavoro non salvato: un file modificato su disco mentre lo stavi modificando blocca l'aggiornamento, e l'app dice quale.

Installare un programma di installazione scaricato è un passaggio che la piattaforma può mettere in dubbio, perché per ora nulla è firmato digitalmente; [Perché i programmi di installazione non sono firmati](/it/explanation/unsigned-installers/) ne spiega le ragioni, e [Programmi di installazione e primo avvio](/it/reference/installers/) dice cosa chiede ciascuna piattaforma.

## Le correzioni del motore viaggiano a parte

La parte dell'app che gioca e compila le campagne può essere corretta senza un nuovo programma di installazione. Una correzione viene scaricata in background, controllata con una firma prima di essere considerata affidabile e usata dall'avvio successivo. Se l'app va in crash con una correzione attiva, la correzione viene messa da parte automaticamente. Una correzione non cambia mai ciò che l'app può fare.

Poiché avviene senza chiedere nulla, è visibile e reversibile: la barra dell'app mostra un pulsante mentre una correzione sta arrivando e quando è pronta, e il download può essere disattivato, o le correzioni rimosse, in Impostazioni. [Impostazioni, accessibilità e controlli degli aggiornamenti](/it/reference/settings/) elenca i controlli, e [Cosa invia l'app](/it/about/what-the-app-sends/) dice cosa contiene la richiesta.

## Il log di sessione serve per la segnalazione di un bug, e sei tu a decidere cosa ne esce

Ripple Effect tiene un diario di ogni esecuzione. L'app non lo carica mai da sola, e quando vuoi segnalare un bug decidi tu cosa consegnare.

Esiste una sola via che può portarne via una copia, e prima te lo chiede. Se l'app va in crash, al lancio successivo ti mostra il rapporto di crash che ha salvato: ogni file che contiene, la sua dimensione e cosa contiene ciascuno. Viene inviato solo se rispondi *Invia rapporto*. I log della sessione sono tra quei file. Non esiste un'impostazione «invia sempre» né una «non inviare mai». Entrambe trasformerebbero una decisione su un singolo crash in una politica permanente presa prima di aver visto cosa conteneva il crash. La domanda viene invece posta una volta per crash, nel momento in cui puoi vedere di cosa si tratta, e qualunque sia la risposta è definitiva per quel rapporto. [Cosa invia l'app](/it/about/what-the-app-sends/) lo illustra per intero.

Le statistiche di utilizzo seguono la stessa logica con un'impostazione predefinita diversa. Sono opt-in e restano disattivate finché non le attivi. L'app lo chiede una volta, con l'elenco completo davanti alla domanda e non dietro un collegamento, senza nessuna risposta preselezionata, e la risposta può essere cambiata in seguito. Disattivarle distrugge l'identificatore, così nulla di già inviato può essere di nuovo ricondotto a te. I campi e il ritardo sono in [Cosa invia l'app](/it/about/what-the-app-sends/).

### Una sessione è una cartella

Ciò che l'app registra di un'esecuzione vive in una cartella con un breve id come nome: il log, un file separato per ogni tipo di crash e la build su cui ti trovavi. Ogni file ha un solo autore. Il motore Rust, la parte che gioca e compila le campagne, tiene in quella cartella il proprio `engine.log` con lo stesso oscuramento dei dati sensibili, e un crash al suo interno registra il file e la riga da cui proviene, anche in una build di rilascio. Due parti che scrivono nello stesso file dovrebbero accordarsi su un ordine, quindi ciascuna scrive il proprio. Quando un lavoro passa dall'una all'altra, una compilazione per esempio, entrambe lo annotano con lo stesso numero, così le due metà possono essere lette insieme. Un crash scrive ciò che è successo e chiude il log di sessione in un colpo solo, quindi il file è completo anche quando l'app non lo è.

La regola dietro ciò che viene registrato è tenere il profilo di ciò che è accaduto e non il materiale dell'autore: una query string può contenere una credenziale e un argomento può essere un passaggio che hai scritto tu. [Il log di sessione e i rapporti](/it/reference/session-log/) elenca cosa viene registrato e dove si trova la cartella.

### Una sessione con problemi non viene mai scambiata per una sessione pulita

Il log è la prova su cui si regge una segnalazione di bug, quindi il progetto evita i modi in cui un log la perde. Nulla viene scartato. Un messaggio con un a capo al suo interno, come una traceback di Python, non può far sì che il lancio successivo consideri a posto una sessione con problemi e la rimuova. Gli avvisi e i livelli superiori raggiungono il file subito, insieme a ciò che li precede, e un'esecuzione molto lunga prosegue in un secondo file invece di far crescere un file che nessuno può allegare a un issue.

Si ripulisce da sé, dall'altra parte dello stesso patto. Una sessione in cui nulla è andato storto viene eliminata alla successiva apertura dell'app, così la cartella conserva le esecuzioni che valgono qualcosa e non un file per ogni volta che hai aperto un progetto. Se l'app cade prima di poter scrivere il proprio verdetto, il lancio successivo legge correttamente quel file invece di tirare a indovinare.

### Le cose private vengono tolte per prime

L'oscuramento avviene prima che venga scritto qualsiasi cosa. Il tuo nome utente e la cartella home, la posizione del progetto che hai aperto, gli indirizzi e-mail, gli indirizzi di rete e qualunque cosa abbia la forma di una password o di una chiave vengono sostituiti. Questo comprende gli indirizzi e-mail con parti locali accentate o non latine e i nomi di account che terminano con una lettera accentata. Gli orari sono registrati in UTC e non secondo il tuo orologio locale. Un elenco di regole non può sapere che il nome di una lavagna è privato, quindi dare un'occhiata prima di pubblicare vale comunque la pena.

## Segnalare un bug parte da ciò che hai visto

Una segnalazione di bug è il punto in cui il log incontra una persona, quindi l'app risponde da sé alle domande a cui può rispondere: la versione, il tuo sistema operativo e il programma di installazione da cui proviene questa copia arrivano già compilati, così una segnalazione parte da ciò che hai visto invece che da quattro domande. I collegamenti che l'app apre passano da `ripplefx.app`, che ti manda dove quella cosa si trova oggi, così un collegamento in questa versione continua a funzionare se il posto cambia. I passaggi sono in [Come segnalare un bug](/it/how-to/report-a-bug/).

## Messaggi riguarda la tua cartella, il log riguarda l'app

Il pannello **Messaggi** è una cosa diversa dal log. Messaggi è ciò che l'app dice a *te* sulla *tua cartella*: una traduzione rimasta indietro, un'immagine a cui un passaggio fa riferimento e che non c'è, una lavagna senza un punto d'ingresso, un file scritto da una versione più recente. È limitato al progetto aperto e viene svuotato quando se ne apre un altro. Il log è ciò che l'app dice di *sé stessa*, per chi legge una segnalazione di bug. I due hanno lettori diversi, quindi ciascuno contiene ciò di cui il suo lettore ha bisogno. [Diagnostica](/it/reference/diagnostics/) spiega come sono raggruppati i Messaggi e cosa significano i codici.

### I file di una versione più recente vengono rifiutati, non interpretati a caso

Un file di progetto scritto da una versione più recente di Ripple Effect non viene mai letto a metà. Una copia più vecchia dell'app dice che non può leggere il file, ti dice di aggiornare e non vi scrive nulla. Ciascuno di questi file è qualcosa che non potresti riavere se una copia che non lo ha capito lo scrivesse di nuovo. Le cose che fanno solo da cache, come i timestamp di traduzione di un bundle o l'elenco dei progetti recenti, si ricostruiscono guardando di nuovo la cartella, quindi non sono mai un motivo per fermarsi. [File di progetto e cartella .ripple](/it/reference/project-files/) elenca i tipi di file.

## Vedi anche

- [Il log di sessione e i rapporti](/it/reference/session-log/)
- [Impostazioni, accessibilità e controlli degli aggiornamenti](/it/reference/settings/)
- [Cosa invia l'app](/it/about/what-the-app-sends/)
- [Come segnalare un bug](/it/how-to/report-a-bug/)
- [Diagnostica](/it/reference/diagnostics/)
