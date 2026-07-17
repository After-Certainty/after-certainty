import { z } from "zod";

import { isHttpOrHttpsUrl, YOUTUBE_VIDEO_ID_RE } from "@/lib/security/urls";

/** Absolute http(s) URL — rejects `javascript:` and other schemes. */
export const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => isHttpOrHttpsUrl(value), {
    message: "URL must use http or https",
  });

/** Optional YouTube video id (exactly 11 URL-safe characters). */
export const youtubeVideoIdSchema = z.string().regex(YOUTUBE_VIDEO_ID_RE);
