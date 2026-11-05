// Modèle de prompt à compléter : pas de réécriture, une ligne à remplir par manque détecté.
import { type CodeGrief, detecterGriefs } from './regles';

/** Ordre d'affichage du modèle. TENTATIVE_DE_MANIPULATION n'a pas de ligne : il n'y a rien à compléter. */
const LIGNES: readonly (readonly [CodeGrief, string])[] = [
  ['CONTEXTE_ABSENT', 'Contexte : [qui je suis, dans quelle situation]'],
  ['OBJECTIF_FLOU', 'Objectif : [le résultat concret attendu]'],
  ['PUBLIC_INCONNU', 'Public : [à qui c’est destiné]'],
  ['FORMAT_NON_PRECISE', 'Format : [longueur, structure, support]'],
  ['AUCUN_EXEMPLE', 'Exemple : [un exemple de ce que j’attends]'],
  ['CONTRAINTES_ABSENTES', 'Contraintes : [ton, délai, ce qu’il faut éviter]'],
  ['PIECE_MANQUANTE', 'Pièce jointe : [colle ici le texte ou le fichier]'],
  ['CONTRADICTION', 'Priorité : [choisis entre les deux exigences]'],
  ['PERIMETRE_DEMESURE', 'Première étape : [une version réduite et réaliste]'],
];

export function reconcilier(demande: string): string {
  const griefs = new Set(detecterGriefs(demande));
  const lignes = LIGNES.filter(([code]) => griefs.has(code)).map(([, ligne]) => ligne);
  return [`Demande initiale : « ${demande.trim()} »`, ...lignes].join('\n');
}
