import { describe, expect, it } from 'vitest';
import { readRequest } from './reading';
import { extractSubject } from './subject';
import { taskName } from './tasks';

const codes = (request: string) => readRequest(request).tasks.map((t) => t.code);
const remarks = (request: string) => readRequest(request).remarks.map((r) => r.code);

describe('task recognition', () => {
  it.each([
    ['make me a website that pops, you know the vibe', 'WEBSITE'],
    ['design a logo for my bakery', 'VISUAL'],
    ['write an email to my boss to ask for a raise', 'EMAIL'],
    ['summarize this text', 'SUMMARY'],
    ['build me a Facebook but better by tomorrow', 'APP'],
    ['translate this into Spanish', 'TRANSLATION'],
    ['write a poem about the sea', 'CREATIVE'],
    ['write a cover letter for a marketing internship', 'JOB_APPLICATION'],
    ['explain quantum computing like I’m 5', 'EXPLANATION'],
    ['python function that returns the sum of a list', 'CODE'],
    ['give me a name for my podcast', 'NAMING'],
    ['write a LinkedIn post about our launch', 'POST'],
    ['write a blog post about remote work', 'ARTICLE'],
    ['make slides for my meeting', 'PRESENTATION'],
    ['a 4-week workout plan', 'PLAN'],
  ])('%s → %s', (request, expected) => {
    expect(codes(request)[0]).toBe(expected);
  });

  it('names the task with the very word of the request, when it can', () => {
    const name = (request: string) => {
      const [t] = readRequest(request).tasks;
      return taskName(t.code, t.term);
    };
    expect(name('design a logo for my bakery')).toBe('a logo');
    expect(name('write an essay about bees')).toBe('an essay');
    expect(name('fix my CV')).toBe('a CV');
    expect(name('summarize this text')).toBe('a summary');
    expect(name('build me a Facebook but better')).toBe('an app');
  });

  it('recognises nothing in a request without a task', () => {
    expect(codes('hello there')).toEqual([]);
  });

  it('keeps a second task when two are asked at once', () => {
    expect(codes('make me a website and a logo')).toEqual(['WEBSITE', 'VISUAL']);
  });
});

describe('missing information', () => {
  it('a bare logo request misses name, colours, style and use', () => {
    expect(readRequest('design a logo for my bakery').missing).toEqual([0, 1, 2, 3]);
  });

  it('an email with recipient and purpose only misses the tone', () => {
    expect(readRequest('write an email to my boss to ask for a raise').missing).toEqual([2]);
  });

  it('a summary without the text misses the text first', () => {
    expect(readRequest('summarize this text').missing[0]).toBe(0);
  });

  it('finds what is given', () => {
    const shared = readRequest('a minimalist logo in blue and gold called "Crumb", for our shop sign');
    expect(shared.missing).toEqual([]);
  });
});

describe('subject extraction', () => {
  it.each([
    ['design a logo for my bakery', 'for my bakery'],
    ['write an essay about climate change for my class', 'about climate change'],
    ['make a website for free for my dog grooming salon', 'for my dog grooming salon'],
    ['an information letter intended for the parents of my students', 'for the parents'],
    ['write an email for me', null],
    ['make me a website that pops', null],
  ])('%s → %s', (request, expected) => {
    expect(extractSubject(request)).toBe(expected);
  });

  it('never returns contact details or blocked words', () => {
    expect(extractSubject('a poster for jane@doe.com')).toBe('for [contact details hidden]');
    expect(extractSubject('a poem about murder')).toBeNull();
  });
});

describe('writing-style remarks', () => {
  it('spots shouting and exclamation marks', () => {
    const shared = readRequest('WRITE ME A POEM NOW!!!');
    expect(shared.remarks.map((r) => r.code)).toEqual(expect.arrayContaining(['SHOUTING', 'EXCLAMATIONS']));
    expect(shared.remarks.find((r) => r.code === 'EXCLAMATIONS')?.n).toBe(3);
  });

  it('spots a foreign language and says which one', () => {
    const shared = readRequest('fais moi un site web pour ma boulangerie');
    expect(shared.remarks[0]).toEqual({ code: 'LANGUAGE', n: 0 });
  });

  it('tells politeness from a dry order', () => {
    expect(remarks('could you please write an email to my landlord')).toContain('POLITENESS');
    expect(remarks('write an email')).toContain('CURT');
    expect(remarks('write an email')).not.toContain('POLITENESS');
  });

  it('spots text-speak, urgency, flattery, rudeness and emoji', () => {
    expect(remarks('pls make a logo')).toContain('SMS');
    expect(remarks('I need a plan asap')).toContain('URGENCY');
    expect(remarks('you are the best, write a poem')).toContain('FLATTERY');
    expect(remarks('write a poem, you useless machine')).toContain('RUDENESS');
    expect(remarks('make a logo 🔥🔥')).toContain('EMOJI');
  });

  it('says nothing about a plain English request', () => {
    expect(remarks('I am a teacher. Write a short poem for my class about autumn, in a gentle tone.')).toEqual([]);
  });
});
