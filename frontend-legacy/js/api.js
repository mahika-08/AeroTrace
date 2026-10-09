// frontend/js/api.js
/**
 * AeroTrace API Client
 * Centralized logic for interacting with the backend.
 */

window.AEROTRACE_CONFIG = {
    apiBaseUrl: '/api/v1' // Default, can be overridden by env scripts
};

const API = {
    /**
     * Core fetch wrapper
     */
    async request(endpoint, options = {}) {
        const url = `${window.AEROTRACE_CONFIG.apiBaseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch(e) {
                    errorData = { message: response.statusText };
                }
                throw { status: response.status, data: errorData };
            }
            
            // Empty response (204)
            if (response.status === 204) return null;
            
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    },

    async getDashboard() {
        return this.request('/dashboard');
    },

    async getEvents(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/events?${query}` : '/events';
        return this.request(endpoint);
    },

    async getEvent(id) {
        return this.request(`/events/${id}`);
    },

    async analyzeEvent(id) {
        return this.request(`/events/${id}/analyze`, { method: 'POST' });
    },

    async getEventAttribution(id) {
        return this.request(`/events/${id}/attribution`);
    },

    async getEventTrajectory(id) {
        return this.request(`/events/${id}/trajectory`);
    },

    async getEventEvidence(id) {
        return this.request(`/events/${id}/evidence`);
    },

    async getFacilities(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/facilities?${query}` : '/facilities';
        return this.request(endpoint);
    },

    async getSensors(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/sensors?${query}` : '/sensors';
        return this.request(endpoint);
    }
};

window.API = API;
