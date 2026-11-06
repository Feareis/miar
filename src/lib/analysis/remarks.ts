// Reading the way the request is written: politeness, shouting, urgency, emoji, language… None of it changes
// the score: these are the remarks an attentive reader would make, used for the postscript.
import { wordPattern, normalise } from '../filter';

export type RemarkCode =
  | 'LANGUAGE' | 'SHOUTING' | 'RUDENESS' | 'FLATTERY' | 'EMOJI' | 'EXCLAMATIONS' | 'SMS' | 'STRETCHING'
  | 'URGENCY' | 'QUESTIONS' | 'NO_PUNCTUATION' | 'RAMBLING' | 'POLITENESS' | 'CURT';

/** n: a number to quote (exclamation marks, words…) or the index of the detected language. */
export interface Remark {
  code: RemarkCode;
  n: number;
}

/** Priority order: the first remark found becomes the postscript. */
export const REMARK_CODES: readonly RemarkCode[] = [
  'LANGUAGE', 'SHOUTING', 'RUDENESS', 'FLATTERY', 'EMOJI', 'EXCLAMATIONS', 'SMS', 'STRETCHING',
  'URGENCY', 'QUESTIONS', 'NO_PUNCTUATION', 'RAMBLING', 'POLITENESS', 'CURT',
];

export const FOREIGN_LANGUAGES = ['French', 'Spanish', 'German', 'Italian'] as const;
const FUNCTION_WORDS: readonly (readonly string[])[] = [
  ['le', 'la', 'les', 'une', 'des', 'pour', 'avec', 'je', 'moi', 'fais', 'mon', 'ma', 'mes', 'est', 'et', 'qui', 'que', 'sur', 'dans', 'pas', 'tu', 'vous', 'svp', 'stp', 'bonjour', 'merci', 'du', 'au', 'ecris', 'cree'],
  ['el', 'los', 'las', 'una', 'para', 'por', 'con', 'yo', 'mi', 'es', 'que', 'hazme', 'haz', 'hola', 'gracias', 'favor', 'del', 'escribe', 'crea', 'sobre'],
  ['ich', 'und', 'der', 'die', 'das', 'ein', 'eine', 'mir', 'bitte', 'mit', 'fur', 'ist', 'nicht', 'hallo', 'danke', 'schreib', 'schreibe', 'mach', 'mein', 'meine', 'uber'],
  ['il', 'lo', 'gli', 'una', 'per', 'con', 'io', 'mi', 'che', 'scrivi', 'fammi', 'ciao', 'grazie', 'favore', 'della', 'sul', 'non', 'sono'],
];
/** Minimum share of foreign function words to conclude it is another language. */
const LANGUAGE_THRESHOLD = 0.25;

const RUDENESS = wordPattern(['useless', 'stupid', 'dumb', 'idiot', 'worthless', 'or else', 'do your job', 'you suck', 'lazy', 'incompetent', 'pathetic', 'shut up']);
const FLATTERY = wordPattern(["you're the best", 'you are the best', 'genius', 'smartest', 'brilliant', 'you can do anything', 'best ai', 'my favorite', 'my favourite', 'love you', 'you are amazing', "you're amazing"]);
const URGENCY = wordPattern(['asap', 'urgent', 'urgently', 'right now', 'immediately', 'quickly', 'hurry', 'emergency', 'right away']);
const SMS = wordPattern(['pls', 'plz', 'u', 'ur', 'thx', 'idk', 'lol', 'rn', 'tbh', 'btw', 'gonna', 'wanna', 'cuz', 'bc', 'ty', 'omg']);
const POLITENESS = wordPattern(['please', 'thank you', 'thanks', 'kindly', 'would you', 'could you', 'if you could', "if you don't mind", 'hello', 'hi', 'good morning', 'good afternoon', 'dear', 'cheers']);
const IMPERATIVES = new Set(['make', 'write', 'do', 'give', 'build', 'create', 'generate', 'fix', 'find', 'tell', 'draw', 'code', 'send', 'summarize', 'summarise', 'translate', 'explain', 'list', 'design', 'get']);
const EMOJI = /\p{Extended_Pictographic}/gu;

const MAX_CURT_WORDS = 25;
const RAMBLING_WORDS = 250;
const UNPUNCTUATED_WORDS = 30;

function foreignLanguage(text: string): number | null {
  const words = text.split(/[^\p{L}']+/u).filter(Boolean);
  if (words.length < 2) return null;
  let best: { index: number; ratio: number } | null = null;
  for (const [index, markers] of FUNCTION_WORDS.entries()) {
    const wordSet = new Set(markers);
    const hits = words.filter((m) => wordSet.has(m)).length;
    const ratio = hits / words.length;
    if (hits >= 2 && ratio >= LANGUAGE_THRESHOLD && (!best || ratio > best.ratio)) best = { index, ratio };
  }
  return best?.index ?? null;
}

function isShouting(request: string): boolean {
  const letters = request.match(/\p{L}/gu) ?? [];
  const capitals = request.match(/\p{Lu}/gu) ?? [];
  return letters.length >= 10 && capitals.length / letters.length >= 0.6;
}

/** Every remark, in the priority order of REMARK_CODES. */
export function findRemarks(request: string, words: number): Remark[] {
  const text = normalise(request);
  const polite = POLITENESS.test(text);
  const firstWord = text.split(/[^\p{L}]+/u).find(Boolean) ?? '';
  const count = (re: RegExp) => request.match(re)?.length ?? 0;
  const language = foreignLanguage(text);

  const found: Partial<Record<RemarkCode, number>> = {};
  if (language !== null) found.LANGUAGE = language;
  if (isShouting(request)) found.SHOUTING = 0;
  if (RUDENESS.test(text)) found.RUDENESS = 0;
  if (FLATTERY.test(text)) found.FLATTERY = 0;
  if (count(EMOJI) > 0) found.EMOJI = count(EMOJI);
  if (count(/!/g) >= 3) found.EXCLAMATIONS = count(/!/g);
  if (SMS.test(text)) found.SMS = 0;
  if (/(\p{L})\1\1/u.test(text)) found.STRETCHING = 0;
  if (URGENCY.test(text)) found.URGENCY = 0;
  if (count(/\?/g) >= 3) found.QUESTIONS = count(/\?/g);
  if (words >= UNPUNCTUATED_WORDS && !/[.,;:!?]/.test(request)) found.NO_PUNCTUATION = 0;
  if (words > RAMBLING_WORDS) found.RAMBLING = words;
  if (polite) found.POLITENESS = 0;
  if (!polite && words <= MAX_CURT_WORDS && IMPERATIVES.has(firstWord)) found.CURT = 0;

  return REMARK_CODES.filter((code) => code in found).map((code) => ({ code, n: found[code]! }));
}
