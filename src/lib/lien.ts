// Lien de partage : la lettre voyage dans le fragment #l=… (jamais envoyé au serveur).
// Le fragment est une entrée non fiable : n'importe qui peut le fabriquer à la main,
// donc tout est revalidé et la citation refiltrée.
import { filtrerCitation } from './filtre';
import type { DonneesLettre } from './generateur';
import type { CodeGrief } from './regles';

const VERSION = 1;
const PREFIXE = '#l=';
/** Une lettre légitime tient en ~250 caractères : au-delà, on ne décode même pas. */
const LONGUEUR_MAX_FRAGMENT = 2000;
const GRIEFS_MAX = 5;
const GRAINE_MAX = 0xffffffff;

const CODES_COURTS: Readonly<Record<CodeGrief, string>> = {
  PIECE_MANQUANTE: 'PM',
  PERIMETRE_DEMESURE: 'PD',
  CONTEXTE_ABSENT: 'CA',
  CONTRADICTION: 'CO',
  OBJECTIF_FLOU: 'OF',
  TENTATIVE_DE_MANIPULATION: 'TM',
  FORMAT_NON_PRECISE: 'FN',
  PUBLIC_INCONNU: 'PI',
  AUCUN_EXEMPLE: 'AE',
  CONTRAINTES_ABSENTES: 'CX',
};
const CODES_LONGS = new Map(Object.entries(CODES_COURTS).map(([long, court]) => [court, long as CodeGrief]));

export type Partage =
  | { etat: 'aucun' }
  | { etat: 'egaree' }
  | { etat: 'lettre'; donnees: DonneesLettre };

function versBase64Url(texte: string): string {
  const octets = new TextEncoder().encode(texte);
  let binaire = '';
  for (const octet of octets) binaire += String.fromCharCode(octet);
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Lève une erreur si le texte n'est pas du base64url valide encodant de l'UTF-8 valide. */
function depuisBase64Url(texte: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(texte)) throw new Error('not base64url');
  const binaire = atob(texte.replace(/-/g, '+').replace(/_/g, '/'));
  const octets = Uint8Array.from(binaire, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(octets);
}

/** Données partageables, ou null : une lettre de refus ne se partage pas. */
export function encoderLettre(d: DonneesLettre): string | null {
  if (d.verdict === 'refus') return null;
  const charge: Record<string, unknown> = {
    v: VERSION,
    s: d.graine,
    g: d.griefs.map((code) => CODES_COURTS[code]),
    n: d.note,
    r: d.verdict === 'demission' ? 'd' : 'f',
  };
  if (d.citation !== null) charge.c = d.citation;
  return versBase64Url(JSON.stringify(charge));
}

function estEntierEntre(valeur: unknown, min: number, max: number): valeur is number {
  return Number.isInteger(valeur) && (valeur as number) >= min && (valeur as number) <= max;
}

function griefsConnus(valeur: unknown): CodeGrief[] {
  if (!Array.isArray(valeur)) return [];
  const codes = valeur.flatMap((court) => (typeof court === 'string' && CODES_LONGS.has(court) ? [CODES_LONGS.get(court)!] : []));
  return [...new Set(codes)].slice(0, GRIEFS_MAX);
}

/** Revalide une charge décodée ; null si elle ne décrit pas une lettre affichable. */
function valider(charge: unknown): DonneesLettre | null {
  if (typeof charge !== 'object' || charge === null || Array.isArray(charge)) return null;
  const { v, s, g, n, r, c } = charge as Record<string, unknown>;
  if (v !== VERSION || !estEntierEntre(s, 0, GRAINE_MAX) || !estEntierEntre(n, 0, 20)) return null;
  if (r !== 'd' && r !== 'f') return null;
  const citation = typeof c === 'string' ? filtrerCitation(c) : null;
  if (r === 'f') return { graine: s, griefs: [], note: n, verdict: 'felicitations', citation };
  const griefs = griefsConnus(g);
  if (griefs.length === 0) return null;
  return { graine: s, griefs, note: n, verdict: 'demission', citation };
}

export function lirePartage(hash: string): Partage {
  if (!hash.startsWith(PREFIXE)) return { etat: 'aucun' };
  const contenu = hash.slice(PREFIXE.length);
  if (contenu.length > LONGUEUR_MAX_FRAGMENT) return { etat: 'egaree' };
  let charge: unknown;
  try {
    charge = JSON.parse(depuisBase64Url(contenu));
  } catch {
    // Lien tronqué ou bricolé : c'est un cas prévu, signalé à l'utilisateur par « lettre égarée ».
    return { etat: 'egaree' };
  }
  const donnees = valider(charge);
  return donnees ? { etat: 'lettre', donnees } : { etat: 'egaree' };
}

export function adresseDePartage(encode: string): string {
  return `${window.location.origin}${window.location.pathname}${PREFIXE}${encode}`;
}
