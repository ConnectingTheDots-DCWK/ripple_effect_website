---
title: Variabili di console
description: Perché una storia tiene lo stato in variabili dichiarate e tipizzate invece che nei collegamenti, e cosa costa e cosa dà.
---

Una storia può portare con sé uno stato senza alcun collegamento. Un progetto dichiara delle **variabili di console**: l'idea dei motori di gioco, nella misura che serve a una storia. Ognuna è un valore tipizzato e con nome, con un valore predefinito, che si può impostare ovunque e leggere ovunque, tra una lavagna e l'altra e tra un salvataggio e l'altro; ogni sessione di gioco parte con ciascuna al proprio valore predefinito. Tre schede le usano: Get variable, Set variable e Variable branch (vedi [Schede](/it/reference/nodes/)).

L'alternativa è tirare un collegamento da dove un valore viene deciso fino a dove viene usato. Su una sola lavagna funziona, e peggiora a ogni lavagna che aggiungi, perché una lavagna deve poter essere riutilizzata e un collegamento la lega alla sua vicina. Una variabile rovescia l'impostazione: una scheda Set variable su una lavagna e una scheda Variable branch su un'altra non hanno bisogno di alcun collegamento tra loro, perché la variabile è il collegamento. Il prezzo è che la connessione non si vede più sul canvas, ed è per questo che una variabile si dichiara in un solo posto, con un tipo, invece di essere inventata nella scheda che per prima ne ha bisogno.

Le tre schede ricevono il flusso invece di essere interrogate da un collegamento, quindi una lettura dopo una scrittura nel flusso vede sempre la scrittura. Il modello che ci sta dietro è in [Come procede una storia](/it/explanation/how-a-story-runs/).

## Una dichiarazione è un nome, un tipo e un valore predefinito

Ogni variabile viene dichiarata nella pagina Variabili Console del progetto come nome, tipo e valore predefinito. Le dichiarazioni stanno in `.ripple/cvars.json`, accanto alle impostazioni del progetto, e viaggiano con il progetto.

Una scheda che usa una variabile memorizza l'id della variabile, non il suo nome. Per questo rinominare non costa nulla: ogni lavagna che nomina la variabile segue la modifica, perché nessuna ha mai conservato il nome. È la stessa decisione per cui una dichiarazione si modifica in un solo posto invece di essere una copia che ogni scheda si porta dietro.

I tipi sono un insieme chiuso, gli stessi ventiquattro che offre ogni altro editor dell'app: otto tipi di valore (`int`, `float`, `bool`, `string`, `markdown`, `asset`, `componentRef` e `json`), ciascuno da solo, in una `list<…>` o in una `map<…>`.

Alcuni degli otto sono lo stesso tipo di valore con un altro scopo. `markdown`, `asset` e `componentRef` sono testo per quanto riguarda ciò che ci puoi scrivere; dicono a *cosa serve* la variabile. `json` è quello aperto: contiene una lista o un oggetto così com'è, quindi una `list<json>` è una lista di liste, se è questo che ci metti. Nessun tipo accetta un valore vuoto.

## L'ambito è offerto, non imposto

Una variabile può avere come ambito delle lavagne. La pagina ha una colonna **Lavagne** per ogni variabile, che dice *Dovunque* finché non ne spunti qualcuna. Una scheda Get variable, Set variable o Variable branch offre allora solo le variabili con ambito la sua lavagna o nessuna, e una scheda già puntata su una variabile con ambito altrove ne conserva il nome e sotto scrive *Non in ambito di questa lavagna*.

Questo è tutto ciò che fa un ambito. Decide dove una variabile viene *offerta*, non dove può essere letta: durante il gioco una variabile appartiene alla campagna, uno script nomina qualunque variabile da qualunque punto, e nulla di un ambito arriva in un bundle. La parola promette più di quanto mantenga, quindi considera un ambito una promessa che mantiene l'autore, non una che il motore verifica.

L'ambito è una modifica al formato di file che una versione più vecchia rifiuta invece di leggerlo: al salvataggio successivo riscriverebbe il file senza gli ambiti. I numeri di versione attuali sono in [Dichiarazioni delle variabili di console](/it/reference/console-variable-declarations/).

## Ogni scrittura è senza perdite o rifiutata

Poiché qualunque scheda, script o pannello può scrivere qualunque variabile, il tipo è difeso a ogni porta. Una sola regola viene chiesta dalla scheda Set variable, da Python, dal pannello della campagna e dall'esportazione allo stesso modo: un valore viene convertito al tipo dichiarato quando non si perde nulla, e rifiutato altrimenti.

Un numero intero entra in un `int`; `3.5` no. Il testo `"42"` entra in un `int`; `"forty-two"` no. `true` e `false` entrano in un `bool`; `"yes"` e `1` no. Uno scalare non viene mai avvolto in una lista.

Dove cade il rifiuto dipende da chi sta scrivendo. Un valore che non va bene viene rifiutato mentre lo digiti su una scheda. Uno che arriva sbagliato lungo un collegamento termina l'esecuzione con un messaggio che nomina la scheda:

> `gold holds an int, and 3.5 is not one`

La tabella completa delle conversioni è nel [riferimento](/it/reference/python/console-variables/).

## Salvataggi ed esportazioni

Una partita salvata porta con sé ogni variabile. Un salvataggio precedente all'esistenza di una variabile nel progetto la contiene al suo valore predefinito; una variabile aggiunta mentre una campagna è in pausa c'è quando riprende; una rimossa non c'è più.

Un salvataggio registra cosa conteneva ciascuna variabile e non il suo tipo, quindi una versione più vecchia rifiuta del tutto un salvataggio più recente invece di ripristinare un valore che non sa distinguere da un altro. I numeri di formato sono nelle pagine di riferimento.

Un'esportazione porta con sé `.ripple/cvars.json` accanto alle impostazioni del progetto, quindi uno scaffold si apre con ogni scheda ancora puntata sulla sua variabile, e una campagna compilata porta le dichiarazioni nella propria forma.

## Vedi anche

- [Come dichiarare una variabile di console e darle un ambito](/it/how-to/declare-console-variables/)
- [Dichiarazioni delle variabili di console](/it/reference/console-variable-declarations/)
- [Variabili di console in Python](/it/reference/python/console-variables/)
- [La finestra della campagna e le partite salvate](/it/reference/campaign-window/)
- [Componenti ed entità](/it/explanation/components-and-entities/)
