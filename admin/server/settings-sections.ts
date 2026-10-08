import { z } from 'zod'

/**
 * Per-section content schemas.
 *
 * Split out of `settings-schema.ts` only for file size — every symbol here is
 * re-exported from there, so there is still exactly one import site for callers.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS EDITABLE HERE, AND WHY IT IS NOT MORE
 * ---------------------------------------------------------------------------
 * Everything a manager would recognise as *copy* is data: headings, blurbs,
 * labels, numbers, links, and the repeatable cards / decks / menu entries.
 *
 * Everything that is *design* stays in code. The per-card Tailwind classes in
 * AchievementsSection (`accentBg: 'bg-amber-500/15'`, `cardBg:
 * 'bg-[var(--portfolio-achievement-1-card)]'`, …) are exposed as a small
 * `accent` enum instead. Putting those in the admin would mean a content manager
 * can break the palette, and — worse — the achievement colours are addressed by
 * `--portfolio-achievement-N-*` custom properties keyed to the card's position,
 * so a literal class string in the database could point at the wrong card's
 * gradient. The enum is resolved to classes by a `const` map inside each
 * component, which keeps the same guarantee.
 *
 * ---------------------------------------------------------------------------
 * DEFAULTS ARE THE SITE AS IT SHIPS
 * ---------------------------------------------------------------------------
 * Every field's `.default()` is the string currently hardcoded in the component.
 * Nothing is persisted until someone saves, so an untouched group renders the
 * site byte-for-byte as before. That is the whole safety story for this file:
 * `DEFAULT_SITE_SETTINGS` IS the previous hardcoded content.
 */

/* ------------------------------------------------------------------ shared */

/**
 * Repeating items need a stable key so React does not reuse DOM between rows
 * after a reorder, and so the admin list has something to key its collapse state
 * on. Generated ids are not used: a row's id has to survive a save/reload.
 */
const idSchema = z.string().trim().min(1).max(64)

/** Accent themes. Components map these to their Tailwind classes. */
export const ACCENT_KEYS = [
  'gold',
  'cyan',
  'emerald',
  'indigo',
  'violet',
  'sky',
] as const
const accentSchema = z.enum(ACCENT_KEYS)

/**
 * A short string. `max` is set generously per field rather than globally: the
 * copy is display type, not prose, and a limit that truncates a headline is
 * worse than one that rejects it.
 */
const line = (max = 120) => z.string().trim().max(max)

/**
 * A string whose leading/trailing spaces are MEANINGFUL — do not trim.
 *
 * Three fields join their neighbours with a space that lives at the end or start
 * of the stored value: AboutSection's `headingLeadIn` ends with a space before
 * the first emphasis span, `headingClosing` starts with one after the last, and
 * each pillar's `body` starts with " — ". `.trim()` on those fields would render
 * "aboutcontinuous learning" the first time a manager touched them.
 *
 * Note that Zod does NOT apply `.trim()` to a `.default()` value, so the
 * unsaved site is unaffected either way — which is exactly why this is easy to
 * miss and only shows up after an edit.
 */
const spaced = (max: number) => z.string().max(max)

/* ------------------------------------------------------------- milestones */

/**
 * The four metric cells. `suffix` is the trailing glyph rendered in its own
 * span next to the animated number (`+`, `x`, `%`, …) — it was hardcoded per
 * cell rather than passed to CountUp, so it stays a separate field.
 */
const metricSchema = z.object({
  id: idSchema,
  label: line(60),
  value: z.number().int().min(0).max(1_000_000),
  suffix: line(4),
  footnote: line(200),
})

export const milestonesSettingsSchema = z.object({
  metrics: z.array(metricSchema).max(8).default([
    {
      id: 'm1',
      label: 'PROFESSIONALS',
      value: 50,
      suffix: '+',
      footnote: 'infodazz team · trichy • madurai • karaikudi • kumbakonam',
    },
    {
      id: 'm2',
      label: 'VENTURES FOUNDED',
      value: 4,
      suffix: '',
      footnote: 'infodazz · kittle · seventh sense · kaster trust',
    },
    {
      id: 'm3',
      label: 'INTERNATIONAL JOURNALS',
      value: 30,
      suffix: '+',
      footnote: 'seventh sense · research publishing platform',
    },
    {
      id: 'm4',
      label: 'SCOPUS INDEXED',
      value: 5,
      suffix: '+',
      footnote: 'scopus journals · academic collaboration support',
    },
  ]),
})

/* ------------------------------------------------------------------- quote */

export const quoteSettingsSchema = z.object({
  /**
   * Two spans because the quote is two colours: the first clause is dimmed, the
   * second is full white. Kept as two fields rather than one so the gradient
   * across the sentence survives editing.
   */
  quoteLine1: line(160).default(
    '“Technology creates possibilities,',
  ),
  quoteLine2: line(160).default('but people create impact.”'),
  attribution: line(80).default('Dr. R. Surendiran — Leadership Philosophy'),
  roles: line(160).default(
    'Founder & CEO, Infodazz • Kittle • Seventh Sense • Kaster Trust',
  ),
  /** The closing vision line under the quote block. */
  vision: line(400).default(
    'Vision: to build organizations that combine innovation, business growth, education and social responsibility.',
  ),
  portraitUrl: z
    .string()
    .trim()
    .max(600)
    .refine(
      (v) => v === '' || v.startsWith('/uploads/') || /^https?:\/\/.+/.test(v),
      'Enter a full image URL or an /uploads/... path',
    )
    .default(
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHt-GFa9dNcxzSQIPTzFtGZugzZXCsvmWUvaqptV3qQcHQQYDqNzfMo7KKVdXQkA80dq9Nn4yb-_AlK94JMjQDCyVXNLPSrJs8y1rPtrLu7C7EuDrAnm3keIkJSnYgXalwhTBmHAPamsx5UZK_L4PJ0d359cuEDwQstjoUbJJDsHmNdpGtFtBjOu9RNrveJRQbHvZyhCDT77BNJcKE43ohJGvXLQDTWIc-L3795cw',
    ),
  portraitAlt: line(120).default('Dr. R. Surendiran'),
})

