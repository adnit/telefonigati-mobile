"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";


// Pyet serverin çdo disa sekonda (5 si parazgjedhje) nëse ka ndryshuar diçka dhe rifreskon faqen vetëm atëherë.
// Ndalet kur faqja është në sfond ose pa internet, që të mos harxhojë bateri e të dhëna.
export function Live({ url, versioni, intervali = 5000 }: { url: string; versioni: string; intervali?: number }) {
  const router = useRouter();
  const iFundit = useRef(versioni);

  useEffect(() => {
    iFundit.current = versioni;
  }, [versioni]);

  useEffect(() => {
    let aktiv = true;
    async function kontrollo() {
      if (!aktiv || document.visibilityState !== "visible" || !navigator.onLine) return;
      try {
        const res = await fetch(url, { cache: "no-store" });
        // 404: riparimi nuk ekziston më (p.sh. u fshi); 429: shumë prova. Pyetjet ndalen, që faqja e hapur
        // të mos numërohet si kod i gabuar çdo pak sekonda dhe të bllokojë rrjetin (p.sh. Wi-Fi-n e servisit).
        if (res.status === 404 || res.status === 429) {
          aktiv = false;
          window.clearInterval(id);
          document.removeEventListener("visibilitychange", kontrollo);
          return;
        }
        if (!res.ok) return;
        const { v } = (await res.json()) as { v: string };
        if (aktiv && v !== iFundit.current) {
          iFundit.current = v;
          router.refresh();
        }
      } catch {
        // Rrjeti ra: provojmë sërish në raundin tjetër.
      }
    }
    const id: number = window.setInterval(kontrollo, intervali);
    document.addEventListener("visibilitychange", kontrollo);
    return () => {
      aktiv = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", kontrollo);
    };
  }, [url, router, intervali]);

  return null;
}
