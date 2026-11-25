"use client";

import { useEffect, useState } from "react";
import { Ikona } from "@/components/Ikona";
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

  // Gjatë kontrollit karta shfaqet menjëherë në gjendjen më të zakonshme (butoni i çaktivizuar),
  // që të mos shfaqet më vonë dhe ta shtyjë poshtë pjesën tjetër të faqes.
  const butoni = gjendja === "mundet" || gjendja === "duke" || gjendja === "gabim" || gjendja === "kontroll";
  return (
    <section className="group" aria-busy={gjendja === "kontroll"} aria-label="Njoftimet">
      <div className="group__body">
        <div className="row row--icon">
          <span className="row__icon" style={{ "--icon-bg": gjendja === "aktive" ? "var(--gati-fill)" : "#ff3b30" } as React.CSSProperties}>
            <Ikona emri="zile" madhesia={17} />
          </span>
          <span className="row__main">
            <span className="row__title">{gjendja === "aktive" ? "Njoftimet janë aktive" : "Njoftimi kur të jetë gati"}</span>
            <span className="row__sub">
              {gjendja === "aktive" && "Të njoftojmë në këtë telefon kur ndryshon statusi."}
              {(gjendja === "mundet" || gjendja === "duke" || gjendja === "kontroll") && "Pa e hapur faqen dhe pa telefonuar."}
              {gjendja === "refuzuar" && "Të bllokuara. Lejoji te cilësimet e shfletuesit."}
              {gjendja === "iphone" && "Në iPhone: Share → Add to Home Screen, pastaj hape nga ekrani."}
              {gjendja === "pa-mbeshtetje" && "Ky shfletues nuk i mbështet. Faqja përditësohet vetë kur është e hapur."}
              {gjendja === "gabim" && "Nuk u aktivizuan. Provo përsëri pak më vonë."}
            </span>
          </span>
          {butoni && (
            <button type="button" className="btn btn--tinted btn--small" onClick={aktivizo} disabled={gjendja === "duke" || gjendja === "kontroll"}>
              {gjendja === "duke" ? "…" : "Më njofto"}
            </button>
          )}
          {gjendja === "aktive" && <Ikona emri="rregull" madhesia={20} trashesia={2.6} className="chev" />}
        </div>
      </div>
    </section>
  );
}
