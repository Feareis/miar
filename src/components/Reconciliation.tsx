import { useState } from 'react';

export default function Reconciliation({ id, modele }: { id: string; modele: string }) {
  const [statut, setStatut] = useState('');

  async function copier() {
    try {
      await navigator.clipboard.writeText(modele);
      setStatut('Modèle copié. Complétez les crochets, puis soumettez-le de nouveau.');
    } catch (erreur) {
      console.error('Copie du modèle impossible', erreur);
      setStatut('Copie impossible : sélectionnez le texte ci-dessus et copiez-le à la main.');
    }
  }

  return (
    <section id={id} className="reconciliation" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`} className="reconciliation__titre">Votre demande, avec ce qu’il lui manque</h2>
      <pre className="reconciliation__modele">{modele}</pre>
      <div className="reconciliation__pied">
        <button type="button" className="bouton bouton--principal" onClick={copier}>Copier</button>
        <p className="reconciliation__statut" role="status">{statut}</p>
      </div>
    </section>
  );
}
