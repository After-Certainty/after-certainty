/**
 * Single source for marketing copy and asset paths.
 * Swap values here (or replace this module with CMS fetch) without editing section components.
 */

/** Mounted under After Certainty at this path — keep internal links consistent. */
export const woltyBasePath = "/books/when-others-look-to-you" as const;


/**
 * Public URLs → files on disk under `public/books/when-others-look-to-you/assets/`.
 * Replace those PNGs to update the site; paths stay stable.
 */
export const assets = {
  bookCover: "/books/when-others-look-to-you/assets/book-cover.png",
  heroBackground: "/books/when-others-look-to-you/assets/hero-bg.png",
  /** Spine / page-edge tiling in `HeroBookImage` */
  pageTexture: "/books/when-others-look-to-you/assets/page-texture.png",
} as const;

/** GitHub Releases — EPUB/DOCX for When Others Look to You (`after-certainty`). */
export const bookGithubDownloads = {
  epub:
    "https://github.com/ksteffe/after-certainty/releases/download/latest/when-others-look-to-you-v1.epub",
  docx:
    "https://github.com/ksteffe/after-certainty/releases/download/latest/when-others-look-to-you-v1.docx",
} as const;

/** Appendix B groups — forming, adjusting, eroding, circulating */
export type PatternGroupId =
  | "forming"
  | "adjusting"
  | "eroding"
  | "circulating";

export const patternGroups: Record<
  PatternGroupId,
  { title: string; description: string }
> = {
  forming: {
    title: "Forming",
    description:
      "Attention, example, and habit pull leadership into focus while the group is still finding direction.",
  },
  adjusting: {
    title: "Adjusting",
    description:
      "These keep decisions tied to what is real, to correction, and to who answers for outcomes.",
  },
  eroding: {
    title: "Eroding",
    description: "Feedback, dissent, and boundaries weaken over time.",
  },
  circulating: {
    title: "Circulating",
    description: "How leadership habits spread beyond where they started.",
  },
};

export const patternGroupOrder: readonly PatternGroupId[] = [
  "forming",
  "adjusting",
  "eroding",
  "circulating",
];

/** Internal link to another pattern — slug plus descriptive anchor copy for SEO and clarity */
export type RelatedPatternLink = {
  slug: string;
  /** Visible link text (sentence-style), not generic phrases like “click here” */
  linkText: string;
};

/** Optional infographic — shown in the pattern hero above Related ideas (after video, if any). */
export type PatternInfographic = {
  /** Path under `public/` */
  src: string;
  width: number;
  height: number;
  /** Accessible description; defaults from pattern title when omitted */
  alt?: string;
};

/** Long-form body for `/patterns/[slug]` — mirrors Appendix B entries */
export type PatternDetailBody = {
  group: PatternGroupId;
  context: string;
  problem: string;
  forces: readonly string[];
  observation: string;
  quote: string;
  effect: string;
  resultingContext: string;
  /** At least two entries recommended — connects detail pages in a navigable graph */
  relatedPatterns: readonly RelatedPatternLink[];
  /** Optional Medium essay — shown under Related ideas when set */
  mediumArticleHref?: string;
  /**
   * Optional embed — same shape as `introVideoPageContent.youtubeVideoId` (watch URL → ID only).
   * Renders in the pattern hero above Related ideas (and above the infographic when both are set).
   */
  youtubeVideoId?: string;
  /** Optional infographic — below video in the hero, above Related ideas */
  infographic?: PatternInfographic;
};

/** SEO / social metadata — see `buildPatternMetadata` in `lib/metadata.ts` */
export type PatternSeo = {
  title: string;
  /** Meta + OG description; omit and use `summary` or card `description` */
  description?: string;
  openGraph?: {
    title?: string;
    description?: string;
    /** Path under `public/` for OG/Twitter image */
    image?: string;
  };
};

export type PatternCardItem = {
  number: string;
  title: string;
  description: string;
  /** Short one-line fallback for meta when `seo.description` is omitted */
  summary?: string;
  /** URL path for this pattern detail page */
  href: string;
  /** Stable segment for `/patterns/[slug]` */
  slug: string;
  seo: PatternSeo;
  detail: PatternDetailBody;
};

