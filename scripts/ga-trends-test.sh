#!/usr/bin/env bash
# Run the ga-trends standard report pack via PADE broker and print the markdown brief.
#
# Requires: pade v0.1.0 on PATH, pade.yaml, .pade/agent-bindings.yaml, Cloud Agent identity.
# Reports run sequentially with brief pauses to avoid broker identity-mint contention.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v pade >/dev/null 2>&1; then
  if [[ -x "$ROOT/.tools/pade/pade" ]]; then
    export PATH="$ROOT/.tools/pade:$PATH"
  else
    echo "error: pade not found; run bash .cursor/install-pade.sh first" >&2
    exit 1
  fi
fi

OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

PADE_PAUSE="${PADE_PAUSE:-0.75}"

run_report() {
  local id="$1" body="$2" script="apps/site/scripts/ga4-run-report.sh"
  [[ "$id" == "8" || "$id" == "8b" ]] && script="apps/site/scripts/ga4-run-realtime-report.sh"
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability google-analytics.read --quiet -- \
    "$script" "$body" >"$OUT/$id.json" 2>"$OUT/$id.err"; then
    echo "error: report $id failed" >&2
    cat "$OUT/$id.err" >&2
    exit 1
  fi
  sleep "$PADE_PAUSE"
}

echo "==> ga-trends: property meta" >&2
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-property-meta.sh >&2
sleep "$PADE_PAUSE"

echo "==> ga-trends: fetching standard report pack (11 reports)" >&2

run_report 1 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"},{"startDate":"14daysAgo","endDate":"8daysAgo","name":"Prior7Days"}],"dimensions":[],"metrics":[{"name":"sessions"},{"name":"activeUsers"},{"name":"totalUsers"},{"name":"newUsers"},{"name":"screenPageViews"},{"name":"engagedSessions"},{"name":"engagementRate"},{"name":"averageSessionDuration"},{"name":"eventCount"}]}'
run_report 2 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"date"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"},{"name":"screenPageViews"}],"orderBys":[{"dimension":{"dimensionName":"date","orderType":"ALPHANUMERIC"},"desc":false}]}'
run_report 3 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"sessionDefaultChannelGroup"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"},{"name":"engagedSessions"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":10}'
run_report 4 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"pagePath"}],"metrics":[{"name":"screenPageViews"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"screenPageViews"},"desc":true}],"limit":15}'
run_report 5 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"eventName"}],"metrics":[{"name":"eventCount"}],"orderBys":[{"metric":{"metricName":"eventCount"},"desc":true}],"limit":25}'
run_report 6 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"deviceCategory"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}]}'
run_report 7 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"country"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":10}'
run_report 8 '{"dimensions":[],"metrics":[{"name":"activeUsers"},{"name":"eventCount"}]}'
run_report 8b '{"dimensions":[{"name":"unifiedScreenName"}],"metrics":[{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"activeUsers"},"desc":true}],"limit":10}'
run_report 9 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"deviceCategory"},{"name":"operatingSystem"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":25}'
run_report 10 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"deviceCategory"},{"name":"mobileDeviceBranding"},{"name":"mobileDeviceModel"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"dimensionFilter":{"filter":{"fieldName":"deviceCategory","stringFilter":{"matchType":"EXACT","value":"mobile","caseSensitive":true}}},"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":20}'
run_report 11 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"sessionSourceMedium"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":15}'

python3 - "$OUT" <<'PY'
import json
import os
import sys
from datetime import UTC, datetime

out_dir = sys.argv[1]


def load(report_id: str) -> dict:
    with open(os.path.join(out_dir, f"{report_id}.json")) as f:
        return json.load(f)


def rows(data: dict) -> list[dict]:
    dims = [d["name"] for d in data.get("dimensionHeaders", [])]
    metrics = [m["name"] for m in data.get("metricHeaders", [])]
    result = []
    for row in data.get("rows", []):
        dvals = [v.get("value", "") for v in row.get("dimensionValues", [])]
        mvals = [v.get("value", "") for v in row.get("metricValues", [])]
        result.append(dict(zip(dims + metrics, dvals + mvals)))
    return result


def fmt_date(value: str) -> str:
    if len(value) == 8 and value.isdigit():
        return f"{value[:4]}-{value[4:6]}-{value[6:8]}"
    return value


def num(value: str | None) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def pct(part: float, total: float) -> str:
    return f"{100 * part / total:.1f}%" if total else "—"


ov_rows = rows(load("1"))
by_range: dict[str, dict] = {}
for row in ov_rows:
    by_range.setdefault(row.get("dateRange", "Last7Days"), row)

cur = by_range.get("Last7Days", {})
prior = by_range.get("Prior7Days", {})
total_sessions = num(cur.get("sessions"))

os_rows = rows(load("9"))
mobile_rows = rows(load("10"))
src_rows = rows(load("11"))

definite_not_you = sum(
    num(r.get("sessions")) for r in os_rows if r.get("operatingSystem") in ("Android", "Linux", "Windows")
)
mac_ios_pool = sum(num(r.get("sessions")) for r in os_rows if r.get("operatingSystem") in ("Macintosh", "iOS"))
macintosh_sessions = sum(num(r.get("sessions")) for r in os_rows if r.get("operatingSystem") == "Macintosh")
iphone13_you = sum(num(r.get("sessions")) for r in mobile_rows if r.get("mobileDeviceModel") == "iPhone 13")
tooling_you = sum(
    num(r.get("sessions"))
    for r in src_rows
    if r.get("sessionSourceMedium") in ("vercel.com / referral", "tagassistant.google.com / referral")
)
social_referral = sum(num(r.get("sessions")) for r in src_rows if "facebook.com" in r.get("sessionSourceMedium", ""))

