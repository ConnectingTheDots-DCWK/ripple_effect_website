---
title: Suoni
description: La firma di play_sound, i suoi argomenti, il comportamento su ogni superficie e le frasi con cui rifiuta.
---

`play_sound` è la controparte Python della [scheda Play sound](/it/reference/nodes/). È disponibile su ogni superficie; ciò che cambia da una superficie all'altra è se avvia un suono o lo rifiuta.

## `play_sound(path, volume=1.0, speed=1.0)`

Avvia un file che la campagna include: una volta, subito, tornando prima che si senta qualcosa. Il valore restituito è sempre `None`. L'host potrebbe non aver ancora aperto il file, e la storia non resta in attesa.

| Argomento | Obbligatorio | Predefinito | Significato |
| --- | --- | --- | --- |
| `path` | sì | nessuno | Il file, scritto come lo scrive il progetto (`sfx/bell.ogg`) o come lo scrive il bundle (`media/sfx/bell.ogg`). Entrambi indicano lo stesso file, perché un'esportazione colloca ogni risorsa sotto `media/`. Gli spazi iniziali e finali vengono ignorati. |
| `volume` | no | `1.0` | Guadagno, da 0 a 1. |
| `speed` | no | `1.0` | Velocità di riproduzione, dove 1 è quella propria del file. Deve essere maggiore di 0. |

`volume` e `speed` possono essere passati per posizione o per nome. Nessun'altra parola chiave è accettata; è la [regola di chiamata](/it/reference/python/) che ogni funzione di questo livello rispetta.

```python
play_sound("sfx/bell.ogg")
play_sound("sfx/bell.ogg", volume=0.4)
play_sound("media/sfx/bell.ogg", 0.4, 1.2)
```

## Non previsto

| Assente | Dove si fa invece |
| --- | --- |
| Impostare un soundscape da Python | Un soundscape si imposta su un passaggio, come documento che il progetto può riutilizzare. |
| Fermare un suono, attenderne uno o chiedere cosa è in riproduzione | Da nessuna parte. Un avvio è «spara e dimentica». |
| Un percorso fuori dal bundle | Da nessuna parte. Ogni suono che una storia può riprodurre è nella campagna. |

## Superfici

| Superficie | `play_sound` |
| --- | --- |
| script | Avvia. |
| sessione di gioco | Avvia quando la finestra della campagna ha dato alla console qualcosa attraverso cui riprodurre; altrimenti rifiuta con la frase del tempo di progettazione. |
| passaggio | Rifiuta, con una frase tutta sua. |
| console, agente | Rifiuta, con la frase del tempo di progettazione. |

Un passaggio rifiuta sempre; i suoi snippet vengono rieseguiti a ogni ridisegno e a ogni cambio di lingua.

## Rifiuti

Ogni rifiuto è un `RuntimeError` che uno script può intercettare, con una di queste frasi. Le frasi sono bloccate, perché uno script può ramificarsi in base a quella ricevuta.

| Quando | Frase |
| --- | --- |
| Lo chiama un passaggio. | `a passage cannot play a sound — its snippets run again every time it is redrawn, so put this on a Play sound node or in a Script node` |
| Lo chiamano la console del tempo di progettazione o un agente, oppure una console attiva non ha nulla attraverso cui riprodurre. | `no campaign is running, so there is nothing to play this through — press play, or put this on a Play sound node` |
| `path` è vuoto o non è una stringa. | `play_sound: needs a path` |
| `path` non indica nulla che la campagna includa. | `play_sound: nothing in this campaign is called "<path>"` |
| `volume` è fuori dall'intervallo da 0 a 1. | `play_sound: volume is <v>, and it runs from 0 to 1` |
| `volume` non è un numero. | `play_sound: volume has to be a number` |
| `speed` è pari o inferiore a 0. | `play_sound: speed is <v>, and it has to be more than nothing` |
| `speed` non è un numero. | `play_sound: speed has to be a number` |

Ordine dei controlli: gli argomenti vengono controllati prima della superficie, quindi una chiamata nella console del tempo di progettazione segnala un volume errato invece di dire soltanto che la console non può riprodurre. Il percorso viene risolto dopo entrambi, perché una superficie che non può riprodurre non ha nulla rispetto a cui risolverlo.

## Cosa viene comunicato a un host

Un avvio arriva a ciò che sta riproducendo la campagna come percorso del file nel bundle, un guadagno e una velocità, insieme all'id della scheda Script il cui programma ha fatto la chiamata. Viene inviato un evento per chiamata, nell'ordine delle chiamate. Il runtime non riproduce nulla da sé.

## Versionamento

Il nome e le frasi qui sopra sono un contratto con ogni script scritto su di essi dalla 1.4 in poi. Si aggiunge, non si cambia scopo. Aggiungere un argomento è un ampliamento; cambiare il significato di un argomento non lo è.

## Vedi anche

- [Soundscape e suoni singoli](/it/explanation/soundscapes-and-sounds/): perché il runtime non riproduce nulla e dove si imposta un soundscape.
- [Come aggiungere il suono a una storia](/it/how-to/add-sound-to-a-story/)
- [Schede](/it/reference/nodes/): la scheda Play sound.
