import type { Statusi } from "@/lib/riparimet";

const HAPAT: Statusi[] = ["Pranuar", "Në riparim", "Gati për marrje"];

const TONI: Record<Statusi, string> = {
  Pranuar: "pranuar",
  "Në riparim": "riparim",
  "Gati për marrje": "gati",
  Marrë: "marre",
};

export function StatusPill({ statusi }: { statusi: Statusi }) {
  return (
    <span className={`pill pill--${TONI[statusi]}`}>
      <span className="pill__dot" aria-hidden="true" />
      {statusi}
    </span>
  );
}

// Statusi i madh që klienti kërkon me sy: ku është telefoni tani.
export function StatusKryesor({ statusi, perditesuar }: { statusi: Statusi; perditesuar: string }) {
  return (
    <div className={`status-hero status-hero--${TONI[statusi]}`}>
      <p className="label">Statusi tani</p>
      <p className="status-hero__value">
        <span className="status-hero__dot" aria-hidden="true" />
        {statusi}
      </p>
      <p className="status-hero__time">Përditësuar {perditesuar}</p>
    </div>
  );
}

// Tri hapat si shirit progresi: hapat para statusit aktual janë të kryer;
// "Gati për marrje" është i fundit, prandaj aty janë të tre të plotë.
export function StatusHapat({ statusi, kohet = {} }: { statusi: Statusi; kohet?: Partial<Record<Statusi, string>> }) {
  // "Marrë" nuk është në shirit: riparimi ka kaluar të tre hapat.
  const aktual = statusi === "Marrë" ? HAPAT.length - 1 : HAPAT.indexOf(statusi);
  const iKryer = (i: number) => i < aktual || aktual === HAPAT.length - 1;
  return (
    <ol className={`steps steps--${TONI[statusi]}`} aria-label={`Statusi: ${statusi}`}>
      {HAPAT.map((hapi, i) => (
        <li
          key={hapi}
          className={iKryer(i) ? "step step--done" : i === aktual ? "step step--current" : "step"}
          aria-current={i === aktual ? "step" : undefined}
        >
          <span className="step__bar" aria-hidden="true" />
          <span className="step__label">{hapi}</span>
          <span className="step__time">{iKryer(i) || i === aktual ? kohet[hapi] ?? "" : ""}</span>
        </li>
      ))}
    </ol>
  );
}
