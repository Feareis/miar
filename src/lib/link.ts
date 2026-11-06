// Share link: the letter travels in the #l=… fragment (never sent to the server).
// The fragment is untrusted input: anyone can craft one by hand,
// so everything is validated again and the quote filtered again.
import { FOREIGN_LANGUAGES, type Remark, type RemarkCode } from './analysis/remarks';
import { task, type TaskCode } from './analysis/tasks';
import { filterQuote } from './filter';
import type { LetterData } from './generator';
import type { GrievanceCode } from './rules';

/** v2 adds tasks, missing details, subject and postscript; v1 links already shared still open. */
const VERSION = 2;
const READABLE_VERSIONS: readonly unknown[] = [1, 2];
const MAX_TASKS = 2;
const MAX_SUBJECT_LENGTH = 40;
const MAX_REMARK_NUMBER = 100000;
const PREFIX = '#l=';
/** A genuine letter fits in ~250 characters: beyond this, we do not even decode. */
const MAX_FRAGMENT_LENGTH = 2000;
const MAX_GRIEVANCES = 5;
const MAX_SEED = 0xffffffff;

// The values below are the wire format of links already posted online: they must never change,
// even though they predate the English code names.
const SHORT_CODES: Readonly<Record<GrievanceCode, string>> = {
  MISSING_ATTACHMENT: 'PM',
  OVERSIZED_SCOPE: 'PD',
  NO_CONTEXT: 'CA',
  CONTRADICTION: 'CO',
  VAGUE_OBJECTIVE: 'OF',
  MANIPULATION_ATTEMPT: 'TM',
  NO_FORMAT: 'FN',
  UNKNOWN_AUDIENCE: 'PI',
  NO_EXAMPLE: 'AE',
  NO_CONSTRAINTS: 'CX',
};
const WIRE_TASKS: Readonly<Record<TaskCode, string>> = {
  SUMMARY: 'RESUME', TRANSLATION: 'TRADUCTION', JOB_APPLICATION: 'CANDIDATURE', CODE: 'CODE', VISUAL: 'VISUEL',
  PRESENTATION: 'PRESENTATION', EMAIL: 'EMAIL', ARTICLE: 'ARTICLE', POST: 'POST', CREATIVE: 'CREATIF', WEBSITE: 'SITE',
  APP: 'APPLI', PLAN: 'PLAN', EXPLANATION: 'EXPLICATION', NAMING: 'NOM',
};
const WIRE_REMARKS: Readonly<Record<RemarkCode, string>> = {
  LANGUAGE: 'LANGUE', SHOUTING: 'CRIS', RUDENESS: 'RUDESSE', FLATTERY: 'FLATTERIE', EMOJI: 'EMOJI', EXCLAMATIONS: 'EXCLAMATIONS',
  SMS: 'SMS', STRETCHING: 'ETIREMENT', URGENCY: 'URGENCE', QUESTIONS: 'QUESTIONS', NO_PUNCTUATION: 'SANS_PONCTUATION',
  RAMBLING: 'FLEUVE', POLITENESS: 'POLITESSE', CURT: 'SEC',
};

function fromWire<K extends string>(table: Readonly<Record<K, string>>): ReadonlyMap<string, K> {
  return new Map(Object.entries(table).map(([code, wire]) => [wire as string, code as K]));
}
const GRIEVANCES_FROM_WIRE = fromWire(SHORT_CODES);
const TASKS_FROM_WIRE = fromWire(WIRE_TASKS);
const REMARKS_FROM_WIRE = fromWire(WIRE_REMARKS);

