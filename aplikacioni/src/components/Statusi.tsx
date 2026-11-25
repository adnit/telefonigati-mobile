import { Ikona, type EmriIkones } from "@/components/Ikona";
import type { Statusi } from "@/lib/riparimet";

const HAPAT: Statusi[] = ["Pranuar", "Në riparim", "Gati për marrje"];

export const TONI: Record<Statusi, string> = {
  Pranuar: "pranuar",
  "Në riparim": "riparim",
  "Gati për marrje": "gati",
  Marrë: "marre",
};

export const IKONA_E_STATUSIT: Record<Statusi, EmriIkones> = {
  Pranuar: "kuti",
  "Në riparim": "celes",
  "Gati për marrje": "rregull",
  Marrë: "qese",
};

// Hapi i radhës që stafi bën më shpesh: një prekje në vend të zgjedhjes nga lista.
export const HAPI_TJETER: Partial<Record<Statusi, { statusi: Statusi; emri: string }>> = {
  Pranuar: { statusi: "Në riparim", emri: "Fillo riparimin" },
  "Në riparim": { statusi: "Gati për marrje", emri: "Shëno gati për marrje" },
};

export function StatusPill({ statusi }: { statusi: Statusi }) {
  return (
    <span className={`badge tone--${TONI[statusi]}`}>
      <span className="badge__dot" aria-hidden="true" />
      {statusi}
    </span>
  );
}

// Koka e kartës së statusit: ikona me ngjyrën e statusit dhe statusi i madh.
export function StatusKryesor({ statusi, etiketa = "Statusi tani", vlera, koha, live = false }: {
  statusi: Statusi; etiketa?: string; vlera?: string; koha?: React.ReactNode; live?: boolean;
}) {
  return (
    <div className={`status-card__top tone--${TONI[statusi]}`}>
      <span className="status-card__icon"><Ikona emri={IKONA_E_STATUSIT[statusi]} madhesia={26} trashesia={2.2} /></span>
      <div>
        <p className="status-card__label">{etiketa}</p>
        <p className="status-card__value status-hero__value">{vlera ?? statusi}</p>
        {koha && <p className="status-card__time">{live && <span className="live-dot" aria-hidden="true" />}{koha}</p>}
      </div>
    </div>
  );
}

// Tri hapat si shirit progresi. "Marrë" nuk është në shirit: riparimi ka kaluar të tre hapat.
export function StatusHapat({ statusi, kohet = {} }: { statusi: Statusi; kohet?: Partial<Record<Statusi, string>> }) {
  const aktual = statusi === "Marrë" ? HAPAT.length - 1 : HAPAT.indexOf(statusi);
  const iKryer = (i: number) => i < aktual || aktual === HAPAT.length - 1;
  return (
    <ol className={`steps tone--${TONI[statusi === "Marrë" ? "Gati për marrje" : statusi]}`} aria-label={`Statusi: ${statusi}`}>
      {HAPAT.map((hapi, i) => (
        <li key={hapi} className={iKryer(i) ? "step step--done" : i === aktual ? "step step--current" : "step"}
          aria-current={i === aktual ? "step" : undefined}>
          <span className="step__bar" aria-hidden="true" />
          <span className="step__label">{hapi === "Gati për marrje" ? "Gati" : hapi}</span>
          <span className="step__time">{iKryer(i) || i === aktual ? kohet[hapi] ?? "" : ""}</span>
        </li>
      ))}
    </ol>
  );
}