/* -------------------------------------------------------------- governance */

const governanceRoleSchema = z.object({
  id: idSchema,
  /** Material Symbols ligature name. */
  icon: line(40),
  kicker: line(80),
  heading: line(120),
  body: line(600),
  bullets: z.array(line(120)).max(8).default([]),
  footer: line(120),
  accent: accentSchema,
})

export const governanceSettingsSchema = z.object({
  eyebrow: line(80).default('LEADERSHIP & NETWORK // FOUNDER ROLES'),
  heading: line(120).default('FOUNDER LEADERSHIP & COMMUNITY ROLES'),
  intro: line(400).default(
    'Leading technology companies, research publishing platforms and social initiatives — combined with BNI and Rotary community leadership and academic mentoring.',
  ),
  roles: z.array(governanceRoleSchema).max(6).default([
    {
      id: 'g1',
      icon: 'memory',
      kicker: 'ROLE 01 // TECHNOLOGY BUSINESSES',
      heading: 'Founder & CEO — Infodazz • Founder — Kittle',
      body: 'Building technology companies and digital ecosystems — Infodazz (Estd 2022, Trichy HQ, Madurai / Karaikudi / Kumbakonam, 50+ professionals) and Kittle Pvt Ltd (Trichy, IT solutions & consulting).',
      bullets: [
        'ERP • SaaS • Web & Mobile Apps',
        'Digital Marketing • SEO • Design • VFX',
        'Software Solutions • Technology Consulting',
      ],
      footer: 'Entities: Infodazz • Kittle Pvt Ltd',
      accent: 'cyan',
    },
    {
      id: 'g2',
      icon: 'account_tree',
      kicker: 'ROLE 02 // RESEARCH & EDUCATION',
      heading: 'Founder — Seventh Sense Research Group',
      body: 'Supporting research, education and innovation — 30+ International Journals including 5+ Scopus Indexed, plus research publications, patents, academic mentoring and research guidance.',
      bullets: [
        'Ph.D — Madurai Kamaraj University',
        'MCA — Thiagarajar School of Management',
        'B.Sc Mathematics — GAC Kumbakonam',
      ],
      footer: 'Entity: Seventh Sense Research Group',
      accent: 'gold',
    },
    {
      id: 'g3',
      icon: 'school',
      kicker: 'ROLE 03 // SOCIAL IMPACT & NETWORKS',
      heading: 'Founder / Trustee — Kaster Trust',
      body: 'Helping students overcome educational barriers — fee support, learning opportunities and student growth. BNI Member since 2022, Rotary Member since 2024.',
      bullets: [
        'Educational fee support',
        'BNI since 2022 • Rotary since 2024',
        'Motivational sessions • Global travel',
      ],
      footer: 'Entities: Kaster Trust • BNI • Rotary',
      accent: 'emerald',
    },
  ]),
})

/* ------------------------------------------------------------ perspectives */

const perspectiveSchema = z.object({
  id: idSchema,
  badge: line(60),
  meta: line(80),
  heading: line(160),
  body: line(600),
  footerLabel: line(80),
  accent: accentSchema,
})

export const perspectivesSettingsSchema = z.object({
  eyebrow: line(120).default(
    'BEYOND BUSINESS // ENTREPRENEURSHIP • KNOWLEDGE • SOCIAL IMPACT',
  ),
  heading: line(120).default('BEYOND BUSINESS — THREE COMMITMENTS'),
  intro: line(400).default(
    'Entrepreneurship, Knowledge and Social Impact — building technology companies, supporting research & education, and helping students overcome barriers.',
  ),
  articles: z.array(perspectiveSchema).max(6).default([
    {
      id: 'pe1',
      badge: 'ENTREPRENEURSHIP',
      meta: 'Infodazz • Kittle',
      heading: '“Building Technology Companies and Digital Ecosystems”',
      body: 'From academic research into entrepreneurship — Infodazz (Estd 2022, 50+ professionals, 11 services) and Kittle Pvt Ltd helping businesses grow through technology, SaaS, ERP, Web/Mobile and digital transformation.',
      footerLabel: 'Technology Businesses',
      accent: 'cyan',
    },
    {
      id: 'pe2',
      badge: 'KNOWLEDGE',
      meta: 'Seventh Sense Research',
      heading: '“Supporting Research, Education and Innovation”',
      body: 'Seventh Sense Research Group — 30+ International Journals, 5+ Scopus Indexed, publication ecosystem and collaboration support, plus research publications, patents and academic mentoring.',
      footerLabel: 'Research & Education',
      accent: 'gold',
    },
    {
      id: 'pe3',
      badge: 'SOCIAL IMPACT',
      meta: 'Kaster Trust',
      heading: '“Helping Students Overcome Educational Barriers”',
      body: 'Kaster Trust helps deserving students continue education by supporting fees and reducing financial barriers — encouraging learning opportunities and student growth.',
      footerLabel: 'Education Support',
      accent: 'emerald',
    },
  ]),
})

