/**
 * User-agent tokens for link-preview / Open Graph crawlers.
 * Explicit allow rules help platforms (e.g. Meta Sharing Debugger) validate access
 * even when a wildcard rule exists.
 *
 * @see https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/
 */
export const OPEN_GRAPH_CRAWLER_USER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Slackbot-LinkExpanding",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
  "Pinterestbot",
  "Applebot",
] as const;
