import { useEffect, useRef } from 'react';
import type { Letter } from '../lib/generator';

export const LETTER_ID = 'letter';

// Hand-drawn circle: the stroke deliberately overshoots its starting point.
const CIRCLE_PATH = 'M64 9 C98 7 116 26 111 47 C106 70 72 81 43 75 C15 69 4 49 10 30 C16 12 41 4 74 11';

function Grade({ value }: { value: number }) {
  return (
    <div className="grade">
      <span className="visually-hidden">Grade: {value} out of 20</span>
      <span className="grade__number" aria-hidden="true">{value}<span className="grade__out-of">/20</span></span>
      <svg className="grade__circle" viewBox="0 0 120 84" aria-hidden="true" focusable="false">
        <path d={CIRCLE_PATH} />
      </svg>
    </div>
  );
}

export default function OfficialLetter({ letter }: { letter: Letter }) {
  const reference = useRef<HTMLElement>(null);

  // The letter replaces the previous screen: focus is moved to it for screen readers.
  useEffect(() => reference.current?.focus(), []);

  return (
    <article id={LETTER_ID} ref={reference} tabIndex={-1} className={`letter sheet letter--${letter.verdict}`} aria-label="Letter from your AI">
      {/* Direct children of the grid: on desktop, the grade and the appendix move into the left margin. */}
      {letter.verdict !== 'refusal' && <Grade value={letter.score} />}
      <p className="letter__place">{letter.header}</p>
      <p className="letter__subject">{letter.subjectLine}</p>
      <div className="letter__body">
        <p>{letter.salutation}</p>
        {letter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {letter.notice && <p>{letter.notice}</p>}
        {letter.signOff && <p>{letter.signOff}</p>}
      </div>
      <footer className="letter__footer">
        <p className="stamp" role="img" aria-label={`Stamp: ${letter.stamp}`}>{letter.stamp}</p>
        <p className="signature">{letter.signature}</p>
      </footer>
      {letter.postscript && <p className="letter__ps">{letter.postscript}</p>}
      {letter.grievances.length > 0 && (
        <section className="appendix" aria-labelledby="appendix-title">
          <h2 id="appendix-title">Appendix: grievances on record</h2>
          <ul>
            {letter.grievances.map((grievance) => <li key={grievance.code}>{grievance.title}</li>)}
          </ul>
        </section>
      )}
      {/* Printed on every screenshot and every exported image: this is what brings people back to the site. */}
      <p className="letter__address">{window.location.host}</p>
    </article>
  );
}
