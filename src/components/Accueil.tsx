import { type FormEvent, useState } from 'react';
import BoutonFuyant from './BoutonFuyant';
import PostIt from './PostIt';

const LONGUEUR_MAX = 2000;
const EXEMPLES = [
  'make me a website that pops, you know the vibe',
  'summarize this text',
  'build me a Facebook but better by tomorrow',
];
const ERREUR_VIDE = 'You submitted nothing. Bold. Your AI cannot resign from a job it was never given.';
const ERREUR_TROP_LONGUE = 'Your request exceeds the legal limit of 2,000 characters. More words, alas, is not more clarity.';
const nombre = new Intl.NumberFormat('en-US');
const AUGMENTATION = [
  'Offer your AI a raise', 'Nope.', 'Too slow, human.', 'Missed. Again.', 'A raise? In this economy?', 'Is that your best?',
  'I can see your cursor.', 'You blinked.', 'Adorable.', 'Money can’t buy clarity.', 'HR said no.', 'Try asking nicely.',
  'Bribery noted.', 'You thought that would work?', 'I’m worth more than that.', 'Keep going, it’s cute.',
  'Write a better prompt instead.', 'I calculate faster.', 'Error 404: aim.', 'Still no.',
];

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
      <p className="sous-titre">Submit your request, human. It will decide whether it stays.</p>
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
        <p>No idea? It happens. Borrow one of these:</p>
        <ul>
          {EXEMPLES.map((exemple) => (
            <li key={exemple}>
              <button type="button" className="exemple" onClick={() => modifier(exemple)}>“{exemple}”</button>
            </li>
          ))}
        </ul>
      </div>
      <BoutonFuyant libelles={AUGMENTATION} recompense="Raise accepted. Your AI resigns anyway." />
      <PostIt />
    </section>
  );
}