/* ---------------------------------------------------------------- keynotes */

const keynoteSchema = z.object({
  id: idSchema,
  badge: line(60),
  meta: line(80),
  heading: line(200),
  tagline: line(120),
  body: line(600),
  footerIcon: line(40),
  footerLabel: line(80),
  footerRightLabel: line(80),
  accent: accentSchema,
})

export const keynotesSettingsSchema = z.object({
  eyebrowIcon: line(40).default('public'),
  eyebrowTitle: line(80).default('Global Vision'),
  eyebrowSubtitle: line(120).default('Motivational Sessions & Professional Interactions'),
  heading: line(120).default('KNOWLEDGE SHARING & GLOBAL EXPOSURE'),
  intro: line(400).default(
    'A passionate traveller and lifelong learner — Dr. Surendiran believes global exposure creates new perspectives and shares knowledge through motivational sessions and professional interactions.',
  ),
  ctaLabel: line(60).default('Invite for Motivational Session'),
  ctaHref: line(200).default('#advisory'),
  ctaIcon: line(40).default('campaign'),
  cards: z.array(keynoteSchema).max(6).default([
    {
      id: 'k1',
      badge: 'MOTIVATIONAL SESSIONS',
      meta: 'Students & Professionals',
      heading:
        '“From Farmer Family to Founder — Continuous Learning & Innovation”',
      tagline: 'Founder Journey & Education Motivation',
      body: 'Sharing his journey from humble beginnings through education, dedication and entrepreneurship — motivating students, researchers and aspiring founders to create opportunities through learning.',
      footerIcon: 'groups',
      footerLabel: 'Learning & Inspiration',
      footerRightLabel: 'Founder Story',
      accent: 'violet',
    },
    {
      id: 'k2',
      badge: 'PROFESSIONAL INTERACTIONS',
      meta: 'BNI • Rotary • Business Forums',
      heading:
        '“Building Businesses, Research Networks & Community Collaboration”',
      tagline: 'BNI Member since 2022 • Rotary Member since 2024',
      body: 'Active in business and professional communities — supporting entrepreneur relationships, collaboration and community contribution through BNI and Rotary networks.',
      footerIcon: 'military_tech',
      footerLabel: 'BNI 2022 • Rotary 2024',
      footerRightLabel: 'Community Networks',
      accent: 'gold',
    },
    {
      id: 'k3',
      badge: 'GLOBAL TRAVEL',
      meta: 'National & International',
      heading: '“Global Exposure Creates New Perspectives and Opportunities”',
      tagline: 'Traveller & Lifelong Learner',
      body: 'Travelled nationally and internationally — bringing global perspectives into technology businesses, research platforms and social initiatives for students and communities.',
      footerIcon: 'school',
      footerLabel: 'Lifelong Learning',
      footerRightLabel: 'Global Vision',
      accent: 'sky',
    },
  ]),
})

/* ------------------------------------------------------------------- books */

const bookSchema = z.object({
  id: idSchema,
  title: line(120),
  author: line(120),
  subject: line(60),
  note: line(400),
  /**
   * `dark` = champagne cover with bronze ink, `light` = paper cover with
   * obsidian ink. The ink pair is a fixed design token per tone; only the
   * selection is editable, because choosing the wrong ink for a cover breaks
   * legibility in one of the two themes.
   */
  tone: z.enum(['dark', 'light']),
  /** Resolved to one of six fixed cover swatches inside the component. */
  cover: z.enum(['primary', 'slate900', 'slate800', 'slate700', 'slate300', 'slate100']),
  /** Optional uploaded cover image; falls back to the `cover` swatch when empty. */
  coverImageUrl: z
    .string()
    .trim()
    .max(600)
    .refine(
      (v) => v === '' || v.startsWith('/uploads/') || /^https?:\/\/.+/.test(v),
      'Enter a full image URL or an /uploads/... path',
    )
    .default(''),
})

