"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Ikona } from "@/components/Ikona";

const PRAGU = 70;        // sa larg (pas rezistencës) duhet tërhequr që të rifreskohet
const VENDI_I_PRITJES = 56;

// Rezistenca si në iOS: sa më shumë tërheq, aq më pak lëviz treguesi.
function gome(d: number, gjatesia = 320) {
  return (d * 0.55 * gjatesia) / (gjatesia + 0.55 * d);
}

// Rifresko duke e tërhequr poshtë: kur faqja është në krye, një rreth xhami zbret nën gisht;
// pas pragut, kur lëshohet, faqja merr të dhënat e reja nga serveri pa u ringarkuar.
// Nuk ndërhyn kur prekja nis te nënshkrimi, te doreza e tabelës, te skaneri ose kur është hapur një fletë.
export function Rifresko() {
  const router = useRouter();
  const [zhvendosja, setZhvendosja] = useState(0);
  const [gjendja, setGjendja] = useState<"qete" | "terheq" | "rifreskon" | "mbaron">("qete");
  const [duke, startTransition] = useTransition();
  const fillimi = useRef<{ y: number; aktiv: boolean } | null>(null);
  const kaluarPragun = useRef(false);
  const koha = useRef(0);

  useEffect(() => {
    function nis(e: TouchEvent) {
      const t = e.target as Element;
      if (window.scrollY > 0 || e.touches.length !== 1 || document.querySelector("dialog[open], .scanner")
        || t.closest(".signature, .kcard__grip, .board-tabs--drop, input, textarea, select")) { fillimi.current = null; return; }
      fillimi.current = { y: e.touches[0].clientY, aktiv: false };
      kaluarPragun.current = false;
      // Dëgjuesi që mund ta ndalë lëvizjen shtohet vetëm tani, kur prekja nis në majë të faqes.
      // Kështu lëvizja e zakonshme e faqes nuk pret kurrë JavaScript-in dhe mbetet e lëmuar.
      window.addEventListener("touchmove", leviz, { passive: false });
    }
    function leviz(e: TouchEvent) {
      const f = fillimi.current;
      if (!f) return;
      const d = e.touches[0].clientY - f.y;
      if (!f.aktiv) {
        // Vetëm një tërheqje e qartë poshtë nga maja e faqes e nis; lart është lëvizje e zakonshme.
        if (d < 8 || window.scrollY > 0) { if (d < 0) fillimi.current = null; return; }
        f.aktiv = true;
        setGjendja("terheq");
      }
      e.preventDefault();
      const z = gome(Math.max(0, d - 8));
      setZhvendosja(z);
      if (z >= PRAGU && !kaluarPragun.current) { kaluarPragun.current = true; try { navigator.vibrate?.(8); } catch {} }
      if (z < PRAGU) kaluarPragun.current = false;
    }
    function lesho() {
      window.removeEventListener("touchmove", leviz);
      const f = fillimi.current;
      fillimi.current = null;
      if (!f?.aktiv) return;
      if (kaluarPragun.current) {
        setGjendja("rifreskon");
        setZhvendosja(VENDI_I_PRITJES);
        koha.current = Date.now();
        startTransition(() => router.refresh());
      } else {
        setGjendja("qete");
        setZhvendosja(0);
      }
    }
    window.addEventListener("touchstart", nis, { passive: true });
    window.addEventListener("touchend", lesho);
    window.addEventListener("touchcancel", lesho);
    return () => {
      window.removeEventListener("touchstart", nis);
      window.removeEventListener("touchmove", leviz);
      window.removeEventListener("touchend", lesho);
      window.removeEventListener("touchcancel", lesho);
    };
  }, [router]);

  // Kur të dhënat e reja mbërrijnë, rrethi qëndron edhe pak (që të shihet se diçka ndodhi) dhe ngjitet lart.
  useEffect(() => {
    if (gjendja !== "rifreskon" || duke) return;
    const mbetet = Math.max(0, 450 - (Date.now() - koha.current));
    const t = window.setTimeout(() => { setGjendja("mbaron"); setZhvendosja(0); }, mbetet);
    return () => window.clearTimeout(t);
  }, [gjendja, duke]);

  // Pasi rrethi ngjitet lart, hiqet nga faqja (efekt më vete, që ndryshimi i gjendjes të mos e anulojë).
  useEffect(() => {
    if (gjendja !== "mbaron") return;
    const t = window.setTimeout(() => setGjendja("qete"), 320);
    return () => window.clearTimeout(t);
  }, [gjendja]);

  if (gjendja === "qete") return null;
  const progresi = Math.min(1, zhvendosja / PRAGU);
  return (
    <div className={`ptr ptr--${gjendja}`} aria-live="polite"
      style={{ transform: `translate(-50%, ${zhvendosja - 48}px)`, opacity: gjendja === "terheq" ? Math.min(1, progresi * 1.4) : undefined }}>
      <span className="ptr__icon" style={gjendja === "terheq" ? { transform: `rotate(${progresi * 180}deg)` } : undefined}>
        {gjendja === "terheq" ? <Ikona emri="shigjetaPoshte" madhesia={20} trashesia={2.4} /> : <span className="spinner" aria-hidden="true" />}
      </span>
      <span className="visually-hidden">{gjendja === "rifreskon" ? "Po rifreskohet" : progresi >= 1 ? "Lëshoje për ta rifreskuar" : ""}</span>
    </div>
  );
}
