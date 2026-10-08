# AeroTrace Data Model

## Core entities

### Sensor
Represents a monitoring station/sensor.
- `id`: integer primary key
- `name`: display name
- `latitude`, `longitude`: WGS84 coordinates
- `active`: whether the sensor is considered online/active
- `last_seen_at`: last reported timestamp, nullable

### Pollutant
- `id`: integer primary key
- `code`: stable identifier such as `PM25`, `PM10`, `NO2`
- `name`: display label such as `PM2.5`
- `unit`: normally `µg/m³`

### Measurement
One pollutant reading at one sensor and timestamp.
- `id`
- `sensor_id` → Sensor
- `pollutant_id` → Pollutant
- `value`
- `measured_at`

### WeatherObservation
Weather observation associated with a sensor/location and timestamp.
- `id`
- `sensor_id` → Sensor
- `observed_at`
- `wind_speed_mps`
- `wind_direction_deg`
- `temperature_c`
- `humidity_percent`

### Facility
Potential source location for investigation; presence in the database does not imply wrongdoing.
- `id`
- `name`
- `type`
- `latitude`, `longitude`
- `emission_categories`: currently stored as a comma-separated string in SQLite and returned by the API as an array

### PollutionEvent
A detected abnormal reading/event.
- `id`
- `sensor_id` → Sensor
- `pollutant_id` → Pollutant
- `severity`: e.g. `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `status`: e.g. `OPEN`, `ANALYZED`, `CLOSED`
- `started_at`, nullable `ended_at`
- `peak_value`
- `baseline_value`

## Planned investigation records
These may initially be represented as response objects/computed results before persistence is added:
- Attribution result: analysis metadata, overall confidence, summary, uncertainty, ranked facility candidates.
- Evidence item: evidence type, description, strength, related facility and timestamp.
- Trajectory: method, generated points, simulation flag, limitations.
- Report: event summary, top candidates, evidence, uncertainty, methodology, generated timestamp.

## Relationship overview
- One Sensor has many Measurements, WeatherObservations, and PollutionEvents.
- One Pollutant has many Measurements and PollutionEvents.
- Facilities are candidate source locations; attribution connects them to an event through ranked analysis results.
- A single event may have many candidate facilities and evidence items.

## Storage and coordinate caveats
- The hackathon backend uses SQLite; it does not provide PostGIS spatial queries.
- Do geodesic distance and bearing calculations in Python.
- GeoJSON positions use `[longitude, latitude]`, while normal API fields are named `latitude` and `longitude`.
- SQLite timestamp timezone behavior can vary by driver. Normalize output to UTC ISO 8601 strings in API serializers.
