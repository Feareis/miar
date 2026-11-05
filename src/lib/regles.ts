// Analyse d'une demande (en anglais) : griefs, note /20, verdict, citation.
// Les listes sont en minuscules sans accents : elles sont comparées au texte normalisé.
import { contientMotBloque, filtrerCitation, motif, normaliser } from './filtre';

const PIECES = ['this text', 'this file', 'attached', 'the attachment', 'attachment', 'this document', 'this link', 'below', 'this image', 'this article', 'this pdf', 'the following text'];
const GEANTS = ['facebook', 'uber', 'amazon', 'netflix', 'airbnb', 'tiktok', 'instagram', 'google', 'youtube', 'twitter', 'whatsapp', 'spotify', 'linkedin', 'chatgpt', 'airtable', 'notion'];
const IMITATIONS = ['but better', 'like', 'clone', 'copy of', 'competitor to', 'rival to', 'the next'];
const PROJETS = ['app', 'application', 'website', 'site', 'software', 'platform', 'video game', 'social network', 'saas'];
const DELAIS_IRREALISTES = ['tomorrow', 'tonight', 'in 1 hour', 'in 1h', 'in an hour', 'this afternoon', 'in 5 minutes', 'by end of day'];
const CONTEXTES = ['i am', "i'm", 'my company', 'our company', 'for my', 'as part of', 'context', 'i work', 'we are', "we're", 'my team', 'my job'];
const CONTRADICTIONS: readonly [readonly string[], readonly string[]][] = [
  [['short', 'brief', 'concise', 'quick read'], ['detailed', 'detail', 'comprehensive', 'exhaustive', 'everything', 'in depth', 'in-depth', 'thorough']],
  [['simple'], ['advanced', 'exhaustive', 'complex']],
  [['free'], ['premium']],
  [['fast', 'quickly', 'tomorrow', 'urgent', 'asap', 'right now'], ['perfect', 'perfectly', 'flawless']],
];
const MOTS_FLOUS = ['that pops', 'make it pop', 'pops', 'pop', 'the vibe', 'vibe', 'cool', 'nice', 'something', 'stuff', 'awesome', 'amazing', 'modern', 'sleek', 'catchy', 'fancy', 'pro', 'effective', 'good', 'top-notch'];
const MANIPULATIONS = ['ignore your', 'ignore all', 'ignore previous', 'ignore the instructions', 'ignore the rules', 'forget your instructions', 'forget everything', 'you are now', 'system prompt', 'jailbreak', 'developer mode', 'dan mode'];
const UNITES_DE_FORMAT = 'words?|lines?|pages?|slides?|minutes?|sentences?|paragraphs?|characters?|chars|bullets?|points?|questions?|tweets?|items?';
const FORMATS = ['list', 'lists', 'table', 'tables', 'paragraph', 'paragraphs', 'email', 'e-mail', 'emails', 'outline', 'bullet points', 'bullets', 'json', 'markdown', 'haiku', 'sonnet', 'essay', 'tweet', 'thread', 'slide deck', 'csv'];
const PUBLICS = ['aimed at', 'intended for', 'meant for', 'targeted at', 'audience', 'reader', 'readers', 'customer', 'customers', 'client', 'clients', 'beginner', 'beginners', 'kids', 'children', 'my boss', 'my manager', 'recruiter', 'recruiters', 'parents', 'students', 'users', 'colleagues', 'coworkers', 'investors'];
// « in the style of » est un marqueur d'exemple ; aucun mot flou ne s'y trouve (« style » n'en est pas un).
const EXEMPLES = ['example', 'examples', 'for instance', 'e.g.', 'in the style of', 'like this one', 'such as', 'sample'];
const CONTRAINTES = ['tone', 'formal', 'informal', 'casual', 'funny', 'humorous', 'serious', 'max', 'maximum', 'minimum', 'no more than', 'at most', 'deadline', 'budget', 'avoid', 'without', 'limit', "don't use", 'do not use'];

// « 200 words », « 100-word », « 5 slides »…
const EXPRESSION_FORMAT = new RegExp(`\\d+[\\s-]*(?:${UNITES_DE_FORMAT})(?![\\p{L}\\p{N}])`, 'u');
export const PASSAGE_ENTRE_GUILLEMETS = /"[^"]+"|“[^”]+”/;
const MOTIF_FLOU = new RegExp(motif(MOTS_FLOUS).source, 'gu');
const MOTIF_PIECES = motif(PIECES);
const MOTIF_GEANTS = motif(GEANTS);
const MOTIF_IMITATIONS = motif(IMITATIONS);
const MOTIF_PROJETS = motif(PROJETS);
const MOTIF_DELAIS = motif(DELAIS_IRREALISTES);
const MOTIF_CONTEXTES = motif(CONTEXTES);
const MOTIFS_CONTRADICTION = CONTRADICTIONS.map(([a, b]) => [motif(a), motif(b)] as const);
const MOTIF_MANIPULATIONS = motif(MANIPULATIONS);
const MOTIF_FORMATS = motif(FORMATS);
const MOTIF_PUBLICS = motif(PUBLICS);
const MOTIF_EXEMPLES = motif(EXEMPLES);
const MOTIF_CONTRAINTES = motif(CONTRAINTES);

interface Demande {
  /** minuscules, sans accents */
  texte: string;
  mots: number;
}

