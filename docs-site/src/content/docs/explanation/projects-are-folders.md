---
title: A project is a folder
description: Why a Ripple Effect project is a view onto an ordinary folder of plain-text files, and what follows from that for saving, sharing and newer versions of the app.
---

A project is a folder you already have, or one the app makes for you. Either
way the app is a *view onto it*: the file tree is the directory as it is on
disk, and every file it shows is one you could open in another program. Most of
what is unusual about how the app behaves comes from taking that sentence
seriously.

## A view, not an owner

The alternative is the familiar one: a project is a database, or a package the
app creates and manages, and the files you care about are inside it. That is
easier for the application, because it can assume nobody else touches the
contents. It is harder for you. A story kept in an opaque container can only be
moved, backed up, searched or reviewed by the program that made it, and it
stops being yours to handle the day you want to use another tool.

Ripple Effect makes the other trade. You point the app at a directory and it
shows you what is there. It writes no scaffold into your story, imposes no layout and claims no
ownership. Move a project, rename it, delete it from your file manager: there is
nothing else to keep in step. A project that another program has moved or
deleted disappears from the home grid, and that is all. A folder that has been a
project arrives with its title, description, cover and language already filled
in, because those were in the folder all along, and nothing is written. For a
plain folder the app writes only `.ripple/project.json`, with the title
defaulted to the folder's name unless you give it another.

The cost is that the app cannot assume it is alone, which is why saving and
refusing a newer file work the way they do, below.

## Plain text, on purpose

Every file the app owns is plain text. Boards, components and soundscapes are
JSON, namespaced inside `.json` so ordinary tools still read them. A state
machine is a diagram in a format that is not ours at all. A passage in several
languages is a folder of ordinary Markdown files, and a script is a `.py` file
you can open in any editor. The kinds, and what each carries, are in
[Project files and the .ripple folder](/reference/project-files/).

Two reasons sit behind that choice. The first is that a format a script can
read is a format you are not locked into. Attribute types, for example, are
written under their wire names, and numbers and booleans are real JSON numbers
and booleans rather than strings, because something reading the file should not
have to know what the code happens to call them.

The second is version control. Prose lives in Markdown, scripts in `.py`, and
graphs are JSON with stable ids, so a diff shows what changed and a merge
conflict is something a person can read. The app's per-folder state is written
with sorted, relative paths so it stays quiet in `git diff` and travels
correctly into a clone. You do not have to bring your own history tool, because
version control is built into the app; [History, sharing and
conflicts](/explanation/history-and-sharing/) says how that sits on top of a
folder that other programs also see.

## What the app keeps, and why it is kept apart

The app does keep some things about a project: its title, the index of its
files, the layout of the window, the console variables it declares, paused
games, export profiles. All of it lives in one folder, `.ripple/`, beside your
files, and nothing is written into the story itself. The app's own bookkeeping
has a place of its own so that it never has to impose a convention on yours.

The same reasoning decides where a copied-in file goes. A picture or a sound
you pick from outside the project, from your Downloads for instance, is copied
into `.ripple/external/` rather than into a folder the app invents at the top of
your story. Reaching outside the project is a way of saying you do not intend to
file the thing, so it goes where the app's own things go. Copying in is a
switch; with it off the file is linked, and a link that leaves the project is
said where it is, under the field and in Messages every time the project is
opened.

Commit `.ripple/`; the reason is the registry.
A Jump stores its target's catalog id rather than its path, and the ids live in
the registry, so the registry is what keeps a Jump pointing at the right board
after a rename. The registry also indexes every file in the project, a picture,
a video, a PDF or a note as well as the files the app makes, as soon as it is in
the folder, so something you have just dropped in can be offered in a picker.
That does not make it ship: exports and compiled campaigns carry files by what
points at them. Nothing under a dotted folder is listed, nor a dotted file, nor
anything outside the project folder.

Two things in `.ripple/` are about *you* rather than about the story, and
those are the ones that should not travel. `workspace.json`, the layout and the
open documents, is per machine. Saved games are a fact about your reading rather
than about the story. The built-in version control leaves both out for you.

## Saving when you are not alone

Everything writes as you work, with a short debounce, and closing the window
flushes what is left. `Ctrl+S` is there for when you want to be sure. It holds
for every kind of document, so there is no "unsaved project" to lose, and the
bar over each editor says whether the file is written.

Autosave is only safe because the app expects to share the folder. A file that
another program changes underneath it is noticed rather than overwritten. That
is what makes it reasonable to have a passage open in a second editor, or to
pull from a co-author, without the app quietly putting its older copy back.

## A newer file is never half-read

The same caution applies when the file was written by a newer Ripple Effect than
the one you are running. Files carry a version, and an older copy of the app
that meets a newer one does not guess. It says it cannot read the file, tells
you to update, and writes nothing to it.

This holds for the files you could not get back: the index, the project's
settings, a component, a board and a saved game. Half-reading one and saving it
would overwrite your work with a lossy copy, so the app stops instead. A saved game the app cannot read is refused and
listed rather than overwritten, and a refusal stops that one file, not the ones
beside it. Things
that only cache something, such as a bundle's translation timestamps or the list
of recent projects, are different. They rebuild by looking at the folder again,
so they are never a reason to stop. The rule is that anything you cannot
regenerate is refused, and anything the app can regenerate is regenerated.

## Tips come in slices

The first time you open each kind of thing, the home screen, a board, a bundle,
a component, the campaign window, a short tip appears once, saying what the
words for it are. It is not a tour: there is no single path through the app,
since you may open a component before you ever open a board, so a tip belongs to
the thing in front of you rather than to a sequence. Any tip can be brought
back from the command palette, and *Help ▸ Troubleshooting ▸ Show every tip
again* re-arms all of them.

## Related

- [Project files and the .ripple folder](/reference/project-files/): every file kind, and what each file in `.ripple/` holds.
- [The workspace window, menus and palette](/reference/workspace-window/): the window laid out around the folder.
- [How to create or import a project](/how-to/create-or-import-a-project/): making a project or opening a folder you already have.
- [How to keep a history and back up a project](/how-to/keep-a-history-and-back-up/): putting the folder under version control.
