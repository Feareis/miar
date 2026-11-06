// Analysis log shown while the user waits: each line describes a real result of the reading,
// presented as an AI's reasoning. Nothing is made up, except the confidence percentage.
import { GRIEVANCES } from '../bank';
import type { LetterData } from '../generator';
import { readRequest } from './reading';
import { type RemarkCode, FOREIGN_LANGUAGES, type Remark } from './remarks';
import { task } from './tasks';

export const DELAY_PER_LINE_MS = 260;
const FINAL_PAUSE_MS = 700;
const FLAGGED_GRIEVANCES = 2;
const QUOTED_TONES = 2;
const MAX_CONFIDENCE = 98;

const TONES: Readonly<Record<RemarkCode, string>> = {
  LANGUAGE: 'foreign language',
  SHOUTING: 'shouting',
  RUDENESS: 'hostile',
  FLATTERY: 'flattering',
  EMOJI: 'emoji detected',
  EXCLAMATIONS: 'overexcited',
  SMS: 'text-speak',
  STRETCHING: 'drawn-out letters',
  URGENCY: 'urgent',
  QUESTIONS: 'interrogative',
  NO_PUNCTUATION: 'no punctuation',
  RAMBLING: 'verbose',
  POLITENESS: 'polite',
  CURT: 'curt, no “please”',
};

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function tone(remarks: readonly Remark[]): string {
  if (remarks.length === 0) return 'neutral';
  return remarks.slice(0, QUOTED_TONES).map((r) => (r.code === 'LANGUAGE' ? FOREIGN_LANGUAGES[r.n] : TONES[r.code])).join(', ');
}

/** Decorative but stable percentage: same request, same confidence. */
function confidence(score: number, seed: number): number {
  return Math.min(MAX_CONFIDENCE, 61 + score * 6 + (seed % 7));
}

/** Time to play back the whole log, then leave it on screen for a fraction of a second. */
export function waitDuration(lines: number): number {
  return lines * DELAY_PER_LINE_MS + FINAL_PAUSE_MS;
}

export function buildTrace(request: string, d: LetterData): string[] {
  const reading = readRequest(request);
  const lines = [`Reading request: ${plural(reading.words, 'word')}, ${plural(reading.sentences, 'sentence')}.`];
  // A refusal does not detail anything about the request.
  if (d.verdict === 'refusal') return [...lines, 'Checking request against house rules… violation.', 'Drafting a short refusal.'];

  lines.push('Author identified: human (confidence 100%). Lowering expectations…');
  const [primary, secondary] = reading.tasks;
  lines.push(primary
    ? `Task identified: ${task(primary.code).label} (${primary.term ? `“${primary.term}”, ` : ''}confidence ${confidence(primary.score, d.seed)}%).`
    : 'Task identified: unclear, probably to its author too. Rereading…');
  if (secondary) lines.push(`Second task detected: ${task(secondary.code).label}.`);
  if (d.subject) lines.push(`Subject: “${d.subject}”.`);
  for (const v of reading.checks) lines.push(`Checking ${v.trace}… ${v.present ? 'found' : 'missing'}.`);
  for (const code of d.grievances.slice(0, FLAGGED_GRIEVANCES)) lines.push(`Flag raised: ${GRIEVANCES[code].title.toLowerCase()}.`);
  lines.push(`Tone: ${tone(reading.remarks)}.`);
  lines.push(`Grade computed: ${d.score}/20.`);
  lines.push(d.verdict === 'congratulations' ? 'Unexpected result: a competent human. Cancelling resignation…' : 'Human error confirmed. Drafting resignation letter…');
  return lines;
}
