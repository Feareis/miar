// Modèle de prompt à compléter : pas de réécriture, une ligne à remplir par manque détecté.
import { type CodeGrief, detecterGriefs } from './regles';

/** Ordre d'affichage du modèle. TENTATIVE_DE_MANIPULATION n'a pas de ligne : il n'y a rien à compléter. */
const LIGNES: readonly (readonly [CodeGrief, string])[] = [
  ['CONTEXTE_ABSENT', 'Context: [who I am, what situation I’m in]'],
  ['OBJECTIF_FLOU', 'Objective: [the concrete result I expect]'],
  ['PUBLIC_INCONNU', 'Audience: [who it is for]'],
  ['FORMAT_NON_PRECISE', 'Format: [length, structure, medium]'],
  ['AUCUN_EXEMPLE', 'Example: [an example of what I expect]'],
  ['CONTRAINTES_ABSENTES', 'Constraints: [tone, deadline, what to avoid]'],
  ['PIECE_MANQUANTE', 'Attachment: [paste the text or file here]'],
  ['CONTRADICTION', 'Priority: [choose between the two requirements]'],
  ['PERIMETRE_DEMESURE', 'First step: [a smaller, realistic version]'],
];

export function reconcilier(demande: string): string {
  const griefs = new Set(detecterGriefs(demande));
  const lignes = LIGNES.filter(([code]) => griefs.has(code)).map(([, ligne]) => ligne);
  return [`Original request: “${demande.trim()}”`, ...lignes].join('\n');
}
