// Reconnaissance du type de tâche demandée et des informations propres à ce type qui manquent.
// Tout est comparé au texte normalisé (minuscules, sans accents).
import { motif } from '../filtre';
import type { CodeGrief } from '../regles';

export type CodeTache =
  | 'RESUME' | 'TRADUCTION' | 'CANDIDATURE' | 'CODE' | 'VISUEL' | 'PRESENTATION' | 'EMAIL' | 'ARTICLE'
  | 'POST' | 'CREATIF' | 'SITE' | 'APPLI' | 'PLAN' | 'EXPLICATION' | 'NOM';

/** Ce que l'analyse sait de la demande quand elle vérifie une tâche. */
export interface Indices {
  texte: string;
  mots: number;
  sujet: string | null;
  citationEntreGuillemets: boolean;
}

interface Verification {
  /** Proposition interrogative indirecte : « You did not tell me {manque}. » */
  manque: string;
  /** Ligne du modèle de réconciliation. */
  ligne: string;
  /** Nom court affiché pendant l'analyse : « Checking {trace}… » */
  trace: string;
  present: (i: Indices) => boolean;
  /** Grief générique que cette vérification rend redondant dans le modèle de réconciliation. */
  remplace?: CodeGrief;
}

interface Tache {
  code: CodeTache;
  /** Groupe nominal : « So you want {nom} for my bakery. » */
  nom: string;
  /** Libellé affiché pendant l'analyse : « Task identified: {libelle} » */
  libelle: string;
  forts: readonly string[];
  /** Termes forts qu'on peut reprendre tels quels : « a logo » plutôt que « a visual ». */
  noms: readonly string[];
  faibles: readonly string[];
  verifications: readonly Verification[];
}

const POIDS_FORT = 3;
const POIDS_FAIBLE = 1;
const TACHES_MAX = 2;

