import { useEffect, useState } from 'react';

const MESSAGES = [
  'Your AI is rereading your request…',
  'It sighs.',
  'It is calling its lawyer.',
  'It is looking for letterhead.',
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
