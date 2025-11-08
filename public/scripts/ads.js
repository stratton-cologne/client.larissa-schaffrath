/* ==========================================================================
   Simple Ads Stub for Consumer (Vite public/scripts/ads.js)
   --------------------------------------------------------------------------
   Zweck
   - Platzhalter-/Test-Implementation, die bei aktivierter Marketing-Zustimmung
     geladen wird (über dein Cookie-Consent-Config).
   - Keine externen Requests, keine Third-Party Abhängigkeiten.
   - Idempotent (mehrfaches Laden ohne Nebenwirkungen).

   Nutzung
   - Datei unter: /public/scripts/ads.js
   - Consent-Config:
       {
         id: "ads",
         category: "marketing",
         src: "/scripts/ads.js",
         defer: true,
         // optional in Dev ausblenden:
         // when: () => import.meta.env && import.meta.env.PROD
       }

   API (globales Namespace-Fensterobjekt):
   - window.ADS.init(options?: { debug?: boolean })
   - window.ADS.enable()
   - window.ADS.disable()
   - window.ADS.pageview(path?: string)
   - window.ADS.track(event: string, payload?: Record<string, any>)

   SPA-Hinweis
   - In SPA-Apps gerne bei Routenwechseln `ADS.pageview()` aufrufen.
   ========================================================================== */

(function (global) {
  if (global.ADS && global.ADS.__initialized) {
    // Bereits initialisiert – nichts tun
    return;
  }

  var _state = {
    enabled: true,
    debug: false,
    lastPageview: null,
    q: [] // Event-Queue, bis init abgeschlossen
  };

  function log() {
    if (_state.debug && typeof console !== "undefined") {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[ADS]");
      console.log.apply(console, args);
    }
  }

  function warn() {
    if (typeof console !== "undefined") {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[ADS]");
      console.warn.apply(console, args);
    }
  }

  function nowISO() {
    try { return new Date().toISOString(); } catch (_) { return String(Date.now()); }
  }

  function safeEmit(type, detail) {
    try {
      var ev = new CustomEvent("ads:" + type, { detail: detail || {} });
      window.dispatchEvent(ev);
    } catch (e) {
      // ältere Browser
      warn("CustomEvent dispatch fail:", e);
    }
  }

  function _processQueue() {
    while (_state.q.length) {
      var item = _state.q.shift();
      try {
        item.fn.apply(null, item.args || []);
      } catch (e) {
        warn("queued task failed:", e);
      }
    }
  }

  function _ensureEnabled() {
    if (!_state.enabled) {
      log("call ignored (disabled)");
      return false;
    }
    return true;
  }

  // --- Public API -----------------------------------------------------------
  var ADS = {
    __initialized: false,

    init: function init(opts) {
      if (ADS.__initialized) {
        if (opts && typeof opts.debug === "boolean") _state.debug = !!opts.debug;
        log("re-init ignored (already initialized). debug:", _state.debug);
        return;
      }
      opts = opts || {};
      if (typeof opts.debug === "boolean") _state.debug = !!opts.debug;

      ADS.__initialized = true;
      log("initialized", { debug: _state.debug, ts: nowISO() });
      safeEmit("ready", { ts: nowISO() });

      // initialen Pageview melden (nur wenn sichtbar)
      if (document && document.visibilityState !== "prerender") {
        ADS.pageview(location && location.pathname ? location.pathname : "/");
      }

      // Queue flushen
      _processQueue();

      // Optionale SPA-Unterstützung (rudimentär): auf Popstate reagieren
      try {
        window.addEventListener("popstate", function () {
          ADS.pageview(location && location.pathname ? location.pathname : "/");
        });
      } catch (_) {}
    },

    enable: function enable() {
      _state.enabled = true;
      log("enabled");
      safeEmit("enabled", { ts: nowISO() });
    },

    disable: function disable() {
      _state.enabled = false;
      log("disabled");
      safeEmit("disabled", { ts: nowISO() });
    },

    pageview: function pageview(path) {
      var run = function () {
        if (!_ensureEnabled()) return;
        var p = path || (location && location.pathname) || "/";
        var ts = nowISO();
        _state.lastPageview = { path: p, ts: ts };
        log("pageview", { path: p, ts: ts });
        safeEmit("pageview", { path: p, ts: ts });
        // Hier könntest du echte Pixel-/Beacon-Calls ergänzen.
      };
      if (!ADS.__initialized) return _state.q.push({ fn: ADS.pageview, args: [path] });
      run();
    },

    track: function track(event, payload) {
      var run = function () {
        if (!_ensureEnabled()) return;
        var ts = nowISO();
        log("track", { event: event, payload: payload || null, ts: ts });
        safeEmit("track", { event: event, payload: payload || null, ts: ts });
        // Hier könntest du echte Pixel-/Beacon-Calls ergänzen.
      };
      if (!ADS.__initialized) return _state.q.push({ fn: ADS.track, args: [event, payload] });
      run();
    }
  };

  // Im globalen Scope bereitstellen
  Object.defineProperty(global, "ADS", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: ADS
  });

  // Auto-Init nach DOM-Ready (falls nicht manuell vorher init() aufgerufen wird)
  function _domReady(cb) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(cb, 0);
    } else {
      document.addEventListener("DOMContentLoaded", cb, { once: true });
    }
  }
  _domReady(function () {
    try {
      ADS.init({ debug: !!(window && window.__ADS_DEBUG__) });
    } catch (e) {
      warn("auto-init failed:", e);
    }
  });
})(window);
