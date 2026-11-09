"use client";

import { useEffect, useState } from "react";
import { ruajAbonimin } from "@/app/r/[kodi]/actions";

type Gjendja = "kontroll" | "mundet" | "aktive" | "duke" | "refuzuar" | "pa-mbeshtetje" | "iphone" | "gabim";

// Çelësi publik VAPID vjen si tekst base64url; pushManager e do si bajte.
function bajte(base64url: string) {
  const b64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function eshteIphoneNeShfletues() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const instaluar = window.matchMedia("(display-mode: standalone)").matches;
  return ios && !instaluar;
}

export function Njoftimet({ kodi, celesi }: { kodi: string; celesi: string }) {
  const [gjendja, setGjendja] = useState<Gjendja>("kontroll");

  useEffect(() => {
    let anulo = false;
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        // Në iPhone njoftimet punojnë vetëm pasi aplikacioni shtohet në ekranin kryesor.
        if (!anulo) setGjendja(eshteIphoneNeShfletues() ? "iphone" : "pa-mbeshtetje");
        return;
      }
      if (Notification.permission === "denied") { if (!anulo) setGjendja("refuzuar"); return; }
      const reg = await navigator.serviceWorker.getRegistration();
      const ekziston = await reg?.pushManager.getSubscription();
      if (!anulo) setGjendja(ekziston && Notification.permission === "granted" ? "aktive" : "mundet");
    })().catch(() => !anulo && setGjendja("mundet"));
    return () => { anulo = true; };
  }, []);

  // Leja kërkohet vetëm pas prekjes së butonit, kurrë kur hapet faqja.
  async function aktivizo() {
    setGjendja("duke");
    try {
      const leja = await Notification.requestPermission();
      if (leja !== "granted") { setGjendja(leja === "denied" ? "refuzuar" : "mundet"); return; }
      const reg = await navigator.serviceWorker.ready;
      const abonim = (await reg.pushManager.getSubscription())
        ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bajte(celesi) }));
      const rez = await ruajAbonimin(kodi, abonim.toJSON());
      setGjendja(rez === "ok" ? "aktive" : "gabim");
    } catch {
      setGjendja("gabim");
    }
  }

  if (gjendja === "kontroll") return null;
  return (
    <section className="panel notify">
      <div className="notify__row">
        <span className={`notify__icon${gjendja === "aktive" ? " notify__icon--on" : ""}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </span>
        <div>
          <h2>{gjendja === "aktive" ? "Njoftimet janë aktive" : "Merr njoftim kur të jetë gati"}</h2>
          <p className="muted">
            {gjendja === "aktive" && "Të njoftojmë në këtë telefon kur servisi ndryshon statusin ose kërkon miratim."}
            {(gjendja === "mundet" || gjendja === "duke") && "Pa e hapur faqen dhe pa telefonuar në servis."}
            {gjendja === "refuzuar" && "Njoftimet janë bllokuar për këtë faqe. Lejoji te cilësimet e shfletuesit."}
            {gjendja === "iphone" && "Në iPhone: prek Share → Add to Home Screen, hape TelefoniGati nga ekrani dhe aktivizo njoftimet."}
            {gjendja === "pa-mbeshtetje" && "Ky shfletues nuk i mbështet njoftimet. Statusi përditësohet vetë kur faqja është e hapur."}
            {gjendja === "gabim" && "Njoftimet nuk u aktivizuan. Provo përsëri pak më vonë."}
          </p>
        </div>
      </div>
      {(gjendja === "mundet" || gjendja === "duke" || gjendja === "gabim") && (
        <button className="action action--quiet action--block" onClick={aktivizo} disabled={gjendja === "duke"}>
          {gjendja === "duke" ? "Po aktivizohet…" : "Më njofto"}
        </button>
      )}
    </section>
  );
}
