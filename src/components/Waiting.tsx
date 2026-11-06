import { useEffect, useState } from 'react';
import { DELAY_PER_LINE_MS } from '../lib/analysis/trace';

/** The analysis log, played back line by line: the analysis is instant, the wait is theatre. */
export default function Waiting({ lines }: { lines: readonly string[] }) {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const ticker = setInterval(() => setVisible((n) => Math.min(n + 1, lines.length)), DELAY_PER_LINE_MS);
    return () => clearInterval(ticker);
  }, [lines.length]);

  return (
    <section className="waiting sheet" aria-busy="true">
      <p className="visually-hidden" role="status">Your AI is analysing your request, with great patience…</p>
      <ol className="log" aria-hidden="true">
        {lines.slice(0, visible).map((line, i) => (
          <li key={i} className={i === visible - 1 ? 'log__line log__line--current' : 'log__line'}>{line}</li>
        ))}
      </ol>
    </section>
  );
}
