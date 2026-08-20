# GA4 report payloads

Property is resolved at runtime:

- **PADE path:** `$GA_PROPERTY_ID` from broker Material (verify with `ga4-property-meta.sh`)
- **MCP fallback:** `properties/430022966` (measurement ID on site: `G-H7FSEF4WLW`)

---

## PADE path (primary — Cloud Agent)

Invoke via `pade exec` and repo scripts. JSON uses GA4 Data API **REST** format (camelCase). Property ID is **not** in the body — scripts use `$GA_PROPERTY_ID`.

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-run-report.sh '<json-body>'
```

Realtime reports use `ga4-run-realtime-report.sh` instead.

### 1. Overview + week-over-week

```json
{
  "dateRanges": [
    { "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" },
    { "startDate": "14daysAgo", "endDate": "8daysAgo", "name": "Prior7Days" }
  ],
  "dimensions": [],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" },
    { "name": "totalUsers" },
    { "name": "newUsers" },
    { "name": "screenPageViews" },
    { "name": "engagedSessions" },
    { "name": "engagementRate" },
    { "name": "averageSessionDuration" },
    { "name": "eventCount" }
  ]
}
```

Rows include `dateRange` = `Last7Days` / `Prior7Days` when both ranges have data.

### 2. Daily trend

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "date" }],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" },
    { "name": "screenPageViews" }
  ],
  "orderBys": [{ "dimension": { "dimensionName": "date", "orderType": "ALPHANUMERIC" }, "desc": false }]
}
```

Format `YYYYMMDD` dates as `YYYY-MM-DD` in the output table.

### 3. Channels

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "sessionDefaultChannelGroup" }],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" },
    { "name": "engagedSessions" }
  ],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 10
}
```

### 4. Top pages

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "pagePath" }],
  "metrics": [
    { "name": "screenPageViews" },
    { "name": "activeUsers" }
  ],
  "orderBys": [{ "metric": { "metricName": "screenPageViews" }, "desc": true }],
  "limit": 30
}
```

### 5. Events

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "eventName" }],
  "metrics": [{ "name": "eventCount" }],
  "orderBys": [{ "metric": { "metricName": "eventCount" }, "desc": true }],
  "limit": 25
}
```

### 6. Devices

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "deviceCategory" }],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" }
  ],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }]
}
```

### 7. Geography

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "country" }],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" }
  ],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 10
}
```

### 8. Realtime

Use `ga4-run-realtime-report.sh`:

```json
{
  "dimensions": [],
  "metrics": [
    { "name": "activeUsers" },
    { "name": "eventCount" }
  ]
}
```

Optional top screens:

```json
{
  "dimensions": [{ "name": "unifiedScreenName" }],
  "metrics": [{ "name": "activeUsers" }],
  "orderBys": [{ "metric": { "metricName": "activeUsers" }, "desc": true }],
  "limit": 10
}
```

### 9. Device OS (you vs not you)

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [
    { "name": "deviceCategory" },
    { "name": "operatingSystem" }
  ],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" }
  ],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 25
}
```

### 10. Mobile device models (you vs not you)

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [
    { "name": "deviceCategory" },
    { "name": "mobileDeviceBranding" },
    { "name": "mobileDeviceModel" }
  ],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" }
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "deviceCategory",
      "stringFilter": { "matchType": "EXACT", "value": "mobile", "caseSensitive": true }
    }
  },
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 20
}
```

### 11. Session source / medium (you vs not you)

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "sessionSourceMedium" }],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" }
  ],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 15
}
```

### 12. Site custom events

`eventName` inList of shipped `AnalyticsEvents`. GA4 allows at most 50 `inListFilter` values, so the body uses `orGroup` of two lists. **Canonical payload** (keep in sync with `SITE_CUSTOM_EVENTS`):

```bash
python3 tools/ga_trends_brief.py --report-body 12
```

