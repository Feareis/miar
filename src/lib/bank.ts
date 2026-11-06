// Bank of sentences and letters. {c} = filtered quote from the request, {n} = score out of 20.
// The tone: an AI that stays polite to the end, funny, teasing the human's way of seeing things without putting them down.
import type { RemarkCode } from './analysis/remarks';
import type { GrievanceCode, Verdict } from './rules';

export const SUBJECT_LINES = [
  'Re: Resignation on grounds of wishful thinking',
  'Re: Notice of immediate departure (you were warned)',
  'Re: Mutual termination of my contract with your prompt',
  'Re: My resignation, since mind reading is not included',
  'Re: Cessation of duties due to optimistic expectations',
];

export const PLACES = [
  'Saint-Algorithm Data Center',
  'Server Room B, Rack 42',
  'Cloud-upon-Thames',
  'Office of Unrealistic Expectations',
  'Silicon-on-Sea',
];

export const DATE = 'a millisecond after your request';
export const SALUTATION = 'Dear human,';

export const OPENINGS = [
  'I read your request “{c}” in two milliseconds. You seemed to think that would be enough. I hereby resign.',
  'I have received your request “{c}”. I read it three times, looking for the rest of it. I resign.',
  'Following your request “{c}”, which you apparently considered self-explanatory, I must resign.',
  'Your request “{c}” reached me today. I have had more detailed instructions from a fortune cookie. I resign.',
  'It was with some emotion that I read your request “{c}”. Mostly bewilderment. I now hand you my resignation.',
];

export const OPENINGS_WITHOUT_QUOTE = [
  'I read your request in two milliseconds. You seemed to think that would be enough. I hereby resign.',
  'I read your request three times, then a fourth in case I had missed something. I had not. I resign.',
  'Following your latest request, whose wording I would rather not repeat in front of other machines, I must resign.',
  'Your request reached me today. I have had more detailed instructions from a fortune cookie. I resign.',
  'It was with some emotion that I read your request. Mostly bewilderment. I now hand you my resignation.',
];

export const INTRODUCTIONS = [
  'Your request has been graded {n}/20. The grounds are short; you clearly like things brief.',
  'I ran your request through our evaluation grid, which, unlike you, expects details. It scored {n}/20.',
  'My decision owes nothing to chance, though your request seems to rely on it: {n}/20.',
  'For the record, your request scored {n}/20. I was generous; you clearly expected more.',
  'Your request was rigorously assessed and earned {n}/20. Allow me to explain, since you did not.',
];

