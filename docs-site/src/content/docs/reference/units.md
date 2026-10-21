---
title: Units
description: Every unit the Convert node knows, the spellings it reads in a typed quantity, and which unit "Reader's system" picks for a reader in each region.
sidebar:
  order: 3
---

The [Convert](/reference/nodes/#convert) card turns a quantity in one unit into another. It knows the units below and nothing else; the table is the engine's, and a host playing a campaign converts by the same one.

## The units

A unit converts only into another of the same kind.

| Kind | Units, with their symbol |
| --- | --- |
| Length | millimetres `mm`, centimetres `cm`, metres `m`, kilometres `km`, inches `in`, feet `ft`, yards `yd`, miles `mi` |
| Area | square centimetres `cm²`, square metres `m²`, hectares `ha`, square kilometres `km²`, square inches `in²`, square feet `ft²`, acres `ac`, square miles `mi²` |
| Volume | millilitres `mL`, litres `L`, cubic metres `m³`, US fluid ounces `fl oz`, US pints `pt`, US gallons `gal`, imperial fluid ounces `imp fl oz`, imperial pints `imp pt`, imperial gallons `imp gal` |
| Mass | milligrams `mg`, grams `g`, kilograms `kg`, tonnes `t`, ounces `oz`, pounds `lb`, stone `st` |
| Temperature | degrees Celsius `°C`, degrees Fahrenheit `°F`, kelvins `K` |
| Speed | metres per second `m/s`, kilometres per hour `km/h`, miles per hour `mph`, knots `kn` |
| Time | milliseconds `ms`, seconds `s`, minutes `min`, hours `h`, days `d`, weeks `wk` |

On a wire, a unit is named by its id: the English singular in lower case, with hyphens — `kilometer`, `square-foot`, `fluid-ounce-imperial`, `mile-per-hour`.

There is no currency. A rate changes from day to day, and every factor in this table is fixed by definition: an inch is exactly 0.0254 m, a pound 0.45359237 kg, a US gallon 3.785411784 L.

## A quantity typed as text

With *From the text*, the card reads the unit off the value: a number, then the unit.

- **A dot is the only decimal point.** `1,500 m` is not read, because it is fifteen hundred in English and one and a half in Italian. Neither is `1e3 m`.
- The unit may be its id, its symbol or its English name, singular or plural: `12 km`, `12 kilometres`, `12km`, `72°F`, `72 F`, `3.5 lb`, `2 Liters`.
- A one-letter symbol keeps its case: `m` is a metre and `M` is nothing.

A value the card cannot read leaves by `unavailable`.

## Reader's system

*Reader's system* answers in the unit the reader's region measures in, which comes from the language they are reading in. `en-US` is the United States, `en-GB` the United Kingdom, and every other region is metric.

| From | Metric reader | US reader | UK reader |
| --- | --- | --- | --- |
| kilometres | kilometres | miles | miles |
| miles | kilometres | miles | miles |
| metres | metres | feet | metres |
| feet, yards | metres | feet, yards | metres |
| centimetres, millimetres | the same | inches | the same |
| kilograms | kilograms | pounds | kilograms |
| pounds | kilograms | pounds | kilograms |
| stone | kilograms | pounds | stone |
| litres | litres | US pints | litres |
| °C | °C | °F | °C |
| °F | °C | °F | °C |
| km/h | km/h | mph | mph |

The rest follow the same pattern: square units with the lengths they are made of, hectares with acres, imperial volumes with the US ones. Time and knots are never changed.

## Related

- [Nodes](/reference/nodes/#convert), for the Convert card's ports.
- [How to add, switch off or change a project's languages](/how-to/manage-languages/), for Get locale, which says which system a reader is in.
- [Diagnostics](/reference/diagnostics/#wge20), for `W.GE.20`.
