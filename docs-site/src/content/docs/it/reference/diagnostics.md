---
title: Diagnostica
description: "Ogni messaggio con codice che il pannello Messaggi può mostrare, con il suo testo, il suo significato e la sua correzione."
sidebar:
  order: 1
---

Un messaggio con codice è una regola con un nome. Ha sempre la stessa formulazione e ha un titolo in questa pagina. La maggior parte dei messaggi nel pannello non ha un codice: riferisce di un file, di una traduzione o di qualcosa che l'app non è riuscita a fare. Quelli con codice sono il motore che legge la forma delle tue lavagne.

Un take di una macro dichiarato come map o come JSON non può portare un valore tipizzato dalla scheda; la compilazione lo segnala senza un codice. I take di tipo `int`, `float`, un percorso a un file, un componente o una lista di questi consegnano il loro valore alla storia.

## Formato del codice

```
W.GE.05
│  │  └ the fifth rule about the shape of a board
│  └─── GE: boards. RT: a playthrough. EX: an export.
└────── E a problem · W worth a look · I a record
```

| Lettera | Livello | Significato | Conteggiato sul tab |
| --- | --- | --- | --- |
| `E` | Problema | Una lavagna non può fare ciò che dice: non verrà giocata, oppure una scheda al suo interno non potrà mai fare nulla. | Sì |
| `W` | Merita uno sguardo | La storia viene giocata e potrebbe non fare ciò che intendevi. | Sì |
| `I` | Record | Qualcosa di vero sulla tua lavagna che molto probabilmente va bene. | No |

## Indice

