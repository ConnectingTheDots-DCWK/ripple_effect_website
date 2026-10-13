// The City of Elsenmar, played in a page: what the editor's play window does,
// written against the two published packages and nothing else. One campaign,
// at the root of the domain; the bundle is the folder `public/` serves under
// /the-city-of-elsenmar/, exactly as the editor's Export → Campaign wrote it.
import {
  Campaign,
  type Effect,
  HostError,
  type Passage,
  Player,
  type Prompt,
  resolveLink,
  SoundscapeDriver,
} from '@ripplefx/player';
import { WebAudioSpeaker } from '@ripplefx/soundscape';
import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import './style.css';

const BUNDLE = '/the-city-of-elsenmar/';

// The page's own words, in the languages the story is written in. The story's
// words are the author's and come from the bundle; these follow whichever
// language the reader picked for it.
const words = {
  en: {
    loading: 'Loading the engine…',
    wouldNotOpen: 'This campaign would not open.',
    intro:
      'A short tabletop adventure written in Ripple Effect, played here by its engine, compiled to WebAssembly and running in this page: pictures, music, dice and two languages, as the author exported them.',
    privacy: 'This page sets no cookies and stores nothing on your device.',
    engine: (version: string) => `Ripple Effect engine ${version}`,
    begin: 'Begin',
    beginHint: 'Sound starts when you begin. Keys 1–9 pick a choice.',
    cont: 'Continue',
    untranslated: (locale: string) => `This passage has no ${locale} text yet.`,
    theEnd: 'The End',
    ranOut: 'The story ran out of road.',
    stopped: 'The story stopped.',
    playAgain: 'Play again',
    getEditor: 'Write your own — get the editor',
    mute: 'Mute',
    unmute: 'Unmute',
    restart: 'Restart',
    language: 'Language',
    credit: 'Written in Ripple Effect and played by its engine, in this page.',
  },
  it: {
    loading: 'Caricamento del motore…',
    wouldNotOpen: 'Questa campagna non si è aperta.',
    intro:
      "Una breve avventura da tavolo scritta con Ripple Effect, giocata qui dal suo motore, compilato in WebAssembly ed eseguito in questa pagina: immagini, musica, dadi e due lingue, così come l'autore li ha esportati.",
    privacy: 'Questa pagina non usa cookie e non salva nulla sul tuo dispositivo.',
    engine: (version: string) => `Motore di Ripple Effect ${version}`,
    begin: 'Inizia',
    beginHint: 'Il suono parte quando inizi. I tasti 1–9 scelgono un’opzione.',
    cont: 'Continua',
    untranslated: (locale: string) => `Questo passaggio non ha ancora un testo in ${locale}.`,
    theEnd: 'Fine',
    ranOut: 'La storia è finita senza un finale.',
    stopped: 'La storia si è interrotta.',
    playAgain: 'Gioca ancora',
    getEditor: 'Scrivi la tua — scarica l’editor',
    mute: 'Disattiva audio',
    unmute: 'Riattiva audio',
    restart: 'Ricomincia',
    language: 'Lingua',
    credit: 'Scritta con Ripple Effect e giocata dal suo motore, in questa pagina.',
  },
} as const;
type Words = (typeof words)[keyof typeof words];

const stage = document.querySelector<HTMLElement>('#stage')!;
const languages = document.querySelector<HTMLSelectElement>('#locale')!;
const mute = document.querySelector<HTMLButtonElement>('#mute')!;
const restart = document.querySelector<HTMLButtonElement>('#restart')!;
const credit = document.querySelector<HTMLElement>('#credit')!;
const editorLink = document.querySelector<HTMLAnchorElement>('#get-editor')!;

let campaign: Campaign | undefined;
let player: Player | undefined;
let audio: SoundscapeDriver | undefined;
let muted = false;
const speaker = new WebAudioSpeaker();

function say(): Words {
  return languages.value.toLowerCase().startsWith('it') ? words.it : words.en;
}

