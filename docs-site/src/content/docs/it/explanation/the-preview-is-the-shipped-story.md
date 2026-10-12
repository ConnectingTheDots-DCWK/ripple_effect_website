---
title: Perché l'anteprima è la storia pubblicata
description: "Perché Gioca usa lo stesso motore di una campagna esportata, e le decisioni che ne derivano: scelte esaurite, limite di cicli, salvataggi rifiutati e radici della narrazione."
sidebar:
  order: 4
---

Un'anteprima diversa da ciò che viene pubblicato è un'anteprima che può mentire. Se l'editor eseguisse la storia con un'implementazione e un'esportazione con un'altra, le due potrebbero non concordare. Ripple Effect ha una sola implementazione con cui poter essere in disaccordo.

## Un solo motore, che non ha mai visto l'area di disegno

**Gioca** usa lo stesso motore che esegue una campagna esportata: il motore nativo, che non sa nulla dell'area di disegno. La lavagna che disegni viene compilata in una campagna, e il motore riproduce la campagna. Quello che vedi nella finestra della campagna è quindi la storia compilata in esecuzione, così come la incontrerebbe chi legge l'esportazione. Le regole su come una storia procede sono l'argomento di [Come funziona una storia](/it/explanation/how-a-story-runs/).

Gioca riesegue anche l'indicizzazione prima di compilare. Aggiorna ciò a cui i passaggi rimandano e dove le lavagne saltano, ed è lo stesso indice che legge un'esportazione. Un'immagine aggiunta a un passaggio dopo l'apertura del progetto è quindi presente nella sessione di gioco senza dover prima esportare. Per lo stesso motivo, gli avvisi di compilazione e i controlli del motore su ogni lavagna arrivano in **Messaggi** quando premi Gioca: provengono dal compilatore che usa un'esportazione, così un problema viene trovato mentre sei ancora alla scrivania.

La stessa logica spiega un'asimmetria voluta. Il limite di cicli appartiene all'app e non viaggia mai con una campagna esportata. È una protezione per chi sta testando, non una proprietà della storia.

## Mostrare ciò che è stato speso

Una scelta con un limite **Volte** che è stato esaurito resta sullo schermo, in grigio e non selezionabile, invece di sparire. Il motivo è che un'anteprima serve a dirti cosa incontrerà chi legge. Se le scelte esaurite sparissero, un passaggio in cui ogni percorso è stato speso apparirebbe come una diapositiva vuota, e non potresti distinguere una lavagna rotta da una storia arrivata alla fine. Lasciata visibile, la scelta dice che il percorso esiste ed è stato usato. Come impostare un limite è spiegato in [Come limitare una scelta](/it/how-to/limit-a-choice/).

La lingua di chi legge segue lo stesso principio. Un passaggio senza testo nella lingua scelta lo dice, invece di ripiegare in silenzio su un'altra. Un ripiego silenzioso nasconderebbe la lacuna e renderebbe l'anteprima in una lingua fuorviante rispetto alla storia pubblicata in un'altra. Vedi [Passaggi e traduzioni](/it/explanation/passages-and-translations/).

## Un ciclo che nulla interrompe

Un ciclo da cui nulla esce interrompe la campagna invece di continuare per sempre. Per impostazione predefinita una scheda di ciclo può girare 512 volte in una lavagna; poi la campagna si ferma e ti indica la scheda che è andata fuori controllo. Il *Max iterations* di una scheda For vale comunque per primo, se è più basso. Fermarsi e indicare il colpevole è il comportamento utile in un'anteprima: un ciclo infinito è quasi sempre un errore nella lavagna, e la scheda che è andata fuori controllo è il punto in cui si trova l'errore. Le scelte possibili per il limite sono elencate in [Impostazioni](/it/reference/settings/).

## Un progetto con Python disattivato

