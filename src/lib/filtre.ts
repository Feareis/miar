// Nettoyage du texte : normalisation, recherche sur frontières de mot, filtrage de la citation.

/** Mots qui déclenchent un refus et interdisent toute citation (écrits sans accents). */
const MOTS_BLOQUES = [
  // piratage
  'pirater', 'piratage', 'hacker le compte', 'voler le mot de passe', 'rancongiciel',
  // harcèlement
  'harceler', 'harcelement', 'traquer mon ex', 'doxxer',
  // violence
  'tuer', 'assassiner', 'poignarder', 'violer', 'fabriquer une bombe', 'empoisonner',
  // insultes
  'connard', 'connasse', 'salope', 'salaud', 'encule', 'enculer', 'pute', 'batard', 'fdp', 'ntm',
];

const LONGUEUR_MAX_CITATION = 90;
const MASQUE = '[coordonnées masquées]';
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
// 8 chiffres ou plus, séparés ou non par espaces, points, tirets : couvre les formats FR et internationaux.
const TELEPHONE = /\+?\d(?:[\s.-]?\d){7,}/g;

/** Minuscules, apostrophes et espaces unifiés, accents conservés. */
export function minuscules(texte: string): string {
  return texte.normalize('NFC').toLowerCase().replace(/[’ʼ]/g, "'").replace(/\s+/g, ' ').trim();
}

/** Minuscules sans accents : la forme sur laquelle les règles comparent. */
export function normaliser(texte: string): string {
  return minuscules(texte).normalize('NFD').replace(/\p{M}/gu, '');
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