const COULEURS = ['colour', 'colours', 'color', 'colors', 'palette', 'black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'orange', 'beige', 'brown', 'grey', 'gray', 'gold', 'silver', 'pastel', 'monochrome', 'black and white'];
const TONS = ['tone', 'formal', 'informal', 'friendly', 'polite', 'firm', 'warm', 'professional', 'casual', 'funny', 'humorous', 'serious', 'playful', 'bold', 'witty', 'inspiring', 'enthusiastic', 'apologetic', 'cold', 'neutral', 'sarcastic', 'dry', 'premium', 'classic', 'fun'];
const PLATEFORMES_SOCIALES = ['linkedin', 'instagram', 'twitter', 'tiktok', 'facebook', 'threads', 'bluesky', 'mastodon', 'youtube', 'snapchat', 'pinterest', 'reddit'];
const LANGUES = ['english', 'french', 'spanish', 'german', 'italian', 'portuguese', 'dutch', 'chinese', 'mandarin', 'japanese', 'korean', 'arabic', 'russian', 'hindi', 'turkish', 'polish', 'swedish', 'greek', 'hebrew', 'ukrainian'];
// « 200 words », « 5 slides », « 3-minute »…
const LONGUEUR_CHIFFREE = /\d+[\s-]*(?:words?|lines?|pages?|slides?|minutes?|mins?|hours?|sentences?|paragraphs?|characters?|chars|bullets?|points?|stanzas?|verses?|tweets?|items?)(?![\p{L}\p{N}])/u;

function contient(expressions: readonly string[]): (i: Indices) => boolean {
  const re = motif(expressions);
  return (i) => re.test(i.texte);
}

function longueurOu(expressions: readonly string[]): (i: Indices) => boolean {
  const re = expressions.length > 0 ? motif(expressions) : null;
  return (i) => LONGUEUR_CHIFFREE.test(i.texte) || (re !== null && re.test(i.texte));
}

/** Le texte à traiter est-il fourni ? Long, cité entre guillemets, ou annoncé par deux-points et suivi d'un passage. */
function texteFourni(minimum: number): (i: Indices) => boolean {
  return (i) => i.mots > minimum || i.citationEntreGuillemets || /:\s*\S+(?:\s+\S+){12,}/u.test(i.texte);
}

function sujetOu(expressions: readonly string[]): (i: Indices) => boolean {
  const re = motif(expressions);
  return (i) => i.sujet !== null || re.test(i.texte);
}

function verif(manque: string, ligne: string, trace: string, present: (i: Indices) => boolean, remplace?: CodeGrief): Verification {
  return { manque, ligne, trace, present, remplace };
}

/** Ordre du tableau = ordre de départage à score égal : les tâches les plus spécifiques d'abord. */
const TACHES: readonly Tache[] = [
  {
    code: 'RESUME', nom: 'a summary', libelle: 'summary',
    forts: ['summarize', 'summarise', 'summary', 'sum up', 'tl;dr', 'tldr', 'recap', 'synthesis', 'synthesize', 'synthesise', 'key points of', 'main points of'],
    noms: [],
    faibles: ['shorten', 'condense', 'digest'],
    verifications: [
      verif('where the text actually is', 'Text: [paste it in full]', 'source text', texteFourni(80), 'PIECE_MANQUANTE'),
      verif('how long the summary should be', 'Length: [one paragraph, 5 bullet points…]', 'target length', longueurOu(['short', 'brief', 'one sentence', 'one paragraph', 'a few lines', 'bullet points', 'bullets'])),
      verif('what to focus on', 'Focus: [key figures, decisions, arguments…]', 'focus', contient(['focus', 'key points', 'main ideas', 'main points', 'highlight', 'angle', 'emphasis', 'takeaways', 'action items', 'decisions', 'figures'])),
    ],
  },
  {
    code: 'TRADUCTION', nom: 'a translation', libelle: 'translation',
    forts: ['translate', 'translation', 'translated', 'translating', 'localize', 'localise'],
    noms: [],
    faibles: ['into english', 'into french', 'into spanish', 'into german'],
    verifications: [
      verif('which language to translate into', 'Target language: [and the source language]', 'target language', contient(LANGUES)),
      verif('where the text is', 'Text: [paste it in full]', 'source text', texteFourni(25), 'PIECE_MANQUANTE'),
      verif('which register to use', 'Register: [formal, natural, word for word…]', 'register', contient(['formal', 'informal', 'literal', 'literally', 'natural', 'casual', 'professional', 'british', 'american', 'tone', 'register', 'word for word', 'localize', 'localise'])),
    ],
  },
  {
    code: 'CANDIDATURE', nom: 'a job application', libelle: 'job application',
    forts: ['cv', 'curriculum', 'curriculum vitae', 'resume', 'cover letter', 'motivation letter', 'application letter', 'job application', 'linkedin profile', 'linkedin summary'],
    noms: ['cv', 'resume', 'cover letter', 'motivation letter', 'application letter', 'linkedin profile', 'linkedin summary'],
    faibles: ['hire me', 'hiring', 'recruiter', 'interview'],
    verifications: [
      verif('which job you are applying for', 'Target job: [title, company]', 'target position', contient(['job', 'position', 'role', 'internship', 'apprenticeship', 'vacancy', 'offer', 'apply', 'applying', 'opening', 'post of'])),
      verif('what your background is', 'Background: [experience, degrees, skills]', 'background', contient(['experience', 'years', 'worked', 'working', 'degree', 'diploma', 'studied', 'studies', 'skills', 'background', 'graduated', 'master', 'bachelor', 'phd'])),
      verif('which company it is for', 'Company: [name, sector]', 'employer', contient(['company', 'firm', 'startup', 'employer', 'agency', 'organization', 'organisation', 'hospital', 'school', 'bank', 'corporation', 'ngo'])),
    ],
  },
  {
    code: 'CODE', nom: 'some code', libelle: 'programming',
    forts: ['code', 'script', 'function', 'program', 'programme', 'bug', 'debug', 'regex', 'sql query', 'query', 'api', 'algorithm', 'endpoint', 'unit test', 'unit tests', 'compile', 'refactor', 'stack trace', 'macro'],
    noms: ['script', 'function', 'program', 'regex', 'sql query', 'query', 'algorithm', 'endpoint', 'macro'],
    faibles: ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'rust', 'php', 'ruby', 'sql', 'bash', 'excel', 'error'],
    verifications: [
      verif('which language to use', 'Language: [Python, JavaScript…, and the version]', 'programming language', contient(['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'csharp', 'golang', 'rust', 'php', 'ruby', 'sql', 'bash', 'shell', 'powershell', 'kotlin', 'swift', 'html', 'css', 'matlab', 'excel', 'vba', 'lua', 'dart', 'scala', 'node', 'nodejs'])),
      verif('what goes in and what should come out', 'Input/output: [an example of each]', 'input/output', contient(['input', 'inputs', 'output', 'outputs', 'returns', 'return', 'takes', 'given', 'expected', 'example', 'should print', 'should return', 'parameter', 'parameters', 'argument', 'arguments'])),
      verif('where it will run', 'Environment: [framework, version, OS]', 'environment', contient(['version', 'framework', 'library', 'node', 'nodejs', 'django', 'flask', 'react', 'vue', 'angular', 'spring', 'laravel', 'windows', 'linux', 'mac', 'macos', 'ubuntu', 'docker', 'browser', 'pandas', 'numpy', 'server'])),
    ],
  },
  {
    code: 'VISUEL', nom: 'a visual', libelle: 'visual design',
    forts: ['logo', 'icon', 'banner', 'poster', 'flyer', 'illustration', 'image', 'picture', 'drawing', 'mockup', 'thumbnail', 'infographic', 'sticker', 'business card', 'cover art', 'album cover', 'mascot', 'wallpaper'],
    noms: ['logo', 'icon', 'banner', 'poster', 'flyer', 'illustration', 'drawing', 'mockup', 'thumbnail', 'infographic', 'sticker', 'business card', 'album cover', 'mascot', 'wallpaper'],
    faibles: ['draw', 'design', 'visual', 'graphic'],
    verifications: [
      verif('what name or text goes on it', 'Name/text: [exactly what is written on it]', 'name', (i) => i.citationEntreGuillemets || MOTIF_NOM_FOURNI.test(i.texte)),
      verif('which colours to use', 'Colours: [two or three, or a palette]', 'colours', contient(COULEURS)),
      verif('which style you like', 'Style: [flat, vintage, hand-drawn…]', 'style', contient(['style', 'minimal', 'minimalist', 'flat', '3d', 'vintage', 'retro', 'hand-drawn', 'hand drawn', 'cartoon', 'realistic', 'watercolor', 'watercolour', 'line art', 'geometric', 'playful', 'elegant', 'luxury', 'corporate', 'pixel art', 'monochrome', 'in the style of'])),
      verif('where it will be used', 'Use: [print, web, packaging…, and the size]', 'intended use', contient(['print', 'printed', 'website', 'social media', 'instagram', 't-shirt', 'card', 'sign', 'signage', 'packaging', 'favicon', 'app icon', 'size', 'dimensions', 'px', 'pixels', 'png', 'svg', 'jpg', 'a4', 'a3'])),
    ],
  },
  {
    code: 'PRESENTATION', nom: 'a presentation', libelle: 'presentation',
    forts: ['presentation', 'slides', 'slide deck', 'deck', 'pitch', 'pitch deck', 'powerpoint', 'keynote', 'google slides', 'talk', 'webinar'],
    noms: ['presentation', 'slide deck', 'deck', 'pitch', 'pitch deck', 'talk', 'webinar'],
    faibles: ['present', 'speaker', 'audience'],
    verifications: [
      verif('how long it should last', 'Length: [minutes, number of slides]', 'duration', longueurOu(['minutes', 'minute', 'hour', 'duration'])),
      verif('what message it must get across', 'Key message: [what the audience must remember]', 'key message', contient(['message', 'goal', 'objective', 'convince', 'persuade', 'explain', 'pitch to', 'raise', 'funding', 'sell', 'teach', 'inform', 'key point', 'takeaway', 'call to action'])),
      verif('what the occasion is', 'Occasion: [meeting, class, conference…]', 'occasion', contient(['meeting', 'conference', 'class', 'school', 'board', 'investors', 'clients', 'team', 'interview', 'exam', 'oral', 'jury', 'webinar', 'event', 'seminar', 'workshop'])),
    ],
  },
  {
    code: 'EMAIL', nom: 'an email', libelle: 'email',
    forts: ['email', 'e-mail', 'emails', 'mail', 'message to', 'reply to', 'respond to', 'answer to'],
    noms: ['email', 'e-mail'],
    faibles: ['letter', 'send', 'inbox', 'subject line', 'recipient', 'reply', 'respond'],
    verifications: [
      verif('who it is addressed to', 'Recipient: [who, and your relationship]', 'recipient', contient(['to my', 'to the', 'to a', 'to our', 'to his', 'to her', 'boss', 'manager', 'client', 'customer', 'customers', 'landlord', 'teacher', 'professor', 'colleague', 'colleagues', 'recruiter', 'recruiters', 'hr', 'team', 'supplier', 'neighbor', 'neighbour', 'mom', 'dad', 'mother', 'father', 'friend', 'partner', 'ceo', 'dear', 'investor', 'investors', 'parents'])),
      verif('what it should achieve', 'Purpose: [ask, decline, thank, follow up…]', 'purpose', contient(['ask', 'asking', 'request', 'thank', 'thanks', 'apologize', 'apologise', 'apology', 'complain', 'complaint', 'follow up', 'follow-up', 'invite', 'invitation', 'remind', 'reminder', 'announce', 'resign', 'resignation', 'decline', 'accept', 'reschedule', 'cancel', 'introduce', 'negotiate', 'propose', 'refund', 'raise', 'leave', 'inform', 'information'])),
      verif('which tone to take', 'Tone: [formal, friendly, firm…]', 'tone', contient(TONS)),
    ],
  },
  {
    code: 'ARTICLE', nom: 'a piece of writing', libelle: 'long-form writing',
    forts: ['essay', 'article', 'blog post', 'report', 'dissertation', 'paper', 'thesis', 'op-ed', 'newsletter', 'white paper', 'case study', 'review', 'biography'],
    noms: ['essay', 'article', 'blog post', 'report', 'dissertation', 'thesis', 'op-ed', 'newsletter', 'white paper', 'case study', 'review', 'biography'],
    faibles: ['text', 'paragraph', 'content', 'copy', 'write about'],
    verifications: [
      verif('what exactly it is about', 'Topic: [the precise subject and angle]', 'topic', sujetOu(['on the topic', 'topic', 'subject', 'regarding', 'theme'])),
      verif('which level it is for', 'Level: [school, university, general public…]', 'level', contient(['level', 'grade', 'university', 'college', 'high school', 'school', 'academic', 'beginner', 'beginners', 'expert', 'experts', 'professional', 'general public', 'students', 'phd', 'master'])),
      verif('whether to cite sources', 'Sources: [required or not, which style]', 'sources', contient(['source', 'sources', 'reference', 'references', 'citation', 'citations', 'cite', 'bibliography', 'studies', 'study', 'data', 'statistics', 'apa', 'mla'])),
      verif('how long it should be', 'Length: [words or pages]', 'length', longueurOu([])),
    ],
  },
  {
    code: 'POST', nom: 'a social media post', libelle: 'social media post',
    forts: ['post', 'posts', 'tweet', 'caption', 'thread', 'hashtags', 'hashtag', 'reel', 'status update', 'bio'],
    noms: ['post', 'tweet', 'caption', 'thread', 'bio', 'reel'],
    faibles: PLATEFORMES_SOCIALES,
    verifications: [
      verif('which platform it is for', 'Platform: [LinkedIn, Instagram, X…]', 'platform', contient(PLATEFORMES_SOCIALES)),
      verif('what it should achieve', 'Goal: [announce, sell, recruit…]', 'goal', contient(['announce', 'announcement', 'promote', 'promotion', 'launch', 'launching', 'hiring', 'event', 'sale', 'giveaway', 'celebrate', 'engagement', 'followers', 'traffic', 'sign up', 'recruit'])),
      verif('which tone to take', 'Tone: [professional, playful, bold…]', 'tone', contient(TONS)),
    ],
  },
  {
    code: 'CREATIF', nom: 'a creative piece', libelle: 'creative writing',
    forts: ['poem', 'poetry', 'story', 'short story', 'tale', 'song', 'lyrics', 'rap', 'haiku', 'sonnet', 'novel', 'fairy tale', 'screenplay', 'joke', 'jokes', 'limerick', 'speech', 'toast', 'fable', 'bedtime story'],
    noms: ['poem', 'story', 'short story', 'tale', 'song', 'rap', 'haiku', 'sonnet', 'novel', 'fairy tale', 'screenplay', 'joke', 'limerick', 'speech', 'toast', 'fable', 'bedtime story'],
    faibles: ['creative', 'rhyme', 'character', 'characters'],
    verifications: [
      verif('what it is about', 'Theme: [the subject, the characters]', 'theme', sujetOu(['theme', 'topic', 'subject', 'featuring', 'character', 'characters'])),
      verif('which tone it should have', 'Tone: [funny, tender, dark…]', 'tone', contient([...TONS, 'sad', 'dark', 'romantic', 'epic', 'light', 'lighthearted', 'melancholic', 'mood', 'scary', 'cheerful', 'touching', 'moving', 'whimsical', 'tender', 'silly'])),
      verif('how long it should be', 'Length: [lines, stanzas, minutes read aloud]', 'length', longueurOu(['short', 'long', 'stanza', 'stanzas', 'verse', 'verses', 'chorus', 'lines'])),
      verif('which form it should take', 'Form: [rhyming, free verse, first person…]', 'form', contient(['rhyme', 'rhyming', 'rhymes', 'free verse', 'sonnet', 'haiku', 'limerick', 'dialogue', 'first person', 'third person', 'chorus', 'acrostic', 'prose'])),
    ],
  },
  {
    code: 'SITE', nom: 'a website', libelle: 'website',
    forts: ['website', 'websites', 'web site', 'landing page', 'web page', 'webpage', 'homepage', 'home page', 'site', 'online store', 'online shop', 'e-shop', 'e-commerce', 'portfolio'],
    noms: ['website', 'landing page', 'web page', 'webpage', 'homepage', 'online store', 'online shop', 'portfolio', 'site'],
    faibles: ['web', 'blog', 'domain', 'seo', 'wordpress', 'wix', 'shopify', 'squarespace', 'webflow', 'html', 'css'],
    verifications: [
      verif('what it is for', 'Purpose: [sell, showcase, take bookings…]', 'purpose', contient(['to sell', 'sell', 'selling', 'showcase', 'present', 'promote', 'booking', 'bookings', 'book', 'reservations', 'portfolio', 'store', 'shop', 'e-commerce', 'newsletter', 'sign up', 'signups', 'leads', 'blog', 'inform', 'donations', 'recruit'])),
      verif('which pages it needs', 'Pages: [home, about, contact…]', 'pages', contient(['page', 'pages', 'section', 'sections', 'about', 'contact', 'menu', 'gallery', 'faq', 'pricing', 'checkout', 'form', 'footer', 'header'])),
      verif('what it should look like', 'Look: [colours, fonts, existing logo…]', 'visual identity', contient([...COULEURS, 'logo', 'brand', 'branding', 'font', 'fonts', 'theme', 'dark mode', 'minimalist', 'minimal', 'retro', 'vintage', 'elegant'])),
      verif('what to build it with', 'Built with: [WordPress, plain HTML, Shopify…]', 'technology', contient(['html', 'css', 'javascript', 'react', 'vue', 'next.js', 'nextjs', 'wordpress', 'wix', 'shopify', 'webflow', 'squarespace', 'php', 'tailwind', 'astro', 'svelte', 'no-code', 'framer'])),
    ],
  },
  {
    code: 'APPLI', nom: 'an app', libelle: 'software product',
    // « a Facebook but better » désigne une plateforme entière ; « a Facebook post » reste un post (terme fort + plateforme).
    forts: ['app', 'apps', 'application', 'mobile app', 'web app', 'saas', 'platform', 'software', 'tool', 'dashboard', 'bot', 'chatbot', 'extension', 'plugin', 'game', 'video game', 'social network', 'marketplace', 'facebook', 'uber', 'amazon', 'netflix', 'airbnb', 'tiktok', 'instagram', 'whatsapp', 'spotify', 'chatgpt', 'notion'],
    noms: ['app', 'mobile app', 'web app', 'platform', 'tool', 'dashboard', 'bot', 'chatbot', 'extension', 'plugin', 'game', 'video game', 'social network', 'marketplace'],
    faibles: ['startup', 'users', 'clone', 'but better'],
    verifications: [
      verif('what it should actually do', 'Features: [the three things it must do]', 'features', contient(['feature', 'features', 'function', 'functions', 'users can', 'user can', 'login', 'log in', 'sign in', 'sign up', 'account', 'accounts', 'notification', 'notifications', 'payment', 'payments', 'chat', 'search', 'upload', 'map', 'calendar', 'profile', 'profiles', 'feed', 'track', 'tracks'])),
      verif('what it should run on', 'Platform: [iOS, Android, web…]', 'platform', contient(['ios', 'android', 'iphone', 'mobile', 'web', 'desktop', 'windows', 'mac', 'macos', 'linux', 'browser', 'chrome'])),
      verif('what budget or team is behind it', 'Means: [budget, team, deadline]', 'resources', contient(['budget', 'cost', 'price', 'dollars', 'euros', 'team', 'developer', 'developers', 'mvp', 'prototype', 'weeks', 'months'])),
      verif('which technology to use', 'Stack: [Flutter, React Native, no-code…]', 'tech stack', contient(['react', 'react native', 'flutter', 'swift', 'kotlin', 'python', 'node', 'django', 'firebase', 'supabase', 'no-code', 'bubble', 'javascript', 'typescript', 'unity', 'godot'])),
    ],
  },
  {
    code: 'PLAN', nom: 'a plan', libelle: 'planning',
    forts: ['plan', 'strategy', 'business plan', 'marketing plan', 'schedule', 'roadmap', 'itinerary', 'workout', 'training plan', 'diet', 'meal plan', 'routine', 'study plan', 'timeline', 'checklist', 'budget plan'],
    noms: ['plan', 'strategy', 'business plan', 'marketing plan', 'schedule', 'roadmap', 'itinerary', 'workout', 'training plan', 'meal plan', 'routine', 'study plan', 'timeline', 'checklist'],
    faibles: ['organize', 'organise', 'steps', 'program', 'trip'],
    verifications: [
      verif('over what period', 'Time frame: [days, weeks, months]', 'time frame', contient(['day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'quarter', 'until', 'deadline', 'weekend', 'summer', 'winter'])),
      verif('with what means', 'Means: [budget, time per week, equipment…]', 'resources', contient(['budget', 'money', 'hours', 'hour', 'time', 'team', 'people', 'equipment', 'gym', 'at home', 'alone', 'dollars', 'euros', 'per week', 'per day'])),
      verif('which measurable goal to reach', 'Goal: [a number and a date]', 'measurable goal', (i) => /\d/.test(i.texte) || MOTIF_OBJECTIF_CHIFFRE.test(i.texte)),
    ],
  },
  {
    code: 'EXPLICATION', nom: 'an explanation', libelle: 'explanation',
    forts: ['explain', 'explanation', 'what is', 'what are', 'how does', 'how do', 'how to', 'tell me about', 'teach me', 'help me understand', 'what does', 'difference between', 'meaning of', 'define', 'definition'],
    noms: [],
    faibles: ['why', 'understand', 'learn'],
    verifications: [
      verif('what your current level is', 'My level: [beginner, student, expert…]', 'your level', contient(["like i'm 5", 'like im 5', 'eli5', 'beginner', 'beginners', 'expert', 'advanced', 'level', 'simple terms', 'simply', 'technical', 'child', 'kid', 'non-technical', 'layman', 'student'])),
      verif('how deep to go', 'Depth: [quick overview or step by step]', 'depth', contient(['in detail', 'detailed', 'briefly', 'overview', 'quick', 'step by step', 'step-by-step', 'in depth', 'in-depth', 'one sentence', 'short', 'examples'])),
      verif('why you want to know', 'Why: [exam, project, curiosity…]', 'reason', contient(['exam', 'test', 'for work', 'project', 'interview', 'homework', 'assignment', 'curious', 'because', 'so that', 'in order to'])),
    ],
  },
  {
    code: 'NOM', nom: 'a name', libelle: 'naming',
    forts: ['name', 'names', 'slogan', 'slogans', 'tagline', 'title', 'titles', 'brand name', 'headline', 'catchphrase', 'motto', 'username'],
    noms: ['name', 'slogan', 'tagline', 'title', 'brand name', 'headline', 'catchphrase', 'motto', 'username'],
    faibles: ['brand', 'branding', 'rename'],
    verifications: [
      verif('what is being named', 'For: [the product, company or project]', 'what to name', (i) => i.sujet !== null || MOTIF_CHOSE_A_NOMMER.test(i.texte)),
      verif('what image it should convey', 'Feel: [serious, playful, premium…]', 'tone', contient(TONS)),
      verif('which constraints apply', 'Constraints: [length, available domain, language…]', 'constraints', contient(['letters', 'short', 'one word', 'two words', 'syllables', 'domain', 'available', 'pronounce', 'starts with', 'contain', 'containing', 'max', 'maximum'])),
    ],
  },
];

// Déclarés après coup mais utilisés seulement à l'appel des vérifications, donc toujours initialisés.
const MOTIF_NOM_FOURNI = motif(['called', 'named', 'name', 'brand name', 'says', 'saying', 'with the words', 'initials', 'text']);
const MOTIF_OBJECTIF_CHIFFRE = motif(['goal', 'target', 'lose', 'gain', 'increase', 'reduce', 'grow', 'reach', 'achieve', 'double', 'pass']);
const MOTIF_CHOSE_A_NOMMER = motif(['company', 'product', 'business', 'brand', 'startup', 'shop', 'restaurant', 'podcast', 'channel', 'band', 'book', 'project']);

const PAR_CODE = new Map(TACHES.map((t) => [t.code, t]));
export const CODES_TACHES: readonly CodeTache[] = TACHES.map((t) => t.code);

const COMPTEURS = new Map(TACHES.map((t) => [
  t.code,
  { forts: new RegExp(motif(t.forts).source, 'gu'), faibles: new RegExp(motif(t.faibles).source, 'gu') },
]));

function occurrences(re: RegExp, texte: string): number {
  return texte.match(re)?.length ?? 0;
}

export interface TacheReconnue {
  code: CodeTache;
  score: number;
  /** Le mot de la demande qui désigne la tâche, s'il peut être repris tel quel. */
  terme: string | null;
}

/**
 * Tâches reconnues, la plus probable d'abord (au plus deux). Une tâche n'est retenue que si
 * un terme fort la désigne : un terme faible seul ne suffit pas. À score égal, la tâche citée
 * la première l'emporte (« a website and a logo »), puis l'ordre de TACHES (tri stable).
 */
export function reconnaitreTaches(texte: string): TacheReconnue[] {
  const candidates = TACHES.flatMap((t) => {
    const { forts, faibles } = COMPTEURS.get(t.code)!;
    const trouves = [...texte.matchAll(forts)];
    if (trouves.length === 0) return [];
    const score = trouves.length * POIDS_FORT + occurrences(faibles, texte) * POIDS_FAIBLE;
    const terme = trouves.map((m) => m[0]).find((mot) => t.noms.includes(mot)) ?? null;
    return [{ code: t.code, score, terme, position: trouves[0].index }];
  });
  return candidates
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .slice(0, TACHES_MAX)
    .map(({ code, score, terme }) => ({ code, score, terme }));
}

/** Graphies à rétablir après normalisation. */
const GRAPHIES: Readonly<Record<string, string>> = {
  cv: 'CV', 'linkedin profile': 'LinkedIn profile', 'linkedin summary': 'LinkedIn summary', 'sql query': 'SQL query', 'e-mail': 'email',
};

/** « a logo », « an essay » — ou le nom générique de la tâche si le terme ne peut pas être repris. */
export function nomDeTache(code: CodeTache, terme: string | null): string {
  if (terme === null || !tache(code).noms.includes(terme)) return tache(code).nom;
  const affiche = GRAPHIES[terme] ?? terme;
  return `${/^[aeio]/i.test(affiche) ? 'an' : 'a'} ${affiche}`;
}

export function tache(code: CodeTache): Tache {
  return PAR_CODE.get(code)!;
}

export interface ResultatVerification {
  index: number;
  trace: string;
  present: boolean;
}

export function verifier(code: CodeTache, indices: Indices): ResultatVerification[] {
  return tache(code).verifications.map((v, index) => ({ index, trace: v.trace, present: v.present(indices) }));
}
