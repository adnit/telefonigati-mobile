import Link from "next/link";
import { Ikona } from "@/components/Ikona";

// Ndërruesi Lista / Tabela mbi riparimet.
export function PamjaListes({ aktive }: { aktive: "lista" | "tabela" }) {
  return (
    <div className="segmented segmented--links" role="group" aria-label="Pamja e riparimeve">
      <Link href="/servisi" aria-pressed={aktive === "lista"} aria-current={aktive === "lista" ? "page" : undefined}><Ikona emri="lista" madhesia={16} />Lista</Link>
      <Link href="/servisi/tabela" aria-pressed={aktive === "tabela"} aria-current={aktive === "tabela" ? "page" : undefined}><Ikona emri="tabela" madhesia={16} />Tabela</Link>
    </div>
  );
}
