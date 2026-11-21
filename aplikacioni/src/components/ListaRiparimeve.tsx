"use client";

import { useMemo, useState } from "react";
import { KartaRiparimi } from "@/components/KartaRiparimi";
import type { Riparim } from "@/lib/riparimet";

type Filtri = "te-gjitha" | "Pranuar" | "Në riparim" | "Gati për marrje" | "pret";

const FILTRAT: { id: Filtri; emri: string }[] = [
  { id: "te-gjitha", emri: "Të gjitha" },
  { id: "Pranuar", emri: "Pranuar" },
  { id: "Në riparim", emri: "Në riparim" },
  { id: "Gati për marrje", emri: "Gati" },
  { id: "pret", emri: "Pret klientin" },
];

function perputhet(r: Riparim, f: Filtri) {
  if (f === "te-gjitha") return true;
  if (f === "pret") return r.shtese?.vendimi === "pritje";
  return r.statusi === f;
}

// Kërkimi dhe filtrat punojnë në telefon, pa i pyetur serverin: lista e servisit është e vogël.
export function ListaRiparimeve({ riparimet }: { riparimet: Riparim[] }) {
  const [kerkimi, setKerkimi] = useState("");
  const [filtri, setFiltri] = useState<Filtri>("te-gjitha");

  const pamja = useMemo(() => {
    const q = kerkimi.trim().toLocaleLowerCase("sq");
    return riparimet.filter((r) => perputhet(r, filtri) && (!q
      || r.pajisja.toLocaleLowerCase("sq").includes(q)
      || r.problemi.toLocaleLowerCase("sq").includes(q)
      || r.id === q.replace(/^nr\.?\s*/, "")));
  }, [riparimet, kerkimi, filtri]);

  return (
    <>
      <div className="search">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" value={kerkimi} onChange={(e) => setKerkimi(e.target.value)}
          placeholder="Kërko pajisjen, problemin ose nr." aria-label="Kërko riparimet" enterKeyHint="search" />
      </div>
      <div className="chips" role="group" aria-label="Filtro sipas statusit">
        {FILTRAT.map((f) => {
          const n = riparimet.filter((r) => perputhet(r, f.id)).length;
          return (
            <button key={f.id} type="button" className="chip" aria-pressed={filtri === f.id}
              onClick={() => setFiltri(f.id)}>
              {f.emri}<span className="chip__count">{n}</span>
            </button>
          );
        })}
      </div>
      {pamja.length === 0 ? (
        <p className="empty">Asnjë riparim nuk përputhet me kërkimin.</p>
      ) : (
        <div className="repair-list">
          {pamja.map((r) => <KartaRiparimi key={r.id} riparim={r} />)}
        </div>
      )}
    </>
  );
}
