import Link from "next/link";
import type { Riparim } from "@/lib/riparimet";
import { StatusPill } from "@/components/Statusi";

export function KartaRiparimi({ riparim }: { riparim: Riparim }) {
  return (
    <Link className="repair-card" href={`/servisi/riparimi/${riparim.id}`}>
      <div className="repair-card__top">
        <h2>{riparim.pajisja}</h2>
        <StatusPill statusi={riparim.statusi} />
      </div>
      <p className="muted">{riparim.problemi}</p>
      {riparim.shtese?.vendimi === "pritje" && (
        <p className="notice">Kosto shtesë · pret klientin</p>
      )}
      <div className="repair-card__meta">
        <span>Nr. {riparim.id} · {riparim.dorezuar}</span>
        <span className="price">{riparim.cmimi} €</span>
      </div>
    </Link>
  );
}
