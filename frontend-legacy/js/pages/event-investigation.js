// frontend/js/pages/event-investigation.js

document.addEventListener('DOMContentLoaded', () => {
    const inv = new InvestigationController();
    inv.init();
});

class InvestigationController {
    constructor() {
        this.eventId = new URLSearchParams(window.location.search).get('id');
        this.map = null;
        this.chart = null;
        
        this.els = {
            loading: document.getElementById('invLoading'),
            data: document.getElementById('invData'),
            empty: document.getElementById('invEmpty'),
            error: document.getElementById('invError'),
            
            // Header Info
            evtId: document.getElementById('evtId'),
            evtLoc: document.getElementById('evtLoc'),
            evtTime: document.getElementById('evtTime'),
            evtStatus: document.getElementById('evtStatus'),
            evtSeverity: document.getElementById('evtSeverity'),
            
            // Right Panel
            attributionContainer: document.getElementById('attributionContainer'),
            overallConfidence: document.getElementById('overallConfidence'),
            uncertaintyNotes: document.getElementById('uncertaintyNotes'),
            
            weatherWind: document.getElementById('weatherWind'),
            weatherTemp: document.getElementById('weatherTemp'),
            weatherDesc: document.getElementById('weatherDesc')
        };
    }

    async init() {
        if (!this.eventId) {
            this.showEmpty();
            return;
        }

        this.showLoading();
        try {
            // Fetch all required data in parallel
            const [overview, attribution, weather, measurements] = await Promise.all([
                window.API.getEvent(this.eventId),
                window.API.getEventAttribution(this.eventId),
                window.API.request(`/events/${this.eventId}/weather`), // direct mock mapping
                window.API.getEventEvidence(this.eventId)
            ]);

            this.renderOverview(overview);
            this.renderWeather(weather);
            this.renderAttribution(attribution);
            this.initMap(overview);
            this.initChart(measurements, overview.pollutant);
            
            this.showData();
        } catch (error) {
            console.error(error);
            this.showError();
            if (window.updateConnectionStatus) window.updateConnectionStatus(true);
        }
    }

    renderOverview(data) {
        this.els.evtId.textContent = `Event: ${data.id}`;
        this.els.evtLoc.textContent = data.locationName || 'Unknown Location';
        this.els.evtTime.textContent = new Date(data.timestamp).toLocaleString();
        
        this.els.evtStatus.innerHTML = `<span class="status-badge info">${this.escapeHTML(data.status)}</span>`;
        this.els.evtSeverity.innerHTML = this.renderSeverity(data.severity);
    }
    
    renderWeather(data) {
        if (!data || Object.keys(data).length === 0) {
            this.els.weatherWind.textContent = 'Unavailable';
            this.els.weatherTemp.textContent = 'Unavailable';
            this.els.weatherDesc.textContent = 'No weather data provided.';
            return;
        }
        
        this.els.weatherWind.textContent = `${data.windDirection}° at ${data.windSpeed} (from ${this.getWindDirectionString(data.windDirection)})`;
        this.els.weatherTemp.textContent = data.temperature || '-';
        this.els.weatherDesc.textContent = data.description || '';
    }

