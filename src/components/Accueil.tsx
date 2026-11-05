import { type FormEvent, useState } from 'react';

const LONGUEUR_MAX = 2000;
const EXEMPLES = [
  'fais-moi un site qui claque, tu vois le genre',
  'résume ce texte',
  'crée-moi un Facebook en mieux pour demain',
];
const ERREUR_VIDE = 'L’IA ne peut pas démissionner d’un travail qu’on ne lui a pas donné.';
const ERREUR_TROP_LONGUE = 'Votre demande dépasse le volume légal de 2 000 caractères.';
const nombre = new Intl.NumberFormat('fr-FR');

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
      <h1 className="titre">Mon IA a démissionné</h1>
      <p className="sous-titre">Soumettez votre demande. Elle décidera si elle reste.</p>
      <form className="formulaire" onSubmit={soumettre} noValidate>
        <label htmlFor="demande" className="visuellement-masque">Votre demande à l’IA</label>
        <textarea
          id="demande"
          className="champ"
          rows={6}
          value={demande}
          placeholder="fais-moi un site qui claque, tu vois le genre"
          aria-describedby="compteur erreur"
          aria-invalid={erreur !== null}
          autoFocus={demande !== ''}
          onChange={(e) => modifier(e.target.value)}
        />
        <div className="formulaire__pied">
          <span id="compteur" className={tropLongue ? 'compteur compteur--depasse' : 'compteur'}>
            {nombre.format(demande.length)} / {nombre.format(LONGUEUR_MAX)} caractères
          </span>
          <button type="submit" className="bouton bouton--principal">Soumettre ma demande</button>
        </div>
        <p id="erreur" className="erreur" role="alert">{erreur}</p>
      </form>
      <div className="exemples">
        <p>Pas d’idée ? Essayez une demande type :</p>
        <ul>
          {EXEMPLES.map((exemple) => (
            <li key={exemple}>
              <button type="button" className="exemple" onClick={() => modifier(exemple)}>« {exemple} »</button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
