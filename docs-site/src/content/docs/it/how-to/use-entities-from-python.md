---
title: Come leggere e modificare le entità da Python
description: Trova, danneggia, elimina, crea e ispeziona le entità da una scheda Script, usando le funzioni dei componenti e delle entità.
---

Cinque ricette sulle entità che una sessione di gioco ha creato a partire da un componente. Ognuna presuppone un componente chiamato `Goblin` con un attributo `HP` e uno script eseguito in una scheda Script o nella console della sessione di gioco. La lettura funziona su ogni [superficie](/it/reference/python/); `entity_set`, `entity_create`, `entity_delete` e `entity_rename` funzionano solo in una scheda Script e nella console della sessione di gioco, e altrove vengono rifiutate. `damage` sta per un numero che lo script ha già.

## Trova il goblin più debole

1. Raccogli i punti ferita di ogni goblin insieme al suo nome, con `entity_names(of="Goblin")`.
2. Ordina le coppie e prendi il nome dalla prima, tenendo conto del caso in cui non ce ne siano.

```python
pairs = [(entity_get(n)["HP"], n) for n in entity_names(of="Goblin")]
weakest = sorted(pairs)[0][1] if pairs else None
```

`weakest` è un nome, oppure `None` quando la storia non ha creato goblin. Per verificare se un'entità esiste, usa `entity_get(name) is None`: un'entità senza attributi risponde `{}`, che è anch'esso falso.

## Danneggia un'entità ed eliminala quando cade a zero

1. Leggi il suo `HP` e sottrai il danno.
2. Riscrivi il nuovo valore con `entity_set` finché è sopra zero.
3. Chiama `entity_delete` quando non lo è.

```python
if weakest is not None:
    hp = entity_get(weakest)["HP"] - damage
    if hp > 0:
        entity_set(weakest, "HP", hp)
    else:
        entity_delete(weakest)
```

Sia `entity_set` sia `entity_delete` generano un errore quando nessuna entità risponde a quel nome. L'eliminazione non lascia alcun segno (tombstone): una scheda Component che nomina ancora l'entità ne crea una nuova dal file se viene eseguita di nuovo. Rinominare ha lo stesso effetto, quindi evita `entity_rename` su un'entità nominata da una scheda Component: dopo `entity_rename("Goblin-7", "Steve")` la scheda non trova nulla sotto `Goblin-7` e crea un nuovo goblin dal file.

## Crea un'entità solo se la storia non l'ha già fatto

`entity_create` non è mai un «ottieni o crea»: genera un errore quando il nome è già preso, quindi intercetta l'errore quando non ti interessa.

```python
try:
    entity_create("Boss", of="Goblin")
except RuntimeError:
    pass
```

La clausola `except` inghiotte anche l'errore generato quando `of` nomina un componente inesistente, che è un refuso e non un filtro vuoto, quindi controlla prima l'ortografia di `of`. La chiamata risponde con gli attributi della nuova entità, perciò `entity_create("Goblin-7", of="Goblin")["HP"]` legge i punti ferita iniziali in una riga.

## Raccogli i valori di un componente in un unico dict

1. Chiama `component_get("Goblin")`, che risponde con la definizione così come la descrive il suo file, oppure `None`.
2. Per ogni voce di `attributes`, prendi `items` quando c'è (le due liste di percorsi, `list<asset>` e `list<componentRef>`), e `value` altrimenti.

```python
fields = {}
for attr in component_get("Goblin")["attributes"]:
    if "items" in attr:
        fields[attr["label"]] = attr["items"]
    else:
        fields[attr["label"]] = attr["value"]
```

Ogni attributo porta anche il suo `type`. Distinguili in base a esso, con un ramo predefinito, perché l'insieme è aperto.

## Trova la definizione dietro un'entità

`entity_of` risponde con il componente da cui è stata creata un'entità, e `component_get` accetta quel nome:

```python
definition = component_get(entity_of("Goblin-1"))
```

## Vedi anche

- [Componenti ed entità](/it/reference/python/components-and-entities/) elenca ogni funzione, cosa risponde e cosa rifiuta.
- [Componenti ed entità, spiegati](/it/explanation/components-and-entities/) spiega cosa sono un componente e un'entità.
- [Come eseguire Python in una storia](/it/how-to/script-a-passage/) tratta la scheda Script in cui girano queste ricette.
- [La sandbox e i suoi limiti](/it/reference/python/sandbox/) elenca cosa può chiamare uno script.
