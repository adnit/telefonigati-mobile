"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Mesazhi i konfirmimit pas një veprimi: hyn nga poshtë, qëndron 4 sekonda dhe largohet.
// Çdo ?m= i ri në adresë e shfaq sërish, edhe kur teksti është i njëjti me herën e kaluar.
// Pastaj ?m= hiqet nga adresa pa rifreskim, që një rifreskim i mëvonshëm të mos e shfaqë sërish.
export function Toast({ mesazhi, ton = "ok", children }: {
  mesazhi: string;
  ton?: "ok" | "gabim";
  children?: React.ReactNode; // p.sh. butoni "Zhbëj"
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const m = params.get("m");
  const [gjendja, setGjendja] = useState<"hyn" | "del" | "zhduket">("hyn");
  const kohematesit = useRef<number[]>([]);

  useEffect(() => {
    if (!m) return; // adresa u pastrua: mesazhi vazhdon deri sa t'i mbarojë koha
    const kohezgjatja = children ? 6000 : 4000; // më gjatë kur ka "Zhbëj"
    kohematesit.current.forEach((t) => window.clearTimeout(t));
    kohematesit.current = [
      window.setTimeout(() => setGjendja("hyn"), 0),
      window.setTimeout(() => setGjendja("del"), kohezgjatja),
      window.setTimeout(() => setGjendja("zhduket"), kohezgjatja + 220),
    ];
    const p = new URLSearchParams(params.toString());
    p.delete("m"); p.delete("nga");
    window.history.replaceState(null, "", p.size ? `${pathname}?${p}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  useEffect(() => () => kohematesit.current.forEach((t) => window.clearTimeout(t)), []);

  if (gjendja === "zhduket") return null;
  return (
    <div className={`toast toast--${ton}${gjendja === "del" ? " toast--out" : ""}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">{ton === "ok" ? "✓" : "!"}</span>
      <span className="toast__text">{mesazhi}</span>
      {children}
    </div>
  );
}
