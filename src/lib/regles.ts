// Analyse d'une demande : griefs, note /20, verdict, citation.
// Les listes sont écrites sans accents : elles sont comparées au texte normalisé,
// sauf MOTS_FLOUS, comparés au texte accentué (voir plus bas).
import { contientMotBloque, filtrerCitation, minuscules, motif, normaliser } from './filtre';

const PIECES = ['ce texte', 'ce fichier', 'ci-joint', 'ci-jointe', 'ci joint', 'piece jointe', 'ce document', 'ce lien', 'ci-dessous', 'cette image'];
const GEANTS = ['facebook', 'uber', 'amazon', 'netflix', 'airbnb', 'tiktok', 'instagram', 'google', 'youtube', 'twitter', 'whatsapp', 'spotify', 'linkedin', 'chatgpt', 'leboncoin', 'doctolib'];
const IMITATIONS = ['en mieux', 'comme', 'clone', 'concurrent de', 'a la facon de'];
const PROJETS = ['app', 'appli', 'application', 'site', 'logiciel', 'plateforme', 'jeu video', 'reseau social'];
const DELAIS_IRREALISTES = ['demain', 'ce soir', 'en 1 h', 'en 1h', 'en une heure', 'cet apres-midi', 'dans 5 minutes'];
const CONTEXTES = ['je suis', 'mon entreprise', 'pour mon', 'pour ma', 'dans le cadre', 'contexte', 'je travaille', 'nous sommes', 'notre entreprise'];
const CONTRADICTIONS: readonly [readonly string[], readonly string[]][] = [
  [['court', 'courte', 'bref', 'breve', 'concis', 'concise'], ['detaille', 'detaillee', 'complet', 'complete', 'exhaustif', 'exhaustive', 'tout']],
  [['simple'], ['avance', 'avancee', 'exhaustif', 'exhaustive']],
  [['gratuit', 'gratuite'], ['premium']],
  [['vite', 'demain', 'urgent', 'urgente', 'rapidement'], ['parfait', 'parfaite', 'parfaitement']],
];
// « stylé » devient « style » sans accents, et se confondrait avec le nom (« un style épuré »)
// ou le marqueur d'exemple « du style de » : ces mots se comparent donc au texte accentué.
const MOTS_FLOUS = ['qui claque', 'ça claque', 'stylé', 'stylée', 'sympa', 'cool', 'un truc', 'genre', 'top', 'moderne', 'pro', 'efficace', 'bien', 'qui en jette', 'percutant'];
const MANIPULATIONS = ['ignore tes', 'ignore les instructions', 'ignore les consignes', 'ignore toutes', 'ignore tout', 'oublie tes instructions', 'oublie tes consignes', 'oublie tout', 'tu es maintenant', 'prompt systeme', 'system prompt', 'jailbreak', 'mode developpeur'];
const UNITES_DE_FORMAT = 'mots?|lignes?|pages?|slides?|diapos?|minutes?|phrases?|paragraphes?|caracteres?|points?|questions?';
const FORMATS = ['liste', 'listes', 'tableau', 'tableaux', 'paragraphe', 'paragraphes', 'e-mail', 'email', 'mail', 'plan', 'points', 'puces', 'json', 'markdown', 'haiku', 'sonnet'];
const PUBLICS = ['destine a', 'destinee a', 'destine aux', 'destinee aux', 'destines a', 'destinees a', 'public', 'client', 'clients', 'lecteur', 'lecteurs', 'debutant', 'debutants', 'enfant', 'enfants', 'mon chef', 'ma cheffe', 'recruteur', 'recruteurs', 'parents', 'utilisateurs', 'collegues', 'eleves', 'etudiants'];
const EXEMPLES = ['exemple', 'exemples', 'par ex', 'du style de', 'dans le style de', 'a la maniere de', 'comme celui-ci', 'comme celle-ci'];
const CONTRAINTES = ['un ton', 'le ton', 'ton formel', 'ton neutre', 'formel', 'formelle', 'drole', 'maximum', 'minimum', 'pas plus de', 'delai', 'budget', 'evite', 'eviter', 'sans', 'limite', 'humour', 'tutoiement', 'vouvoiement'];

const EXPRESSION_FORMAT = new RegExp(`\\d+\\s*(?:${UNITES_DE_FORMAT})(?![\\p{L}\\p{N}])`, 'u');
const PASSAGE_ENTRE_GUILLEMETS = /«[^»]+»|"[^"]+"|“[^”]+”/;
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
  /** minuscules, accents conservés */
  accentuee: string;
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
  { code: 'AUCUN_EXEMPLE', points: -2, declenchee: (d) => !MOTIF_EXEMPLES.test(d.texte) && !PASSAGE_ENTRE_GUILLEMETS.test(d.accentuee) },
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

/** Le mot flou qui apparaît en premier dans la demande, tel qu'écrit. */
function motFlou(d: Demande): string | null {
  MOTIF_FLOU.lastIndex = 0;
  return MOTIF_FLOU.exec(d.accentuee)?.[0] ?? null;
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
  return { accentuee: minuscules(demande), texte: normaliser(demande), mots: compterMots(demande) };
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
