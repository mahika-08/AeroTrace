# Frontend / Backend Integration Checklist

## Agree these conventions in team chat
- [ ] Backend base URL is `http://localhost:8000` in the browser; API prefix is `/api/v1`.
- [ ] Use the endpoint shapes in `API_CONTRACT.md`.
- [ ] Lists read `response.items`; counts read `response.total`.
- [ ] Timestamps are ISO UTC strings; display them in the UI's chosen local timezone.
- [ ] Use `latitude`/`longitude` for ordinary fields. GeoJSON uses `[longitude, latitude]`.
- [ ] Candidate score, analysis confidence, and evidence strength are separate values.
- [ ] Demo data is synthetic and the UI/report labels it accordingly.
- [ ] Current read endpoints do not yet support `start_time`/`end_time`.
- [ ] Current error responses may use FastAPI's `detail`; frontend should handle this until a standard envelope is implemented.

## Suggested frontend API wrapper
Create one API client module rather than calling `fetch` throughout components:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? body?.detail ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

export const api = {
  dashboard: () => request("/dashboard"),
  sensors: (params = {}) => request(`/sensors?${new URLSearchParams(params)}`),
  measurements: (params = {}) => request(`/measurements?${new URLSearchParams(params)}`),
  facilities: (params = {}) => request(`/facilities?${new URLSearchParams(params)}`),
  weather: (params = {}) => request(`/weather?${new URLSearchParams(params)}`),
  events: (params = {}) => request(`/events?${new URLSearchParams(params)}`),
  event: (id) => request(`/events/${id}`),
  analyzeEvent: (id) => request(`/events/${id}/analyze`, { method: "POST", body: JSON.stringify({}) }),
  attribution: (id) => request(`/events/${id}/attribution`),
  trajectory: (id) => request(`/events/${id}/trajectory`),
  evidence: (id) => request(`/events/${id}/evidence`),
  report: (id) => request(`/events/${id}/report`),
};
```
The analysis methods above are placeholders until those routes are implemented. Query values should be filtered if `undefined`/empty values are passed; this sample is an integration starting point, not a production-ready client.

## End-to-end acceptance test
- [ ] Frontend dashboard shows counts from `/dashboard`.
- [ ] Events page renders event list and filters supported by the backend.
- [ ] Event detail opens by event ID.
- [ ] Clicking Analyze invokes `POST /events/{id}/analyze` and shows loading/error/success state.
- [ ] After analysis, ranked candidates and component scores render.
- [ ] Map renders event, facilities, and simulated trajectory with correct coordinate order.
- [ ] Evidence panel shows reasons and strengths.
- [ ] Report screen uses report endpoint and visibly states uncertainty.
- [ ] Empty/error/loading states do not crash the frontend.
- [ ] One complete demo path works on a fresh checkout with documented commands.