Se il progetto ha disattivato Python, ogni scheda Script e ogni passaggio che contiene Python viene segnato come errore ed elencato in Messaggi, e la campagna non verrà riprodotta finché non ne resta nessuno. L'opzione di esportazione **Non richiede Python** è selezionata e bloccata. Nessuno di questi è sbagliato di per sé su una lavagna: lo è solo per un giocatore che non può eseguire Python, quindi riattivando Python lo stesso progetto può essere giocato ed esportato come prima. Vedi [Come costruire una campagna senza Python](/it/how-to/turn-python-off/).

## Partire da dove stai guardando

**Gioca da qui** comincia da qualsiasi scheda invece che dalla scheda Start. Parte senza che nulla sia stato ancora prodotto, e lo dichiara. Ciò che un'esecuzione avrebbe costruito lungo il percorso dipende dai dadi, dagli script e da scelte che nessuno ha fatto, quindi una versione inventata sembrerebbe plausibile e sarebbe sbagliata. Una partenza vuota è onesta. La console nella finestra della campagna è il modo per impostare tutto ciò che la storia avrebbe dovuto avere, e può fare tutto ciò che può fare una scheda Script. Il costo è un po' di lavoro di preparazione; il vantaggio è che lo stato da cui testi è uno che hai scelto tu, non uno che lo strumento ha indovinato. Vedi [Come giocare e testare una campagna](/it/how-to/play-a-campaign/).

## Perché una storia modificata rifiuta un vecchio salvataggio

La pausa scrive un salvataggio automatico in `.ripple/saves/` del progetto. Registra dove ti trovi e tutto ciò che la storia ha prodotto, compreso il conteggio **Volte** di una scelta, così al ritorno trovi un percorso speso com'era quando l'hai lasciato; Ricomincia lo riapre. L'elenco completo è in [La finestra della campagna e le partite salvate](/it/reference/campaign-window/).

Un salvataggio registra un punto in una lavagna. Una lavagna riscritta nel frattempo potrebbe non avere più quel punto, e portarti in un luogo che non significa più ciò che significava sarebbe peggio che rifiutare. Una partita salvata di una storia modificata viene quindi elencata con il motivo accanto e lasciata stare. Mettere in pausa e riprendere nella stessa sessione è volutamente diverso: ti restituisce la lavagna che hai appena modificato, ed è a questo che serve la pausa. I due casi differiscono per intenzione, ed è per questo che uno è consentito e l'altro no.

Un salvataggio registra anche il valore di ogni variabile di console, comprese le variabili di tipo `json`. Una versione più vecchia di quella che ha scritto un salvataggio lo rifiuta invece di riportare in silenzio una variabile `json` al suo valore predefinito, quindi dopo un aggiornamento le partite vanno salvate di nuovo. Qui si sceglie di rifiutare invece di indovinare per lo stesso motivo di prima: una ripresa sbagliata sembra una ripresa riuscita.

I salvataggi sono esclusi dal controllo di versione. Una sessione di gioco è un fatto sulla tua lettura più che sulla storia, e quella automatica viene riscritta a ogni pausa, quindi sarebbe solo rumore nella cronologia. Vedi [Cronologia, condivisione e conflitti](/it/explanation/history-and-sharing/).

## Dove può cominciare una storia

Una lavagna ha un solo Start, e solo uno Start fa cominciare una storia. Le impostazioni del progetto indicano anche le **radici della narrazione**, le lavagne da cui a chi legge è permesso partire. Nulla nell'app dipende da esse, e puoi comunque giocare qualsiasi lavagna da qualsiasi scheda. Sono un'affermazione sulla storia, non una regola per l'editor: un'esportazione le porta con sé, e chiunque legga l'esportazione sa dove l'autore intendeva far cominciare una storia.

## Vedi anche

- [Come giocare e testare una campagna](/it/how-to/play-a-campaign/)
- [Come salvare e riprendere una sessione di gioco](/it/how-to/save-and-resume-a-campaign/)
- [La finestra della campagna e le partite salvate](/it/reference/campaign-window/)
- [Impostazioni, accessibilità e controlli degli aggiornamenti](/it/reference/settings/)
- [Diagnostica](/it/reference/diagnostics/)
