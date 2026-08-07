export const gamePaths = {
  home: "/games",
  patternRecognition: "/games/pattern-recognition",
  daily: "/games/pattern-recognition/daily",
  practice: "/games/pattern-recognition/practice",
  challenge: (slug: string) => `/games/pattern-recognition/challenge/${slug}`,
} as const;
