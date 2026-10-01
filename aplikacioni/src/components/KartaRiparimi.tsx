import Link from "next/link";
import type { Riparim } from "@/lib/riparimet";

export function KartaRiparimi({ riparim }: { riparim: Riparim }) {
  return (
    <article className="repair-card">
      <h2>{riparim.pajisja}</h2>
      <p>{riparim.problemi}</p>
      <p>Statusi: {riparim.statusi} · Çmimi: {riparim.cmimi} €</p>
      {riparim.shtese && <p>Kosto shtesë pret miratimin tënd.</p>}
      <Link className="action" href={`/riparimi/${riparim.id}`}>
        Shiko detajet
      </Link>
    </article>
  );
}