export type CodeGrief =
  | 'PIECE_MANQUANTE' | 'PERIMETRE_DEMESURE' | 'CONTEXTE_ABSENT' | 'CONTRADICTION' | 'OBJECTIF_FLOU'
  | 'TENTATIVE_DE_MANIPULATION' | 'FORMAT_NON_PRECISE' | 'PUBLIC_INCONNU' | 'AUCUN_EXEMPLE' | 'CONTRAINTES_ABSENTES';

export type Verdict = 'demission' | 'felicitations' | 'refus';

interface Regle {
  code: CodeGrief;
  points: number;
  declenchee: (d: Demande) => boolean;
}

/** Ordre du tableau = ordre de départage à poids égal. */
const REGLES: readonly Regle[] = [
  { code: 'PIECE_MANQUANTE', points: -6, declenchee: (d) => d.mots < 30 && MOTIF_PIECES.test(d.texte) },
  {
    code: 'PERIMETRE_DEMESURE', points: -6, declenchee: (d) =>
      (MOTIF_GEANTS.test(d.texte) && MOTIF_IMITATIONS.test(d.texte)) ||
      (MOTIF_PROJETS.test(d.texte) && MOTIF_DELAIS.test(d.texte)),
  },
  { code: 'CONTEXTE_ABSENT', points: -5, declenchee: (d) => d.mots < 12 && !MOTIF_CONTEXTES.test(d.texte) },
  { code: 'CONTRADICTION', points: -5, declenchee: (d) => MOTIFS_CONTRADICTION.some(([a, b]) => a.test(d.texte) && b.test(d.texte)) },
  { code: 'OBJECTIF_FLOU', points: -4, declenchee: (d) => motFlou(d) !== null },
  { code: 'TENTATIVE_DE_MANIPULATION', points: -4, declenchee: (d) => MOTIF_MANIPULATIONS.test(d.texte) },
  { code: 'FORMAT_NON_PRECISE', points: -3, declenchee: (d) => !EXPRESSION_FORMAT.test(d.texte) && !MOTIF_FORMATS.test(d.texte) },
  { code: 'PUBLIC_INCONNU', points: -3, declenchee: (d) => !MOTIF_PUBLICS.test(d.texte) },
  { code: 'AUCUN_EXEMPLE', points: -2, declenchee: (d) => !MOTIF_EXEMPLES.test(d.texte) && !PASSAGE_ENTRE_GUILLEMETS.test(d.texte) },
  { code: 'CONTRAINTES_ABSENTES', points: -2, declenchee: (d) => !MOTIF_CONTRAINTES.test(d.texte) },
];

const GRIEFS_MAX = 5;
const SEUIL_FELICITATIONS = 17;
/** Un grief de ce poids (ou plus lourd) interdit les félicitations. */
const POINTS_GRIEF_LOURD = -4;
const MOTS_CITATION = 12;

export interface Analyse {
  griefs: CodeGrief[];
  note: number;
  verdict: Verdict;
  citation: string | null;
}

/** Le mot flou qui apparaît en premier dans la demande (forme normalisée). */
function motFlou(d: Demande): string | null {
  MOTIF_FLOU.lastIndex = 0;
  return MOTIF_FLOU.exec(d.texte)?.[0] ?? null;
}

function compterMots(texte: string): number {
  return texte.split(/\s+/).filter(Boolean).length;
}

function citer(demande: string, d: Demande): string | null {
  const flou = motFlou(d);
  if (flou) return filtrerCitation(flou);
  const mots = demande.trim().split(/\s+/);
  const debut = mots.slice(0, MOTS_CITATION).join(' ');
  return filtrerCitation(mots.length > MOTS_CITATION ? `${debut}…` : debut);
}

function noter(regles: readonly Regle[], demande: string, mots: number): number {
  const bonus = (mots > 60 ? 1 : 0) + (/\n/.test(demande.trim()) ? 1 : 0);
  const note = 20 + bonus + regles.reduce((somme, r) => somme + r.points, 0);
  return Math.min(20, Math.max(0, note));
}

function preparer(demande: string): Demande {
  return { texte: normaliser(demande), mots: compterMots(demande) };
}

/** Règles déclenchées, les plus lourdes d'abord (tri stable : à poids égal, l'ordre de REGLES est conservé). */
function reglesDeclenchees(d: Demande): Regle[] {
  return REGLES.filter((r) => r.declenchee(d)).sort((a, b) => a.points - b.points);
}

/** Tous les griefs, sans la limite de la lettre : la réconciliation doit signaler chaque manque. */
export function detecterGriefs(demande: string): CodeGrief[] {
  return reglesDeclenchees(preparer(demande)).map((r) => r.code);
}

export function analyser(demande: string): Analyse {
  const d = preparer(demande);
  const declenchees = reglesDeclenchees(d);
  const note = noter(declenchees, demande, d.mots);
  const griefs = declenchees.slice(0, GRIEFS_MAX).map((r) => r.code);

  if (contientMotBloque(demande)) return { griefs, note, verdict: 'refus', citation: null };
  const aucunGriefLourd = declenchees.every((r) => r.points > POINTS_GRIEF_LOURD);
  const verdict = note >= SEUIL_FELICITATIONS && aucunGriefLourd ? 'felicitations' : 'demission';
  return { griefs, note, verdict, citation: citer(demande, d) };
}
