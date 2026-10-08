
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AeroTrace API",
    description="Pollution event investigation and source attribution API",
    version="1.0.0",
)

# Allow the React/Vite frontend to call this backend locally.
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


@app.get("/api/v1/health")
def health_check():
    return {
        "application": "AeroTrace",
        "status": "UP",
    }