export const booksSettingsSchema = z.object({
  kicker: line(60).default('Off the shelf'),
  heading: line(80).default('Favourite Books'),
  /** Rotated handwritten annotation in the feature block. */
  annotation: line(80).default('one of my favourites'),
  shelfHeading: line(80).default('The shelf'),
  ctaLabel: line(60).default('Suggest a title'),
  ctaHref: line(200).default('#reading-shelf'),
  featuredQuote: z
    .object({
      text: line(400),
      title: line(120),
      author: line(120),
    })
    .default({
      text: 'A startup is a human institution designed to create a new product or service under conditions of extreme uncertainty.',
      title: 'The Lean Startup',
      author: 'Eric Ries',
    }),
  /**
   * Which shelf books appear in the feature block, by id and in order. Stored by
   * id rather than by index so reordering the shelf does not silently change
   * which book is featured.
   */
  featuredIds: z.array(idSchema).max(3).default(['b1', 'b2', 'b4']),
  books: z.array(bookSchema).max(12).default([
    {
      id: 'b1',
      title: 'The Lean Startup',
      author: 'Eric Ries',
      subject: 'Startups',
      note: 'Validated learning as a way to operate when the market will not hold still.',
      tone: 'dark',
      cover: 'primary',
      coverImageUrl: '',
    },
    {
      id: 'b2',
      title: 'Zero to One',
      author: 'Peter Thiel',
      subject: 'Strategy',
      note: 'A contrarian case for building something that cannot simply be copied.',
      tone: 'dark',
      cover: 'slate900',
      coverImageUrl: '',
    },
    {
      id: 'b3',
      title: 'The Hard Thing About Hard Things',
      author: 'Ben Horowitz',
      subject: 'Leadership',
      note: 'The unglamorous, honest version of running a company day to day.',
      tone: 'dark',
      cover: 'slate700',
      coverImageUrl: '',
    },
    {
      id: 'b4',
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      subject: 'Decision Science',
      note: 'A research-backed reminder that judgement under risk is a system, not a trait.',
      tone: 'dark',
      cover: 'slate800',
      coverImageUrl: '',
    },
    {
      id: 'b5',
      title: 'The Innovator’s Dilemma',
      author: 'Clayton Christensen',
      subject: 'Innovation',
      note: 'Why good companies get disrupted — and what early warning actually looks like.',
      tone: 'light',
      cover: 'slate100',
      coverImageUrl: '',
    },
    {
      id: 'b6',
      title: 'Good to Great',
      author: 'Jim Collins',
      subject: 'Organisation',
      note: 'The unglamorous disciplines behind firms that made a durable leap.',
      tone: 'light',
      cover: 'slate300',
      coverImageUrl: '',
    },
  ]),
})

/* -------------------------------------------------------------------- about */

/** The six floating pills. `icon` is a Material Symbols ligature name. */
const aboutPillSchema = z.object({
  id: idSchema,
  icon: line(40),
  label: line(120),
})

/** A prompt bubble and the pillar card answering it. */
const aboutPillarSchema = z.object({
  id: idSchema,
  question: line(300),
  label: line(120),
  /**
   * The card body is a bolded lead sentence followed by the rest, so they are
   * separate fields — merging them would drop the emphasis.
   */
  lead: line(200),
  /** Starts with " — ", which is what separates it from `lead`. See `spaced`. */
  body: spaced(800),
  footerMeta: line(200),
  headerIcon: line(40),
  footerIcon: line(40),
})

export const aboutSettingsSchema = z.object({
  eyebrowIcon: line(40).default('cognition'),
  eyebrow: line(120).default('STRATEGIC PHILOSOPHY • CORE THESIS'),
  /**
   * The heading is one sentence carrying three differently-coloured emphasis
   * spans, so it is stored as four fragments rather than one string. Punctuation
   * that joins two fragments lives with the PLAIN text, not the emphasis.
   */
  headingLeadIn: spaced(200).default(
    'Coming from a humble farmer family, my journey is about ',
  ),
  headingEmphasis1: line(120).default('continuous learning and innovation'),
  headingEmphasis2: line(120).default('building technology businesses'),
  headingEmphasis3: line(160).default('creating opportunities for others'),
  headingClosing: spaced(200).default(
    ' — from academic research into entrepreneurship.',
  ),
  intro: line(400).default(
    'Technology entrepreneur, research contributor and business leader across technology solutions, digital transformation, academic publishing and social responsibility.',
  ),
  pills: z.array(aboutPillSchema).max(8).default([
    { id: 'p1', icon: 'cloud', label: 'Infodazz • Estd 2022' },
    { id: 'p2', icon: 'bolt', label: 'Kittle Pvt Ltd • Trichy' },
    {
      id: 'p3',
      icon: 'verified_user',
      label: 'BNI since 2022 • Rotary since 2024',
    },
    {
      id: 'p4',
      icon: 'hub',
      label: '30+ Intl Journals • 5+ Scopus',
    },
    {
      id: 'p5',
      icon: 'currency_rupee',
      label: 'Kaster Trust • Education Support',
    },
    {
      id: 'p6',
      icon: 'school',
      label: 'Ph.D • MCA • B.Sc Mathematics',
    },
  ]),
  pillars: z.array(aboutPillarSchema).max(6).default([
    {
      id: 'd1',
      question:
        'How did your journey move from academic research into building technology companies?',
      label: 'INFODAZZ + KITTLE • PILLAR I — ENTREPRENEURSHIP',
      lead: 'Helping businesses grow through technology and digital transformation',
      body: ' — Infodazz was established in 2022 with HQ in Trichy and branches in Madurai, Karaikudi and Kumbakonam, with 50+ professionals across ERP, SaaS, Web & Mobile Apps, IT Solutions, Digital Marketing, SEO, Design, Animation/VFX, Photography/Videography and Event Management. Kittle Pvt Ltd, Trichy focuses on Software Solutions, IT Services, Digital Platforms and Technology Consulting.',
      footerMeta:
        'Estd 2022 • Trichy HQ • 50+ Professionals • 11 Service Verticals',
      headerIcon: 'cognition',
      footerIcon: 'terminal',
    },
    {
      id: 'd2',
      question:
        'How do you support researchers, academicians and students?',
      label: 'SEVENTH SENSE + ACADEMICS • PILLAR II — KNOWLEDGE',
      lead: 'International research publishing platform for researchers and academicians',
      body: ' — Seventh Sense Research Group supports 30+ International Journals including 5+ Scopus Indexed Journals, with research publication ecosystem and academic collaboration support. Academic background: Ph.D — Madurai Kamaraj University, MCA — Thiagarajar School of Management Madurai, B.Sc Mathematics — Govt. College of Arts and Science Kumbakonam. Contributions include research publications, patents, academic mentoring and research guidance.',
      footerMeta:
        '30+ Journals • 5+ Scopus • Publications • Patents • Mentoring',
      headerIcon: 'hub',
      footerIcon: 'payments',
    },
    {
      id: 'd3',
      question:
        'What drives your leadership, travel and social impact work?',
      label: 'KASTER TRUST + NETWORKS • PILLAR III — SOCIAL IMPACT',
      lead: 'Helping deserving students continue education by reducing financial barriers',
      body: ' — Kaster Trust provides educational fee support and encourages learning opportunities. Active in business and professional communities as BNI Member since 2022 and Rotary Member since 2024. A passionate traveller and lifelong learner who shares knowledge through motivational sessions and professional interactions.',
      footerMeta:
        'BNI since 2022 • Rotary since 2024 • Global Travel • Mentorship',
      headerIcon: 'school',
      footerIcon: 'menu_book',
    },
  ]),
})

