import { describe, expect, it } from 'vitest';
import { reconcile } from './reconciliation';

describe('reconcile', () => {
  it('repeats the request, adds what the task needs, then one line per grievance', () => {
    expect(reconcile('make me a website that pops, you know the vibe')).toBe([
      'Original request: “make me a website that pops, you know the vibe”',
      'Purpose: [sell, showcase, take bookings…]',
      'Pages: [home, about, contact…]',
      'Look: [colours, fonts, existing logo…]',
      'Built with: [WordPress, plain HTML, Shopify…]',
      'Context: [who I am, what situation I’m in]',
      'Objective: [the concrete result I expect]',
      'Audience: [who it is for]',
      'Format: [length, structure, medium]',
      'Example: [an example of what I expect]',
      'Constraints: [tone, deadline, what to avoid]',
    ].join('\n'));
  });

  it('adds attachment, priority and first step when those grievances are detected', () => {
    expect(reconcile('write a poem about this text')).toContain('Attachment: [paste the text or file here]');
    expect(reconcile('keep it short but detail absolutely everything')).toContain('Priority: [choose between the two requirements]');
    expect(reconcile('build me a Facebook but better by tomorrow')).toContain('First step: [a smaller, realistic version]');
  });

  it('a summary without its text asks for the text once, not twice', () => {
    const template = reconcile('summarize this text');
    expect(template).toContain('Text: [paste it in full]');
    expect(template).not.toContain('Attachment:');
  });

  it('omits lines without a grievance or a missing piece', () => {
    const request = 'I am an HR manager. Write a 100-word email intended for recruiters to invite them to our job fair, formal tone, for example “Hello”.';
    expect(reconcile(request)).toBe(`Original request: “${request}”`);
  });
});
