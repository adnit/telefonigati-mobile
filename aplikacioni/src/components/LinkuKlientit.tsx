"use client";

import { useState } from "react";

// Linku privat që servisi ia jep klientit në banak (Viber, SMS ose kopjim).
export function LinkuKlientit({ shtegu, kompakt = false }: { shtegu: string; kompakt?: boolean }) {
  const [mesazhi, setMesazhi] = useState("");

  async function ndaj() {
    const url = new URL(shtegu, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Riparimi në TelefoniGati", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMesazhi("Linku u kopjua.");
    } catch {
      // Anulimi i ndarjes nuk është gabim; kopjimi mund të mos lejohet.
      setMesazhi("Kopjoje linkun nga fusha më poshtë.");
    }
  }

  if (kompakt) {
    return (
      <button className="action action--quiet" onClick={ndaj} title={mesazhi || undefined}>
        {mesazhi === "Linku u kopjua." ? "U kopjua ✓" : "Ndaj linkun"}
      </button>
    );
  }

  return (
    <div className="share">
      <button className="action action--quiet action--block" onClick={ndaj}>Ndaj ose kopjo linkun</button>
      <p className="muted share__url">{shtegu}</p>
      <p className="muted" role="status">{mesazhi}</p>
    </div>
  );
}
