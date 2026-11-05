// Où va le bouton qu'on ne peut pas attraper : n'importe où dans la fenêtre, sauf sous le pointeur.

export interface Point {
  x: number;
  y: number;
}

const MARGE = 16;
const ELOIGNEMENT_MIN = 180;
const ESSAIS_MAX = 12;

/** Coin haut-gauche d'un bouton largeur×hauteur, dans la fenêtre, le plus loin possible du pointeur. */
export function positionLoin(
  pointeur: Point,
  largeur: number,
  hauteur: number,
  fenetre: { largeur: number; hauteur: number },
  hasard: () => number = Math.random,
): Point {
  const xMax = Math.max(MARGE, fenetre.largeur - largeur - MARGE);
  const yMax = Math.max(MARGE, fenetre.hauteur - hauteur - MARGE);
  let meilleure: Point = { x: MARGE, y: MARGE };
  let distanceMeilleure = -1;
  for (let essai = 0; essai < ESSAIS_MAX; essai++) {
    const p = { x: MARGE + hasard() * (xMax - MARGE), y: MARGE + hasard() * (yMax - MARGE) };
    const distance = Math.hypot(p.x + largeur / 2 - pointeur.x, p.y + hauteur / 2 - pointeur.y);
    if (distance >= ELOIGNEMENT_MIN) return p;
    if (distance > distanceMeilleure) {
      meilleure = p;
      distanceMeilleure = distance;
    }
  }
  // Fenêtre trop petite pour s'éloigner autant : le point le plus lointain trouvé.
  return meilleure;
}
