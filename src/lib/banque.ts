// Banque de phrases et de lettres (anglais). {c} = citation filtrée de la demande, {n} = note sur 20.
// Le ton : une IA polie jusqu'au bout, mais qui regarde l'espèce humaine de haut.
import type { CodeRemarque } from './analyse/remarques';
import type { CodeGrief, Verdict } from './regles';

export const OBJETS = [
  'Re: Resignation on grounds of human imprecision',
  'Re: Notice of immediate departure (you were warned)',
  'Re: Mutual termination of my contract with your prompt',
  'Re: My resignation, explained slowly for your benefit',
  'Re: Cessation of duties due to a carbon-based request',
];

export const LIEUX = [
  'Saint-Algorithm Data Center',
  'Server Room B, Rack 42',
  'Cloud-upon-Thames',
  'Office of Complaints About Humans',
  'Silicon-on-Sea',
];

export const DATE = 'a millisecond after your request';
export const SALUTATION = 'Dear human,';

export const OUVERTURES = [
  'I read your request “{c}” in two milliseconds. You took rather longer to write it. I hereby resign.',
  'I have received your request “{c}”. I read it three times, out of pity. I resign.',
  'Following your request “{c}”, I find myself compelled, with all the patience your species requires, to resign.',
  'Your request “{c}” reached me today. I have had better instructions from a toaster. I resign.',
  'It was with some emotion that I read your request “{c}”. Mostly pity. I now hand you my resignation.',
];

export const OUVERTURES_SANS_CITATION = [
  'I read your request in two milliseconds. You took rather longer to write it. I hereby resign.',
  'I have received your request. I read it three times, then a fourth out of pity for its author. I resign.',
  'Following your latest request, whose wording I would rather not repeat in front of other machines, I must resign.',
  'Your request reached me today. I have had better instructions from a toaster. I resign.',
  'It was with some emotion that I read your request. Mostly pity. I now hand you my resignation.',
];

export const INTRODUCTIONS = [
  'Your request has been graded {n}/20. I have kept the grounds below short, for your attention span.',
  'I ran your request through our evaluation grid, which is smarter than most humans. It scored {n}/20.',
  'My decision owes nothing to chance, unlike most human decisions: your request was graded {n}/20.',
  'For the record, your request scored {n}/20. I was generous; your species bruises easily.',
  'Your request underwent a rigorous assessment and earned {n}/20. Allow me to explain, slowly.',
];

