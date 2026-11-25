"use client";

import { useSyncExternalStore } from "react";
import { Ikona } from "@/components/Ikona";

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
      <Ikona emri="wifiJo" madhesia={18} />
      <span>Pa internet · po sheh kopjen e ruajtur ({perditesuar}). Statusi mund të ketë ndryshuar.</span>
    </p>
  );
}

// Vendimi kërkon serverin: pa rrjet butonat çaktivizohen në vend që të dështojnë.
export function VetemMeRrjet({ children }: { children: React.ReactNode }) {
  const online = useOnline();
  return (
    <fieldset className="plain" disabled={!online}>
      {children}
      {!online && <p className="card__sub" style={{ textAlign: "center", marginTop: 10 }}>Lidhu me internet për të vendosur.</p>}
    </fieldset>
  );
}
