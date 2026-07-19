import type { GraphEntityKind } from "@/types/semanticGraph";

/**
 * GA4 setup (Admin):
 * - Data streams → Enhanced measurement: page views on; "Page changes based on browser history events" on.
 * - Enable Consent Mode on the web stream.
 * - Mark key events (file_download) after validating names in DebugView.
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

/** Global Search — never include raw query strings (privacy). */
export type SearchOpenParams = {
  method: "header" | "shortcut" | "mobile" | "link" | "direct";
};

export type SearchQueryParams = {
  surface: "quick" | "full";
  has_results: boolean;
  result_count_bucket: string;
  query_length_bucket: string;
};

export type SearchSelectParams = {
  content_type: string;
  item_id: string;
  surface: "quick" | "full";
  rank_bucket: string;
};

export type SearchRefineParams = {
  surface: "quick" | "full";
};

export type SearchNoResultsParams = {
  surface: "quick" | "full";
  query_length_bucket: string;
};

export const AnalyticsEvents = {
  selectContent: "select_content",
  fileDownload: "file_download",
  outboundClick: "click",
  searchOpen: "search_open",
  searchQuery: "search_query",
  searchSelect: "search_select",
  searchRefine: "search_refine",
  searchNoResults: "search_no_results",
  searchExpand: "search_expand",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
