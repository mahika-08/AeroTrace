# AeroTrace — Project Documentation

This folder contains the shared backend/frontend contracts and demo notes for AeroTrace.

## Documents
- `API_CONTRACT.md` — routes, query parameters, response shapes, conventions, and current implementation status.
- `DATA_MODEL.md` — core entities and relationships.
- `ATTRIBUTION_LOGIC.md` — proposed explainable source-ranking method and interpretation rules.
- `RUNBOOK.md` — how to run and verify the local prototype.
- `INTEGRATION_CHECKLIST.md` — frontend/backend integration checklist and demo acceptance criteria.

## Current prototype assumptions
- Backend: Python, FastAPI, SQLAlchemy, SQLite.
- API prefix: `/api/v1`.
- Local backend: `http://127.0.0.1:8000`.
- Local Vite frontend: `http://localhost:5173`.
- Data is synthetic demo data. Do not describe it as live sensor data.
- SQLite is used for hackathon simplicity; spatial calculations are performed in Python rather than PostGIS.

Keep this documentation aligned with the actual code. The “Status” column in `API_CONTRACT.md` distinguishes read routes that are implemented in the current described code from routes planned for the next phases.
