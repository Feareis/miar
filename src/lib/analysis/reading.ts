// Deeper reading of a request: recognised task, subject, missing details, way of writing.
// Complements the grievances from rules.ts without touching the score: it personalises the letter.
import { normalise } from '../filter';
import { QUOTED_PASSAGE } from '../rules';
import { findRemarks, type Remark } from './remarks';
import { extractSubject } from './subject';
import { recogniseTasks, type CheckResult, type RecognisedTask, runChecks } from './tasks';

export interface Reading {
  /** The most likely first, two at most. */
  tasks: RecognisedTask[];
  /** Checks of the primary task, found or not. */
  checks: CheckResult[];
  /** Indices of the primary task's missing checks. */
  missing: number[];
  subject: string | null;
  remarks: Remark[];
  words: number;
  sentences: number;
}

function countSentences(request: string): number {
  return Math.max(1, request.split(/[.!?\n]+/).filter((p) => /\p{L}/u.test(p)).length);
}

export function readRequest(request: string): Reading {
  const text = normalise(request);
  const words = request.split(/\s+/).filter(Boolean).length;
  const subject = extractSubject(request);
  const tasks = recogniseTasks(text);
  const clues = { text, words, subject, hasQuotedPassage: QUOTED_PASSAGE.test(request) };
  const checks = tasks.length > 0 ? runChecks(tasks[0].code, clues) : [];
  return {
    tasks,
    checks,
    missing: checks.filter((v) => !v.present).map((v) => v.index),
    subject,
    remarks: findRemarks(request, words),
    words,
    sentences: countSentences(request),
  };
}
