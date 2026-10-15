import Link from "next/link";
import type { Riparim } from "@/lib/riparimet";
import { StatusPill } from "@/components/Statusi";

export function KartaRiparimi({ riparim }: { riparim: Riparim }) {
  return (
    <Link className="repair-card" href={`/riparimi/${riparim.id}`}>
      <div className="repair-card__top">
        <h2>{riparim.pajisja}</h2>
        <StatusPill statusi={riparim.statusi} />
      </div>
      <p className="muted">{riparim.problemi}</p>
      {riparim.shtese && (
        <p className="notice">Kosto shtesë pret miratimin tënd</p>
      )}
      <div className="repair-card__meta">
        <span>Dorëzuar {riparim.dorezuar}</span>
        <span className="price">{riparim.cmimi} €</span>
      </div>
      <span className="repair-card__more">Shiko detajet →</span>
    </Link>
  );
}
