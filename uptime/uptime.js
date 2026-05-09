const SERVICES = [
    { name: "Main Portfolio", url: "https://boon.is-a.dev" },
    { name: "Blog", url: "https://blog.boon.is-a.dev" },
    { name: "Uptime Dashboard", url: "https://uptime.boon.is-a.dev" }
];

const CHECK_TIMEOUT_MS = 7000;
const REFRESH_INTERVAL_MS = 60000;

const serviceList = document.getElementById("service-list");
const lastUpdated = document.getElementById("last-updated");
const refreshButton = document.getElementById("refresh-now");

function escapeHtml(input) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(date) {
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

async function checkService(service) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const startedAt = performance.now();

    try {
        const response = await fetch(service.url, {
            method: "GET",
            mode: "no-cors",
            signal: controller.signal
        });

        clearTimeout(timeout);
        const latency = Math.round(performance.now() - startedAt);
        return {
            name: service.name,
            url: service.url,
            up: response.type === "opaque" || response.ok,
            latency
        };
    } catch (error) {
        clearTimeout(timeout);
        return {
            name: service.name,
            url: service.url,
            up: false,
            latency: null,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

function renderStatusCard(result) {
    const statusClass = result.up ? "status-up" : "status-down";
    const statusText = result.up ? "Operational" : "Degraded";
    const detailText = result.up
        ? `${result.latency} ms response`
        : (result.error || "Request failed");

    return `
        <article class="col-md-6 col-lg-4">
            <div class="card border-0 bg-light h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h3 class="h6 fw-bold mb-0">${escapeHtml(result.name)}</h3>
                        <span class="status-pill ${statusClass}">
                            <span class="dot"></span>${statusText}
                        </span>
                    </div>
                    <p class="small text-muted mb-2">${escapeHtml(result.url)}</p>
                    <p class="small mb-0">${escapeHtml(detailText)}</p>
                </div>
            </div>
        </article>
    `;
}

async function refreshStatuses() {
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i>Checking';

    const checks = await Promise.all(SERVICES.map(checkService));
    serviceList.innerHTML = checks.map(renderStatusCard).join("");
    lastUpdated.textContent = `Last checked: ${formatDate(new Date())}`;

    refreshButton.disabled = false;
    refreshButton.innerHTML = '<i class="fa-solid fa-rotate-right me-1"></i>Refresh Now';
}

refreshButton.addEventListener("click", refreshStatuses);
refreshStatuses();
setInterval(refreshStatuses, REFRESH_INTERVAL_MS);
