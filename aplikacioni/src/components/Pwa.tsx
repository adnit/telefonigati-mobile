"use client";

import { useEffect } from "react";

// Regjistron service worker-in vetëm në versionin e publikuar, që në zhvillim kodi të mos ngecë në cache.
// Gjithashtu i jep shiritit të statusit ngjyrën e temës së zgjedhur me dorë (nëse ka).
export default function Pwa() {
  useEffect(() => {
    try {
      const t = localStorage.getItem("tema");
      if (t === "light" || t === "dark") {
        document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
          .forEach((m) => { m.content = t === "dark" ? "#000000" : "#f2f2f7"; });
      }
    } catch {}
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
