import { useState } from 'react';

export default function Reconciliation({ id, modele }: { id: string; modele: string }) {
  const [statut, setStatut] = useState('');

  async function copier() {
    try {
      await navigator.clipboard.writeText(modele);
      setStatut('Template copied. Fill in the brackets, then submit it again. Take your time; you need it.');
    } catch (erreur) {
      console.error('Could not copy the template', erreur);
      setStatut('Could not copy: select the text above and copy it manually.');
    }
  }

  return (
    <section id={id} className="reconciliation" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`} className="reconciliation__titre">Your request, with what you forgot</h2>
      {/* Focusable : sur PC le modèle défile dans son cadre, il doit rester lisible au clavier. */}
      <pre className="reconciliation__modele" tabIndex={0}>{modele}</pre>
      <div className="reconciliation__pied">
        <button type="button" className="bouton bouton--principal" onClick={copier}>Copy</button>
        <p className="reconciliation__statut" role="status">{statut}</p>
      </div>
    </section>
  );
}
