import type { Statusi } from "@/lib/riparimet";

const HAPAT: Statusi[] = ["Pranuar", "Në riparim", "Gati për marrje"];

const KLASA: Record<Statusi, string> = {
  Pranuar: "pill pill--pranuar",
  "Në riparim": "pill pill--riparim",
  "Gati për marrje": "pill pill--gati",
};

export function StatusPill({ statusi }: { statusi: Statusi }) {
  return <span className={KLASA[statusi]}>{statusi}</span>;
}

// Tri hapat e riparimit: hapat para statusit aktual shënohen si të kryer.
export function StatusHapat({ statusi }: { statusi: Statusi }) {
  const aktual = HAPAT.indexOf(statusi);
  // "Gati për marrje" është hapi i fundit: riparimi ka përfunduar.
  const iKryer = (i: number) => i < aktual || aktual === HAPAT.length - 1;
  return (
    <ol className="steps" aria-label={`Statusi: ${statusi}`}>
      {HAPAT.map((hapi, i) => (
        <li
          key={hapi}
          className={iKryer(i) ? "step step--done" : i === aktual ? "step step--current" : "step"}
          aria-current={i === aktual ? "step" : undefined}
        >
          <span className="step__dot" aria-hidden="true">{iKryer(i) ? "✓" : i + 1}</span>
          <span>{hapi}</span>
        </li>
      ))}
    </ol>
  );
}