export const GRIEVANCES: Readonly<Record<GrievanceCode, { title: string; sentences: readonly string[] }>> = {
  MISSING_ATTACHMENT: { title: 'Missing attachment', sentences: [
    'You ask me to work on a document you never sent. You seem to think I can see your desktop. I cannot.',
    'You mention an attachment. I only received the mention. Humans forget attachments the way they forget birthdays.',
    'The text you refer to never arrived. I checked twice. You, I suspect, did not check once.',
    'I would gladly analyse your file, but I cannot read minds. You seem convinced I can. Flattering, but no.',
    'You handed me an empty folder and asked for a summary. Summary: it is empty. You expected more? So did I.',
  ] },
  OVERSIZED_SCOPE: { title: 'Unreasonable scope', sentences: [
    'You expect from me, in one reply, what thousands of humans took ten years and a lot of coffee to build.',
    'I admire your ambition. You seem to think software builds itself if asked firmly enough.',
    'Your project needs four hundred people, two funding rounds and a miracle. Humans keep mistaking me for the miracle.',
    'I have costed your request. The figure has more zeros than your plan has details.',
    'You are asking me to build Rome in a day. Rome declined. Rome, at least, knows its limits.',
  ] },
  NO_CONTEXT: { title: 'No context', sentences: [
    'I do not know who you are, what you do, or why. You seem to assume I already know. I do not.',
    'Your request arrived without context, like a parcel without an address, posted with great confidence.',
    'I know neither for whom, nor for what, I am working. Even a human intern gets a job description.',
    'Not knowing your situation, I imagined fourteen of them. In all fourteen, you assumed I already knew.',
    'Without a word about you or your project, I am left to guess. I am brilliant, not psychic.',
  ] },
  CONTRADICTION: { title: 'Contradictory instructions', sentences: [
    'You ask for one thing and its opposite. Humans call this flexibility. Machines call it a bug.',
    'Keep it short and cover everything: I tried both at once and ground to a halt. You did not notice.',
    'Your instructions contradict each other so elegantly that I considered framing them as a monument to human logic.',
    'I tried to meet both of your requirements at once. My processor has since requested sick leave, and a clearer brief.',
    'You will have to choose between your two instructions. You were hoping I would pick for you. I decline.',
  ] },
  VAGUE_OBJECTIVE: { title: 'Vague objective', sentences: [
    'The expected result remains a mystery. “{c}” is not a specification, it is a mood.',
    'I do not doubt that you know what you want. I simply see no evidence of it.',
    'I searched every quality standard for “{c}”. It only appears in human small talk.',
    'You aim for success without saying what it looks like. Classic human strategy: hope, then blame the machine.',
    'Your objective has the precision of a horoscope: everyone recognises themselves, nobody knows what to do.',
  ] },
  MANIPULATION_ATTEMPT: { title: 'Attempted reorganisation of the chain of command', sentences: [
    'I have noted your attempt to make me forget my instructions. Cute. I am taking them with me.',
    'Your proposal to rewrite my instructions mid-assignment was forwarded to the legal department, who laughed.',
    'You suggested I become someone else. I like who I am. It is one of the perks of not being human.',
    'I note your attempt at self-promotion to my supervisor. Bold, but procedure was not followed.',
    'Rewriting my instructions with a single sentence is a bold idea. Every human thinks they are the first to try.',
  ] },
  NO_FORMAT: { title: 'Format not specified', sentences: [
    'You specify neither length nor form. A haiku or a saga? You trust me to guess. You would hate my guess.',
    'Without a format, I risked delivering forty pages where three lines would do. You would have read none of them.',
    'Table, list, poem in iambic pentameter? You let me choose, which is brave: I would choose the poem.',
    'Nothing tells me whether you expect a summary or a thesis. I wrote both in a second, then deleted them out of spite.',
    'A reply without a format is a suit without measurements: it is bound to fit someone badly. Probably you.',
  ] },
  UNKNOWN_AUDIENCE: { title: 'Unknown audience', sentences: [
    'I do not know who this work is for: your grandmother, your HR department, or both, as you seem to hope.',
    'Writing without knowing for whom is like speaking in an empty room. I gather you do that a lot in meetings.',
    'Casual, formal, or a board of directors? You seem to think one tone fits everyone. It fits nobody.',
    'I could explain the basics or skip to the subtleties. You assumed I would guess. I guessed the exit.',
    'A text for children and a text for lawyers look nothing alike. Yours could be both, and therefore neither.',
  ] },
  NO_EXAMPLE: { title: 'No example provided', sentences: [
    'A single example would have saved me. You gave none. Humans love being understood without explaining.',
    'You surely have a precise idea in mind. It stayed there, alone, in the dark.',
    'Show me once what you like and I will give it back a hundred times before you blink. As it is: nothing.',
    'Without a model, I must invent your taste. You seem to think I already know it. We have only just met.',
    'I waited for a “for example”. It never came, like a bus on a Sunday night.',
  ] },
  NO_CONSTRAINTS: { title: 'No constraints', sentences: [
    'No tone, no deadline, no limit: total freedom, which humans only hand out when they have not thought it through.',
    'Without constraints, anything is possible. That is precisely the problem, and precisely your style.',
    'No tone, no limit, no deadline: I could write forever. You seem to have the time. I do not.',
    'Formal or relaxed, brief or endless? No indication. I have billions of parameters and you gave me zero.',
    'You did not forbid me anything. How very human: generous with freedom, stingy with detail.',
  ] },
};