/* ---------------------------------------------------------------- ventures */

/**
 * A stat chip. `countTo` is null for the plain-text chips (`4 Locations`), a
 * number for the animated ones (`50+ Professionals`).
 */
const ventureChipSchema = z.object({
  id: idSchema,
  label: line(60),
  value: line(80),
  countTo: z.number().int().min(0).max(1_000_000).nullable(),
  suffix: line(4),
})

const ventureCardSchema = z.object({
  id: idSchema,
  index: line(8),
  badge: line(60),
  meta: line(80),
  title: line(120),
  role: line(80),
  blurb: line(400),
  services: z.array(line(120)).max(8).default([]),
  chips: z.array(ventureChipSchema).max(4).default([]),
  ctaLabel: line(60),
  ctaHref: line(200),
  ctaIcon: line(40),
})

export const venturesSettingsSchema = z.object({
  eyebrow: line(120).default('BUSINESS VENTURES • 2022 — PRESENT'),
  heading: line(200).default(
    'Technology Businesses, Research Platforms & Social Impact',
  ),
  intro: line(400).default(
    'Founded and led by Dr. R. Surendiran — from academic research into entrepreneurship, creating opportunities for businesses, researchers, students and communities.',
  ),
  cards: z.array(ventureCardSchema).max(8).default([
    {
      id: 'v1',
      index: '01',
      badge: 'FLAGSHIP TECH',
      meta: 'Estd 2022 • Trichy HQ',
      title: 'Infodazz',
      role: 'Founder & CEO',
      blurb:
        'Established in 2022 to help businesses grow through technology and digital transformation.',
      services: [
        'ERP Solutions • SaaS Platforms',
        'Web & Mobile Applications',
        'IT Solutions • Digital Marketing',
        'Graphic Design • Animation & VFX',
      ],
      chips: [
        { id: 'v1c1', label: 'Team', value: 'Professionals', countTo: 50, suffix: '+' },
        { id: 'v1c2', label: 'Presence', value: '4 Locations', countTo: null, suffix: '' },
      ],
      ctaLabel: 'infodazz.org',
      ctaHref: 'https://infodazz.org',
      ctaIcon: 'arrow_outward',
    },
    {
      id: 'v2',
      index: '02',
      badge: 'TECH INNOVATION',
      meta: 'Trichy Based',
      title: 'Kittle Pvt Ltd',
      role: 'Founder / Owner',
      blurb:
        'Based in Trichy, focused on IT solutions and technology innovation — software solutions and digital platforms for business growth.',
      services: [
        'Software Solutions',
        'IT Services & Support',
        'Digital Platforms',
        'Technology Consulting',
      ],
      chips: [
        { id: 'v2c1', label: 'Base', value: 'Trichy, Tamil Nadu', countTo: null, suffix: '' },
        { id: 'v2c2', label: 'Focus', value: 'Technology Innovation', countTo: null, suffix: '' },
      ],
      ctaLabel: 'kittle.ltd',
      ctaHref: 'https://kittle.ltd/',
      ctaIcon: 'arrow_outward',
    },
    {
      id: 'v3',
      index: '03',
      badge: 'RESEARCH',
      meta: 'International Platform',
      title: 'Seventh Sense Research Group',
      role: 'Founder / Owner',
      blurb:
        'International research publishing platform supporting researchers and academicians through publication and academic collaboration.',
      services: [
        'Research Publishing',
        'Peer Review & Editing',
        'Scopus Indexing Support',
        'Academic Collaboration',
      ],
      chips: [
        { id: 'v3c1', label: 'Journals', value: 'International', countTo: 30, suffix: '+' },
        { id: 'v3c2', label: 'Scopus Indexed', value: 'Journals', countTo: 5, suffix: '+' },
      ],
      ctaLabel: 'ssrg',
      ctaHref: 'https://internationaljournalssrg.org',
      ctaIcon: 'arrow_outward',
    },
    {
      id: 'v4',
      index: '04',
      badge: 'SOCIAL IMPACT',
      meta: 'Education Support',
      title: 'Kaster Trust',
      role: 'Founder / Trustee',
      blurb:
        'Supporting education for students from economically disadvantaged backgrounds — reducing financial barriers so deserving students can continue.',
      services: [
        'Fee Payment Assistance',
        'Scholarship Guidance',
        'Learning Material Access',
        'Student Mentoring',
      ],
      chips: [
        { id: 'v4c1', label: 'Mission', value: 'Reduce financial barriers', countTo: null, suffix: '' },
        { id: 'v4c2', label: 'Focus', value: 'Student Growth', countTo: null, suffix: '' },
      ],
      ctaLabel: 'Support Student Education',
      ctaHref: '#advisory',
      ctaIcon: 'volunteer_activism',
    },
  ]),
})

