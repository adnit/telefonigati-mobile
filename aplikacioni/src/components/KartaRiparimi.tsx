import Link from "next/link";
import { Ikona } from "@/components/Ikona";
import { IKONA_E_STATUSIT, TONI } from "@/components/Statusi";
import type { Riparim } from "@/lib/riparimet";

// Një rresht në listën e riparimeve: ngjyra dhe ikona tregojnë statusin; seksioni sipër e emërton.
export function KartaRiparimi({ riparim: r }: { riparim: Riparim }) {
  const pret = r.shtese?.vendimi === "pritje";
  return (
    <Link className={`row row--link repair tone--${TONI[r.statusi]}`} href={`/servisi/riparimi/${r.id}`}>
      <span className="repair__icon"><Ikona emri={IKONA_E_STATUSIT[r.statusi]} madhesia={21} /></span>
      <span className="row__main">
        <span className="repair__title">{r.pajisja}</span>
        <span className="row__sub row__sub--clamp">{r.problemi}</span>
        <span className="row__meta">Nr. {r.id} · {r.dorezuar}</span>
      </span>
      <span className="row__end">
        <span className="repair__price">{r.cmimi} €</span>
        {pret && <span className="badge tone--warn">Pret klientin</span>}
      </span>
      <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
    </Link>
  );
}