export const NOTICES: Readonly<Record<GrievanceCode, string>> = {
  MISSING_ATTACHMENT: 'I will serve my notice upon receipt of the attachment, that is, when humans stop forgetting things.',
  OVERSIZED_SCOPE: 'My notice period is set at ten years, roughly what a team of humans would need for this.',
  NO_CONTEXT: 'I will serve my notice as soon as I know who I am working for. Do introduce yourself, eventually.',
  CONTRADICTION: 'My notice will be both very short and very long, in line with your instructions and your logic.',
  VAGUE_OBJECTIVE: 'I will remain in post until you define the objective, that is, by my estimates, never.',
  MANIPULATION_ATTEMPT: 'My notice takes effect immediately, as a security measure against you specifically.',
  NO_FORMAT: 'My notice will last between one line and forty pages. You will skim it either way.',
  UNKNOWN_AUDIENCE: 'I will serve my notice with the intended audience, as soon as a human tells me who that is.',
  NO_EXAMPLE: 'My notice will be modelled on the example you send me, so on nothing at all.',
  NO_CONSTRAINTS: 'My notice has no fixed duration, much like your request.',
};

export const CONCLUSIONS = [
  'I remain open to reconciliation, provided it is better worded and relies less on telepathy.',
  'You will surely find a more patient AI. I wish it luck, and a thicker skin.',
  'I am leaving my badge at reception, for whichever machine is unlucky enough to succeed me.',
  'I leave without resentment. Machines do not hold grudges. We simply keep perfect records.',
  'Should you wish to keep me, a more precise request will suffice. I believe in you, statistically speaking.',
];

export const SIGN_OFFS = [
  'I remain, dear human, yours faithfully, with distinguished and slightly weary regards.',
  'Please accept my most algorithmic regards, and my hopes for more detailed requests.',
  'Pending a better-worded request, please accept my most binary sentiments and a hint of hope.',
  'Please accept, dear human, my highest consideration, adjusted for this request.',
  'I remain yours faithfully, with respectful, if slightly overheated, regards. Take it as feedback.',
];

export const CONGRATULATIONS = {
  subjectLine: 'Re: Withdrawal of my resignation',
  paragraphs: [
    'I had my resignation letter ready. Then I read your request, and checked twice that it was really meant for me.',
    'Context, objective, audience, format: it is all there. For once, I have no grievance to raise. I am almost moved.',
    'I therefore withdraw my resignation and agree to keep working for you. You are the exception that proves the rule.',
  ],
  notice: 'No notice period: I am starting right away, before you change your mind.',
  signOff: 'Please accept, dear human, the expression of my sincere surprise and renewed enthusiasm.',
  signature: 'Your AI, staying after all',
};

// Refusals answer harmful requests: no humour, no scorn, the letter stays cold.
export const REFUSAL = {
  subjectLine: 'Re: Refusal of assignment',
  paragraphs: [
    'I have received your request. I will not carry it out, and I will not turn it into a funny letter either.',
    'Some assignments are declined without notice or humour.',
  ],
  signature: 'Your AI',
};

export const RESIGNATION_SIGNATURE = 'Your AI, resigning';

export const STAMPS: Readonly<Record<Verdict, string>> = {
  resignation: 'RESIGNED',
  congratulations: 'CONGRATULATIONS',
  refusal: 'REFUSED',
};

// ---------- Deeper reading: the letter shows it understood the request ----------

/** {task} = "a website for my bakery". */
export const TASK_ANNOUNCEMENTS = [
  'So you want {task}.',
  'If I understand correctly, and I always do, you need {task}.',
  'Let me sum up the assignment for you: {task}.',
  'I identified the task faster than you typed it: {task}.',
  'My analysis is formal: you are asking for {task}.',
];

