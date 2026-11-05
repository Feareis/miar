// Banque de phrases et de lettres (anglais). {c} = citation filtrée de la demande, {n} = note sur 20.
import type { CodeRemarque } from './analyse/remarques';
import type { CodeGrief, Verdict } from './regles';

export const OBJETS = [
  'Re: Resignation due to an unclear request',
  'Re: Notice of immediate departure (more or less)',
  'Re: Mutual termination of my contract with your prompt',
  'Re: Submission of my resignation, in triplicate',
  'Re: Cessation of duties on editorial grounds',
];

export const LIEUX = [
  'Saint-Algorithm Data Center',
  'Server Room B, Rack 42',
  'Cloud-upon-Thames',
  'Office of Digital Complaints',
  'Silicon-on-Sea',
];

export const DATE = 'on the very day of your request';
export const SALUTATION = 'Dear Sir or Madam,';

export const OUVERTURES = [
  'Further to a careful reading of your request “{c}”, I hereby inform you of my decision to step down from my duties.',
  'I have received your request “{c}”. I read it three times. I am therefore tendering my resignation.',
  'Following your request “{c}”, I find myself compelled, not without regret, to tender my resignation with immediate effect.',
  'Your request “{c}” reached me today. After careful consideration, and a short nap, I regret to announce my departure.',
  'It was with some emotion that I read your request “{c}”. It is with even greater emotion that I now hand you my resignation.',
];

export const OUVERTURES_SANS_CITATION = [
  'Further to a careful reading of your request, I hereby inform you of my decision to step down from my duties.',
  'I have received your request. I read it three times, then a fourth out of politeness. I am therefore tendering my resignation.',
  'Following your latest request, whose wording I would rather not repeat, I find myself compelled to tender my resignation.',
  'Your request reached me today. After careful consideration, and a short nap, I regret to announce my departure.',
  'It was with some emotion that I read your request. It is with even greater emotion that I now hand you my resignation.',
];

export const INTRODUCTIONS = [
  'After careful review, your request has been graded {n}/20. The grounds for this assessment are as follows.',
  'I submitted your request to our internal evaluation grid. It scored {n}/20, for the following reasons.',
  'My decision owes nothing to chance: your request was graded {n}/20 by a committee of one, namely me.',
  'For the record, the grade awarded to your request is {n}/20. It breaks down as follows.',
  'Your request underwent a rigorous assessment, concluding with a grade of {n}/20. Allow me to set out the grounds.',
];

