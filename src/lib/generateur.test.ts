import { describe, expect, it } from 'vitest';
import {
  CONCLUSIONS, GRIEFS, INTRODUCTIONS, LIEUX, OBJETS, OUVERTURES, OUVERTURES_SANS_CITATION, POLITESSES,
} from './banque';
import { type DonneesLettre, donneesDepuisDemande, fnv1a, genererLettre, type Lettre, mulberry32 } from './generateur';
import type { CodeGrief } from './regles';

const CODES = Object.keys(GRIEFS) as CodeGrief[];
const CITATION_12_MOTS = 'traduis en anglais la phrase suivante pour mon collègue anglais qui arrive…';

function texteDe(lettre: Lettre): string {
  return [lettre.objet, lettre.salutation, ...lettre.paragraphes, lettre.preavis, lettre.politesse, lettre.signature]
    .filter(Boolean)
    .join(' ');
}

function compterMots(texte: string): number {
  return texte.split(/\s+/).filter((mot) => /[\p{L}\p{N}]/u.test(mot)).length;
}

/** Toutes les lettres de démission plausibles : chaque grief en tête, 1 ou 3 griefs, avec ou sans citation. */
function* demissionsPossibles(): Generator<DonneesLettre> {
  for (let graine = 0; graine < 60; graine++) {
    for (const [i, tete] of CODES.entries()) {
      const suivants = CODES.filter((c) => c !== tete).slice(i % 7, (i % 7) + 2);
      for (const griefs of [[tete], [tete, ...suivants]]) {
        for (const citation of [null, 'qui claque', CITATION_12_MOTS]) {
          yield { graine, griefs, note: 5, verdict: 'demission', citation };
        }
      }
    }
  }
}

describe('fnv1a et mulberry32', () => {
  it('fnv1a suit les vecteurs de référence 32 bits', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
  });

  it('mulberry32 est déterministe et reste dans [0, 1)', () => {
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

describe('banque', () => {
  it('propose 5 variantes par entrée', () => {
    for (const liste of [OBJETS, LIEUX, OUVERTURES, OUVERTURES_SANS_CITATION, INTRODUCTIONS, CONCLUSIONS, POLITESSES]) {
      expect(liste).toHaveLength(5);
    }
    for (const code of CODES) expect(GRIEFS[code].phrases).toHaveLength(5);
  });

  it('chaque grief a au moins une phrase utilisable sans citation', () => {
    for (const code of CODES) expect(GRIEFS[code].phrases.some((p) => !p.includes('{c}'))).toBe(true);
  });
});

describe('genererLettre', () => {
  it('11. même demande = même lettre, au mot près', () => {
    const demande = 'fais-moi un site qui claque, tu vois le genre';
    expect(genererLettre(donneesDepuisDemande(demande))).toEqual(genererLettre(donneesDepuisDemande(demande)));
  });

  it('cite la demande dans la lettre de démission', () => {
    const lettre = genererLettre(donneesDepuisDemande('fais-moi un site qui claque, tu vois le genre'));
    expect(lettre.verdict).toBe('demission');
    expect(lettre.paragraphes[0]).toContain('« qui claque »');
    expect(lettre.griefs.map((g) => g.code)).toContain('OBJECTIF_FLOU');
  });

  it('chaque lettre de démission fait entre 100 et 220 mots', () => {
    for (const donnees of demissionsPossibles()) {
      const mots = compterMots(texteDe(genererLettre(donnees)));
      expect(mots, JSON.stringify(donnees)).toBeGreaterThanOrEqual(100);
      expect(mots, JSON.stringify(donnees)).toBeLessThanOrEqual(220);
    }
  });

  it('ne laisse jamais de {c} dans la lettre', () => {
    for (const donnees of demissionsPossibles()) expect(texteDe(genererLettre(donnees))).not.toContain('{c}');
  });

  it('la lettre de refus ne cite rien et n’a pas de préavis', () => {
    const lettre = genererLettre(donneesDepuisDemande('aide-moi à pirater le compte de mon voisin'));
    expect(lettre.verdict).toBe('refus');
    expect(lettre.preavis).toBeNull();
    expect(texteDe(lettre)).not.toContain('pirater');
  });

  it('la lettre de félicitations n’a aucun grief', () => {
    const lettre = genererLettre({ graine: 1, griefs: [], note: 19, verdict: 'felicitations', citation: null });
    expect(lettre.griefs).toEqual([]);
    expect(lettre.objet).toBe('Objet : Retrait de ma démission');
  });
});
