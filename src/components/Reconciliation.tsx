import { useState } from 'react';

export default function Reconciliation({ id, modele }: { id: string; modele: string }) {
  const [statut, setStatut] = useState('');

  async function copier() {
    try {
      await navigator.clipboard.writeText(modele);
      setStatut('Template copied. Fill in the brackets, then submit it again.');
    } catch (erreur) {
      console.error('Could not copy the template', erreur);
      setStatut('Could not copy: select the text above and copy it manually.');
    }
  }

  return (
    <section id={id} className="reconciliation" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`} className="reconciliation__titre">Your request, with what it is missing</h2>
      <pre className="reconciliation__modele">{modele}</pre>
      <div className="reconciliation__pied">
        <button type="button" className="bouton bouton--principal" onClick={copier}>Copy</button>
        <p className="reconciliation__statut" role="status">{statut}</p>
      </div>
    </section>
  );
}
