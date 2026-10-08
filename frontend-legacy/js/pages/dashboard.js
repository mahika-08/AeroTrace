// frontend/js/pages/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardController();
    dashboard.init();
});

class DashboardController {
    constructor() {
        this.els = {
            loading: document.getElementById('dashboardLoading'),
            data: document.getElementById('dashboardData'),
            error: document.getElementById('dashboardError'),
            refreshBtn: document.getElementById('refreshBtn'),
            
            metricSensors: document.getElementById('metricSensors'),
            metricEvents: document.getElementById('metricEvents'),
            metricFacilities: document.getElementById('metricFacilities'),
            
            recentEventsTable: document.getElementById('recentEventsTable'),
            eventsEmpty: document.getElementById('eventsEmpty')
        };
    }

    init() {
        this.loadData();
        if (this.els.refreshBtn) {
            this.els.refreshBtn.addEventListener('click', () => this.loadData());
        }
    }

    async loadData() {
        this.showLoading();
        
        try {
            // Since backend is likely not running for this project task initially, 
            // the API call will fail. We'll handle it properly showing the error state.
            const data = await window.API.getDashboard();
            this.renderDashboard(data);
            this.showData();
        } catch (error) {
            console.warn('Backend unavailable, rendering error state.', error);
            this.showError();
            if (window.updateConnectionStatus) window.updateConnectionStatus(true);
        }
    }

    renderDashboard(data) {
        // Safe population of metrics
        this.els.metricSensors.textContent = data.activeSensors ?? '-';
        this.els.metricEvents.textContent = data.events24h ?? '-';
        this.els.metricFacilities.textContent = data.monitoredFacilities ?? '-';

        // Render Events
        this.els.recentEventsTable.innerHTML = '';
        if (data.recentEvents && data.recentEvents.length > 0) {
            this.els.eventsEmpty.style.display = 'none';
            data.recentEvents.forEach(evt => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${this.formatDate(evt.timestamp)}</td>
                    <td>${this.escapeHTML(evt.id)}</td>
                    <td>${this.escapeHTML(evt.locationName || 'Unknown')}</td>
                    <td>${this.renderSeverity(evt.severity)}</td>
                    <td>${this.escapeHTML(evt.status || 'Pending')}</td>
                    <td><a href="pages/event-investigation.html?id=${encodeURIComponent(evt.id)}" class="btn btn-outline" style="padding: 0.25rem 0.5rem;">Investigate</a></td>
                `;
                this.els.recentEventsTable.appendChild(tr);
            });
        } else {
            this.els.eventsEmpty.style.display = 'block';
        }
    }
    
    renderSeverity(sev) {
        if (!sev) return '-';
        const s = sev.toLowerCase();
        if (s === 'high' || s === 'critical') return `<span class="status-badge danger">${this.escapeHTML(sev)}</span>`;
        if (s === 'medium') return `<span class="status-badge warning">${this.escapeHTML(sev)}</span>`;
        return `<span class="status-badge info">${this.escapeHTML(sev)}</span>`;
    }

    formatDate(isoString) {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return d.toLocaleString();
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    showLoading() {
        this.els.loading.style.display = 'block';
        this.els.data.style.display = 'none';
        this.els.error.style.display = 'none';
    }

    showData() {
        this.els.loading.style.display = 'none';
        this.els.data.style.display = 'block';
        this.els.error.style.display = 'none';
    }

    showError() {
        this.els.loading.style.display = 'none';
        this.els.data.style.display = 'none';
        this.els.error.style.display = 'block';
    }
}