export const site = {
  headerTitle: "WHEN OTHERS LOOK TO YOU",
  nav: [
    { label: "THE IDEA", href: "/books/when-others-look-to-you/idea" },
    { label: "PATTERNS", href: "/books/when-others-look-to-you/patterns" },
    { label: "THE BOOK", href: "/books/when-others-look-to-you/book" },
    { label: "ABOUT", href: "/books/when-others-look-to-you/about" },
    { label: "RESOURCES", href: "/books/when-others-look-to-you/resources" },
  ],
  headerCta: { label: "READ THE BOOK", href: "/books/when-others-look-to-you/book" },
} as const;

/** `/book` — retailer / reader links (swap for real destinations when available). */
export type BookPageLink = {
  label: string;
  href: string;
};

/** Extra download blocks (e.g. companion edition) — filled from the release manifest at runtime */
export type BookCompanionDownloadSection = {
  heading: string;
  links: readonly BookPageLink[];
};

export type BookPageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  paragraphs: readonly string[];
  readLinks: readonly BookPageLink[];
  coverAlt: string;
  companionDownloadSections?: readonly BookCompanionDownloadSection[];
};

export const bookPageContent: BookPageContent = {
  eyebrow: "THE BOOK",
  title: "When Others Look to You",
  subtitle: "Renewal and Erosion in Leadership",
  paragraphs: [
    "Leadership doesn’t start with a title. It starts when people look to you—when your steadiness, your choices, and what you reward quietly become the environment everyone navigates.",
    "This book names how influence forms, renews, erodes, and spreads—so you can lead with clearer judgment when others are watching. Right now the book is available on Amazon.",
  ],
  readLinks: [
    {
      label: "Buy on Amazon",
      href: "https://www.amazon.com/gp/product/B0GX34SRDJ",
    },
    {
      label: "Download EPUB",
      href: bookGithubDownloads.epub,
    },
    {
      label: "Download DOCX",
      href: bookGithubDownloads.docx,
    },
  ],
  coverAlt: "Book cover: When Others Look to You by Kevin Steffensen",
};

/** `/about` — reflective copy only; edit in one place */
export type AboutPageContent = {
  eyebrow: string;
  title: string;
  intro: readonly string[];
  whyWritten: {
    heading: string;
    paragraphs: readonly string[];
  };
  exploring: {
    heading: string;
    paragraphs: readonly string[];
  };
};

export const aboutPageContent: AboutPageContent = {
  eyebrow: "ABOUT",
  title: "A note on the work",
  intro: [
    "This site and the book grew out of questions that linger after meetings end—about who bears the cost of our pace, what gets rewarded when things get tight, and how influence moves when no one has voted on it.",
    "Nothing here is offered as a formula. It's an invitation to look closely at patterns many of us already sense in the room.",
  ],
  whyWritten: {
    heading: "Why the book was written",
    paragraphs: [
      "Leadership is often taught as inspiration or technique. The slower truth is relational: people take cues from what they watch you tolerate, celebrate, and overlook.",
      "When Others Look to You tries to name how renewal and erosion actually travel—through attention, example, and habit—without pretending the answers are neat or final.",
    ],
  },
  exploring: {
    heading: "What I'm exploring now",
    paragraphs: [
      "I'm still tracing how responsibility lands when decisions are fast and information is incomplete—where dissent lives, how exceptions harden into norms, and what \"success\" leaves behind when the quarter ends.",
      "If something here matches what you're noticing in your own work, that's enough. The rest can stay open-ended.",
    ],
  },
};

/** `/intro` — embedded YouTube (watch URL → video ID only). */
export type IntroVideoPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  youtubeVideoId: string;
};

export const introVideoPageContent: IntroVideoPageContent = {
  eyebrow: "INTRO",
  title: "Watch the introduction",
  description:
    "A short orientation to the ideas behind When Others Look to You—how influence gathers when people turn toward you, and why that matters before anyone says “leader.”",
  /** From https://www.youtube.com/watch?v=ma1UbSajuVI */
  youtubeVideoId: "ma1UbSajuVI",
};

/** Hero body copy split so emphasis (“attention”) can render in brand gold */
export type HeroLeadSegment = { text: string; emphasize?: boolean };