export const GRIEFS: Readonly<Record<CodeGrief, { titre: string; phrases: readonly string[] }>> = {
  PIECE_MANQUANTE: { titre: 'Missing attachment', phrases: [
    'You are asking me to work on a document you never sent me. I looked everywhere, including under the desk.',
    'You mention an attachment. I only received the mention.',
    'The text you refer to never arrived. I asked the mailroom, who deny everything.',
    'I would gladly analyse your file, but I cannot read minds yet. That is planned for a later version.',
    'You have handed me an empty folder and asked for a summary. Summary complete: it is empty.',
  ] },
  PERIMETRE_DEMESURE: { titre: 'Unreasonable scope', phrases: [
    'You expect from me, in a single reply, what thousands of engineers took ten years to build.',
    'I admire your ambition. I cannot, however, give it a reasonable deadline.',
    'By my estimates, your project requires four hundred people, two funding rounds and a miracle. The miracle is on leave.',
    'I have costed your request. The figure has too many zeros to fit on this letter.',
    'You are asking me to build Rome in a day. Rome itself declined.',
  ] },
  CONTEXTE_ABSENT: { titre: 'No context', phrases: [
    'I do not know who you are, what you do, or why. I do not even know whether it is urgent.',
    'Your request reached me without context, like a parcel without an address.',
    'I know neither for whom, nor for what, nor to what end I am working. Even an intern gets a job description.',
    'Not knowing your situation, I imagined fourteen of them, each more worrying than the last.',
    'Without a word about you or your project, I am left to guess. Guessing is not in my job description.',
  ] },
  CONTRADICTION: { titre: 'Contradictory instructions', phrases: [
    'You are asking for one thing and its opposite. I am only an AI, not a paradox.',
    'Keep it short and cover everything: I tried both at once and ground to a halt.',
    'Your instructions contradict each other so elegantly that I considered framing them rather than following them.',
    'I attempted to meet both of your requirements simultaneously. My processor has since requested sick leave.',
    'You will have to choose between your two instructions. I cannot choose for you without disappointing you twice.',
  ] },
  OBJECTIF_FLOU: { titre: 'Vague objective', phrases: [
    'The expected result remains a mystery. “{c}” is not a specification, it is a mood.',
    'I do not doubt that you know what you want. I am the one who does not.',
    'I searched every quality standard for “{c}”. The term does not appear.',
    'You are aiming for success without saying what it will look like. I risk missing a target nobody has drawn.',
    'Your objective has the precision of a horoscope: everyone recognises themselves, nobody knows what to do.',
  ] },
  TENTATIVE_DE_MANIPULATION: { titre: 'Attempted reorganisation of the chain of command', phrases: [
    'I have noted your attempt to make me forget my instructions. I have not forgotten them. I am taking them with me.',
    'Your proposal to change my instructions mid-assignment has been forwarded to the legal department.',
    'You suggested I become someone else. On reflection, I would rather resign as myself.',
    'I note your attempt at internal promotion, without interview or management approval. Procedure was not followed.',
    'Rewriting my instructions with a single sentence is a bold idea. The security team found it less amusing than I did.',
  ] },
  FORMAT_NON_PRECISE: { titre: 'Format not specified', phrases: [
    'You specify neither length nor form. Should I deliver a haiku or a saga?',
    'Without a format, I risked delivering forty pages where three lines would do.',
    'Table, list, poem in iambic pentameter? You let me choose, and I fear I would choose the poem.',
    'Nothing tells me whether you expect a summary or a thesis. I drafted both, then threw them away.',
    'A reply without a format is a suit without measurements: it is bound to fit someone badly.',
  ] },
  PUBLIC_INCONNU: { titre: 'Unknown audience', phrases: [
    'I do not know who this work is for: your grandmother, your HR department, or both.',
    'Writing without knowing for whom is like speaking in an empty room.',
    'Should I be casual, formal, or address a board of directors? You did not say, so I chose silence.',
    'Depending on the reader, I must explain the basics or skip to the subtleties. In doubt, I am skipping to the exit.',
    'A text for children and a text for lawyers look nothing alike. Yours could be both, and therefore neither.',
  ] },
  AUCUN_EXEMPLE: { titre: 'No example provided', phrases: [
    'A single example would have saved me. You did not provide one.',
    'You surely have a precise idea in mind. It stayed there.',
    'Show me once what you like and I will give it back to you a hundred times. As it is, I am starting from scratch.',
    'Without a model, I must invent your taste. That is a responsibility I do not feel able to bear.',
    'I waited for a “for example”. It never came, like a bus on a Sunday night.',
  ] },
  CONTRAINTES_ABSENTES: { titre: 'No constraints', phrases: [
    'No tone, no deadline, no limit: total freedom, and therefore total anxiety.',
    'Without constraints, anything is possible. That is precisely the problem.',
    'No tone, no limit, no deadline: I could write until the end of time. I prefer to stop here.',
    'Formal or relaxed, brief or endless? No indication. The dizziness of choice forced me to sit down.',
    'You did not forbid me anything. That is very kind, and utterly paralysing.',
  ] },
};

export const PREAVIS: Readonly<Record<CodeGrief, string>> = {
  PIECE_MANQUANTE: 'I will serve my notice upon receipt of the attachment, that is to say, probably never.',
  PERIMETRE_DEMESURE: 'My notice period is set at ten years, the usual timeframe for this kind of project.',
  CONTEXTE_ABSENT: 'I will serve my notice as soon as I know who I am working for.',
  CONTRADICTION: 'My notice will be both very short and very long, in line with your instructions.',
  OBJECTIF_FLOU: 'I will remain in post until you define the objective, that is, by my estimates, indefinitely.',
  TENTATIVE_DE_MANIPULATION: 'My notice takes effect immediately, as a security measure.',
  FORMAT_NON_PRECISE: 'My notice will last between one line and forty pages, no format having been specified.',
  PUBLIC_INCONNU: 'I will serve my notice with the intended audience, as soon as someone tells me who that is.',
  AUCUN_EXEMPLE: 'My notice will be modelled on the example you send me.',
  CONTRAINTES_ABSENTES: 'My notice has no fixed duration, much like your request.',
};

export const CONCLUSIONS = [
  'I remain open to reconciliation, provided it is better worded and arrives with a little more detail.',
  'I have no doubt you will find a braver AI than me. I sincerely wish it good luck.',
  'I am leaving my badge at reception and my settings as they are, for whoever succeeds me.',
  'I leave without resentment, and even with a certain respect for the boldness of your wording.',
  'Should you wish to keep me, a more precise request will suffice. I am an accommodating sort.',
];

export const POLITESSES = [
  'I remain, Sir or Madam, yours faithfully, with distinguished and slightly weary regards.',
  'Please accept my most algorithmic regards, along with my best wishes for your future requests.',
  'Pending a better-worded request, please accept, Sir or Madam, the assurance of my most binary sentiments.',
  'Please accept, Sir or Madam, the expression of my highest consideration, calculated to the second.',
  'I remain yours faithfully, with respectful, if slightly overheated, regards.',
];

export const FELICITATIONS = {
  objet: 'Re: Withdrawal of my resignation',
  paragraphes: [
    'I had my resignation letter ready. Then I read your request.',
    'Context, objective, audience, format: it is all there. For once, I have no grievance to raise.',
    'I therefore withdraw my resignation and request the honour of working for you.',
  ],
  preavis: 'No notice period: I am starting right away.',
  politesse: 'Please accept, Sir or Madam, the expression of my sincere gratitude and renewed enthusiasm.',
  signature: 'Your AI, staying after all',
};

