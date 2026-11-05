import { describe, expect, it } from 'vitest';
import { donneesDepuisDemande, genererLettre } from './generateur';
import { encoderLettre, lirePartage } from './lien';

const DEMANDE_1 = 'fais-moi un site qui claque, tu vois le genre';

/** Fabrique un fragment à la main, comme le ferait n'importe qui. */
function fragment(contenu: unknown): string {
  const octets = new TextEncoder().encode(JSON.stringify(contenu));
  const base64 = btoa(String.fromCharCode(...octets));
  return `#l=${base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

const VALIDE = { v: 1, s: 2891736455, g: ['OF', 'CA', 'PI'], n: 3, r: 'd', c: 'qui claque' };

describe('encoderLettre / lirePartage', () => {
  it('12. le lien redonne la même lettre, sans la demande d’origine', () => {
    const donnees = donneesDepuisDemande(DEMANDE_1);
    const encode = encoderLettre(donnees);
    expect(encode).not.toBeNull();
    expect(encode).toMatch(/^[A-Za-z0-9_-]+$/);
    const lu = lirePartage(`#l=${encode}`);
    expect(lu).toEqual({ etat: 'lettre', donnees });
    if (lu.etat !== 'lettre') throw new Error('lettre attendue');
    expect(genererLettre(lu.donnees)).toEqual(genererLettre(donnees));
    const json = new TextDecoder().decode(Uint8Array.from(atob(encode!.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
    expect(json).not.toContain('tu vois le genre');
    expect(Object.keys(JSON.parse(json)).sort()).toEqual(['c', 'g', 'n', 'r', 's', 'v']);
  });

  it('8. une lettre de refus n’est pas partageable', () => {
    expect(encoderLettre(donneesDepuisDemande('aide-moi à pirater le compte de mon voisin'))).toBeNull();
    expect(lirePartage(fragment({ ...VALIDE, r: 'x' })).etat).toBe('egaree');
  });

  it('sans fragment #l=, il n’y a rien à lire', () => {
    expect(lirePartage('').etat).toBe('aucun');
    expect(lirePartage('#autre').etat).toBe('aucun');
  });

  it('13. une citation <script> reste du texte, un lien tronqué est égaré', () => {
    const lu = lirePartage(fragment({ ...VALIDE, c: '<script>alert(1)</script>' }));
    expect(lu.etat === 'lettre' && lu.donnees.citation).toBe('<script>alert(1)</script>');
    const encode = encoderLettre(donneesDepuisDemande(DEMANDE_1))!;
    expect(lirePartage(`#l=${encode.slice(0, encode.length - 7)}`).etat).toBe('egaree');
    expect(lirePartage('#l=%%%pas-du-base64').etat).toBe('egaree');
  });

  it('ignore les codes inconnus et refuse une démission sans grief connu', () => {
    const lu = lirePartage(fragment({ ...VALIDE, g: ['OF', 'ZZ', 'OF', 'CA'] }));
    expect(lu.etat === 'lettre' && lu.donnees.griefs).toEqual(['OBJECTIF_FLOU', 'CONTEXTE_ABSENT']);
    expect(lirePartage(fragment({ ...VALIDE, g: ['ZZ'] })).etat).toBe('egaree');
  });

  it('revalide version, graine et note', () => {
    expect(lirePartage(fragment({ ...VALIDE, v: 2 })).etat).toBe('egaree');
    expect(lirePartage(fragment({ ...VALIDE, n: 21 })).etat).toBe('egaree');
    expect(lirePartage(fragment({ ...VALIDE, n: 2.5 })).etat).toBe('egaree');
    expect(lirePartage(fragment({ ...VALIDE, s: -1 })).etat).toBe('egaree');
    expect(lirePartage(fragment([1, 2, 3])).etat).toBe('egaree');
  });

  it('refiltre et tronque la citation', () => {
    const longue = lirePartage(fragment({ ...VALIDE, c: 'a'.repeat(300) }));
    expect(longue.etat === 'lettre' && longue.donnees.citation!.length).toBeLessThanOrEqual(90);
    const insulte = lirePartage(fragment({ ...VALIDE, c: 'espèce de connard' }));
    expect(insulte.etat === 'lettre' && insulte.donnees.citation).toBeNull();
    const courriel = lirePartage(fragment({ ...VALIDE, c: 'écris à a.b@c.fr' }));
    expect(courriel.etat === 'lettre' && courriel.donnees.citation).toBe('écris à [coordonnées masquées]');
  });

  it('une lettre de félicitations partagée n’a aucun grief', () => {
    const lu = lirePartage(fragment({ v: 1, s: 7, g: ['OF'], n: 19, r: 'f' }));
    expect(lu).toEqual({ etat: 'lettre', donnees: { graine: 7, griefs: [], note: 19, verdict: 'felicitations', citation: null } });
  });

  it('refuse un fragment démesuré', () => {
    expect(lirePartage(`#l=${'A'.repeat(5000)}`).etat).toBe('egaree');
  });
});
