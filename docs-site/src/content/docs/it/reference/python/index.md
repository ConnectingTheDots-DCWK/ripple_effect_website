---
title: Riferimento Python
description: Le venti funzioni host che il Python di una storia può chiamare, le cinque superfici su cui girano, come vengono controllati gli argomenti e come si legge un rifiuto.
---

Ogni funzione che uno script può chiamare è una **funzione host**: è legata al nome che l'autore digita, è presente senza un `import` e riceve risposta dall'app o dal runtime che sta giocando una campagna. Non esiste `import ripple`, nessuna classe da istanziare e nessuna sintassi a oggetti. Un componente o un'entità attraversa il confine come dict, perché l'interprete non ha `class`.

## Funzioni

Venti nomi, legati su ogni superficie, in quattro gruppi. Le firme sono quelle che l'app registra; la pagina di ciascun gruppo elenca che cosa risponde e che cosa rifiuta ogni funzione.

### Componenti ed entità

Dettaglio: [Componenti ed entità](/it/reference/python/components-and-entities/).

| Funzione | Cosa fa |
| --- | --- |
| `component_names()` | Ogni componente che il progetto contiene. |
| `component_get(name)` | Un componente come lo descrive il suo file, cioè un dict di etichette, tipi e valori iniziali, oppure `None`. Un tipo che non riconosci è un tipo scritto da una versione successiva. |
| `entity_names(of=None)` | Ciò che la storia ha creato, tutto oppure solo ciò che proviene da un componente. |
| `entity_get(name)` | Un'istantanea degli attributi di un'entità, oppure `None`. Modificare il dict non cambia nulla. |
| `entity_of(name)` | Da quale componente è stata creata un'entità, oppure `None`. |
| `entity_set(name, attribute, value)` | Scrive un attributo. |
| `entity_create(name, of=None)` | Crea un'entità da un componente e risponde con i suoi attributi. Rifiuta un nome già in uso. |
| `entity_delete(name)` | Ne annulla la creazione. Le schede della lavagna la nominano ancora e ne creano una nuova se vengono eseguite di nuovo. |
| `entity_rename(name, to)` | La rinomina, mantenendo ciò che è e ciò che contiene. Una scheda che nomina ancora il vecchio nome ne crea una nuova se viene eseguita di nuovo. |
| `component(name)` | Gli attributi di un componente o di un'entità, come dict, oppure `None`. Superata da `component_get` per la definizione e da `entity_get` per ciò che la storia ha cambiato. |
| `components()` | Ogni nome che puoi richiedere. Superata da `component_names` e `entity_names`, che non mescolano i due elenchi. |
| `set_attribute(name, attribute, value)` | Scrive su un'entità; `True` quando la scrittura è andata a buon fine. Superata da `entity_set`, che spiega il motivo quando non può riuscire. |

### Variabili di console

Dettaglio: [Variabili di console](/it/reference/python/console-variables/). Un valore viene convertito al tipo dichiarato quando non si perde nulla, e rifiutato altrimenti.

| Funzione | Cosa fa |
| --- | --- |
| `cvar_names()` | Ogni variabile di console, nell'ordine di dichiarazione. |
| `cvar_type(name)` | Il suo tipo come lo scrive il file: uno dei ventiquattro, come `int`, `markdown`, `json`, `list<string>` o `map<float>`. |
| `cvar_get(name)` | Ciò che contiene ora. Una list o una map è una copia. |
| `cvar_set(name, value)` | La scrive, convertendola al tipo dichiarato quando non si perde nulla e rifiutando altrimenti. |
| `cvar_reset(name)` | La riporta al valore predefinito. |

### Suono

Dettaglio: [Suoni](/it/reference/python/sounds/).

| Funzione | Cosa fa |
| --- | --- |
| `play_sound(path, volume=1.0, speed=1.0)` | Riproduce una volta il file in `path` (`sfx/bell.ogg`, come lo scrive il progetto) e ritorna subito. `volume` va da 0 a 1, `speed` da poco sopra 0. |

Un soundscape si imposta su un passaggio, non da Python.

### Il mondo fuori dalla storia

Dettaglio: [Il mondo fuori dalla storia](/it/reference/python/the-world/). Si legge solo se chi legge lo consente; una lettura non consentita solleva `PermissionError`, a meno che non abbia indicato un sostituto.

| Funzione | Cosa fa |
| --- | --- |
| `location_get()` | Dove si trova chi legge, come dict di `label`, `latitude`, `longitude`, `accuracy` e `when`, ognuno dei quali può essere `None`; oppure `None` quando non c'è ancora una posizione. |
| `location_distance(latitude, longitude)` | Quanto dista chi legge da quel punto, in metri, oppure `None` quando la lettura non ha coordinate. |

L'orologio è quello della libreria standard: `datetime.now()` e `date.today()`, letti allo stesso modo.

## Superfici

Chi chiama decide che cosa può succedere. Ogni funzione è legata su ogni superficie; ciò che cambia è l'effetto di una chiamata.

