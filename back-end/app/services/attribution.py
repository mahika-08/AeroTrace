
from math import atan2, cos, exp, radians, sin, sqrt
from typing import Any


def calculate_distance_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Calculate great-circle distance using the Haversine formula."""
    earth_radius_km = 6371.0

    lat1_r, lat2_r = radians(lat1), radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    a = (
        sin(delta_lat / 2) ** 2
        + cos(lat1_r) * cos(lat2_r) * sin(delta_lon / 2) ** 2
    )
    a = max(0.0, min(1.0, a))
    return 2 * earth_radius_km * atan2(sqrt(a), sqrt(1 - a))


def calculate_bearing_deg(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Bearing clockwise from north, from point 1 to point 2."""
    lat1_r, lat2_r = radians(lat1), radians(lat2)
    delta_lon = radians(lon2 - lon1)

    y = sin(delta_lon) * cos(lat2_r)
    x = (
        cos(lat1_r) * sin(lat2_r)
        - sin(lat1_r) * cos(lat2_r) * cos(delta_lon)
    )
    return (atan2(y, x) * 180 / 3.141592653589793 + 360) % 360


def calculate_distance_score(distance_km: float) -> float:
    """Closer facilities score higher; this is a heuristic."""
    return round(100 * exp(-max(0.0, distance_km) / 5.0), 2)


def calculate_wind_alignment_score(
    facility_to_sensor_bearing_deg: float,
    wind_direction_deg: float | None,
    wind_speed_mps: float | None,
) -> float:
    """
    Wind direction means where wind comes FROM.
    Convert to the direction it travels toward before comparing bearings.
    """
    if wind_direction_deg is None or wind_speed_mps is None:
        return 50.0  # Unknown, not evidence for or against a facility.

    if wind_speed_mps < 0.5:
        return 50.0  # Very light wind makes direction less informative.

    wind_travel_direction = (wind_direction_deg + 180) % 360
    difference = abs(
        (facility_to_sensor_bearing_deg - wind_travel_direction + 180)
        % 360 - 180
    )

    # 100 for aligned, declining toward 0 for opposite direction.
    return round(100 * (1 + cos(radians(difference))) / 2, 2)


def calculate_pollutant_match_score(
    event_pollutant: str,
    emission_categories: list[str] | None,
) -> float:
    if not emission_categories:
        return 50.0  # Unknown metadata, not a definite mismatch.

    normalized_event = event_pollutant.strip().upper().replace(" ", "")
    normalized_categories = {
        category.strip().upper().replace(" ", "")
        for category in emission_categories
    }

    aliases = {
        "PM25": {"PM25", "PM2.5"},
        "PM2.5": {"PM25", "PM2.5"},
        "PM10": {"PM10"},
        "NO2": {"NO2"},
    }
    accepted = aliases.get(normalized_event, {normalized_event})

    return 100.0 if accepted & normalized_categories else 0.0


def rank_facilities(
    event: dict[str, Any],
    facilities: list[dict[str, Any]],
    weather: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Rank facilities using transparent heuristic component scores."""
    weather = weather or {}
    results = []

    for facility in facilities:
        distance = calculate_distance_km(
            event["latitude"],
            event["longitude"],
            facility["latitude"],
            facility["longitude"],
        )

        bearing = calculate_bearing_deg(
            facility["latitude"],
            facility["longitude"],
            event["latitude"],
            event["longitude"],
        )

        distance_score = calculate_distance_score(distance)
        wind_score = calculate_wind_alignment_score(
            bearing,
            weather.get("wind_direction_deg"),
            weather.get("wind_speed_mps"),
        )
        pollutant_score = calculate_pollutant_match_score(
            event["pollutant"],
            facility.get("emission_categories"),
        )

        # Initial MVP: timing is neutral until richer time-series logic is added.
        temporal_score = 50.0

        score = (
            0.30 * distance_score
            + 0.35 * wind_score
            + 0.20 * temporal_score
            + 0.15 * pollutant_score
        )

        reasons = []
        if distance < 2:
            reasons.append("Facility is within 2 km of the monitoring sensor.")
        if wind_score > 70:
            reasons.append("Wind direction is consistent with transport toward the sensor.")
        if pollutant_score == 100:
            reasons.append("Facility lists a compatible pollutant category.")
        if not reasons:
            reasons.append("Candidate has limited supporting evidence in the available demo data.")

        results.append({
            "facility_id": facility["id"],
            "facility_name": facility["name"],
            "score": round(score, 2),
            "distance_km": round(distance, 2),
            "wind_alignment_score": round(wind_score, 2),
            "temporal_score": temporal_score,
            "pollutant_match_score": pollutant_score,
            "distance_score": distance_score,
            "evidence": reasons,
        })

    results.sort(key=lambda item: (-item["score"], item["facility_id"]))

    for rank, candidate in enumerate(results, start=1):
        candidate["rank"] = rank

    return results