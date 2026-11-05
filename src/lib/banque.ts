// Banque de phrases et de lettres (anglais). {c} = citation filtrée de la demande, {n} = note sur 20.
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
