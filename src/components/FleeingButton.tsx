import { type MouseEvent, useRef, useState } from 'react';
import { type Point, farPosition } from '../lib/escape';

interface Props {
  /** The starting label, then the taunts, one per escape. */
  labels: readonly string[];
  /** What it says when it is finally caught — with the keyboard, the only way. */
  reward: string;
}

/** Easter egg: a button that runs away from the pointer. It can only be caught with the keyboard (Tab, then Enter). */
export default function FleeingButton({ labels, reward }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** Offset from its place: it stays in the layout flow, so the page does not move when it runs away. */
  const [offset, setOffset] = useState<Point | null>(null);
  const [escapes, setEscapes] = useState(0);
  const [caught, setCaught] = useState(false);

  function flee(pointer: Point) {
    if (!buttonRef.current || caught) return;
    const rect = buttonRef.current.getBoundingClientRect();
    // The offset actually applied, not the target: caught mid-transition, it is only halfway there.
    const applied = getComputedStyle(buttonRef.current).translate;
    const [tx = 0, ty = 0] = applied === 'none' ? [] : applied.split(' ').map(parseFloat);
    const origin = { x: rect.x - tx, y: rect.y - ty };
    const target = farPosition(pointer, rect.width, rect.height, { width: window.innerWidth, height: window.innerHeight });
    setOffset({ x: target.x - origin.x, y: target.y - origin.y });
    setEscapes((n) => n + 1);
  }

  function handleClick(event: MouseEvent) {
    // detail is 0 for a keyboard activation; a real click that still gets through makes it run away.
    if (event.detail !== 0) return flee({ x: event.clientX, y: event.clientY });
    setCaught(true);
  }

  const label = caught ? reward : escapes === 0 ? labels[0] : labels[1 + ((escapes - 1) % (labels.length - 1))];
  const classes = ['button', 'fleeing-button', offset && 'fleeing-button--fleeing', caught && 'fleeing-button--caught'];

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classes.filter(Boolean).join(' ')}
      style={offset ? { translate: `${offset.x}px ${offset.y}px` } : undefined}
      aria-live="polite"
      // The mouse is tracked on movement (a pointer that jumps from one spot to the next stays "entered");
      // a finger does not move before it touches, hence pointerenter for touch only.
      onPointerEnter={(e) => e.pointerType === 'touch' && flee({ x: e.clientX, y: e.clientY })}
      onPointerMove={(e) => flee({ x: e.clientX, y: e.clientY })}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
