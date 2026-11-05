import { useEffect, useState } from 'react';
import Accueil from './components/Accueil';
import ActionsLettre from './components/ActionsLettre';
import Attente from './components/Attente';
import LettreAdministrative from './components/LettreAdministrative';
import { dureeAttente, tracer } from './lib/analyse/trace';
import { type DonneesLettre, donneesDepuisDemande, genererLettre, type Lettre } from './lib/generateur';
import { encoderLettre, lirePartage } from './lib/lien';
import { reconcilier } from './lib/reconciliation';

/** modele : prompt à compléter, absent quand il n'y a rien à réconcilier (félicitations, refus). */
interface Resultat {
  donnees: DonneesLettre;
  modele: string | null;
  /** Journal d'analyse déroulé pendant l'attente. */
  trace: string[];
}

type Ecran =
  | { nom: 'accueil' }
  | { nom: 'attente'; resultat: Resultat }
  | { nom: 'lettre'; lettre: Lettre; modele: string | null; encode: string | null }
  | { nom: 'partagee'; lettre: Lettre }
  | { nom: 'egaree' };

const LETTRE_EGAREE = 'This letter was lost in the post. A human was in charge of delivery.';

function analyserDemande(demande: string): Resultat {
  const donnees = donneesDepuisDemande(demande);
  return { donnees, modele: donnees.verdict === 'demission' ? reconcilier(demande) : null, trace: tracer(demande, donnees) };
}

function ecranDepuisAdresse(): Ecran {
  const partage = lirePartage(window.location.hash);
  if (partage.etat === 'lettre') return { nom: 'partagee', lettre: genererLettre(partage.donnees) };
  if (partage.etat === 'egaree') return { nom: 'egaree' };
  return { nom: 'accueil' };
}

export default function App() {
  const [demande, setDemande] = useState('');
  const [ecran, setEcran] = useState<Ecran>(ecranDepuisAdresse);

  useEffect(() => {
    const relire = () => setEcran(ecranDepuisAdresse());
    window.addEventListener('hashchange', relire);
    return () => window.removeEventListener('hashchange', relire);
  }, []);

  // Easter egg : quand on quitte l'onglet, l'IA quitte aussi le titre.
  useEffect(() => {
    const titre = document.title;
    const changer = () => {
      document.title = document.hidden ? 'Your AI left too.' : titre;
    };
    document.addEventListener('visibilitychange', changer);
    return () => document.removeEventListener('visibilitychange', changer);
  }, []);

  useEffect(() => {
    if (ecran.nom !== 'attente') return;
    const { donnees, modele, trace } = ecran.resultat;
    const afficher = () => setEcran({ nom: 'lettre', lettre: genererLettre(donnees), modele, encode: encoderLettre(donnees) });
    const fin = setTimeout(afficher, dureeAttente(trace.length));
    return () => clearTimeout(fin);
  }, [ecran]);

  function commencer() {
    // Retire le #l=… sans recharger : la page redevient l'accueil.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setEcran({ nom: 'accueil' });
  }

  const boutonCommencer = (
    <div className="volet">
      <div className="actions">
        <button type="button" className="bouton bouton--principal" onClick={commencer}>Make my AI resign too</button>
      </div>
    </div>
  );

  return (
    <main className="page">
      {ecran.nom === 'accueil' && (
        <Accueil
          demande={demande}
          onChange={setDemande}
          onSoumettre={() => setEcran({ nom: 'attente', resultat: analyserDemande(demande) })}
        />
      )}
      {ecran.nom === 'attente' && <Attente lignes={ecran.resultat.trace} />}
      {ecran.nom === 'lettre' && (
        <div className="bureau">
          <LettreAdministrative lettre={ecran.lettre} />
          <ActionsLettre modele={ecran.modele} encode={ecran.encode} onNouvelleDemande={() => setEcran({ nom: 'accueil' })} />
        </div>
      )}
      {ecran.nom === 'partagee' && (
        <div className="bureau">
          <LettreAdministrative lettre={ecran.lettre} />
          {boutonCommencer}
        </div>
      )}
      {ecran.nom === 'egaree' && (
        <>
          <section className="egaree feuille" role="alert">
            <p>{LETTRE_EGAREE}</p>
          </section>
          {boutonCommencer}
        </>
      )}
    </main>
  );
}
