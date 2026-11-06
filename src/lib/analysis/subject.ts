// Extracts the subject of the request: "a website for my bakery" → "for my bakery".
// Works on the original text to keep the casing; the result is filtered like a quote.
import { filterQuote } from '../filter';

const WORDS_AFTER_PREPOSITION = 4;
const MAX_LENGTH = 40;

/** Words that end the subject's noun phrase. */
const SUBJECT_BREAKS = new Set([
  'that', 'which', 'who', 'with', 'and', 'but', 'or', 'by', 'so', 'to', 'in', 'it', 'you', 'please', 'because',
  'like', 'tomorrow', 'tonight', 'asap', 'today', 'now', 'using', 'without', 'where', 'when', 'if', 'than', 'then',
  'is', 'are', 'was', 'will', 'should', 'must', 'can', 'could', 'would', 'thanks', 'thank', 'make', 'write', 'do',
  'for', 'about', 'at', 'from', 'into', 'on', 'regarding',
]);
/** Phrase heads that do not name a subject: "for me", "for example"… */
const EMPTY_HEADS = new Set([
  'me', 'you', 'us', 'him', 'her', 'them', 'it', 'this', 'that', 'free', 'example', 'instance', 'now', 'later',
  'tomorrow', 'today', 'tonight', 'vibe', 'fun', 'real', 'sure', 'once', 'ever', 'good', 'nothing', 'everything',
]);
/** Grammatical words removed from the end of a subject: "for the parents of my" → "for the parents". */
const WEAK_ENDINGS = new Set(['my', 'our', 'a', 'an', 'the', 'his', 'her', 'their', 'of', 'your', 'some', 'very']);

// "about" first (the actual subject), then "for" (the recipient or the purpose).
const PREPOSITIONS = ['about', 'on the topic of', 'regarding', 'for'] as const;

/** The phrase after the preposition, cut at the first linking word or punctuation mark. */
function groupAfter(rest: string): string[] {
  const group: string[] = [];
  for (const raw of rest.split(' ').slice(0, WORDS_AFTER_PREPOSITION + 2)) {
    const word = raw.replace(/^[“"'(]+/u, '');
    const clean = word.replace(/[.,;:!?)”"]+$/u, '');
    if (!clean || SUBJECT_BREAKS.has(clean.toLowerCase())) break;
    group.push(clean);
    if (clean !== word || group.length === WORDS_AFTER_PREPOSITION) break;
  }
  while (group.length > 0 && WEAK_ENDINGS.has(group[group.length - 1].toLowerCase())) group.pop();
  return group;
}

/** The first usable phrase after any occurrence of the preposition ("for free for my bakery" → "for my bakery"). */
function subjectAfter(text: string, preposition: string): string | null {
  for (const match of text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${preposition} `, 'giu'))) {
    const group = groupAfter(text.slice(match.index + match[0].length));
    const head = group.filter((m) => !WEAK_ENDINGS.has(m.toLowerCase())).join(' ').toLowerCase();
    const subject = `${preposition} ${group.join(' ')}`;
    if (head && !EMPTY_HEADS.has(head) && subject.length <= MAX_LENGTH) return subject;
  }
  return null;
}

/** "for my bakery", "about climate change"… or null if nothing is usable. */
export function extractSubject(request: string): string | null {
  const text = request.replace(/\s+/g, ' ').trim();
  for (const preposition of PREPOSITIONS) {
    const subject = subjectAfter(text, preposition);
    if (subject) return filterQuote(subject);
  }
  return null;
}
