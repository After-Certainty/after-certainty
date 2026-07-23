import { trackEvent } from "@/lib/analytics/track";

export function trackBooksCatalogView(): void {
  trackEvent("books_catalog_view");
}

export function trackBooksShelfSelect(params: { shelf_id: string }): void {
  trackEvent("books_shelf_select", params);
}

export function trackBooksFilterApply(params: { dimension: string }): void {
  trackEvent("books_filter_apply", params);
}

export function trackBooksFilterRemove(params: { dimension: string }): void {
  trackEvent("books_filter_remove", params);
}

export function trackBooksFiltersReset(): void {
  trackEvent("books_filters_reset");
}

export function trackBooksSortChange(params: { sort: string }): void {
  trackEvent("books_sort_change", params);
}

export function trackBooksSearch(params: { query_length_bucket: string }): void {
  trackEvent("books_search", params);
}

export function trackBooksCardSelect(params: { book_id: string; location: string }): void {
  trackEvent("books_card_select", params);
}

export function trackBooksNoMatch(): void {
  trackEvent("books_no_match");
}

export function trackBooksStartHereSelect(params: { book_id: string }): void {
  trackEvent("books_start_here_select", params);
}
