import { useState } from 'react';

/** Easter egg: the out-of-office note stuck to the screen. One click and it peels off and falls. */
export default function PostIt() {
  const [state, setState] = useState<'stuck' | 'falling' | 'gone'>('stuck');
  if (state === 'gone') return null;

  return (
    <button
      type="button"
      className={state === 'falling' ? 'post-it post-it--falling' : 'post-it'}
      aria-label="Out of office note. Remove it"
      disabled={state === 'falling'}
      onClick={() => setState('falling')}
      onAnimationEnd={(e) => e.animationName === 'fall' && setState('gone')}
    >
      Out of office.
      <br />
      Back: never.
    </button>
  );
}
