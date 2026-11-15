import type {
  AnalyticsEventName,
  SearchNoResultsParams,
  SearchOpenParams,
  SearchQueryParams,
  SearchRefineParams,
  SearchSelectParams,
} from "@/lib/analytics/events";
import { trackVercelEvent } from "@/lib/analytics/vercel-track";

/**
 * GA4 was retired (Gate 4). Legacy GA-only helpers remain as no-ops so call sites
 * compile without driving network traffic. Prefer `trackReaderEvent` / `trackVercelEvent`
 * for primary reader measurement.
 */
export function isAnalyticsEnabled(): boolean {
  return false;
}

/** @deprecated GA consent cookie removed with Gate 4; always false. */
export function hasAnalyticsConsent(): boolean {
  return false;
}

/** @deprecated GA-only; no-op after Gate 4. */
export function trackEvent(
  event: AnalyticsEventName,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  void event;
  void params;
}

/** Observatory / entity focus — formerly GA `select_content`; no-op after Gate 4. */
export function trackSelectContent(params: {
  content_type: string;
  item_id: string;
  method?: "link" | "canvas";
}): void {
  void params;
  trackEvent("select_content");
}

export function trackOutboundClick(params: {
  link_url: string;
  link_text: string;
  location: string;
  platform?: string;
}): void {
  void params;
  trackEvent("click");
}

export function trackFileDownload(params: {
  file_extension: string;
  file_name?: string;
  link_url: string;
  content_type?: string;
  item_id?: string;
  location?: string;
}): void {
  void params;
  trackEvent("file_download");
}

/** Declarative analytics payload for `TrackedLink` / `CTAButton` (legacy shape). */
export function outboundLinkAnalytics(
  link_url: string,
  link_text: string,
  location: string,
  platform?: string,
): { event: AnalyticsEventName; params: Record<string, string | boolean> } {
  return {
    event: "click",
    params: { link_url, link_text, outbound: true, location, ...(platform ? { platform } : {}) },
  };
}

export function trackSearchOpen(params: SearchOpenParams): void {
  void params;
  trackEvent("search_open");
}

/**
 * On-site search → Vercel `site_search` only (bucket props; never raw query text).
 * GSC does not cover this signal.
 */
export function trackSearchQuery(params: SearchQueryParams): void {
  trackVercelEvent("site_search", {
    surface: params.surface,
    has_results: params.has_results,
    result_count_bucket: params.result_count_bucket,
    query_length_bucket: params.query_length_bucket,
  });
}

export function trackSearchSelect(params: SearchSelectParams): void {
  void params;
  trackEvent("search_select");
}

export function trackSearchRefine(params: SearchRefineParams): void {
  void params;
  trackEvent("search_refine");
}

export function trackSearchNoResults(params: SearchNoResultsParams): void {
  void params;
  trackEvent("search_no_results");
}

export function trackSearchExpand(): void {
  trackEvent("search_expand");
}

export function trackQuestionSectionView(params: { location: "home" | "start" | "index" }): void {
  void params;
  trackEvent("question_section_view");
}

export function trackQuestionSelect(params: { question_id: string; location: string }): void {
  void params;
  trackEvent("question_select");
}

export function trackQuestionPathStart(params: { question_id: string }): void {
  void params;
  trackEvent("question_path_start");
}

export function trackQuestionStopOpen(params: {
  question_id: string;
  stop_position: number;
  entity_type: string;
}): void {
  void params;
  trackEvent("question_stop_open");
}

export function trackQuestionRelatedSelect(params: { from_id: string; to_id: string }): void {
  void params;
  trackEvent("question_related_select");
}

export function trackQuestionContinueBook(params: { question_id: string; book_id: string }): void {
  void params;
  trackEvent("question_continue_book");
}

export function trackQuestionSearchHandoff(params: { question_id: string }): void {
  void params;
  trackEvent("question_search_handoff");
}

export function trackTrailIndexView(params: { location: "home" | "start" | "index" }): void {
  void params;
  trackEvent("trail_index_view");
}

export function trackTrailSelect(params: { trail_id: string; location: string }): void {
  void params;
  trackEvent("trail_select");
}

export function trackTrailPathStart(params: { trail_id: string }): void {
  void params;
  trackEvent("trail_path_start");
}

export function trackTrailStopOpen(params: {
  trail_id: string;
  stop_position: number;
  entity_type: string;
  optional: boolean;
}): void {
  void params;
  trackEvent("trail_stop_open");
}

export function trackTrailRelatedSelect(params: { from_id: string; to_id: string }): void {
  void params;
  trackEvent("trail_related_select");
}

export function trackTrailContinueBook(params: { trail_id: string; book_id: string }): void {
  void params;
  trackEvent("trail_continue_book");
}

export function trackTrailSearchHandoff(params: { trail_id: string }): void {
  void params;
  trackEvent("trail_search_handoff");
}
