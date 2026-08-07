export const gamePaths = {
  home: "/games",
  patternRecognition: "/games/pattern-recognition",
  challenge: (slug: string) => `/games/pattern-recognition/challenge/${slug}`,
} as const;
