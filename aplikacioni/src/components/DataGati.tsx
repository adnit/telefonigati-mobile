"use client";

import { useState } from "react";

export function pasDitesh(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD në orën lokale
}

// Fusha e datës me zgjedhje të shpejta: shumica e riparimeve dalin gati sot, nesër ose pas pak ditësh.
// Mund të kontrollohet nga jashtë (p.sh. kur çmimorja e plotëson vetë datën).
export function DataGati({ fillestare = "", vlera, ndrysho }: { fillestare?: string; vlera?: string; ndrysho?: (v: string) => void }) {
  const [brenda, setBrenda] = useState(fillestare);
  const v = vlera ?? brenda;
  const vendos = (x: string) => { setBrenda(x); ndrysho?.(x); };
  const zgjedhjet = [{ emri: "Sot", n: 0 }, { emri: "Nesër", n: 1 }, { emri: "3 ditë", n: 3 }, { emri: "1 javë", n: 7 }];
  return (
    <div className="field">
      <label htmlFor="gati_deri">Gati deri më</label>
      <input id="gati_deri" name="gati_deri" type="date" value={v} onChange={(e) => vendos(e.target.value)} />
      <div className="chips" style={{ marginTop: 6 }}>
        {zgjedhjet.map((z) => {
          const d = pasDitesh(z.n);
          return <button key={z.n} type="button" className="chip" aria-pressed={v === d} onClick={() => vendos(v === d ? "" : d)}>{z.emri}</button>;
        })}
      </div>
    </div>
  );
}
