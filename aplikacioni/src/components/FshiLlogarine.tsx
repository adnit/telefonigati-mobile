"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { fshiLlogarine } from "@/app/llogaria/actions";

// Fshirja e llogarisë kërkon konfirmim, sepse nuk zhbëhet. Pas fshirjes klienti del nga llogaria.
export function FshiLlogarine() {
  const [duke, setDuke] = useState(false);
  async function fshi() {
    if (!window.confirm("Ta fshijmë llogarinë dhe listën e riparimeve të ruajtura? Linqet e riparimeve vazhdojnë të punojnë.")) return;
    setDuke(true);
    const rez = await fshiLlogarine().catch(() => ({ ok: false }));
    if (rez.ok) await signOut({ callbackUrl: "/?m=llogaria-fshire" });
    else setDuke(false);
  }
  return (
    <button type="button" className="row row--button row--danger" onClick={fshi} disabled={duke}>
      {duke ? "Po fshihet…" : "Fshi llogarinë"}
    </button>
  );
}
