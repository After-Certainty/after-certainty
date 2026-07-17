/**
 * Browser security headers applied via `next.config.ts` `headers()`.
 * Exported for unit tests so CSP/frame policy changes stay intentional.
 */
export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      // Next.js + GA + Vercel Analytics require inline/eval and third-party script hosts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "media-src 'self' https: data:",
    ].join("; "),
  },
];