| Codice | Argomento |
| --- | --- |
| [`E.GE.01`](#ege01) | La lavagna non ha uno Start |
| [`E.GE.02`](#ege02) | La lavagna ha più di uno Start |
| [`E.GE.03`](#ege03) | Ingresso obbligatorio non collegato |
| [`W.GE.04`](#wge04) | Schede su nessun percorso |
| [`W.GE.05`](#wge05) | Valore calcolato prima che la storia dipenda da qualcosa che la storia cambia |
| [`W.GE.06`](#wge06) | Un ingresso salta la scheda di cui si legge il valore |
| [`W.GE.07`](#wge07) | Ciclo While senza `break` |
| [`W.GE.08`](#wge08) | Il Jump non può atterrare |
| [`I.GE.09`](#ige09) | Più collegamenti partono da una stessa uscita |
| [`I.GE.10`](#ige10) | Più collegamenti arrivano a un solo ingresso |
| [`I.GE.11`](#ige11) | Il valore torna alla sua scheda |
| [`I.GE.12`](#ige12) | Il percorso si ferma senza un End |
| [`I.GE.13`](#ige13) | Il For supera il limite |
| [`E.GE.14`](#ege14) | Cerchio di schede senza un ingresso |
| [`W.GE.15`](#wge15) | Nome che Python non può leggere |
| [`W.GE.16`](#wge16) | Il callback dell'host osserva qualcosa che non c'è più |
| [`I.RT.01`](#irt01) | La scheda è stata eseguita più di una volta |
| [`W.RT.02`](#wrt02) | Qualcosa ha letto una scheda che non era stata eseguita |
| [`I.RT.03`](#irt03) | Più collegamenti sono arrivati a un solo ingresso |
| [`W.RT.04`](#wrt04) | Una scheda con più uscite non aveva alcun comportamento |
| [`I.RT.05`](#irt05) | Alla storia è stato dato il tuo sostituto |
| [`W.RT.06`](#wrt06) | Alla storia è stato negato qualcosa che ha letto |
| [`I.RT.07`](#irt07) | La storia poteva leggere qualcosa che non c'era |
| [`E.EX.01`](#eex01) | Scheda Script in una campagna senza Python |
| [`E.EX.02`](#eex02) | Passaggio che esegue Python in una campagna senza Python |

## Dove compaiono i messaggi

| Dove | Comportamento |
| --- | --- |
| Pannello Messaggi | I messaggi sono raggruppati per argomento (Lavagne, Traduzioni, Controllo di versione), ogni titolo con un conteggio che puoi comprimere. Raggruppa invece per livello per vedere prima i problemi. Tre chip sopra l'elenco attivano e disattivano problemi, ciò che merita uno sguardo e record. Entrambe le scelte vengono ricordate. |
| Codice | Il codice è un collegamento al suo titolo in questa pagina. |
| Schede | Una scheda nominata da un problema o da ciò che merita uno sguardo viene disegnata con un alone di quel colore e un piccolo segno alla fine della sua intestazione. Passando il mouse sul segno compare l'elenco dei codici su quella scheda e di cosa dice ciascuno. I record non vengono disegnati su una scheda: molti di loro, come due collegamenti da una stessa porta o percorsi che si fermano senza un End, sono il frutto di lavagne ben disegnate, e un segno che di solito non significa nulla è un segno che smetti di vedere. |
| Clic su un messaggio che nomina delle schede | Apre la lavagna e solleva quelle schede. **Esc**, o la croce nella barra degli strumenti, rimette a posto il canvas. |
| Un file scritto da una versione più recente | Un messaggio senza codice. Una striscia in cima al progetto dice cosa non si è potuto leggere, e Messaggi conserva la nota insieme al percorso del file. |
| Nella finestra di gioco | I messaggi `RT` compaiono nella traccia mentre la storia procede, e restano nel pannello Messaggi dopo. |

Una segnalazione nomina le schede a cui si riferisce.

### Quando vengono eseguiti i controlli

| Quando | Cosa viene controllato |
| --- | --- |
| Mentre modifichi | La lavagna su cui stai lavorando, circa un secondo dopo che smetti di scrivere. |
| Premendo **Gioca** | Tutte le lavagne insieme. I controlli che richiedono più di una lavagna, come stabilire se un Jump può atterrare, vengono fatti allora. |

## Lavagne

### `E.GE.01`

**Questa lavagna non ha uno Start, quindi nulla su di essa può iniziare una storia.**

Un Jump può comunque atterrare su una scheda qui e la storia prosegue da lì, ma la lavagna non può essere giocata da sola e viene lasciata fuori dalla campagna quando premi Gioca. Una lavagna macro viene chiamata anziché avviata e non le viene mai chiesto uno Start.

Correzione: aggiungi una scheda Start e collegala al punto in cui inizia la storia.

### `E.GE.02`

**Questa lavagna ha più di uno Start.**

Una lavagna si gioca con un solo ingresso. Facendo clic sul messaggio vengono inquadrati tutti gli Start trovati. Finché non ne resta uno solo la lavagna non si compila, e i controlli di aggiornamento su di essa rispondono per una storia con due inizi.

Correzione: elimina tutti tranne uno.

### `E.GE.03`

**Una scheda non ha nulla collegato a un ingresso senza il quale non può funzionare.**

La `condition` di un If proviene da un'altra scheda, di solito un Comparator; lo stesso vale per i due operandi di un Comparator. Una scheda con un campo al posto dell'ingresso non viene interpellata. Un ingresso vuoto si legge come *nulla*, quindi la scheda risponde allo stesso modo ogni volta.

Correzione: collega l'ingresso, oppure metti davanti a questa la scheda che lo calcola.

### `W.GE.04`

**Un gruppo di schede non si trova su nessun percorso che la storia possa prendere.**

Nessun collegamento di controllo le raggiunge dallo Start e nulla legge un valore da esse, quindi nessuna di loro viene mai eseguita. Facendo clic si inquadra l'intera isola. Le schede che vengono solo lette, come un Number che alimenta un Set, non sono isole: vengono calcolate prima che la storia inizi.

Correzione: collega il gruppo al resto, oppure eliminalo.

### `W.GE.05`

**Un valore viene calcolato prima che la storia inizi, e dipende da qualcosa che la storia cambia.**

Le schede in cui non entra nulla vengono eseguite una volta, prima del primo passaggio. Un confronto con un dado, la lettura di una variabile o la risposta di una porta dipendono da qualcosa che la storia cambia, quindi rispondono allo stesso modo a ogni visita. La regola alla base è in [Come funziona una storia](/it/explanation/how-a-story-runs/).

La condizione di una scelta segue la stessa regola: un `bool` collegato al piccolo ingresso sulla riga di una scelta, appesa al lato del flusso, viene calcolato una sola volta. Il messaggio nomina la scelta.

Correzione: metti le schede nel flusso che porta a ciò che le legge. Vedi [Come costruire una lavagna](/it/how-to/work-on-the-canvas/).

### `W.GE.06`

**Un ingresso non passa dalla scheda di cui si legge il valore.**

Un collegamento dati legge ciò che la sua scheda ha pubblicato per ultimo, e almeno un percorso verso chi legge salta quella scheda, quindi il valore potrebbe essere di una visita precedente o nulla. Un totale parziale o un flag impostato una volta sono pensati per comportarsi così, quindi il messaggio è una domanda. Vedi [Come funziona una storia](/it/explanation/how-a-story-runs/).

Questo è l'unico codice con una risposta: spunta *È intenzionale* sulla sua riga nel pannello Messaggi e smette di chiedere di quella scheda. La risposta viene ricordata.

Correzione: fai in modo che ogni percorso esegua la scheda, oppure spunta *È intenzionale*.

### `W.GE.07`

**Un ciclo While non ha nulla collegato a `break`.**

Solo il limite sul numero di giri che un ciclo può fare può terminarlo, e questo termina l'intera campagna con un errore.

Correzione: collega il lato falso di una condizione a `break`, oppure usa un For, che conta.

### `W.GE.08`

**Un Jump non può atterrare dove è puntato.**

La lavagna che nomina non ha uno Start e il Jump non nomina alcuna scheda su di essa, oppure nomina una scheda che quella lavagna non ha più.

Correzione: scegli di nuovo la scheda, oppure dai a quella lavagna uno Start.

### `I.GE.09`

**Più collegamenti partono da una stessa uscita.**

Lecito. Vengono eseguiti uno alla volta, ciascuno fino alla fine del suo collegamento prima che inizi il successivo, nell'ordine in cui i collegamenti sono stati disegnati, che il canvas non mostra. Il messaggio li elenca in ordine di esecuzione.

Correzione: se l'ordine conta, usa un **Do all**, che lo dichiara sulla scheda.

### `I.GE.10`

**Più collegamenti arrivano a un solo ingresso.**

Un ingresso accetta un solo valore. Il primo arriva; gli altri sono disegnati ma non vengono mai letti.

### `I.GE.11`

**Un valore torna alla scheda che lo produce.**

Consentito, ed è così che si costruisce un totale parziale: il collegamento legge ciò che la scheda ha pubblicato l'ultima volta, cioè il turno precedente, e nulla al primo. Il messaggio lo conferma. Un collegamento di controllo verso una scheda precedente è un ciclo, ed è così che funziona un hub o una conversazione.

### `I.GE.12`

**Un percorso si ferma senza un End.**

La storia non ha un posto dove andare dopo, il che si gioca come se finisse. Una scheda End lo dice sul canvas e dà al lettore una pagina finale.

### `I.GE.13`

**Un For chiede più giri di quanti il limite ne consenta.**

Vince il limite, e termina la campagna con un errore anziché uscire da `exit`.

Correzione: correggi il numero, oppure alza il limite sotto *Riproduzione* nelle impostazioni.

### `E.GE.14`

**Delle schede si leggono a vicenda in cerchio, e nessuna ha un ingresso.**

Non c'è alcun valore a cui arrivare: ciascuna verrebbe calcolata quando la successiva lo chiede. Nulla di ciò che si disegna in questa app produce questo caso; una campagna costruita da qualcos'altro potrebbe.

### `W.GE.15`

**A un passaggio o a un programma viene dato un nome che il suo Python non può leggere.**

I *Reads* di una scheda Narration e gli ingressi e le uscite di una scheda Script diventano variabili digitate nella prosa o nel codice. Un nome deve essere una lettera o un trattino basso seguito da lettere, cifre e trattini bassi, e non una parola chiave di Python come `class` o `None`. `Your roll` è un'etichetta valida sulle righe di una scheda Output, ma nessuno potrebbe scrivere `{{ Your roll }}`, quindi il collegamento verso quello slot non porta da nessuna parte e il passaggio non lo vede mai.

L'editor non ti lascia digitare un nome simile, quindi compare solo su una lavagna scritta da una versione precedente o modificata a mano.

Correzione: rinominalo, per esempio `your_roll`.

### `W.GE.16`

**Un callback dell'host osserva qualcosa che non c'è più.**

Un callback nomina una lavagna e, facoltativamente, una scheda su di essa. Se la lavagna o la scheda vengono eliminate, la dichiarazione viene rimossa dalla campagna compilata o non scatta mai, e chiunque si fosse registrato con quel nome non viene mai avvisato. È l'unico messaggio qui che non riguarda una scheda: nomina il callback e porta con sé la lavagna quando questa è ancora nel progetto.

Un callback rivolto a una variabile di console o a un componente che non esistono più viene segnalato quando la campagna viene costruita, perché quel controllo richiede le variabili e l'indice del progetto. Una scheda mancante non viene controllata altrove. Vedi [Callback dell'host](/it/reference/host-callbacks/).

## Una sessione di gioco

Cose che il motore ha notato mentre la storia era in esecuzione.

### `I.RT.01`

**Una scheda è stata eseguita più di una volta.** Normale in un ciclo o in un hub a cui il lettore è tornato; da controllare se non ti aspettavi che la storia passasse di lì due volte.

### `W.RT.02`

**Qualcosa ha letto una scheda che non era stata eseguita.** Il valore trovato era nulla. È `W.GE.05` e `W.GE.06` visti a posteriori, sul percorso preso dal lettore.

### `I.RT.03`

**Più collegamenti sono arrivati a un solo ingresso,** ed è stato preso il primo. La versione osservata di `I.GE.10`.

### `W.RT.04`

**Una scheda con più uscite non aveva alcun comportamento,** quindi la storia si è fermata lì anziché indovinare quale strada prendere.

I tre seguenti riguardano ciò che una storia legge dal tuo computer: la data e l'ora, e dove ti trovi. Cosa può leggere ciascuna è in *Impostazioni › Autorizzazioni*, insieme al sostituto che le viene detto al suo posto. Compaiono in cima alla finestra di gioco oltre che nel pannello dei messaggi, una volta ciascuno per partita.

### `I.RT.05`

**Alla storia è stato dato il tuo sostituto.** Ha letto la data e l'ora o la posizione, non poteva avere quella vera — non l'hai permesso, o non c'era niente da leggere — e le è stato detto il sostituto che hai scritto. La storia non vede la differenza: a questo serve un sostituto.

### `W.RT.06`

**Alla storia è stato negato qualcosa che ha letto.** Ha letto la data e l'ora o la posizione, che qui non è permessa, e non hai dato un sostituto, quindi il suo script ha ricevuto un `PermissionError`. Se lo script lo intercetta con `except PermissionError:`, la storia prosegue con ciò che dice al suo posto; altrimenti il passaggio mostra un avviso dove sarebbe andato il testo.

Correzione: permettilo in *Impostazioni › Autorizzazioni*, dai lì un sostituto, oppure scrivi l'alternativa nello script.

### `I.RT.07`

**La storia poteva leggere qualcosa che non c'era.** Può leggere la posizione, ma l'editor non legge una posizione reale, quindi `current_position()` ha restituito `None`. Dai un sostituto in *Impostazioni › Autorizzazioni* per dire alle storie un luogo.

## Un'esportazione

Questi compaiono solo quando una campagna deve essere giocata senza Python, per un gioco o un player costruiti senza l'interprete: quando esporti con **Non richiede Python** spuntato, o quando il progetto ha **Python** disattivato sotto *Capacità* nelle sue impostazioni. Ciascuno è un punto in cui la storia eseguirebbe Python. Uno qualsiasi di essi blocca l'esportazione. Con Python disattivato nel progetto, bloccano anche la riproduzione della campagna e compaiono sulle schede come errori mentre disegni. Nessuno è sbagliato su una lavagna, solo per un player che non può eseguirlo. Per annullarli, vedi [Come costruire una campagna senza Python](/it/how-to/turn-python-off/); la casella è descritta in [Opzioni di esportazione e contenuto del bundle](/it/reference/export-options/).

### `E.EX.01`

**Una scheda Script, in una campagna che deve essere giocata senza Python.** Un player senza l'interprete fermerebbe la storia a questa scheda.

Una scheda Script dentro una macro viene segnalata sulla scheda che chiama la macro quando esporti, e sulla lavagna della macro stessa mentre modifichi.

Correzione: sposta ciò che fa lo script su schede che non richiedono Python, oppure esporta con la casella non spuntata. Vedi [Come costruire una campagna senza Python](/it/how-to/turn-python-off/).

### `E.EX.02`

**Un passaggio che esegue Python, in una campagna che deve essere giocata senza Python.** Il passaggio ha un blocco di codice `ripple` o un `{{ … }}` inline in almeno una delle sue lingue, e un player senza l'interprete mostrerebbe un avviso al suo posto. Il messaggio dà il conteggio su tutte le lingue.

Correzione: sostituisci ciascuno con il testo che avrebbe prodotto, oppure dividi il passaggio in modo che una scelta o un ramo scelga tra le versioni.

## Vedi anche

- [Come funziona una storia](/it/explanation/how-a-story-runs/)
- [Callback dell'host](/it/reference/host-callbacks/)
- [Opzioni di esportazione e contenuto del bundle](/it/reference/export-options/)
- [Come costruire una campagna senza Python](/it/how-to/turn-python-off/)
- [Come costruire una lavagna](/it/how-to/work-on-the-canvas/)
