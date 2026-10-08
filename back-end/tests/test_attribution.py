
from app.services.attribution import (
    calculate_distance_km,
    calculate_pollutant_match_score,
    calculate_wind_alignment_score,
    rank_facilities,
)


def test_distance_is_zero_for_same_coordinates():
    assert calculate_distance_km(22.7, 75.8, 22.7, 75.8) == 0


def test_distance_score_falls_as_distance_increases():
    from app.services.attribution import calculate_distance_score

    assert calculate_distance_score(1) > calculate_distance_score(10)


def test_missing_wind_returns_neutral_score():
    assert calculate_wind_alignment_score(90, None, None) == 50.0


def test_pollutant_alias_matches_pm25():
    assert calculate_pollutant_match_score("PM2.5", ["PM25", "PM10"]) == 100.0


def test_pollutant_mismatch_scores_zero():
    assert calculate_pollutant_match_score("NO2", ["PM10"]) == 0.0


def test_facilities_are_ranked_highest_first():
    event = {
        "latitude": 22.7196,
        "longitude": 75.8577,
        "pollutant": "PM2.5",
    }
    facilities = [
        {
            "id": 2,
            "name": "Far compatible facility",
            "latitude": 22.80,
            "longitude": 75.90,
            "emission_categories": ["PM2.5"],
        },
        {
            "id": 1,
            "name": "Nearby compatible facility",
            "latitude": 22.7200,
            "longitude": 75.8580,
            "emission_categories": ["PM2.5"],
        },
    ]

    results = rank_facilities(event, facilities)

    assert len(results) == 2
    assert results[0]["score"] >= results[1]["score"]
    assert results[0]["rank"] == 1
    assert results[1]["rank"] == 2


def test_empty_facilities_returns_empty_list():
    assert rank_facilities(
        {"latitude": 22.7, "longitude": 75.8, "pollutant": "PM2.5"},
        [],
    ) == []