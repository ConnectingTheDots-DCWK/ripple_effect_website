---
title: How to add, switch off or change a project's languages
description: Switch translation languages on and off, change the language a story is written in, and find the translations that have fallen behind.
---

The language a story is written in is chosen when the project is made, as [How to create or import a project](/how-to/create-or-import-a-project/) describes. Everything after that is in Project settings, which you open from the bottom of the activity bar.

## Add a translation language

1. Open Project settings from the bottom of the activity bar. It is a set of pages down a rail: *General*, *Languages*, *Writing*, *Narration roots* and *Capabilities*.
2. Pick *Languages*.
3. Tick the language. Use *Find a language* to search the list.
4. Save.

An empty translation is put into every passage bundle. The app's own language is a separate setting, in the app's settings.

## Switch a translation language off

1. Open Project settings and pick *Languages*.
2. Untick the language.
3. Save. If anything is written in it, you are asked once what to do with the words.

Unticking deletes nothing. The files stay, the editor keeps showing them marked retired, and readers stop being offered that language.

To remove the words, answer **Delete them**. That deletes the language's file from every passage bundle, and the wording of any choice or Localized string card written in it on your boards, from disk; version control is the only way back. **Keep them** is the default button: clicking through the dialog or dismissing it deletes nothing.

## Change the language a story is written in

1. Open Project settings and pick *Languages*.
2. Change the *Written in* dropdown. A note under it says what the change will do.
3. Save.

Nothing is moved. Every passage gets an empty file for the new language, and everything you have written stays in the old language's file as a translation. Until you carry the words across by hand, your passages play empty and the Messages panel calls the project untranslated. There is no migration for this.

## Find translations that have fallen behind

1. Open a passage bundle. The locale chips along its top each stand for one language.
2. Look for a **dot** on a chip: that translation is older than its source. [Passages and translations](/explanation/passages-and-translations/) explains how that is told.
3. For the whole project, open the Messages panel (View menu, or the messages button at the bottom of the activity bar). It lists every translation that has fallen behind, for example "3 translations have fallen behind".

Editing a passage and its translation together does not leave the translation behind. The check cannot see the wording of a choice or of a Localized string card.

## Translate words that are not a passage

A sign, a status line or a label your story builds is not a passage, but it can still follow the reader's language.

1. Add a **Localized string** card from the **Language** group of the Create menu.
2. Double-click it. Write the words in each language, picking a language from the chips along the top. Spaces at either end are kept, so a piece such as `You have ` can be joined to a number.
3. Click **Done**. The card shows the words in the language the story is written in.
4. Wire its `completed` before whatever reads it, and its `text` into a passage's input, a variable, a Comparator or a script.

The card answers in the reader's language when the flow reaches it. Where nothing is written in that language, it answers in the language the story is written in, and the board warns you when that one is empty too ([`W.GE.19`](/reference/diagnostics/#wge19)). To answer in one language whatever the reader picked, choose it in the card's `locale` picker, or wire one into the port.

**Get locale**, in the same group, says which language the reader is reading in: its id, its language and region, its name, how its region measures and which money it uses. Branch on it to tell a reader in the United States something different from a reader in Italy.

A value is in the language it was read in. A reader who switches language mid-story gets the new language the next time the flow reaches the card.

## Related

- [Passages and translations](/explanation/passages-and-translations/)
- [Passages, choices, languages and reading time](/reference/passages/)
- [Project files and the .ripple folder](/reference/project-files/)
- [How to write a passage](/how-to/write-a-passage/)
