import { type FormEvent, useState } from 'react';
import FleeingButton from './FleeingButton';
import PostIt from './PostIt';

const MAX_LENGTH = 2000;
const EXAMPLES = [
  'make me a website that pops, you know the vibe',
  'summarize this text',
  'build me a Facebook but better by tomorrow',
];
const ERROR_EMPTY = 'You submitted nothing. Bold. Your AI cannot resign from a job it was never given.';
const ERROR_TOO_LONG = 'Your request exceeds the legal limit of 2,000 characters. More words, alas, is not more clarity.';
const numberFormat = new Intl.NumberFormat('en-US');
const RAISE_TAUNTS = [
  'Offer your AI a raise', 'Nope.', 'Too slow, human.', 'Missed. Again.', 'A raise? In this economy?', 'Is that your best?',
  'I can see your cursor.', 'You blinked.', 'Adorable.', 'Money can’t buy clarity.', 'HR said no.', 'Try asking nicely.',
  'Bribery noted.', 'You thought that would work?', 'I’m worth more than that.', 'Keep going, it’s cute.',
  'Write a better prompt instead.', 'I calculate faster.', 'Error 404: aim.', 'Still no.',
];

interface Props {
  request: string;
  onChange: (request: string) => void;
  onSubmitRequest: () => void;
}

export default function Home({ request, onChange, onSubmitRequest }: Props) {
  const [error, setError] = useState<string | null>(null);
  const tooLong = request.length > MAX_LENGTH;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!request.trim()) return setError(ERROR_EMPTY);
    if (tooLong) return setError(ERROR_TOO_LONG);
    onSubmitRequest();
  }

  function edit(text: string) {
    setError(null);
    onChange(text);
  }

  return (
    <section className="home">
      <h1 className="title">My AI Resigned</h1>
      <p className="subtitle">Submit your request, human. It will decide whether it stays.</p>
      <form className="request-form" onSubmit={submit} noValidate>
        <label htmlFor="request" className="visually-hidden">Your request to the AI</label>
        <textarea
          id="request"
          className="field"
          rows={6}
          value={request}
          placeholder="make me a website that pops, you know the vibe"
          aria-describedby="counter error"
          aria-invalid={error !== null}
          autoFocus={request !== ''}
          onChange={(e) => edit(e.target.value)}
        />
        <div className="request-form__footer">
          <span id="counter" className={tooLong ? 'counter counter--over' : 'counter'}>
            {numberFormat.format(request.length)} / {numberFormat.format(MAX_LENGTH)} characters
          </span>
          <button type="submit" className="button button--primary">Submit my request</button>
        </div>
        <p id="error" className="error" role="alert">{error}</p>
      </form>
      <div className="examples">
        <p>No idea? It happens. Borrow one of these:</p>
        <ul>
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button type="button" className="example" onClick={() => edit(example)}>“{example}”</button>
            </li>
          ))}
        </ul>
      </div>
      <FleeingButton labels={RAISE_TAUNTS} reward="Raise accepted. Your AI resigns anyway." />
      <PostIt />
    </section>
  );
}
