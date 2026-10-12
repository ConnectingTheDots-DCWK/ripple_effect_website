---
title: What the accessibility settings do and do not claim
description: How the contrast and colour-vision palettes were chosen, why there is no mode for achromatic vision, why there is no screen-reader support, and why cards on a board ignore the system's text size.
---

Ripple Effect offers two accessibility settings of its own, *Contrast* and *Colour vision*, and follows your system's text size in the chrome. This page explains what each of them is for and, as carefully, where each stops. The aim is that nothing in the app reads as a promise it does not keep.

## Two settings, and the theme beside them

Both settings belong to the app, not to a project, so they follow you from project to project. They are separate from the theme: you can have dark and firmer at once, or light with a colour-vision palette. A first launch asks about them on its first page, beside a small preview of the app. The rows themselves are listed in [Settings, accessibility and updates controls](/reference/settings/).

The house style that these settings modify has its own rule about colour: the accents are a vocabulary, not a palette. A colour in the app means something, such as a node family, a traced route, a mark that version control puts on a file, or a status. That is why accessibility is done by swapping whole vocabularies and not by tinting the screen.

## Contrast: firmer, not different

Without the setting the app already clears a floor. The whole palette is measured against WCAG 2.1 AA in both themes: the edge of a text field, an outlined button, a chip, a switch or a checkbox is clearly visible, and a file left out of the history is a visible dot.

*More* contrast takes body and caption text to the stricter accessibility grade (AAA) and gives every text field, button, chip, switch and checkbox an edge you can find. It deliberately stops there. The colours stay the same and the page does not change shape.

The reason is that there are two ways to make something more legible. One is to collapse the surfaces toward white to buy separation, which would be a different design rather than a firmer one. The other is to keep the design and tighten the floors it already clears. The app takes the second: the ink is raised and the surfaces are left alone. The hairlines that divide the page stay decoration.

## Colour vision: three modes for eight kinds

*Colour vision* is *Off* (the house colours), *Protan*, *Deutan* or *Tritan*. They stand for protanopia and protanomaly, deuteranopia and deuteranomaly, and tritanopia and tritanomaly. That is three modes for six kinds, because an anomaly is a milder case of the dichromacy beside it and is served by the same hues.

A mode recolours everything the app uses colour to tell apart:

- the node families on a board;
- traced routes;
- the marks on files that version control puts there;
- status colours;
- syntax highlighting;
- the diff, which stops being red and green.

Neutral greys are left alone, because every kind of colour vision agrees about them. That is what lets a mode change the vocabularies and leave the rest of the page as it was.

### How the palettes were chosen

The rule is that things which share a shape must not share a colour. Palettes are verified by measuring distance after simulating all eight kinds of colour blindness, including the two the app has no mode for, and never by distance on the hue wheel. The house palette is expected to fail the same check; if the defaults were already safe, the modes would be answering a question nobody asked.

The simulation is used to verify a palette and is never shown to you. Handing a reader a simulation of their own deficiency would render what they already see, and would throw away whatever separation their vision still gets.

### Why there is no achromatopsia mode

The two achromatic kinds of colour blindness have no mode. This is a decision, not a gap. A traced route set can have eight routes, and eight routes cannot be eight distinguishable greys. A mode that promised it would take as much away as it gave, and a false promise is worse than none. What the palettes owe those readers instead is a spread in lightness, which serves that case as far as a palette can.

## Where a palette is not enough

A palette helps; it is not sufficient. Three places in the app tell categories apart by hue and nothing else:

- the board minimap and the overview's, where a family is a few-pixel rectangle with no icon or label;
- the traced routes;
- a soundscape clip too narrow to have its mode written on it.

The go and stop marks are different: they carry play and square icons and their labels, so a reader who sees no hue can still tell them apart. A colour-vision mode makes these better without making them readable to everyone. Fixing the first two properly would need the canvas to carry more than a colour for each thing it draws, such as a label, a dash or an index, and that belongs to the node editor package rather than to the app. The settings page does not claim more than the palette can deliver, and this page says so for the same reason.

## No screen-reader support

The app does not claim screen-reader support: there is none. A canvas of freely positioned node cards, a painted brand and image viewers do not have a screen-reader story worth faking, and a claim that was not true would be worse for the people it was meant for than an honest absence. If that changes, the file tree and the tab strips are where most of the value would be.

## Text size: the chrome follows, the cards do not

The chrome (menus, dialogs, messages, the side bar) honours your system's text size, up to double. Boards do not. Cards on a board stay at the size they were drawn at, whatever the desktop's text size says.

The reason is that a card's height is part of the document. Every port anchor on a card sits at a fraction of the card's measured height, so a card that grew with one reader's setting would be written into a board that somebody else opens at their own. The size of a board's text is therefore decided by zoom, which is the canvas's text size: zoom is how a board gets bigger, and it changes the view, not what is stored.

Outside the canvas the opposite holds. A label that runs out of room ellipsises or wraps and a dialog body scrolls, so a larger system text size changes how much fits and does not clip what is there. There is no in-app size control; the system's setting is the one that counts.

## Related

- [Settings, accessibility and updates controls](/reference/settings/) lists the rows and their choices.
- [How to change the app's language, contrast and colour vision](/how-to/change-app-language-contrast-and-colour/) applies the settings described here.
- [Boards, nodes and macros](/explanation/boards-nodes-and-macros/) explains the families and the canvas that the colour-vision palettes recolour.