export const heroContent = {
  /** Display lines — joined for accessibility fallback where needed */
  titleLines: [
    "A leader is someone",
    "others look to",
    "when deciding what to do next.",
  ] as const,
  leadSegments: [
    { text: "Leadership begins when " },
    { text: "attention", emphasize: true },
    { text: " converges." },
  ] satisfies readonly HeroLeadSegment[],
  primaryCta: { label: "READ THE BOOK", href: "/books/when-others-look-to-you/book" },
  secondaryCta: {
    label: "WATCH INTRO",
    href: "/books/when-others-look-to-you/intro",
    /** Renders a small play icon before the label */
    showPlayIcon: true,
  },
  imageAlt: "Book cover for When Others Look to You",
  imageSrc: assets.bookCover,
  /** Optional full-bleed photo behind gradients — swap file in /public/assets/ */
  backgroundSrc: assets.heroBackground,
};

export type IdeaLensItem = {
  name: string;
  body: string;
};

/** Semantic definition line — `term` is wrapped in `<dfn>` (defining instance) */
export type IdeaDefinitionBlock = {
  /** Short label above the block, e.g. “DEFINITION” */
  label: string;
  /** Text before the defined term */
  beforeTerm: string;
  /** The term being defined (one `<dfn>`) */
  term: string;
  /** Text after the term — typically completes the definition sentence */
  afterTerm: string;
};

/** Plain sentence for meta / JSON-LD */
export function formatIdeaDefinitionSentence(block: IdeaDefinitionBlock): string {
  return `${block.beforeTerm}${block.term}${block.afterTerm}`;
}

export type IdeaPageContent = {
  hero: {
    eyebrow: string;
    title: string;
    definitionBlock: IdeaDefinitionBlock;
    lead: string;
  };
  lenses: {
    sectionLabel: string;
    title: string;
    intro: string;
    items: readonly IdeaLensItem[];
  };
  whyMatters: {
    sectionLabel: string;
    title: string;
    paragraphs: readonly string[];
  };
};

/** `/idea` — definition, three lenses, why the model matters. Edit copy here only. */
export const ideaPageContent: IdeaPageContent = {
  hero: {
    eyebrow: "THE IDEA",
    title: "Leadership is influence under observation.",
    definitionBlock: {
      label: "DEFINITION",
      beforeTerm: "A ",
      term: "leader",
      afterTerm:
        " is someone others look to when deciding what to do next.",
    },
    lead:
      "When people look to you, they are not only asking what to do next—they are noticing what you reward, what you overlook, and what you treat as normal. Long before title enters the room, that steady signal is already shaping how they choose.",
  },
  lenses: {
    sectionLabel: "THREE LENSES",
    title: "Three ways people read your influence",
    intro:
      "The same choices can be examined through three lenses—harm, effectiveness, and legitimacy. None replaces the others; together they name what people already weigh when they watch someone lead.",
    items: [
      {
        name: "Harm",
        body:
          "Who bears the cost of this pattern of decisions? What pain is treated as inevitable, private, or someone else’s problem—and who is quietly asked to absorb it so the rest can move faster or stay comfortable?",
      },
      {
        name: "Effectiveness",
        body:
          "Does the work actually improve for the people it is meant to serve? Do outcomes hold up to scrutiny, or does momentum come from pressure, heroics, and debt moved out of sight?",
      },
      {
        name: "Legitimacy",
        body:
          "In their eyes, is your authority earned—through fairness, competence, and care—or mainly asserted by role? Trust is not guaranteed by position; it is renewed or eroded in small, repeated signals.",
      },
    ],
  },
  whyMatters: {
    sectionLabel: "WHY IT MATTERS",
    title: "A simple map for a crowded moment",
    paragraphs: [
      "Most leadership talk mixes inspiration with improvisation. That can feel vivid in the moment—and leave teams unsure what standard actually applies when stakes rise.",
      "Harm, effectiveness, and legitimacy do not solve every dilemma. They give language to tensions people already feel when others look to them—and when they look to you.",
      "When those lenses stay in view, influence is harder to confuse with noise. Renewal has room to grow; erosion becomes harder to deny.",
    ],
  },
};

