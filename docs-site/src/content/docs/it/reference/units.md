---
title: Unità di misura
description: Ogni unità che la scheda Convert conosce, le grafie che legge in una quantità scritta, e quale unità sceglie «Sistema di chi legge» per chi legge in ciascuna regione.
sidebar:
  order: 3
---

La scheda [Convert](/it/reference/nodes/#convert) trasforma una quantità da un'unità in un'altra. Conosce le unità qui sotto e nessun'altra; la tabella è quella del motore, e un host che gioca una campagna converte con la stessa.

## Le unità

Un'unità si converte solo in un'altra dello stesso tipo.

| Tipo | Unità, con il loro simbolo |
| --- | --- |
| Lunghezza | millimetri `mm`, centimetri `cm`, metri `m`, chilometri `km`, pollici `in`, piedi `ft`, iarde `yd`, miglia `mi` |
| Area | centimetri quadrati `cm²`, metri quadrati `m²`, ettari `ha`, chilometri quadrati `km²`, pollici quadrati `in²`, piedi quadrati `ft²`, acri `ac`, miglia quadrate `mi²` |
| Volume | millilitri `mL`, litri `L`, metri cubi `m³`, once fluide statunitensi `fl oz`, pinte statunitensi `pt`, galloni statunitensi `gal`, once fluide imperiali `imp fl oz`, pinte imperiali `imp pt`, galloni imperiali `imp gal` |
| Massa | milligrammi `mg`, grammi `g`, chilogrammi `kg`, tonnellate `t`, once `oz`, libbre `lb`, stone `st` |
| Temperatura | gradi Celsius `°C`, gradi Fahrenheit `°F`, kelvin `K` |
| Velocità | metri al secondo `m/s`, chilometri all'ora `km/h`, miglia all'ora `mph`, nodi `kn` |
| Tempo | millisecondi `ms`, secondi `s`, minuti `min`, ore `h`, giorni `d`, settimane `wk` |

Su un collegamento, un'unità si indica con il suo id: il singolare inglese in minuscolo, con i trattini — `kilometer`, `square-foot`, `fluid-ounce-imperial`, `mile-per-hour`.

Non c'è la valuta. Un cambio varia da un giorno all'altro, mentre ogni fattore di questa tabella è fissato per definizione: un pollice è esattamente 0,0254 m, una libbra 0,45359237 kg, un gallone statunitense 3,785411784 L.

## Una quantità scritta come testo

Con *Dal testo*, la scheda legge l'unità dal valore: un numero, poi l'unità.

- **L'unico separatore decimale è il punto.** `1,500 m` non viene letto, perché in inglese vale millecinquecento e in italiano uno e mezzo. Nemmeno `1e3 m`.
- L'unità può essere il suo id, il suo simbolo o il suo nome inglese, singolare o plurale: `12 km`, `12 kilometres`, `12km`, `72°F`, `72 F`, `3.5 lb`, `2 Liters`.
- Un simbolo di una lettera conserva le maiuscole: `m` è un metro e `M` non è nulla.

Un valore che la scheda non sa leggere esce da `unavailable`.

## Sistema di chi legge

*Sistema di chi legge* risponde nell'unità con cui misura la regione di chi legge, che si ricava dalla lingua in cui sta leggendo. `en-US` sono gli Stati Uniti, `en-GB` il Regno Unito, e ogni altra regione usa il sistema metrico.

| Da | Chi legge col metrico | Chi legge negli Stati Uniti | Chi legge nel Regno Unito |
| --- | --- | --- | --- |
| chilometri | chilometri | miglia | miglia |
| miglia | chilometri | miglia | miglia |
| metri | metri | piedi | metri |
| piedi, iarde | metri | piedi, iarde | metri |
| centimetri, millimetri | gli stessi | pollici | gli stessi |
| chilogrammi | chilogrammi | libbre | chilogrammi |
| libbre | chilogrammi | libbre | chilogrammi |
| stone | chilogrammi | libbre | stone |
| litri | litri | pinte statunitensi | litri |
| °C | °C | °F | °C |
| °F | °C | °F | °C |
| km/h | km/h | mph | mph |

Le altre seguono lo stesso schema: le unità quadrate con le lunghezze di cui sono fatte, gli ettari con gli acri, i volumi imperiali con quelli statunitensi. Il tempo e i nodi non cambiano mai.

## Vedi anche

- [Schede](/it/reference/nodes/#convert), per le porte della scheda Convert.
- [Come aggiungere, disattivare o cambiare le lingue di un progetto](/it/how-to/manage-languages/), per Get locale, che dice in quale sistema si trova chi legge.
- [Diagnostica](/it/reference/diagnostics/#wge20), per `W.GE.20`.
