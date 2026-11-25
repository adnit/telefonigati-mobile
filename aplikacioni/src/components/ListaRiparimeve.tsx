"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ikona } from "@/components/Ikona";
import { KartaRiparimi } from "@/components/KartaRiparimi";
import type { Riparim, Statusi } from "@/lib/riparimet";

// Radha e seksioneve: ajo që klienti po pret të marrë del e para.
const SEKSIONET: { statusi: Statusi; emri: string }[] = [
  { statusi: "Gati për marrje", emri: "Gati për marrje" },
  { statusi: "Në riparim", emri: "Në riparim" },
  { statusi: "Pranuar", emri: "Pranuar" },
];

// Kërkimi punon në telefon, pa i pyetur serverin: lista e servisit është e vogël.
export function ListaRiparimeve({ aktive, mbyllura }: { aktive: Riparim[]; mbyllura: Riparim[] }) {
  const [kerkimi, setKerkimi] = useState("");

  const q = kerkimi.trim().toLocaleLowerCase("sq");
  const perputhet = useMemo(() => (r: Riparim) => !q
    || r.pajisja.toLocaleLowerCase("sq").includes(q)
    || r.problemi.toLocaleLowerCase("sq").includes(q)
    || r.id === q.replace(/^nr\.?\s*/, ""), [q]);

  const pamja = aktive.filter(perputhet);
  const teMbyllura = mbyllura.filter(perputhet);
  const pret = pamja.filter((r) => r.shtese?.vendimi === "pritje").length;

  if (aktive.length === 0 && mbyllura.length === 0) {
    return (
      <div className="empty">
        <Ikona emri="celular" madhesia={44} trashesia={1.5} />
        <strong>Asnjë telefon në servis</strong>
        <p>Regjistro riparimin kur klienti sjell telefonin në banak.</p>
        <Link className="btn btn--primary" href="/servisi/i-ri"><Ikona emri="shto" />Riparim i ri</Link>
      </div>
    );
  }

  return (
    <>
      <label className="search">
        <Ikona emri="kerko" madhesia={17} trashesia={2.2} />
        <input type="search" value={kerkimi} onChange={(e) => setKerkimi(e.target.value)}
          placeholder="Kërko pajisjen, problemin ose nr." aria-label="Kërko riparimet" enterKeyHint="search" />
      </label>

      {pret > 0 && !q && (
        <p className="group__foot" style={{ margin: "-8px 0 14px", padding: "0 4px" }}>
          {pret === 1 ? "1 riparim pret" : `${pret} riparime presin`} vendimin e klientit për koston shtesë.
        </p>
      )}

      {pamja.length === 0 && teMbyllura.length === 0 && (
        <div className="empty"><Ikona emri="kerko" madhesia={36} trashesia={1.6} /><p>Asnjë riparim nuk përputhet me “{kerkimi}”.</p></div>
      )}

      {SEKSIONET.map((s) => {
        const lista = pamja.filter((r) => r.statusi === s.statusi);
        if (lista.length === 0) return null;
        return (
          <section key={s.statusi} className="group" aria-label={s.emri}>
            <div className="group__head"><h2>{s.emri}</h2><span className="group__count">{lista.length}</span></div>
            <div className="group__body">{lista.map((r) => <KartaRiparimi key={r.id} riparim={r} />)}</div>
          </section>
        );
      })}

      {teMbyllura.length > 0 && (
        <details className="group" open={Boolean(q)}>
          <summary className="group__head">
            <h2>Të mbyllura së fundmi</h2>
            <span className="group__count">{teMbyllura.length} <Ikona emri="djathtas" madhesia={14} trashesia={2.4} className="chev" /></span>
          </summary>
          <div className="group__body">{teMbyllura.slice(0, 15).map((r) => <KartaRiparimi key={r.id} riparim={r} />)}</div>
        </details>
      )}
    </>
  );
}
