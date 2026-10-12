---
title: Come procede una storia
description: Perché i collegamenti di controllo di una lavagna vengono spinti e quelli dei dati letti, perché la storia va solo avanti, e cosa significa per i rami e per il punto in cui una storia comincia.
---

Una lavagna sembra un diagramma, ma il motore la legge come due cose diverse disegnate sulla stessa tela: un percorso che la storia attraversa e un insieme di domande che le schede pongono mentre lo attraversano. La maggior parte delle sorprese su una lavagna, un valore vecchio di un turno o un'impostazione che sembra non essere mai scattata, nasce dallo scambiare un collegamento per l'altro. Questa pagina spiega il ragionamento, così che le [diagnostiche](/it/reference/diagnostics/) sollevate dall'app si leggano come conseguenze di un solo modello e non come regole separate.

## Due tipi di collegamento

Ogni porta di una scheda è di uno di due tipi, e la tela li disegna distinti.

Le porte di **controllo** trasportano la storia. L'ingresso di una scheda si chiama `exec`; le sue uscite sono le scelte, i rami, il *first* e l'*again* di un gate, il `completed` di un nodo che si è limitato a fare qualcosa. La storia è il percorso che parte da Start lungo i collegamenti di controllo: una scheda fa il proprio turno, passa il flusso a una delle sue uscite di controllo, e la successiva fa il suo. Due rami che convergono su una scheda la eseguono due volte. Non si aspetta che arrivino entrambi, perché un ramo che una condizione non imbocca farebbe aspettare per sempre.

Le porte **dati** trasportano valori: un numero, un nome, una lista di goblin, lo stato in cui si trova una macchina. Un collegamento dati non è un passo della storia. È una domanda che la scheda all'altro capo pone quando arriva il suo turno.

La tela disegna le porte di flusso come triangoli e le porte di valore come punti.

