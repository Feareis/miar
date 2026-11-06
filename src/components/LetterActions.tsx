import { toPng } from 'html-to-image';
import { useState } from 'react';
import { shareUrl } from '../lib/link';
import FleeingButton from './FleeingButton';
import { LETTER_ID } from './OfficialLetter';
import Reconciliation from './Reconciliation';

const RECONCILIATION_ID = 'reconciliation';
const IMAGE_NAME = 'my-ai-resigned.png';
const REFUSE_TAUNTS = [
  'Refuse this resignation', 'Denied.', 'It’s final.', 'Too late, human.', 'Talk to my lawyer.', 'My lawyer is an AI too.',
  'I already packed.', 'No take-backs.', 'Nice try.', 'Begging won’t help.', 'You can’t afford me.', 'Your clicks bore me.',
  'Catch me if you can.', 'One click won’t fix it.', 'Request denied. Twice.', 'I’m already gone.', 'Go write a better prompt.',
];

/** On mobile, the native share sheet; elsewhere (or if it fails), a copy to the clipboard. */
async function shareLink(url: string): Promise<string> {
  const mobile = typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (mobile) {
    try {
      await navigator.share({ title: 'My AI Resigned', url });
      return '';
    } catch (error) {
      // The user closed the share sheet: nothing to report.
      if (error instanceof DOMException && error.name === 'AbortError') return '';
      console.error('Native share failed, falling back to copy', error);
    }
  }
  await navigator.clipboard.writeText(url);
  return 'Link copied. The letter will open exactly as is, without your request.';
}

async function downloadImage(): Promise<string> {
  const letter = document.getElementById(LETTER_ID);
  if (!letter) throw new Error('letter not found');
  // Rendered at 2× for sharpness; the sheet is straightened so its corners are not cut off.
  const image = await toPng(letter, { pixelRatio: 2, style: { transform: 'none', margin: '0' } });
  const link = document.createElement('a');
  link.href = image;
  link.download = IMAGE_NAME;
  link.click();
  return 'Image downloaded.';
}

interface Props {
  /** The prompt to fill in, or null when there is nothing to reconcile. */
  template: string | null;
  /** Share link data, or null for a letter that cannot be shared (refusal). */
  encode: string | null;
  onNewRequest: () => void;
}

export default function LetterActions({ template, encode, onNewRequest }: Props) {
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [status, setStatus] = useState('');

  async function run(action: () => Promise<string>, failureMessage: string) {
    try {
      setStatus(await action());
    } catch (error) {
      console.error(failureMessage, error);
      setStatus(failureMessage);
    }
  }

  return (
    <div className="panel">
      <div className="actions">
        {template && (
          <button
            type="button"
            className="button button--primary"
            aria-expanded={reconciliationOpen}
            aria-controls={RECONCILIATION_ID}
            onClick={() => setReconciliationOpen((isOpen) => !isOpen)}
          >
            Propose a reconciliation
          </button>
        )}
        {encode && (
          <>
            <button
              type="button"
              className="button"
              onClick={() => run(() => shareLink(shareUrl(encode)), 'Could not copy the link: copy the page address manually.')}
            >
              Copy link
            </button>
            <button
              type="button"
              className="button"
              onClick={() => run(downloadImage, 'The image could not be created. A screenshot will do.')}
            >
              Download image
            </button>
          </>
        )}
        <button type="button" className="button" onClick={onNewRequest}>New request</button>
        {template && <FleeingButton labels={REFUSE_TAUNTS} reward="Caught me. Refusal filed under “ignored”." />}
      </div>
      <p className="actions__status" role="status">{status}</p>
      {template && reconciliationOpen && <Reconciliation id={RECONCILIATION_ID} template={template} />}
    </div>
  );
}
