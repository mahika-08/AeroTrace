// frontend/js/dev-adapter.js
/**
 * AeroTrace Development Adapter
 * 
 * IMPORTANT: This file isolates all mock data and backend assumptions.
 * It must be removed or disabled in production when the real API is available.
 * 
 * Assumptions:
 * - Dates are ISO 8601 strings.
 * - Coordinates are [lat, lng].
 * - Attribution Score is a unitless number (not a percentage).
 */

window.AEROTRACE_DEV_ADAPTER = {
    enabled: true, // Set to false to use real API

    // Mock Database
    db: {
        dashboard: {
            activeSensors: 24,
            events24h: 7,
            monitoredFacilities: 18,
            recentEvents: [
                { id: "EVT-2026-892", timestamp: new Date(Date.now() - 3600000).toISOString(), locationName: "Industrial Park North", severity: "High", status: "Investigating" },
                { id: "EVT-2026-891", timestamp: new Date(Date.now() - 86400000).toISOString(), locationName: "River Valley", severity: "Medium", status: "Analyzed" }
            ]
        },
        events: [
            { id: "EVT-2026-892", timestamp: new Date(Date.now() - 3600000).toISOString(), pollutant: "SO2", locationName: "Industrial Park North", severity: "High", status: "Investigating" },
            { id: "EVT-2026-891", timestamp: new Date(Date.now() - 86400000).toISOString(), pollutant: "VOCs", locationName: "River Valley", severity: "Medium", status: "Analyzed" }
        ],
        facilities: [
            { id: "FAC-001", name: "ChemCorp Processing", location: "North Sector", type: "Chemical", status: "Active" },
            { id: "FAC-002", name: "SteelWorks Inc.", location: "East Sector", type: "Metallurgy", status: "Active" }
        ],
        sensors: [
            { id: "SEN-101", name: "North-West Array", location: "Zone A", pollutant: "Multigas", status: "Online", lastSeen: new Date().toISOString() },
            { id: "SEN-102", name: "River Monitor", location: "Zone B", pollutant: "SO2", status: "Online", lastSeen: new Date().toISOString() }
        ],
        eventDetails: {
            "EVT-2026-892": {
                overview: {
                    id: "EVT-2026-892",
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    locationName: "Industrial Park North",
                    coordinates: [34.0522, -118.2437],
                    pollutant: "SO2",
                    severity: "High",
                    peakConcentration: "145 ppb",
                    duration: "45 mins",
                    status: "Investigating",
                    analysisState: "Complete"
                },
                weather: {
                    windDirection: 270, // 270° coming from the west
                    windSpeed: "12 km/h",
                    temperature: "22°C",
                    description: "Clear, steady breeze"
                },
                measurements: [
                    // Time series mock data
                    { time: new Date(Date.now() - 7200000).toISOString(), value: 12 },
                    { time: new Date(Date.now() - 5400000).toISOString(), value: 15 },
                    { time: new Date(Date.now() - 3600000).toISOString(), value: 145 }, // Peak
                    { time: new Date(Date.now() - 1800000).toISOString(), value: 45 },
                    { time: new Date(Date.now()).toISOString(), value: 18 }
                ],
                attribution: {
                    confidence: "Medium",
                    uncertainty: "Wind data sparse at 500m elevation. Plausible interference from secondary sources.",
                    candidates: [
                        { rank: 1, facilityId: "FAC-001", facilityName: "ChemCorp Processing", score: 86, distance: "2.1 km", windAlignment: "Strong", evidence: "Plume timing aligns with sensor peak." },
                        { rank: 2, facilityId: "FAC-003", facilityName: "AeroTech Manufacturing", score: 41, distance: "3.5 km", windAlignment: "Moderate", evidence: "Possible secondary contribution." }
                    ]
                }
            }
        }
    },

    /**
     * Intercept fetch calls for dev environment
     */
    async intercept(endpoint, options) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const parts = endpoint.split('?')[0].replace('/api/v1', '').split('/').filter(Boolean);
                
                try {
                    if (parts[0] === 'dashboard') {
                        resolve(this.db.dashboard);
                    } else if (parts[0] === 'events' && parts.length === 1) {
                        resolve(this.db.events);
                    } else if (parts[0] === 'events' && parts.length > 1) {
                        const id = parts[1];
                        const sub = parts[2]; // attribution, evidence, trajectory, etc.
                        const evt = this.db.eventDetails[id];
                        
                        if (!evt) throw { status: 404, message: "Event not found" };

                        if (!sub) resolve(evt.overview);
                        else if (sub === 'attribution') resolve(evt.attribution);
                        else if (sub === 'evidence') resolve(evt.measurements); // simplificiation
                        else if (sub === 'weather') resolve(evt.weather);
                        else resolve({});
                    } else if (parts[0] === 'facilities') {
                        resolve(this.db.facilities);
                    } else if (parts[0] === 'sensors') {
                        resolve(this.db.sensors);
                    } else {
                        throw { status: 404, message: "Endpoint not mapped in dev-adapter" };
                    }
                } catch (err) {
                    reject(err);
                }
            }, 500); // Simulate network latency
        });
    }
};

// Hook into the API client
if (window.AEROTRACE_DEV_ADAPTER.enabled) {
    console.warn("AEROTRACE_DEV_ADAPTER is ENABLED. Mocking API responses. REMOVE in production.");
    const originalRequest = window.API.request;
    window.API.request = async function(endpoint, options) {
        try {
            return await window.AEROTRACE_DEV_ADAPTER.intercept(endpoint, options);
        } catch(e) {
            // Fallback to real request if we want to mix, but here we just throw the mock error
            if (e.status) throw e;
            return originalRequest.apply(this, [endpoint, options]);
        }
    };
}