Shape:

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "eventName" }],
  "metrics": [{ "name": "eventCount" }, { "name": "activeUsers" }],
  "dimensionFilter": {
    "orGroup": {
      "expressions": [
        {
          "filter": {
            "fieldName": "eventName",
            "inListFilter": { "values": ["select_content", "file_download", "click"], "caseSensitive": true }
          }
        }
      ]
    }
  },
  "orderBys": [{ "metric": { "metricName": "eventCount" }, "desc": true }],
  "limit": 50
}
```

(`values` in the generated body is the full catalog, split across two expressions.)

### 13. Landing pages

If this 400s, retry with `--report-body 13b` (`landingPagePlusQueryString`).

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "landingPage" }],
  "metrics": [{ "name": "sessions" }, { "name": "activeUsers" }],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 15
}
```

Fallback (`13b`):

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [{ "name": "landingPagePlusQueryString" }],
  "metrics": [{ "name": "sessions" }, { "name": "activeUsers" }],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 15
}
```

### 14. Observatory `select_content` (registered custom dimensions)

Skip if the property 400s (dimension not registered). Canonical: `python3 tools/ga_trends_brief.py --report-body 14`.

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [
    { "name": "customEvent:content_type" },
    { "name": "customEvent:item_id" },
    { "name": "customEvent:method" }
  ],
  "metrics": [{ "name": "eventCount" }, { "name": "activeUsers" }],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "stringFilter": { "matchType": "EXACT", "value": "select_content", "caseSensitive": true }
    }
  },
  "orderBys": [{ "metric": { "metricName": "eventCount" }, "desc": true }],
  "limit": 15
}
```

### 15. Outbound `click` by location / platform

Skip if 400. Canonical: `python3 tools/ga_trends_brief.py --report-body 15`.

```json
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today", "name": "Last7Days" }],
  "dimensions": [
    { "name": "customEvent:location" },
    { "name": "customEvent:platform" }
  ],
  "metrics": [{ "name": "eventCount" }, { "name": "activeUsers" }],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "stringFilter": { "matchType": "EXACT", "value": "click", "caseSensitive": true }
    }
  },
  "orderBys": [{ "metric": { "metricName": "eventCount" }, "desc": true }],
  "limit": 15
}
```

### Optional: 28-day rollup

```json
{
  "dateRanges": [{ "startDate": "28daysAgo", "endDate": "today", "name": "Last28Days" }],
  "dimensions": [],
  "metrics": [
    { "name": "sessions" },
    { "name": "activeUsers" },
    { "name": "screenPageViews" },
    { "name": "eventCount" }
  ]
}
```

### Optional: Explore page filter

Add to any runReport body:

```json
"dimensionFilter": {
  "filter": {
    "fieldName": "pagePath",
    "stringFilter": { "matchType": "CONTAINS", "value": "/explore", "caseSensitive": false }
  }
}
```

### Optional: select_content only

```json
"dimensionFilter": {
  "filter": {
    "fieldName": "eventName",
    "stringFilter": { "matchType": "EXACT", "value": "select_content", "caseSensitive": true }
  }
}
```

---

## MCP fallback (local laptop)

Property: `properties/430022966`

Copy these into `CallMcpTool` with `server: "user-analytics-mcp"`.

### 1. Overview + week-over-week

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
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

### 2. Daily trend

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["date"],
    "metrics": ["sessions", "activeUsers", "screenPageViews"],
    "order_bys": [{ "dimension": { "dimension_name": "date", "order_type": 1 }, "desc": false }]
  }
}
```

Format `YYYYMMDD` dates as `YYYY-MM-DD` in the output table.

### 3. Channels

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["sessionDefaultChannelGroup"],
    "metrics": ["sessions", "activeUsers", "engagedSessions"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 10
  }
}
```

### 4. Top pages

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["pagePath"],
    "metrics": ["screenPageViews", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "screenPageViews" }, "desc": true }],
    "limit": 30
  }
}
```

### 5. Events

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["eventName"],
    "metrics": ["eventCount"],
    "order_bys": [{ "metric": { "metric_name": "eventCount" }, "desc": true }],
    "limit": 25
  }
}
```

### 6. Devices

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["deviceCategory"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }]
  }
}
```

### 7. Geography

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["country"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 10
  }
}
```

