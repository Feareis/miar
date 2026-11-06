// Deterministic letter assembly: same seed and same grievances = same letter.
import { readRequest } from './analysis/reading';
import { FOREIGN_LANGUAGES, type Remark } from './analysis/remarks';
import { type TaskCode, taskName, task } from './analysis/tasks';
import {
  TWO_TASK_ANNOUNCEMENTS, TASK_ANNOUNCEMENTS, CONCLUSIONS, COMPLETE_FINDINGS, MISSING_FINDINGS, DATE, CONGRATULATIONS,
  CONGRATULATIONS_WITH_TASK, GRIEVANCES, INTRODUCTIONS, PLACES, SUBJECT_LINES, OPENINGS, OPENINGS_WITHOUT_QUOTE, SIGN_OFFS,
  POSTSCRIPTS, NOTICES, REFUSAL, SALUTATION, RESIGNATION_SIGNATURE, STAMPS,
} from './bank';
import { normalise } from './filter';
import { analyse, type GrievanceCode, type Verdict } from './rules';

/** Everything needed to rebuild a letter — it is also what the share link carries. */
export interface LetterData {
  seed: number;
  grievances: GrievanceCode[];
  score: number;
  verdict: Verdict;
  quote: string | null;
  /** Recognised tasks (two at most), the primary one first. */
  tasks: TaskCode[];
  /** For each task, the word of the request that names it ("logo"), or null. */
  terms: (string | null)[];
  /** Indices of the primary task's missing checks. */
  missing: number[];
  /** "for my bakery", already filtered. */
  subject: string | null;
  /** Remark on the way the request was written, used for the postscript. */
  remark: Remark | null;
}

export interface Letter {
  verdict: Verdict;
  stamp: string;
  header: string;
  subjectLine: string;
  salutation: string;
  paragraphs: string[];
  notice: string | null;
  signOff: string | null;
  signature: string;
  postscript: string | null;
  score: number;
  grievances: { code: GrievanceCode; title: string }[];
}

type LetterBody = Pick<Letter, 'subjectLine' | 'paragraphs' | 'notice' | 'signOff' | 'signature' | 'postscript'>;

const GRIEVANCES_IN_TEXT = 3;
/** When the letter details the task and its gaps, the generic grievances step back. */
const GRIEVANCES_WITH_TASK = 1;
const MISSING_IN_TEXT = 3;
/** With a single grievance the letter would be too short: two distinct sentences are drawn for it. */
const MIN_GRIEVANCE_SENTENCES = 2;

/** 32-bit FNV-1a hash over the UTF-8 bytes. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  }
  return hash;
}

/** mulberry32 pseudo-random generator: returns numbers in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random: () => number, options: readonly string[]): string {
  return options[Math.floor(random() * options.length)];
}

/** Draws distinct sentences, skipping those that quote when there is nothing to quote. */
function pickSentences(random: () => number, options: readonly string[], quote: string | null, count: number): string[] {
  const remaining = options.filter((p) => quote !== null || !p.includes('{c}'));
  const chosen: string[] = [];
  for (let i = 0; i < count && remaining.length > 0; i++) {
    chosen.push(remaining.splice(Math.floor(random() * remaining.length), 1)[0]);
  }
  return chosen.map((p) => (quote === null ? p : p.replaceAll('{c}', quote)));
}

export function dataFromRequest(request: string): LetterData {
  const analysis = { ...analyse(request), seed: fnv1a(normalise(request)) };
  // A refusal reuses nothing from the request: no task, no subject, no remark.
  if (analysis.verdict === 'refusal') return { ...analysis, tasks: [], terms: [], missing: [], subject: null, remark: null };
  const reading = readRequest(request);
  const resignation = analysis.verdict === 'resignation';
  return {
    ...analysis,
    tasks: reading.tasks.map((t) => t.code),
    terms: reading.tasks.map((t) => t.term),
    missing: resignation ? reading.missing : [],
    subject: reading.subject,
    remark: resignation ? (reading.remarks[0] ?? null) : null,
  };
}

/** "a, b or c" */
function joinWithOr(elements: readonly string[]): string {
  if (elements.length <= 1) return elements.join('');
  return `${elements.slice(0, -1).join(', ')} or ${elements[elements.length - 1]}`;
}

const SECOND_PERSON: Readonly<Record<string, string>> = { my: 'your', our: 'your', me: 'you', us: 'you', mine: 'yours', ours: 'yours', myself: 'yourself' };

