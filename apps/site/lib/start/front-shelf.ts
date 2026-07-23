export type FrontShelfEntry = {
  slug: string;
  doorwayLabel: string;
  description: string;
};

export const FRONT_SHELF_INTRO =
  "Not everyone needs to begin in the same place. These books offer different doors into the same terrain: curiosity, systems, trust, perspective, story, love, and the practice of judgment after certainty fails.";

export const FRONT_SHELF_ENTRIES: FrontShelfEntry[] = [
  {
    slug: "curiosity-before-certainty",
    doorwayLabel: "Start with curiosity",
    description:
      "A friendly entry point into the whole project: how to stay curious when easy certainty hides complexity, weakens judgment, and closes learning too soon.",
  },
  {
    slug: "how-serious-systems-learn",
    doorwayLabel: "Start with practice",
    description:
      "For teams, leaders, engineers, and institutions that need to improve under pressure without waiting for perfect information.",
  },
  {
    slug: "trust-beyond-similarity",
    doorwayLabel: "Start with trust",
    description:
      "A social and civic doorway into the project: how trust remains possible across difference, disagreement, and partial perspective.",
  },
  {
    slug: "what-we-cannot-see",
    doorwayLabel: "Start with perspective",
    description:
      "A clear introduction to the limits of any single viewpoint, and why integration matters when no one sees the whole.",
  },
  {
    slug: "the-relay",
    doorwayLabel: "Start with story",
    description:
      "A fiction doorway into the same ideas: uncertainty, participation, coordination, and what people build together when no one has the complete map.",
  },
  {
    slug: "everyone-knows-love",
    doorwayLabel: "Start with the heart",
    description:
      "The most human-scale entry point: love as recognition before definition, and care as something we practice before we can fully explain it.",
  },
  {
    slug: "after-certainty",
    doorwayLabel: "Start with the thesis",
    description:
      "The capstone book: how to live, judge, and remain responsible once explanation reaches its limits and certainty is no longer enough.",
  },
  {
    slug: "coupling",
    doorwayLabel: "Start with systems",
    description:
      "A systems and architecture doorway: how connection, cohesion, drift, and consequence shape responsibility over time.",
  },
];
