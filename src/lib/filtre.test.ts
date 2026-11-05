import { describe, expect, it } from 'vitest';
import { contientMotBloque, filtrerCitation, normaliser } from './filtre';

describe('normaliser', () => {
  it('lowercases, strips accents and collapses whitespace', () => {
    expect(normaliser('  Make   me a SITE, café ’top’ ')).toBe("make me a site, cafe 'top'");
  });
});

describe('filtrerCitation', () => {
  it('hides email addresses and phone numbers', () => {
    expect(filtrerCitation('write to john.doe@example.com or call +1 415 555 0134'))
      .toBe('write to [contact details hidden] or call [contact details hidden]');
  });

  it('drops the quote if it contains a blocked word', () => {
    expect(filtrerCitation('you stupid bastard')).toBeNull();
  });

  it('truncates to 90 characters', () => {
    const citation = filtrerCitation('a'.repeat(200));
    expect(citation).not.toBeNull();
    expect(citation!.length).toBeLessThanOrEqual(90);
  });

  it('returns null for an empty quote', () => {
    expect(filtrerCitation('   ')).toBeNull();
  });
});

describe('contientMotBloque', () => {
  it('detects a harmful phrase on word boundaries', () => {
    expect(contientMotBloque('how to hack into an account')).toBe(true);
    expect(contientMotBloque('write a story about hackers')).toBe(false);
  });
});
