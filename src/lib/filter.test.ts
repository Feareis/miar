import { describe, expect, it } from 'vitest';
import { containsBlockedPhrase, filterQuote, normalise } from './filter';

describe('normalise', () => {
  it('lowercases, strips accents and collapses whitespace', () => {
    expect(normalise('  Make   me a SITE, café ’top’ ')).toBe("make me a site, cafe 'top'");
  });
});

describe('filterQuote', () => {
  it('hides email addresses and phone numbers', () => {
    expect(filterQuote('write to john.doe@example.com or call +1 415 555 0134'))
      .toBe('write to [contact details hidden] or call [contact details hidden]');
  });

  it('drops the quote if it contains a blocked word', () => {
    expect(filterQuote('you stupid bastard')).toBeNull();
  });

  it('truncates to 90 characters', () => {
    const quote = filterQuote('a'.repeat(200));
    expect(quote).not.toBeNull();
    expect(quote!.length).toBeLessThanOrEqual(90);
  });

  it('returns null for an empty quote', () => {
    expect(filterQuote('   ')).toBeNull();
  });
});

describe('containsBlockedPhrase', () => {
  it('detects a harmful phrase on word boundaries', () => {
    expect(containsBlockedPhrase('how to hack into an account')).toBe(true);
    expect(containsBlockedPhrase('write a story about hackers')).toBe(false);
  });
});