export const patterns: PatternCardItem[] = [
  {
    number: "1.",
    title: "Attention Finds a Focus",
    description:
      "Attention settles on one person. Others start lining up their behavior with that person’s actions, tone, or timing.",
    slug: "attention-finds-a-focus",
    href: "/books/when-others-look-to-you/patterns/attention-finds-a-focus",
    seo: {
      title: "Attention Finds a Focus",
    },
    detail: {
      group: "forming",
      context: "The group faces unclear next steps. It needs direction.",
      problem:
        "People need to work together. No clear process has named who will lead.",
      forces: [
        "People want a steer when things are unclear",
        "Silence pushes someone to act",
        "Early signals weigh extra",
        "Leadership can show up without anyone planning it",
      ],
      observation:
        "Attention settles on one person. Others start lining up their behavior with that person’s actions, tone, or timing.",
      quote:
        "When nobody knows the next move, attention finds a focus fast—then direction follows whether anyone planned it or not.",
      effect:
        "Influence grows fast. The person others look to is hard to ignore in the group. That holds whether or not they claim formal authority.",
      resultingContext:
        "A loop forms. Attention feeds influence. Influence feeds attention. Authority starts to lock in.",
      relatedPatterns: [
        {
          slug: "examples-accumulate",
          linkText:
            "How modeled behavior becomes the unwritten standard others follow",
        },
        {
          slug: "leadership-coalesces",
          linkText:
            "When the group keeps defaulting to the same person without a formal vote",
        },
      ],
      youtubeVideoId: "3N-vY1i5rg8",
      infographic: {
        src: "/books/when-others-look-to-you/assets/attention-finds-a-focus.png",
        width: 1200,
        height: 669,
        alt: "Infographic summarizing how attention converges on one person and influence follows.",
      },
    },
  },
  {
    number: "2.",
    title: "Examples Accumulate",
    description:
      "What the leader does—especially under pressure—quickly sets what others treat as acceptable.",
    slug: "examples-accumulate",
    href: "/books/when-others-look-to-you/patterns/examples-accumulate",
    seo: {
      title: "Examples Accumulate",
    },
    detail: {
      group: "forming",
      context:
        "A leader reacts to a mistake, competing pressures, or unclear ground in a shared setting.",
      problem: "People need to know what counts as OK. Clear rules are missing or thin.",
      forces: [
        "People watch others when things are unclear",
        "What people see moves faster than written rules",
        "Early reactions set what feels allowed",
        "Silence and emphasis both send a signal",
      ],
      observation:
        "What the leader does—especially under pressure—quickly sets what others treat as acceptable.",
      quote:
        "Careful what we model in the room; examples accumulate faster than anything we post on the wiki.",
      effect:
        "Norms form fast. No vote is needed. They shape how truth, error, and risk get handled.",
      resultingContext:
        "Behavior settles into habit. People read the next situation through the example already set.",
      relatedPatterns: [
        {
          slug: "attention-finds-a-focus",
          linkText:
            "Where people look first when nobody has named the next move yet",
        },
        {
          slug: "dissent-is-welcomed",
          linkText:
            "Whether uncomfortable news can surface before it becomes expensive",
        },
      ],
      youtubeVideoId: "wHE-WLn-Bh8",
      infographic: {
        src: "/books/when-others-look-to-you/assets/examples-accumulate.png",
        width: 1200,
        height: 669,
        alt: "Infographic summarizing how repeated examples become what others treat as normal.",
      },
    },
  },
  {
    number: "3.",
    title: "Leadership Coalesces",
    description:
      "The group defaults to the same person. That can happen even when no formal authority exists.",
    slug: "leadership-coalesces",
    href: "/books/when-others-look-to-you/patterns/leadership-coalesces",
    seo: {
      title: "Leadership Coalesces",
    },
    detail: {
      group: "forming",
      context:
        "A group repeatedly turns to the same person when decisions are unclear.",
      problem:
        "On paper, who decides is unclear. Or the role is assigned, but the work still slides to the same person.",
      forces: [
        "Repetition builds familiarity and trust",
        "Speed favors the usual decision path",
        "Dodging unclear ground reinforces habit",
        "Informal authority can feel easier than formal handoff",
      ],
      observation:
        "The group defaults to the same person. That can happen even when no formal authority exists.",
      quote:
        "It's not on the chart, but leadership coalesces around you—every time it's fuzzy, the call still comes back to you.",
      effect:
        "Authority forms through repetition. It gets hard to share or hand off.",
      resultingContext:
        "The person becomes the default decision-maker. Other paths for leading grow weaker.",
      relatedPatterns: [
        {
          slug: "attention-finds-a-focus",
          linkText: "How attention gathers before titles and charts catch up",
        },
        {
          slug: "disagreement-is-suppressed",
          linkText: "When disagreement stops reshaping what gets decided",
        },
      ],
      youtubeVideoId: "vXG8kn-5QTo",
      infographic: {
        src: "/books/when-others-look-to-you/assets/leadership-coalesces.png",
        width: 1200,
        height: 669,
        alt: "Infographic summarizing how the group keeps defaulting to the same person as decisions repeat.",
      },
    },
  },
  {
    number: "4.",
    title: "Dissent is Welcomed",
    description:
      "Problems show up early. Reality reaches those who decide in time.",
    slug: "dissent-is-welcomed",
    href: "/books/when-others-look-to-you/patterns/dissent-is-welcomed",
    seo: {
      title: "Dissent is Welcomed",
    },
    detail: {
      group: "adjusting",
      context:
        "Problems, risks, or failures show up inside a group or setting.",
      problem:
        "Timely correction depends on whether bad news can reach those who decide.",
      forces: [
        "Speaking up can cost people socially or at work",
        "Reporting lines filter or delay information",
        "Good news travels easier than bad news",
        "People learn what is safe to say",
      ],
      observation:
        "Problems show up early. Reality reaches those who decide in time.",
      quote:
        "If you see a problem, say it now. Dissent is welcomed here—we can't fix what we don't raise while it's still small.",
      effect:
        "Early correction remains possible. Failure stays smaller and cheaper.",
      resultingContext:
        "Problems surface before they compound. Early challenge stays credible, and correction can still reach the table in time.",
      relatedPatterns: [
        {
          slug: "examples-accumulate",
          linkText:
            "What people infer from what leaders reward and overlook in public",
        },
        {
          slug: "learning-collapses",
          linkText:
            "When news from the ground stops updating decisions in time",
        },
      ],
      youtubeVideoId: "hCC_faAUMZA",
      infographic: {
        src: "/books/when-others-look-to-you/assets/dissent-is-welcomed.png",
        width: 1200,
        height: 669,
        alt: "Infographic summarizing how dissent surfaces problems early so leaders can correct course in time.",
      },
      mediumArticleHref:
        "https://medium.com/@steffensen.kevin/dissent-is-welcomed-b444e4c16592",
    },
  },
  {
    number: "5.",
    title: "Feedback Drives Change",
    description:
      "The group shifts direction based on new facts or new risk.",
    slug: "feedback-drives-change",
    href: "/books/when-others-look-to-you/patterns/feedback-drives-change",
    seo: {
      title: "Feedback Drives Change",
    },
    detail: {
      group: "adjusting",
      context:
        "New facts, visible risk, or bad assumptions show up after direction is set.",
      problem:
        "The group must choose: change course or protect the public story and what people already signed up for.",
      forces: [
        "Going public makes reversal costly",
        "Momentum favors staying the course",
        "Saying we were wrong can threaten legitimacy",
        "Small fixes are easier than full reversals",
      ],
      observation:
        "The group shifts direction based on new facts or new risk.",
      quote:
        "We're not wed to yesterday's plan—feedback drives change, and what we learned this morning changes what we ship.",
      effect:
        "Plans stay tied to reality instead of to an outdated story.",
      resultingContext:
        "Correction still matters. The group still has room to revise when facts change.",
      relatedPatterns: [
        {
          slug: "dissent-is-welcomed",
          linkText:
            "Keeping channels open when new facts challenge yesterday's plan",
        },
        {
          slug: "leaders-feel-the-consequences",
          linkText:
            "Staying tied to the human cost when direction has to change",
        },
      ],
      youtubeVideoId: "duyBPIOz94Y",
      infographic: {
        src: "/books/when-others-look-to-you/assets/feedback-drives-change.png",
        width: 1200,
        height: 669,
        alt: "Infographic summarizing how feedback changes direction when new facts or risks appear.",
      },
      mediumArticleHref:
        "https://medium.com/@steffensen.kevin/feedback-drives-change-2c7251f46610",
    },
  },
  {
    number: "6.",
    title: "Leaders Feel the Consequences",
    description:
      "Those who decide stay tied to what their choices do to others.",
    slug: "leaders-feel-the-consequences",
    href: "/books/when-others-look-to-you/patterns/leaders-feel-the-consequences",
    seo: {
      title: "Leaders Feel the Consequences",
    },
    detail: {
      group: "adjusting",
      context: "A decision creates cost, risk, or gain for people in a group.",
      problem:
        "Where people decide and where costs land can separate.",
      forces: [
        "Incentives favor visible wins over visible cost",
        "In large settings, effects land unevenly",
        "Distance makes harm easier to miss",
        "Pushing pain downhill is easier",
      ],
      observation:
        "Those who decide stay tied to what their choices do to others.",
      quote:
        "If we called it, we sit with the fallout. Leaders feel the consequences on this; we're not sliding the pain down a layer.",
      effect:
        "Accountability stays in view. Harm is harder to shrug off. It is harder to repeat harm without owning it.",
      resultingContext:
        "Costs do not quietly slide onto someone else. Trust that correction will work can hold.",
      relatedPatterns: [
        {
          slug: "dissent-is-welcomed",
          linkText:
            "Hearing risk and harm while speaking up still feels survivable",
        },
        {
          slug: "learning-collapses",
          linkText:
            "Closing the gap between decisions and what is happening on the ground",
        },
      ],
      youtubeVideoId: "QKSjw-ax2fA",
      infographic: {
        src: "/books/when-others-look-to-you/assets/leaders-feel-the-consequences.png",
        width: 1200,
        height: 669,
        alt: "Infographic summarizing how leaders stay tied to the consequences their decisions create.",
      },
      mediumArticleHref:
        "https://medium.com/@steffensen.kevin/leaders-feel-the-consequences-dd6a8c73ddd5",
    },
  },
  {
    number: "7.",
    title: "Disagreement is Suppressed",
    description:
      "Dissent fades or softens until it no longer challenges decisions.",
    slug: "disagreement-is-suppressed",
    href: "/books/when-others-look-to-you/patterns/disagreement-is-suppressed",
    seo: {
      title: "Disagreement is Suppressed",
    },
    detail: {
      group: "eroding",
      context:
        "A leader or leadership setup gains stability, success, or repeated proof that they are right.",
      problem:
        "Guarding the leader can matter as much as getting the facts right.",
      forces: [
        "Success builds confidence. Challenge feels less needed.",
        "Speaking against the line costs more socially",
        "Loyalty is rewarded over pushback",
        "Stories about who we are harden around the leader",
      ],
      observation:
        "Dissent fades or softens until it no longer challenges decisions.",
      quote:
        "I keep asking where the challenge is, and I'm not hearing it. Disagreement is suppressed—even when the risk is staring at us.",
      effect:
        "Paths for correction narrow. Errors stay hidden. Late failure grows more likely.",
      resultingContext:
        "Authority pulls away from feedback, and separation speeds up.",
      relatedPatterns: [
        {
          slug: "leadership-coalesces",
          linkText:
            "How informal defaults steer who is allowed to challenge the line",
        },
        {
          slug: "learning-collapses",
          linkText:
            "When timely signals from practice stop reaching the people who decide",
        },
      ],
      mediumArticleHref:
        "https://medium.com/@steffensen.kevin/disagreement-is-suppressed-49514eb3bc43",
    },
  },
  {
    number: "8.",
    title: "Learning Collapses",
    description:
      "They do not get a clear read in time on what their choices are doing.",
    slug: "learning-collapses",
    href: "/books/when-others-look-to-you/patterns/learning-collapses",
    seo: {
      title: "Learning Collapses",
    },
    detail: {
      group: "eroding",
      context:
        "Those who decide sit far from where effects show up.",
      problem:
        "News from the ground does not reliably reach them in time.",
      forces: [
        "Size adds distance from impact",
        "Formal reporting filters or delays signals",
        "Bad news is costly to raise",
        "Good news travels easier than bad news",
      ],
      observation:
        "They do not get a clear read in time on what their choices are doing.",
      quote:
        "We're steering off summaries again. Learning collapses when the ground story never reaches this room.",
      effect:
        "Feedback weakens. Decisions move away from what is really happening. The surface can still look steady.",
      resultingContext:
        "Errors repeat, harm accumulates, and correction arrives late and costs more.",
      relatedPatterns: [
        {
          slug: "leaders-feel-the-consequences",
          linkText:
            "Keeping decision-makers accountable to outcomes instead of narratives alone",
        },
        {
          slug: "dissent-is-welcomed",
          linkText:
            "Protecting early warnings before dissent goes underground",
        },
      ],
      mediumArticleHref:
        "https://medium.com/@steffensen.kevin/learning-collapses-41c7ebef3c93",
    },
  },
  {
    number: "9.",
    title: "Exceptions are Forever",
    description:
      "Workarounds and shortcuts turn into how the group works day to day.",
    slug: "exceptions-are-forever",
    href: "/books/when-others-look-to-you/patterns/exceptions-are-forever",
    seo: {
      title: "Exceptions are Forever",
    },
    detail: {
      group: "eroding",
      context:
        "A group adopts emergency measures or exceptions during a crisis or rush.",
      problem:
        "Moves made for speed or survival do not always roll back when things calm down.",
      forces: [
        "Urgency justifies skipping normal limits",
        "Short-term wins reinforce the exception",
        "Rolling back takes effort and coordination",
        "New ways of working turn into habit fast",
      ],
      observation:
        "Workarounds and shortcuts turn into how the group works day to day.",
      quote:
        "Let's be careful carving out another exception—exceptions are forever, and this one will outlive the emergency we made it for.",
      effect:
        "Temporary choices turn into permanent habit. No one stops to review.",
      resultingContext:
        "Authority grows. Limits weaken. Separation builds over time.",
      relatedPatterns: [
        {
          slug: "disagreement-is-suppressed",
          linkText:
            "When challenge fades as loyalty outweighs uncomfortable facts",
        },
        {
          slug: "learning-collapses",
          linkText:
            "Why leaders lose sight of what rolling exceptions cost day to day",
        },
      ],
      mediumArticleHref:
        "https://medium.com/@steffensen.kevin/exceptions-are-forever-1299b99da371",
    },
  },
  {
    number: "10.",
    title: "Leadership Reproduces Itself",
    description:
      "People copy leadership habits and norms. That shapes how the next round of leaders forms.",
    slug: "leadership-reproduces-itself",
    href: "/books/when-others-look-to-you/patterns/leadership-reproduces-itself",
    seo: {
      title: "Leadership Reproduces Itself",
    },
    detail: {
      group: "circulating",
      context:
        "A group has settled on visible leadership habits—what gets rewarded, what gets punished, what gets ignored.",
      problem:
        "People read those habits as personal style and as the local picture of “how things work here.” That picture travels.",
      forces: [
        "Copying is faster than being taught step by step",
        "People credit what they can see, not hidden setup",
        "New members learn from example before they learn from rules",
        "What gets rewarded and repeated is what gets copied",
      ],
      observation:
        "People copy leadership habits and norms. That shapes how the next round of leaders forms.",
      quote:
        "Watch what gets praised in public—that's what people will imitate. Leadership reproduces itself through what last looked successful.",
      effect:
        "Local habits become templates. What helps and what hurts both copy forward.",
      resultingContext:
        "Other places start to look like this one. Forming and Eroding habits can spread. No one has to mean to write a playbook.",
      relatedPatterns: [
        {
          slug: "examples-accumulate",
          linkText:
            "What gets copied when people watch what gets praised under pressure",
        },
        {
          slug: "leadership-coalesces",
          linkText:
            "How informal defaults become the training floor for the next leaders",
        },
      ],
      youtubeVideoId: "rFD_xfottcQ",
    },
  },
];

