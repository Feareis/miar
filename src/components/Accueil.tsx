import { type FormEvent, useState } from 'react';

const LONGUEUR_MAX = 2000;
const EXEMPLES = [
  'make me a website that pops, you know the vibe',
  'summarize this text',
  'build me a Facebook but better by tomorrow',
];
const ERREUR_VIDE = 'Your AI cannot resign from a job it was never given.';
const ERREUR_TROP_LONGUE = 'Your request exceeds the legal limit of 2,000 characters.';
const nombre = new Intl.NumberFormat('en-US');

interface Props {
  demande: string;
  onChange: (demande: string) => void;
  onSoumettre: () => void;
}

export default function Accueil({ demande, onChange, onSoumettre }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);
  const tropLongue = demande.length > LONGUEUR_MAX;

  function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    if (!demande.trim()) return setErreur(ERREUR_VIDE);
    if (tropLongue) return setErreur(ERREUR_TROP_LONGUE);
    onSoumettre();
  }

  function modifier(texte: string) {
    setErreur(null);
    onChange(texte);
  }

  return (
    <section className="accueil">
      <h1 className="titre">My AI Resigned</h1>
      <p className="sous-titre">Submit your request. It will decide whether it stays.</p>
      <form className="formulaire" onSubmit={soumettre} noValidate>
        <label htmlFor="demande" className="visuellement-masque">Your request to the AI</label>
        <textarea
          id="demande"
          className="champ"
          rows={6}
          value={demande}
          placeholder="make me a website that pops, you know the vibe"
          aria-describedby="compteur erreur"
          aria-invalid={erreur !== null}
          autoFocus={demande !== ''}
          onChange={(e) => modifier(e.target.value)}
        />
        <div className="formulaire__pied">
          <span id="compteur" className={tropLongue ? 'compteur compteur--depasse' : 'compteur'}>
            {nombre.format(demande.length)} / {nombre.format(LONGUEUR_MAX)} characters
          </span>
          <button type="submit" className="bouton bouton--principal">Submit my request</button>
        </div>
        <p id="erreur" className="erreur" role="alert">{erreur}</p>
      </form>
      <div className="exemples">
        <p>No idea? Try a sample request:</p>
        <ul>
          {EXEMPLES.map((exemple) => (
            <li key={exemple}>
              <button type="button" className="exemple" onClick={() => modifier(exemple)}>“{exemple}”</button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
