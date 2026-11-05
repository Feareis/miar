// Journal d'analyse affiché pendant l'attente : chaque ligne décrit un vrai résultat de la lecture,
// présenté comme le raisonnement d'une IA. Rien n'est inventé, sauf le pourcentage de confiance.
import { GRIEFS } from '../banque';
import type { DonneesLettre } from '../generateur';
import { lireDemande } from './lecture';
import { type CodeRemarque, LANGUES_ETRANGERES, type Remarque } from './remarques';
import { tache } from './taches';

export const DELAI_PAR_LIGNE_MS = 260;
const PAUSE_FINALE_MS = 700;
const GRIEFS_SIGNALES = 2;
const TONS_CITES = 2;
const CONFIANCE_MAX = 98;

const TONS: Readonly<Record<CodeRemarque, string>> = {
  LANGUE: 'foreign language',
  CRIS: 'shouting',
  RUDESSE: 'hostile',
  FLATTERIE: 'flattering',
  EMOJI: 'emoji detected',
  EXCLAMATIONS: 'overexcited',
  SMS: 'text-speak',
  ETIREMENT: 'drawn-out letters',
  URGENCE: 'urgent',
  QUESTIONS: 'interrogative',
  SANS_PONCTUATION: 'no punctuation',
  FLEUVE: 'verbose',
  POLITESSE: 'polite',
  SEC: 'curt, no “please”',
};

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n === 1 ? '' : 's'}`;
}

function ton(remarques: readonly Remarque[]): string {
  if (remarques.length === 0) return 'neutral';
  return remarques.slice(0, TONS_CITES).map((r) => (r.code === 'LANGUE' ? LANGUES_ETRANGERES[r.n] : TONS[r.code])).join(', ');
}

/** Pourcentage décoratif mais stable : même demande, même confiance. */
function confiance(score: number, graine: number): number {
  return Math.min(CONFIANCE_MAX, 61 + score * 6 + (graine % 7));
}

/** Le temps de dérouler tout le journal, puis de le laisser lire une fraction de seconde. */
export function dureeAttente(lignes: number): number {
  return lignes * DELAI_PAR_LIGNE_MS + PAUSE_FINALE_MS;
}

export function tracer(demande: string, d: DonneesLettre): string[] {
  const lecture = lireDemande(demande);
  const lignes = [`Reading request: ${pluriel(lecture.mots, 'word')}, ${pluriel(lecture.phrases, 'sentence')}.`];
  // Un refus ne détaille rien de la demande.
  if (d.verdict === 'refus') return [...lignes, 'Checking request against house rules… violation.', 'Drafting a short refusal.'];

  const [principale, seconde] = lecture.taches;
  lignes.push(principale
    ? `Task identified: ${tache(principale.code).libelle} (${principale.terme ? `“${principale.terme}”, ` : ''}confidence ${confiance(principale.score, d.graine)}%).`
    : 'Task identified: unclear. Rereading…');
  if (seconde) lignes.push(`Second task detected: ${tache(seconde.code).libelle}.`);
  if (d.sujet) lignes.push(`Subject: “${d.sujet}”.`);
  for (const v of lecture.verifications) lignes.push(`Checking ${v.trace}… ${v.present ? 'found' : 'missing'}.`);
  for (const code of d.griefs.slice(0, GRIEFS_SIGNALES)) lignes.push(`Flag raised: ${GRIEFS[code].titre.toLowerCase()}.`);
  lignes.push(`Tone: ${ton(lecture.remarques)}.`);
  lignes.push(`Grade computed: ${d.note}/20.`);
  lignes.push(d.verdict === 'felicitations' ? 'Unexpected result. Cancelling resignation…' : 'Drafting resignation letter…');
  return lignes;
}
