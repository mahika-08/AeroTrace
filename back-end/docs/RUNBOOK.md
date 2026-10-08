# Local Development Runbook

## Prerequisites
- Python 3.10+ (3.11 recommended)
- Git
- No Docker required

## Start the backend
From the repository's `backend/` directory, activate your existing virtual environment if you have one, then run:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
On first startup, the app lifespan creates tables and seeds demo data if the database is empty.

## Verify routes
Open these URLs:
- `http://127.0.0.1:8000/api/v1/health`
- `http://127.0.0.1:8000/api/v1/dashboard`
- `http://127.0.0.1:8000/api/v1/sensors`
- `http://127.0.0.1:8000/api/v1/measurements?sensor_id=1`
- `http://127.0.0.1:8000/api/v1/facilities`
- `http://127.0.0.1:8000/api/v1/weather?sensor_id=1`
- `http://127.0.0.1:8000/api/v1/events`
- `http://127.0.0.1:8000/api/v1/events/1`
- `http://127.0.0.1:8000/docs`

IDs can differ if the database already existed. If `/events/1` is missing, first inspect `/api/v1/events` and use an ID that exists.

## Run tests
From `backend/`:
```bash
python -m pytest -q
```
Use the actual output as the source of truth; do not assume tests passed just because the command was run.

## Commit docs
From the repository root, after extracting/copying this folder into `docs/`:
```bash
git add docs
git commit -m "docs: add API contract and prototype runbook"
git push
```

## Resetting demo data
Only if it is safe to discard local demo data: stop the server, back up or remove `backend/data/aerotrace.db`, then restart. Do not delete the database if it contains work you need.
