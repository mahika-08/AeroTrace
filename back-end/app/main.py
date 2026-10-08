
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

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