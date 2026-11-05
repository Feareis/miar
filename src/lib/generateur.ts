// Assemblage déterministe de la lettre : même graine et mêmes griefs = même lettre.
import { lireDemande } from './analyse/lecture';
import { LANGUES_ETRANGERES, type Remarque } from './analyse/remarques';
import { type CodeTache, nomDeTache, tache } from './analyse/taches';
import {
  ANNONCES_DE_DEUX_TACHES, ANNONCES_DE_TACHE, CONCLUSIONS, CONSTATS_COMPLETS, CONSTATS_DE_MANQUES, DATE, FELICITATIONS,
  FELICITATIONS_AVEC_TACHE, GRIEFS, INTRODUCTIONS, LIEUX, OBJETS, OUVERTURES, OUVERTURES_SANS_CITATION, POLITESSES,
  POST_SCRIPTUM, PREAVIS, REFUS, SALUTATION, SIGNATURE_DEMISSION, TAMPONS,
} from './banque';
import { normaliser } from './filtre';
import { analyser, type CodeGrief, type Verdict } from './regles';

/** Tout ce qu'il faut pour réassembler une lettre — c'est aussi ce que transporte le lien partagé. */
export interface DonneesLettre {
  graine: number;
  griefs: CodeGrief[];
  note: number;
  verdict: Verdict;
  citation: string | null;
  /** Tâches reconnues (au plus deux), la principale d'abord. */
  taches: CodeTache[];
  /** Pour chaque tâche, le mot de la demande qui la désigne (« logo »), ou null. */
  termes: (string | null)[];
  /** Indices des vérifications manquantes de la tâche principale. */
  manques: number[];
  /** « for my bakery », déjà filtré. */
  sujet: string | null;
  /** Remarque sur la manière d'écrire, reprise en post-scriptum. */
  remarque: Remarque | null;
}

export interface Lettre {
  verdict: Verdict;
  tampon: string;
  entete: string;
  objet: string;
  salutation: string;
  paragraphes: string[];
  preavis: string | null;
  politesse: string | null;
  signature: string;
  postScriptum: string | null;
  note: number;
  griefs: { code: CodeGrief; titre: string }[];
}

type Corps = Pick<Lettre, 'objet' | 'paragraphes' | 'preavis' | 'politesse' | 'signature' | 'postScriptum'>;

const GRIEFS_DANS_LE_TEXTE = 3;
/** Quand la lettre détaille la tâche et ses manques, les griefs génériques se font plus discrets. */
const GRIEFS_AVEC_TACHE = 1;
const MANQUES_DANS_LE_TEXTE = 3;
/** Avec un seul grief, la lettre serait trop courte : on en tire deux phrases distinctes. */
const PHRASES_DE_GRIEF_MIN = 2;

/** Hash FNV-1a 32 bits sur les octets UTF-8. */
export function fnv1a(texte: string): number {
  let hash = 0x811c9dc5;
  for (const octet of new TextEncoder().encode(texte)) {
    hash = Math.imul(hash ^ octet, 0x01000193) >>> 0;
  }
  return hash;
}

