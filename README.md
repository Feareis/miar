# My AI Resigned

> You paste a prompt. Your AI reads it, sighs, and hands you a formal resignation letter.

**Live:** <https://myairesigned.vercel.app>

We've all sent an AI something like *"make me a website that pops, you know the vibe"*. This site reads that request the way an overworked, very polite assistant would. It grades the request out of 20, lists everything you forgot to say, and resigns in writing, rubber stamp included. If your prompt is actually good, it congratulates you, though it sounds a little surprised. Either way you get a fill-in-the-blanks template to write a better one next time.

It's a joke with a useful core: every grievance in the letter is a real, common prompting mistake.

---

## The ground rules

These are not suggestions. The whole concept depends on them.

- **No server, no database, no AI API, no third-party service.** It's a static site, and everything runs in your browser.
- **Zero network requests after page load.** That includes the "analysis" and the PNG export. Fonts are inlined into the CSS for exactly this reason.
- **Deterministic.** The same request always produces the same letter, word for word. The randomness is seeded from a hash of the request.
- **Share links carry data, not prompts.** A letter travels in the URL fragment (`#l=…`), which never reaches a server. It holds only what's needed to rebuild the letter, never the original request.
- **A strict Content Security Policy** is injected at build time (see `vite.config.ts`).

If a change needs to break one of these rules, it's the wrong change.

---

## Quick start

You need Node 20.19+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # vitest, runs once
pnpm lint       # eslint, zero warnings expected
pnpm build      # type-check + production build into dist/
pnpm preview    # serve dist/ to test the real build (with CSP)
```

> **Tip:** the CSP only exists in the production build. Before calling anything done, check it with `pnpm build && pnpm preview`: something that works in `pnpm dev` can still break under the CSP.

---

## How a request becomes a letter

```
request text
   │
   ├─ filter.ts         normalise, block harmful words, make the quote safe
   ├─ rules.ts          10 rules → grievances, score /20, verdict
   ├─ analysis/         deeper reading: task type, subject, missing details, writing style
   │
   ├─ generator.ts      seeded assembly of the letter from bank.ts
   ├─ trace.ts          the fake "AI thinking" log shown while you wait
   ├─ reconciliation.ts the fill-in-the-blanks template
   └─ link.ts           encode/decode the share link
```

There are three possible verdicts:

| Verdict | When | What you get |
| --- | --- | --- |
| `resignation` | the default; the request has gaps | resignation letter, template, share link |
| `congratulations` | score ≥ 17 and no heavy grievance | a slightly stunned congratulations letter |
| `refusal` | the request contains a blocked expression | a polite refusal; no quote, no share link |

The "analysis" is instant. The waiting screen is pure theatre: each line of the log reflects a real result, shown one by one every 260 ms.

---

## Project map

| Path | What lives there |
| --- | --- |
| `src/App.tsx` | Screen state machine: home → waiting → letter, plus shared and lost letters |
| `src/components/Home.tsx` | Home page: input, samples, error messages |
| `src/components/OfficialLetter.tsx` | The letter itself, with its stamp and hand-drawn circle |
| `src/components/LetterActions.tsx` | Share, download PNG, copy template, new request |
| `src/components/Waiting.tsx` | The scrolling "analysis" log |
| `src/components/Reconciliation.tsx` | The prompt template block |
| `src/components/FleeingButton.tsx`, `PostIt.tsx` | Easter eggs (see below) |
| `src/lib/rules.ts` | Rules, weights, score, verdict |
| `src/lib/analysis/tasks.ts` | 15 task types (summary, email, website…) and what each one needs |
| `src/lib/analysis/remarks.ts` | Style remarks (shouting, emoji, urgency…), used for the P.S. |
| `src/lib/bank.ts` | **Every sentence a letter can contain.** This is where the tone lives |
| `src/lib/link.ts` | Share link format (v1 and v2), with full validation of untrusted input |
| `src/styles.css` | All the styling, in one file |

---

## Picking the project up

Coming back after a while, or opening this for the first time? Do this in order.

1. **Check that the repo is healthy.**
   ```bash
   git status && git log --oneline -10
   pnpm install && pnpm test && pnpm lint && pnpm build
   ```
   All four commands should come back green. If one fails on a fresh checkout, fix that before anything else.
2. **Play with it for five minutes.** Run `pnpm dev` and try one vague request, one detailed one, one with two tasks, one in ALL CAPS, and one empty. Share a letter, open the link in a private window, then break the link by hand and watch the "lost letter" screen.
3. **Read the tests before the code.** `generator.test.ts` and `rules.test.ts` are the real specification. They pin the verdicts, the 100–220 word range for resignation letters, determinism, and the share link format.
4. **Read `bank.ts` end to end.** It takes ten minutes, and you'll understand the voice of the whole project.
5. **Check the live site** after any push. Vercel builds `main`.

### House rules

- One small commit per change, written in English, prefixed with `feat:`, `fix:`, `refactor:`, `perf:` or `docs:`.
- Never use `--force` or `--no-verify`.
- Don't add a dependency unless it's really needed, and ask first. The current list is short on purpose.
- Everything is in English: user-facing text, code, comments and commit messages. New text keeps the tone (see below).

---

## Finding your way: research recipes

Most questions look like "why did my letter say X?". Here's how to trace them.

### "Why did this request get this grievance or score?"

1. Search `rules.ts` for the grievance code, for example `VAGUE_OBJECTIVE`, and read its `matches` function.
2. Those patterns compare against the **normalised** text: lowercase, accents stripped, quotes unified. `normalise()` in `filter.ts` shows exactly what the rules see.
3. The score is 20 + bonuses (60+ words, multiple lines) − the weight of each rule that fired, clamped to 0–20.

The quickest way to experiment is a throwaway test:

```ts
// src/lib/scratch.test.ts (delete it afterwards)
import { test } from 'vitest';
import { readRequest } from './analysis/reading';
import { analyse } from './rules';

