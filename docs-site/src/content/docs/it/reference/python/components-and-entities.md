---
title: Componenti ed entità
description: Le dodici funzioni Python sui componenti di una campagna e sulle entità create da una sessione di gioco, con argomenti, risposte e rifiuti di ciascuna.
sidebar:
  order: 2
---

Un **componente** è ciò che descrive un file `*.component.json`. Un'**entità** è una creata dalla storia a partire da un componente, identificata per nome. Nove funzioni leggono le definizioni, leggono le entità e scrivono le entità; altre tre, più vecchie, sono mantenute.

Sono funzioni dell'host, non una libreria Python: non c'è alcun modulo da cui importarle e non si possono chiamare dentro `map()`, `filter()` o `sorted(key=…)`. Una comprehension funziona.

Dove si può chiamare una funzione lo decide la [superficie](/it/reference/python/). Ogni funzione legge su ogni superficie. Le quattro scritture (`entity_set`, `entity_create`, `entity_delete`, `entity_rename`) funzionano in una scheda Script e nella console della sessione di gioco, e altrove vengono rifiutate.

## Riepilogo

| Funzione | Risponde | Scrive | Solleva un errore |
| --- | --- | --- | --- |
| `component_names()` | elenco dei nomi dei componenti, in ordine di nome | no | mai |
| `component_get(name)` | il componente come lo descrive il suo file, oppure `None` | no | mai |
| `entity_names(of=None)` | elenco dei nomi delle entità, in ordine di nome | no | `of` non corrisponde ad alcun componente |
| `entity_get(name)` | una copia degli attributi dell'entità, oppure `None` | no | mai |
| `entity_of(name)` | il nome del componente da cui è stata creata, oppure `None` | no | mai |
| `entity_set(name, attribute, value)` | `None` | sì | nessuna entità con il nome `name` |
| `entity_create(name, of=None)` | gli attributi della nuova entità | sì | nome già preso; `of` non corrisponde ad alcun componente |
| `entity_delete(name)` | `None` | sì | nessuna entità con il nome `name` |
| `entity_rename(name, to)` | `None` | sì | nessuna entità con il nome `name`; `to` già preso |

`of` si passa per parola chiave: `entity_names(of="Goblin")`, `entity_create("Goblin-7", of="Goblin")`. Un numero di argomenti sbagliato o una parola chiave sconosciuta viene rifiutato con un messaggio che nomina la funzione.

## Definizioni

### `component_names()`

Ogni componente che la campagna contiene, in ordine di nome. Solo componenti; `components()` mette insieme componenti ed entità.

### `component_get(name)`

Un componente come lo descrive il suo file: etichette, tipi e valori iniziali, come dict, oppure `None`. Si risolve per nome o per id di catalogo.

```python
>>> component_get("Goblin")
{
  "id": "9f2c…",
  "name": "Goblin",
  "cover": "art/goblin.png",
  "attributes": [
    {"label": "HP",    "type": "int",       "value": 7},
    {"label": "Rate",  "type": "float",     "value": 1.5},
    {"label": "Alive", "type": "bool",      "value": True},
    {"label": "Bio",   "type": "markdown",  "value": "A small, angry thing."},
    {"label": "Loot",  "type": "list<asset>", "items": ["gold.png"]}
  ]
}
```

| Chiave | Presente | Contiene |
| --- | --- | --- |
| `id` | sempre | l'id di catalogo del componente |
| `name` | sempre | il nome del componente |
| `cover` | solo se il file ne ha una | un percorso |
| `attributes` | sempre | un elenco ordinato di `label`, `type` e `value` |
| `items` (su un attributo, al posto di `value`) | solo sulle due liste di percorsi, `list<asset>` e `list<componentRef>` | l'elenco dei percorsi |

I valori passano come tipi Python nativi: un `int` è un `int` e un attributo `json` è il dict o la lista decodificati. La forma è quella che `component_read` restituisce via MCP, senza `path`.

**`type` è un insieme aperto.** È il nome nel formato su disco: uno tra `int`, `float`, `bool`, `string`, `markdown`, `asset`, `componentRef` o `json`, da solo oppure come `list<…>` o `map<…>`, ventiquattro in tutto. Un tipo che questa versione non conosce mantiene la grafia data dal file, quindi uno script che si comporta in base a `type` ha bisogno di un ramo predefinito.

**Un percorso è relativo a ciò che ha risposto.** L'editor risponde con percorsi relativi al progetto; una campagna compilata risponde con percorsi nella propria cartella dei media. Non unire un percorso a una cartella tua. In una campagna in gioco, un file che il progetto non ha viene omesso dalla risposta.

**Un'entità non oscura mai una definizione.** `component_get` non dipende dal fatto che sia stata creata un'entità con quel nome. È l'unico punto in cui differisce da `component()`.

## Entità, lettura

### `entity_names(of=None)`

Ogni entità creata dalla storia, in ordine di nome. `of` indica un componente e limita l'elenco alle entità create da esso. Se `of` non corrisponde ad alcun componente, solleva un errore (*there is no component called …*); `of=None`, o un nome vuoto, significa nessun filtro. In fase di progettazione la risposta è `[]`.

