// frontend/js/pages/events.js

document.addEventListener('DOMContentLoaded', () => {
    const eventsPage = new EventsController();
    eventsPage.init();
});

class EventsController {
    constructor() {
        this.els = {
            loading: document.getElementById('eventsLoading'),
            data: document.getElementById('eventsData'),
            error: document.getElementById('eventsError'),
            refreshBtn: document.getElementById('refreshBtn'),
            tbody: document.getElementById('eventsTableBody'),
            empty: document.getElementById('eventsEmpty')
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
            const data = await window.API.getEvents();
            this.renderData(data);
            this.showData();
        } catch (error) {
            console.warn('Backend unavailable, rendering error state.', error);
            this.showError();
            if (window.updateConnectionStatus) window.updateConnectionStatus(true);
        }
    }

    renderData(data) {
        this.els.tbody.innerHTML = '';
        if (data && data.length > 0) {
            this.els.empty.style.display = 'none';
            data.forEach(evt => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${this.escapeHTML(evt.id)}</strong></td>
                    <td>${this.formatDate(evt.timestamp)}</td>
                    <td>${this.escapeHTML(evt.locationName || '-')}</td>
                    <td>${this.escapeHTML(evt.pollutant || '-')}</td>
                    <td>${this.renderSeverity(evt.severity)}</td>
                    <td>${this.escapeHTML(evt.status || 'Pending')}</td>
                    <td><a href="event-investigation.html?id=${encodeURIComponent(evt.id)}" class="btn btn-outline" style="padding: 0.25rem 0.5rem;">Investigate</a></td>
                `;
                this.els.tbody.appendChild(tr);
            });
        } else {
            this.els.empty.style.display = 'block';
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
        return new Date(isoString).toLocaleString();
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