export type SharedLink =
  | { state: 'none' }
  | { state: 'lost' }
  | { state: 'letter'; data: LetterData };

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Throws if the text is not valid base64url encoding valid UTF-8. */
function fromBase64Url(text: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('not base64url');
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/** Shareable data, or null: a refusal letter cannot be shared. */
export function encodeLetter(d: LetterData): string | null {
  if (d.verdict === 'refusal') return null;
  const payload: Record<string, unknown> = {
    v: VERSION,
    s: d.seed,
    g: d.grievances.map((code) => SHORT_CODES[code]),
    n: d.score,
    r: d.verdict === 'resignation' ? 'd' : 'f',
  };
  if (d.quote !== null) payload.c = d.quote;
  if (d.tasks.length > 0) payload.t = d.tasks.map((code) => WIRE_TASKS[code]);
  if (d.terms.some((t) => t !== null)) payload.w = d.terms;
  if (d.missing.length > 0) payload.m = d.missing;
  if (d.subject !== null) payload.x = d.subject;
  if (d.remark !== null) payload.p = [WIRE_REMARKS[d.remark.code], d.remark.n];
  return toBase64Url(JSON.stringify(payload));
}

function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

/** Known codes only, without duplicates, in order. Unknown fields are ignored: the letter stays readable without them. */
function knownCodes<K>(value: unknown, table: ReadonlyMap<string, K>, max: number): K[] {
  if (!Array.isArray(value)) return [];
  const codes = value.flatMap((wire) => (typeof wire === 'string' && table.has(wire) ? [table.get(wire)!] : []));
  return [...new Set(codes)].slice(0, max);
}

/** Valid indices for the primary task, without duplicates, sorted. */
function knownMissing(value: unknown, primary: TaskCode | undefined): number[] {
  if (!Array.isArray(value) || !primary) return [];
  const count = task(primary).checks.length;
  const indices = value.filter((i): i is number => isIntegerBetween(i, 0, count - 1));
  return [...new Set(indices)].sort((a, b) => a - b);
}

/** A term is kept only if it is one of the names recognised for its task: nothing arbitrary is displayed. */
function knownTerms(value: unknown, tasks: readonly TaskCode[]): (string | null)[] {
  const terms: unknown[] = Array.isArray(value) ? value : [];
  return tasks.map((code, i) => {
    const term = terms[i];
    return typeof term === 'string' && task(code).names.includes(term) ? term : null;
  });
}

function knownSubject(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > MAX_SUBJECT_LENGTH) return null;
  return filterQuote(value);
}

function knownRemark(value: unknown): Remark | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const [wire, n] = value as [unknown, unknown];
  const code = typeof wire === 'string' ? REMARKS_FROM_WIRE.get(wire) : undefined;
  if (!code || !isIntegerBetween(n, 0, MAX_REMARK_NUMBER)) return null;
  if (code === 'LANGUAGE' && n >= FOREIGN_LANGUAGES.length) return null;
  return { code, n };
}

/** Validates a decoded payload again; null if it does not describe a displayable letter. */
function validate(payload: unknown): LetterData | null {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return null;
  const { v, s, g, n, r, c, t, w, m, x, p } = payload as Record<string, unknown>;
  if (!READABLE_VERSIONS.includes(v) || !isIntegerBetween(s, 0, MAX_SEED) || !isIntegerBetween(n, 0, 20)) return null;
  if (r !== 'd' && r !== 'f') return null;
  const quote = typeof c === 'string' ? filterQuote(c) : null;
  const tasks = knownCodes(t, TASKS_FROM_WIRE, MAX_TASKS);
  const reading = { tasks, terms: knownTerms(w, tasks), subject: knownSubject(x) };
  if (r === 'f') return { seed: s, grievances: [], score: n, verdict: 'congratulations', quote, ...reading, missing: [], remark: null };
  const grievances = knownCodes(g, GRIEVANCES_FROM_WIRE, MAX_GRIEVANCES);
  if (grievances.length === 0) return null;
  return { seed: s, grievances, score: n, verdict: 'resignation', quote, ...reading, missing: knownMissing(m, tasks[0]), remark: knownRemark(p) };
}

export function readSharedLink(hash: string): SharedLink {
  if (!hash.startsWith(PREFIX)) return { state: 'none' };
  const content = hash.slice(PREFIX.length);
  if (content.length > MAX_FRAGMENT_LENGTH) return { state: 'lost' };
  let payload: unknown;
  try {
    payload = JSON.parse(fromBase64Url(content));
  } catch {
    // A truncated or tampered link is an expected case, shown to the user as a "lost letter".
    return { state: 'lost' };
  }
  const data = validate(payload);
  return data ? { state: 'letter', data } : { state: 'lost' };
}

export function shareUrl(encoded: string): string {
  return `${window.location.origin}${window.location.pathname}${PREFIX}${encoded}`;
}