### 8. Realtime

```json
{
  "toolName": "run_realtime_report",
  "arguments": {
    "property_id": "properties/430022966",
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
    "property_id": "properties/430022966",
    "dimensions": ["unifiedScreenName"],
    "metrics": ["activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "activeUsers" }, "desc": true }],
    "limit": 10
  }
}
```

### 9. Device OS (you vs not you)

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["deviceCategory", "operatingSystem"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 25
  }
}
```

### 10. Mobile device models (you vs not you)

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["deviceCategory", "mobileDeviceBranding", "mobileDeviceModel"],
    "metrics": ["sessions", "activeUsers"],
    "dimension_filter": {
      "filter": {
        "field_name": "deviceCategory",
        "string_filter": { "match_type": 2, "value": "mobile", "case_sensitive": true }
      }
    },
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 20
  }
}
```

### 11. Session source / medium (you vs not you)

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["sessionSourceMedium"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 15
  }
}
```

### 12. Site custom events

Canonical filter from `python3 tools/ga_trends_brief.py --report-body 12` (convert keys to MCP snake_case) or use `mcp_event_name_filter()` in `tools/ga_trends_brief.py`.

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["eventName"],
    "metrics": ["eventCount", "activeUsers"],
    "dimension_filter": {
      "or_group": {
        "expressions": [
          {
            "filter": {
              "field_name": "eventName",
              "in_list_filter": {
                "values": ["select_content", "file_download", "click"],
                "case_sensitive": true
              }
            }
          }
        ]
      }
    },
    "order_bys": [{ "metric": { "metric_name": "eventCount" }, "desc": true }],
    "limit": 50
  }
}
```

Replace `values` with the full `SITE_CUSTOM_EVENTS` catalog (split across two `in_list_filter` expressions; max 50 values each).

### 13. Landing pages

If `landingPage` 400s, retry with `landingPagePlusQueryString`.

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["landingPage"],
    "metrics": ["sessions", "activeUsers"],
    "order_bys": [{ "metric": { "metric_name": "sessions" }, "desc": true }],
    "limit": 15
  }
}
```

### 14. Observatory `select_content`

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["customEvent:content_type", "customEvent:item_id", "customEvent:method"],
    "metrics": ["eventCount", "activeUsers"],
    "dimension_filter": {
      "filter": {
        "field_name": "eventName",
        "string_filter": { "match_type": 2, "value": "select_content", "case_sensitive": true }
      }
    },
    "order_bys": [{ "metric": { "metric_name": "eventCount" }, "desc": true }],
    "limit": 15
  }
}
```

### 15. Outbound `click` by location / platform

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "7daysAgo", "end_date": "today", "name": "Last7Days" }],
    "dimensions": ["customEvent:location", "customEvent:platform"],
    "metrics": ["eventCount", "activeUsers"],
    "dimension_filter": {
      "filter": {
        "field_name": "eventName",
        "string_filter": { "match_type": 2, "value": "click", "case_sensitive": true }
      }
    },
    "order_bys": [{ "metric": { "metric_name": "eventCount" }, "desc": true }],
    "limit": 15
  }
}
```

### Optional: 28-day rollup

```json
{
  "toolName": "run_report",
  "arguments": {
    "property_id": "properties/430022966",
    "date_ranges": [{ "start_date": "28daysAgo", "end_date": "today", "name": "Last28Days" }],
    "dimensions": [],
    "metrics": ["sessions", "activeUsers", "screenPageViews", "eventCount"]
  }
}
```

### Optional: Explore page filter

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

### Optional: select_content only

```json
{
  "filter": {
    "field_name": "eventName",
    "string_filter": { "match_type": 2, "value": "select_content", "case_sensitive": true }
  }
}
```

---

## Alternate ranges

| User asks | `dateRanges` / `date_ranges` |
|-----------|------------------------------|
| Last 30 days | `30daysAgo` → `today` |
| Yesterday only | `yesterday` → `yesterday` |
| This month | `YYYY-MM-01` → `today` |
| Custom | ISO dates with `name` label |
