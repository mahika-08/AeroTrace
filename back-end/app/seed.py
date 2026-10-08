
from datetime import timedelta

from sqlalchemy import func, select

from app.database import (
    Facility,
    Measurement,
    PollutionEvent,
    Pollutant,
    Sensor,
    SessionLocal,
    WeatherObservation,
    create_tables,
    utc_now,
)


def seed_demo_data() -> None:
    create_tables()

    with SessionLocal() as db:
        # Make this safe to run more than once.
        if db.scalar(select(func.count()).select_from(Sensor)):
            print("Demo data already exists; skipping seed.")
            return

        now = utc_now()

        sensor = Sensor(
            name="Aero-01",
            latitude=22.7196,
            longitude=75.8577,
            active=True,
            last_seen_at=now,
        )
        db.add(sensor)

        pollutants = [
            Pollutant(code="PM25", name="PM2.5", unit="µg/m³"),
            Pollutant(code="PM10", name="PM10", unit="µg/m³"),
            Pollutant(code="NO2", name="Nitrogen dioxide", unit="µg/m³"),
        ]
        db.add_all(pollutants)
        db.flush()

        # Example facilities around the monitoring station.
        facilities = [
            Facility(
                name="Central Industrial Plant",
                type="INDUSTRIAL",
                latitude=22.7350,
                longitude=75.8200,
                emission_categories="PM2.5,PM10,NO2",
            ),
            Facility(
                name="North Processing Unit",
                type="PROCESSING",
                latitude=22.7500,
                longitude=75.8500,
                emission_categories="PM2.5,PM10",
            ),
            Facility(
                name="West Manufacturing Facility",
                type="MANUFACTURING",
                latitude=22.7100,
                longitude=75.8000,
                emission_categories="PM2.5,NO2",
            ),
        ]
        db.add_all(facilities)
        db.flush()

        pm25 = next(p for p in pollutants if p.code == "PM25")

        # A small historical series followed by a pollution spike.
        readings = [
            (now - timedelta(hours=3), 32.0),
            (now - timedelta(hours=2), 35.0),
            (now - timedelta(hours=1), 41.0),
            (now - timedelta(minutes=30), 92.0),
            (now, 185.4),
        ]

        for measured_at, value in readings:
            db.add(
                Measurement(
                    sensor_id=sensor.id,
                    pollutant_id=pm25.id,
                    measured_at=measured_at,
                    value=value,
                )
            )

        db.add(
            WeatherObservation(
                sensor_id=sensor.id,
                observed_at=now,
                wind_speed_mps=3.2,
                wind_direction_deg=270.0,
                temperature_c=29.1,
                humidity_percent=58.0,
            )
        )

        db.add(
            PollutionEvent(
                sensor_id=sensor.id,
                pollutant_id=pm25.id,
                severity="HIGH",
                status="OPEN",
                started_at=now - timedelta(minutes=30),
                ended_at=None,
                peak_value=185.4,
                baseline_value=35.0,
            )
        )

        db.commit()
        print("AeroTrace demo data seeded successfully.")


if __name__ == "__main__":
    seed_demo_data()