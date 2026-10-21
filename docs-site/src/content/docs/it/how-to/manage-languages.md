---
title: Come aggiungere, disattivare o cambiare le lingue di un progetto
description: Attiva e disattiva le lingue di traduzione, cambia la lingua in cui è scritta una storia e trova le traduzioni rimaste indietro.
---

La lingua in cui è scritta una storia si sceglie quando si crea il progetto, come descrive [Come creare o importare un progetto](/it/how-to/create-or-import-a-project/). Tutto il resto si fa in Impostazioni progetto, che apri dal fondo della barra delle attività.

## Aggiungere una lingua di traduzione

1. Apri Impostazioni progetto dal fondo della barra delle attività. È un insieme di pagine lungo una barra laterale: *Generale*, *Lingue*, *Scrittura*, *Radici della narrazione* e *Capacità*.
2. Scegli *Lingue*.
3. Spunta la lingua. Usa *Trova una lingua* per cercare nell'elenco.
4. Salva.

Un file di traduzione vuoto viene aggiunto a ogni bundle di passaggi. La lingua dell'app è un'impostazione a parte, nelle impostazioni dell'app.

## Disattivare una lingua di traduzione

1. Apri Impostazioni progetto e scegli *Lingue*.
2. Togli la spunta alla lingua.
3. Salva. Se qualcosa è scritto in quella lingua, ti viene chiesto una volta sola che cosa fare delle parole.

Togliere la spunta non elimina nulla. I file restano, l'editor continua a mostrarli contrassegnati come ritirati e ai lettori non viene più offerta quella lingua.

Per rimuovere le parole, rispondi **Eliminale**. Così vengono eliminati dal disco il file della lingua in ogni bundle di passaggi e il testo di ogni scelta e di ogni scheda Localized string scritto in quella lingua sulle tue lavagne; l'unico modo per tornare indietro è il controllo di versione. **Mantienile** è il pulsante predefinito: se chiudi la finestra di dialogo senza scegliere, o la ignori, non elimina nulla.

## Cambiare la lingua in cui è scritta una storia

1. Apri Impostazioni progetto e scegli *Lingue*.
2. Cambia il menu a discesa *Lingua del testo*. Una nota sotto di esso dice che cosa farà la modifica.
3. Salva.

Nulla viene spostato. Ogni passaggio riceve un file vuoto per la nuova lingua, e tutto ciò che hai scritto resta nel file della vecchia lingua come traduzione. Finché non trasferisci le parole a mano, i tuoi passaggi vengono riprodotti vuoti e il pannello Messaggi segnala il progetto come non tradotto. Non esiste alcuna migrazione per questo cambiamento.

## Trovare le traduzioni rimaste indietro

1. Apri un bundle di passaggi. I chip delle lingue lungo il suo bordo superiore rappresentano ciascuno una lingua.
2. Cerca un **punto** su un chip: quella traduzione è più vecchia del suo originale. [Passaggi e traduzioni](/it/explanation/passages-and-translations/) spiega come lo si capisce.
3. Per l'intero progetto, apri il pannello Messaggi (menu Visualizza, o il pulsante dei messaggi in fondo alla barra delle attività). Elenca ogni traduzione rimasta indietro, per esempio «3 traduzioni sono rimaste indietro».

Modificare un passaggio e la sua traduzione insieme non lascia indietro la traduzione. Il controllo non può vedere il testo delle scelte né quello delle schede Localized string.

## Tradurre parole che non sono un passaggio

Un cartello, una riga di stato o un'etichetta che la tua storia compone non sono un passaggio, ma possono comunque seguire la lingua del lettore.

1. Aggiungi una scheda **Localized string** dal gruppo **Language** del menu Crea.
2. Fai doppio clic su di essa. Scrivi le parole in ogni lingua, scegliendo la lingua dai chip in alto. Gli spazi all'inizio e alla fine vengono mantenuti, così un pezzo come `Hai ` può essere unito a un numero.
3. Fai clic su **Fatto**. La scheda mostra le parole nella lingua in cui è scritta la storia.
4. Collega il suo `completed` prima di ciò che la legge, e il suo `text` all'input di un passaggio, a una variabile, a un Comparator o a uno script.

La scheda risponde nella lingua del lettore quando il flusso la raggiunge. Dove in quella lingua non c'è nulla di scritto, risponde nella lingua in cui è scritta la storia, e la lavagna ti avvisa quando anche quella è vuota ([`W.GE.19`](/it/reference/diagnostics/#wge19)). Per rispondere in una sola lingua qualunque sia quella scelta dal lettore, sceglila nel selettore `locale` della scheda, oppure collegane una alla porta.

**Get locale**, nello stesso gruppo, dice in quale lingua sta leggendo il lettore: il suo id, la lingua e la regione, il nome, il sistema di misura della regione e la moneta che usa. Fai una ramificazione su di essa per dire a un lettore negli Stati Uniti qualcosa di diverso da un lettore in Italia.

Un valore resta nella lingua in cui è stato letto. Un lettore che cambia lingua a metà storia riceve la nuova lingua la volta successiva in cui il flusso raggiunge la scheda.

### Scrivere un plurale in ogni lingua

Le parole di una scheda Localized string possono eseguire Python, come quelle di un passaggio, quindi ogni lingua scrive il proprio plurale.

1. Nella finestra di dialogo della scheda, fai clic su **Inputs** e aggiungi un nome, per esempio `coins`, di tipo `int`. La scheda acquista una porta `coins`; collegaci il numero.
2. Scrivi ogni lingua con uno snippet inline: `You have {{ coins }} {{ "coin" if coins == 1 else "coins" }}` in inglese, `Hai {{ coins }} {{ "moneta" if coins == 1 else "monete" }}` in italiano.

Uno snippet che fallisce lascia un avviso nelle parole e nella traccia, e la storia prosegue. Una campagna esportata per funzionare senza Python rifiuta la scheda ([`E.EX.03`](/it/reference/diagnostics/#eex03)). Da uno script, `locale_get()` risponde come la scheda Get locale.

## Vedi anche

- [Passaggi e traduzioni](/it/explanation/passages-and-translations/)
- [Passaggi, scelte, lingue e tempo di lettura](/it/reference/passages/)
- [File del progetto e cartella .ripple](/it/reference/project-files/)
- [Come scrivere un passaggio](/it/how-to/write-a-passage/)
