---
title: Open source
description: "Ripple Effect è proprietario, ma diversi pacchetti su cui si appoggia sono open source, quattro dei quali sono nostri, e lo sono anche i binding del motore: questa pagina spiega quali, perché e di chi sono gli altri."
---

Ripple Effect è [proprietario](/it/about/licensing/) e il suo codice sorgente non è pubblicato. Diversi dei pacchetti su cui è costruito sono open source e quattro sono nostri: l'editor di nodi, il layout ad ancoraggio con cui è disegnato lo spazio di lavoro, la stima del tempo di lettura e il sistema di segnalazione dei crash. La distinzione va tenuta ben chiara, perché le due metà si confondono facilmente: **i pacchetti sono aperti, l'app no.** I quattro sono pubblicati a sé e accettano pull request. `fl_nodes_v2`, `fl_panel` e `fl_crashpad` sono pacchetti Flutter e richiedono Flutter; `dart_read_time` è Dart puro. Sono open source anche i binding che permettono ad altri programmi di eseguire una campagna, anche se il motore che contengono non lo è.

## fl_nodes_v2: l'editor di nodi

[github.com/ConnectingTheDots-DCWK/fl_nodes_v2](https://github.com/ConnectingTheDots-DCWK/fl_nodes_v2) · MIT

È la tela: geometria, collegamenti, selezione, annullamento, il modello di esecuzione (il controllo è spinto, i dati sono tirati) e la minimappa. Non sa nulla di narrativa. Un nodo è ciò che l'host dice che sia un nodo, e Ripple Effect è un host tra gli altri. Tutto ciò che riguarda il comportamento di una scheda sulla tela, descritto in [Lavagne, nodi e macro](/it/explanation/boards-nodes-and-macros/), è questo pacchetto al lavoro, e un contributo lì arriva a Ripple Effect e a ogni altra applicazione costruita su di esso.

## fl_panel: il layout ad ancoraggio

[github.com/ConnectingTheDots-DCWK/fl_panel](https://github.com/ConnectingTheDots-DCWK/fl_panel) · MIT

È un albero di divisioni, pannelli singoli e gruppi di schede che ridimensioni, ancori e riorganizzi. Puoi strappare una scheda dalla sua barra, rilasciare un pannello accanto a un altro e ritrovare lo stesso layout il giorno dopo. Ogni pannello contiene normali widget Flutter, e nel pacchetto non c'è nulla su file o documenti: una scheda è un nome che l'host risolve. Cosa può andare dove lo stabiliscono le schede stesse e una policy scritta dall'host, così un'applicazione può dire che i suoi pannelli degli strumenti condividono una barra solo con altri pannelli degli strumenti.

È ciò con cui è disegnato lo [spazio di lavoro](/it/reference/workspace-window/). La pagina del progetto è un'unica area di ancoraggio su questo pacchetto: i documenti sono schede e divisioni, e il layout viene conservato per progetto in `.ripple/workspace.json`. Il pacchetto è diventato pubblico per primo, così da essere costruito allo scoperto e non attorno alla forma di una sola applicazione. Il suo albero, il solver e il formato di file non importano nulla da Flutter, quindi un layout può essere costruito, modificato e salvato senza interfaccia. [Il post che lo presenta](https://ripplefx.app/blog/docking-is-a-tree-and-a-tab-is-a-name) spiega perché l'albero ha questa forma.

## dart_read_time: quanto ci vuole a leggere un passaggio

[github.com/ConnectingTheDots-DCWK/dart_read_time](https://github.com/ConnectingTheDots-DCWK/dart_read_time) · MIT

È la stima sotto ogni passaggio: cinquantaquattro lingue, alfabeti misti contati una sequenza alla volta e una parola onesta sul fatto che il valore di una lingua sia misurato o stimato per ragionamento. È Dart puro, senza Flutter, quindi può usarlo anche un browser o una riga di comando. [Passaggi, scelte, lingue e tempo di lettura](/it/reference/passages/) spiega cosa fa con essa la riga sotto l'editor.

## fl_crashpad: segnalazioni dei crash nativi

[github.com/ConnectingTheDots-DCWK/fl_crashpad](https://github.com/ConnectingTheDots-DCWK/fl_crashpad) · MIT

È la segnalazione dei crash nativi per Flutter basata su Google Crashpad, su desktop, Android e iOS. Non sa nulla di alcuna app, logger o backend. In Ripple Effect intercetta un crash nativo; ogni segnalazione viene ripulita prima che possa essere letta o inviata. [Aggiornamenti, log e Messaggi](/it/explanation/updates-logs-and-privacy/) spiega cosa fa l'app con una segnalazione.

## I binding del motore

| Binding | Repository | Pubblicato come |
| --- | --- | --- |
| JavaScript e TypeScript | [ripple_effect_js_ts_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_js_ts_integration) | `@ripplefx/player` e `@ripplefx/soundscape` su npm |
| C e C++ | [ripple_effect_c_cpp_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration) | release su GitHub, da usare con CMake |
| C# | [ripple_effect_csharp_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_csharp_integration) | `RippleFx.Engine` su NuGet |
| Dart | [ripple_effect_dart_integration](https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration) | `ripplefx_engine` su pub.dev |

Sono il modo in cui un gioco, un'app o una pagina web esegue una campagna esportata dall'editor. Ognuno è MIT. **Il motore che ognuno contiene o scarica non lo è**: è una build compilata del motore, sotto la [Runtime Licence](/it/about/licensing/#the-runtime-licence), che ti permette di distribuirlo, senza modificarne il funzionamento, come parte del tuo prodotto. `@ripplefx/soundscape` non contiene alcun motore ed è semplicemente MIT. [Incorporare il motore](/it/explanation/embedding-the-engine/) spiega che cosa hanno in comune, e [Come viene distribuito il motore](/it/explanation/how-the-engine-ships/) spiega che cosa mettono nella tua build.

## monty: Python, in una sandbox

[github.com/pydantic/monty](https://github.com/pydantic/monty) · MIT

**Non è nostro.** `monty` è un interprete Python in sandbox scritto in Rust dal team di pydantic, ed è il modo in cui una scheda Script, uno span `{{ … }}` in un passaggio e la console eseguono Python. Un ringraziamento a [runyaga](https://github.com/runyaga), il cui [`dart_monty`](https://pub.dev/packages/dart_monty) ha portato per primo l'interprete in Dart. Il motore collega l'interprete direttamente, e uno script fuori controllo viene fermato alla sua scadenza.

L'interprete è un sottoinsieme di Python: niente filesystem, niente rete, niente `class`, e una libreria standard ridotta a un breve elenco. Questa restrizione è ciò che rende sicuro eseguire la storia di uno sconosciuto. [Python in una storia](/it/explanation/python-in-a-story/) spiega il compromesso, [La sandbox e i suoi limiti](/it/reference/python/sandbox/) dice cosa consente, e il [riferimento Python](/it/reference/python/) elenca cosa l'app vi rende disponibile.

## Harper: ortografia e grammatica

[github.com/automattic/harper](https://github.com/automattic/harper) · Apache-2.0

**Non è nostro.** Harper è un correttore grammaticale scritto in Rust, e il suo `harper-core` è ciò che controlla ortografia, grammatica e stile dei passaggi e delle note in inglese, sul tuo computer, mentre scrivi. Le regole di stile che un progetto scrive per sé sono in Weir, il linguaggio di regole di Harper. [Come controllare ortografia e grammatica](/it/how-to/check-spelling-and-grammar/) e [Come scrivere una regola di stile](/it/how-to/write-a-style-rule/) spiegano come usarlo.

## parakeet-rs: la dettatura

[github.com/altunenes/parakeet-rs](https://github.com/altunenes/parakeet-rs) · MIT o Apache-2.0

**Non è nostro.** `parakeet-rs` esegue i modelli in streaming Nemotron di NVIDIA, ed è il modo in cui la dettatura ti ascolta sul tuo computer. I modelli non fanno parte dell'app: ciascuno si scarica quando lo chiedi, e sono soggetti alle licenze di NVIDIA, non alla nostra. [Come dettare un passaggio](/it/how-to/dictate-a-passage/) spiega come configurarla.

## Tutto il resto

L'elenco completo dei componenti di terze parti e delle loro licenze si trova nell'applicazione, in **Impostazioni ▸ Informazioni ▸ Licenze di terze parti**. Ciascuno è regolato dalla propria licenza, che quella dell'app non tocca. Dalla 1.6 l'elenco comprende anche il codice nativo contenuto nei pacchetti, tra cui il lettore audio e FFmpeg, Git, il visualizzatore PDF, la segnalazione dei crash e l'elenco di parole del correttore ortografico, oltre ai font delle icone, ai tre caratteri tipografici dell'app e ai due modelli vocali che la dettatura scarica.

## Vedi anche

- [Licenze](/it/about/licensing/): i termini a cui è soggetta l'app stessa.
- [La finestra dello spazio di lavoro, i menu e la paletta](/it/reference/workspace-window/): che aspetto ha il layout ad ancoraggio in uso.
- [Python in una storia](/it/explanation/python-in-a-story/): perché gli script girano in una sandbox.
- [Un progetto è una cartella](/it/explanation/projects-are-folders/): dove si trova `.ripple/workspace.json`.
- [La sandbox e i suoi limiti](/it/reference/python/sandbox/): cosa può fare uno script.
- [Cosa invia l'app](/it/about/what-the-app-sends/): cosa lascia la macchina, comprese le segnalazioni dei crash.