| Superficie | Dove | Legge | Scrive |
| --- | --- | --- | --- |
| `script` | Una scheda Script su una lavagna | Sì | Sì |
| `passage` | `{{ … }}` e ```` ```ripple ```` nella prosa | Sì | Rifiutato |
| `console` | La console Python dell'editor, in fase di progettazione | Definizioni e valori predefiniti | Rifiutato |
| `agent` | `python_eval` tramite MCP | Definizioni e valori predefiniti | Rifiutato |
| `playthrough` | La console della finestra della campagna, durante il gioco | Sì | Sì |

- Un passaggio rifiuta le scritture per via del punto in cui gira la chiamata: un cambio di stato appartiene a una scheda che puoi indicare sulla lavagna.
- Un passaggio rifiuta un suono perché i suoi snippet vengono rieseguiti a ogni ridisegno.
- La console e un agente rifiutano le scritture perché in fase di progettazione non c'è nulla in esecuzione: un progetto senza una sessione di gioco non ha entità, e una variabile di console contiene il suo valore predefinito.
- Le letture funzionano in fase di progettazione. `component_get` e `component_names` rispondono dai file. `entity_names()` è `[]` e `entity_get(name)` è `None`. Sono risposte, non errori.
- La superficie playthrough può fare tutto ciò che può fare una scheda Script. *Gioca da qui* avvia una storia in cui non è stato creato nulla, e questa console prende il posto delle schede che la storia non ha eseguito.

I motivi sono in [Python in una storia](/it/explanation/python-in-a-story/).

## Chiamate

Gli argomenti obbligatori sono posizionali. L'opzionale `of` è solo per parola chiave. `play_sound` fa eccezione: `volume` e `speed` possono essere passati per posizione o per nome. Non è accettata nessuna parola chiave oltre a quelle elencate.

```python
entity_names(of="Goblin")                 # right
entity_names("Goblin")                    # raises: too many positional arguments
entity_create("Goblin-7", frm="Goblin")   # raises: unknown keyword, names the ones it knows
```

| Funzione | Posizionali | Parole chiave |
| --- | --- | --- |
| `entity_names` | 0 | `of` |
| `entity_create` | 1 | `of` |
| `play_sound` | da 1 a 3 | `volume`, `speed` |

Le altre funzioni accettano esattamente gli argomenti posizionali della loro firma e nessuna parola chiave. Una chiamata sbagliata solleva un errore invece di rispondere. `component`, `components` e `set_attribute` fanno eccezione: ciò che fanno davanti a un errore è congelato quanto i loro nomi.

**Le funzioni host non si possono chiamare dentro `map()`, `filter()` o `sorted(key=…)`.** L'interprete solleva un errore. Dentro un `def` o una comprehension funzionano:

```python
sorted(entity_names(), key=lambda n: entity_get(n)["HP"])   # raises

pairs = [(entity_get(n)["HP"], n) for n in entity_names()]  # works
weakest = sorted(pairs)[0][1]
```

## Le letture sono copie

Un valore passa dall'app a Python attraverso JSON, quindi ciò che rispondono `entity_get`, `component_get` e `cvar_get` è un'istantanea. Modificarla è lecito, silenzioso e senza effetto:

```python
e = entity_get("Mira")
e["HP"] = e["HP"] - 3      # runs, changes nothing
```

`entity_set` e `cvar_set` sono il modo in cui uno script scrive.

## Chiamate rifiutate

Ogni rifiuto arriva a Python come un `RuntimeError` che porta una frase e nient'altro.

```python
try:
    entity_create("Goblin-1", of="Goblin")
except RuntimeError:
    pass                    # it already existed
```

Le frasi con cui una superficie rifiuta sono fisse, perché uno script potrebbe già aver ramificato in base a quella ricevuta.

| Rifiutato | Frase |
| --- | --- |
| Un passaggio, qualsiasi scrittura | `a passage describes the world; only a Script node changes it` |
| Console o agente, scrittura su un'entità | `no campaign is running, so there are no entities to change — press play, or put this in a Script node` |
| Console o agente, scrittura su una variabile | `no campaign is running, so a console variable holds its default — press play, or put this in a Script node` |
| Un passaggio, `play_sound` | `a passage cannot play a sound — its snippets run again every time it is redrawn, so put this on a Play sound node or in a Script node` |
| Console o agente, `play_sound` | `no campaign is running, so there is nothing to play this through — press play, or put this on a Play sound node` |

Una lettura del mondo che chi legge non ha consentito è l'unico rifiuto che non è un `RuntimeError`: è il `PermissionError` di Python, quindi `except PermissionError:` cattura quello e nient'altro. Vedi [Il mondo fuori dalla storia](/it/reference/python/the-world/).

Un rifiuto dentro un passaggio non interrompe l'esecuzione. Viene mostrato sul posto come un chip `⚠ RuntimeError: …` e la storia prosegue, ed è per questo che ogni messaggio è di una sola riga. Un nome citato in un rifiuto viene tagliato a circa quaranta caratteri.

## Interprete

L'interprete esegue un sottoinsieme di Python in sandbox, non CPython: niente `class`, niente `random`, niente `import requests`, niente filesystem, niente vera libreria standard. Ciò che è disponibile è ciò che il **rapporto della sandbox** dietro il pulsante `i` della console dichiara nel giorno in cui lo chiedi, e `python_capabilities` restituisce lo stesso testo a un agente. Dove questa pagina e il rapporto non concordano, ha ragione il rapporto.

Uno script che non ha finito dopo due secondi viene interrotto. Vedi [La sandbox e i suoi limiti](/it/reference/python/sandbox/).

## Versioni

Questi nomi sono un contratto con ogni passaggio e ogni script scritto su di essi dalla 1.3 in poi (`play_sound` dalla 1.4, `location_get` e `location_distance` dalla 1.6), e vengono ampliati senza essere riutilizzati per altro. La forma che `component_get` restituisce è condivisa con `component_read` tramite MCP.

## Vedi anche

- [Python in una storia](/it/explanation/python-in-a-story/): perché Python è una superficie dell'host e a che cosa serve ciascuna superficie.
- [Come eseguire Python in una storia](/it/how-to/script-a-passage/)
- [Come creare una campagna senza Python](/it/how-to/turn-python-off/)
- [Strumenti MCP](/it/reference/mcp-tools/): `python_eval`, `python_capabilities` e `component_read`.
