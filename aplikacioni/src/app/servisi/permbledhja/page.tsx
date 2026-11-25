import { redirect } from "next/navigation";
import { Ikona } from "@/components/Ikona";
import { Nav, PageTitle } from "@/components/Nav";
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

  const ngjyra = (c: string) => ({ "--icon-bg": c }) as React.CSSProperties;

  return (
    <main>
      <Nav />
      <PageTitle titulli="Përmbledhja" nentitulli="7 ditët e fundit" />

      <section className="tiles stats" aria-label="Shifrat kryesore">
        <div className="tile stat"><span className="tile__icon" style={ngjyra("#0a84ff")}><Ikona emri="shto" madhesia={16} trashesia={2.6} /></span><p className="tile__value">{p.javaRiparime}</p><p className="tile__label stat__label">Riparime të reja</p></div>
        <div className="tile stat"><span className="tile__icon" style={ngjyra("#ff9f0a")}><Ikona emri="celes" madhesia={15} /></span><p className="tile__value">{p.neServis}</p><p className="tile__label stat__label">Në servis tani</p></div>
        <div className="tile stat"><span className="tile__icon" style={ngjyra("#34c759")}><Ikona emri="euro" madhesia={16} /></span><p className="tile__value">{fmt.format(p.hyrjaJava)} €</p><p className="tile__label stat__label">Të ardhura të mbyllura</p></div>
        <div className="tile stat"><span className="tile__icon" style={ngjyra("#5856d6")}><Ikona emri="ore" madhesia={16} /></span><p className="tile__value">{p.diteMesatare ?? "–"}</p><p className="tile__label stat__label">Ditë deri në “Gati”</p></div>
      </section>

      <section className={`card hypothesis hypothesis--${gjendjaHipotezes}`} aria-label="Hipoteza e projektit">
        <p className="status-card__label">Hipoteza e projektit</p>
        <h2 style={{ marginTop: 4 }}>Linku i kursen klientit telefonatën “a u bë gati?”</h2>
        <div className="hypothesis__row">
          <p className="hypothesis__value">{p.pershtypje.gjithsej ? `${perqindja}%` : "–"}</p>
          <p>{p.pershtypje.po} nga {p.pershtypje.gjithsej} klientë thanë “Po” pas marrjes.</p>
        </div>
        <div className="meter" aria-hidden="true">
          <span className="meter__fill" style={{ width: `${perqindja}%` }} />
          <span className="meter__goal" />
        </div>
        <div className="meter__legend"><span>0%</span><span style={{ marginLeft: "auto", marginRight: "14%" }}>pragu 80%</span><span>100%</span></div>
        <p className={`hypothesis__verdict badge tone--${gjendjaHipotezes === "po" ? "gati" : gjendjaHipotezes === "jo" ? "warn" : "marre"}`}>
          {gjendjaHipotezes === "pak" ? `Ende pak përgjigje (${p.pershtypje.gjithsej}/5)`
            : gjendjaHipotezes === "po" ? "Hipoteza mbështetet"
            : "Nuk mbështetet ende"}
        </p>
      </section>

      <section className="card" aria-label="Riparime sipas ditës">
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

      <section className="group" aria-label="Në servis sipas statusit">
        <div className="group__head"><h2>Në servis sipas statusit</h2></div>
        <div className="group__body">
          {p.sipasStatusit.length === 0 ? (
            <div className="row"><span className="row__sub">Asnjë telefon në servis.</span></div>
          ) : (
            <>
              <div className="row row--stack">
                <div className="stack" aria-hidden="true" style={{ marginTop: 4 }}>
                  {p.sipasStatusit.map((s) => (
                    <span key={s.statusi} className={`stack__seg tone--${NGJYRA[s.statusi]}`} style={{ width: `${(s.numri / gjithsej) * 100}%` }} />
                  ))}
                </div>
              </div>
              {p.sipasStatusit.map((s) => (
                <div key={s.statusi} className="row">
                  <span className={`dot tone--${NGJYRA[s.statusi]}`} aria-hidden="true" />
                  <span className="row__main"><span className="row__title">{s.statusi}</span></span>
                  <span className="row__value">{s.numri}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <section className="group" aria-label="Kosto shtesë">
        <div className="group__body">
          <div className="row"><span className="row__main"><span className="row__title">Kosto shtesë të miratuara</span><span className="row__sub">gjithsej</span></span><span className="row__value row__value--strong">{fmt.format(p.shteseMiratuar)} €</span></div>
        </div>
        <p className="group__foot">Para që pa aplikacion do të humbnin ose do të kërkoheshin me telefon.</p>
      </section>
    </main>
  );
}