### `entity_get(name)`

Gli attributi dell'entità come dict, oppure `None` quando la storia non ha creato nulla con quel nome. Non ricade sul file del componente.

| Risposta | Significa |
| --- | --- |
| `None` | nessuna entità di questo tipo |
| `{}` | un'entità senza attributi |

Entrambe sono falsy. Il dict è una copia: modificarlo non cambia nulla, e a scrivere è `entity_set`. In fase di progettazione la risposta è `None`.

### `entity_of(name)`

Il nome del componente da cui l'entità è stata creata, oppure `None` per un'entità creata da nessun componente o per un nome a cui nulla risponde. `component_get(entity_of("Goblin-1"))` è la definizione che sta dietro a un'entità.

## Entità, scrittura

Solo scheda Script e console della sessione di gioco. Su un passaggio, il rifiuto è *a passage describes the world; only a Script node changes it*. Nella console dell'editor e per un agente via MCP, è *no campaign is running, so there are no entities to change — press play, or put this in a Script node*.

### `entity_set(name, attribute, value)`

Scrive un attributo. Risponde `None`. Solleva un errore quando nulla risponde a `name`: *the campaign has made no entity called …*. Si può scrivere un attributo che il componente non ha mai avuto; componenti ed entità non hanno uno schema.

### `entity_create(name, of=None)`

Crea un'entità e risponde con i suoi attributi, per esempio `entity_create("Goblin-7", of="Goblin")["HP"]`.

| Chiamata | Risultato |
| --- | --- |
| `of` omesso, esiste un componente con lo stesso nome | creata da quel componente, come fa una scheda Component in modalità Entity |
| `of` omesso, nessun componente di questo tipo | un'entità senza attributi |
| `of` indicato e non corrispondente ad alcun componente | solleva un errore: *there is no component to make … from* |
| `name` già preso | solleva un errore: *… is already taken, and it never takes over a name that exists* |

`entity_create` non è mai get-or-create. Le schede Component e Spawn della lavagna sono get-or-create.

### `entity_delete(name)`

Elimina un'entità. Risponde `None`. Solleva un errore quando nulla risponde a `name`. Non lascia alcun segno dell'eliminazione: una scheda Component che nomina ancora l'entità ne crea una nuova dal file se viene eseguita di nuovo. La scheda Delete Entity si comporta allo stesso modo.

### `entity_rename(name, to)`

Rinomina un'entità, mantenendo ciò che è e ciò che contiene. Risponde `None`. Solleva un errore quando nulla risponde a `name` e quando `to` è già preso: *… is already taken, so … was not renamed to it*. Rinominare con il nome che ha già non fa nulla.

Il componente da cui proviene non cambia: un goblin rinominato resta raggruppato sotto Goblin nel pannello delle entità, e `entity_of` risponde ancora `Goblin`.

:::caution
Una scheda Component legge il nome della sua entità dalla scheda a ogni passaggio. Dopo `entity_rename("Goblin-7", "Steve")`, alla successiva esecuzione di quella scheda non si trova nulla sotto `Goblin-7` e viene creato un nuovo goblin dal file. È la regola di eliminazione applicata alla rinomina.
:::

## Funzioni mantenute

Disponibili su ogni superficie, con il comportamento originale. Il pannello della sandbox le elenca in ambra con la funzione che le sostituisce.

| Funzione | Sostituita da | Comportamento |
| --- | --- | --- |
| `component(name)` | `component_get(name)` per la definizione, `entity_get(name)` per ciò che la storia ha cambiato | Gli attributi di un componente o di un'entità come dict, oppure `None`. Un'entità con lo stesso nome prevale sulla definizione. `component()` senza argomenti è `None`. |
| `components()` | `component_names()` e `entity_names()` | Ogni nome che si può richiedere, componenti ed entità insieme. |
| `set_attribute(name, attribute, value)` | `entity_set(name, attribute, value)`, che dice il perché quando non può | `True` quando la scrittura è andata a buon fine, `False` quando no; con meno di tre argomenti, `False`. Nella console dell'editor risponde `False`, dato che non c'è alcuna entità. Un passaggio e un agente vengono rifiutati a parole, come per ogni altra scrittura. |

`component()` oscura; né `component_get` né `entity_get` lo fanno, ed è per questo che le sostitute sono due funzioni e non una.

## Vedi anche

- [Componenti ed entità](/it/explanation/components-and-entities/) spiega cosa sono i due e perché un passaggio può leggere e non scrivere.
- [Come leggere e modificare le entità da Python](/it/how-to/use-entities-from-python/) applica queste funzioni.
- [Come usare componenti ed entità](/it/how-to/use-components-and-entities/) tratta il lato della lavagna.
- [La sandbox e i suoi limiti](/it/reference/python/sandbox/) elenca le funzioni mantenute.
- [Riferimento Python](/it/reference/python/) elenca le frasi di rifiuto fisse di ciascuna superficie.
