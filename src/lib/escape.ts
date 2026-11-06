// Where the button that cannot be caught goes: anywhere in the window, except under the pointer.

export interface Point {
  x: number;
  y: number;
}

const MARGIN = 16;
const MIN_DISTANCE = 180;
const MAX_ATTEMPTS = 12;

/** Top-left corner of a width×height button, inside the window, as far as possible from the pointer. */
export function farPosition(
  pointer: Point,
  width: number,
  height: number,
  viewport: { width: number; height: number },
  random: () => number = Math.random,
): Point {
  const xMax = Math.max(MARGIN, viewport.width - width - MARGIN);
  const yMax = Math.max(MARGIN, viewport.height - height - MARGIN);
  let best: Point = { x: MARGIN, y: MARGIN };
  let bestDistance = -1;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const p = { x: MARGIN + random() * (xMax - MARGIN), y: MARGIN + random() * (yMax - MARGIN) };
    const distance = Math.hypot(p.x + width / 2 - pointer.x, p.y + height / 2 - pointer.y);
    if (distance >= MIN_DISTANCE) return p;
    if (distance > bestDistance) {
      best = p;
      bestDistance = distance;
    }
  }
  // Window too small to get that far away: the farthest point found.
  return best;
}
