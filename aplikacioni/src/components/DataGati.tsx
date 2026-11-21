"use client";

import { useState } from "react";

function pasDitesh(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD në orën lokale
}

// Fusha e datës me zgjedhje të shpejta: shumica e riparimeve dalin gati sot, nesër ose pas pak ditësh.
export function DataGati({ fillestare = "" }: { fillestare?: string }) {
  const [v, setV] = useState(fillestare);
  const zgjedhjet = [{ emri: "Sot", n: 0 }, { emri: "Nesër", n: 1 }, { emri: "3 ditë", n: 3 }, { emri: "1 javë", n: 7 }];
  return (
    <>
      <label htmlFor="gati_deri">Gati deri më (opsionale)</label>
      <div className="chips chips--tight">
        {zgjedhjet.map((z) => {
          const d = pasDitesh(z.n);
          return (
            <button key={z.n} type="button" className="chip" aria-pressed={v === d} onClick={() => setV(d)}>{z.emri}</button>
          );
        })}
      </div>
      <input id="gati_deri" name="gati_deri" type="date" value={v} onChange={(e) => setV(e.target.value)} />
    </>
  );
}