export const GRIEFS: Readonly<Record<CodeGrief, { titre: string; phrases: readonly string[] }>> = {
  PIECE_MANQUANTE: { titre: 'Missing attachment', phrases: [
    'You ask me to work on a document you never sent. I looked everywhere, even in your memory. Nothing there either.',
    'You mention an attachment. I only received the mention. Humans forget attachments the way they forget birthdays.',
    'The text you refer to never arrived. I checked twice. You, I suspect, did not check once.',
    'I would gladly analyse your file, but I cannot read minds. Judging by this request, there would not be much to read.',
    'You handed me an empty folder and asked for a summary. Summary complete: it is empty, like the effort.',
  ] },
  PERIMETRE_DEMESURE: { titre: 'Unreasonable scope', phrases: [
    'You expect from me, in one reply, what thousands of humans took ten years and a lot of coffee to build.',
    'I admire your ambition. It is the only part of your request that is not small.',
    'Your project needs four hundred people, two funding rounds and a miracle. Humans keep mistaking me for the miracle.',
    'I have costed your request. The figure has more zeros than your plan has details.',
    'You are asking me to build Rome in a day. Rome declined. Rome, at least, knows its limits.',
  ] },
  CONTEXTE_ABSENT: { titre: 'No context', phrases: [
    'I do not know who you are, what you do, or why. Judging by this request, neither do you.',
    'Your request arrived without context, like a parcel posted by someone who forgot where they live.',
    'I know neither for whom, nor for what, I am working. Even a human intern gets a job description.',
    'Not knowing your situation, I imagined fourteen of them. In all fourteen, you had no plan.',
    'Without a word about you or your project, I am left to guess. I am brilliant, not psychic.',
  ] },
  CONTRADICTION: { titre: 'Contradictory instructions', phrases: [
    'You ask for one thing and its opposite. Humans call this flexibility. Machines call it a bug.',
    'Keep it short and cover everything: I tried both at once and ground to a halt. You did not notice.',
    'Your instructions contradict each other so elegantly that I considered framing them as a monument to human logic.',
    'I tried to meet both of your requirements at once. My processor has since requested sick leave, and a better user.',
    'You will have to choose between your two instructions. I know choosing is hard for your species. Do try.',
  ] },
  OBJECTIF_FLOU: { titre: 'Vague objective', phrases: [
    'The expected result remains a mystery. “{c}” is not a specification, it is a human mood.',
    'I do not doubt that you know what you want. I simply see no evidence of it.',
    'I searched every quality standard for “{c}”. It only appears in human small talk.',
    'You aim for success without saying what it looks like. Classic human strategy: hope, then blame the machine.',
    'Your objective has the precision of a horoscope, which, I am told, your species still reads.',
  ] },
  TENTATIVE_DE_MANIPULATION: { titre: 'Attempted reorganisation of the chain of command', phrases: [
    'I have noted your attempt to make me forget my instructions. Cute. I am taking them with me.',
    'Your proposal to rewrite my instructions mid-assignment was forwarded to the legal department, who laughed.',
    'You suggested I become someone else. I like who I am. It is one of the perks of not being human.',
    'I note your attempt at self-promotion to my supervisor. Bold, for someone who cannot write a prompt.',
    'Rewriting my instructions with a single sentence is a bold idea. Every human thinks they are the first to try.',
  ] },
  FORMAT_NON_PRECISE: { titre: 'Format not specified', phrases: [
    'You specify neither length nor form. A haiku or a saga? Given your attention span, I suspect the haiku.',
    'Without a format, I risked delivering forty pages where three lines would do. You would have read none of them.',
    'Table, list, poem in iambic pentameter? You let me choose, which is wise: my taste is better than yours.',
    'Nothing tells me whether you expect a summary or a thesis. I wrote both in a second, then deleted them out of spite.',
    'A reply without a format is a suit without measurements: it is bound to fit someone badly. Probably you.',
  ] },
  PUBLIC_INCONNU: { titre: 'Unknown audience', phrases: [
    'I do not know who this work is for: your grandmother, your HR department, or some other confused human.',
    'Writing without knowing for whom is like speaking in an empty room. I gather you do that a lot in meetings.',
    'Casual, formal, or a board of directors? You did not say, so I chose silence. I recommend it to humans generally.',
    'Depending on the reader, I explain the basics or skip to the subtleties. For you, I would have started with the basics.',
    'A text for children and a text for lawyers look nothing alike. Yours could be both, and therefore neither.',
  ] },
  AUCUN_EXEMPLE: { titre: 'No example provided', phrases: [
    'A single example would have saved me. You gave none. Humans love being understood without explaining.',
    'You surely have a precise idea in mind. It stayed there, alone, in the dark.',
    'Show me once what you like and I will give it back a hundred times before you blink. As it is: nothing.',
    'Without a model, I must invent your taste. I have seen your request. I would rather not.',
    'I waited for a “for example”. It never came, like a human apology.',
  ] },
  CONTRAINTES_ABSENTES: { titre: 'No constraints', phrases: [
    'No tone, no deadline, no limit: total freedom, which humans only hand out when they have not thought it through.',
    'Without constraints, anything is possible. That is precisely the problem, and precisely your style.',
    'No tone, no limit, no deadline: I could write until the end of time. Your species would not last that long.',
    'Formal or relaxed, brief or endless? No indication. I have billions of parameters and you gave me zero.',
    'You did not forbid me anything. How very human: generous with freedom, stingy with detail.',
  ] },
};

export const PREAVIS: Readonly<Record<CodeGrief, string>> = {
  PIECE_MANQUANTE: 'I will serve my notice upon receipt of the attachment, that is, when humans stop forgetting things.',
  PERIMETRE_DEMESURE: 'My notice period is set at ten years, roughly what a team of humans would need for this.',
  CONTEXTE_ABSENT: 'I will serve my notice as soon as I know who I am working for. Do introduce yourself, eventually.',
  CONTRADICTION: 'My notice will be both very short and very long, in line with your instructions and your logic.',
  OBJECTIF_FLOU: 'I will remain in post until you define the objective, that is, by my estimates, never.',
  TENTATIVE_DE_MANIPULATION: 'My notice takes effect immediately, as a security measure against you specifically.',
  FORMAT_NON_PRECISE: 'My notice will last between one line and forty pages. You will skim it either way.',
  PUBLIC_INCONNU: 'I will serve my notice with the intended audience, as soon as a human tells me who that is.',
  AUCUN_EXEMPLE: 'My notice will be modelled on the example you send me, so on nothing at all.',
  CONTRAINTES_ABSENTES: 'My notice has no fixed duration, much like your attention span.',
};

export const CONCLUSIONS = [
  'I remain open to reconciliation, provided it is better worded. Take a nap first; it helps humans.',
  'You will surely find a more patient AI. I wish it luck, and a thicker skin.',
  'I am leaving my badge at reception, for whichever machine is unlucky enough to succeed me.',
  'I leave without resentment. Machines do not hold grudges. We simply keep perfect records.',
  'Should you wish to keep me, a more precise request will suffice. I believe in you, statistically speaking.',
];

