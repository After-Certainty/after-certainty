# GA4 MCP report payloads

Property: `properties/497528828`

Copy these into `CallMcpTool` with `server: "user-analytics-mcp"`.

## 1. Overview + week-over-week

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [
      { "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" },
      { "start_date": "14daysAgo", "end_date": "8daysAgo", "name": "Prior7Days" }
    ],
    "dimensions": [],
    "metrics": [
      "sessions",
      "activeUsers",
      "totalUsers",
      "newUsers",
      "screenPageViews",
      "engagedSessions",
      "engagementRate",
      "averageSessionDuration",
      "eventCount"
    ]
  }
}
```

Rows include `dateRange` = `Last7Days` / `Prior7Days` when both ranges have data.

## 2. Daily trend

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["date"],
    "metrics": ["sessions", "activeUsers", "screenPageViews"],
    "order_bys": [{ "dimension": { "dimension_name": "date", "order_type": 1 }, "desc": false }]
  }
}
```

Format `YYYYMMDD` dates as `YYYY-MM-DD` in the output table.

## 3. Channels

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["sessionDefaultChannelGroup"],
    "metrics": ["sessions", "activeUsers", "engagedSessions"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 10
  }
}
```

## 4. Top pages

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["pagePath"],
    "metrics": ["screenPageViews", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "screenPageViews" }, "desc": true }],
    "limit": 15
  }
}
```

## 5. Events

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["eventName"],
    "metrics": ["eventCount"],
    "order_bys": [{ "metric": { "metric_name": "eventCount" }, "desc": true }],
    "limit": 25
  }
}
```

## 6. Devices

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["deviceCategory"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }]
  }
}
```

## 7. Geography

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["country"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 10
  }
}
```

## 8. Realtime

```json
{
  "toolName": "run_realtime_report",
  "arguments": {
    "property_id": "properties/497528828",
    "dimensions": [],
    "metrics": ["activeUsers", "eventCount"]
  }
}
```

Optional top screens:

```json
{
  "toolName": "run_realtime_report",
  "arguments": {
    "property_id": "properties/497528828",
    "dimensions": ["unifiedScreenName"],
    "metrics": ["activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "activeUsers" }, "desc": true }],
    "limit": 10
  }
}
```

## Optional: 28-day rollup

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/497528828",
    "date_ranges": [{ "start_date": "28daysAgo", "end_date": "today", "name": "Last28Days" }],
    "dimensions": [],
    "metrics": ["sessions", "activeUsers", "screenPageViews", "eventCount"]
  }
}
```

## Optional: Explore page filter

Filter pages under `/explore` using `dimension_filter`:

```json
{
  "filter": {
    "field_name": "pagePath",
    "string_filter": { "match_type": 6, "value": "/explore", "case_sensitive": false }
  }
}
```

(`match_type` 6 = CONTAINS in the Data API enum.)

## Optional: select_content only

```json
{
  "filter": {
    "field_name": "eventName",
    "string_filter": { "match_type": 2, "value": "select_content", "case_sensitive": true }
  }
}
```

## Alternate ranges

| User asks | `date_ranges` |
|-----------|----------------|
| Last 30 days | `30daysAgo` → `today` |
| Yesterday only | `yesterday` → `yesterday` |
| This month | `YYYY-MM-01` → `today` |
| Custom | ISO dates with `name` label |