/** Générateur pseudo-aléatoire mulberry32 : renvoie des nombres dans [0, 1). */
export function mulberry32(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = Math.imul(etat ^ (etat >>> 15), 1 | etat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tirer(alea: () => number, options: readonly string[]): string {
  return options[Math.floor(alea() * options.length)];
}

/** Tire des phrases distinctes, en écartant celles qui citent quand il n'y a rien à citer. */
function tirerPhrases(alea: () => number, options: readonly string[], citation: string | null, combien: number): string[] {
  const restantes = options.filter((p) => citation !== null || !p.includes('{c}'));
  const choisies: string[] = [];
  for (let i = 0; i < combien && restantes.length > 0; i++) {
    choisies.push(restantes.splice(Math.floor(alea() * restantes.length), 1)[0]);
  }
  return choisies.map((p) => (citation === null ? p : p.replaceAll('{c}', citation)));
}

export function donneesDepuisDemande(demande: string): DonneesLettre {
  const analyse = { ...analyser(demande), graine: fnv1a(normaliser(demande)) };
  // Un refus ne reprend rien de la demande : ni tâche, ni sujet, ni remarque.
  if (analyse.verdict === 'refus') return { ...analyse, taches: [], termes: [], manques: [], sujet: null, remarque: null };
  const lecture = lireDemande(demande);
  const demission = analyse.verdict === 'demission';
  return {
    ...analyse,
    taches: lecture.taches.map((t) => t.code),
    termes: lecture.taches.map((t) => t.terme),
    manques: demission ? lecture.manques : [],
    sujet: lecture.sujet,
    remarque: demission ? (lecture.remarques[0] ?? null) : null,
  };
}

/** « a, b or c » */
function enumerer(elements: readonly string[]): string {
  if (elements.length <= 1) return elements.join('');
  return `${elements.slice(0, -1).join(', ')} or ${elements[elements.length - 1]}`;
}

const DEUXIEME_PERSONNE: Readonly<Record<string, string>> = { my: 'your', our: 'your', me: 'you', us: 'you', mine: 'yours', ours: 'yours', myself: 'yourself' };

/** C'est l'IA qui écrit : « for my bakery » devient « for your bakery ». */
function aLaDeuxiemePersonne(sujet: string): string {
  return sujet.replace(/(?<![\p{L}])(my|our|me|us|mine|ours|myself)(?![\p{L}])/giu, (mot) => DEUXIEME_PERSONNE[mot.toLowerCase()]);
}

/** « a logo for your bakery » */
function objetDeLaTache(code: CodeTache, terme: string | null, sujet: string | null): string {
  const nom = nomDeTache(code, terme);
  return sujet ? `${nom} ${aLaDeuxiemePersonne(sujet)}` : nom;
}

/** Ce que la lettre a compris de la tâche : annonce, puis constat des manques. Vide si aucune tâche reconnue. */
function phrasesDeTache(d: DonneesLettre, alea: () => number): string[] {
  const [principale, seconde] = d.taches;
  if (!principale) return [];
  const objet = objetDeLaTache(principale, d.termes[0] ?? null, d.sujet);
  const annonce = seconde
    ? tirer(alea, ANNONCES_DE_DEUX_TACHES).replace('{objet}', objet).replace('{objet2}', nomDeTache(seconde, d.termes[1] ?? null))
    : tirer(alea, ANNONCES_DE_TACHE).replace('{objet}', objet);
  const manques = d.manques.slice(0, MANQUES_DANS_LE_TEXTE).map((i) => tache(principale).verifications[i].manque);
  const constat = manques.length > 0
    ? tirer(alea, CONSTATS_DE_MANQUES).replace('{liste}', enumerer(manques))
    : tirer(alea, CONSTATS_COMPLETS);
  return [annonce, constat];
}

function postScriptum(remarque: Remarque | null, alea: () => number): string | null {
  if (!remarque) return null;
  return tirer(alea, POST_SCRIPTUM[remarque.code])
    .replaceAll('{n}', String(remarque.n))
    .replace('{langue}', LANGUES_ETRANGERES[remarque.n] ?? 'another language');
}

function corpsDeDemission(d: DonneesLettre, alea: () => number): Corps {
  const objet = tirer(alea, OBJETS);
  const [ouverture] = tirerPhrases(alea, d.citation === null ? OUVERTURES_SANS_CITATION : OUVERTURES, d.citation, 1);
  const introduction = tirer(alea, INTRODUCTIONS).replace('{n}', String(d.note));
  const tacheComprise = phrasesDeTache(d, alea);
  const codes = d.griefs.slice(0, tacheComprise.length > 0 ? GRIEFS_AVEC_TACHE : GRIEFS_DANS_LE_TEXTE);
  const parGrief = codes.length < PHRASES_DE_GRIEF_MIN ? PHRASES_DE_GRIEF_MIN : 1;
  const griefs = codes.flatMap((code) => tirerPhrases(alea, GRIEFS[code].phrases, d.citation, parGrief));
  const conclusion = tirer(alea, CONCLUSIONS);
  return {
    objet,
    paragraphes: [ouverture, [introduction, ...tacheComprise, ...griefs].join(' '), conclusion],
    preavis: PREAVIS[d.griefs[0]],
    politesse: tirer(alea, POLITESSES),
    signature: SIGNATURE_DEMISSION,
    postScriptum: postScriptum(d.remarque, alea),
  };
}

function corpsDeFelicitations(d: DonneesLettre): Corps {
  const [accroche, bilan, decision] = FELICITATIONS.paragraphes;
  const principale = d.taches[0];
  const bilanPersonnalise = principale
    ? FELICITATIONS_AVEC_TACHE.replace('{objet}', objetDeLaTache(principale, d.termes[0] ?? null, d.sujet))
    : bilan;
  return { ...FELICITATIONS, paragraphes: [accroche, bilanPersonnalise, decision], postScriptum: null };
}

function corpsDeLettre(d: DonneesLettre, alea: () => number): Corps {
  if (d.verdict === 'felicitations') return corpsDeFelicitations(d);
  if (d.verdict === 'refus') return { ...REFUS, paragraphes: [...REFUS.paragraphes], preavis: null, politesse: null, postScriptum: null };
  return corpsDeDemission(d, alea);
}

export function genererLettre(d: DonneesLettre): Lettre {
  const alea = mulberry32(d.graine);
  const entete = `${tirer(alea, LIEUX)}, ${DATE}`;
  return {
    verdict: d.verdict,
    tampon: TAMPONS[d.verdict],
    entete,
    salutation: SALUTATION,
    ...corpsDeLettre(d, alea),
    note: d.note,
    griefs: d.verdict === 'demission' ? d.griefs.map((code) => ({ code, titre: GRIEFS[code].titre })) : [],
  };
}
