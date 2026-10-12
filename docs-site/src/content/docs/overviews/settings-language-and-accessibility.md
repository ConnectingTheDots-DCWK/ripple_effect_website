---
title: Settings, language and accessibility
description: The interface language, More contrast and the colour-vision modes in Settings, and what they do and do not claim.
sidebar:
  order: 16
---

The gear in the app bar opens the Settings dialog; [the workspace](/overviews/the-workspace/#settings)
page lists everything on it. This page is about the rows that decide how the
app itself looks and speaks: *Language*, *Contrast* and *Colour vision*. They
are settings of the app, not of a project, so they follow you from project to
project. Each is a choice among a few named things, and it takes effect when
you press it — there is no Apply.

Contrast and colour vision are also on the first page of a first launch, beside a small preview that changes as you choose.

## Language

*Settings ▸ Language* switches every menu, dialog, message and tip to Italian.
Each language is listed under its own name, so you can find yours even if the
app is currently showing one you cannot read, and *System* follows the
operating system's language.

This is the language of the app only. A project's own text and languages are
untouched, and are set in the project's own settings — see
[passages and languages](/overviews/passages-and-languages/).

The Italian translation was drafted by a model and spot-checked rather than
read line by line. If something reads oddly, tell us where.

## Contrast

*Settings ▸ Contrast* has two choices, *Standard* and *More*. Standard clears
the usual accessibility floor. **More** takes body and caption text to the
stricter accessibility grade (AAA) and gives every text field, button, chip,
switch and checkbox an edge you can find. The colours stay the same and the
page does not change shape.

Contrast is separate from the theme, so you can have dark and firmer at once.

## Colour vision

*Settings ▸ Colour vision* is *Off* (the house colours), *Protan*, *Deutan* or
*Tritan*, for protanopia and protanomaly, deuteranopia and deuteranomaly, and
tritanopia and tritanomaly. It recolours everything the app uses colour to
tell apart:

- the node families on a board;
- traced routes;
- the marks on files that version control puts there;
- status colours;
- syntax highlighting;
- the diff, which stops being red and green.

The palettes are chosen so that things which share a shape do not share a
colour, and are checked against a simulation of all eight kinds of colour
blindness. Neutral greys are left alone, because every kind agrees about them.

### What this does not claim

A palette helps; it is not sufficient. Three places in the app tell categories
apart by hue and nothing else: the board minimap and the overview's, where a
family is a few-pixel rectangle with no icon or label; the traced routes; and
a soundscape clip too narrow to have its mode written on it. A colour-vision
mode makes them better without making them readable to everyone.

There are no modes for the two achromatic kinds of colour blindness, because
eight routes cannot be eight distinguishable greys and a mode promising that
would be a false promise.

The app does not claim screen-reader support: there is none.

## Text size

Not a setting of the app: the chrome follows your system's text size, up to
double, while cards on a board stay at the size they were drawn at. See
[the workspace](/overviews/the-workspace/#settings).
