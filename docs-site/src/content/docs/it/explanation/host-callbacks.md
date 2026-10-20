---
title: Callback dell'host
description: Perché una storia comunica per nome, e solo per nome, al programma che la esegue che cosa è successo, e che cosa questa scelta dà e non dà.
---

Una campagna compilata è pensata per essere eseguita da qualcosa: un motore di gioco, un'app, un terminale. Una **callback dell'host** è il modo in cui la storia dice a quel qualcosa che cosa è appena successo al suo interno, con il livello di dettaglio scelto dall'autore.

L'autore dichiara un **trigger con nome**: un nome e l'occasione che lo fa scattare. Chi incorpora la storia registra una funzione con quel nome. Le due metà sono scritte ai lati opposti di un confine e sono unite da nient'altro che il nome. Questo è l'intero progetto, e vale la pena tenerlo a mente prima di qualsiasi altra cosa su questa funzione.

## Due persone, un nome

L'autore dichiara il trigger e un programmatore scrive il codice. Indicare `chapterTwoBegan` nella pagina **Callback dell'host** dice una cosa sola: in questa storia c'è un punto di estensione, e si chiama `chapterTwoBegan`. La pagina non ha alcun campo per il codice, e nulla di ciò che vi si scrive cambia il comportamento della storia.

Dall'altra parte, nel gioco, qualcuno scrive un gestore e lo registra con quel nome. Quando la storia raggiunge l'occasione, il motore segnala che `chapterTwoBegan` è avvenuto e consegna ciò che sa. Il gestore gira nel loro motore, con i loro tempi.

Il nome è un contratto che nessuno dei due strumenti può verificare. Rinominare un trigger rompe la build del programmatore, e nulla nell'editor può avvisarlo, perché il guasto avviene in un codice che l'app non ha mai visto. Per lo stesso motivo, una callback diretta a una scheda che non è più sulla lavagna non dà mai errore: semplicemente non fa scattare nulla. Il [riferimento](/it/reference/host-callbacks/) spiega che cosa fa ogni destinazione mancante. Tratta un nome come tratteresti il nome di una funzione che chiama qualcun altro: concordalo presto e rinominalo con cognizione di causa.

## Una notifica, non un hook

Poiché il gestore vive fuori dalla storia, una callback non può cambiare la storia. È una notifica, non un hook: la storia prosegue esattamente come farebbe senza nessuno in ascolto, e un nome senza nulla di registrato non è un errore.

Tutto ciò che deve cambiare quello che accade dopo appartiene alla lavagna, come una scheda Script, una variabile o un ramo. Vedi [Python in una storia](/it/explanation/python-in-a-story/) per eseguire il tuo codice dentro la storia.

## Dettaglio fine: osservare le schede stesse

La maggior parte degli eventi descrive qualcosa che accade alla storia nel suo insieme o a ciò che contiene: un passaggio mostrato, una scelta compiuta, una variabile modificata. Tre eventi sono più fini: `node.entered`, `node.exited` e `node.failed`. Scattano a ogni turno di una scheda, di qualunque tipo sia. Puntati a una lavagna e a una scheda, comunicano all'host ogni volta che la storia le attraversa. È la forma di un contatore di missioni, di un evento di analytics, o di un gioco che reagisce a una scena che conosce per nome.

Il turno di una scheda ha un margine a ciascuna estremità, ed è facile sbagliare dove cadono:

- Un passaggio esce quando il lettore ha scelto, non quando appare. L'ingresso scatta nel momento in cui il flusso arriva, che per un passaggio è subito prima che venga mostrato. L'uscita scatta quando il lettore ha risposto e il turno è concluso.
- Fare due giri significa due callback. Un ciclo che esegue una scheda quattro volte scatta quattro volte.
- Una scheda dentro una macro non può essere scelta. Una macro viene innestata nella lavagna che la richiama, quindi le sue schede non compaiono su nessuna lavagna con il proprio nome. Punta invece alla scheda che richiama la macro.

## Perché di default il filtro è lato gioco

Lasciata a sé, una callback scatta a ogni occasione del suo evento: ogni lavagna in cui si entra, tutto ciò che la storia genera. La notifica riporta quale lavagna, quale entità e quale valore, così il gioco può filtrare da sé.

Il pannello può restringere una callback quando è più economico dirlo lì; il [riferimento](/it/reference/host-callbacks/) elenca a che cosa si può puntare con ogni evento. Alcuni eventi non hanno una forma senza filtro sensata. Osservare ogni variabile di console di un progetto non è quasi mai ciò che qualcuno intende, quindi `cvar.changed` richiede una variabile. Un evento di una state machine richiede un'istanza per lo stesso motivo.

Una callback `cvar.changed` può inoltre scattare solo quando la variabile assume un dato valore. La condizione riguarda la transizione, non lo stato. Impostare un punteggio a 100 quando è già 100 non fa scattare nulla, mentre scendere a 50 e risalire a 100 fa scattare di nuovo. Una variabile che ha un valore è un fatto sul presente, mentre arrivare a un valore è qualcosa che è accaduto, e una notifica riguarda le cose accadute.

## Vederle scattare

L'editor pubblica i nomi ma non ha un gioco che reagisca, quindi nella finestra di gioco normalmente non c'è nulla di registrato. Il pannello laterale **Callback dell'host** elenca ogni scatto: il nome, l'evento, i campi del payload impostati e che cosa ne è stato della ricerca. Ogni scatto compare come un nome che un gioco avrebbe cercato. Permette a un autore di verificare che la storia faccia scattare le occasioni dichiarate prima che un programmatore abbia scritto del codice.

## Che cosa non sono le callback

- Non sono un modo per eseguire il tuo codice dentro la storia. Quello è Python.
- Non sono segnali sonori. Un `soundscape.changed` dice quale soundscape è entrato in vigore e nulla di più fine: non un loop, non una dissolvenza, non un marcatore su una cronologia. Sono affari del mixer. Vedi [Soundscape e suoni singoli](/it/explanation/soundscapes-and-sounds/).
- Non sono ordinate rispetto ai fotogrammi del gioco. Il motore consegna un lotto di tutto ciò a cui ha portato una mossa, callback comprese, e il gioco decide quando eseguirle. Una callback arriva prima che venga disegnata la pagina a cui si riferisce. Oltre questo, il momento in cui un gestore gira lo stabilisce il gioco.

## Vedi anche

- [Come dichiarare, puntare e dimenticare una callback dell'host](/it/how-to/declare-a-host-callback/)
- [Riferimento delle callback dell'host](/it/reference/host-callbacks/): gli eventi, i campi di puntamento, che cosa fa una destinazione mancante e che cosa viaggia con un progetto
- [Che cos'è un'esportazione](/it/explanation/what-an-export-is/)
- [Come eseguire una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/): registrare un gestore con un nome, nel linguaggio di ciascun binding
