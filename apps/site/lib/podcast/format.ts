/** Display date for episode lists — expects `YYYY-MM-DD` from normalization */
export function formatEpisodeDisplayDate(isoDate: string): string {
  if (!isoDate?.trim()) return "";
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return isoDate;
  }
}
