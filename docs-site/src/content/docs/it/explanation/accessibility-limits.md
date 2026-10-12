---
title: Cosa promettono e cosa non promettono le impostazioni di accessibilità
description: Come sono state scelte le palette per il contrasto e la visione dei colori, perché non esiste una modalità per la visione acromatica, perché manca il supporto per gli screen reader e perché le schede su una lavagna ignorano la dimensione del testo del sistema.
---

Ripple Effect offre due impostazioni di accessibilità proprie, *Contrasto* e *Visione dei colori*, e segue la dimensione del testo del sistema nell'interfaccia. Questa pagina spiega a cosa serve ciascuna e, con la stessa attenzione, dove si ferma. L'obiettivo è che nulla nell'app sembri una promessa che poi non mantiene.

## Due impostazioni, e il tema accanto a loro

Entrambe le impostazioni appartengono all'app, non a un progetto, quindi ti seguono da un progetto all'altro. Sono separate dal tema: puoi avere lo scuro e più marcato insieme, oppure il chiaro con una palette per la visione dei colori. Al primo avvio se ne parla già nella prima pagina, accanto a una piccola anteprima dell'app. Le righe vere e proprie sono elencate in [Impostazioni, accessibilità e controlli degli aggiornamenti](/it/reference/settings/).

Lo stile grafico dell'app che queste impostazioni modificano ha una sua regola sul colore: gli accenti sono un vocabolario, non una tavolozza. Un colore nell'app significa qualcosa, come una famiglia di schede, un percorso tracciato, un segno che il controllo di versione mette su un file o uno stato. Per questo l'accessibilità si ottiene sostituendo interi vocabolari e non tingendo lo schermo.

## Contrasto: più marcato, non diverso

Senza l'impostazione l'app supera già una soglia minima. L'intera palette è misurata rispetto a WCAG 2.1 AA in entrambi i temi: il bordo di un campo di testo, di un pulsante con contorno, di un chip, di un interruttore o di una casella di controllo è ben visibile, e un file escluso dalla cronologia è un punto visibile.

Il contrasto *Elevato* porta il testo del corpo e delle didascalie al grado di accessibilità più rigoroso (AAA) e dà a ogni campo di testo, pulsante, chip, interruttore e casella di controllo un bordo che si trova facilmente. Si ferma deliberatamente lì. I colori restano gli stessi e la pagina non cambia forma.

Il motivo è che ci sono due modi per rendere qualcosa più leggibile. Uno è far collassare le superfici verso il bianco per ottenere separazione, il che sarebbe un design diverso e non uno più marcato. L'altro è mantenere il design e stringere le soglie che già supera. L'app sceglie il secondo: l'inchiostro viene alzato e le superfici restano come sono. Le linee sottili che dividono la pagina restano decorazione.

## Visione dei colori: tre modalità per otto tipi

*Visione dei colori* può essere *Disatt.* (i colori predefiniti), *Protan*, *Deutan* o *Tritan*. Corrispondono a protanopia e protanomalia, deuteranopia e deuteranomalia, tritanopia e tritanomalia. Sono quindi tre modalità per sei tipi, perché un'anomalia è un caso più lieve della dicromazia accanto a lei ed è servita dalle stesse tonalità.

Una modalità ricolora tutto ciò per cui l'app usa il colore per distinguere:

- le famiglie di schede su una lavagna;
- i percorsi tracciati;
- i segni che il controllo di versione mette sui file;
- i colori di stato;
- l'evidenziazione della sintassi;
- il confronto, che smette di essere rosso e verde.

I grigi neutri non vengono toccati, perché tutti i tipi di visione dei colori concordano su di essi. È questo che permette a una modalità di cambiare i vocabolari e lasciare il resto della pagina com'era.

### Come sono state scelte le palette

La regola è che le cose che condividono una forma non devono condividere un colore. Le palette vengono verificate misurando la distanza dopo aver simulato tutti e otto i tipi di daltonismo, compresi i due per cui l'app non ha una modalità, e mai in base alla distanza sulla ruota delle tonalità. Ci si aspetta che la palette predefinita fallisca lo stesso controllo: se i valori predefiniti fossero già sicuri, le modalità risponderebbero a una domanda che nessuno ha fatto.

