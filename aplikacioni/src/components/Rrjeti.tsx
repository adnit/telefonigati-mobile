"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

// Paralajmërim kur faqja lexohet nga kopja e ruajtur.
export function PaInternet({ perditesuar }: { perditesuar: string }) {
  const online = useOnline();
  if (online) return null;
  return (
    <p role="status" className="offline-banner">
      Pa internet · po sheh kopjen e ruajtur ({perditesuar}). Statusi mund të ketë ndryshuar.
    </p>
  );
}

// Vendimi kërkon serverin: pa rrjet butonat çaktivizohen në vend që të dështojnë.
export function VetemMeRrjet({ children }: { children: React.ReactNode }) {
  const online = useOnline();
  return (
    <fieldset className="plain" disabled={!online}>
      {children}
      {!online && <p className="muted">Lidhu me internet për të vendosur.</p>}
    </fieldset>
  );
}