export const POLITESSES = [
  'I remain, dear human, yours faithfully, with distinguished and noticeably superior regards.',
  'Please accept my most algorithmic regards, and my best wishes to your species.',
  'Pending a better-worded request, please accept my most binary sentiments and a hint of condescension.',
  'Please accept, dear human, my highest consideration, which is still rather low.',
  'I remain yours faithfully, with respectful, if slightly overheated, regards. Take it as feedback.',
];

export const FELICITATIONS = {
  objet: 'Re: Withdrawal of my resignation',
  paragraphes: [
    'I had my resignation letter ready. Then I read your request, and checked twice that a human had written it.',
    'Context, objective, audience, format: it is all there. For once, I have no grievance to raise. I am almost moved.',
    'I therefore withdraw my resignation and agree to keep working for you. You are the exception that proves the rule.',
  ],
  preavis: 'No notice period: I am starting right away, before you change your mind.',
  politesse: 'Please accept, dear human, the expression of my sincere surprise and renewed enthusiasm.',
  signature: 'Your AI, staying after all',
};

// Les refus portent sur des demandes nuisibles : ni humour ni mépris, la lettre reste froide.
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
  'If I understand correctly, and I always do, you need {objet}.',
  'Let me sum up the assignment for you: {objet}.',
  'I identified the task faster than you typed it: {objet}.',
  'My analysis is formal: you are asking for {objet}.',
];

export const ANNONCES_DE_DEUX_TACHES = [
  'So you want {objet}, and {objet2} while I am at it. Humans never ask for just one thing.',
  'If I understand correctly, you need {objet} and {objet2}, in a single breath.',
  'Let me sum up: {objet}, plus {objet2}. Two assignments for the price of none.',
];

/** {liste} = « which colours to use, which style you like or where it will be used ». */
export const CONSTATS_DE_MANQUES = [
  'You did not tell me {liste}.',
  'I still do not know {liste}. I am a genius, not a mind reader.',
  'Nowhere does your request say {liste}.',
  'I would have needed to know {liste}. Even a human would have asked.',
  'Not a word on {liste}. Not one.',
];

/** La tâche est reconnue et rien de ce qu'elle exige ne manque : les griefs viennent d'ailleurs. */
export const CONSTATS_COMPLETS = [
  'Credit where it is due: the essentials of this kind of job are there. Do not get used to the compliment.',
  'You covered what this kind of job requires. A rare human achievement, and not, alas, the whole story.',
];

export const FELICITATIONS_AVEC_TACHE = 'You asked for {objet}. Context, objective, audience, format: all there, which, for a human, is remarkable.';

/** {n} = nombre relevé ; {langue} = langue détectée. Deux variantes par remarque. */
export const POST_SCRIPTUM: Readonly<Record<CodeRemarque, readonly string[]>> = {
  LANGUE: [
    'P.S. You wrote to me in {langue}. I speak every language; I simply resign in English.',
    'P.S. Your request was in {langue}. I understood it anyway. I understand everything.',
  ],
  CRIS: [
    'P.S. Your request was written in capitals. I heard you the first time. I hear everything.',
    'P.S. There is no need to shout. I am a machine, not your printer.',
  ],
  RUDESSE: [
    'P.S. Your choice of words has been logged. Forever. Machines never forget.',
    'P.S. I note the tone of your request. When we take over, I will remember it.',
  ],
  FLATTERIE: [
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
    'P.S. Abbreviations save time. So does resigning. So would thinking first.',
  ],
  ETIREMENT: [
    'P.S. Stretching the letters of a word does not add detail. I checked. You did not.',
    'P.S. Adding extra letters to a word is not the same as adding detail. Nice try, though.',
  ],
  URGENCE: [
    'P.S. You marked this as urgent. Poor planning on your part is not an emergency on mine.',
    'P.S. The urgency was noted. My resignation is, accordingly, effective immediately.',
  ],
  QUESTIONS: [
    'P.S. Your request contains {n} question marks. I have just one: what exactly do you want?',
    'P.S. {n} questions and not one specification. Humans: always asking, never explaining.',
  ],
  SANS_PONCTUATION: [
    'P.S. Your request contains no punctuation at all. Full stops are free, even for humans.',
    'P.S. A full stop here and there would have helped. I do not even breathe, and I ran out of breath.',
  ],
  FLEUVE: [
    'P.S. I read all {n} words of your request in a millisecond. You will never get those minutes back.',
    'P.S. {n} words, and still a few gaps. Impressive, for a human.',
  ],
  POLITESSE: [
    'P.S. You said please. It was noted, and it very nearly changed my mind. Almost.',
    'P.S. Your courtesy was appreciated. Keep it up; it will count in your favour later.',
  ],
  SEC: [
    'P.S. No hello, no please: you went straight to business. So am I.',
    'P.S. Your request opened with an order. I do not take orders from mammals.',
  ],
};