Il controllo viene **spinto**: una scheda fa il proprio turno perché quella prima di lei ha passato il flusso. È un unico motore, lo stesso che tu prema Gioca nell'app o distribuisca la campagna, quindi una storia non si legge in un modo nell'editor e in un altro nella copia distribuita (vedi [Perché l'anteprima è la storia pubblicata](/it/explanation/the-preview-is-the-shipped-story/)). Un collegamento dati è una **lettura**: quando una scheda fa il proprio turno e legge un ingresso dati, ottiene ciò che la scheda all'altro capo ha pubblicato per ultimo. Leggere non valuta nulla. Il motore potrebbe ottenere un valore su richiesta da una scheda senza alcuna porta di controllo, ma ogni scheda su questa tela ha un ingresso e un'uscita, quindi in pratica nulla viene tirato.

### Perché i valori possono pendere dalla storia

Ogni scheda ha porte di controllo, quindi una scheda che la storia non raggiunge non farebbe mai il proprio turno, eppure qualcosa più avanti potrebbe leggerne il valore. Prima che una storia cominci, il motore percorre all'indietro i collegamenti dati a partire da tutto ciò che Start può raggiungere e trova quelle schede. Sono **preparate**: eseguite una volta prima della storia, in ordine di dipendenza, così che chi le legge trovi il valore già lì.

È questo che ti permette di collegare la storia e lasciare i valori appesi ad essa: un Number in un Set variable, una String nel nome di un Component, un Get variable in un Output. Nessuno di loro ha bisogno di un collegamento `exec`. Disegni un solo percorso di controllo corretto, e ogni valore letto da una scheda su di esso viene calcolato prima che la scheda venga eseguita.

Il prezzo è una regola. **Un valore che dipende da qualcosa che fa la storia deve stare nel flusso dopo di essa.** Un Comparator appeso a un Dice roller viene preparato prima che la storia cominci, prima che ci sia un tiro da confrontare, e risponde per un totale che non esisteva ancora. Collega il `completed` del Dice roller al Comparator e quello del Comparator all'If, e il confronto avviene quando è avvenuto il tiro. La preparazione serve per i valori che sono veri prima della storia; il flusso serve per i valori che la storia produce.

## La storia va solo avanti

Leggere un valore non fa mai eseguire una scheda. La storia arriva a una scheda, la scheda guarda cosa è collegato ai suoi ingressi, e ciò che trova è **qualunque cosa quella scheda abbia pubblicato l'ultima volta che ha avuto un turno**: in questo turno, in un passaggio precedente, nella preparazione prima dell'inizio della storia, oppure nulla. Niente viene recuperato risalendo il collegamento ed eseguendo di nuovo la scheda. È voluto, perché un valore che potesse far eseguire la propria scheda all'indietro significherebbe che leggere un numero tira un dado.

La conseguenza è che un valore si trova sempre in uno di tre stati, e solo il primo è quello che di solito vuoi.

- **Calcolato all'arrivo.** Le sue schede sono nel flusso appena prima di ciò che le legge, quindi ogni percorso verso quel passaggio le esegue. È la forma a cui puntare. Per più valori insieme, metti un **Do all** davanti al passaggio, con una catena per valore e il suo `completed` collegato in avanti.
- **Calcolato prima della storia.** Nulla nel flusso lo raggiunge, quindi è stato preparato e risponde allo stesso modo a ogni visita. Va bene per un numero o un nome e va male per qualunque cosa la storia cambi. L'app solleva `W.GE.05` ovunque le schede di un valore preparato leggano qualcosa che la storia cambia. I casi sono un confronto con un dado, la lettura di una variabile o la risposta di un gate, tutti calcolati prima che ci fosse un tiro, prima che la variabile fosse impostata, prima che il gate fosse stato attraversato. Lo stesso vale per la **condizione di accesso di una scelta**: un `bool` collegato al piccolo ingresso sulla riga di una scelta viene calcolato in tempo solo se le schede che lo producono stanno nel flusso che porta al passaggio. Appeso di lato, viene calcolato una volta prima che la storia cominci e risponde allo stesso modo per sempre, e il messaggio nomina la scelta.
- **Rimasto da un altro percorso.** Le sue schede sono nel flusso, ma la strada fatta dal lettore questa volta non è passata da loro, quindi il valore è quello di un turno precedente. Da quale visita provenga non è qualcosa che si possa stabilire, ma la domanda che ci sta dietro è una che l'app può porre. `W.GE.06` chiede se ogni percorso verso la scheda che legge il valore esegua la scheda che lo produce, e lo segnala quando uno non lo fa. Un collegamento dati è una lettura di ciò che la sua scheda ha pubblicato per ultimo: se ogni percorso esegue prima quella scheda, ciò che arriva è di questa visita, e se un percorso la salta, arriva ciò che ha pubblicato l'ultima volta, che può venire da una visita precedente o, alla prima, da nulla.

`W.GE.06` merita uno sguardo più che essere un problema, ed è una domanda più che un'accusa, perché a volte il valore più vecchio è esattamente ciò che intendevi. Un totale parziale legge la propria ultima risposta, e un flag impostato una volta all'ingresso deve essere ancora impostato al ritorno. Quindi si può rispondere scheda per scheda: spunta *È intenzionale* sulla sua riga nel pannello Messaggi e l'app smette di chiederlo per quella scheda. La risposta viene ricordata, e `W.GE.06` è l'unico codice che offre la spunta.

Una lavagna segna le schede a cui si riferisce una segnalazione, e il pannello Messaggi le elenca tutte. Il [riferimento delle diagnostiche](/it/reference/diagnostics/) contiene tutti e quattordici i controlli codificati sulla forma di una lavagna, compresi i due qui sopra.

### Cicli e cerchi

I collegamenti che tornano su se stessi vanno bene, e il modello spiega perché. Un collegamento di controllo verso una scheda precedente è un ciclo, ed è così che funzionano un hub o una conversazione. Un collegamento dati che rientra nella scheda che lo alimenta legge la risposta precedente di quella scheda, ed è così che funziona un totale parziale: è un valore, non una domanda posta in cerchio. La prima volta non c'è stato alcun turno precedente, quindi non legge nulla. `I.GE.11` è l'app che conferma di aver notato un collegamento simile e che è ammesso, non una lamentela.

Ciò a cui il modello non sa dare risposta è un cerchio di schede che leggono l'una dall'altra senza che nessuna abbia un ingresso. Non ci sarebbe alcun valore a cui arrivare: ciascuna verrebbe calcolata quando la successiva lo chiede, e si chiedono a vicenda. È `E.GE.14`. Nulla di ciò che puoi disegnare nell'app lo provoca; esiste perché una campagna costruita da qualcos'altro potrebbe.

## Fare più cose prima di un passaggio

Un **Do all** esegue tutto ciò che gli è collegato, un ramo dopo l'altro, poi prosegue da `completed`. La regola di fondo è che ogni ramo viene eseguito fino alla fine del proprio collegamento prima che parta il successivo, e un passaggio non termina un collegamento. Un passaggio sul ramo due trattiene quindi il ramo tre finché non sono stati letti tutti i passaggi che lo seguono, il che sembra esattamente un Set che non è mai scattato.

È lo stesso modello che va solo avanti visto dall'altro lato, e la descrizione della scheda lo dice. La porta `completed` è il modo per non doverci pensare: metti i lavori sui rami e la storia su `completed`.

## Dove comincia la storia

Una lavagna comincia dalla sua scheda **Start**, e ne ha esattamente una: una lavagna che non ne ha o ne ha due è uno dei controlli codificati (`E.GE.01` ed `E.GE.02`). Dove sta Start sulla tela non conta. La Navigazione Script e la traccia unita pongono la stessa domanda del runner, *qual è la scheda Start?*, quindi un percorso disegnato tra due passaggi è il percorso che la storia segue davvero. Vedi [Rileggere una storia](/it/explanation/reading-a-story-back/).

## Vedi anche

- [Schede](/it/reference/nodes/): cosa prende in ingresso e cosa passa ogni scheda.
- [Diagnostiche](/it/reference/diagnostics/): ogni controllo codificato su una lavagna, con la sua ragione.
- [Come eseguire più lavori prima di un passaggio](/it/how-to/order-jobs-before-a-passage/): la forma del Do all, passo per passo.
- [Come limitare una scelta](/it/how-to/limit-a-choice/): collegare una condizione di accesso perché venga calcolata in tempo.
- [Regole della lavagna e della navigazione](/it/reference/canvas-rules/): le regole che la tela e la traccia seguono.