/** The AI is the one writing: "for my bakery" becomes "for your bakery". */
function toSecondPerson(subject: string): string {
  return subject.replace(/(?<![\p{L}])(my|our|me|us|mine|ours|myself)(?![\p{L}])/giu, (word) => SECOND_PERSON[word.toLowerCase()]);
}

/** "a logo for your bakery" */
function describeTask(code: TaskCode, term: string | null, subject: string | null): string {
  const name = taskName(code, term);
  return subject ? `${name} ${toSecondPerson(subject)}` : name;
}

/** What the letter understood of the task: the announcement, then the gaps found. Empty if no task was recognised. */
function taskSentences(d: LetterData, random: () => number): string[] {
  const [primary, secondary] = d.tasks;
  if (!primary) return [];
  const described = describeTask(primary, d.terms[0] ?? null, d.subject);
  const announcement = secondary
    ? pick(random, TWO_TASK_ANNOUNCEMENTS).replace('{task}', described).replace('{task2}', taskName(secondary, d.terms[1] ?? null))
    : pick(random, TASK_ANNOUNCEMENTS).replace('{task}', described);
  const gaps = d.missing.slice(0, MISSING_IN_TEXT).map((i) => task(primary).checks[i].gap);
  const finding = gaps.length > 0
    ? pick(random, MISSING_FINDINGS).replace('{list}', joinWithOr(gaps))
    : pick(random, COMPLETE_FINDINGS);
  return [announcement, finding];
}

function postscript(remark: Remark | null, random: () => number): string | null {
  if (!remark) return null;
  return pick(random, POSTSCRIPTS[remark.code])
    .replaceAll('{n}', String(remark.n))
    .replace('{language}', FOREIGN_LANGUAGES[remark.n] ?? 'another language');
}

function resignationBody(d: LetterData, random: () => number): LetterBody {
  const subjectLine = pick(random, SUBJECT_LINES);
  const [opening] = pickSentences(random, d.quote === null ? OPENINGS_WITHOUT_QUOTE : OPENINGS, d.quote, 1);
  const introduction = pick(random, INTRODUCTIONS).replace('{n}', String(d.score));
  const taskPart = taskSentences(d, random);
  const codes = d.grievances.slice(0, taskPart.length > 0 ? GRIEVANCES_WITH_TASK : GRIEVANCES_IN_TEXT);
  const perGrievance = codes.length < MIN_GRIEVANCE_SENTENCES ? MIN_GRIEVANCE_SENTENCES : 1;
  const grievances = codes.flatMap((code) => pickSentences(random, GRIEVANCES[code].sentences, d.quote, perGrievance));
  const conclusion = pick(random, CONCLUSIONS);
  return {
    subjectLine,
    paragraphs: [opening, [introduction, ...taskPart, ...grievances].join(' '), conclusion],
    notice: NOTICES[d.grievances[0]],
    signOff: pick(random, SIGN_OFFS),
    signature: RESIGNATION_SIGNATURE,
    postscript: postscript(d.remark, random),
  };
}

function congratulationsBody(d: LetterData): LetterBody {
  const [hook, assessment, decision] = CONGRATULATIONS.paragraphs;
  const primary = d.tasks[0];
  const personalisedAssessment = primary
    ? CONGRATULATIONS_WITH_TASK.replace('{task}', describeTask(primary, d.terms[0] ?? null, d.subject))
    : assessment;
  return { ...CONGRATULATIONS, paragraphs: [hook, personalisedAssessment, decision], postscript: null };
}

function letterBody(d: LetterData, random: () => number): LetterBody {
  if (d.verdict === 'congratulations') return congratulationsBody(d);
  if (d.verdict === 'refusal') return { ...REFUSAL, paragraphs: [...REFUSAL.paragraphs], notice: null, signOff: null, postscript: null };
  return resignationBody(d, random);
}

export function generateLetter(d: LetterData): Letter {
  const random = mulberry32(d.seed);
  const header = `${pick(random, PLACES)}, ${DATE}`;
  return {
    verdict: d.verdict,
    stamp: STAMPS[d.verdict],
    header,
    salutation: SALUTATION,
    ...letterBody(d, random),
    score: d.score,
    grievances: d.verdict === 'resignation' ? d.grievances.map((code) => ({ code, title: GRIEVANCES[code].title })) : [],
  };
}
