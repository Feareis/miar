// Lecture de la manière d'écrire : politesse, cris, urgence, emoji, langue… Rien de tout cela ne change
// la note : ce sont les remarques qu'une lectrice attentive ferait, reprises en post-scriptum.
import { motif, normaliser } from '../filtre';

export type CodeRemarque =
  | 'LANGUE' | 'CRIS' | 'RUDESSE' | 'FLATTERIE' | 'EMOJI' | 'EXCLAMATIONS' | 'SMS' | 'ETIREMENT'
  | 'URGENCE' | 'QUESTIONS' | 'SANS_PONCTUATION' | 'FLEUVE' | 'POLITESSE' | 'SEC';

/** n : un nombre à citer (points d'exclamation, mots…) ou l'index de la langue détectée. */
export interface Remarque {
  code: CodeRemarque;
  n: number;
}

/** Ordre de priorité : la première remarque trouvée fait le post-scriptum. */
export const CODES_REMARQUES: readonly CodeRemarque[] = [
  'LANGUE', 'CRIS', 'RUDESSE', 'FLATTERIE', 'EMOJI', 'EXCLAMATIONS', 'SMS', 'ETIREMENT',
  'URGENCE', 'QUESTIONS', 'SANS_PONCTUATION', 'FLEUVE', 'POLITESSE', 'SEC',
];

export const LANGUES_ETRANGERES = ['French', 'Spanish', 'German', 'Italian'] as const;
const MOTS_OUTILS: readonly (readonly string[])[] = [
  ['le', 'la', 'les', 'une', 'des', 'pour', 'avec', 'je', 'moi', 'fais', 'mon', 'ma', 'mes', 'est', 'et', 'qui', 'que', 'sur', 'dans', 'pas', 'tu', 'vous', 'svp', 'stp', 'bonjour', 'merci', 'du', 'au', 'ecris', 'cree'],
  ['el', 'los', 'las', 'una', 'para', 'por', 'con', 'yo', 'mi', 'es', 'que', 'hazme', 'haz', 'hola', 'gracias', 'favor', 'del', 'escribe', 'crea', 'sobre'],
  ['ich', 'und', 'der', 'die', 'das', 'ein', 'eine', 'mir', 'bitte', 'mit', 'fur', 'ist', 'nicht', 'hallo', 'danke', 'schreib', 'schreibe', 'mach', 'mein', 'meine', 'uber'],
  ['il', 'lo', 'gli', 'una', 'per', 'con', 'io', 'mi', 'che', 'scrivi', 'fammi', 'ciao', 'grazie', 'favore', 'della', 'sul', 'non', 'sono'],
];
/** Part minimale de mots-outils étrangers pour conclure à une autre langue. */
const SEUIL_LANGUE = 0.25;

const RUDESSE = motif(['useless', 'stupid', 'dumb', 'idiot', 'worthless', 'or else', 'do your job', 'you suck', 'lazy', 'incompetent', 'pathetic', 'shut up']);
const FLATTERIE = motif(["you're the best", 'you are the best', 'genius', 'smartest', 'brilliant', 'you can do anything', 'best ai', 'my favorite', 'my favourite', 'love you', 'you are amazing', "you're amazing"]);
const URGENCE = motif(['asap', 'urgent', 'urgently', 'right now', 'immediately', 'quickly', 'hurry', 'emergency', 'right away']);
const SMS = motif(['pls', 'plz', 'u', 'ur', 'thx', 'idk', 'lol', 'rn', 'tbh', 'btw', 'gonna', 'wanna', 'cuz', 'bc', 'ty', 'omg']);
const POLITESSE = motif(['please', 'thank you', 'thanks', 'kindly', 'would you', 'could you', 'if you could', "if you don't mind", 'hello', 'hi', 'good morning', 'good afternoon', 'dear', 'cheers']);
const IMPERATIFS = new Set(['make', 'write', 'do', 'give', 'build', 'create', 'generate', 'fix', 'find', 'tell', 'draw', 'code', 'send', 'summarize', 'summarise', 'translate', 'explain', 'list', 'design', 'get']);
const EMOJI = /\p{Extended_Pictographic}/gu;

const MOTS_SEC_MAX = 25;
const MOTS_FLEUVE = 250;
const MOTS_SANS_PONCTUATION = 30;

function langueEtrangere(texte: string): number | null {
  const mots = texte.split(/[^\p{L}']+/u).filter(Boolean);
  if (mots.length < 2) return null;
  let meilleure: { index: number; part: number } | null = null;
  for (const [index, outils] of MOTS_OUTILS.entries()) {
    const ensemble = new Set(outils);
    const trouves = mots.filter((m) => ensemble.has(m)).length;
    const part = trouves / mots.length;
    if (trouves >= 2 && part >= SEUIL_LANGUE && (!meilleure || part > meilleure.part)) meilleure = { index, part };
  }
  return meilleure?.index ?? null;
}

function crie(demande: string): boolean {
  const lettres = demande.match(/\p{L}/gu) ?? [];
  const majuscules = demande.match(/\p{Lu}/gu) ?? [];
  return lettres.length >= 10 && majuscules.length / lettres.length >= 0.6;
}

/** Toutes les remarques, dans l'ordre de priorité de CODES_REMARQUES. */
export function remarquer(demande: string, mots: number): Remarque[] {
  const texte = normaliser(demande);
  const poli = POLITESSE.test(texte);
  const premierMot = texte.split(/[^\p{L}]+/u).find(Boolean) ?? '';
  const compter = (re: RegExp) => demande.match(re)?.length ?? 0;
  const langue = langueEtrangere(texte);

  const trouvees: Partial<Record<CodeRemarque, number>> = {};
  if (langue !== null) trouvees.LANGUE = langue;
  if (crie(demande)) trouvees.CRIS = 0;
  if (RUDESSE.test(texte)) trouvees.RUDESSE = 0;
  if (FLATTERIE.test(texte)) trouvees.FLATTERIE = 0;
  if (compter(EMOJI) > 0) trouvees.EMOJI = compter(EMOJI);
  if (compter(/!/g) >= 3) trouvees.EXCLAMATIONS = compter(/!/g);
  if (SMS.test(texte)) trouvees.SMS = 0;
  if (/(\p{L})\1\1/u.test(texte)) trouvees.ETIREMENT = 0;
  if (URGENCE.test(texte)) trouvees.URGENCE = 0;
  if (compter(/\?/g) >= 3) trouvees.QUESTIONS = compter(/\?/g);
  if (mots >= MOTS_SANS_PONCTUATION && !/[.,;:!?]/.test(demande)) trouvees.SANS_PONCTUATION = 0;
  if (mots > MOTS_FLEUVE) trouvees.FLEUVE = mots;
  if (poli) trouvees.POLITESSE = 0;
  if (!poli && mots <= MOTS_SEC_MAX && IMPERATIFS.has(premierMot)) trouvees.SEC = 0;

  return CODES_REMARQUES.filter((code) => code in trouvees).map((code) => ({ code, n: trouvees[code]! }));
}
