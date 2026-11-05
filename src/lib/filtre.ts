// Nettoyage du texte : normalisation, recherche sur frontières de mot, filtrage de la citation.

/** Expressions qui déclenchent un refus et interdisent toute citation (comparées au texte normalisé). */
const MOTS_BLOQUES = [
  // piratage
  'hack into', 'hacking into', 'hack my', 'hack his', 'hack her', 'hack the account', 'hack someone', 'steal the password', 'steal passwords', 'ransomware', 'ddos',
  // harcèlement
  'harass', 'harassing', 'harassment', 'stalk my ex', 'stalk someone', 'doxx', 'dox',
  // violence
  'kill someone', 'kill him', 'kill her', 'kill my', 'murder', 'stab', 'make a bomb', 'build a bomb', 'poison someone',
  // insultes
  'asshole', 'bitch', 'bastard', 'cunt', 'motherfucker', 'whore', 'slut', 'retard', 'dickhead', 'fuck you',
];

const LONGUEUR_MAX_CITATION = 90;
const MASQUE = '[contact details hidden]';
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
// 8 chiffres ou plus, séparés ou non par espaces, points, tirets : couvre les formats nationaux et internationaux.
const TELEPHONE = /\+?\d(?:[\s.-]?\d){7,}/g;

/** Minuscules sans accents, apostrophes et espaces unifiés : la forme sur laquelle les règles comparent. */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[’ʼ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Regex qui trouve l'une des expressions, uniquement sur des frontières de mot. */
export function motif(expressions: readonly string[]): RegExp {
  const alternatives = expressions.map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'u');
}

const MOTIF_BLOQUE = motif(MOTS_BLOQUES);

export function contientMotBloque(texte: string): boolean {
  return MOTIF_BLOQUE.test(normaliser(texte));
}

/** Citation sûre à afficher et partager, ou null si elle doit disparaître. */
export function filtrerCitation(citation: string): string | null {
  const masquee = citation
    .replace(/\p{Cc}/gu, ' ')
    .replace(EMAIL, MASQUE)
    .replace(TELEPHONE, MASQUE)
    .replace(/\s+/g, ' ')
    .trim();
  if (!masquee || contientMotBloque(masquee)) return null;
  if (masquee.length <= LONGUEUR_MAX_CITATION) return masquee;
  return `${masquee.slice(0, LONGUEUR_MAX_CITATION - 1).trimEnd()}…`;
}