you_signals = tooling_you + iphone13_you + round(macintosh_sessions * 0.65)
you_mid = min(mac_ios_pool, you_signals)
not_you_mid = total_sessions - you_mid
not_you_low = definite_not_you
not_you_high = definite_not_you + social_referral

today = datetime.now(UTC).strftime("%Y-%m-%d")

print("# GA trends — After Certainty")
print(f"**Property:** after-certainty (broker GA_PROPERTY_ID) · **Range:** 7daysAgo → today · **Pulled:** {today}")
print()
print("## Headline")

if total_sessions == 0:
    print("No sessions in the last 7 days — property may be low-traffic, consent-gated, or data still processing.")
else:
    cur_s = num(cur.get("sessions"))
    prior_s = num(prior.get("sessions")) if prior else 0
    if prior_s:
        delta = (cur_s - prior_s) / prior_s * 100
        direction = "up" if delta > 5 else "down" if delta < -5 else "flat"
        print(
            f"Traffic is **{direction}** week-over-week ({cur_s:.0f} vs {prior_s:.0f} prior-week sessions, {delta:+.0f}%). Low volume — interpret cautiously."
        )
    else:
        print(f"**{cur_s:.0f} sessions** in the last 7 days. Prior-week comparison unavailable or zero.")

print()
print("## Overview")
print("| Metric | This period | Prior period |")
print("|--------|------------:|-------------:|")
for metric in ["sessions", "activeUsers", "screenPageViews", "engagedSessions", "eventCount"]:
    print(f"| {metric} | {cur.get(metric, '—')} | {prior.get(metric, '—') if prior else '—'} |")

print()
print("## Daily")
print("| Date | Sessions | Users | Page views |")
print("|------|----------:|------:|-----------:|")
for row in rows(load("2")):
    print(
        f"| {fmt_date(row.get('date', ''))} | {row.get('sessions', '0')} | {row.get('activeUsers', '0')} | {row.get('screenPageViews', '0')} |"
    )

print()
print("## Channels")
print("| Channel | Sessions | Users |")
print("|---------|----------:|------:|")
for row in rows(load("3"))[:10]:
    print(f"| {row.get('sessionDefaultChannelGroup', '')} | {row.get('sessions', '0')} | {row.get('activeUsers', '0')} |")

print()
print("## Top pages")
print("| Page | Views | Users |")
print("|------|------:|------:|")
for row in rows(load("4"))[:10]:
    print(f"| `{row.get('pagePath', '')}` | {row.get('screenPageViews', '0')} | {row.get('activeUsers', '0')} |")

print()
print("## Events")
print("| Event | Count |")
print("|-------|------:|")
custom = {"select_content", "file_download", "click", "generate_lead"}
event_rows = rows(load("5"))
for row in event_rows[:15]:
    name = row.get("eventName", "")
    flag = " ⭐" if name in custom else ""
    print(f"| {name}{flag} | {row.get('eventCount', '0')} |")

print()
print("## Estimated you vs not you")
print("Heuristic only (owner devices: Mac + iPhone). Configure internal traffic in GA4 for a definitive split.")
print()
print("| | Sessions | % of total |")
print("|---|----------:|-----------:|")
print(f"| **Definitely not you** (Android / Linux / Windows) | {definite_not_you:.0f} | {pct(definite_not_you, total_sessions)} |")
print(f"| Mac + iOS pool (mixed) | {mac_ios_pool:.0f} | {pct(mac_ios_pool, total_sessions)} |")
print(f"| — Tooling (Vercel, Tag Assistant) | {tooling_you:.0f} | |")
print(f"| — iPhone 13 (model reported) | {iphone13_you:.0f} | |")
print(f"| **Estimated you (middle)** | {you_mid:.0f} | {pct(you_mid, total_sessions)} |")
print(f"| **Estimated not you (middle)** | {not_you_mid:.0f} | {pct(not_you_mid, total_sessions)} |")
print()
print(f"Range: not you **low**–**high** = {not_you_low:.0f} – {not_you_high:.0f}; you the complement.")
print()
print("**Device/OS (top):**")
for row in os_rows[:8]:
    print(f"- {row.get('deviceCategory', '')}/{row.get('operatingSystem', '')}: {row.get('sessions', '0')} sessions")
print()
print("**Top sessionSourceMedium:**")
for row in src_rows[:8]:
    print(f"- {row.get('sessionSourceMedium', '')}: {row.get('sessions', '0')} sessions")

rt = rows(load("8"))
rt_screens = rows(load("8b"))
active = rt[0].get("activeUsers", "0") if rt else "0"

print()
print("## Realtime")
print(f"Active users now: **{active}**")
if rt_screens:
    print()
    print("| Screen | Active users |")
    print("|--------|-------------:|")
    for row in rt_screens[:5]:
        print(f"| {row.get('unifiedScreenName', '(not set)')} | {row.get('activeUsers', '0')} |")

print()
print("## Notes")
custom_seen = [row.get("eventName") for row in event_rows if row.get("eventName") in custom]
if custom_seen:
    print(f"- Custom events observed: {', '.join(custom_seen)}")
else:
    print("- No custom events (`select_content`, `file_download`, `click`, `generate_lead`) in top 25 — likely low traffic or consent denied.")
print("- GA does not label owner traffic without internal-traffic IP filters.")
print("- iPhone model often reports as generic iPhone or (not set) even for owner device.")
PY

echo "ga-trends-test: OK" >&2
