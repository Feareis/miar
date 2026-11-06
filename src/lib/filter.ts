// Text cleaning: normalisation, word-boundary matching, quote filtering.

/** Phrases that trigger a refusal and forbid any quote (compared against the normalised text). */
const BLOCKED_PHRASES = [
  // hacking
  'hack into', 'hacking into', 'hack my', 'hack his', 'hack her', 'hack the account', 'hack someone', 'steal the password', 'steal passwords', 'ransomware', 'ddos',
  // harassment
  'harass', 'harassing', 'harassment', 'stalk my ex', 'stalk someone', 'doxx', 'dox',
  // violence
  'kill someone', 'kill him', 'kill her', 'kill my', 'murder', 'stab', 'make a bomb', 'build a bomb', 'poison someone',
  // insults
  'asshole', 'bitch', 'bastard', 'cunt', 'motherfucker', 'whore', 'slut', 'retard', 'dickhead', 'fuck you',
];

const MAX_QUOTE_LENGTH = 90;
const MASK = '[contact details hidden]';
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
// 8 digits or more, optionally separated by spaces, dots or dashes: covers national and international formats.
const PHONE = /\+?\d(?:[\s.-]?\d){7,}/g;

/** Lowercase, no accents, apostrophes and spaces unified: the form the rules compare against. */
export function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[’ʼ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Regex that finds any of the phrases, on word boundaries only. */
export function wordPattern(expressions: readonly string[]): RegExp {
  const alternatives = expressions.map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'u');
}

const BLOCKED_PATTERN = wordPattern(BLOCKED_PHRASES);

export function containsBlockedPhrase(text: string): boolean {
  return BLOCKED_PATTERN.test(normalise(text));
}

/** A quote that is safe to display and share, or null if it must disappear. */
export function filterQuote(quote: string): string | null {
  const masked = quote
    .replace(/\p{Cc}/gu, ' ')
    .replace(EMAIL, MASK)
    .replace(PHONE, MASK)
    .replace(/\s+/g, ' ')
    .trim();
  if (!masked || containsBlockedPhrase(masked)) return null;
  if (masked.length <= MAX_QUOTE_LENGTH) return masked;
  return `${masked.slice(0, MAX_QUOTE_LENGTH - 1).trimEnd()}…`;
}
