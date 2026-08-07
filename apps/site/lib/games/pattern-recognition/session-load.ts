import {
  getGameDateKey,
  selectDailyChallengeSlugs,
  selectPracticeChallengeSlugs,
  type SessionMode,
} from "./daily";
import {
  getEnrichedPublishedChallenges,
  type EnrichedChallenge,
} from "./enrich";

export type { SessionMode };

export type LoadedChallengeSession = {
  mode: SessionMode;
  challenges: EnrichedChallenge[];
  dailyDate?: string;
  sessionId: string;
};

async function challengesBySlugMap(): Promise<Map<string, EnrichedChallenge>> {
  const authored = await getEnrichedPublishedChallenges();
  return new Map(authored.map((challenge) => [challenge.slug, challenge]));
}

function pickChallenges(
  bySlug: Map<string, EnrichedChallenge>,
  slugs: readonly string[],
): EnrichedChallenge[] {
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((challenge): challenge is EnrichedChallenge => challenge != null);
}

export async function loadDailyChallengeSession(
  now: Date = new Date(),
): Promise<LoadedChallengeSession | null> {
  const bySlug = await challengesBySlugMap();
  if (bySlug.size === 0) return null;

  const dailyDate = getGameDateKey(now);
  const slugs = selectDailyChallengeSlugs([...bySlug.keys()], dailyDate);
  const challenges = pickChallenges(bySlug, slugs);
  if (challenges.length === 0) return null;

  return {
    mode: "daily",
    challenges,
    dailyDate,
    sessionId: `daily-${dailyDate}`,
  };
}

export async function loadPracticeChallengeSession(
  sessionSeed: string = `practice-${Date.now()}`,
): Promise<LoadedChallengeSession | null> {
  const bySlug = await challengesBySlugMap();
  if (bySlug.size === 0) return null;

  const slugs = selectPracticeChallengeSlugs([...bySlug.keys()], sessionSeed);
  const challenges = pickChallenges(bySlug, slugs);
  if (challenges.length === 0) return null;

  return {
    mode: "practice",
    challenges,
    sessionId: sessionSeed,
  };
}
