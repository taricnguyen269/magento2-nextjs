/**
 * Service Worker Registration
 * Registers the service worker and handles messages from it
 * Similar to pwa-arielbath implementation
 */

// Check if service workers are supported
const VALID_SERVICE_WORKER_ENVIRONMENT =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  (window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

/**
 * Handle messages from the service worker
 */
function handleMessageFromSW(
  type: string,
  payload: any,
  event: MessageEvent
) {
  switch (type) {
    case "SKIP_WAITING":
      // Service worker is ready, reload the page to use it
      if (window.confirm("New version available! Reload to update?")) {
        window.location.reload();
      }
      break;
    case "CACHE_UPDATED":
      console.log("Cache updated:", payload);
      break;
    case "OFFLINE_READY":
      console.log("App is ready to work offline");
      break;
    default:
      console.log("SW message:", type, payload);
  }
}

/**
 * Register the service worker
 * Called from client-side only
 */
export function registerSW() {
  if (!VALID_SERVICE_WORKER_ENVIRONMENT || !globalThis.navigator) {
    return;
  }

  if (!window.navigator.serviceWorker) {
    console.warn("Service workers are not supported in this browser");
    return;
  }

  window.navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("✓ Service Worker registered successfully");

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log("New service worker available");
            }
          });
        }
      });
    })
    .catch((error) => {
      console.warn("Failed to register Service Worker:", error);
    });

  // Listen for messages from the service worker
  navigator.serviceWorker.addEventListener("message", (e) => {
    const { type, payload } = e.data || {};
    if (type) {
      handleMessageFromSW(type, payload, e);
    }
  });

  // Handle service worker controller changes
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("Service Worker controller changed");
    // Optionally clear Apollo cache when SW updates
    // This can help prevent stale cache issues
    if (typeof window !== "undefined" && (window as any).__APOLLO_CLIENT__) {
      // Clear Apollo cache if needed
      console.log("Service Worker updated - consider clearing cache");
    }
  });
}

