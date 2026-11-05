import { describe, expect, it } from 'vitest';
import { lireDemande } from './lecture';
import { extraireSujet } from './sujet';
import { nomDeTache } from './taches';

const codes = (demande: string) => lireDemande(demande).taches.map((t) => t.code);
const remarques = (demande: string) => lireDemande(demande).remarques.map((r) => r.code);

describe('task recognition', () => {
  it.each([
    ['make me a website that pops, you know the vibe', 'SITE'],
    ['design a logo for my bakery', 'VISUEL'],
    ['write an email to my boss to ask for a raise', 'EMAIL'],
    ['summarize this text', 'RESUME'],
    ['build me a Facebook but better by tomorrow', 'APPLI'],
    ['translate this into Spanish', 'TRADUCTION'],
    ['write a poem about the sea', 'CREATIF'],
    ['write a cover letter for a marketing internship', 'CANDIDATURE'],
    ['explain quantum computing like I’m 5', 'EXPLICATION'],
    ['python function that returns the sum of a list', 'CODE'],
    ['give me a name for my podcast', 'NOM'],
    ['write a LinkedIn post about our launch', 'POST'],
    ['write a blog post about remote work', 'ARTICLE'],
    ['make slides for my meeting', 'PRESENTATION'],
    ['a 4-week workout plan', 'PLAN'],
  ])('%s → %s', (demande, attendu) => {
    expect(codes(demande)[0]).toBe(attendu);
  });

  it('names the task with the very word of the request, when it can', () => {
    const nom = (demande: string) => {
      const [t] = lireDemande(demande).taches;
      return nomDeTache(t.code, t.terme);
    };
    expect(nom('design a logo for my bakery')).toBe('a logo');
    expect(nom('write an essay about bees')).toBe('an essay');
    expect(nom('fix my CV')).toBe('a CV');
    expect(nom('summarize this text')).toBe('a summary');
    expect(nom('build me a Facebook but better')).toBe('an app');
  });

  it('recognises nothing in a request without a task', () => {
    expect(codes('hello there')).toEqual([]);
  });

  it('keeps a second task when two are asked at once', () => {
    expect(codes('make me a website and a logo')).toEqual(['SITE', 'VISUEL']);
  });
});

describe('missing information', () => {
  it('a bare logo request misses name, colours, style and use', () => {
    expect(lireDemande('design a logo for my bakery').manques).toEqual([0, 1, 2, 3]);
  });

  it('an email with recipient and purpose only misses the tone', () => {
    expect(lireDemande('write an email to my boss to ask for a raise').manques).toEqual([2]);
  });

  it('a summary without the text misses the text first', () => {
    expect(lireDemande('summarize this text').manques[0]).toBe(0);
  });

  it('finds what is given', () => {
    const lu = lireDemande('a minimalist logo in blue and gold called "Crumb", for our shop sign');
    expect(lu.manques).toEqual([]);
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
  ])('%s → %s', (demande, attendu) => {
    expect(extraireSujet(demande)).toBe(attendu);
  });

  it('never returns contact details or blocked words', () => {
    expect(extraireSujet('a poster for jane@doe.com')).toBe('for [contact details hidden]');
    expect(extraireSujet('a poem about murder')).toBeNull();
  });
});

describe('writing-style remarks', () => {
  it('spots shouting and exclamation marks', () => {
    const lu = lireDemande('WRITE ME A POEM NOW!!!');
    expect(lu.remarques.map((r) => r.code)).toEqual(expect.arrayContaining(['CRIS', 'EXCLAMATIONS']));
    expect(lu.remarques.find((r) => r.code === 'EXCLAMATIONS')?.n).toBe(3);
  });

  it('spots a foreign language and says which one', () => {
    const lu = lireDemande('fais moi un site web pour ma boulangerie');
    expect(lu.remarques[0]).toEqual({ code: 'LANGUE', n: 0 });
  });

  it('tells politeness from a dry order', () => {
    expect(remarques('could you please write an email to my landlord')).toContain('POLITESSE');
    expect(remarques('write an email')).toContain('SEC');
    expect(remarques('write an email')).not.toContain('POLITESSE');
  });

  it('spots text-speak, urgency, flattery, rudeness and emoji', () => {
    expect(remarques('pls make a logo')).toContain('SMS');
    expect(remarques('I need a plan asap')).toContain('URGENCE');
    expect(remarques('you are the best, write a poem')).toContain('FLATTERIE');
    expect(remarques('write a poem, you useless machine')).toContain('RUDESSE');
    expect(remarques('make a logo 🔥🔥')).toContain('EMOJI');
  });

  it('says nothing about a plain English request', () => {
    expect(remarques('I am a teacher. Write a short poem for my class about autumn, in a gentle tone.')).toEqual([]);
  });
});