// The passage being drawn, for the image hook below to resolve against.
let drawing: Passage | undefined;
const markdown = new Marked({
  walkTokens(token) {
    // A picture keeps the author's own link in the prose; the passage says
    // which file of the bundle that is.
    if (token.type === 'image' && drawing) token.href = resolveLink(drawing, token.href);
  },
});

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text: string, onclick: () => void, className?: string): HTMLButtonElement {
  const node = element('button', text, className);
  node.type = 'button';
  node.onclick = onclick;
  return node;
}

/** A new slide: the old one goes, the reader is taken to the top of it. */
function slide(...children: Node[]): void {
  stage.replaceChildren(...children);
  window.scrollTo({ top: 0 });
}

function prose(passage: Passage): HTMLElement {
  drawing = passage;
  const html =
    campaign?.manifest.textFormat === 'html'
      ? passage.text
      : (markdown.parse(passage.text, { async: false }) as string);
  drawing = undefined;
  const body = element('div', undefined, 'prose');
  // Whatever the author wrote is sanitised before it is a page: a bundle
  // exported as HTML hands over HTML.
  body.innerHTML = DOMPurify.sanitize(html);
  for (const image of body.querySelectorAll('img')) image.decoding = 'async';
  return body;
}

function choose(index?: number): void {
  try {
    player?.choose(index);
  } catch (error) {
    // A choice drawn as spent is disabled, so a press only reaches here
    // through a key; it is refused and nothing moves.
    if (!(error instanceof HostError && error.failure.kind === 'choice-spent')) throw error;
  }
}

function showPassage(passage: Passage): void {
  const children: Node[] = [];
  if (passage.untranslated) children.push(element('p', say().untranslated(passage.untranslated), 'note'));
  children.push(prose(passage));
  const choices = element('div', undefined, 'choices');
  passage.choices.forEach((choice, index) => {
    const option = button('', () => choose(index));
    if (index < 9) option.append(element('kbd', String(index + 1)));
    option.append(element('span', choice.text || say().cont));
    option.disabled = !choice.available;
    choices.append(option);
  });
  if (!passage.choices.length) choices.append(button(say().cont, () => choose()));
  children.push(choices);
  slide(...children);
}

function showPrompt(prompt: Prompt): void {
  const form = element('form');
  for (const field of prompt.fields) {
    const label = element('label', field.name);
    const input = element('input');
    input.name = field.name;
    if (field.type === 'bool') input.type = 'checkbox';
    else if (field.type === 'int' || field.type === 'float') input.type = 'number';
    if (field.default !== null && typeof field.default !== 'object') {
      if (field.type === 'bool') input.checked = field.default === true;
      else input.value = String(field.default);
    }
    label.append(input);
    form.append(label);
  }
  const submit = element('button', say().cont, 'primary');
  form.append(submit);
  form.onsubmit = (event) => {
    event.preventDefault();
    const values: Record<string, string | boolean | number | bigint> = {};
    for (const field of prompt.fields) {
      const input = form.elements.namedItem(field.name) as HTMLInputElement;
      values[field.name] =
        field.type === 'bool'
          ? input.checked
          : field.type === 'int'
            ? BigInt(Math.trunc(Number(input.value || 0)))
            : field.type === 'float'
              ? Number(input.value || 0)
              : input.value;
    }
    player?.answer(values);
  };
  slide(element('h2', prompt.title), form);
}

function showHold(ms: number): void {
  const bar = element('div', undefined, 'hold');
  const fill = element('div');
  bar.append(fill);
  stage.append(bar);
  fill.animate([{ width: '0%' }, { width: '100%' }], { duration: ms, fill: 'forwards' });
}

function showEnding(title: string, detail?: string, isError = false): void {
  const children: Node[] = [element('h1', title)];
  if (detail) children.push(element('p', detail, isError ? 'error' : 'note'));
  const actions = element('div', undefined, 'actions');
  actions.append(button(say().playAgain, () => player?.restart(), 'primary'));
  const link = element('a', say().getEditor);
  link.href = 'https://ripplefx.app/download';
  actions.append(link);
  children.push(actions);
  slide(...children);
}

