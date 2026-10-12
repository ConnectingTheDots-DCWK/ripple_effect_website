---
title: Come usare componenti ed entità
description: Crea un componente, dagli attributi tipizzati, mettilo su una lavagna come componente o come entità, e genera, elimina ed elenca le entità che una storia ha creato.
---

Usa questa guida per creare un componente e metterlo su una lavagna, insieme alle entità create a partire da esso. Per capire cosa sono i due concetti, vedi [Componenti ed entità](/it/explanation/components-and-entities/).

## Crea un componente

1. Nell'albero dei file, crea un **Nuovo Component**. Viene salvato come file `*.component.json`.
2. Imposta un nome e, se ne vuoi una, un'immagine di copertina.
3. Aggiungi una riga per ogni attributo. Dai a ciascuno un'etichetta, un tipo e un valore. Trascina le righe per riordinarle.
4. Scegli ogni tipo dal menu del tipo dell'attributo. Ciascuno può stare da solo, come lista o come mappa da nomi.

Un attributo `markdown` conserva il suo editor di sei righe quando ne cambi il tipo dal menu.

Aggiungi solo gli attributi che servono a questa storia. I tipi e il modo in cui il file li memorizza sono in [File del progetto e cartella .ripple](/it/reference/project-files/).

### Collega un attributo a un file

Un attributo `asset` o `componentRef`, o gli elementi di una lista di questi, si compila per nome.

1. Scrivi nello slot. Vengono proposti i file del progetto, con il percorso completo accanto a ciascuno.
2. Scegline uno. Resta nello slot come un chip con il suo nome; passaci sopra il puntatore per vedere il percorso.

Un chip è contrassegnato quando il suo file è fuori dal progetto o manca; correggi o sostituisci il file. Le cartelle e i file che iniziano con un punto, e tutto ciò che è fuori dal progetto, non vengono proposti.

### Usa una copertina o un file esterno al progetto

Una copertina scelta fuori dal progetto viene copiata in `.ripple/external/`, così il file non registra mai un percorso valido su una sola macchina.

La copia è un interruttore: esegui **Attiva l'importazione di risorse esterne** dalla paletta dei comandi. Se è disattivato, il file viene collegato invece di essere copiato.

Una copertina che è ancora fuori dal progetto mostra un avviso sotto il campo, con accanto **Copia nel progetto**. Messaggi elenca ogni collegamento di questo tipo a ogni apertura del progetto.

## Metti un componente su una lavagna

1. Trascina il file `*.component.json` dall'albero dei file su una lavagna. Diventa una scheda **Component** con un'uscita tipizzata per ogni attributo, più una che porta l'intero componente come mappa.
2. Scegli la modalità della scheda. La scheda indica in quale si trova.
   - **Component** è una finestra sul file: solo uscite, nient'altro.
   - **Entity** rende la storia una cosa, identificata dal nome sulla scheda. Accanto alle uscite compaiono gli ingressi degli attributi.

Per creare due spade indipendenti, usa due schede Entity con due nomi. Una scheda su una lavagna successiva che indica la stessa entità è la spada creata dalla prima lavagna.

Per modificare un'entità più avanti, metti un'altra scheda che la indica più avanti nella storia. Non esiste una coppia Set/Get: quella scheda è il setter.

Per creare un'entità per ogni nome, collega il nome della scheda da monte. Collega il nome da monte, per esempio da una scheda For, per creare un'entità per ogni nome che riceve.

## Crea più entità insieme

1. Aggiungi una scheda **Spawn** dalla categoria **Entities** del menu delle schede.
2. Indicale un componente e di' quante ne vuoi.
3. Scegli come distinguerle: numeri o lettere, e cosa metterci in mezzo. «Goblin» con numeri e un trattino produce Goblin-1, Goblin-2 e così via.
4. Collega i nomi che passa, come lista, a ciò che dà a ciascuna i propri valori, per esempio uno script Python che imposta i punti ferita di ognuna. Vedi [Come leggere e modificare le entità da Python](/it/how-to/use-entities-from-python/).

Spawn crea sempre le stesse entità. Tornando alla scheda trova i goblin che aveva già creato invece di crearne altri sei, così una campagna in pausa riprende dallo scontro che aveva lasciato. Per una seconda ondata, usa un nome diverso.

## Rimuovi un'entità

Aggiungi una scheda **Delete Entity** e dalle il nome. L'entità viene dimenticata; il file del componente resta intatto, quindi una scheda che la indica più avanti ne crea una nuova.

Eliminare un nome a cui nulla risponde non è un errore. Non rimuove niente e la storia prosegue.

## Dirama in base all'esistenza di un'entità

Aggiungi una scheda **Entity Exists** e collega la sua risposta a una scheda If.

## Fai qualcosa su ogni entità

1. Aggiungi una scheda **Entity Names**. Risponde con i nomi di tutte le entità create dalla storia, in ordine alfabetico. Per limitarla a un solo componente, scegli quel componente.
2. Collega la sua uscita `names` a una scheda For con un List at.
3. Metti il lavoro da fare per ciascuna dentro il ciclo. Per esempio, per raggiungere i goblin ancora in piedi due passaggi dopo, metti il lavoro dentro il ciclo.

## Vedi anche

- [Componenti ed entità](/it/explanation/components-and-entities/) per capire cosa sono un componente e un'entità
- [File del progetto e cartella .ripple](/it/reference/project-files/) per il formato del file del componente
- [Schede](/it/reference/nodes/) per le schede Component, Spawn, Delete Entity, Entity Exists e Entity Names
- [Componenti ed entità in Python](/it/reference/python/components-and-entities/) per le chiamate che usa uno script
- [La finestra della campagna e le partite salvate](/it/reference/campaign-window/) per il pannello Entità
- [Come leggere e modificare le entità da Python](/it/how-to/use-entities-from-python/) come rimando
