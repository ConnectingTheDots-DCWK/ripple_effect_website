---
title: Perché i programmi di installazione non sono firmati
description: Cos'è la firma del codice, perché Windows e macOS avvisano una sola volta per un programma di installazione non firmato e perché Smart App Control di Windows 11 lo blocca senza possibilità di deroga.
---

Nessuno dei programmi di installazione è firmato da un'autorità di cui la tua macchina si fida già. Questo solo fatto spiega ogni avviso che incontri al primo avvio dell'app, e conviene tenerlo distinto da ciò che gli avvisi potrebbero sembrare dire.

## A cosa serve la firma

La firma lega un programma di installazione a un certificato che una piattaforma riconosce già. Nessuno di questi programmi ne ha uno, quindi Windows e macOS fermano l'app una volta ciascuno, al primo avvio, e dicono di non conoscerla.

L'avviso riguarda il certificato mancante, non qualcosa che il programma di installazione fa.

## Cosa fa ogni piattaforma

Su Windows l'avviso è SmartScreen. Su macOS è Gatekeeper, che segnala uno sviluppatore non identificato o un'app che non ha potuto verificare. Ognuno si ferma una sola volta e poi lascia decidere a te. Linux non esegue alcun controllo di questo tipo e non chiede nulla, quindi i pacchetti Linux si installano senza alcuna domanda sulla firma.

Un certificato acquistato eliminerebbe l'avviso di SmartScreen su Windows e, con la notarizzazione, quello di Gatekeeper su macOS. Una build Windows firmata è un passo successivo già previsto, non una decisione contraria alla firma. [Come installare Ripple Effect](/it/how-to/install-the-app/) spiega cosa ti chiede di fare ogni piattaforma.

## Perché Smart App Control è diverso

SmartScreen interpella una persona, e una persona può rispondere di sì. Smart App Control, una funzione di Windows 11, non chiede nulla. Esegue solo le app che il servizio di reputazione di Microsoft già conosce o che hanno una firma attendibile, e un programma di installazione non firmato non è né l'una né l'altra cosa. Quando è attivo, Setup viene rifiutato con il messaggio "An Application Control policy has blocked this file" (errore 4551). A differenza di SmartScreen non ha un *Esegui comunque* né eccezioni per singola app, quindi l'unico modo per installare è disattivare la funzione.

Questo coglie impreparate persone che non ne hanno mai sentito parlare, per il modo in cui viene attivato. Si attiva solo su un'installazione pulita di Windows 11, e anche un ripristino conta. Parte in modalità Valutazione, che non blocca nulla mentre Windows decide se la funzione si adatta alla macchina, e poi si attiva da sola, con una notifica, oppure si disattiva. Un PC aggiornato da Windows 10, o uno su cui durante la valutazione sono stati visti strumenti per sviluppatori, ce l'ha già disattivata, ed è per questo che la maggior parte delle persone non la incontra mai.

:::caution
Disattivare Smart App Control è una decisione, non un semplice interruttore. Microsoft dice che i recenti aggiornamenti di Windows permettono di riattivarlo senza reinstallare. Sulle build più vecchie, una volta disattivato l'unico modo per tornare indietro è un ripristino completo di Windows. Valuta questo aspetto prima di disattivarlo per una sola app.
:::

Essere rifiutati del tutto, invece che avvisati, è l'argomento più forte a favore della firma della build Windows. I passaggi per verificare e disattivare Smart App Control sono in [Programmi di installazione e primo avvio](/it/reference/installers/).

## Vedi anche

- [Come installare Ripple Effect](/it/how-to/install-the-app/)
- [Programmi di installazione e primo avvio](/it/reference/installers/)
- [Aggiornamenti, log e Messaggi](/it/explanation/updates-logs-and-privacy/), perché il programma di installazione di un aggiornamento solleva gli stessi avvisi del primo
