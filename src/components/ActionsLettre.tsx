import { toPng } from 'html-to-image';
import { useState } from 'react';
import { adresseDePartage } from '../lib/lien';
import BoutonFuyant from './BoutonFuyant';
import { ID_LETTRE } from './LettreAdministrative';
import Reconciliation from './Reconciliation';

const ID_RECONCILIATION = 'reconciliation';
const NOM_IMAGE = 'my-ai-resigned.png';
const REFUS = ['Refuse this resignation', 'Denied.', 'It’s final.', 'Talk to my lawyer.', 'I already packed.', 'No take-backs.'];

/** Sur mobile, le partage natif ; ailleurs (ou s'il échoue), la copie dans le presse-papiers. */
async function partagerLien(url: string): Promise<string> {
  const mobile = typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (mobile) {
    try {
      await navigator.share({ title: 'My AI Resigned', url });
      return '';
    } catch (erreur) {
      // L'utilisateur a fermé la feuille de partage : rien à signaler.
      if (erreur instanceof DOMException && erreur.name === 'AbortError') return '';
      console.error('Native share failed, falling back to copy', erreur);
    }
  }
  await navigator.clipboard.writeText(url);
  return 'Link copied. The letter will open exactly as is, without your request.';
}

async function telechargerImage(): Promise<string> {
  const lettre = document.getElementById(ID_LETTRE);
  if (!lettre) throw new Error('letter not found');
  // Rendu 2× pour la netteté ; la feuille est redressée pour ne pas couper ses coins.
  const image = await toPng(lettre, { pixelRatio: 2, style: { transform: 'none', margin: '0' } });
  const lien = document.createElement('a');
  lien.href = image;
  lien.download = NOM_IMAGE;
  lien.click();
  return 'Image downloaded.';
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
    <div className="volet">
      <div className="actions">
        {modele && (
          <button
            type="button"
            className="bouton bouton--principal"
            aria-expanded={reconciliationOuverte}
            aria-controls={ID_RECONCILIATION}
            onClick={() => setReconciliationOuverte((ouverte) => !ouverte)}
          >
            Propose a reconciliation
          </button>
        )}
        {encode && (
          <>
            <button
              type="button"
              className="bouton"
              onClick={() => executer(() => partagerLien(adresseDePartage(encode)), 'Could not copy the link: copy the page address manually.')}
            >
              Copy link
            </button>
            <button
              type="button"
              className="bouton"
              onClick={() => executer(telechargerImage, 'The image could not be created. A screenshot will do.')}
            >
              Download image
            </button>
          </>
        )}
        <button type="button" className="bouton" onClick={onNouvelleDemande}>New request</button>
        {modele && <BoutonFuyant libelles={REFUS} recompense="Refusal received. Filed under “ignored”." />}
      </div>
      <p className="actions__statut" role="status">{statut}</p>
      {modele && reconciliationOuverte && <Reconciliation id={ID_RECONCILIATION} modele={modele} />}
    </div>
  );
}
