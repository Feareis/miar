import { useEffect, useState } from 'react';
import Home from './components/Home';
import LetterActions from './components/LetterActions';
import Waiting from './components/Waiting';
import OfficialLetter from './components/OfficialLetter';
import { waitDuration, buildTrace } from './lib/analysis/trace';
import { type LetterData, dataFromRequest, generateLetter, type Letter } from './lib/generator';
import { encodeLetter, readSharedLink } from './lib/link';
import { reconcile } from './lib/reconciliation';

/** template: the prompt to fill in, absent when there is nothing to reconcile (congratulations, refusal). */
interface Result {
  data: LetterData;
  template: string | null;
  /** Analysis log played back while the user waits. */
  trace: string[];
}

type View =
  | { name: 'home' }
  | { name: 'waiting'; result: Result }
  | { name: 'letter'; letter: Letter; template: string | null; encode: string | null }
  | { name: 'shared'; letter: Letter }
  | { name: 'lost' };

const LOST_LETTER = 'This letter was lost in the post. A human was in charge of delivery.';

function analyseRequest(request: string): Result {
  const data = dataFromRequest(request);
  return { data, template: data.verdict === 'resignation' ? reconcile(request) : null, trace: buildTrace(request, data) };
}

function viewFromUrl(): View {
  const shared = readSharedLink(window.location.hash);
  if (shared.state === 'letter') return { name: 'shared', letter: generateLetter(shared.data) };
  if (shared.state === 'lost') return { name: 'lost' };
  return { name: 'home' };
}

export default function App() {
  const [request, setRequest] = useState('');
  const [view, setView] = useState<View>(viewFromUrl);

  useEffect(() => {
    const reread = () => setView(viewFromUrl());
    window.addEventListener('hashchange', reread);
    return () => window.removeEventListener('hashchange', reread);
  }, []);

  // Easter egg: when you leave the tab, the AI leaves the title too.
  useEffect(() => {
    const title = document.title;
    const update = () => {
      document.title = document.hidden ? 'Your AI left too.' : title;
    };
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (view.name !== 'waiting') return;
    const { data, template, trace } = view.result;
    const show = () => setView({ name: 'letter', letter: generateLetter(data), template, encode: encodeLetter(data) });
    const timer = setTimeout(show, waitDuration(trace.length));
    return () => clearTimeout(timer);
  }, [view]);

  function start() {
    // Drops the #l=… without reloading: the page turns back into the home page.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setView({ name: 'home' });
  }

  const startButton = (
    <div className="panel">
      <div className="actions">
        <button type="button" className="button button--primary" onClick={start}>Make my AI resign too</button>
      </div>
    </div>
  );

  return (
    <main className="page">
      {view.name === 'home' && (
        <Home
          request={request}
          onChange={setRequest}
          onSubmitRequest={() => setView({ name: 'waiting', result: analyseRequest(request) })}
        />
      )}
      {view.name === 'waiting' && <Waiting lines={view.result.trace} />}
      {view.name === 'letter' && (
        <div className="desk">
          <OfficialLetter letter={view.letter} />
          <LetterActions template={view.template} encode={view.encode} onNewRequest={() => setView({ name: 'home' })} />
        </div>
      )}
      {view.name === 'shared' && (
        <div className="desk">
          <OfficialLetter letter={view.letter} />
          {startButton}
        </div>
      )}
      {view.name === 'lost' && (
        <>
          <section className="lost sheet" role="alert">
            <p>{LOST_LETTER}</p>
          </section>
          {startButton}
        </>
      )}
    </main>
  );
}