La simulazione serve a verificare una palette e non ti viene mai mostrata. Dare a chi legge una simulazione del proprio deficit significherebbe mostrargli ciò che già vede, e buttare via qualunque separazione la sua vista ancora ottenga.

### Perché non esiste una modalità per l'acromatopsia

I due tipi acromatici di daltonismo non hanno una modalità. È una decisione, non una lacuna. Un insieme di percorsi tracciati può contenere otto percorsi, e otto percorsi non possono essere otto grigi distinguibili. Una modalità che lo promettesse toglierebbe tanto quanto dà, e una falsa promessa è peggio di nessuna. Ciò che le palette devono a questi lettori è invece una gamma di luminosità, che serve quel caso per quanto può una palette.

## Dove una palette non basta

Una palette aiuta, ma non è sufficiente. Tre punti dell'app distinguono le categorie solo in base alla tonalità e nient'altro:

- la minimappa della lavagna e quella della panoramica, dove una famiglia è un rettangolo di pochi pixel senza icona né etichetta;
- i percorsi tracciati;
- una clip di soundscape troppo stretta per avere scritta la propria modalità.

I segni di via e di stop sono diversi: portano le icone di riproduzione e di quadrato insieme alle loro etichette, quindi chi non vede nessuna tonalità può comunque distinguerli. Una modalità per la visione dei colori migliora questi punti senza renderli leggibili a tutti. Sistemare bene i primi due richiederebbe che il canvas portasse più di un colore per ogni cosa che disegna, come un'etichetta, un tratteggio o un indice, e questo spetta al pacchetto dell'editor di nodi e non all'app. La pagina delle impostazioni non promette più di quanto la palette possa dare, e questa pagina lo dice per lo stesso motivo.

## Nessun supporto per gli screen reader

L'app non dichiara di supportare gli screen reader: non c'è alcun supporto. Un canvas di schede posizionate liberamente, un marchio disegnato e dei visualizzatori di immagini non hanno una storia per gli screen reader che valga la pena di simulare, e una dichiarazione non vera sarebbe peggio, per le persone a cui era destinata, di un'onesta assenza. Se le cose cambiassero, l'albero dei file e le barre delle schede sono i punti in cui starebbe la maggior parte del valore.

## Dimensione del testo: l'interfaccia segue, le schede no

L'interfaccia (menu, finestre di dialogo, messaggi, barra laterale) rispetta la dimensione del testo del sistema, fino al doppio. Le lavagne no. Le schede su una lavagna restano alla dimensione con cui sono state disegnate, qualunque cosa dica la dimensione del testo del desktop.

Il motivo è che l'altezza di una scheda fa parte del documento. Ogni ancoraggio di porta su una scheda si trova a una frazione dell'altezza misurata della scheda, quindi una scheda che crescesse con l'impostazione di un lettore verrebbe scritta in una lavagna che qualcun altro apre con la propria. La dimensione del testo di una lavagna è quindi decisa dallo zoom, che è la dimensione del testo del canvas: lo zoom è il modo in cui una lavagna diventa più grande, e cambia la vista, non ciò che viene salvato.

Fuori dal canvas vale il contrario. Un'etichetta che esaurisce lo spazio viene troncata con i puntini di sospensione o va a capo, e il corpo di una finestra di dialogo scorre, quindi una dimensione del testo di sistema più grande cambia quanto ci sta e non taglia ciò che c'è. Non esiste un controllo della dimensione nell'app; conta l'impostazione del sistema.

## Vedi anche

- [Impostazioni, accessibilità e controlli degli aggiornamenti](/it/reference/settings/) elenca le righe e le loro scelte.
- [Come cambiare la lingua, il contrasto e la visione dei colori dell'app](/it/how-to/change-app-language-contrast-and-colour/) applica le impostazioni descritte qui.
- [Lavagne, schede e macro](/it/explanation/boards-nodes-and-macros/) spiega le famiglie e il canvas che le palette per la visione dei colori ricolorano.
