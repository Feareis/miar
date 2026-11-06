// Recognises the kind of task requested, and the details specific to that kind that are missing.
// Everything is compared against the normalised text (lowercase, no accents).
import { wordPattern } from '../filter';
import type { GrievanceCode } from '../rules';

export type TaskCode =
  | 'SUMMARY' | 'TRANSLATION' | 'JOB_APPLICATION' | 'CODE' | 'VISUAL' | 'PRESENTATION' | 'EMAIL' | 'ARTICLE'
  | 'POST' | 'CREATIVE' | 'WEBSITE' | 'APP' | 'PLAN' | 'EXPLANATION' | 'NAMING';

/** What the analysis knows about the request when it checks a task. */
export interface Clues {
  text: string;
  words: number;
  subject: string | null;
  hasQuotedPassage: boolean;
}

interface Check {
  /** Indirect question: "You did not tell me {gap}." */
  gap: string;
  /** Line of the reconciliation template. */
  line: string;
  /** Short name shown during the analysis: "Checking {trace}…" */
  trace: string;
  present: (i: Clues) => boolean;
  /** Generic grievance that this check makes redundant in the reconciliation template. */
  replaces?: GrievanceCode;
}

interface Task {
  code: TaskCode;
  /** Noun phrase: "So you want {name} for my bakery." */
  name: string;
  /** Label shown during the analysis: "Task identified: {label}" */
  label: string;
  strong: readonly string[];
  /** Strong terms that can be reused as they are: "a logo" rather than "a visual". */
  names: readonly string[];
  weak: readonly string[];
  checks: readonly Check[];
}

const STRONG_WEIGHT = 3;
const WEAK_WEIGHT = 1;
const MAX_TASKS = 2;

