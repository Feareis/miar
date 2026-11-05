// Lecture approfondie d'une demande : tâche reconnue, sujet, informations manquantes, manière d'écrire.
// Complète les griefs de regles.ts sans toucher à la note : elle sert à personnaliser la lettre.
import { normaliser } from '../filtre';
import { PASSAGE_ENTRE_GUILLEMETS } from '../regles';
import { remarquer, type Remarque } from './remarques';
import { extraireSujet } from './sujet';
import { reconnaitreTaches, type ResultatVerification, type TacheReconnue, verifier } from './taches';

export interface Lecture {
  /** La plus probable d'abord, au plus deux. */
  taches: TacheReconnue[];
  /** Vérifications de la tâche principale, trouvées ou non. */
  verifications: ResultatVerification[];
  /** Indices des vérifications manquantes de la tâche principale. */
  manques: number[];
  sujet: string | null;
  remarques: Remarque[];
  mots: number;
  phrases: number;
}

function compterPhrases(demande: string): number {
  return Math.max(1, demande.split(/[.!?\n]+/).filter((p) => /\p{L}/u.test(p)).length);
}

export function lireDemande(demande: string): Lecture {
  const texte = normaliser(demande);
  const mots = demande.split(/\s+/).filter(Boolean).length;
  const sujet = extraireSujet(demande);
  const taches = reconnaitreTaches(texte);
  const indices = { texte, mots, sujet, citationEntreGuillemets: PASSAGE_ENTRE_GUILLEMETS.test(demande) };
  const verifications = taches.length > 0 ? verifier(taches[0].code, indices) : [];
  return {
    taches,
    verifications,
    manques: verifications.filter((v) => !v.present).map((v) => v.index),
    sujet,
    remarques: remarquer(demande, mots),
    mots,
    phrases: compterPhrases(demande),
  };
}
