// frontend/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    initAppShell();
    window.updateConnectionStatus = updateConnectionStatus;
    updateConnectionStatus();
});

function updateConnectionStatus(isError = false) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    if (isError) {
        statusEl.innerHTML = `<i class="bi bi-circle-fill" style="color: var(--semantic-error); font-size: 0.6rem;"></i> Backend Unavailable`;
    } else if (window.AEROTRACE_DEV_ADAPTER && window.AEROTRACE_DEV_ADAPTER.enabled) {
        statusEl.innerHTML = `<i class="bi bi-circle-fill" style="color: var(--semantic-warning); font-size: 0.6rem;"></i> Dev Mode (Mock Data)`;
    } else {
        statusEl.innerHTML = `<i class="bi bi-circle-fill" style="color: var(--semantic-success); font-size: 0.6rem;"></i> Connected`;
    }
}

function initAppShell() {
    // Sidebar Toggle for Mobile
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('appSidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar on clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}
