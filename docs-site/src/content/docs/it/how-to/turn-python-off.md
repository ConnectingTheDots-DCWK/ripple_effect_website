---
title: Come creare una campagna senza Python
description: Disattiva Python nelle impostazioni di un progetto perché l'app segnali ogni scheda che richiede l'interprete, ed esporta una campagna per un player costruito senza.
---

Usa questa guida quando la campagna è destinata a un gioco o a un player costruito senza l'interprete Python, e vuoi che l'app ti indichi tutto ciò che ne avrebbe bisogno.

1. Apri le impostazioni del progetto e vai alla pagina **Capacità**.
2. Disattiva **Python**.
3. Apri **Messaggi**. Ogni scheda Script e ogni passaggio con un blocco `{{ … }}` o `ripple` è elencato lì e segnato come errore sulla sua scheda:
   - [`E.EX.01`](/it/reference/diagnostics/#eex01) è una scheda Script.
   - [`E.EX.02`](/it/reference/diagnostics/#eex02) è un passaggio che esegue Python, in una qualsiasi delle sue lingue.
4. Sostituisci ciascuno con schede che non richiedono Python, come una variabile di console impostata e letta da schede proprie, o una ramificazione su un valore. Finché ne resta anche solo una, la campagna non si può giocare né esportare.
5. [Esporta la campagna](/it/how-to/export-for-a-player-without-python/). **Non richiede Python** è selezionato nella finestra di esportazione e non può essere deselezionato finché il progetto ha Python disattivato.

Per tornare indietro, riattiva **Python**. Nulla del progetto è cambiato, e si gioca e si esporta come prima.

:::note
Cosa fa un player costruito senza Python con una campagna che contiene ancora Python è spiegato nella [guida all'esportazione](/it/how-to/export-for-a-player-without-python/).
:::

## Vedi anche

- [Come esportare per un player senza Python](/it/how-to/export-for-a-player-without-python/)
- [Come eseguire Python in una storia](/it/how-to/script-a-passage/)
- [Python in una storia](/it/explanation/python-in-a-story/)
- [Diagnostica](/it/reference/diagnostics/)
