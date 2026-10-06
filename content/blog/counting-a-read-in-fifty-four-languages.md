---
title: "Counting a read in fifty-four languages"
description: "A passage editor wants to say “3 min read”. Doing that with words divided by two hundred is wrong for about a quarter of the world, so we wrote the package that gets it right and put it on GitHub."
date: 2026-09-09
category: Engineering
seoTitle: "Reading time estimation for Japanese, Chinese, Thai and Korean"
---

[Ripple Effect's passage editor](/) is getting a word count, and beside it an
estimate of how long the passage takes to read. It is the smallest possible
feature. You write prose, the app tells you roughly how much prose you wrote.

The usual implementation is one line, and everybody has written it:

```dart
final minutes = text.split(' ').length / 200;
```

That line is fine for English. It is fine for most of the languages this app
has been used in so far. And it is catastrophically wrong for Japanese,
Chinese, Thai and Khmer, which is a large enough hole that fixing it turned
into a package of its own.

## Where the one-liner falls over

Japanese, Chinese, Thai and Khmer are written without spaces between words.
Splitting a paragraph of any of them on whitespace finds **one token**. So the
line above looks at eight hundred characters of Japanese, counts one word,
divides by two hundred, and reports a two-second read.

It does not fail loudly. It fails by returning a number, and the number is
wrong by a factor of about a hundred.

The fix is not a word-segmenter. Segmenting Japanese properly means a
dictionary, and a dictionary means megabytes and a platform. What is actually
needed is much smaller: **stop counting words in a language that does not have
spaces between them, and count characters instead**, at that language's
characters-per-minute rather than its words-per-minute.

So the text is walked one rune at a time and cut into runs by script. Spaced
runs are priced in words. Space-less runs are priced in characters. The two
durations are added, and a paragraph that is Japanese with an English product
name in the middle of it is priced as both, because it is both.

```dart
final estimate = estimateReadTime('彼は Tokyo Tower を見た。');

estimate.words;          // 2
estimate.characters;     // 5
estimate.isMixedScript;  // true
```

There is a consequence worth spelling out, because it is the good kind. The
language tag becomes a *hint* rather than the authority. Text in a language the
table has never heard of still gets counted by whatever script it is actually
written in, and a wrong tag costs you the speed rather than the method.

## The trap this gets most wrong

Korean.

Hangul looks like the East Asian scripts. It sits beside them in every font
menu and every encoding table you have ever seen. And Korean is **written with
spaces** — it spaces its eojeol — so filing it with Chinese and Japanese and
counting it by the character would roughly triple every Korean estimate.

Korean is counted by the word. It is the single mistake the package is most
careful about, and it is in there as a test rather than as a comment.

## Where the numbers come from, and how much to trust them

Fifty-four languages have an entry. **Seventeen of them are measured** — the
figures come from cross-linguistic reading studies, the IReST benchmark and the
Brysbaert meta-analysis among them. The other thirty-seven are *reasoned*:
extrapolated from a measured neighbour by descent or by morphological type,
and each entry names the language it was reasoned from and says why.

That distinction is carried in the API rather than in a footnote:

```dart
estimate.speed.evidence;   // SpeedEvidence.measured
```

which is what lets the app's tooltip tell you whether the number you are
looking at came from a study or from a family resemblance. An estimate that
cannot say how much to trust it is a worse estimate than one that can.

Two smaller rules come along for the ride, and both are about not counting
things that are not prose. Fenced code blocks and inline code come out before
anything is counted — a Python snippet in a passage is not read at reading
speed. And a link is worth the words you read rather than the length of its
URL, so the label survives and the target does not.

## What it will not do

Mixed *scripts* are handled without you asking. Mixed *languages in the same
script* — an English passage quoting a French sentence — are not, and cannot
be, without somebody saying where the French is:

```dart
estimateSpannedReadTime(
  text,
  [LanguageSpan(start: 42, end: 96, language: 'fr')],
  options: const ReadTimeOptions(language: 'en'),
);
```

The spans come from wherever you already have them: a detector, a `lang=`
attribute, an author who told you. **The package detects nothing**, and that is
a decision rather than a gap. Baking one detector in would have made that
detector normative, tied a text-measuring library to whatever platform the
detector runs on, and — the part that actually settled it — put an `await` in
front of a function that has no reason not to be synchronous.

The app builds on top of this. Ripple Effect can find the paragraphs written in
another language and price them at that language's speed, because it is a
project setting there and someone can turn it on. The library underneath stays
a pure function of text you have already labelled.

## Why it is a separate package

Because how fast a language is read is a fact about the language, not a fact
about our application.

`dart_read_time` is pure Dart. Not one path through its dependency graph
reaches `package:flutter` — not even `package:flutter/foundation.dart`, which
pulls `dart:ui` in behind your back through `assertions.dart`. So `@immutable`
comes from `package:meta`, there is no `Locale` and no `TextPainter` anywhere
in it, and the result runs in a browser, in a CLI, on a server and inside a
Flutter app alike.

It is [on GitHub](https://github.com/ConnectingTheDots-DCWK/dart_read_time),
MIT, at 0.1.0, and it is a submodule of the app rather than a folder in it —
the same arrangement as
[fl_nodes_v2](https://github.com/ConnectingTheDots-DCWK/fl_nodes_v2), the node
editor the canvas is built on, which has
[a post of its own](/blog/a-node-body-is-an-ordinary-widget).

Worth being exact about what that does and does not mean, because it is easy to
read one as the other: **the packages are open source, and Ripple Effect is
not.** The app is proprietary and its source is not published. The pieces
underneath it that are useful on their own get published on their own, take
issues, and take pull requests. Reading time was never going to be our
competitive advantage. It was going to be a bug in somebody else's Japanese.
