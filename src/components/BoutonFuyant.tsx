import { type MouseEvent, useRef, useState } from 'react';
import { type Point, positionLoin } from '../lib/fuite';

interface Props {
  /** Libellé de départ, puis les railleries, une par fuite. */
  libelles: readonly string[];
  /** Ce qu'il dit quand on finit par l'attraper — au clavier, le seul moyen. */
  recompense: string;
}

/** Easter egg : un bouton qui fuit le pointeur. Il n'est attrapable qu'au clavier (Tab puis Entrée). */
export default function BoutonFuyant({ libelles, recompense }: Props) {
  const bouton = useRef<HTMLButtonElement>(null);
  /** Décalage depuis sa place : il reste dans le flux, la page ne bouge pas quand il fuit. */
  const [decalage, setDecalage] = useState<Point | null>(null);
  const [fuites, setFuites] = useState(0);
  const [attrape, setAttrape] = useState(false);

  function fuir(pointeur: Point) {
    if (!bouton.current || attrape) return;
    const cadre = bouton.current.getBoundingClientRect();
    // Le décalage réellement appliqué, pas la cible : rattrapé en pleine transition, il en est à mi-chemin.
    const applique = getComputedStyle(bouton.current).translate;
    const [tx = 0, ty = 0] = applique === 'none' ? [] : applique.split(' ').map(parseFloat);
    const place = { x: cadre.x - tx, y: cadre.y - ty };
    const cible = positionLoin(pointeur, cadre.width, cadre.height, { largeur: window.innerWidth, hauteur: window.innerHeight });
    setDecalage({ x: cible.x - place.x, y: cible.y - place.y });
    setFuites((n) => n + 1);
  }

  function cliquer(evenement: MouseEvent) {
    // detail vaut 0 pour une activation au clavier ; un vrai clic qui arrive quand même le fait fuir.
    if (evenement.detail !== 0) return fuir({ x: evenement.clientX, y: evenement.clientY });
    setAttrape(true);
  }

  const libelle = attrape ? recompense : fuites === 0 ? libelles[0] : libelles[1 + ((fuites - 1) % (libelles.length - 1))];
  const classes = ['bouton', 'bouton-fuyant', decalage && 'bouton-fuyant--en-fuite', attrape && 'bouton-fuyant--attrape'];

  return (
    <button
      ref={bouton}
      type="button"
      className={classes.filter(Boolean).join(' ')}
      style={decalage ? { translate: `${decalage.x}px ${decalage.y}px` } : undefined}
      aria-live="polite"
      // La souris est suivie au mouvement (un pointeur qui saute d'une place à l'autre reste « entré ») ;
      // un doigt ne bouge pas avant de toucher, d'où pointerenter pour le tactile seulement.
      onPointerEnter={(e) => e.pointerType === 'touch' && fuir({ x: e.clientX, y: e.clientY })}
      onPointerMove={(e) => fuir({ x: e.clientX, y: e.clientY })}
      onClick={cliquer}
    >
      {libelle}
    </button>
  );
}
