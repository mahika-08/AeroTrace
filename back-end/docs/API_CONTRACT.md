# AeroTrace API Contract — v1

## 1. Base conventions

- Base URL (local): `http://127.0.0.1:8000`
- API prefix: `/api/v1`
- Interactive API docs: `/docs`
- JSON request/response bodies.
- IDs are integers.
- Timestamps are ISO 8601 UTC strings, e.g. `2026-10-09T04:30:00Z`.
- Latitude and longitude are separate numeric fields. When returning GeoJSON, coordinate order must be `[longitude, latitude]`.
- Concentration unit: `µg/m³`.
- Wind speed: `m/s`.
- Wind direction: degrees clockwise from north, indicating the direction the wind comes **from**.
- Distance: kilometres.
- List endpoints use pagination:
  ```json
  {
    "items": [],
    "total": 0,
    "limit": 20,
    "offset": 0
  }
  ```
- `limit` defaults to 20 and must be 1–100. `offset` defaults to 0 and must be non-negative.

## 2. Error conventions

**Current implementation note:** FastAPI's default errors currently look like `{"detail":"Event not found"}`. A consistent error envelope is recommended, but is not yet implemented:
```json
{
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  }
}
```

Expected status codes:
- `200` successful GET/action
- `400` invalid query values (where explicitly handled)
- `404` resource not found
- `422` FastAPI request validation error (default unless customized)
- `500` unexpected server error

Frontend should not assume the custom error envelope until the backend implements it. For now, handle both `detail` and `error.message`.

## 3. Endpoints

Status labels:
- **Implemented**: present in the current `main.py` described by this contract; verify against your branch.
- **Planned**: reserved for the attribution/investigation phases.

| Method | Path | Purpose | Status |
|---|---|---|---|
| GET | `/health` | Health check | Implemented |
| GET | `/dashboard` | Summary cards and recent events | Implemented |
| GET | `/sensors` | Sensor list | Implemented |
| GET | `/measurements` | Measurement history | Implemented |
| GET | `/facilities` | Potential source facilities | Implemented |
| GET | `/weather` | Weather observations | Implemented |
| GET | `/events` | Filterable event list | Implemented |
| GET | `/events/{event_id}` | Event detail | Implemented |
| POST | `/events/{event_id}/analyze` | Run attribution analysis | Planned |
| GET | `/events/{event_id}/attribution` | Ranked source candidates and summary | Planned |
| GET | `/events/{event_id}/trajectory` | Simplified plume/trajectory points | Planned |
| GET | `/events/{event_id}/evidence` | Evidence items supporting the analysis | Planned |
| GET | `/events/{event_id}/report` | Structured report payload | Planned |

Append each path above to `/api/v1`, except the health path is also under `/api/v1`, e.g. `/api/v1/events`.

## 4. Implemented endpoint details

### `GET /api/v1/health`
Example:
```json
{"application":"AeroTrace","status":"UP"}
```

### `GET /api/v1/dashboard`
Returns:
```json
{
  "total_events": 1,
  "open_events": 1,
  "analyzed_events": 0,
  "sensors_online": 1,
  "facilities_tracked": 3,
  "recent_events": [
    {
      "id": 1,
      "pollutant": "PM2.5",
      "severity": "HIGH",
      "status": "OPEN",
      "peak_value": 185.4,
      "unit": "µg/m³",
      "started_at": "2026-10-09T04:30:00Z"
    }
  ]
}
```
Values above are illustrative; timestamps and IDs depend on the local seed database.

### `GET /api/v1/sensors`
Query: `active=true|false`, `limit`, `offset`.

Item shape:
```json
{
  "id": 1,
  "name": "Aero-01",
  "latitude": 22.7196,
  "longitude": 75.8577,
  "active": true,
  "last_seen_at": null
}
```

### `GET /api/v1/measurements`
Query: `sensor_id`, `pollutant` (pollutant code such as `PM25`, `PM10`, `NO2`), `limit`, `offset`.

Item shape:
```json
{
  "id": 1,
  "sensor_id": 1,
  "pollutant": "PM2.5",
  "value": 92.0,
  "unit": "µg/m³",
  "measured_at": "2026-10-09T04:30:00Z"
}
```

### `GET /api/v1/facilities`
Query: `type`, `limit`, `offset`.

Item shape:
```json
{
  "id": 1,
  "name": "Central Industrial Plant",
  "type": "INDUSTRIAL",
  "latitude": 22.735,
  "longitude": 75.82,
  "emission_categories": ["PM2.5", "PM10", "NO2"]
}
```

### `GET /api/v1/weather`
Query: `sensor_id`, `limit`, `offset`.

