"use client";

import { useEffect, useState } from "react";

type Tema = "auto" | "light" | "dark";
const NGJYRAT = { light: "#f2f2f7", dark: "#000000" };

// Vendos temën në <html> dhe ngjyrën e shiritit të statusit të telefonit.
// "auto" e heq atributin: atëherë vendos telefoni (prefers-color-scheme).
function apliko(t: Tema) {
  const html = document.documentElement;
  if (t === "auto") delete html.dataset.theme; else html.dataset.theme = t;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    const sipasTelefonit = m.media.includes("dark") ? NGJYRAT.dark : NGJYRAT.light;
    m.content = t === "auto" ? sipasTelefonit : NGJYRAT[t];
  });
}

// Skripti që ekzekutohet para shfaqjes së faqes, që tema e zgjedhur të mos "kërcejë" pas ngarkimit.
export const SKRIPTI_I_TEMES = `try{var t=localStorage.getItem("tema");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}`;

export function ZgjedhTemen() {
  const [tema, setTema] = useState<Tema>("auto");

  useEffect(() => {
    let t: Tema = "auto";
    try { const v = localStorage.getItem("tema"); if (v === "light" || v === "dark") t = v; } catch {}
    apliko(t);
    const id = window.setTimeout(() => setTema(t), 0);
    return () => window.clearTimeout(id);
  }, []);

  function zgjidh(t: Tema) {
    setTema(t);
    apliko(t);
    try { if (t === "auto") localStorage.removeItem("tema"); else localStorage.setItem("tema", t); } catch {}
  }

  const opsionet: { id: Tema; emri: string }[] = [
    { id: "auto", emri: "Automatike" },
    { id: "light", emri: "E çelët" },
    { id: "dark", emri: "E errët" },
  ];
  return (
    <div className="segmented" role="group" aria-label="Pamja">
      {opsionet.map((o) => (
        <button key={o.id} type="button" aria-pressed={tema === o.id} onClick={() => zgjidh(o.id)}>{o.emri}</button>
      ))}
    </div>
  );
}