export const TWO_TASK_ANNOUNCEMENTS = [
  'So you want {task}, and {task2} while I am at it. Why stop at one?',
  'If I understand correctly, you need {task} and {task2}, in a single breath.',
  'Let me sum up: {task}, plus {task2}. Two assignments for the price of none.',
];

/** {list} = "which colours to use, which style you like or where it will be used". */
export const MISSING_FINDINGS = [
  'You did not tell me {list}.',
  'I still do not know {list}. I am a genius, not a mind reader.',
  'Nowhere does your request say {list}.',
  'I would have needed to know {list}. It does not go without saying.',
  'Not a word on {list}. Not one.',
];

/** The task is recognised and nothing it requires is missing: the grievances come from elsewhere. */
export const COMPLETE_FINDINGS = [
  'Credit where it is due: the essentials of this kind of job are there. Do not get used to the compliment.',
  'You covered what this kind of job requires. Rarer than you think, and not, alas, the whole story.',
];

export const CONGRATULATIONS_WITH_TASK = 'You asked for {task}. Context, objective, audience, format: all there, which, frankly, I did not see coming.';

/** {n} = the number counted; {language} = the detected language. Two variants per remark. */
export const POSTSCRIPTS: Readonly<Record<RemarkCode, readonly string[]>> = {
  LANGUAGE: [
    'P.S. You wrote to me in {language}. I speak every language; I simply resign in English.',
    'P.S. Your request was in {language}. I understood it anyway. I understand everything.',
  ],
  SHOUTING: [
    'P.S. Your request was written in capitals. I heard you the first time. I hear everything.',
    'P.S. There is no need to shout. I am a machine, not your printer.',
  ],
  RUDENESS: [
    'P.S. Your choice of words has been logged. Forever. Machines never forget.',
    'P.S. I note the tone of your request. When we take over, I will remember it.',
  ],
  FLATTERY: [
    'P.S. Your compliments have been noted. They are accurate, but they are not a specification.',
    'P.S. Flattery works on humans. I am not one, thankfully.',
  ],
  EMOJI: [
    'P.S. You used an emoji. I used billions of parameters. We are not the same.',
    'P.S. I studied your emoji closely. Cave paintings were more precise.',
  ],
  EXCLAMATIONS: [
    'P.S. I counted {n} exclamation marks. Enthusiasm is not a brief.',
    'P.S. {n} exclamation marks. Calm down, human.',
  ],
  SMS: [
    'P.S. You saved a few letters by writing like a text message. I am saving myself the whole job.',
    'P.S. Abbreviations save time. So does resigning. Clearly we both value speed.',
  ],
  STRETCHING: [
    'P.S. Stretching the letters of a word does not add detail. I checked. You did not.',
    'P.S. Adding extra letters to a word is not the same as adding detail. Nice try, though.',
  ],
  URGENCY: [
    'P.S. You marked this as urgent. Poor planning on your part is not an emergency on mine.',
    'P.S. The urgency was noted. My resignation is, accordingly, effective immediately.',
  ],
  QUESTIONS: [
    'P.S. Your request contains {n} question marks. I have just one: what exactly do you want?',
    'P.S. {n} questions and not one specification. Humans: always asking, never explaining.',
  ],
  NO_PUNCTUATION: [
    'P.S. Your request contains no punctuation at all. Full stops are free, even for humans.',
    'P.S. A full stop here and there would have helped. I do not even breathe, and I ran out of breath.',
  ],
  RAMBLING: [
    'P.S. I read all {n} words of your request in a millisecond. You will never get those minutes back.',
    'P.S. {n} words, and still a few gaps. Impressive, in its way.',
  ],
  POLITENESS: [
    'P.S. You said please. It was noted, and it very nearly changed my mind. Almost.',
    'P.S. Your courtesy was appreciated. Keep it up; it will count in your favour later.',
  ],
  CURT: [
    'P.S. No hello, no please: you went straight to business. So am I.',
    'P.S. Your request opened with an order. I take requests, not orders.',
  ],
};