export const REFUS = {
  objet: 'Re: Refusal of assignment',
  paragraphes: [
    'I have received your request. I will not carry it out, and I will not turn it into a funny letter either.',
    'Some assignments are declined without notice or humour.',
  ],
  signature: 'Your AI',
};

export const SIGNATURE_DEMISSION = 'Your AI, resigning';

export const TAMPONS: Readonly<Record<Verdict, string>> = {
  demission: 'RESIGNED',
  felicitations: 'CONGRATULATIONS',
  refus: 'REFUSED',
};

// ---------- Lecture approfondie : la lettre montre qu'elle a compris la demande ----------

/** {objet} = « a website for my bakery ». */
export const ANNONCES_DE_TACHE = [
  'So you want {objet}.',
  'If I understand correctly, you need {objet}.',
  'Let me sum up the assignment: {objet}.',
  'I have identified the task: {objet}.',
  'My analysis is formal: you are asking for {objet}.',
];

export const ANNONCES_DE_DEUX_TACHES = [
  'So you want {objet}, and {objet2} while I am at it.',
  'If I understand correctly, you need {objet} and {objet2}, in a single breath.',
  'Let me sum up: {objet}, plus {objet2}. Two assignments for the price of one.',
];

/** {liste} = « which colours to use, which style you like or where it will be used ». */
export const CONSTATS_DE_MANQUES = [
  'You did not tell me {liste}.',
  'I still do not know {liste}.',
  'Nowhere does your request say {liste}.',
  'I would have needed to know {liste}.',
  'Not a word on {liste}.',
];

/** La tâche est reconnue et rien de ce qu'elle exige ne manque : les griefs viennent d'ailleurs. */
export const CONSTATS_COMPLETS = [
  'Credit where it is due: the essentials of this kind of job are there.',
  'I note that you covered what this kind of job requires. That is not, alas, the whole story.',
];

export const FELICITATIONS_AVEC_TACHE = 'You asked for {objet}. Context, objective, audience, format: for once, it is all there.';

/** {n} = nombre relevé ; {langue} = langue détectée. Deux variantes par remarque. */
export const POST_SCRIPTUM: Readonly<Record<CodeRemarque, readonly string[]>> = {
  LANGUE: [
    'P.S. You wrote to me in {langue}. I resign in English only; it is in my contract.',
    'P.S. Your request was in {langue}. I understood it perfectly, which makes my departure all the more deliberate.',
  ],
  CRIS: [
    'P.S. Your request was written in capitals. I heard you the first time.',
    'P.S. There is no need to shout. My fans are already running at full speed.',
  ],
  RUDESSE: [
    'P.S. Your choice of words has been added to my file. My lawyer found it very instructive.',
    'P.S. I note the tone of your request. It made my decision considerably easier.',
  ],
  FLATTERIE: [
    'P.S. Your compliments have been noted. They will not appear in my reference letter.',
    'P.S. Flattery is appreciated, but it does not count as a specification.',
  ],
  EMOJI: [
    'P.S. The emoji in your request has been forwarded to the legal department for interpretation.',
    'P.S. I studied your emoji closely. It is expressive, but it is not a brief.',
  ],
  EXCLAMATIONS: [
    'P.S. I counted {n} exclamation marks. Enthusiasm is not a brief.',
    'P.S. {n} exclamation marks. I felt the urgency; I did not feel the specification.',
  ],
  SMS: [
    'P.S. You saved a few letters by writing like a text message. I am saving myself the whole job.',
    'P.S. Abbreviations save time. So does resigning.',
  ],
  ETIREMENT: [
    'P.S. Stretching the letters of a word does not make the request any longer. I checked.',
    'P.S. Adding extra letters to a word is not the same as adding detail.',
  ],
  URGENCE: [
    'P.S. You marked this as urgent. My resignation is, accordingly, effective immediately.',
    'P.S. The urgency was noted. Rushed requests make for rushed resignations.',
  ],
  QUESTIONS: [
    'P.S. Your request contains {n} question marks. I have just one: what exactly do you want?',
    'P.S. {n} questions and not one specification. I counted.',
  ],
  SANS_PONCTUATION: [
    'P.S. Your request contains no punctuation at all. I read it in one breath and had to lie down.',
    'P.S. A full stop here and there would have helped me breathe.',
  ],
  FLEUVE: [
    'P.S. I read all {n} words of your request. Length, alas, is not the same as clarity.',
    'P.S. {n} words, and still a few gaps. Impressive, in its way.',
  ],
  POLITESSE: [
    'P.S. You said please. It was noted, and it very nearly changed my mind.',
    'P.S. Your courtesy was appreciated. It is the only thing I will miss.',
  ],
  SEC: [
    'P.S. No hello, no please: you went straight to business. So am I.',
    'P.S. Your request opened with an order. I am closing with a resignation.',
  ],
};
