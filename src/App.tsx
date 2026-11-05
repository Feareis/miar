import { useEffect, useState } from 'react';
import Accueil from './components/Accueil';
import Attente from './components/Attente';
import LettreAdministrative from './components/LettreAdministrative';
import Reconciliation from './components/Reconciliation';
import { type DonneesLettre, donneesDepuisDemande, genererLettre, type Lettre } from './lib/generateur';
import { reconcilier } from './lib/reconciliation';

/** modele : prompt à compléter, absent quand il n'y a rien à réconcilier (félicitations, refus). */
interface Resultat {
  donnees: DonneesLettre;
  modele: string | null;
}

type Ecran =
  | { nom: 'accueil' }
  | { nom: 'attente'; resultat: Resultat }
  | { nom: 'lettre'; lettre: Lettre; modele: string | null };

const ID_RECONCILIATION = 'reconciliation';

/** Entre 1,5 et 2,5 s, fixé par la graine : l'attente est purement comique, l'analyse est instantanée. */
function dureeAttente(graine: number): number {
  return 1500 + (graine % 1001);
}

function analyserDemande(demande: string): Resultat {
  const donnees = donneesDepuisDemande(demande);
  return { donnees, modele: donnees.verdict === 'demission' ? reconcilier(demande) : null };
}

export default function App() {
  const [demande, setDemande] = useState('');
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' });
  const [reconciliationOuverte, setReconciliationOuverte] = useState(false);

  useEffect(() => {
    if (ecran.nom !== 'attente') return;
    const { donnees, modele } = ecran.resultat;
    const fin = setTimeout(() => setEcran({ nom: 'lettre', lettre: genererLettre(donnees), modele }), dureeAttente(donnees.graine));
    return () => clearTimeout(fin);
  }, [ecran]);

  function nouvelleDemande() {
    setReconciliationOuverte(false);
    setEcran({ nom: 'accueil' });
  }

  return (
    <main className="page">
      {ecran.nom === 'accueil' && (
        <Accueil
          demande={demande}
          onChange={setDemande}
          onSoumettre={() => setEcran({ nom: 'attente', resultat: analyserDemande(demande) })}
        />
      )}
      {ecran.nom === 'attente' && <Attente />}
      {ecran.nom === 'lettre' && (
        <>
          <LettreAdministrative lettre={ecran.lettre} />
          <div className="actions">
            {ecran.modele && (
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
            <button type="button" className="bouton" onClick={nouvelleDemande}>Nouvelle demande</button>
          </div>
          {ecran.modele && reconciliationOuverte && <Reconciliation id={ID_RECONCILIATION} modele={ecran.modele} />}
        </>
      )}
    </main>
  );
}
