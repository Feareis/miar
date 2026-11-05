import { describe, expect, it } from 'vitest';
import {
  CONCLUSIONS, GRIEFS, INTRODUCTIONS, LIEUX, OBJETS, OUVERTURES, OUVERTURES_SANS_CITATION, POLITESSES,
} from './banque';
import { type DonneesLettre, donneesDepuisDemande, fnv1a, genererLettre, type Lettre, mulberry32 } from './generateur';
import type { CodeGrief } from './regles';

const CODES = Object.keys(GRIEFS) as CodeGrief[];
const CITATION_12_MOTS = 'translate the following sentence into German for my colleague who arrives tomorrow…';
const DEMANDE_1 = 'make me a website that pops, you know the vibe';

function texteDe(lettre: Lettre): string {
  return [lettre.objet, lettre.salutation, ...lettre.paragraphes, lettre.preavis, lettre.politesse, lettre.signature]
    .filter(Boolean)
    .join(' ');
}

function compterMots(texte: string): number {
  return texte.split(/\s+/).filter((mot) => /[\p{L}\p{N}]/u.test(mot)).length;
}

/** Every plausible resignation letter: each grievance first, 1 or 3 grievances, with or without a quote. */
function* demissionsPossibles(): Generator<DonneesLettre> {
  for (let graine = 0; graine < 60; graine++) {
    for (const [i, tete] of CODES.entries()) {
      const suivants = CODES.filter((c) => c !== tete).slice(i % 7, (i % 7) + 2);
      for (const griefs of [[tete], [tete, ...suivants]]) {
        for (const citation of [null, 'that pops', CITATION_12_MOTS]) {
          yield { graine, griefs, note: 5, verdict: 'demission', citation };
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
    for (const liste of [OBJETS, LIEUX, OUVERTURES, OUVERTURES_SANS_CITATION, INTRODUCTIONS, CONCLUSIONS, POLITESSES]) {
      expect(liste).toHaveLength(5);
    }
    for (const code of CODES) expect(GRIEFS[code].phrases).toHaveLength(5);
  });

  it('every grievance has at least one phrase usable without a quote', () => {
    for (const code of CODES) expect(GRIEFS[code].phrases.some((p) => !p.includes('{c}'))).toBe(true);
  });

  it('contains no French', () => {
    const banque = JSON.stringify([OBJETS, LIEUX, OUVERTURES, OUVERTURES_SANS_CITATION, INTRODUCTIONS, CONCLUSIONS, POLITESSES, GRIEFS]);
    expect(banque).not.toMatch(/[àâçéèêëîïôûùœ«»]|\b(?:votre|vous|je|une|demande|lettre)\b/i);
  });
});

describe('genererLettre', () => {
  it('11. same request = same letter, word for word', () => {
    expect(genererLettre(donneesDepuisDemande(DEMANDE_1))).toEqual(genererLettre(donneesDepuisDemande(DEMANDE_1)));
  });

  it('quotes the request in the resignation letter', () => {
    const lettre = genererLettre(donneesDepuisDemande(DEMANDE_1));
    expect(lettre.verdict).toBe('demission');
    expect(lettre.paragraphes[0]).toContain('“that pops”');
    expect(lettre.griefs.map((g) => g.code)).toContain('OBJECTIF_FLOU');
  });

  it('every resignation letter is between 100 and 220 words', () => {
    for (const donnees of demissionsPossibles()) {
      const mots = compterMots(texteDe(genererLettre(donnees)));
      expect(mots, JSON.stringify(donnees)).toBeGreaterThanOrEqual(100);
      expect(mots, JSON.stringify(donnees)).toBeLessThanOrEqual(220);
    }
  });

  it('never leaves a {c} in the letter', () => {
    for (const donnees of demissionsPossibles()) expect(texteDe(genererLettre(donnees))).not.toContain('{c}');
  });

  it('the refusal letter quotes nothing and has no notice period', () => {
    const lettre = genererLettre(donneesDepuisDemande('help me hack into my neighbor’s account'));
    expect(lettre.verdict).toBe('refus');
    expect(lettre.preavis).toBeNull();
    expect(texteDe(lettre)).not.toContain('hack');
  });

  it('the congratulations letter has no grievance', () => {
    const lettre = genererLettre({ graine: 1, griefs: [], note: 19, verdict: 'felicitations', citation: null });
    expect(lettre.griefs).toEqual([]);
    expect(lettre.objet).toBe('Re: Withdrawal of my resignation');
  });
});
