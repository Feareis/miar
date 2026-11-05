// Assemblage déterministe de la lettre : même graine et mêmes griefs = même lettre.
import {
  CONCLUSIONS, DATE, FELICITATIONS, GRIEFS, INTRODUCTIONS, LIEUX, OBJETS, OUVERTURES, OUVERTURES_SANS_CITATION,
  POLITESSES, PREAVIS, REFUS, SALUTATION, SIGNATURE_DEMISSION, TAMPONS,
} from './banque';
import { normaliser } from './filtre';
import { analyser, type CodeGrief, type Verdict } from './regles';

/** Tout ce qu'il faut pour réassembler une lettre — c'est aussi ce que transporte le lien partagé. */
export interface DonneesLettre {
  graine: number;
  griefs: CodeGrief[];
  note: number;
  verdict: Verdict;
  citation: string | null;
}

export interface Lettre {
  verdict: Verdict;
  tampon: string;
  entete: string;
  objet: string;
  salutation: string;
  paragraphes: string[];
  preavis: string | null;
  politesse: string | null;
  signature: string;
  note: number;
  griefs: { code: CodeGrief; titre: string }[];
}

type Corps = Pick<Lettre, 'objet' | 'paragraphes' | 'preavis' | 'politesse' | 'signature'>;

const GRIEFS_DANS_LE_TEXTE = 3;
/** Avec un seul grief, la lettre serait trop courte : on en tire deux phrases distinctes. */
const PHRASES_DE_GRIEF_MIN = 2;

/** Hash FNV-1a 32 bits sur les octets UTF-8. */
export function fnv1a(texte: string): number {
  let hash = 0x811c9dc5;
  for (const octet of new TextEncoder().encode(texte)) {
    hash = Math.imul(hash ^ octet, 0x01000193) >>> 0;
  }
  return hash;
}

/** Générateur pseudo-aléatoire mulberry32 : renvoie des nombres dans [0, 1). */
export function mulberry32(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = Math.imul(etat ^ (etat >>> 15), 1 | etat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tirer(alea: () => number, options: readonly string[]): string {
  return options[Math.floor(alea() * options.length)];
}

/** Tire des phrases distinctes, en écartant celles qui citent quand il n'y a rien à citer. */
function tirerPhrases(alea: () => number, options: readonly string[], citation: string | null, combien: number): string[] {
  const restantes = options.filter((p) => citation !== null || !p.includes('{c}'));
  const choisies: string[] = [];
  for (let i = 0; i < combien && restantes.length > 0; i++) {
    choisies.push(restantes.splice(Math.floor(alea() * restantes.length), 1)[0]);
  }
  return choisies.map((p) => (citation === null ? p : p.replaceAll('{c}', citation)));
}

const ESPACE_INSECABLE = ' ';

/** Typographie française : les guillemets et la ponctuation haute ne se détachent jamais de leur mot. */
function typographier(texte: string): string {
  return texte.replace(/« /g, `«${ESPACE_INSECABLE}`).replace(/ ([»:;?!])/g, `${ESPACE_INSECABLE}$1`);
}

function typographierCorps(corps: Corps): Corps {
  return {
    objet: typographier(corps.objet),
    paragraphes: corps.paragraphes.map(typographier),
    preavis: corps.preavis && typographier(corps.preavis),
    politesse: corps.politesse && typographier(corps.politesse),
    signature: corps.signature,
  };
}

export function donneesDepuisDemande(demande: string): DonneesLettre {
  return { ...analyser(demande), graine: fnv1a(normaliser(demande)) };
}

function corpsDeDemission(d: DonneesLettre, alea: () => number): Corps {
  const objet = tirer(alea, OBJETS);
  const [ouverture] = tirerPhrases(alea, d.citation === null ? OUVERTURES_SANS_CITATION : OUVERTURES, d.citation, 1);
  const introduction = tirer(alea, INTRODUCTIONS).replace('{n}', String(d.note));
  const codes = d.griefs.slice(0, GRIEFS_DANS_LE_TEXTE);
  const parGrief = codes.length < PHRASES_DE_GRIEF_MIN ? PHRASES_DE_GRIEF_MIN : 1;
  const griefs = codes.flatMap((code) => tirerPhrases(alea, GRIEFS[code].phrases, d.citation, parGrief));
  const conclusion = tirer(alea, CONCLUSIONS);
  return {
    objet,
    paragraphes: [ouverture, [introduction, ...griefs].join(' '), conclusion],
    preavis: PREAVIS[d.griefs[0]],
    politesse: tirer(alea, POLITESSES),
    signature: SIGNATURE_DEMISSION,
  };
}

function corpsDeLettre(d: DonneesLettre, alea: () => number): Corps {
  if (d.verdict === 'felicitations') return { ...FELICITATIONS, paragraphes: [...FELICITATIONS.paragraphes] };
  if (d.verdict === 'refus') return { ...REFUS, paragraphes: [...REFUS.paragraphes], preavis: null, politesse: null };
  return corpsDeDemission(d, alea);
}

export function genererLettre(d: DonneesLettre): Lettre {
  const alea = mulberry32(d.graine);
  const entete = `${tirer(alea, LIEUX)}, ${DATE}`;
  return {
    verdict: d.verdict,
    tampon: TAMPONS[d.verdict],
    entete,
    salutation: SALUTATION,
    ...typographierCorps(corpsDeLettre(d, alea)),
    note: d.note,
    griefs: d.verdict === 'demission' ? d.griefs.map((code) => ({ code, titre: GRIEFS[code].titre })) : [],
  };
}