export function getPatternBySlug(slug: string): PatternCardItem | undefined {
  return patterns.find((p) => p.slug === slug);
}

/** Ordered list of every pattern — prefer this over importing `patterns` in pages. */
export function getAllPatterns(): readonly PatternCardItem[] {
  return patterns;
}

/** Related patterns for a detail page (same order as `detail.relatedPatterns`). */
export function getRelatedPatterns(pattern: PatternCardItem) {
  return resolveRelatedPatterns(pattern.detail.relatedPatterns);
}

/** Patterns whose `detail.group` matches (forming → circulating). */
export function getPatternsByCategory(
  category: PatternGroupId,
): PatternCardItem[] {
  return patterns.filter((p) => p.detail.group === category);
}

/** Resolve related patterns for detail pages; preserves `relatedPatterns` order. */
export function resolveRelatedPatterns(
  refs: readonly RelatedPatternLink[],
): Array<{ pattern: PatternCardItem; linkText: string }> {
  return refs.map((ref) => {
    const pattern = getPatternBySlug(ref.slug);
    if (!pattern) {
      throw new Error(`Unknown related pattern slug: ${ref.slug}`);
    }
    return { pattern, linkText: ref.linkText };
  });
}

/** Patterns grouped by appendix category — order within each group follows `patterns`. */
export function getPatternsGrouped(): {
  group: PatternGroupId;
  patterns: PatternCardItem[];
}[] {
  const buckets: Record<PatternGroupId, PatternCardItem[]> = {
    forming: [],
    adjusting: [],
    eroding: [],
    circulating: [],
  };
  for (const p of patterns) {
    buckets[p.detail.group].push(p);
  }
  return patternGroupOrder.map((group) => ({
    group,
    patterns: buckets[group],
  }));
}

