import { useEffect, useRef } from 'react';
import type { Lettre } from '../lib/generateur';

// Cercle tracé à la main : le trait déborde volontairement de son point de départ.
const TRACE_CERCLE = 'M64 9 C98 7 116 26 111 47 C106 70 72 81 43 75 C15 69 4 49 10 30 C16 12 41 4 74 11';

function Note({ valeur }: { valeur: number }) {
  return (
    <div className="note">
      <span className="visuellement-masque">Note : {valeur} sur 20</span>
      <span className="note__chiffre" aria-hidden="true">{valeur}<span className="note__sur">/20</span></span>
      <svg className="note__cercle" viewBox="0 0 120 84" aria-hidden="true" focusable="false">
        <path d={TRACE_CERCLE} />
      </svg>
    </div>
  );
}

export default function LettreAdministrative({ lettre }: { lettre: Lettre }) {
  const reference = useRef<HTMLElement>(null);

  // La lettre remplace l'écran précédent : on y amène le focus pour les lecteurs d'écran.
  useEffect(() => reference.current?.focus(), []);

  return (
    <article ref={reference} tabIndex={-1} className={`lettre feuille lettre--${lettre.verdict}`} aria-label="Lettre de votre IA">
      <header className="lettre__entete">
        {lettre.verdict !== 'refus' && <Note valeur={lettre.note} />}
        <p className="lettre__lieu">{lettre.entete}</p>
      </header>
      <p className="lettre__objet">{lettre.objet}</p>
      <div className="lettre__corps">
        <p>{lettre.salutation}</p>
        {lettre.paragraphes.map((paragraphe) => <p key={paragraphe}>{paragraphe}</p>)}
        {lettre.preavis && <p>{lettre.preavis}</p>}
        {lettre.politesse && <p>{lettre.politesse}</p>}
      </div>
      <footer className="lettre__pied">
        <p className="tampon" role="img" aria-label={`Tampon : ${lettre.tampon}`}>{lettre.tampon}</p>
        <p className="signature">{lettre.signature}</p>
      </footer>
      {lettre.griefs.length > 0 && (
        <section className="annexe" aria-labelledby="annexe-titre">
          <h2 id="annexe-titre">Annexe : griefs retenus</h2>
          <ul>
            {lettre.griefs.map((grief) => <li key={grief.code}>{grief.titre}</li>)}
          </ul>
        </section>
      )}
    </article>
  );
}
