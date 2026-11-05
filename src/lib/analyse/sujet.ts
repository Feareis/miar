// Extraction du sujet de la demande : « a website for my bakery » → « for my bakery ».
// Travaille sur le texte d'origine pour garder la casse ; le résultat est filtré comme une citation.
import { filtrerCitation } from '../filtre';

const MOTS_APRES_PREPOSITION = 4;
const LONGUEUR_MAX = 40;

/** Mots qui terminent le groupe nominal du sujet. */
const COUPURES = new Set([
  'that', 'which', 'who', 'with', 'and', 'but', 'or', 'by', 'so', 'to', 'in', 'it', 'you', 'please', 'because',
  'like', 'tomorrow', 'tonight', 'asap', 'today', 'now', 'using', 'without', 'where', 'when', 'if', 'than', 'then',
  'is', 'are', 'was', 'will', 'should', 'must', 'can', 'could', 'would', 'thanks', 'thank', 'make', 'write', 'do',
  'for', 'about', 'at', 'from', 'into', 'on', 'regarding',
]);
/** Têtes de groupe qui ne désignent pas un sujet : « for me », « for example »… */
const TETES_VIDES = new Set([
  'me', 'you', 'us', 'him', 'her', 'them', 'it', 'this', 'that', 'free', 'example', 'instance', 'now', 'later',
  'tomorrow', 'today', 'tonight', 'vibe', 'fun', 'real', 'sure', 'once', 'ever', 'good', 'nothing', 'everything',
]);
/** Mots grammaticaux qu'on retire en fin de sujet : « for the parents of my » → « for the parents ». */
const FINS_FAIBLES = new Set(['my', 'our', 'a', 'an', 'the', 'his', 'her', 'their', 'of', 'your', 'some', 'very']);

// « about » d'abord (le sujet véritable), puis « for » (le destinataire ou l'objet).
const PREPOSITIONS = ['about', 'on the topic of', 'regarding', 'for'] as const;

/** Groupe qui suit la préposition, coupé au premier mot de liaison ou signe de ponctuation. */
function groupeApres(suite: string): string[] {
  const groupe: string[] = [];
  for (const brut of suite.split(' ').slice(0, MOTS_APRES_PREPOSITION + 2)) {
    const mot = brut.replace(/^[“"'(]+/u, '');
    const propre = mot.replace(/[.,;:!?)”"]+$/u, '');
    if (!propre || COUPURES.has(propre.toLowerCase())) break;
    groupe.push(propre);
    if (propre !== mot || groupe.length === MOTS_APRES_PREPOSITION) break;
  }
  while (groupe.length > 0 && FINS_FAIBLES.has(groupe[groupe.length - 1].toLowerCase())) groupe.pop();
  return groupe;
}

/** Premier groupe exploitable après l'une des occurrences de la préposition (« for free for my bakery » → « for my bakery »). */
function sujetApres(texte: string, preposition: string): string | null {
  for (const trouve of texte.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${preposition} `, 'giu'))) {
    const groupe = groupeApres(texte.slice(trouve.index + trouve[0].length));
    const tete = groupe.filter((m) => !FINS_FAIBLES.has(m.toLowerCase())).join(' ').toLowerCase();
    const sujet = `${preposition} ${groupe.join(' ')}`;
    if (tete && !TETES_VIDES.has(tete) && sujet.length <= LONGUEUR_MAX) return sujet;
  }
  return null;
}

/** « for my bakery », « about climate change »… ou null si rien d'exploitable. */
export function extraireSujet(demande: string): string | null {
  const texte = demande.replace(/\s+/g, ' ').trim();
  for (const preposition of PREPOSITIONS) {
    const sujet = sujetApres(texte, preposition);
    if (sujet) return filtrerCitation(sujet);
  }
  return null;
}
