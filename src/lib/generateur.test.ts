import { describe, expect, it } from 'vitest';
import { CODES_REMARQUES, type Remarque } from './analyse/remarques';
import { type CodeTache, CODES_TACHES, tache } from './analyse/taches';
import {
  ANNONCES_DE_DEUX_TACHES, ANNONCES_DE_TACHE, CONCLUSIONS, CONSTATS_COMPLETS, CONSTATS_DE_MANQUES, FELICITATIONS_AVEC_TACHE,
  GRIEFS, INTRODUCTIONS, LIEUX, OBJETS, OUVERTURES, OUVERTURES_SANS_CITATION, POLITESSES, POST_SCRIPTUM,
} from './banque';
import { type DonneesLettre, donneesDepuisDemande, fnv1a, genererLettre, type Lettre, mulberry32 } from './generateur';
import type { CodeGrief } from './regles';

const CODES = Object.keys(GRIEFS) as CodeGrief[];
const CITATION_12_MOTS = 'translate the following sentence into German for my colleague who arrives tomorrow…';
const DEMANDE_1 = 'make me a website that pops, you know the vibe';

function texteDe(lettre: Lettre): string {
  return [lettre.objet, lettre.salutation, ...lettre.paragraphes, lettre.preavis, lettre.politesse, lettre.signature, lettre.postScriptum]
    .filter(Boolean)
    .join(' ');
}

function compterMots(texte: string): number {
  return texte.split(/\s+/).filter((mot) => /[\p{L}\p{N}]/u.test(mot)).length;
}

const SANS_LECTURE = { taches: [], termes: [], manques: [], sujet: null, remarque: null };
const SUJET_LONG = 'for my grandmother’s dog grooming salon';

/** Task readings to combine: none, one task with every check missing, two tasks with nothing missing. */
function* lecturesPossibles(i: number): Generator<Pick<DonneesLettre, 'taches' | 'termes' | 'manques' | 'sujet' | 'remarque'>> {
  const code: CodeTache = CODES_TACHES[i % CODES_TACHES.length];
  const remarque: Remarque = { code: CODES_REMARQUES[i % CODES_REMARQUES.length], n: 1234 };
  yield SANS_LECTURE;
  // Le terme le plus long, pour éprouver la longueur maximale de la lettre.
  const terme = tache(code).noms.reduce<string | null>((long, t) => (long === null || t.length > long.length ? t : long), null);
  yield { taches: [code], termes: [terme], manques: tache(code).verifications.map((_, j) => j), sujet: SUJET_LONG, remarque };
  yield { taches: [code, CODES_TACHES[(i + 3) % CODES_TACHES.length]], termes: [null, null], manques: [], sujet: null, remarque: null };
}

/** Every plausible resignation letter: each grievance first, 1 or 3 grievances, with or without a quote and a task reading. */
function* demissionsPossibles(): Generator<DonneesLettre> {
  for (let graine = 0; graine < 40; graine++) {
    for (const [i, tete] of CODES.entries()) {
      const suivants = CODES.filter((c) => c !== tete).slice(i % 7, (i % 7) + 2);
      for (const griefs of [[tete], [tete, ...suivants]]) {
        for (const citation of [null, 'that pops', CITATION_12_MOTS]) {
          for (const lecture of lecturesPossibles(graine + i)) {
            yield { graine, griefs, note: 5, verdict: 'demission', citation, ...lecture };
          }
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
    const lectures = CODES_TACHES.map((code) => tache(code));
    const banque = JSON.stringify([
      OBJETS, LIEUX, OUVERTURES, OUVERTURES_SANS_CITATION, INTRODUCTIONS, CONCLUSIONS, POLITESSES, GRIEFS, ANNONCES_DE_TACHE,
      ANNONCES_DE_DEUX_TACHES, CONSTATS_DE_MANQUES, CONSTATS_COMPLETS, FELICITATIONS_AVEC_TACHE, POST_SCRIPTUM,
      lectures.map((t) => [t.nom, t.libelle, t.verifications.map((v) => [v.manque, v.ligne, v.trace])]),
    ]);
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

  it('never leaves a placeholder in the letter', () => {
    for (const donnees of demissionsPossibles()) expect(texteDe(genererLettre(donnees))).not.toMatch(/\{\w+\}/);
  });

  it('shows it understood the task: names it, quotes the subject, lists what is missing', () => {
    const corps = genererLettre(donneesDepuisDemande('design a logo for my bakery')).paragraphes.join(' ');
    expect(corps).toContain('a logo for your bakery');
    expect(corps).toContain('what name or text goes on it, which colours to use or which style you like');
  });

  it('adds a postscript about the way the request was written', () => {
    expect(genererLettre(donneesDepuisDemande('WRITE ME A POEM NOW!!!')).postScriptum).toMatch(/^P\.S\. .*(capitals|shout)/);
    expect(genererLettre(donneesDepuisDemande('fais moi un site web')).postScriptum).toContain('French');
  });

  it('personalises the congratulations letter with the task, without a postscript', () => {
    const prof = 'I am a teacher. Write an email intended for the parents of my students, 200 words maximum, in a warm tone. For example: "Dear parents". Avoid jargon. Thanks!';
    const lettre = genererLettre({ ...donneesDepuisDemande(prof), verdict: 'felicitations', griefs: [] });
    expect(lettre.paragraphes[1]).toContain('You asked for an email for the parents.');
    expect(lettre.postScriptum).toBeNull();
  });

  it('the refusal letter quotes nothing and has no notice period', () => {
    const lettre = genererLettre(donneesDepuisDemande('help me hack into my neighbor’s account'));
    expect(lettre.verdict).toBe('refus');
    expect(lettre.preavis).toBeNull();
    expect(texteDe(lettre)).not.toContain('hack');
  });

  it('the congratulations letter has no grievance', () => {
    const lettre = genererLettre({ graine: 1, griefs: [], note: 19, verdict: 'felicitations', citation: null, ...SANS_LECTURE });
    expect(lettre.griefs).toEqual([]);
    expect(lettre.objet).toBe('Re: Withdrawal of my resignation');
  });
});
