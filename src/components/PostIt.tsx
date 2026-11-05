import { useState } from 'react';

/** Easter egg : le mot d'absence collé sur l'écran. Un clic, il se décolle et tombe. */
export default function PostIt() {
  const [etat, setEtat] = useState<'colle' | 'tombe' | 'parti'>('colle');
  if (etat === 'parti') return null;

  return (
    <button
      type="button"
      className={etat === 'tombe' ? 'post-it post-it--tombe' : 'post-it'}
      aria-label="Out of office note. Remove it"
      disabled={etat === 'tombe'}
      onClick={() => setEtat('tombe')}
      onAnimationEnd={(e) => e.animationName === 'chute' && setEtat('parti')}
    >
      Out of office.
      <br />
      Back: never.
    </button>
  );
}
