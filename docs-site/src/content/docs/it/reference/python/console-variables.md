---
title: Variabili di console
description: Le cinque funzioni Python sulle variabili di console di un progetto, i ventiquattro tipi, la tabella di coercizione e i rifiuti.
sidebar:
  order: 3
---

Cinque funzioni sulle variabili di console dichiarate da un progetto: valori tipizzati, con nome e con un valore predefinito, che si possono scrivere e leggere ovunque, tra una lavagna e l'altra e tra un salvataggio e l'altro. Sono disponibili sulle stesse cinque [superfici](/it/reference/python/) dell'API dei componenti.

## Funzioni

| Funzione | Restituisce | Scrive in |
| --- | --- | --- |
| `cvar_names()` | ogni nome, nell'ordine di dichiarazione | — |
| `cvar_type(name)` | il tipo, scritto come lo scrive il file | — |
| `cvar_get(name)` | ciò che la variabile contiene ora; una list o una map è una **copia** | — |
| `cvar_set(name, value)` | `None`; il valore viene convertito o rifiutato | scheda Script, console della sessione di gioco |
| `cvar_reset(name)` | `None`; la variabile torna al suo valore predefinito | scheda Script, console della sessione di gioco |

In fase di progettazione (la console dell'editor, o un agente) una variabile contiene il proprio valore predefinito, e `cvar_get` restituisce quello. Un passaggio può leggere ma non scrivere.

Ogni funzione che accetta un nome solleva `there is no console variable called "<name>"` per un nome che nessuna dichiarazione contiene. Il nome viene controllato **prima** della superficie, quindi un passaggio con un errore di battitura riceve la segnalazione dell'errore di battitura, non quella sui passaggi. Un nome vuoto solleva `<function>: needs a name`.

## Tipi

Otto scalari e, per ciascuno, una list e una map con chiavi stringa: ventiquattro tipi. L'insieme è chiuso, e ogni editor dell'app offre gli stessi ventiquattro.

| `type` | Contiene | Predefinito |
| --- | --- | --- |
| `int` | un numero intero | `0` |
| `float` | un numero | `0.0` |
| `bool` | `true` o `false` | `false` |
| `string` | testo | `""` |
| `markdown` | testo con un renderer | `""` |
| `asset` | un percorso di un file, relativo al progetto | `""` |
| `componentRef` | un percorso di un componente, relativo al progetto | `""` |
| `json` | qualsiasi valore JSON | `{}` |
| `list<T>` | una list ordinata dello scalare `T`, per ciascuno degli otto | `[]` |
| `map<T>` | chiavi stringa associate allo scalare `T`, per ciascuno degli otto | `{}` |

`cvar_type` restituisce una di quelle ventiquattro stringhe, come `int`, `markdown`, `json`, `list<string>` o `map<float>`. Una variabile dichiarata non contiene mai `None`.

`markdown`, `asset` e `componentRef` si comportano come `string`. Dichiarano a cosa serve una variabile, cioè da cosa l'editor ricava un campo di sei righe o un percorso; il motore non ha un filesystem e non verifica che un percorso esista.

`json` è l'unico tipo che permette l'annidamento. Accetta una list o un dict così come sono, quindi una `list<json>` contiene list e una `map<json>` contiene dict. Ogni altro tipo rifiuta una raccolta dove si aspetta uno scalare.

## Coercizione

Ogni scrittura è senza perdite o viene rifiutata. Decide una sola funzione, e la interrogano la scheda Set, `cvar_set`, la finestra della campagna e il compilatore.

| In | Accettato | Rifiutato |
| --- | --- | --- |
| `int` | un int; un float intero e finito (`3.0` diventa `3`); il testo di uno dei due (`"42"`, `" 42 "`, `"3.0"`) | `3.5`, `"3.5"`, NaN, un infinito, un bool, altro testo, qualsiasi raccolta, `None` |
| `float` | qualsiasi numero, come float (`2` diventa `2.0`); il testo di un numero | un bool, altro testo, qualsiasi raccolta, `None` |
| `bool` | un bool; esattamente il testo `true` o `false`, senza spazi ai margini | `"True"`, `"yes"`, `1`, `0`, `""`, qualsiasi raccolta, `None` |
| `string`, `markdown`, `asset`, `componentRef` | un testo così com'è; un numero o un bool come testo (`42` diventa `"42"`, `True` diventa `"true"`) | qualsiasi raccolta, `None` |
| `json` | qualsiasi cosa, così com'è: uno scalare, una list, un dict | `None`, e nient'altro |
| `list<T>` | una list i cui elementi si convertono tutti in `T` | qualsiasi scalare (mai incapsulato), una map, una list con un elemento che non si converte, `None` |
| `map<T>` | una map con tutte le chiavi stringa e tutti i valori convertibili in `T` | qualsiasi scalare, una list, una chiave non stringa, un valore che non si converte, `None` |

Una raccolta convertita è sempre una list o una map nuova, mai quella passata.

### Frase di rifiuto

Una scrittura rifiutata si legge così:

```text
<name> holds a <type>, and <value> is not one
```

*an* sostituisce *a* davanti a un tipo che comincia con una vocale. Un valore stringa è racchiuso tra virgolette, una list è indicata come *a list*, una map come *an object*, e `None` come *nothing*. Esempi: `gold holds an int, and 3.5 is not one`; `tags holds a list<string>, and "sword" is not one`.

Il rapporto della scheda Set e il testo di errore di una scheda usano la stessa frase.

## Rifiuti

Ogni rifiuto è un `RuntimeError` che uno script può intercettare.

| Chiamante | Frase |
| --- | --- |
| passaggio | quella dell'API dei componenti: *a passage describes the world; only a Script node changes it* |
| console dell'editor, agente | `no campaign is running, so a console variable holds its default — press play, or put this in a Script node` |

Entrambe le frasi sono fisse.

## Esempi

```python
# Spend gold if there is enough.
gold = cvar_get("gold")
if gold >= 25:
    cvar_set("gold", gold - 25)

# A list is a copy: append to it, then write it back.
tags = cvar_get("tags")
if "wanted" not in tags:
    tags.append("wanted")
    cvar_set("tags", tags)

# Coercion: these land, and the last one is refused.
cvar_set("gold", 3.0)        # 3
cvar_set("gold", "42")       # 42
try:
    cvar_set("gold", 3.5)    # RuntimeError: gold holds an int, and 3.5 is not one
except RuntimeError:
    pass

# What the project declares, with types.
declared = {name: cvar_type(name) for name in cvar_names()}
```

## In un salvataggio e in un'esportazione

| Elemento | Regola |
| --- | --- |
| Partita salvata | contiene ogni variabile per nome |
| Variabile assente da un salvataggio | contiene il proprio valore predefinito |
| Variabile rimossa dalle dichiarazioni | scartata alla ripresa |
| Variabile aggiunta mentre una campagna è in pausa | presente alla ripresa |
| Variabile cambiata di tipo in modo che il valore salvato non sia più adatto | torna al valore predefinito |
| Campagna compilata | contiene ogni dichiarazione (nome, tipo, valore predefinito); ogni sessione di gioco parte da queste |
| Copia del progetto | contiene `.ripple/cvars.json` stesso |

I ventiquattro tipi sono contenuti in `.ripple/cvars.json` versione 3 e nel formato di partita salvata 5. Un salvataggio registra ciò che ogni variabile conteneva, non il suo tipo, quindi una versione precedente a quel formato rifiuta un salvataggio più recente.

## Vedi anche

- [Variabili di console](/it/explanation/console-variables/): a cosa serve una variabile e dove risiede.
- [Come dichiarare e delimitare l'ambito di una variabile di console](/it/how-to/declare-console-variables/)
- [Dichiarazioni delle variabili di console](/it/reference/console-variable-declarations/): il formato del file.
- [Il sandbox e i suoi limiti](/it/reference/python/sandbox/)
