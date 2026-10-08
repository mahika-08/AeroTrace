from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
import json
from datetime import datetime, timezone

from sqlalchemy import func

from app.database import AttributionRun
from app.services.attribution import rank_facilities
from app.database import (
    Facility,
    Measurement,
    PollutionEvent,
    Pollutant,
    Sensor,
    WeatherObservation,
    create_tables,
    get_db,
    to_utc_iso,
)
from app.seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure a fresh checkout can start without manual DB setup.
    create_tables()
    seed_demo_data()
    yield


app = FastAPI(
    title="AeroTrace API",
    description="Pollution event investigation and source attribution API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def paginate(items, total, limit, offset):
    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


def check_page(limit: int, offset: int):
    if limit < 1 or limit > 100 or offset < 0:
        raise HTTPException(
            status_code=400,
            detail="limit must be 1-100 and offset must be >= 0",
        )


@app.get("/api/v1/health")
def health_check():
    return {"application": "AeroTrace", "status": "UP"}


@app.get("/api/v1/dashboard")
def dashboard(db: Session = Depends(get_db)):
    sensors = db.scalars(select(Sensor)).all()
    facilities = db.scalars(select(Facility)).all()
    events = db.scalars(
        select(PollutionEvent).order_by(PollutionEvent.started_at.desc())
    ).all()

    recent = []
    for event in events[:5]:
        pollutant = db.get(Pollutant, event.pollutant_id)
        recent.append({
            "id": event.id,
            "pollutant": pollutant.name if pollutant else None,
            "severity": event.severity,
            "status": event.status,
            "peak_value": event.peak_value,
            "unit": pollutant.unit if pollutant else None,
            "started_at": to_utc_iso(event.started_at),
        })

    return {
        "total_events": len(events),
        "open_events": sum(e.status == "OPEN" for e in events),
        "analyzed_events": sum(e.status == "ANALYZED" for e in events),
        "sensors_online": sum(s.active for s in sensors),
        "facilities_tracked": len(facilities),
        "recent_events": recent,
    }


@app.get("/api/v1/sensors")
def list_sensors(
    active: bool | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = select(Sensor)
    count_query = select(Sensor)

    if active is not None:
        query = query.where(Sensor.active == active)
        count_query = count_query.where(Sensor.active == active)

    total = len(db.scalars(count_query).all())
    rows = db.scalars(
        query.order_by(Sensor.id).offset(offset).limit(limit)
    ).all()

    items = [{
        "id": s.id,
        "name": s.name,
        "latitude": s.latitude,
        "longitude": s.longitude,
        "active": s.active,
        "last_seen_at": to_utc_iso(s.last_seen_at),
    } for s in rows]

    return paginate(items, total, limit, offset)


@app.get("/api/v1/measurements")
def list_measurements(
    sensor_id: int | None = None,
    pollutant: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = (
        select(Measurement, Pollutant)
        .join(Pollutant, Measurement.pollutant_id == Pollutant.id)
    )

    if sensor_id is not None:
        query = query.where(Measurement.sensor_id == sensor_id)
    if pollutant is not None:
        query = query.where(Pollutant.code == pollutant.upper())

    all_rows = db.execute(query.order_by(Measurement.measured_at.desc())).all()
    total = len(all_rows)
    rows = all_rows[offset:offset + limit]

    items = [{
        "id": m.id,
        "sensor_id": m.sensor_id,
        "pollutant": p.name,
        "value": m.value,
        "unit": p.unit,
        "measured_at": to_utc_iso(m.measured_at),
    } for m, p in rows]

    return paginate(items, total, limit, offset)


@app.get("/api/v1/facilities")
def list_facilities(
    type: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = select(Facility)
    if type:
        query = query.where(Facility.type == type.upper())

    all_rows = db.scalars(query.order_by(Facility.id)).all()
    total = len(all_rows)
    rows = all_rows[offset:offset + limit]

    items = [{
        "id": f.id,
        "name": f.name,
        "type": f.type,
        "latitude": f.latitude,
        "longitude": f.longitude,
        "emission_categories": [
            item for item in f.emission_categories.split(",") if item
        ],
    } for f in rows]

    return paginate(items, total, limit, offset)


@app.get("/api/v1/weather")
def list_weather(
    sensor_id: int | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = select(WeatherObservation)
    if sensor_id is not None:
        query = query.where(WeatherObservation.sensor_id == sensor_id)

    all_rows = db.scalars(
        query.order_by(WeatherObservation.observed_at.desc())
    ).all()
    total = len(all_rows)
    rows = all_rows[offset:offset + limit]

    items = [{
        "id": w.id,
        "sensor_id": w.sensor_id,
        "observed_at": to_utc_iso(w.observed_at),
        "wind_speed_mps": w.wind_speed_mps,
        "wind_direction_deg": w.wind_direction_deg,
        "temperature_c": w.temperature_c,
        "humidity_percent": w.humidity_percent,
    } for w in rows]

    return paginate(items, total, limit, offset)


def event_to_dict(event: PollutionEvent, db: Session):
    pollutant = db.get(Pollutant, event.pollutant_id)
    sensor = db.get(Sensor, event.sensor_id)

    return {
        "id": event.id,
        "sensor_id": event.sensor_id,
        "pollutant": pollutant.name if pollutant else None,
        "severity": event.severity,
        "status": event.status,
        "started_at": to_utc_iso(event.started_at),
        "ended_at": to_utc_iso(event.ended_at),
        "peak_value": event.peak_value,
        "baseline_value": event.baseline_value,
        "unit": pollutant.unit if pollutant else None,
        "latitude": sensor.latitude if sensor else None,
        "longitude": sensor.longitude if sensor else None,
    }


@app.get("/api/v1/events")
def list_events(
    status: str | None = None,
    severity: str | None = None,
    pollutant: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = (
        select(PollutionEvent)
        .join(Pollutant, PollutionEvent.pollutant_id == Pollutant.id)
    )

    if status:
        query = query.where(PollutionEvent.status == status.upper())
    if severity:
        query = query.where(PollutionEvent.severity == severity.upper())
    if pollutant:
        query = query.where(Pollutant.code == pollutant.upper())

    all_rows = db.scalars(
        query.order_by(PollutionEvent.started_at.desc())
    ).all()
    total = len(all_rows)
    rows = all_rows[offset:offset + limit]

    return paginate(
        [event_to_dict(e, db) for e in rows],
        total,
        limit,
        offset,
    )


@app.get("/api/v1/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.get(PollutionEvent, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return event_to_dict(event, db)



def build_attribution(event_id: int, db: Session) -> dict:
    event = db.get(PollutionEvent, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    sensor = db.get(Sensor, event.sensor_id)
    pollutant = db.get(Pollutant, event.pollutant_id)

    if sensor is None or pollutant is None:
        raise HTTPException(
            status_code=500,
            detail="Event is missing its sensor or pollutant record",
        )

    facility_rows = db.scalars(
        select(Facility).order_by(Facility.id)
    ).all()

    facilities = [
        {
            "id": f.id,
            "name": f.name,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "emission_categories": [
                item.strip()
                for item in f.emission_categories.split(",")
                if item.strip()
            ],
        }
        for f in facility_rows
    ]

    weather = db.scalars(
        select(WeatherObservation)
        .where(WeatherObservation.sensor_id == sensor.id)
        .order_by(WeatherObservation.observed_at.desc())
    ).first()

    weather_data = None
    if weather is not None:
        weather_data = {
            "wind_speed_mps": weather.wind_speed_mps,
            "wind_direction_deg": weather.wind_direction_deg,
        }

    event_data = {
        "latitude": sensor.latitude,
        "longitude": sensor.longitude,
        "pollutant": pollutant.name,
    }

    candidates = rank_facilities(event_data, facilities, weather_data)

    measurement_count = db.scalar(
        select(func.count(Measurement.id)).where(
            Measurement.sensor_id == sensor.id,
            Measurement.pollutant_id == pollutant.id,
        )
    ) or 0

    active_sensor_count = db.scalar(
        select(func.count(Sensor.id)).where(Sensor.active.is_(True))
    ) or 0

    # Conservative heuristic: reliability is separate from candidate score.
    confidence = 25
    if weather_data and weather_data["wind_direction_deg"] is not None:
        confidence += 15
    if measurement_count >= 3:
        confidence += 10
    if active_sensor_count >= 3:
        confidence += 15
    if len(candidates) >= 2:
        gap = candidates[0]["score"] - candidates[1]["score"]
        confidence += min(15, max(0, int(gap / 2)))

    confidence = min(confidence, 65) if active_sensor_count < 3 else min(confidence, 85)

    uncertainty = [
        "Attribution scores are heuristic rankings, not probabilities or proof of causation.",
        "Demo readings and facility information are synthetic.",
    ]

    if active_sensor_count < 3:
        uncertainty.append(
            "Limited active sensor coverage prevents reliable spatial triangulation."
        )
    if weather_data is None or weather_data["wind_direction_deg"] is None:
        uncertainty.append("Wind direction is unavailable for this analysis.")
    if not candidates:
        uncertainty.append("No candidate facilities were available to rank.")

    if candidates:
        summary = (
            f"{candidates[0]['facility_name']} is the highest-ranked candidate "
            "based on the available heuristic evidence; this is not confirmation "
            "of the pollution source."
        )
    else:
        summary = "No candidate facilities were available for this event."

    return {
        "event_id": event.id,
        "confidence": confidence,
        "summary": summary,
        "uncertainty": uncertainty,
        "candidates": candidates,
    }


def latest_attribution(event_id: int, db: Session) -> dict:
    event = db.get(PollutionEvent, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    run = db.scalars(
        select(AttributionRun)
        .where(AttributionRun.event_id == event_id)
        .order_by(AttributionRun.analyzed_at.desc(), AttributionRun.id.desc())
    ).first()

    if run is None:
        raise HTTPException(
            status_code=404,
            detail="This event has not been analyzed yet",
        )

    return {
        "event_id": run.event_id,
        "analysis_id": run.id,
        "confidence": run.confidence,
        "summary": run.summary,
        "uncertainty": json.loads(run.uncertainty_json),
        "candidates": json.loads(run.candidates_json),
        "analyzed_at": to_utc_iso(run.analyzed_at),
    }


@app.post("/api/v1/events/{event_id}/analyze")
def analyze_event(event_id: int, db: Session = Depends(get_db)):
    result = build_attribution(event_id, db)
    analyzed_at = datetime.now(timezone.utc)

    run = AttributionRun(
        event_id=event_id,
        analyzed_at=analyzed_at,
        confidence=result["confidence"],
        summary=result["summary"],
        uncertainty_json=json.dumps(result["uncertainty"]),
        candidates_json=json.dumps(result["candidates"]),
    )
    db.add(run)

    event = db.get(PollutionEvent, event_id)
    event.status = "ANALYZED"
    db.commit()
    db.refresh(run)

    return {
        **result,
        "analysis_id": run.id,
        "status": "ANALYZED",
        "analyzed_at": to_utc_iso(run.analyzed_at),
        "candidate_count": len(result["candidates"]),
        "top_candidate_id": (
            result["candidates"][0]["facility_id"]
            if result["candidates"]
            else None
        ),
    }


@app.get("/api/v1/events/{event_id}/attribution")
def get_attribution(event_id: int, db: Session = Depends(get_db)):
    return latest_attribution(event_id, db)