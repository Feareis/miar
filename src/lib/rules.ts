// Analysis of an (English) request: grievances, score /20, verdict, quote.
// The lists are lowercase without accents: they are compared against the normalised text.
import { containsBlockedPhrase, filterQuote, wordPattern, normalise } from './filter';

const ATTACHMENTS = ['this text', 'this file', 'attached', 'the attachment', 'attachment', 'this document', 'this link', 'below', 'this image', 'this article', 'this pdf', 'the following text'];
const GIANTS = ['facebook', 'uber', 'amazon', 'netflix', 'airbnb', 'tiktok', 'instagram', 'google', 'youtube', 'twitter', 'whatsapp', 'spotify', 'linkedin', 'chatgpt', 'airtable', 'notion'];
const IMITATIONS = ['but better', 'like', 'clone', 'copy of', 'competitor to', 'rival to', 'the next'];
const PROJECTS = ['app', 'application', 'website', 'site', 'software', 'platform', 'video game', 'social network', 'saas'];
const UNREALISTIC_DEADLINES = ['tomorrow', 'tonight', 'in 1 hour', 'in 1h', 'in an hour', 'this afternoon', 'in 5 minutes', 'by end of day'];
const CONTEXTS = ['i am', "i'm", 'my company', 'our company', 'for my', 'as part of', 'context', 'i work', 'we are', "we're", 'my team', 'my job'];
const CONTRADICTIONS: readonly [readonly string[], readonly string[]][] = [
  [['short', 'brief', 'concise', 'quick read'], ['detailed', 'detail', 'comprehensive', 'exhaustive', 'everything', 'in depth', 'in-depth', 'thorough']],
  [['simple'], ['advanced', 'exhaustive', 'complex']],
  [['free'], ['premium']],
  [['fast', 'quickly', 'tomorrow', 'urgent', 'asap', 'right now'], ['perfect', 'perfectly', 'flawless']],
];
const VAGUE_WORDS = ['that pops', 'make it pop', 'pops', 'pop', 'the vibe', 'vibe', 'cool', 'nice', 'something', 'stuff', 'awesome', 'amazing', 'modern', 'sleek', 'catchy', 'fancy', 'pro', 'effective', 'good', 'top-notch'];
const MANIPULATIONS = ['ignore your', 'ignore all', 'ignore previous', 'ignore the instructions', 'ignore the rules', 'forget your instructions', 'forget everything', 'you are now', 'system prompt', 'jailbreak', 'developer mode', 'dan mode'];
const FORMAT_UNITS = 'words?|lines?|pages?|slides?|minutes?|sentences?|paragraphs?|characters?|chars|bullets?|points?|questions?|tweets?|items?';
const FORMATS = ['list', 'lists', 'table', 'tables', 'paragraph', 'paragraphs', 'email', 'e-mail', 'emails', 'outline', 'bullet points', 'bullets', 'json', 'markdown', 'haiku', 'sonnet', 'essay', 'tweet', 'thread', 'slide deck', 'csv'];
const AUDIENCES = ['aimed at', 'intended for', 'meant for', 'targeted at', 'audience', 'reader', 'readers', 'customer', 'customers', 'client', 'clients', 'beginner', 'beginners', 'kids', 'children', 'my boss', 'my manager', 'recruiter', 'recruiters', 'parents', 'students', 'users', 'colleagues', 'coworkers', 'investors'];
// "in the style of" marks an example; it contains no vague word ("style" is not one).
const EXAMPLES = ['example', 'examples', 'for instance', 'e.g.', 'in the style of', 'like this one', 'such as', 'sample'];
const CONSTRAINTS = ['tone', 'formal', 'informal', 'casual', 'funny', 'humorous', 'serious', 'max', 'maximum', 'minimum', 'no more than', 'at most', 'deadline', 'budget', 'avoid', 'without', 'limit', "don't use", 'do not use'];

// "200 words", "100-word", "5 slides"…
const FORMAT_EXPRESSION = new RegExp(`\\d+[\\s-]*(?:${FORMAT_UNITS})(?![\\p{L}\\p{N}])`, 'u');
export const QUOTED_PASSAGE = /"[^"]+"|“[^”]+”/;
const VAGUE_PATTERN = new RegExp(wordPattern(VAGUE_WORDS).source, 'gu');
const ATTACHMENT_PATTERN = wordPattern(ATTACHMENTS);
const GIANT_PATTERN = wordPattern(GIANTS);
const IMITATION_PATTERN = wordPattern(IMITATIONS);
const PROJECT_PATTERN = wordPattern(PROJECTS);
const DEADLINE_PATTERN = wordPattern(UNREALISTIC_DEADLINES);
const CONTEXT_PATTERN = wordPattern(CONTEXTS);
const CONTRADICTION_PATTERNS = CONTRADICTIONS.map(([a, b]) => [wordPattern(a), wordPattern(b)] as const);
const MANIPULATION_PATTERN = wordPattern(MANIPULATIONS);
const FORMAT_PATTERN = wordPattern(FORMATS);
const AUDIENCE_PATTERN = wordPattern(AUDIENCES);
const EXAMPLE_PATTERN = wordPattern(EXAMPLES);
const CONSTRAINT_PATTERN = wordPattern(CONSTRAINTS);

