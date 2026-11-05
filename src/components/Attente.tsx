import { useEffect, useState } from 'react';

const MESSAGES = [
  'L’IA relit votre demande…',
  'Elle soupire.',
  'Elle consulte son avocat.',
  'Elle cherche du papier à en-tête.',
];
const INTERVALLE_MS = 550;

export default function Attente() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const rotation = setInterval(() => setIndex((i) => Math.min(i + 1, MESSAGES.length - 1)), INTERVALLE_MS);
    return () => clearInterval(rotation);
  }, []);

  return (
    <section className="attente feuille" aria-busy="true">
      <p className="attente__message" role="status">{MESSAGES[index]}</p>
    </section>
  );
}