/** `/patterns` — index intro copy (grid cards use `patterns`). */
export type PatternsPageContent = {
  label: string;
  title: string;
  /** What patterns are and how to use this page */
  intro: string;
  /** Optional supporting paragraph */
  introLine2?: string;
  /** Optional explainer playlist — shown under intro copy */
  youtubePlaylist?: {
    href: string;
    /** Accessible link text (sentence-style) */
    label: string;
  };
};

export const patternsPageContent: PatternsPageContent = {
  label: "PATTERNS",
  title: "Leadership patterns — forming, adjusting, eroding, circulating.",
  intro:
    "These patterns run through the argument: how leadership forms, renews, erodes, and spreads. Four groups—forming, adjusting, eroding, and circulating—hold the entries. Each one notes when it shows up, what is happening, and what tends to follow.",
  introLine2:
    "These are not prescriptions. They are patterns to watch for in small groups, workplaces, and public life. Four groups organize the list below; open any card for context, forces, observation, and related patterns.",
  youtubePlaylist: {
    href: "https://www.youtube.com/playlist?list=PL0gz-cNuLgIZkd7HcM8tZory5sa-aN6V9",
    label: "Watch the pattern playlist on YouTube",
  },
};

export const patternSectionContent = {
  label: "THE PATTERN",
  title: "Leadership emerges through patterns.",
  intro:
    "Leadership doesn't arrive fully formed. It shows up as recurring behaviors—signals others mirror.",
  introLine2:
    "These patterns shape what people expect, tolerate, and ultimately repeat.",
  /** Home preview — full list on `/patterns` */
  patterns: patterns.slice(0, 3),
  viewAll: {
    label: "VIEW ALL PATTERNS",
    href: "/books/when-others-look-to-you/patterns",
  },
};

