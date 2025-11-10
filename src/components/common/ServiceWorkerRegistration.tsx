"use client";

import { useEffect } from "react";
import { registerSW } from "@/utils/registerSW";

/**
 * Client component to register the service worker
 * This must be a client component because service workers are browser-only
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker on client-side mount
    registerSW();
  }, []);

  return null; // This component doesn't render anything
}

