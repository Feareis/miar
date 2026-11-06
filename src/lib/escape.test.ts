import { describe, expect, it } from 'vitest';
import { farPosition } from './escape';

const VIEWPORT = { width: 1366, height: 650 };

describe('farPosition', () => {
  it('always lands inside the window, far from the pointer', () => {
    for (let i = 0; i < 500; i++) {
      const pointer = { x: Math.random() * VIEWPORT.width, y: Math.random() * VIEWPORT.height };
      const p = farPosition(pointer, 200, 44, VIEWPORT);
      expect(p.x).toBeGreaterThanOrEqual(16);
      expect(p.y).toBeGreaterThanOrEqual(16);
      expect(p.x + 200).toBeLessThanOrEqual(VIEWPORT.width - 16);
      expect(p.y + 44).toBeLessThanOrEqual(VIEWPORT.height - 16);
      expect(Math.hypot(p.x + 100 - pointer.x, p.y + 22 - pointer.y)).toBeGreaterThanOrEqual(180);
    }
  });

  it('keeps the farthest spot when the window is too small to flee far', () => {
    const p = farPosition({ x: 60, y: 40 }, 100, 40, { width: 150, height: 90 });
    expect(p.x).toBeGreaterThanOrEqual(16);
    expect(p.y).toBeGreaterThanOrEqual(16);
    expect(p.x + 100).toBeLessThanOrEqual(150);
  });

  it('never leaves through the top-left corner of a tiny window', () => {
    expect(farPosition({ x: 0, y: 0 }, 400, 400, { width: 100, height: 100 }, () => 0.5)).toEqual({ x: 16, y: 16 });
  });
});
