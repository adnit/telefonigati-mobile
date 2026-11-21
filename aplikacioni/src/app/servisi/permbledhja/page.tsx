import { redirect } from "next/navigation";
import { lexoPermbledhjen } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

export const dynamic = "force-dynamic";

const NGJYRA: Record<string, string> = { Pranuar: "pranuar", "Në riparim": "riparim", "Gati për marrje": "gati" };

// Përmbledhja për pronarin: sa punë hyri, sa para doli dhe sa shpejt bëhen gati telefonat.
export default async function Permbledhja() {
  if (!(await vetemServisi())) redirect("/servisi");
  const p = await lexoPermbledhjen();
  const max = Math.max(1, ...p.ditet.map((d) => d.numri));
  const gjithsej = Math.max(1, p.sipasStatusit.reduce((a, s) => a + s.numri, 0));
  const fmt = new Intl.NumberFormat("sq-AL");
  const perqindja = p.pershtypje.gjithsej ? Math.round((p.pershtypje.po / p.pershtypje.gjithsej) * 100) : 0;
  // Si pragu i ligjëratës 1: 4 nga 5 me të paktën 5 përgjigje.
  const gjendjaHipotezes = p.pershtypje.gjithsej < 5 ? "pak" : perqindja >= 80 ? "po" : "jo";

  return (
    <main>
      <header className="page-head">
        <p className="label">7 ditët e fundit</p>
        <h1>Përmbledhja</h1>
      </header>

      <section className="stats">
        <div className="stat"><p className="stat__label">Riparime të reja</p><p className="stat__value">{p.javaRiparime}</p></div>
        <div className="stat"><p className="stat__label">Në servis tani</p><p className="stat__value">{p.neServis}</p></div>
        <div className="stat"><p className="stat__label">Të ardhura të mbyllura</p><p className="stat__value">{fmt.format(p.hyrjaJava)} €</p></div>
        <div className="stat"><p className="stat__label">Ditë deri në “Gati”</p><p className="stat__value">{p.diteMesatare ?? "–"}</p></div>
      </section>

      <section className={`panel hypothesis hypothesis--${gjendjaHipotezes}`}>
        <p className="label">Hipoteza e projektit</p>
        <h2>Linku i kursen klientit telefonatën “a u bë gati?”</h2>
        <div className="hypothesis__row">
          <p className="hypothesis__value">{p.pershtypje.gjithsej ? `${perqindja}%` : "–"}</p>
          <p className="muted">
            {p.pershtypje.po} nga {p.pershtypje.gjithsej} klientë thanë “Po” pas marrjes.
            Pragu: 80% (4 nga 5) me të paktën 5 përgjigje.
          </p>
        </div>
        <div className="meter" aria-hidden="true">
          <span className="meter__fill" style={{ width: `${perqindja}%` }} />
          <span className="meter__goal" />
        </div>
        <p className="hypothesis__verdict">
          {gjendjaHipotezes === "pak" ? `Ende pak përgjigje (${p.pershtypje.gjithsej}/5).`
            : gjendjaHipotezes === "po" ? "Hipoteza mbështetet nga përgjigjet."
            : "Hipoteza nuk mbështetet ende: duhet parë pse."}
        </p>
      </section>

      <section className="panel">
        <h2>Riparime të pranuara sipas ditës</h2>
        <div className="bars" role="img" aria-label={p.ditet.map((d) => `${d.dita}: ${d.numri}`).join(", ")}>
          {p.ditet.map((d, i) => (
            <div key={i} className="bars__col">
              <span className="bars__n">{d.numri || ""}</span>
              <span className="bars__bar" style={{ height: `${(d.numri / max) * 100}%` }} />
              <span className="bars__day">{d.dita}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Në servis sipas statusit</h2>
        {p.sipasStatusit.length === 0 ? (
          <p className="muted">Asnjë telefon në servis.</p>
        ) : (
          <>
            <div className="stack" aria-hidden="true">
              {p.sipasStatusit.map((s) => (
                <span key={s.statusi} className={`stack__seg stack__seg--${NGJYRA[s.statusi]}`}
                  style={{ width: `${(s.numri / gjithsej) * 100}%` }} />
              ))}
            </div>
            <dl className="facts facts--legend">
              {p.sipasStatusit.map((s) => (
                <div key={s.statusi}>
                  <dt><span className={`dot dot--${NGJYRA[s.statusi]}`} />{s.statusi}</dt>
                  <dd>{s.numri}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <section className="panel">
        <dl className="facts">
          <div><dt>Kosto shtesë të miratuara (gjithsej)</dt><dd className="price">{fmt.format(p.shteseMiratuar)} €</dd></div>
        </dl>
        <p className="hint">Para që sot servisi do t&apos;i kishte humbur ose do t&apos;i kishte kërkuar me telefon.</p>
      </section>
    </main>
  );
}
