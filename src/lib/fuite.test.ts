import { describe, expect, it } from 'vitest';
import { positionLoin } from './fuite';

const FENETRE = { largeur: 1366, hauteur: 650 };

describe('positionLoin', () => {
  it('always lands inside the window, far from the pointer', () => {
    for (let i = 0; i < 500; i++) {
      const pointeur = { x: Math.random() * FENETRE.largeur, y: Math.random() * FENETRE.hauteur };
      const p = positionLoin(pointeur, 200, 44, FENETRE);
      expect(p.x).toBeGreaterThanOrEqual(16);
      expect(p.y).toBeGreaterThanOrEqual(16);
      expect(p.x + 200).toBeLessThanOrEqual(FENETRE.largeur - 16);
      expect(p.y + 44).toBeLessThanOrEqual(FENETRE.hauteur - 16);
      expect(Math.hypot(p.x + 100 - pointeur.x, p.y + 22 - pointeur.y)).toBeGreaterThanOrEqual(180);
    }
  });

  it('keeps the farthest spot when the window is too small to flee far', () => {
    const p = positionLoin({ x: 60, y: 40 }, 100, 40, { largeur: 150, hauteur: 90 });
    expect(p.x).toBeGreaterThanOrEqual(16);
    expect(p.y).toBeGreaterThanOrEqual(16);
    expect(p.x + 100).toBeLessThanOrEqual(150);
  });

  it('never leaves through the top-left corner of a tiny window', () => {
    expect(positionLoin({ x: 0, y: 0 }, 400, 400, { largeur: 100, hauteur: 100 }, () => 0.5)).toEqual({ x: 16, y: 16 });
  });
});
