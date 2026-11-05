import { useEffect, useState } from 'react';
import Accueil from './components/Accueil';
import Attente from './components/Attente';
import LettreAdministrative from './components/LettreAdministrative';
import { type DonneesLettre, donneesDepuisDemande, genererLettre, type Lettre } from './lib/generateur';

type Ecran =
  | { nom: 'accueil' }
  | { nom: 'attente'; donnees: DonneesLettre }
  | { nom: 'lettre'; lettre: Lettre };

/** Entre 1,5 et 2,5 s, fixé par la graine : l'attente est purement comique, l'analyse est instantanée. */
function dureeAttente(graine: number): number {
  return 1500 + (graine % 1001);
}

export default function App() {
  const [demande, setDemande] = useState('');
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' });

  useEffect(() => {
    if (ecran.nom !== 'attente') return;
    const fin = setTimeout(() => setEcran({ nom: 'lettre', lettre: genererLettre(ecran.donnees) }), dureeAttente(ecran.donnees.graine));
    return () => clearTimeout(fin);
  }, [ecran]);

  return (
    <main className="page">
      {ecran.nom === 'accueil' && (
        <Accueil
          demande={demande}
          onChange={setDemande}
          onSoumettre={() => setEcran({ nom: 'attente', donnees: donneesDepuisDemande(demande) })}
        />
      )}
      {ecran.nom === 'attente' && <Attente />}
      {ecran.nom === 'lettre' && (
        <>
          <LettreAdministrative lettre={ecran.lettre} />
          <div className="actions">
            <button type="button" className="bouton" onClick={() => setEcran({ nom: 'accueil' })}>
              Nouvelle demande
            </button>
          </div>
        </>
      )}
    </main>
  );
}
