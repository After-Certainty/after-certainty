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

export type QuestionSectionViewParams = {
  location: "home" | "start" | "index";
};

export type QuestionSelectParams = {
  question_id: string;
  location: string;
};

export type QuestionPathStartParams = {
  question_id: string;
};

export type QuestionStopOpenParams = {
  question_id: string;
  stop_position: number;
  entity_type: string;
};

export type QuestionPathCompleteParams = {
  question_id: string;
};

export type QuestionRelatedSelectParams = {
  from_id: string;
  to_id: string;
};

export type QuestionContinueBookParams = {
  question_id: string;
  book_id: string;
};

export type QuestionSearchHandoffParams = {
  question_id: string;
};

export type TrailIndexViewParams = {
  location: "start" | "index";
};

export type TrailSelectParams = {
  trail_id: string;
  location: string;
};

export type TrailPathStartParams = {
  trail_id: string;
};

export type TrailStopOpenParams = {
  trail_id: string;
  stop_position: number;
  entity_type: string;
  optional: boolean;
};

export type TrailRelatedSelectParams = {
  from_id: string;
  to_id: string;
};

export type TrailContinueBookParams = {
  trail_id: string;
  book_id: string;
};

export type TrailSearchHandoffParams = {
  trail_id: string;
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
  questionSectionView: "question_section_view",
  questionSelect: "question_select",
  questionPathStart: "question_path_start",
  questionStopOpen: "question_stop_open",
  questionPathComplete: "question_path_complete",
  questionRelatedSelect: "question_related_select",
  questionContinueBook: "question_continue_book",
  questionSearchHandoff: "question_search_handoff",
  trailIndexView: "trail_index_view",
  trailSelect: "trail_select",
  trailPathStart: "trail_path_start",
  trailStopOpen: "trail_stop_open",
  trailRelatedSelect: "trail_related_select",
  trailContinueBook: "trail_continue_book",
  trailSearchHandoff: "trail_search_handoff",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
