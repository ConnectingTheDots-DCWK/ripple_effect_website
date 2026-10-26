---
title: Callback dell'host
description: "Le regole per il nome di una callback, i venti eventi, i bersagli che ne puntano una, cosa succede a un bersaglio che non c'è più e il file callbacks.json."
---

Una callback dell'host è un **nome** e un **evento**, eventualmente puntato su una sola cosa a cui l'evento accade. Si dichiara nella pagina **Callback dell'host**, che si apre dal pulsante della barra delle attività o dalla Paletta dei comandi, e si salva in `.ripple/callbacks.json`. Una callback non contiene codice e non può cambiare la storia.

## Dichiarazione

| Campo | Regola |
| --- | --- |
| Nome | Una parola in forma di identificatore, come `chapterTwoBegan`. Univoco nel progetto. Privo di spazi iniziali e finali, non vuoto e senza caratteri di controllo, quindi non può contenere un'interruzione di riga. |
| Evento | Uno dei venti eventi qui sotto. L'insieme è chiuso. |
| Bersaglio | Facoltativo. Se manca, vale per ogni occorrenza dell'evento. Vengono offerti solo i campi che l'evento scelto può usare. |

Rinominare una callback rompe il codice dell'host registrato con il vecchio nome.

Cambiare l'evento di una callback rimuove i campi del bersaglio che il nuovo evento non può usare. Un campo che il nuovo evento richiede non può essere compilato al posto tuo, quindi la modifica viene rifiutata finché il bersaglio non lo contiene.

Il pulsante **Dimenticala** rimuove una dichiarazione dopo una conferma. Un host in ascolto di quel nome non lo riceve più.

## Eventi

| Evento | Scatta quando | Può puntare a | Deve puntare a |
| --- | --- | --- | --- |
| `story.started` | inizia una sessione di gioco | niente | |
| `story.ended` | la storia raggiunge una scheda End | niente | |
| `story.failed` | la storia si ferma perché qualcosa è andato storto | niente | |
| `board.entered` | la storia arriva su una lavagna | lavagna | |
| `passage.shown` | un passaggio viene messo davanti al lettore | lavagna, scheda | |
| `choice.taken` | il lettore compie una scelta | lavagna, scheda | |
| `soundscape.changed` | cambia il soundscape in vigore | niente | |
| `delay.started` | una scheda Delay comincia ad attendere | lavagna, scheda | |
| `delay.elapsed` | l'attesa di una scheda Delay è finita | lavagna, scheda | |
| `cvar.changed` | una variabile di console cambia valore | variabile di console, `equals` | variabile di console |
| `entity.spawned` | la storia crea qualcosa | componente | |
| `entity.removed` | la storia dimentica qualcosa | componente | |
| `entity.renamed` | qualcosa che la storia ha creato viene rinominato | componente | |
| `entity.field.changed` | un attributo di qualcosa che la storia ha creato cambia | componente, attributo | attributo |
| `machine.state.entered` | una state machine entra in uno stato | state machine, stato | state machine |
| `node.entered` | il flusso arriva a una scheda | lavagna, scheda | |
| `node.exited` | il turno di una scheda è finito | lavagna, scheda | |
| `node.failed` | la storia si interrompe su una scheda | lavagna, scheda | |
| `countdown.started` | inizia il conto alla rovescia di un passaggio | lavagna, scheda | |
| `countdown.expired` | il conto alla rovescia di un passaggio scade e la storia prende la sua scelta | lavagna, scheda | |

I due eventi `countdown.*` sono arrivati con il formato di bundle 16, i tre eventi `node.*` con il formato 14 e gli altri quindici con il formato 13. `countdown.expired` porta l'indice della scelta presa ed è seguito dal `choice.taken` che ha causato. I nomi degli eventi sono le parole su cui l'host fa la corrispondenza. Sono uguali in ogni lingua e si scrivono esattamente come nel codice dell'host.

### Eventi delle schede

`node.entered`, `node.exited` e `node.failed` scattano a ogni turno di una scheda, di qualunque tipo sia.

- Un passaggio termina quando il lettore ha scelto, non quando compare. `node.entered` scatta quando il flusso arriva, cioè per un passaggio subito prima che venga mostrato. `node.exited` scatta quando il lettore ha risposto e il turno è concluso.
- Un ciclo che esegue una scheda quattro volte scatta quattro volte. La condizione **Solo quando diventa un valore particolare** (`equals`) riguarda i valori, e un turno non ha un valore.
- Una scheda dentro una macro non può essere scelta, perché una macro viene inserita nella lavagna che la chiama e le sue schede non stanno su nessuna area di lavoro con il proprio nome. Punta alla scheda che chiama la macro, che è quella offerta dal selettore.

## Bersagli

Un evento senza bersaglio scatta a ogni occorrenza. La notifica indica quale lavagna, entità o valore, quindi un host può anche filtrare per conto suo.

