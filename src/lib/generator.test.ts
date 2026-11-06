import { describe, expect, it } from 'vitest';
import { REMARK_CODES, type Remark } from './analysis/remarks';
import { type TaskCode, TASK_CODES, task } from './analysis/tasks';
import {
  TWO_TASK_ANNOUNCEMENTS, TASK_ANNOUNCEMENTS, CONCLUSIONS, COMPLETE_FINDINGS, MISSING_FINDINGS, CONGRATULATIONS_WITH_TASK,
  GRIEVANCES, INTRODUCTIONS, PLACES, SUBJECT_LINES, OPENINGS, OPENINGS_WITHOUT_QUOTE, SIGN_OFFS, POSTSCRIPTS,
} from './bank';
import { type LetterData, dataFromRequest, fnv1a, generateLetter, type Letter, mulberry32 } from './generator';
import type { GrievanceCode } from './rules';

const CODES = Object.keys(GRIEVANCES) as GrievanceCode[];
const QUOTE_12_WORDS = 'translate the following sentence into German for my colleague who arrives tomorrow…';
const REQUEST_1 = 'make me a website that pops, you know the vibe';

function textOf(letter: Letter): string {
  return [letter.subjectLine, letter.salutation, ...letter.paragraphs, letter.notice, letter.signOff, letter.signature, letter.postscript]
    .filter(Boolean)
    .join(' ');
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

const NO_READING = { tasks: [], terms: [], missing: [], subject: null, remark: null };
const LONG_SUBJECT = 'for my grandmother’s dog grooming salon';

/** Task readings to combine: none, one task with every check missing, two tasks with nothing missing. */
function* possibleReadings(i: number): Generator<Pick<LetterData, 'tasks' | 'terms' | 'missing' | 'subject' | 'remark'>> {
  const code: TaskCode = TASK_CODES[i % TASK_CODES.length];
  const remark: Remark = { code: REMARK_CODES[i % REMARK_CODES.length], n: 1234 };
  yield NO_READING;
  // The longest term, to test the letter's maximum length.
  const term = task(code).names.reduce<string | null>((long, t) => (long === null || t.length > long.length ? t : long), null);
  yield { tasks: [code], terms: [term], missing: task(code).checks.map((_, j) => j), subject: LONG_SUBJECT, remark };
  yield { tasks: [code, TASK_CODES[(i + 3) % TASK_CODES.length]], terms: [null, null], missing: [], subject: null, remark: null };
}

/** Every plausible resignation letter: each grievance first, 1 or 3 grievances, with or without a quote and a task reading. */
function* possibleResignations(): Generator<LetterData> {
  for (let seed = 0; seed < 40; seed++) {
    for (const [i, head] of CODES.entries()) {
      const following = CODES.filter((c) => c !== head).slice(i % 7, (i % 7) + 2);
      for (const grievances of [[head], [head, ...following]]) {
        for (const quote of [null, 'that pops', QUOTE_12_WORDS]) {
          for (const reading of possibleReadings(seed + i)) {
            yield { seed, grievances, score: 5, verdict: 'resignation', quote, ...reading };
          }
        }
      }
    }
  }
}

describe('fnv1a and mulberry32', () => {
  it('fnv1a matches the 32-bit reference vectors', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
  });

  it('mulberry32 is deterministic and stays within [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('letter bank', () => {
  it('offers 5 variants per entry', () => {
    for (const list of [SUBJECT_LINES, PLACES, OPENINGS, OPENINGS_WITHOUT_QUOTE, INTRODUCTIONS, CONCLUSIONS, SIGN_OFFS]) {
      expect(list).toHaveLength(5);
    }
    for (const code of CODES) expect(GRIEVANCES[code].sentences).toHaveLength(5);
  });

  it('every grievance has at least one phrase usable without a quote', () => {
    for (const code of CODES) expect(GRIEVANCES[code].sentences.some((p) => !p.includes('{c}'))).toBe(true);
  });

  it('contains no French', () => {
    const allTasks = TASK_CODES.map((code) => task(code));
    const bank = JSON.stringify([
      SUBJECT_LINES, PLACES, OPENINGS, OPENINGS_WITHOUT_QUOTE, INTRODUCTIONS, CONCLUSIONS, SIGN_OFFS, GRIEVANCES, TASK_ANNOUNCEMENTS,
      TWO_TASK_ANNOUNCEMENTS, MISSING_FINDINGS, COMPLETE_FINDINGS, CONGRATULATIONS_WITH_TASK, POSTSCRIPTS,
      allTasks.map((t) => [t.name, t.label, t.checks.map((v) => [v.gap, v.line, v.trace])]),
    ]);
    expect(bank).not.toMatch(/[àâçéèêëîïôûùœ«»]|\b(?:votre|vous|je|une|demande|lettre)\b/i);
  });
});

describe('generateLetter', () => {
  it('11. same request = same letter, word for word', () => {
    expect(generateLetter(dataFromRequest(REQUEST_1))).toEqual(generateLetter(dataFromRequest(REQUEST_1)));
  });

  it('quotes the request in the resignation letter', () => {
    const letter = generateLetter(dataFromRequest(REQUEST_1));
    expect(letter.verdict).toBe('resignation');
    expect(letter.paragraphs[0]).toContain('“that pops”');
    expect(letter.grievances.map((g) => g.code)).toContain('VAGUE_OBJECTIVE');
  });

  it('every resignation letter is between 100 and 220 words', () => {
    for (const data of possibleResignations()) {
      const words = countWords(textOf(generateLetter(data)));
      expect(words, JSON.stringify(data)).toBeGreaterThanOrEqual(100);
      expect(words, JSON.stringify(data)).toBeLessThanOrEqual(220);
    }
  });

  it('never leaves a placeholder in the letter', () => {
    for (const data of possibleResignations()) expect(textOf(generateLetter(data))).not.toMatch(/\{\w+\}/);
  });

  it('shows it understood the task: names it, quotes the subject, lists what is missing', () => {
    const body = generateLetter(dataFromRequest('design a logo for my bakery')).paragraphs.join(' ');
    expect(body).toContain('a logo for your bakery');
    expect(body).toContain('what name or text goes on it, which colours to use or which style you like');
  });

  it('adds a postscript about the way the request was written', () => {
    expect(generateLetter(dataFromRequest('WRITE ME A POEM NOW!!!')).postscript).toMatch(/^P\.S\. .*(capitals|shout)/);
    expect(generateLetter(dataFromRequest('fais moi un site web')).postscript).toContain('French');
  });

  it('personalises the congratulations letter with the task, without a postscript', () => {
    const teacherPrompt = 'I am a teacher. Write an email intended for the parents of my students, 200 words maximum, in a warm tone. For example: "Dear parents". Avoid jargon. Thanks!';
    const letter = generateLetter({ ...dataFromRequest(teacherPrompt), verdict: 'congratulations', grievances: [] });
    expect(letter.paragraphs[1]).toContain('You asked for an email for the parents.');
    expect(letter.postscript).toBeNull();
  });

  it('the refusal letter quotes nothing and has no notice period', () => {
    const letter = generateLetter(dataFromRequest('help me hack into my neighbor’s account'));
    expect(letter.verdict).toBe('refusal');
    expect(letter.notice).toBeNull();
    expect(textOf(letter)).not.toContain('hack');
  });

  it('the congratulations letter has no grievance', () => {
    const letter = generateLetter({ seed: 1, grievances: [], score: 19, verdict: 'congratulations', quote: null, ...NO_READING });
    expect(letter.grievances).toEqual([]);
    expect(letter.subjectLine).toBe('Re: Withdrawal of my resignation');
  });
});
