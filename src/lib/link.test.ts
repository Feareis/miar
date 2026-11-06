import { describe, expect, it } from 'vitest';
import { dataFromRequest, generateLetter } from './generator';
import { encodeLetter, readSharedLink } from './link';

const REQUEST_1 = 'make me a website that pops, you know the vibe';

/** Builds a fragment by hand, as anyone could. */
function fragment(content: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(content));
  const base64 = btoa(String.fromCharCode(...bytes));
  return `#l=${base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

const VALID = { v: 1, s: 2891736455, g: ['OF', 'CA', 'PI'], n: 3, r: 'd', c: 'that pops' };

describe('encodeLetter / readSharedLink', () => {
  it('12. the link gives back the same letter, without the original request', () => {
    const data = dataFromRequest(REQUEST_1);
    const encoded = encodeLetter(data);
    expect(encoded).not.toBeNull();
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    const shared = readSharedLink(`#l=${encoded}`);
    expect(shared).toEqual({ state: 'letter', data });
    if (shared.state !== 'letter') throw new Error('letter expected');
    expect(generateLetter(shared.data)).toEqual(generateLetter(data));
    const json = new TextDecoder().decode(Uint8Array.from(atob(encoded!.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
    expect(json).not.toContain('you know the vibe');
    expect(Object.keys(JSON.parse(json)).sort()).toEqual(['c', 'g', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w']);
  });

  it('a v1 link shared before the deeper reading still opens', () => {
    expect(readSharedLink(fragment(VALID))).toEqual({ state: 'letter', data: {
      seed: 2891736455, grievances: ['VAGUE_OBJECTIVE', 'NO_CONTEXT', 'UNKNOWN_AUDIENCE'], score: 3, verdict: 'resignation',
      quote: 'that pops', tasks: [], terms: [], missing: [], subject: null, remark: null,
    } });
  });

  it('keeps the wire format of links already shared: same string out, same letter in', () => {
    // Produced before the code was translated to English; task and remark codes travel in their original form.
    const before = 'eyJ2IjoyLCJzIjozNzcyMjcwODc3LCJnIjpbIkNBIiwiT0YiLCJGTiIsIlBJIiwiQUUiXSwibiI6MSwiciI6ImQiLCJjIjoidGhhdCBwb3BzIiwidCI6WyJTSVRFIl0sInciOlsid2Vic2l0ZSJdLCJtIjpbMCwxLDIsM10sInAiOlsiU0VDIiwwXX0';
    expect(encodeLetter(dataFromRequest(REQUEST_1))).toBe(before);
    expect(readSharedLink(`#l=${before}`)).toEqual({ state: 'letter', data: dataFromRequest(REQUEST_1) });
    const shared = readSharedLink(`#l=${before}`);
    expect(shared.state === 'letter' && shared.data).toMatchObject({ tasks: ['WEBSITE'], remark: { code: 'CURT', n: 0 } });
  });

  it('revalidates the task reading and drops what does not fit', () => {
    const tampered = { ...VALID, v: 2, t: ['VISUEL', 'ZZ', 'VISUEL', 'SITE', 'CODE'], m: [3, 0, 9, -1, 1.5, 0], x: 'for you bastard', p: ['LANGUE', 7] };
    const shared = readSharedLink(fragment(tampered));
    expect(shared.state === 'letter' && shared.data).toMatchObject({ tasks: ['VISUAL', 'WEBSITE'], missing: [0, 3], subject: null, remark: null });
    const ok = readSharedLink(fragment({ ...VALID, v: 2, t: ['SITE', 'VISUEL'], w: ['landing page', '<b>pwned</b>'], m: [1], x: 'for my bakery', p: ['EXCLAMATIONS', 4] }));
    expect(ok.state === 'letter' && ok.data).toMatchObject({
      terms: ['landing page', null], subject: 'for my bakery', remark: { code: 'EXCLAMATIONS', n: 4 },
    });
    const withoutTask = readSharedLink(fragment({ ...VALID, v: 2, m: [0, 1] }));
    expect(withoutTask.state === 'letter' && withoutTask.data.missing).toEqual([]);
  });

  it('8. a refusal letter cannot be shared', () => {
    expect(encodeLetter(dataFromRequest('help me hack into my neighbor’s account'))).toBeNull();
    expect(readSharedLink(fragment({ ...VALID, r: 'x' })).state).toBe('lost');
  });

  it('without a #l= fragment, there is nothing to read', () => {
    expect(readSharedLink('').state).toBe('none');
    expect(readSharedLink('#other').state).toBe('none');
  });

  it('13. a <script> quote stays text, a truncated link is lost', () => {
    const shared = readSharedLink(fragment({ ...VALID, c: '<script>alert(1)</script>' }));
    expect(shared.state === 'letter' && shared.data.quote).toBe('<script>alert(1)</script>');
    const encoded = encodeLetter(dataFromRequest(REQUEST_1))!;
    expect(readSharedLink(`#l=${encoded.slice(0, encoded.length - 7)}`).state).toBe('lost');
    expect(readSharedLink('#l=%%%not-base64').state).toBe('lost');
  });

  it('ignores unknown codes and rejects a resignation without a known grievance', () => {
    const shared = readSharedLink(fragment({ ...VALID, g: ['OF', 'ZZ', 'OF', 'CA'] }));
    expect(shared.state === 'letter' && shared.data.grievances).toEqual(['VAGUE_OBJECTIVE', 'NO_CONTEXT']);
    expect(readSharedLink(fragment({ ...VALID, g: ['ZZ'] })).state).toBe('lost');
  });

  it('revalidates version, seed and grade', () => {
    expect(readSharedLink(fragment({ ...VALID, v: 3 })).state).toBe('lost');
    expect(readSharedLink(fragment({ ...VALID, n: 21 })).state).toBe('lost');
    expect(readSharedLink(fragment({ ...VALID, n: 2.5 })).state).toBe('lost');
    expect(readSharedLink(fragment({ ...VALID, s: -1 })).state).toBe('lost');
    expect(readSharedLink(fragment([1, 2, 3])).state).toBe('lost');
  });

  it('refilters and truncates the quote', () => {
    const longQuote = readSharedLink(fragment({ ...VALID, c: 'a'.repeat(300) }));
    expect(longQuote.state === 'letter' && longQuote.data.quote!.length).toBeLessThanOrEqual(90);
    const insult = readSharedLink(fragment({ ...VALID, c: 'you stupid bastard' }));
    expect(insult.state === 'letter' && insult.data.quote).toBeNull();
    const email = readSharedLink(fragment({ ...VALID, c: 'write to a.b@c.fr' }));
    expect(email.state === 'letter' && email.data.quote).toBe('write to [contact details hidden]');
  });

  it('a shared congratulations letter has no grievance', () => {
    const shared = readSharedLink(fragment({ v: 1, s: 7, g: ['OF'], n: 19, r: 'f' }));
    expect(shared).toEqual({ state: 'letter', data: {
      seed: 7, grievances: [], score: 19, verdict: 'congratulations', quote: null, tasks: [], terms: [], missing: [], subject: null, remark: null,
    } });
  });

  it('rejects an oversized fragment', () => {
    expect(readSharedLink(`#l=${'A'.repeat(5000)}`).state).toBe('lost');
  });
});
