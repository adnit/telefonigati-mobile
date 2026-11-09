"use client";

import { useEffect } from "react";

// Regjistron service worker-in vetëm në versionin e publikuar, që në zhvillim kodi të mos ngecë në cache.
export default function Pwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