function onEffect(effect: Effect): void {
  switch (effect.kind) {
    case 'show':
      showPassage(effect.passage);
      break;
    case 'ask':
      showPrompt(effect.prompt);
      break;
    case 'hold':
      showHold(effect.ms);
      break;
    case 'ended':
      showEnding(effect.ranOut ? say().ranOut : (effect.title ?? say().theEnd));
      break;
    case 'failed':
      showEnding(say().stopped, effect.message, true);
      break;
    default:
      // The sound is the driver's, handed over by the Player; jumps, changes
      // and callbacks are a host's to use and this one has no use for them.
      break;
  }
}

/** The page's own words, after the language changes. */
function relabel(): void {
  const t = say();
  document.documentElement.lang = languages.value;
  languages.setAttribute('aria-label', t.language);
  mute.textContent = muted ? t.unmute : t.mute;
  restart.textContent = t.restart;
  credit.textContent = t.credit;
  editorLink.textContent = t.getEditor;
}

function showStart(): void {
  if (!campaign) return;
  const t = say();
  const children: Node[] = [];
  const cover = campaign.coverUrl;
  if (cover) {
    const image = element('img', undefined, 'cover');
    image.src = cover.href;
    image.alt = '';
    children.push(image);
  }
  children.push(element('h1', campaign.manifest.project.title), element('p', t.intro));
  const actions = element('div', undefined, 'actions');
  // The gesture every browser asks for before a page makes a sound.
  const begin = button(t.begin, () => void speaker.unlock().then(start), 'primary');
  actions.append(begin, element('span', t.beginHint, 'note'));
  children.push(actions);
  children.push(element('p', `${t.engine(campaign.engineVersion)} · ${t.privacy}`, 'note'));
  slide(...children);
  begin.focus({ preventScroll: true });
}

function start(): void {
  if (!campaign) return;
  player?.dispose();
  audio?.dispose();
  audio = new SoundscapeDriver(campaign, speaker, { muted });
  player = new Player(campaign.session({ seed: BigInt(Date.now()), locale: languages.value }), {
    onEffect,
    audio,
    onError: (error) => onEffect({ kind: 'failed', message: (error as Error).message }),
  });
  mute.hidden = false;
  restart.hidden = false;
  // For a developer's console, and the demo's own end-to-end check.
  if (import.meta.env.DEV) Object.assign(window, { ripple: { campaign, player, audio, speaker } });
  player.start();
}

/** The story's language the reader's browser asks for, or the author's own. */
function preferredLocale(locales: readonly string[], fallback: string): string {
  for (const wanted of navigator.languages) {
    const exact = locales.find((locale) => locale.toLowerCase() === wanted.toLowerCase());
    if (exact) return exact;
    const language = wanted.split('-')[0]!.toLowerCase();
    const near = locales.find((locale) => locale.split('-')[0]!.toLowerCase() === language);
    if (near) return near;
  }
  return fallback;
}

mute.onclick = () => {
  muted = !muted;
  mute.setAttribute('aria-pressed', String(muted));
  audio?.setMuted(muted);
  relabel();
};
restart.onclick = () => player?.restart();
languages.onchange = () => {
  relabel();
  if (player) player.setLocale(languages.value);
  else showStart();
};

// A hidden tab is not listening: the sound holds where it is.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio?.pause();
  else audio?.resume();
});

document.addEventListener('keydown', (event) => {
  const turn = player?.turn;
  if (turn?.kind !== 'show' || event.target instanceof HTMLInputElement) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && index >= 0 && index < Math.min(9, turn.passage.choices.length)) {
    choose(index);
  }
});

try {
  campaign = await Campaign.load(BUNDLE);
} catch (error) {
  slide(element('h1', say().wouldNotOpen), element('p', (error as Error).message, 'error'));
  throw error;
}
const project = campaign.manifest.project;
const names = new Intl.DisplayNames(project.locales, { type: 'language' });
languages.replaceChildren(
  ...project.locales.map((locale) => {
    const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? names.of(locale);
    return new Option(name ?? locale, locale);
  }),
);
languages.value = preferredLocale(project.locales, project.defaultLocale);
languages.hidden = project.locales.length < 2;
relabel();
showStart();
