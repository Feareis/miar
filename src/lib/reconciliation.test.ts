import { describe, expect, it } from 'vitest';
import { reconcilier } from './reconciliation';

describe('reconcilier', () => {
  it('repeats the request and adds one line per grievance, in template order', () => {
    expect(reconcilier('make me a website that pops, you know the vibe')).toBe([
      'Original request: “make me a website that pops, you know the vibe”',
      'Context: [who I am, what situation I’m in]',
      'Objective: [the concrete result I expect]',
      'Audience: [who it is for]',
      'Format: [length, structure, medium]',
      'Example: [an example of what I expect]',
      'Constraints: [tone, deadline, what to avoid]',
    ].join('\n'));
  });

  it('adds attachment, priority and first step when those grievances are detected', () => {
    expect(reconcilier('summarize this text')).toContain('Attachment: [paste the text or file here]');
    expect(reconcilier('keep it short but detail absolutely everything')).toContain('Priority: [choose between the two requirements]');
    expect(reconcilier('build me a Facebook but better by tomorrow')).toContain('First step: [a smaller, realistic version]');
  });

  it('omits lines without a grievance', () => {
    const demande = 'I am an HR manager. Write a 100-word email intended for recruiters, formal tone, for example “Hello”.';
    expect(reconcilier(demande)).toBe(`Original request: “${demande}”`);
  });
});