Item shape:
```json
{
  "id": 1,
  "sensor_id": 1,
  "observed_at": "2026-10-09T04:30:00Z",
  "wind_speed_mps": 3.2,
  "wind_direction_deg": 270.0,
  "temperature_c": 29.1,
  "humidity_percent": 58.0
}
```

### `GET /api/v1/events`
Query: `status`, `severity`, `pollutant` (code such as `PM25`), `limit`, `offset`.

Item shape:
```json
{
  "id": 1,
  "sensor_id": 1,
  "pollutant": "PM2.5",
  "severity": "HIGH",
  "status": "OPEN",
  "started_at": "2026-10-09T04:30:00Z",
  "ended_at": null,
  "peak_value": 185.4,
  "baseline_value": 35.0,
  "unit": "µg/m³",
  "latitude": 22.7196,
  "longitude": 75.8577
}
```

### `GET /api/v1/events/{event_id}`
Returns one event item with the same shape as an event in the list. A missing event currently returns HTTP 404 with FastAPI's default `detail` body.

## 5. Planned investigation endpoint contracts

These are **proposed contracts** for frontend coordination. Implement them consistently when building Phase 3/4.

### `POST /api/v1/events/{event_id}/analyze`
Purpose: run or refresh analysis for the event.

Request (optional body; simplest MVP can accept an empty body):
```json
{
  "force_refresh": false
}
```

Response:
```json
{
  "event_id": 1,
  "status": "ANALYZED",
  "analysis_id": 1,
  "analyzed_at": "2026-10-09T04:45:00Z",
  "candidate_count": 3,
  "top_candidate_id": 1,
  "confidence": 68,
  "summary": "Facility A is the strongest candidate based on proximity, wind alignment, and pollutant compatibility."
}
```

### `GET /api/v1/events/{event_id}/attribution`
Response:
```json
{
  "event_id": 1,
  "analysis_id": 1,
  "confidence": 68,
  "summary": "Facility A is the strongest candidate, but the evidence is not conclusive.",
  "uncertainty": [
    "Only one monitoring sensor is available in this demo dataset.",
    "Wind observations are sparse and the trajectory is simplified."
  ],
  "candidates": [
    {
      "facility_id": 1,
      "facility_name": "Central Industrial Plant",
      "score": 72,
      "rank": 1,
      "distance_km": 1.8,
      "wind_alignment_score": 85,
      "temporal_score": 70,
      "pollutant_match_score": 100,
      "evidence": [
        "Facility reports a compatible pollutant category.",
        "Facility lies in a plausible upwind direction."
      ]
    }
  ]
}
```

### `GET /api/v1/events/{event_id}/trajectory`
Response:
```json
{
  "event_id": 1,
  "method": "SIMPLIFIED_WIND_BACKTRACE",
  "is_simulated": true,
  "points": [
    {"latitude": 22.7196, "longitude": 75.8577, "hours_back": 0},
    {"latitude": 22.7240, "longitude": 75.8350, "hours_back": 1}
  ],
  "limitations": [
    "Illustrative straight-line approximation; not a dispersion model."
  ]
}
```

### `GET /api/v1/events/{event_id}/evidence`
Response:
```json
{
  "event_id": 1,
  "items": [
    {
      "id": 1,
      "type": "WIND_ALIGNMENT",
      "description": "Candidate lies in a plausible upwind direction.",
      "strength": 85,
      "supports_facility_id": 1,
      "timestamp": "2026-10-09T04:45:00Z"
    }
  ]
}
```

### `GET /api/v1/events/{event_id}/report`
Response:
```json
{
  "event_id": 1,
  "generated_at": "2026-10-09T04:45:00Z",
  "title": "Pollution Event Investigation Report",
  "executive_summary": "A high PM2.5 reading was detected. Facility A ranks highest among the demo candidates; this is a lead for investigation, not proof of causation.",
  "event": {},
  "top_candidates": [],
  "evidence": [],
  "uncertainty": [],
  "methodology": "Explainable heuristic ranking using distance, wind, timing, and pollutant compatibility."
}
```

## 6. Filter support and compatibility notes

Currently implemented filters are only those listed under each route. `start_time`/`end_time` filters are **not currently implemented**. The proposed contracts are the integration baseline; if frontend work requires extra filters, agree them in chat and update this file before implementing.

Scores:
- Candidate `score`: relative ranking score, 0–100; **not a probability**.
- Overall `confidence`: reliability of the analysis, 0–100; separate from candidate score.
- Evidence `strength`: strength of one evidence item, 0–100.
- `uncertainty`: explicit limitations and plausible alternatives.
