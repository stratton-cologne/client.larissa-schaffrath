const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const KEY = "sc.sessionId";

// globale Flagge gegen Mehrfach-Init (HMR/mehrfacher Import/Router-Mounts)
declare global {
    interface Window {
        __scAnalyticsInitialized?: boolean;
    }
}

function getSessionId(): string {
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        localStorage.setItem(KEY, id);
    }
    return id;
}

type Payload = {
    sessionId: string;
    path: string;
    referrer?: string;
    duration?: number;
    ts?: string;
    type?: "view" | "close" | "beat"; // <— beat hinzu
};

function postBeacon(payload: Payload) {
    const url = `${API}/api/analytics/track`;
    const body = JSON.stringify(payload);
    const blob = new Blob([body], { type: "text/plain;charset=UTF-8" }); // simple → kein Preflight
    if (navigator.sendBeacon) {
        navigator.sendBeacon(url, blob);
    } else {
        fetch(url, {
            method: "POST",
            body,
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
        }).catch(() => {});
    }
}

export function setupAnalytics() {
    if (window.__scAnalyticsInitialized) return;
    window.__scAnalyticsInitialized = true;

    const sessionId = getSessionId();
    const referrer = document.referrer || undefined;
    let path = location.pathname + location.search;
    let start = Date.now();
    let lastBeatAt = start;
    let flushed = false;
    let beatTimer: number | undefined;

    function startHeartbeat() {
        stopHeartbeat();
        beatTimer = window.setInterval(() => {
            const now = Date.now();
            const delta = Math.round((now - lastBeatAt) / 1000);
            if (delta >= 5) {
                console.log("Analytics Heartbeat:", {
                    sessionId,
                    path,
                    duration: delta,
                });
                // alle 5s
                postBeacon({
                    sessionId,
                    path,
                    duration: delta,
                    ts: new Date().toISOString(),
                    type: "beat",
                });
                lastBeatAt = now;
            }
        }, 2000); // prüfen alle 5s, senden bei >=15s
    }
    function stopHeartbeat() {
        if (beatTimer) {
            clearInterval(beatTimer);
            beatTimer = undefined;
        }
    }

    // 1) View (einmal)
    postBeacon({
        sessionId,
        path,
        referrer,
        ts: new Date().toISOString(),
        type: "view",
    });
    startHeartbeat();

    function flushDuration(reason: "visibility" | "pagehide" | "manual") {
        if (flushed) return;
        flushed = true;
        stopHeartbeat();
        const now = Date.now();
        const deltaSinceLastBeat = Math.max(
            0,
            Math.round((now - lastBeatAt) / 1000),
        );
        if (deltaSinceLastBeat >= 1) {
            // letzten Rest als close senden
            postBeacon({
                sessionId,
                path,
                duration: deltaSinceLastBeat,
                ts: new Date().toISOString(),
                type: "close",
            });
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushDuration("visibility");
    });
    window.addEventListener("pagehide", () => flushDuration("pagehide"));

    // SPA-Routenwechsel
    window.addEventListener("popstate", () => {
        flushDuration("manual"); // alten Besuch abschließen
        // neuen Besuch
        path = location.pathname + location.search;
        start = Date.now();
        lastBeatAt = start;
        flushed = false;
        postBeacon({
            sessionId,
            path,
            referrer,
            ts: new Date().toISOString(),
            type: "view",
        });
        startHeartbeat();
    });
}