export type SplitColumnContent = {
  label: string;
  heading: string;
  paragraph: string;
  items: string[];
};

export type SubscribeColumnContent = {
  /** Uppercase eyebrow above the form (gold in UI) */
  heading: string;
  /** Supporting line under the heading */
  description: string;
  placeholder?: string;
  submitLabel?: string;
};

export type WhyItMattersContent = {
  /** Small uppercase label above the heading */
  sectionLabel: string;
  title: string;
  paragraph: string;
  learnMore: { label: string; href: string };
  subscribe: SubscribeColumnContent;
};

export type SectionContent = {
  renewalErosion: {
    textureSrc?: string;
    renewal: SplitColumnContent;
    erosion: SplitColumnContent;
  };
  whyItMatters: WhyItMattersContent;
};

export const sectionContent: SectionContent = {
  renewalErosion: {
    textureSrc: assets.heroBackground,
    renewal: {
      label: "RENEWAL",
      heading: "Leadership that renews",
      paragraph:
        "Renewal shows up as openness—room for learning, shared judgment, and momentum that doesn't hollow people out.",
      items: [
        "Encourages learning",
        "Shares authority",
        "Creates circulation",
      ],
    },
    erosion: {
      label: "EROSION",
      heading: "Leadership that erodes",
      paragraph:
        "Erosion tightens in silence—small withdrawals of trust that compound until recovery feels risky.",
      items: ["Closes down openness", "Discourages truth", "Fractures trust"],
    },
  },
  whyItMatters: {
    sectionLabel: "WHY THIS MATTERS",
    title: "We live in a time of renewal and erosion.",
    paragraph:
      "The patterns people follow aren’t announced—they’re observed. When others look to you, your steadiness becomes part of the environment: either clarifying or quietly corroding what teams dare to say and do.",
    learnMore: {
      label: "LEARN MORE ABOUT THE IDEA",
      href: "/books/when-others-look-to-you/idea",
    },
    subscribe: {
      heading: "STAY IN THE CONVERSATION",
      description:
        "Occasional notes on leadership patterns—no spam. Unsubscribe anytime.",
      placeholder: "Your email address",
      submitLabel: "SUBSCRIBE",
    },
  },
};