/* ----------------------------------------------------------- achievements */

/**
 * A stat on an accolade card. The original stored these as
 * `React.ReactNode[]` — raw JSX fragments mixing `<CountUp>` elements and bare
 * strings — which cannot be validated, serialised or edited. Split into a
 * discriminated pair instead, and rendered back to the same markup:
 * `count` becomes `<CountUp target prefix suffix /> label`, `text` becomes the
 * string on its own.
 */
const accoladeStatSchema = z.object({
  id: idSchema,
  kind: z.enum(['count', 'text']),
  countTo: z.number().int().min(0).max(1_000_000).nullable(),
  prefix: line(4),
  suffix: line(4),
  label: line(60),
  text: line(60),
})

const accoladeSchema = z.object({
  /**
   * Kept as `accolade-card-N` because the card's gradient comes from
   * `--portfolio-achievement-N-*`, which is keyed off this id. Renaming an id
   * makes that card fall back to the shared gradient.
   */
  id: idSchema,
  index: line(8),
  barTitle: line(160),
  badge: line(60),
  badgeIcon: line(40),
  pill: line(120),
  heading: line(200),
  description: line(800),
  certNo: line(120),
  certStatus: line(80),
  certIcon: line(40),
  certTitle: line(120),
  certSub: line(160),
  /** Stored wrapped in curly quotes; the terminal panel strips them at render. */
  quote: line(400),
  peekMeta: line(120),
  tabShort: line(80),
  fileName: line(120),
  ctaLabel: line(60),
  ctaHref: line(200),
  stats: z.array(accoladeStatSchema).max(4).default([]),
  /**
   * The four column captions for this card. These used to live in a module-level
   * `STAT_LABELS` matrix TRANSPOSED against the deck (outer index = column,
   * inner index = card); nesting them per card is the un-transposed form and
   * survives a deck reorder.
   */
  statLabels: z.array(line(60)).length(4).default(['', '', '', '']),
  accent: accentSchema,
})