    renderAttribution(data) {
        this.els.attributionContainer.innerHTML = '';
        
        if (!data || !data.candidates || data.candidates.length === 0) {
            this.els.attributionContainer.innerHTML = '<div class="text-muted">Insufficient evidence to attribute this event.</div>';
            this.els.overallConfidence.textContent = 'Low';
            this.els.uncertaintyNotes.textContent = 'No candidates identified based on current evidence.';
            return;
        }

        this.els.overallConfidence.textContent = data.confidence || 'Unknown';
        this.els.uncertaintyNotes.textContent = data.uncertainty || 'None reported.';

        // Sort by rank or score
        data.candidates.sort((a, b) => b.score - a.score);

        // Check for ambiguous attribution
        if (data.candidates.length >= 2) {
            const diff = data.candidates[0].score - data.candidates[1].score;
            if (diff < 10 && data.confidence !== 'High') {
                const warn = document.createElement('div');
                warn.className = 'status-badge warning mb-3';
                warn.style.display = 'block';
                warn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Insufficient evidence to uniquely attribute this event.';
                this.els.attributionContainer.appendChild(warn);
            }
        }

        data.candidates.forEach(cand => {
            const el = document.createElement('div');
            el.className = 'candidate-item mb-3';
            el.innerHTML = `
                <div class="candidate-header">
                    <div class="candidate-name">${cand.rank}. ${this.escapeHTML(cand.facilityName)}</div>
                    <div class="candidate-score" title="Attribution Score">${cand.score}</div>
                </div>
                <div class="candidate-details">
                    <div class="mb-1"><strong>Evidence:</strong> ${this.escapeHTML(cand.evidence)}</div>
                    <div class="d-flex justify-content-between text-muted" style="font-size: 0.75rem;">
                        <span>Wind: ${this.escapeHTML(cand.windAlignment)}</span>
                        <span>Dist: ${this.escapeHTML(cand.distance)}</span>
                    </div>
                </div>
            `;
            this.els.attributionContainer.appendChild(el);
        });
    }

    initMap(overview) {
        if (this.map) this.map.remove();
        
        // Default to a sane location if no coordinates
        let center = [0, 0];
        let hasCoords = false;
        
        if (overview.coordinates && Array.isArray(overview.coordinates) && overview.coordinates.length === 2) {
            center = overview.coordinates;
            hasCoords = true;
        }

        this.map = L.map('map').setView(center, hasCoords ? 13 : 2);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);

        if (hasCoords) {
            L.circleMarker(center, {
                radius: 8,
                fillColor: "var(--semantic-danger)",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map).bindPopup(`<b>Event Location</b><br>${this.escapeHTML(overview.locationName)}`);
            
            // Add a simple mock trajectory line for demo purposes if backend trajectory isn't fully spec'd
            // In a real app, this would use data from `getEventTrajectory(id)`
        }
    }

    initChart(measurements, pollutantName) {
        if (this.chart) this.chart.destroy();
        
        const ctx = document.getElementById('concentrationChart').getContext('2d');
        
        if (!measurements || measurements.length === 0) {
            // Render empty chart
            this.chart = new Chart(ctx, {
                type: 'line',
                data: { datasets: [] },
                options: {
                    plugins: {
                        title: { display: true, text: 'No measurement data available' }
                    }
                }
            });
            return;
        }

        const data = measurements.map(m => ({
            x: new Date(m.time),
            y: m.value
        }));

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: `${pollutantName || 'Concentration'}`,
                    data: data,
                    borderColor: '#0f766e',
                    backgroundColor: 'rgba(15, 118, 110, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { tooltipFormat: 'PPp' },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });
    }

    renderSeverity(sev) {
        if (!sev) return '-';
        const s = sev.toLowerCase();
        if (s === 'high' || s === 'critical') return `<span class="status-badge danger">${this.escapeHTML(sev)}</span>`;
        if (s === 'medium') return `<span class="status-badge warning">${this.escapeHTML(sev)}</span>`;
        return `<span class="status-badge info">${this.escapeHTML(sev)}</span>`;
    }

    getWindDirectionString(degrees) {
        const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        const val = Math.floor((degrees / 22.5) + 0.5);
        return dirs[(val % 16)];
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    showEmpty() {
        this.els.loading.style.display = 'none';
        this.els.data.style.display = 'none';
        this.els.error.style.display = 'none';
        this.els.empty.style.display = 'block';
    }

    showLoading() {
        this.els.loading.style.display = 'block';
        this.els.data.style.display = 'none';
        this.els.error.style.display = 'none';
        this.els.empty.style.display = 'none';
    }

    showData() {
        this.els.loading.style.display = 'none';
        this.els.data.style.display = 'block';
        this.els.error.style.display = 'none';
        this.els.empty.style.display = 'none';
    }

    showError() {
        this.els.loading.style.display = 'none';
        this.els.data.style.display = 'none';
        this.els.error.style.display = 'block';
        this.els.empty.style.display = 'none';
    }
}