| Campo del bersaglio | Etichetta nel pannello | Significato |
| --- | --- | --- |
| `board` | Lavagna (predefinito: Ogni lavagna) | Una lavagna, tramite il suo id di catalogo, quindi una lavagna rinominata o spostata resta la stessa lavagna. |
| `node` | Scheda (predefinito: Qualsiasi scheda) | Una scheda su quella lavagna. Richiede `board`; il selettore mostra «Scegli prima una lavagna» finché non ne è scelta una. |
| `cvar` | Variabile di console | Una variabile di console, tramite il suo id nell'editor, quindi rinominare la variabile lascia intatta la dichiarazione. |
| `equals` | Solo quando diventa un valore particolare, poi Valore | Una condizione su `cvar.changed`. Il campo del valore ha il tipo della variabile stessa. Si può scrivere solo dopo aver scelto una variabile, e sceglierne un'altra elimina una condizione scritta per la prima. Il file accetta qualsiasi valore JSON per `equals`; se sia adatto al tipo dichiarato della variabile lo verifica il compilatore. |
| `component` | Componente (predefinito: Ogni componente) | Un componente, tramite il suo id di catalogo. Punta al componente, mai a una singola entità, perché le chiavi delle entità si creano mentre la storia è in esecuzione. |
| `attribute` | Attributo | Un'etichetta di attributo su quel componente. Senza un componente scelto, vale per qualsiasi attributo con quel nome su qualunque cosa la storia abbia creato. |
| `machine` | State machine | Il nome di un'istanza di state machine, non una scheda. |
| `state` | Stato (predefinito: Qualsiasi stato) | Uno stato di quella state machine. Se manca, vale per qualsiasi transizione della state machine. |

### La condizione equals

`equals` scatta sulla transizione verso il valore, non sul mantenerlo.

| Scrittura | Scatta |
| --- | --- |
| `score` impostato a 100 quando è già 100 | no |
| `score` scende a 50, poi risale a 100 | sì, al nuovo raggiungimento di 100 |

## Bersagli mancanti

| Bersaglio mancante | Campagna compilata | Pannello |
| --- | --- | --- |
| Lavagna | La callback viene omessa, con un avviso (`W.GE.16`). | Il campo Lavagna dice che la lavagna non c'è più e che la callback viene omessa. |
| Variabile di console | La callback viene omessa, con un avviso del compilatore. | Il campo Variabile di console lo dice. |
| Componente | La callback viene omessa, con un avviso del compilatore. | Il campo Componente lo dice. |
| Scheda | La callback viaggia intatta e non scatta mai. Che l'id di una scheda sia su una lavagna non viene verificato quando si costruisce la campagna. Segnalato come `W.GE.16`. | Il campo Scheda lo dice finché la lavagna che nomina è aperta. |

`W.GE.16` è indicato per i casi della lavagna e della scheda; per gli altri due non è dichiarato alcun codice. La dichiarazione resta in `callbacks.json` in ogni caso, quindi ripristinare la lavagna dal controllo di versione fa tornare la callback. Una callback non viene mai rimossa dal file al posto tuo.

## Pannello laterale Callback dell'host

La finestra della campagna ha un pannello laterale **Callback dell'host**. Elenca ogni scatto con il suo nome, il suo evento, i campi del payload impostati e l'esito della ricerca. L'editor pubblica i nomi ma non ha alcun host registrato su di essi, quindi di norma ogni scatto appare come un nome che un host avrebbe cercato. Un nome senza nulla di registrato non è un errore, e la storia procede esattamente come avrebbe fatto.

## `.ripple/callbacks.json`

```json
{
  "version": 1,
  "callbacks": [
    { "id": "cb_8f21", "name": "storyBegan", "event": "story.started" },
    { "id": "cb_7f3a", "name": "achievementHit", "event": "cvar.changed",
      "target": { "cvar": "gold", "equals": 100 } }
  ]
}
```

| Chiave | Regola |
| --- | --- |
| `version` | Intero. Un file senza `version` è danneggiato, non vecchio. Un file di una versione più recente viene rifiutato, e il pannello non vi scrive. |
| `callbacks` | Array. Se manca, vale come nessuna. |
| `id` | Stringa obbligatoria. L'identificativo interno dell'editor, usato per distinguere una rinomina da un'eliminazione e una creazione. Non arriva mai alla campagna compilata. |
| `name` | Obbligatorio. Le regole sono in [Dichiarazione](#dichiarazione). Un nome ripetuto viene rifiutato. |
| `event` | Obbligatorio. Uno dei venti eventi. Qualsiasi altro valore viene rifiutato. |
| `target` | Oggetto. Se manca, se è null o se è `{}` significa ogni occorrenza. L'evento decide quali chiavi sono ammesse; una chiave che l'evento non può usare viene rifiutata. `node` senza `board` viene rifiutato. |

Il file è separato da `project.json`, quindi un rifiuto non tocca il titolo o le lingue del progetto. Non è catalogato e non si apre come documento.

## Cosa viaggia

| Trasportato da | Cosa contiene |
| --- | --- |
| Una copia del progetto | `.ripple/callbacks.json`. |
| Una campagna compilata | La tabella da cui un host smista: nome, evento e bersaglio. |

Nessun gestore viaggia, perché qui non se ne scrive nessuno.

## Limiti

- Una callback è solo una notifica; non può cambiare la storia.
- `soundscape.changed` indica quale soundscape è entrato in vigore, e niente di più fine: non un loop, una dissolvenza o un marcatore della cronologia.
- Le callback non sono ordinate rispetto ai frame dell'host. Il motore restituisce un blocco di tutto ciò a cui una mossa ha portato, callback comprese. Una callback arriva prima che la pagina a cui si riferisce venga disegnata; quando un gestore venga eseguito dopo è deciso dall'host.

## Vedi anche

- [Callback dell'host](/it/explanation/host-callbacks/): perché la storia nomina un'occasione e l'host scrive il gestore.
- [Come dichiarare, puntare e dimenticare una callback dell'host](/it/how-to/declare-a-host-callback/)
- [Come giocare e provare una campagna](/it/how-to/play-a-campaign/)
- [La finestra della campagna e le partite salvate](/it/reference/campaign-window/): il pannello laterale Callback dell'host.
- [Diagnostica](/it/reference/diagnostics/): l'avviso `W.GE.16`.
