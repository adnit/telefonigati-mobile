"use client";

import { useEffect, useRef, useState } from "react";
import { Ikona } from "@/components/Ikona";
import type { Statusi } from "@/lib/riparimet";

const MESAZHET: Partial<Record<Statusi, { titulli: string; teksti: string; ikona: "rregull" | "celes" }>> = {
  "Në riparim": { titulli: "Riparimi filloi", teksti: "Teknikët po punojnë tani me telefonin tënd.", ikona: "celes" },
  "Gati për marrje": { titulli: "Telefoni yt është gati!", teksti: "Kalo në servis për ta marrë.", ikona: "rregull" },
};

// Momenti kur statusi ndryshon ndërsa klienti e ka faqen hapur: karta e statusit "pulson",
// shiriti mbushet, telefoni dridhet (në Android) dhe nga lart zbret një njoftim xhami.
// Nuk shfaqet në hapjen e parë të faqes, vetëm kur statusi ndryshon pas saj.
export function StatusLive({ statusi }: { statusi: Statusi }) {
  const iFundit = useRef(statusi);
  const [njoftimi, setNjoftimi] = useState<Statusi | null>(null);

  useEffect(() => {
    if (iFundit.current === statusi) return;
    iFundit.current = statusi;
    const karta = document.querySelector<HTMLElement>(".status-card");
    karta?.removeAttribute("data-ndryshoi");
    void karta?.offsetWidth; // rinis animacionin edhe kur ndryshon dy herë radhazi
    karta?.setAttribute("data-ndryshoi", statusi === "Gati për marrje" ? "gati" : "po");
    try { navigator.vibrate?.(statusi === "Gati për marrje" ? [40, 70, 40, 70, 120] : 40); } catch {}
    const titulliFaqes = document.title;
    if (statusi === "Gati për marrje") document.title = "✓ Gati · TelefoniGati";
    const t0 = window.setTimeout(() => setNjoftimi(statusi), 0);
    const t1 = window.setTimeout(() => setNjoftimi(null), 7000);
    return () => { window.clearTimeout(t0); window.clearTimeout(t1); document.title = titulliFaqes; };
  }, [statusi]);

  const m = njoftimi ? MESAZHET[njoftimi] : null;
  if (!m) return null;
  return (
    <button type="button" className={`live-banner glass${njoftimi === "Gati për marrje" ? " live-banner--gati" : ""}`}
      role="status" aria-live="assertive" onClick={() => setNjoftimi(null)}>
      <span className="live-banner__icon"><Ikona emri={m.ikona} madhesia={22} trashesia={2.6} /></span>
      <span className="live-banner__text"><strong>{m.titulli}</strong><span>{m.teksti}</span></span>
    </button>
  );
}