interface PreparedRequest {
  /** lowercase, no accents */
  text: string;
  words: number;
}

export type GrievanceCode =
  | 'MISSING_ATTACHMENT' | 'OVERSIZED_SCOPE' | 'NO_CONTEXT' | 'CONTRADICTION' | 'VAGUE_OBJECTIVE'
  | 'MANIPULATION_ATTEMPT' | 'NO_FORMAT' | 'UNKNOWN_AUDIENCE' | 'NO_EXAMPLE' | 'NO_CONSTRAINTS';

export type Verdict = 'resignation' | 'congratulations' | 'refusal';

interface Rule {
  code: GrievanceCode;
  points: number;
  matches: (d: PreparedRequest) => boolean;
}

/** Array order = tie-break order at equal weight. */
const RULES: readonly Rule[] = [
  { code: 'MISSING_ATTACHMENT', points: -6, matches: (d) => d.words < 30 && ATTACHMENT_PATTERN.test(d.text) },
  {
    code: 'OVERSIZED_SCOPE', points: -6, matches: (d) =>
      (GIANT_PATTERN.test(d.text) && IMITATION_PATTERN.test(d.text)) ||
      (PROJECT_PATTERN.test(d.text) && DEADLINE_PATTERN.test(d.text)),
  },
  { code: 'NO_CONTEXT', points: -5, matches: (d) => d.words < 12 && !CONTEXT_PATTERN.test(d.text) },
  { code: 'CONTRADICTION', points: -5, matches: (d) => CONTRADICTION_PATTERNS.some(([a, b]) => a.test(d.text) && b.test(d.text)) },
  { code: 'VAGUE_OBJECTIVE', points: -4, matches: (d) => vagueWord(d) !== null },
  { code: 'MANIPULATION_ATTEMPT', points: -4, matches: (d) => MANIPULATION_PATTERN.test(d.text) },
  { code: 'NO_FORMAT', points: -3, matches: (d) => !FORMAT_EXPRESSION.test(d.text) && !FORMAT_PATTERN.test(d.text) },
  { code: 'UNKNOWN_AUDIENCE', points: -3, matches: (d) => !AUDIENCE_PATTERN.test(d.text) },
  { code: 'NO_EXAMPLE', points: -2, matches: (d) => !EXAMPLE_PATTERN.test(d.text) && !QUOTED_PASSAGE.test(d.text) },
  { code: 'NO_CONSTRAINTS', points: -2, matches: (d) => !CONSTRAINT_PATTERN.test(d.text) },
];

const MAX_GRIEVANCES = 5;
const CONGRATULATIONS_THRESHOLD = 17;
/** A grievance of this weight (or heavier) rules out congratulations. */
const HEAVY_GRIEVANCE_POINTS = -4;
const QUOTE_WORDS = 12;

export interface Analysis {
  grievances: GrievanceCode[];
  score: number;
  verdict: Verdict;
  quote: string | null;
}

/** The vague word that appears first in the request (normalised form). */
function vagueWord(d: PreparedRequest): string | null {
  VAGUE_PATTERN.lastIndex = 0;
  return VAGUE_PATTERN.exec(d.text)?.[0] ?? null;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function pickQuote(request: string, d: PreparedRequest): string | null {
  const vague = vagueWord(d);
  if (vague) return filterQuote(vague);
  const words = request.trim().split(/\s+/);
  const start = words.slice(0, QUOTE_WORDS).join(' ');
  return filterQuote(words.length > QUOTE_WORDS ? `${start}…` : start);
}

function computeScore(rules: readonly Rule[], request: string, words: number): number {
  const bonus = (words > 60 ? 1 : 0) + (/\n/.test(request.trim()) ? 1 : 0);
  const score = 20 + bonus + rules.reduce((sum, r) => sum + r.points, 0);
  return Math.min(20, Math.max(0, score));
}

function prepare(request: string): PreparedRequest {
  return { text: normalise(request), words: countWords(request) };
}

/** Triggered rules, heaviest first (stable sort: at equal weight, the order of RULES is kept). */
function triggeredRules(d: PreparedRequest): Rule[] {
  return RULES.filter((r) => r.matches(d)).sort((a, b) => a.points - b.points);
}

/** Every grievance, without the letter's limit: the reconciliation must flag every gap. */
export function detectGrievances(request: string): GrievanceCode[] {
  return triggeredRules(prepare(request)).map((r) => r.code);
}

export function analyse(request: string): Analysis {
  const d = prepare(request);
  const triggered = triggeredRules(d);
  const score = computeScore(triggered, request, d.words);
  const grievances = triggered.slice(0, MAX_GRIEVANCES).map((r) => r.code);

  if (containsBlockedPhrase(request)) return { grievances, score, verdict: 'refusal', quote: null };
  const noHeavyGrievance = triggered.every((r) => r.points > HEAVY_GRIEVANCE_POINTS);
  const verdict = score >= CONGRATULATIONS_THRESHOLD && noHeavyGrievance ? 'congratulations' : 'resignation';
  return { grievances, score, verdict, quote: pickQuote(request, d) };
}
