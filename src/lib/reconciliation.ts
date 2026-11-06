// Prompt template to fill in: no rewriting, one line to complete per detected gap.
import { readRequest } from './analysis/reading';
import { task } from './analysis/tasks';
import { type GrievanceCode, detectGrievances } from './rules';

/** Display order of the template. MANIPULATION_ATTEMPT has no line: there is nothing to fill in. */
const LINES: readonly (readonly [GrievanceCode, string])[] = [
  ['NO_CONTEXT', 'Context: [who I am, what situation I’m in]'],
  ['VAGUE_OBJECTIVE', 'Objective: [the concrete result I expect]'],
  ['UNKNOWN_AUDIENCE', 'Audience: [who it is for]'],
  ['NO_FORMAT', 'Format: [length, structure, medium]'],
  ['NO_EXAMPLE', 'Example: [an example of what I expect]'],
  ['NO_CONSTRAINTS', 'Constraints: [tone, deadline, what to avoid]'],
  ['MISSING_ATTACHMENT', 'Attachment: [paste the text or file here]'],
  ['CONTRADICTION', 'Priority: [choose between the two requirements]'],
  ['OVERSIZED_SCOPE', 'First step: [a smaller, realistic version]'],
];

/** First what the recognised task requires ("Colours: […]" for a logo), then the generic gaps. */
export function reconcile(request: string): string {
  const grievances = new Set(detectGrievances(request));
  const { tasks, missing } = readRequest(request);
  const checks = tasks.length > 0 ? missing.map((i) => task(tasks[0].code).checks[i]) : [];
  for (const v of checks) if (v.replaces) grievances.delete(v.replaces);
  const specific = checks.map((v) => v.line);
  const generic = LINES.filter(([code]) => grievances.has(code)).map(([, line]) => line);
  return [`Original request: “${request.trim()}”`, ...specific, ...generic].join('\n');
}