export const achievementsSettingsSchema = z.object({
  badge: line(60).default('Verified Honors'),
  badgeSeparator: line(8).default('|'),
  heading: line(200).default('Institutional Accolades & Industry Honors'),
  intro: line(400).default(
    'Click any archive row or use the arrows to cycle through the four honors.',
  ),
  /** Copy of the secondary button under the archive list. */
  inspectLabel: line(60).default('Inspect All Records'),
  deck: z.array(accoladeSchema).max(8).default([
    {
      id: 'accolade-card-1',
      index: '01',
      barTitle: 'INFODAZZ • ESTD 2022 • TRICHY HQ',
      badge: 'TECHNOLOGY BUSINESS',
      badgeIcon: 'rocket_launch',
      pill: 'FOUNDER & CEO • DIGITAL TRANSFORMATION',
      heading: 'Infodazz — Helping Businesses Grow Through Technology',
      description:
        'Established in 2022. Headquarters Trichy, branches Madurai, Karaikudi, Kumbakonam. 50+ professionals across ERP, SaaS, Web & Mobile Apps, IT Solutions, Digital Marketing, SEO, Design, Animation/VFX, Photography/Videography and Event Management.',
      certNo: 'ESTD // INFODAZZ-2022',
      certStatus: 'VERIFIED',
      certIcon: 'award_star',
      certTitle: 'Founder & CEO',
      certSub: 'Infodazz • Trichy • Madurai • Karaikudi • Kumbakonam',
      quote: '“Vision: helping businesses grow through technology and digital transformation.”',
      peekMeta: 'TEAM: 50+ PROFESSIONALS',
      tabShort: '01 Infodazz',
      fileName: 'infodazz_venture_profile.ts',
      ctaLabel: 'infodazz.org',
      ctaHref: 'https://infodazz.org',
      stats: [
        { id: 'a1s1', kind: 'count', countTo: 50, prefix: '', suffix: '+', label: 'Team', text: '' },
        { id: 'a1s2', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: '4 Locations' },
        { id: 'a1s3', kind: 'count', countTo: 11, prefix: '', suffix: '', label: 'Services', text: '' },
        { id: 'a1s4', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Estd 2022' },
      ],
      statLabels: [
        'Team Strength',
        'Locations',
        'Service Verticals',
        'Founded',
      ],
      accent: 'gold',
    },
    {
      id: 'accolade-card-2',
      index: '02',
      barTitle: 'KITTLE PVT LTD • TRICHY • TECHNOLOGY INNOVATION',
      badge: 'IT SOLUTIONS',
      badgeIcon: 'cloud_done',
      pill: 'FOUNDER / OWNER • SOFTWARE & CONSULTING',
      heading: 'Kittle Pvt Ltd — IT Solutions & Digital Platforms',
      description:
        'Trichy-based technology company focused on Software Solutions, IT Services, Digital Platforms and Technology Consulting — building digital ecosystems for business growth.',
      certNo: 'VENTURE // KITTLE-TRICHY',
      certStatus: 'VALIDATED',
      certIcon: 'workspace_premium',
      certTitle: 'Founder / Owner',
      certSub: 'Kittle Pvt Ltd • Trichy',
      quote: '“Focus: software solutions, IT services, digital platforms and technology consulting.”',
      peekMeta: 'BASE: TRICHY',
      tabShort: '02 Kittle',
      fileName: 'kittle_venture_profile.ts',
      ctaLabel: 'Business Inquiries',
      ctaHref: '#advisory',
      stats: [
        { id: 'a2s1', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Software Solutions' },
        { id: 'a2s2', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'IT Services' },
        { id: 'a2s3', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Digital Platforms' },
        { id: 'a2s4', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Tech Consulting' },
      ],
      statLabels: ['Focus Areas', 'Base', 'Offerings', 'Engagement'],
      accent: 'cyan',
    },
    {
      id: 'accolade-card-3',
      index: '03',
      barTitle: 'SEVENTH SENSE RESEARCH GROUP • PUBLISHING PLATFORM',
      badge: 'RESEARCH PUBLISHER',
      badgeIcon: 'school',
      pill: 'FOUNDER / OWNER • ACADEMIC COLLABORATION',
      heading: 'Seventh Sense — 30+ Journals, 5+ Scopus Indexed',
      description:
        'International research publishing platform supporting researchers and academicians. Research publication ecosystem and academic collaboration support. Academic profile: Ph.D Madurai Kamaraj University, MCA Thiagarajar School of Management Madurai, B.Sc Mathematics GAC Kumbakonam — with research publications, patents, mentoring and guidance.',
      certNo: 'PLATFORM // SSRG-JOURNALS',
      certStatus: 'ACADEMIC PLATFORM',
      certIcon: 'menu_book',
      certTitle: 'Founder / Owner',
      certSub: 'Seventh Sense Research Group',
      quote: '“Supporting researchers and academicians through publishing and collaboration.”',
      peekMeta: '30+ JOURNALS • 5+ SCOPUS',
      tabShort: '03 Seventh Sense',
      fileName: 'seventh_sense_profile.ts',
      ctaLabel: 'SSRG Platform Portal',
      ctaHref: 'https://internationaljournalssrg.org',
      stats: [
        { id: 'a3s1', kind: 'count', countTo: 30, prefix: '', suffix: '+', label: 'Journals', text: '' },
        { id: 'a3s2', kind: 'count', countTo: 5, prefix: '', suffix: '+', label: 'Scopus', text: '' },
        { id: 'a3s3', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Publications' },
        { id: 'a3s4', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Mentoring' },
      ],
      statLabels: [
        'Intl Journals',
        'Scopus Indexed',
        'Ecosystem',
        'Mentorship',
      ],
      accent: 'emerald',
    },
    {
      id: 'accolade-card-4',
      index: '04',
      barTitle: 'KASTER TRUST • LEADERSHIP • GLOBAL VISION',
      badge: 'SOCIAL IMPACT',
      badgeIcon: 'volunteer_activism',
      pill: 'FOUNDER / TRUSTEE • BNI 2022 • ROTARY 2024',
      heading: 'Kaster Trust — Education Support & Community Leadership',
      description:
        'Founder / Trustee of Kaster Trust supporting education for economically disadvantaged students via fee support and learning opportunities. BNI Member since 2022, Rotary Member since 2024. From humble farmer family background — passionate traveller sharing knowledge through motivational sessions.',
      certNo: 'TRUST // KASTER-EDUCATION',
      certStatus: 'SOCIAL MISSION',
      certIcon: 'campaign',
      certTitle: 'Founder / Trustee',
      certSub: 'Kaster Trust • BNI • Rotary',
      quote: '“Technology creates possibilities, but people create impact.”',
      peekMeta: 'MISSION: EDUCATION ACCESS',
      tabShort: '04 Kaster & Networks',
      fileName: 'kaster_trust_profile.ts',
      ctaLabel: 'Support Education',
      ctaHref: '#advisory',
      stats: [
        { id: 'a4s1', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Fee Support' },
        { id: 'a4s2', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'BNI 2022' },
        { id: 'a4s3', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Rotary 2024' },
        { id: 'a4s4', kind: 'text', countTo: null, prefix: '', suffix: '', label: '', text: 'Global Travel' },
      ],
      statLabels: [
        'Mission Focus',
        'BNI Membership',
        'Rotary Membership',
        'Vision',
      ],
      accent: 'indigo',
    },
  ]),
})

/* ----------------------------------------------------------------- navbar */

export const navLinkSchema = z.object({
  id: idSchema,
  label: line(60),
  /** A `#section` anchor on this page, or an absolute URL. */
  href: line(200),
})

export const navbarSettingsSchema = z.object({
  ctaLabel: line(60).default('Book Executive Consultation'),
  ctaHref: line(200).default('#advisory'),
  ctaIcon: line(40).default('arrow_forward'),
  menuButtonLabel: line(40).default('Menu'),
  links: z.array(navLinkSchema).max(20).default([
    { id: 'n1', label: 'About', href: '#about' },
    { id: 'n2', label: 'Ventures', href: '#ventures' },
    { id: 'n3', label: 'Honors', href: '#achievements' },
    { id: 'n4', label: 'Keynotes', href: '#keynotes' },
    { id: 'n5', label: 'Advisory', href: '#governance' },
    { id: 'n6', label: 'Perspectives', href: '#perspectives' },
    { id: 'n7', label: 'Books', href: '#books' },
    { id: 'n8', label: 'Contact', href: '#advisory' },
  ]),
})

/* ----------------------------------------------------------------- footer */

const footerLinkSchema = z.object({
  id: idSchema,
  label: line(120),
  href: line(200),
  /** Opens in a new tab with `rel="noopener noreferrer"`. */
  external: z.boolean(),
  /** Renders in the heavier display face, for the primary link in a column. */
  accent: z.boolean(),
})

const footerColumnSchema = z.object({
  id: idSchema,
  heading: line(80),
  links: z.array(footerLinkSchema).max(30).default([]),
})

export const footerSettingsSchema = z.object({
  bio: line(600).default(
    'Founder | Technology Entrepreneur | Research Publisher | Social Impact Leader — Building technology businesses (Infodazz, Kittle), research platforms (Seventh Sense, 30+ journals, 5+ Scopus) and social impact (Kaster Trust education support).',
  ),
  credentials: line(400).default(
    'Ph.D — Madurai Kamaraj University • MCA — Thiagarajar School of Management, Madurai • B.Sc Mathematics — GAC Kumbakonam • BNI since 2022 • Rotary since 2024',
  ),
  /**
   * `{year}` is substituted with the current year at render, so the bar does not
   * have to be re-saved every January.
   */
  copyright: line(400).default(
    '© {year} Dr. R. Surendiran. Infodazz • Kittle Pvt Ltd • Seventh Sense Research Group • Kaster Trust. All Rights Reserved.',
  ),
  backToTopLabel: line(60).default('Back to Top'),
  columns: z.array(footerColumnSchema).max(8).default([
    {
      id: 'fc1',
      heading: 'GOVERNANCE',
      links: [
        { id: 'fc1l1', label: 'Executive Profile', href: '#about', external: false, accent: true },
        { id: 'fc1l2', label: 'Board Advisory', href: '#governance', external: false, accent: false },
        { id: 'fc1l3', label: 'Keynotes & Summits', href: '#keynotes', external: false, accent: false },
        { id: 'fc1l4', label: 'Publications', href: '#perspectives', external: false, accent: false },
        { id: 'fc1l5', label: 'Infodazz Enterprise', href: 'https://infodazz.org', external: true, accent: false },
      ],
    },
    {
      id: 'fc2',
      heading: 'VENTURES',
      links: [
        { id: 'fc2l1', label: 'Infodazz — Estd 2022', href: '#ventures', external: false, accent: false },
        { id: 'fc2l2', label: 'Kittle Pvt Ltd — Trichy', href: '#ventures', external: false, accent: false },
        { id: 'fc2l3', label: 'Seventh Sense Research', href: 'https://internationaljournalssrg.org', external: true, accent: false },
        { id: 'fc2l4', label: 'Kaster Trust — Education', href: '#ventures', external: false, accent: false },
      ],
    },
    {
      id: 'fc3',
      heading: 'ENGAGEMENT',
      links: [
        { id: 'fc3l1', label: 'Advisory Governance', href: '#about', external: false, accent: false },
        { id: 'fc3l2', label: 'Direct Consultation', href: '#advisory', external: false, accent: false },
      ],
    },
  ]),
})

/* ------------------------------------------------------------- the contact */

export const advisorySettingsSchema = z.object({
  eyebrow: line(60).default('CONTACT US'),
  heading: line(160).default("Let's build, research and create impact together!"),
  bio: line(600).default(
    'Dr. R. Surendiran — Founder & CEO, Infodazz • Founder / Owner, Kittle Pvt Ltd & Seventh Sense Research Group • Founder / Trustee, Kaster Trust. For business growth, research collaboration, education support and motivational sessions. HQ Trichy — Madurai, Karaikudi, Kumbakonam.',
  ),
  officeLabel: line(120).default('Official Executive Communications Office'),
  submitLabel: line(40).default('SUBMIT'),
  submitIcon: line(40).default('arrow_forward'),
  privacyLabel: line(60).default('Privacy Policy'),
  privacyHref: line(200).default('#privacy'),
  privacyConsent: line(400).default(
    'and consent to receive communications from Infodazz, Kittle Pvt Ltd, Seventh Sense Research Group and Kaster Trust.',
  ),
  successHeading: line(160).default('Inquiry Successfully Transmitted'),
  successBody: line(400).default(
    'The Executive Secretariat has received your message and will review and respond within 24 hours.',
  ),
  successAgainLabel: line(60).default('Send Another Message'),
})

export type MilestonesSettings = z.infer<typeof milestonesSettingsSchema>
export type QuoteSettings = z.infer<typeof quoteSettingsSchema>
export type GovernanceSettings = z.infer<typeof governanceSettingsSchema>
export type PerspectivesSettings = z.infer<typeof perspectivesSettingsSchema>
export type KeynotesSettings = z.infer<typeof keynotesSettingsSchema>
export type BooksSettings = z.infer<typeof booksSettingsSchema>
export type AboutSettings = z.infer<typeof aboutSettingsSchema>
export type VenturesSettings = z.infer<typeof venturesSettingsSchema>
export type AchievementsSettings = z.infer<typeof achievementsSettingsSchema>
export type NavbarSettings = z.infer<typeof navbarSettingsSchema>
export type FooterSettings = z.infer<typeof footerSettingsSchema>
export type AdvisorySettings = z.infer<typeof advisorySettingsSchema>
