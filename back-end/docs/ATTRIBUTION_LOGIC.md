# Explainable Attribution Logic — MVP

## Objective
Rank plausible source facilities for a pollution event using available synthetic evidence. The result is decision support, not a definitive accusation or scientific dispersion model.

## Inputs
- Event location, pollutant, start time, peak value, baseline.
- Facility coordinates and emission categories.
- Most relevant weather observation near the event time.
- Available measurements before and during the event, where useful.

## Candidate features (0–100 each)
1. **Distance score**: closer facilities receive a higher score. A simple initial mapping is `100 * exp(-distance_km / scale_km)`, with a documented scale such as 5 km. This is a heuristic, not a physical emissions model.
2. **Wind alignment score**: compare the bearing from the facility toward the sensor with the direction the wind travels. Meteorological wind direction is where wind comes from, so convert it to travel direction using `(wind_direction_deg + 180) % 360`. High alignment means the facility is plausibly upwind of the sensor.
3. **Temporal score**: higher when the event period and available readings are consistent with the selected weather observation and candidate hypothesis. With sparse demo data, keep this simple and disclose the limitation.
4. **Pollutant match score**: high if facility emission categories include the event pollutant; low/zero if not listed. Missing facility metadata should be treated as unknown, not proof that the facility cannot emit the pollutant.

## Example weighted ranking
`candidate_score = 0.30 * distance_score + 0.35 * wind_alignment_score + 0.20 * temporal_score + 0.15 * pollutant_match_score`

Round to an integer 0–100. Document the weights in the response/report. Weights are hackathon heuristics and should not be described as scientifically validated.

## Overall confidence (separate from candidate score)
Confidence describes how reliable the analysis is, not the probability that a facility caused the event. Start with a conservative heuristic based on:
- availability/recency of weather observations,
- availability of multiple measurements around the event,
- separation between the top and second-ranked candidate,
- completeness of candidate metadata,
- number of active sensors (one sensor means limited spatial triangulation).

Avoid returning high confidence merely because one candidate has the highest score. With one sensor and sparse synthetic data, keep confidence moderate and state why.

## Required response behavior
- Sort candidates by score descending; use deterministic tie-breaking (e.g. facility ID ascending).
- Return at least the component scores and a short reason for each candidate.
- Return uncertainty/limitations on every analysis.
- If no facilities exist, return an empty candidate list and low confidence rather than inventing a candidate.
- Do not say a facility is “the culprit,” “responsible,” or “confirmed.” Prefer “highest-ranked candidate,” “plausible source,” or “requires investigation.”
- Candidate score is not a probability. Confidence is not a probability either.
- Trajectory is a simplified visualization. Set `is_simulated: true` and include limitations unless a real dispersion model is used.

## Suggested implementation modules
- `app/services/attribution.py`: scoring and ranking functions, pure Python where possible.
- `app/routers/analysis.py` or keep small endpoints in `main.py` for MVP.
- `tests/test_attribution.py`: unit tests for distance, bearing, wind alignment, ranking order, missing weather, and empty facilities.
- Keep formula functions isolated so they can be tested without HTTP requests or a live database.
