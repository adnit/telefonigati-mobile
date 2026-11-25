"use client";

import { useState } from "react";
import { Ikona } from "@/components/Ikona";

// Linku privat që servisi ia jep klientit (Viber, SMS ose kopjim). Në telefon hap menynë e ndarjes së sistemit.
export function LinkuKlientit({ shtegu, si = "rresht" }: { shtegu: string; si?: "rresht" | "ikone" }) {
  const [kopjuar, setKopjuar] = useState(false);

  async function ndaj() {
    const url = new URL(shtegu, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Riparimi në TelefoniGati", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setKopjuar(true);
      window.setTimeout(() => setKopjuar(false), 2000);
    } catch {
      // Anulimi i ndarjes nuk është gabim.
    }
  }

  if (si === "ikone") {
    return (
      <button type="button" className="nav__icon" onClick={ndaj} aria-label={kopjuar ? "Linku u kopjua" : "Ndaj linkun e klientit"}>
        <Ikona emri={kopjuar ? "rregull" : "ndaj"} madhesia={22} />
      </button>
    );
  }
  return (
    <button type="button" className="row row--button row--icon" onClick={ndaj}>
      <span className="row__icon" style={{ "--icon-bg": "#0a84ff" } as React.CSSProperties}><Ikona emri="link" madhesia={17} /></span>
      <span className="row__main"><span className="row__title">{kopjuar ? "Linku u kopjua ✓" : "Ndaj ose kopjo linkun"}</span></span>
      <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
    </button>
  );
}