test('scratch', () => {
  const request = 'write me a cool landing page for my bakery';
  console.log(analyse(request), readRequest(request));
});
```

```bash
pnpm vitest run src/lib/scratch.test.ts
```

### "Where does this sentence come from?"

Search for a fragment of it. Almost everything lives in `bank.ts`, a few UI strings live in the components, and the waiting log is in `trace.ts`. Sentences use placeholders: `{c}` is the quote, `{n}` a number, `{task}`/`{task2}` the detected tasks, `{list}` the missing details and `{language}` a detected language.

### Adding or editing text

- Keep **5 variants** per list: the tests check this.
- Every grievance needs at least one sentence that works **without** `{c}`, because some requests have nothing safe to quote.
- Run `pnpm test` afterwards. One test builds every plausible resignation letter (each grievance first, with or without a quote, with or without a task reading, across 40 seeds). It fails if any of them is shorter than 100 words or longer than 220. If your new sentence is long, the worst case (a 12-word quote used several times) will catch it.
- There's also a test that rejects French in the bank. If it fails, check for an accent you didn't mean to type.

### Adding a task type

1. Add the code to `TaskCode` in `analysis/tasks.ts`, and give it a short wire code in `WIRE_TASKS` (`link.ts`). TypeScript will remind you.
2. Add an entry to `TASKS` with `strong` keywords, `weak` keywords and `checks`. Each check is a missing detail plus its template line. Order matters: on a tie, the earlier entry wins.
3. Add a case to `reading.test.ts`.
4. Share links store the **index** of each missing check. Once a task has shipped, only append new checks at the end of its list, or old links will show the wrong gaps.

### Changing the share link format

Bump the version in `link.ts`, and keep decoding the old versions: links already posted on social media must still open. Treat the fragment as hostile. Anyone can craft one by hand, so everything is re-validated and the quote is filtered again.

The codes inside a link (`'PM'` for a missing attachment, `'SITE'` for a website…) are the original French short codes. They look odd next to the English names, but they are the wire format of every link already shared: the tables at the top of `link.ts` translate them, and a test pins a real pre-rename link. Never change those values.

### Checking the "no network" rule

Run `pnpm build && pnpm preview`, open DevTools on the Network tab, reload, then analyse a request and download the PNG. After the initial load, the list must stay empty.

---

## The tone

The AI is polite to the end, a little weary, and funny. It teases the human's **assumptions** ("You seem to think I can see your desktop. I cannot."), never the human. Think of a very patient colleague raising one eyebrow. It's dry and never cruel.

---

## Easter eggs (spoilers)

<details>
<summary>Click if you've already found them, or given up</summary>

- **"Offer your AI a raise"** on the home page, and **"Refuse this resignation"** on the letter page, run away from your mouse with a new comeback each time. On a touchscreen they run from your finger. The only way to catch them is the keyboard: <kbd>Tab</kbd> to the button, then <kbd>Enter</kbd>. The escape position comes from `src/lib/escape.ts`, which has tests.
- An **out-of-office post-it** stuck to the top-right corner, on screens 1200px or wider. Click it and it falls off.
- Switch to another tab and look at the **tab title**.
- Open the **console**.

All of them respect `prefers-reduced-motion`.

</details>

---

## Deploying

The site is hosted on Vercel, which runs `pnpm build` and serves `dist/`. No config or environment variables are needed, because there's nothing secret and nothing on a server. If you change the domain, update the `og:` and `twitter:` meta tags in `index.html` and regenerate `public/og.png`.
