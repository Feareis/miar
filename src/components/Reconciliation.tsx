import { useState } from 'react';

export default function Reconciliation({ id, template }: { id: string; template: string }) {
  const [status, setStatus] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(template);
      setStatus('Template copied. Fill in the brackets this time, then submit it again.');
    } catch (error) {
      console.error('Could not copy the template', error);
      setStatus('Could not copy: select the text above and copy it manually.');
    }
  }

  return (
    <section id={id} className="reconciliation" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="reconciliation__title">Your request, with what you forgot</h2>
      {/* Focusable: on desktop the template scrolls inside its frame, so it must stay readable with the keyboard. */}
      <pre className="reconciliation__template" tabIndex={0}>{template}</pre>
      <div className="reconciliation__footer">
        <button type="button" className="button button--primary" onClick={copy}>Copy</button>
        <p className="reconciliation__status" role="status">{status}</p>
      </div>
    </section>
  );
}
