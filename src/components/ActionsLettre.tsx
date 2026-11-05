import { toPng } from 'html-to-image';
import { useState } from 'react';
import { adresseDePartage } from '../lib/lien';
import { ID_LETTRE } from './LettreAdministrative';
import Reconciliation from './Reconciliation';

const ID_RECONCILIATION = 'reconciliation';
const NOM_IMAGE = 'lettre-de-mon-ia.png';

/** Sur mobile, le partage natif ; ailleurs (ou s'il échoue), la copie dans le presse-papiers. */
async function partagerLien(url: string): Promise<string> {
  const mobile = typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (mobile) {
    try {
      await navigator.share({ title: 'Mon IA a démissionné', url });
      return '';
    } catch (erreur) {
      // L'utilisateur a fermé la feuille de partage : rien à signaler.
      if (erreur instanceof DOMException && erreur.name === 'AbortError') return '';
      console.error('Partage natif impossible, repli sur la copie', erreur);
    }
  }
  await navigator.clipboard.writeText(url);
  return 'Lien copié. La lettre s’ouvrira telle quelle, sans votre demande.';
}

async function telechargerImage(): Promise<string> {
  const lettre = document.getElementById(ID_LETTRE);
  if (!lettre) throw new Error('lettre introuvable');
  // Rendu 2× pour la netteté ; la feuille est redressée pour ne pas couper ses coins.
  const image = await toPng(lettre, { pixelRatio: 2, style: { transform: 'none', margin: '0' } });
  const lien = document.createElement('a');
  lien.href = image;
  lien.download = NOM_IMAGE;
  lien.click();
  return 'Image téléchargée.';
}

interface Props {
  /** Prompt à compléter, ou null quand il n'y a rien à réconcilier. */
  modele: string | null;
  /** Données du lien de partage, ou null pour une lettre non partageable (refus). */
  encode: string | null;
  onNouvelleDemande: () => void;
}

export default function ActionsLettre({ modele, encode, onNouvelleDemande }: Props) {
  const [reconciliationOuverte, setReconciliationOuverte] = useState(false);
  const [statut, setStatut] = useState('');

  async function executer(action: () => Promise<string>, echec: string) {
    try {
      setStatut(await action());
    } catch (erreur) {
      console.error(echec, erreur);
      setStatut(echec);
    }
  }

  return (
    <>
      <div className="actions">
        {modele && (
          <button
            type="button"
            className="bouton bouton--principal"
            aria-expanded={reconciliationOuverte}
            aria-controls={ID_RECONCILIATION}
            onClick={() => setReconciliationOuverte((ouverte) => !ouverte)}
          >
            Proposer une réconciliation
          </button>
        )}
        {encode && (
          <>
            <button
              type="button"
              className="bouton"
              onClick={() => executer(() => partagerLien(adresseDePartage(encode)), 'Copie du lien impossible : copiez l’adresse de la page à la main.')}
            >
              Copier le lien
            </button>
            <button
              type="button"
              className="bouton"
              onClick={() => executer(telechargerImage, 'L’image n’a pas pu être créée. Une capture d’écran fera l’affaire.')}
            >
              Télécharger l’image
            </button>
          </>
        )}
        <button type="button" className="bouton" onClick={onNouvelleDemande}>Nouvelle demande</button>
      </div>
      <p className="actions__statut" role="status">{statut}</p>
      {modele && reconciliationOuverte && <Reconciliation id={ID_RECONCILIATION} modele={modele} />}
    </>
  );
}
