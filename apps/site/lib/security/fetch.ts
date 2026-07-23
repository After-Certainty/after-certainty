/** Default timeout for server-side outbound fetches (Beehiiv, manifests, RSS). */
export const OUTBOUND_FETCH_TIMEOUT_MS = 10_000;

export function outboundFetchSignal(timeoutMs: number = OUTBOUND_FETCH_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}
