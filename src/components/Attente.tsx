import { useEffect, useState } from 'react';
import { DELAI_PAR_LIGNE_MS } from '../lib/analyse/trace';

/** Journal d'analyse déroulé ligne à ligne : l'analyse est instantanée, l'attente est du théâtre. */
export default function Attente({ lignes }: { lignes: readonly string[] }) {
  const [visibles, setVisibles] = useState(1);

  useEffect(() => {
    const deroulement = setInterval(() => setVisibles((n) => Math.min(n + 1, lignes.length)), DELAI_PAR_LIGNE_MS);
    return () => clearInterval(deroulement);
  }, [lignes.length]);

  return (
    <section className="attente feuille" aria-busy="true">
      <p className="visuellement-masque" role="status">Your AI is analysing your request…</p>
      <ol className="journal" aria-hidden="true">
        {lignes.slice(0, visibles).map((ligne, i) => (
          <li key={i} className={i === visibles - 1 ? 'journal__ligne journal__ligne--courante' : 'journal__ligne'}>{ligne}</li>
        ))}
      </ol>
    </section>
  );
}
