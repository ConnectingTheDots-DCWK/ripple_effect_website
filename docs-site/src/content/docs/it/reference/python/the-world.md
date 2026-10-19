---
title: Il mondo fuori dalla storia
description: location_get, location_distance e datetime.now — che cosa risponde ognuna, quando viene rifiutata e che cosa le fa il sostituto indicato da chi legge.
---

Una storia può leggere due cose del mondo di chi legge: **dove si trova** e **che ora è**. Ognuna si legge solo se chi legge lo consente. A una storia che legge l'una o l'altra viene chiesto prima che cominci, e la risposta resta nelle impostazioni dell'app, dove chi legge può cambiarla. Le stesse letture si trovano su una lavagna come [nodi del gruppo World](/it/reference/nodes/).

## `location_get()`

Dove si trova chi legge, come dict, oppure `None` quando l'host non ha ancora una posizione.

| Chiave | Contiene |
| --- | --- |
| `label` | Il nome di un luogo. Ce l'ha solo un sostituto scritto come nome; una lettura vera non ce l'ha, perché nulla viene cercato per dare un nome al luogo. |
| `latitude` | Gradi a nord, negativi per il sud. |
| `longitude` | Gradi a est, negativi per l'ovest. |
| `accuracy` | Di quanti metri può sbagliare la lettura. |
| `when` | Quando è stata fatta la lettura, come testo ISO 8601. |

Ogni chiave può essere `None`. Una lettura vera ha coordinate, precisione e ora; un sostituto scritto come `41.9028, 12.4964` ha le coordinate e nient'altro; un sostituto scritto come `Roma, Italia` ha un'etichetta e nient'altro.

```python
here = location_get()
if here and here["label"]:
    said = "a " + here["label"]
elif here:
    said = f"a {here['latitude']:.2f}, {here['longitude']:.2f}"
else:
    said = "da qualche parte"
```

## `location_distance(latitude, longitude)`

Quanto dista chi legge da un luogo, in metri lungo il terreno, oppure `None` quando la lettura non ha coordinate o non c'è ancora una lettura. È consentita e rifiutata esattamente come `location_get()`.

| Argomento | Significato |
| --- | --- |
| `latitude` | Da −90 a 90. |
| `longitude` | Da −180 a 180. |

```python
near_rome = (location_distance(41.9028, 12.4964) or 1e9) < 10_000
```

Entrambi gli argomenti sono posizionali e obbligatori. Un luogo fuori dal globo, o che non è un numero, viene rifiutato prima di leggere qualsiasi cosa.

## `datetime.now()` e `date.today()`

I nomi della libreria standard, invariati: `datetime.now()` è l'orologio di chi legge, `datetime.now(timezone.utc)` lo stesso istante in UTC, `date.today()` la data di chi legge. **Dentro un singolo passo della storia il tempo non scorre**, quindi due letture nello stesso passaggio vedono un solo istante.

```python
from datetime import datetime
hour = datetime.now().hour
greeting = "Buonasera" if hour >= 18 else "Buongiorno"
```

Non esiste un modulo `time`.

## Quando una lettura viene rifiutata

Una lettura riceve risposta in quest'ordine:

1. **Il valore vero**, quando chi legge l'ha consentito e l'host ce l'ha.
2. **Il sostituto di chi legge**, se ne ha indicato uno. Un sostituto è ciò che chi legge preferisce che una storia creda, scritto nelle impostazioni dell'app accanto alla risposta; una storia non lo distingue da quello vero.
3. **Altrimenti un rifiuto**: `PermissionError` quando chi legge non l'ha consentito. Quando l'ha consentito e l'host non ha nulla, `location_get()` risponde `None` e l'orologio solleva `OSError`.

Quindi `except PermissionError:` è il modo in cui una storia dice che cosa succede senza:

```python
from datetime import datetime
try:
    hour = datetime.now().hour
except PermissionError:
    hour = 12                     # una storia che non può saperlo fa finta che sia mezzogiorno
```

| Rifiutato | Eccezione | Frase |
| --- | --- | --- |
| La posizione, non consentita | `PermissionError` | `The location has not been allowed for this story` |
| L'orologio, non consentito | `PermissionError` | `The date and time has not been allowed for this story` |
| L'orologio, consentito ma senza nulla da dare | `OSError` | `this host has not said what time it is` |
| Qualsiasi lettura nella console dell'editor o tramite MCP | `PermissionError` | `no story is playing, so nothing has allowed this read — press play` |
| `location_distance`, un luogo fuori dal globo | `RuntimeError` | `location_distance: the latitude has to be a number from -90 to 90` (o la longitudine, da -180 a 180) |

Le frasi restano in inglese, come ogni frase dell'interprete. Ogni lettura che non riceve il valore vero viene anche segnalata una volta nella finestra di gioco e nei Messaggi, con un [codice diagnostico](/it/reference/diagnostics/#irt05): `I.RT.05` per un sostituto, `W.RT.06` per un rifiuto, `I.RT.07` per nulla da dare.

## Nell'editor

L'orologio è consentito a meno che chi legge non dica altrimenti; per la posizione viene chiesto. Con la posizione consentita, quando la storia comincia l'editor chiede al servizio di localizzazione del computer dove si trova, con la precisione di una città circa, e aspetta qualche secondo una risposta prima di cominciare senza. **A una partita che un agente guida tramite MCP non viene mai detta la posizione vera**: riceve il sostituto o il rifiuto.

Un altro programma che gioca una campagna esportata decide da sé come chiedere e che cosa consegnare. Vedi [Come giocare una campagna nel tuo programma](/it/how-to/play-a-campaign-in-your-program/).

## Versioni

Questi nomi fanno parte del contratto 1.6 e vengono ampliati senza essere riutilizzati per altro. Una campagna che legge l'uno o l'altro è nel formato di bundle 16, che un lettore più vecchio rifiuta invece di giocarla senza chiedere.

## Vedi anche

- [Nodi](/it/reference/nodes/): Get location, Near, Get date & time e Time branch.
- [Riferimento Python](/it/reference/python/): ogni funzione host e come si legge un rifiuto.