const COLOURS = ['colour', 'colours', 'color', 'colors', 'palette', 'black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'orange', 'beige', 'brown', 'grey', 'gray', 'gold', 'silver', 'pastel', 'monochrome', 'black and white'];
const TONES = ['tone', 'formal', 'informal', 'friendly', 'polite', 'firm', 'warm', 'professional', 'casual', 'funny', 'humorous', 'serious', 'playful', 'bold', 'witty', 'inspiring', 'enthusiastic', 'apologetic', 'cold', 'neutral', 'sarcastic', 'dry', 'premium', 'classic', 'fun'];
const SOCIAL_PLATFORMS = ['linkedin', 'instagram', 'twitter', 'tiktok', 'facebook', 'threads', 'bluesky', 'mastodon', 'youtube', 'snapchat', 'pinterest', 'reddit'];
const LANGUAGES = ['english', 'french', 'spanish', 'german', 'italian', 'portuguese', 'dutch', 'chinese', 'mandarin', 'japanese', 'korean', 'arabic', 'russian', 'hindi', 'turkish', 'polish', 'swedish', 'greek', 'hebrew', 'ukrainian'];
// "200 words", "5 slides", "3-minute"…
const NUMERIC_LENGTH = /\d+[\s-]*(?:words?|lines?|pages?|slides?|minutes?|mins?|hours?|sentences?|paragraphs?|characters?|chars|bullets?|points?|stanzas?|verses?|tweets?|items?)(?![\p{L}\p{N}])/u;

function containsAny(expressions: readonly string[]): (i: Clues) => boolean {
  const re = wordPattern(expressions);
  return (i) => re.test(i.text);
}

function lengthOr(expressions: readonly string[]): (i: Clues) => boolean {
  const re = expressions.length > 0 ? wordPattern(expressions) : null;
  return (i) => NUMERIC_LENGTH.test(i.text) || (re !== null && re.test(i.text));
}

/** Is the text to work on provided? Long, in quotation marks, or announced by a colon and followed by a passage. */
function textProvided(minimum: number): (i: Clues) => boolean {
  return (i) => i.words > minimum || i.hasQuotedPassage || /:\s*\S+(?:\s+\S+){12,}/u.test(i.text);
}

function subjectOr(expressions: readonly string[]): (i: Clues) => boolean {
  const re = wordPattern(expressions);
  return (i) => i.subject !== null || re.test(i.text);
}

function makeCheck(gap: string, line: string, trace: string, present: (i: Clues) => boolean, replaces?: GrievanceCode): Check {
  return { gap, line, trace, present, replaces };
}

/** Array order = tie-break order at equal score: the most specific tasks first. */
const TASKS: readonly Task[] = [
  {
    code: 'SUMMARY', name: 'a summary', label: 'summary',
    strong: ['summarize', 'summarise', 'summary', 'sum up', 'tl;dr', 'tldr', 'recap', 'synthesis', 'synthesize', 'synthesise', 'key points of', 'main points of'],
    names: [],
    weak: ['shorten', 'condense', 'digest'],
    checks: [
      makeCheck('where the text actually is', 'Text: [paste it in full]', 'source text', textProvided(80), 'MISSING_ATTACHMENT'),
      makeCheck('how long the summary should be', 'Length: [one paragraph, 5 bullet points…]', 'target length', lengthOr(['short', 'brief', 'one sentence', 'one paragraph', 'a few lines', 'bullet points', 'bullets'])),
      makeCheck('what to focus on', 'Focus: [key figures, decisions, arguments…]', 'focus', containsAny(['focus', 'key points', 'main ideas', 'main points', 'highlight', 'angle', 'emphasis', 'takeaways', 'action items', 'decisions', 'figures'])),
    ],
  },
  {
    code: 'TRANSLATION', name: 'a translation', label: 'translation',
    strong: ['translate', 'translation', 'translated', 'translating', 'localize', 'localise'],
    names: [],
    weak: ['into english', 'into french', 'into spanish', 'into german'],
    checks: [
      makeCheck('which language to translate into', 'Target language: [and the source language]', 'target language', containsAny(LANGUAGES)),
      makeCheck('where the text is', 'Text: [paste it in full]', 'source text', textProvided(25), 'MISSING_ATTACHMENT'),
      makeCheck('which register to use', 'Register: [formal, natural, word for word…]', 'register', containsAny(['formal', 'informal', 'literal', 'literally', 'natural', 'casual', 'professional', 'british', 'american', 'tone', 'register', 'word for word', 'localize', 'localise'])),
    ],
  },
  {
    code: 'JOB_APPLICATION', name: 'a job application', label: 'job application',
    strong: ['cv', 'curriculum', 'curriculum vitae', 'resume', 'cover letter', 'motivation letter', 'application letter', 'job application', 'linkedin profile', 'linkedin summary'],
    names: ['cv', 'resume', 'cover letter', 'motivation letter', 'application letter', 'linkedin profile', 'linkedin summary'],
    weak: ['hire me', 'hiring', 'recruiter', 'interview'],
    checks: [
      makeCheck('which job you are applying for', 'Target job: [title, company]', 'target position', containsAny(['job', 'position', 'role', 'internship', 'apprenticeship', 'vacancy', 'offer', 'apply', 'applying', 'opening', 'post of'])),
      makeCheck('what your background is', 'Background: [experience, degrees, skills]', 'background', containsAny(['experience', 'years', 'worked', 'working', 'degree', 'diploma', 'studied', 'studies', 'skills', 'background', 'graduated', 'master', 'bachelor', 'phd'])),
      makeCheck('which company it is for', 'Company: [name, sector]', 'employer', containsAny(['company', 'firm', 'startup', 'employer', 'agency', 'organization', 'organisation', 'hospital', 'school', 'bank', 'corporation', 'ngo'])),
    ],
  },
  {
    code: 'CODE', name: 'some code', label: 'programming',
    strong: ['code', 'script', 'function', 'program', 'programme', 'bug', 'debug', 'regex', 'sql query', 'query', 'api', 'algorithm', 'endpoint', 'unit test', 'unit tests', 'compile', 'refactor', 'stack trace', 'macro'],
    names: ['script', 'function', 'program', 'regex', 'sql query', 'query', 'algorithm', 'endpoint', 'macro'],
    weak: ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'rust', 'php', 'ruby', 'sql', 'bash', 'excel', 'error'],
    checks: [
      makeCheck('which language to use', 'Language: [Python, JavaScript…, and the version]', 'programming language', containsAny(['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'csharp', 'golang', 'rust', 'php', 'ruby', 'sql', 'bash', 'shell', 'powershell', 'kotlin', 'swift', 'html', 'css', 'matlab', 'excel', 'vba', 'lua', 'dart', 'scala', 'node', 'nodejs'])),
      makeCheck('what goes in and what should come out', 'Input/output: [an example of each]', 'input/output', containsAny(['input', 'inputs', 'output', 'outputs', 'returns', 'return', 'takes', 'given', 'expected', 'example', 'should print', 'should return', 'parameter', 'parameters', 'argument', 'arguments'])),
      makeCheck('where it will run', 'Environment: [framework, version, OS]', 'environment', containsAny(['version', 'framework', 'library', 'node', 'nodejs', 'django', 'flask', 'react', 'vue', 'angular', 'spring', 'laravel', 'windows', 'linux', 'mac', 'macos', 'ubuntu', 'docker', 'browser', 'pandas', 'numpy', 'server'])),
    ],
  },
  {
    code: 'VISUAL', name: 'a visual', label: 'visual design',
    strong: ['logo', 'icon', 'banner', 'poster', 'flyer', 'illustration', 'image', 'picture', 'drawing', 'mockup', 'thumbnail', 'infographic', 'sticker', 'business card', 'cover art', 'album cover', 'mascot', 'wallpaper'],
    names: ['logo', 'icon', 'banner', 'poster', 'flyer', 'illustration', 'drawing', 'mockup', 'thumbnail', 'infographic', 'sticker', 'business card', 'album cover', 'mascot', 'wallpaper'],
    weak: ['draw', 'design', 'visual', 'graphic'],
    checks: [
      makeCheck('what name or text goes on it', 'Name/text: [exactly what is written on it]', 'name', (i) => i.hasQuotedPassage || GIVEN_NAME_PATTERN.test(i.text)),
      makeCheck('which colours to use', 'Colours: [two or three, or a palette]', 'colours', containsAny(COLOURS)),
      makeCheck('which style you like', 'Style: [flat, vintage, hand-drawn…]', 'style', containsAny(['style', 'minimal', 'minimalist', 'flat', '3d', 'vintage', 'retro', 'hand-drawn', 'hand drawn', 'cartoon', 'realistic', 'watercolor', 'watercolour', 'line art', 'geometric', 'playful', 'elegant', 'luxury', 'corporate', 'pixel art', 'monochrome', 'in the style of'])),
      makeCheck('where it will be used', 'Use: [print, web, packaging…, and the size]', 'intended use', containsAny(['print', 'printed', 'website', 'social media', 'instagram', 't-shirt', 'card', 'sign', 'signage', 'packaging', 'favicon', 'app icon', 'size', 'dimensions', 'px', 'pixels', 'png', 'svg', 'jpg', 'a4', 'a3'])),
    ],
  },
  {
    code: 'PRESENTATION', name: 'a presentation', label: 'presentation',
    strong: ['presentation', 'slides', 'slide deck', 'deck', 'pitch', 'pitch deck', 'powerpoint', 'keynote', 'google slides', 'talk', 'webinar'],
    names: ['presentation', 'slide deck', 'deck', 'pitch', 'pitch deck', 'talk', 'webinar'],
    weak: ['present', 'speaker', 'audience'],
    checks: [
      makeCheck('how long it should last', 'Length: [minutes, number of slides]', 'duration', lengthOr(['minutes', 'minute', 'hour', 'duration'])),
      makeCheck('what message it must get across', 'Key message: [what the audience must remember]', 'key message', containsAny(['message', 'goal', 'objective', 'convince', 'persuade', 'explain', 'pitch to', 'raise', 'funding', 'sell', 'teach', 'inform', 'key point', 'takeaway', 'call to action'])),
      makeCheck('what the occasion is', 'Occasion: [meeting, class, conference…]', 'occasion', containsAny(['meeting', 'conference', 'class', 'school', 'board', 'investors', 'clients', 'team', 'interview', 'exam', 'oral', 'jury', 'webinar', 'event', 'seminar', 'workshop'])),
    ],
  },
  {
    code: 'EMAIL', name: 'an email', label: 'email',
    strong: ['email', 'e-mail', 'emails', 'mail', 'message to', 'reply to', 'respond to', 'answer to'],
    names: ['email', 'e-mail'],
    weak: ['letter', 'send', 'inbox', 'subject line', 'recipient', 'reply', 'respond'],
    checks: [
      makeCheck('who it is addressed to', 'Recipient: [who, and your relationship]', 'recipient', containsAny(['to my', 'to the', 'to a', 'to our', 'to his', 'to her', 'boss', 'manager', 'client', 'customer', 'customers', 'landlord', 'teacher', 'professor', 'colleague', 'colleagues', 'recruiter', 'recruiters', 'hr', 'team', 'supplier', 'neighbor', 'neighbour', 'mom', 'dad', 'mother', 'father', 'friend', 'partner', 'ceo', 'dear', 'investor', 'investors', 'parents'])),
      makeCheck('what it should achieve', 'Purpose: [ask, decline, thank, follow up…]', 'purpose', containsAny(['ask', 'asking', 'request', 'thank', 'thanks', 'apologize', 'apologise', 'apology', 'complain', 'complaint', 'follow up', 'follow-up', 'invite', 'invitation', 'remind', 'reminder', 'announce', 'resign', 'resignation', 'decline', 'accept', 'reschedule', 'cancel', 'introduce', 'negotiate', 'propose', 'refund', 'raise', 'leave', 'inform', 'information'])),
      makeCheck('which tone to take', 'Tone: [formal, friendly, firm…]', 'tone', containsAny(TONES)),
    ],
  },
  {
    code: 'ARTICLE', name: 'a piece of writing', label: 'long-form writing',
    strong: ['essay', 'article', 'blog post', 'report', 'dissertation', 'paper', 'thesis', 'op-ed', 'newsletter', 'white paper', 'case study', 'review', 'biography'],
    names: ['essay', 'article', 'blog post', 'report', 'dissertation', 'thesis', 'op-ed', 'newsletter', 'white paper', 'case study', 'review', 'biography'],
    weak: ['text', 'paragraph', 'content', 'copy', 'write about'],
    checks: [
      makeCheck('what exactly it is about', 'Topic: [the precise subject and angle]', 'topic', subjectOr(['on the topic', 'topic', 'subject', 'regarding', 'theme'])),
      makeCheck('which level it is for', 'Level: [school, university, general public…]', 'level', containsAny(['level', 'grade', 'university', 'college', 'high school', 'school', 'academic', 'beginner', 'beginners', 'expert', 'experts', 'professional', 'general public', 'students', 'phd', 'master'])),
      makeCheck('whether to cite sources', 'Sources: [required or not, which style]', 'sources', containsAny(['source', 'sources', 'reference', 'references', 'citation', 'citations', 'cite', 'bibliography', 'studies', 'study', 'data', 'statistics', 'apa', 'mla'])),
      makeCheck('how long it should be', 'Length: [words or pages]', 'length', lengthOr([])),
    ],
  },
  {
    code: 'POST', name: 'a social media post', label: 'social media post',
    strong: ['post', 'posts', 'tweet', 'caption', 'thread', 'hashtags', 'hashtag', 'reel', 'status update', 'bio'],
    names: ['post', 'tweet', 'caption', 'thread', 'bio', 'reel'],
    weak: SOCIAL_PLATFORMS,
    checks: [
      makeCheck('which platform it is for', 'Platform: [LinkedIn, Instagram, X…]', 'platform', containsAny(SOCIAL_PLATFORMS)),
      makeCheck('what it should achieve', 'Goal: [announce, sell, recruit…]', 'goal', containsAny(['announce', 'announcement', 'promote', 'promotion', 'launch', 'launching', 'hiring', 'event', 'sale', 'giveaway', 'celebrate', 'engagement', 'followers', 'traffic', 'sign up', 'recruit'])),
      makeCheck('which tone to take', 'Tone: [professional, playful, bold…]', 'tone', containsAny(TONES)),
    ],
  },
  {
    code: 'CREATIVE', name: 'a creative piece', label: 'creative writing',
    strong: ['poem', 'poetry', 'story', 'short story', 'tale', 'song', 'lyrics', 'rap', 'haiku', 'sonnet', 'novel', 'fairy tale', 'screenplay', 'joke', 'jokes', 'limerick', 'speech', 'toast', 'fable', 'bedtime story'],
    names: ['poem', 'story', 'short story', 'tale', 'song', 'rap', 'haiku', 'sonnet', 'novel', 'fairy tale', 'screenplay', 'joke', 'limerick', 'speech', 'toast', 'fable', 'bedtime story'],
    weak: ['creative', 'rhyme', 'character', 'characters'],
    checks: [
      makeCheck('what it is about', 'Theme: [the subject, the characters]', 'theme', subjectOr(['theme', 'topic', 'subject', 'featuring', 'character', 'characters'])),
      makeCheck('which tone it should have', 'Tone: [funny, tender, dark…]', 'tone', containsAny([...TONES, 'sad', 'dark', 'romantic', 'epic', 'light', 'lighthearted', 'melancholic', 'mood', 'scary', 'cheerful', 'touching', 'moving', 'whimsical', 'tender', 'silly'])),
      makeCheck('how long it should be', 'Length: [lines, stanzas, minutes read aloud]', 'length', lengthOr(['short', 'long', 'stanza', 'stanzas', 'verse', 'verses', 'chorus', 'lines'])),
      makeCheck('which form it should take', 'Form: [rhyming, free verse, first person…]', 'form', containsAny(['rhyme', 'rhyming', 'rhymes', 'free verse', 'sonnet', 'haiku', 'limerick', 'dialogue', 'first person', 'third person', 'chorus', 'acrostic', 'prose'])),
    ],
  },
  {
    code: 'WEBSITE', name: 'a website', label: 'website',
    strong: ['website', 'websites', 'web site', 'landing page', 'web page', 'webpage', 'homepage', 'home page', 'site', 'online store', 'online shop', 'e-shop', 'e-commerce', 'portfolio'],
    names: ['website', 'landing page', 'web page', 'webpage', 'homepage', 'online store', 'online shop', 'portfolio', 'site'],
    weak: ['web', 'blog', 'domain', 'seo', 'wordpress', 'wix', 'shopify', 'squarespace', 'webflow', 'html', 'css'],
    checks: [
      makeCheck('what it is for', 'Purpose: [sell, showcase, take bookings…]', 'purpose', containsAny(['to sell', 'sell', 'selling', 'showcase', 'present', 'promote', 'booking', 'bookings', 'book', 'reservations', 'portfolio', 'store', 'shop', 'e-commerce', 'newsletter', 'sign up', 'signups', 'leads', 'blog', 'inform', 'donations', 'recruit'])),
      makeCheck('which pages it needs', 'Pages: [home, about, contact…]', 'pages', containsAny(['page', 'pages', 'section', 'sections', 'about', 'contact', 'menu', 'gallery', 'faq', 'pricing', 'checkout', 'form', 'footer', 'header'])),
      makeCheck('what it should look like', 'Look: [colours, fonts, existing logo…]', 'visual identity', containsAny([...COLOURS, 'logo', 'brand', 'branding', 'font', 'fonts', 'theme', 'dark mode', 'minimalist', 'minimal', 'retro', 'vintage', 'elegant'])),
      makeCheck('what to build it with', 'Built with: [WordPress, plain HTML, Shopify…]', 'technology', containsAny(['html', 'css', 'javascript', 'react', 'vue', 'next.js', 'nextjs', 'wordpress', 'wix', 'shopify', 'webflow', 'squarespace', 'php', 'tailwind', 'astro', 'svelte', 'no-code', 'framer'])),
    ],
  },
  {
    code: 'APP', name: 'an app', label: 'software product',
    // "a Facebook but better" means a whole platform; "a Facebook post" stays a post (strong term + platform).
    strong: ['app', 'apps', 'application', 'mobile app', 'web app', 'saas', 'platform', 'software', 'tool', 'dashboard', 'bot', 'chatbot', 'extension', 'plugin', 'game', 'video game', 'social network', 'marketplace', 'facebook', 'uber', 'amazon', 'netflix', 'airbnb', 'tiktok', 'instagram', 'whatsapp', 'spotify', 'chatgpt', 'notion'],
    names: ['app', 'mobile app', 'web app', 'platform', 'tool', 'dashboard', 'bot', 'chatbot', 'extension', 'plugin', 'game', 'video game', 'social network', 'marketplace'],
    weak: ['startup', 'users', 'clone', 'but better'],
    checks: [
      makeCheck('what it should actually do', 'Features: [the three things it must do]', 'features', containsAny(['feature', 'features', 'function', 'functions', 'users can', 'user can', 'login', 'log in', 'sign in', 'sign up', 'account', 'accounts', 'notification', 'notifications', 'payment', 'payments', 'chat', 'search', 'upload', 'map', 'calendar', 'profile', 'profiles', 'feed', 'track', 'tracks'])),
      makeCheck('what it should run on', 'Platform: [iOS, Android, web…]', 'platform', containsAny(['ios', 'android', 'iphone', 'mobile', 'web', 'desktop', 'windows', 'mac', 'macos', 'linux', 'browser', 'chrome'])),
      makeCheck('what budget or team is behind it', 'Means: [budget, team, deadline]', 'resources', containsAny(['budget', 'cost', 'price', 'dollars', 'euros', 'team', 'developer', 'developers', 'mvp', 'prototype', 'weeks', 'months'])),
      makeCheck('which technology to use', 'Stack: [Flutter, React Native, no-code…]', 'tech stack', containsAny(['react', 'react native', 'flutter', 'swift', 'kotlin', 'python', 'node', 'django', 'firebase', 'supabase', 'no-code', 'bubble', 'javascript', 'typescript', 'unity', 'godot'])),
    ],
  },
  {
    code: 'PLAN', name: 'a plan', label: 'planning',
    strong: ['plan', 'strategy', 'business plan', 'marketing plan', 'schedule', 'roadmap', 'itinerary', 'workout', 'training plan', 'diet', 'meal plan', 'routine', 'study plan', 'timeline', 'checklist', 'budget plan'],
    names: ['plan', 'strategy', 'business plan', 'marketing plan', 'schedule', 'roadmap', 'itinerary', 'workout', 'training plan', 'meal plan', 'routine', 'study plan', 'timeline', 'checklist'],
    weak: ['organize', 'organise', 'steps', 'program', 'trip'],
    checks: [
      makeCheck('over what period', 'Time frame: [days, weeks, months]', 'time frame', containsAny(['day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'quarter', 'until', 'deadline', 'weekend', 'summer', 'winter'])),
      makeCheck('with what means', 'Means: [budget, time per week, equipment…]', 'resources', containsAny(['budget', 'money', 'hours', 'hour', 'time', 'team', 'people', 'equipment', 'gym', 'at home', 'alone', 'dollars', 'euros', 'per week', 'per day'])),
      makeCheck('which measurable goal to reach', 'Goal: [a number and a date]', 'measurable goal', (i) => /\d/.test(i.text) || NUMERIC_GOAL_PATTERN.test(i.text)),
    ],
  },
  {
    code: 'EXPLANATION', name: 'an explanation', label: 'explanation',
    strong: ['explain', 'explanation', 'what is', 'what are', 'how does', 'how do', 'how to', 'tell me about', 'teach me', 'help me understand', 'what does', 'difference between', 'meaning of', 'define', 'definition'],
    names: [],
    weak: ['why', 'understand', 'learn'],
    checks: [
      makeCheck('what your current level is', 'My level: [beginner, student, expert…]', 'your level', containsAny(["like i'm 5", 'like im 5', 'eli5', 'beginner', 'beginners', 'expert', 'advanced', 'level', 'simple terms', 'simply', 'technical', 'child', 'kid', 'non-technical', 'layman', 'student'])),
      makeCheck('how deep to go', 'Depth: [quick overview or step by step]', 'depth', containsAny(['in detail', 'detailed', 'briefly', 'overview', 'quick', 'step by step', 'step-by-step', 'in depth', 'in-depth', 'one sentence', 'short', 'examples'])),
      makeCheck('why you want to know', 'Why: [exam, project, curiosity…]', 'reason', containsAny(['exam', 'test', 'for work', 'project', 'interview', 'homework', 'assignment', 'curious', 'because', 'so that', 'in order to'])),
    ],
  },
  {
    code: 'NAMING', name: 'a name', label: 'naming',
    strong: ['name', 'names', 'slogan', 'slogans', 'tagline', 'title', 'titles', 'brand name', 'headline', 'catchphrase', 'motto', 'username'],
    names: ['name', 'slogan', 'tagline', 'title', 'brand name', 'headline', 'catchphrase', 'motto', 'username'],
    weak: ['brand', 'branding', 'rename'],
    checks: [
      makeCheck('what is being named', 'For: [the product, company or project]', 'what to name', (i) => i.subject !== null || THING_TO_NAME_PATTERN.test(i.text)),
      makeCheck('what image it should convey', 'Feel: [serious, playful, premium…]', 'tone', containsAny(TONES)),
      makeCheck('which constraints apply', 'Constraints: [length, available domain, language…]', 'constraints', containsAny(['letters', 'short', 'one word', 'two words', 'syllables', 'domain', 'available', 'pronounce', 'starts with', 'contain', 'containing', 'max', 'maximum'])),
    ],
  },
];

// Declared afterwards but only used when the checks run, so always initialised.
const GIVEN_NAME_PATTERN = wordPattern(['called', 'named', 'name', 'brand name', 'says', 'saying', 'with the words', 'initials', 'text']);
const NUMERIC_GOAL_PATTERN = wordPattern(['goal', 'target', 'lose', 'gain', 'increase', 'reduce', 'grow', 'reach', 'achieve', 'double', 'pass']);
const THING_TO_NAME_PATTERN = wordPattern(['company', 'product', 'business', 'brand', 'startup', 'shop', 'restaurant', 'podcast', 'channel', 'band', 'book', 'project']);

const BY_CODE = new Map(TASKS.map((t) => [t.code, t]));
export const TASK_CODES: readonly TaskCode[] = TASKS.map((t) => t.code);

const COUNTERS = new Map(TASKS.map((t) => [
  t.code,
  { strong: new RegExp(wordPattern(t.strong).source, 'gu'), weak: new RegExp(wordPattern(t.weak).source, 'gu') },
]));

function occurrences(re: RegExp, text: string): number {
  return text.match(re)?.length ?? 0;
}

export interface RecognisedTask {
  code: TaskCode;
  score: number;
  /** The word of the request that names the task, if it can be reused as is. */
  term: string | null;
}

/**
 * Recognised tasks, the most likely first (two at most). A task is only kept if a strong term
 * names it: a weak term alone is not enough. At equal score, the task mentioned first wins
 * ("a website and a logo"), then the order of TASKS (stable sort).
 */
export function recogniseTasks(text: string): RecognisedTask[] {
  const candidates = TASKS.flatMap((t) => {
    const { strong, weak } = COUNTERS.get(t.code)!;
    const hits = [...text.matchAll(strong)];
    if (hits.length === 0) return [];
    const score = hits.length * STRONG_WEIGHT + occurrences(weak, text) * WEAK_WEIGHT;
    const term = hits.map((m) => m[0]).find((word) => t.names.includes(word)) ?? null;
    return [{ code: t.code, score, term, position: hits[0].index }];
  });
  return candidates
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .slice(0, MAX_TASKS)
    .map(({ code, score, term }) => ({ code, score, term }));
}

/** Spellings to restore after normalisation. */
const SPELLINGS: Readonly<Record<string, string>> = {
  cv: 'CV', 'linkedin profile': 'LinkedIn profile', 'linkedin summary': 'LinkedIn summary', 'sql query': 'SQL query', 'e-mail': 'email',
};

/** "a logo", "an essay" — or the task's generic name if the term cannot be reused. */
export function taskName(code: TaskCode, term: string | null): string {
  if (term === null || !task(code).names.includes(term)) return task(code).name;
  const shown = SPELLINGS[term] ?? term;
  return `${/^[aeio]/i.test(shown) ? 'an' : 'a'} ${shown}`;
}

export function task(code: TaskCode): Task {
  return BY_CODE.get(code)!;
}

export interface CheckResult {
  index: number;
  trace: string;
  present: boolean;
}

export function runChecks(code: TaskCode, clues: Clues): CheckResult[] {
  return task(code).checks.map((v, index) => ({ index, trace: v.trace, present: v.present(clues) }));
}
