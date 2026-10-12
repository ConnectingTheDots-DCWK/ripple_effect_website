---
title: File State machine
description: La sintassi di un file *.fsm.mmd, che cosa il lettore accetta e rifiuta, come lo mostra l'editor e che cosa ne portano una partita salvata e un'esportazione.
---

## File

| Proprietà | Valore |
| --- | --- |
| Nome | `*.fsm.mmd` |
| Contenuto | Un `stateDiagram-v2` di mermaid |
| Riga di versione | Nessuna. Il formato è di mermaid, quindi l'intestazione `stateDiagram-v2` è la versione che mermaid gli ha dato. |
| Creato da | **Nuova State machine** nel menu contestuale dell'albero dei file |
| Visualizzato da | Qualsiasi renderer mermaid |

La sintassi completa di mermaid è nel [riferimento ai diagrammi di stato](https://mermaid.js.org/syntax/stateDiagram.html) di mermaid. Le tabelle qui sotto riportano il sottoinsieme che Ripple Effect legge.

## Esempio

Ogni transizione è `From --> To : event`.

```text
stateDiagram-v2
    [*] --> Locked
    Locked --> Unlocked : key
    Unlocked --> Open : push
    Open --> Unlocked : pull
    Unlocked --> Locked : lock
```

## Righe che il lettore comprende

Prima dell'analisi, il lettore elimina i commenti `%%`, rimuove gli spazi ai bordi di ogni riga e salta le righe vuote.

| Riga | Significato |
| --- | --- |
| `stateDiagram` o `stateDiagram-v2` | L'intestazione. Deve venire per prima. Un'intestazione mancante è un solo errore, e l'analisi continua. |
| `%%` … | Commento. |
| `direction …` | Ignorata. |
| `[*] --> S` | L'inizio: lo stato in cui parte la macchina. |
| `S --> T : event` | Una transizione da `S` a `T` che scatta su `event`. |
| `S --> [*] : event` | Una transizione verso la fine. |
| `state "Long name" as S` | Uno stato con un'etichetta. |
| `state S` | Uno stato senza etichetta. |
| `S : description` | Uno stato con un'etichetta presa dalla descrizione. |
| `note left of S : …`, `note right of S …` … `end note` | Ignorate, su una riga o come blocco. |

Un id di stato corrisponde a `[A-Za-z_][\w.\-]*`: lettere, cifre, trattini bassi, punti e trattini, senza iniziare con una cifra.

## Righe che il lettore rifiuta

Una riga rifiutata viene segnalata con il suo numero di riga.

| Riga | Risultato |
| --- | --- |
| `state X <<choice>>` e altri stereotipi | Rifiutata |
| `state X {` (stato composto) e una `}` isolata | Rifiutata |
| `--` (concorrenza) | Rifiutata |
| Un secondo `[*] -->` | Errore: una macchina parte da un solo stato. |
| `[*] --> [*]` | Errore |
| Nessun inizio, o un diagramma vuoto | Errore alla riga 0 |
| Qualsiasi altra riga | Rifiutata |

Un diagramma con un errore qualsiasi non produce alcuna macchina. Un compilatore ne include una vuota e lo segnala.

## Avvisi

| Caso | Risultato |
| --- | --- |
| Una freccia senza evento | Disegnata e conservata tra le transizioni, ma non può mai scattare, e un'esportazione non la scrive nella tabella delle transizioni. L'editor lo segnala. |
| Un evento sulla freccia di inizio | Ignorato. |

## Modello dati

| Parte | Contenuto |
| --- | --- |
| Stato iniziale | La destinazione della freccia di inizio. |
| Stati | Nell'ordine della prima menzione, mai `[*]`. Un'etichetta di `state "…" as` o di `id : …` prevale su una menzione semplice. |
| Transizioni | Nell'ordine del file, ciascuna con `from`, `to`, `event` e `line`. |

## Editor

| Comportamento | Dettaglio |
| --- | --- |
| Disposizione | Il testo da un lato, l'immagine dall'altro. |
| Ridisegno | Mentre scrivi. |
| Immagine | Adattata al pannello e mai ingrandita. Zoom e spostamento; il pulsante **Adatta al pannello** la adatta di nuovo. |
| Problemi | Elencati con le loro righe. |
| Finché il testo non viene analizzato | L'ultima macchina analizzata con successo resta disegnata, in grigio. |
| Conteggi | Una scheda mostra quanti stati e quante transizioni ha una macchina. |

## In una partita salvata

Un salvataggio porta ciò che ogni macchina ricorda. Un salvataggio fatto prima che un progetto avesse macchine viene letto come se non ricordasse nulla.

## In un'esportazione

Una campagna compilata porta ogni macchina come tabella delle transizioni, così un runtime non ha bisogno di un parser mermaid. Il compilatore scrive la tabella con lo stesso lettore da cui disegna l'editor, quindi un file che si disegna è un file che si gioca.

## Vedi anche

- [State machine](/it/explanation/state-machines/): perché una macchina è un disegno e come si comporta in una storia.
- [Come aggiungere una State machine a una lavagna](/it/how-to/add-a-state-machine/): la scheda State machine, il suo evento e la sua istanza.
- [Schede](/it/reference/nodes/): le porte della scheda State machine.
- [Opzioni di esportazione e contenuto del bundle](/it/reference/export-options/): che cosa porta una campagna compilata.
