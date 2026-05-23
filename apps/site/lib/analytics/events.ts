import type { GraphEntityKind } from "@/types/semanticGraph";

/**
 * GA4 setup (Admin):
 * - Data streams → Enhanced measurement: page views on; "Page changes based on browser history events" on.
 * - Enable Consent Mode on the web stream.
 * - Mark key events (file_download, generate_lead) after validating names in DebugView.
 *
 * Custom dimensions (optional): register `content_type`, `location`, `platform` for standard reports.
 */

/** GA4 recommended — content engagement (Observatory focus, entity detail). */
export type SelectContentParams = {
  content_type: GraphEntityKind | string;
  item_id: string;
  /** `link` from detail CTA; `canvas` from in-graph focus */
  method?: "link" | "canvas";
};

/** GA4 recommended — EPUB/PDF/DOCX downloads. Register as Key event if downloads matter. */
export type FileDownloadParams = {
  file_extension: string;
  file_name?: string;
  link_url: string;
  content_type?: "book";
  item_id?: string;
};

/** Outbound / external CTA clicks — filter by `location` + `platform` in Explorations. */
export type OutboundClickParams = {
  link_url: string;
  link_text: string;
  outbound: true;
  location: string;
  platform?: string;
};

/** Future newsletter signup — mark as Key event when Beehiiv form ships. */
export type GenerateLeadParams = {
  method?: string;
};

export const AnalyticsEvents = {
  selectContent: "select_content",
  fileDownload: "file_download",
  outboundClick: "click",
  generateLead: "generate_lead",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
