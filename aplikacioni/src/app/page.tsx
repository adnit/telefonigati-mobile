import Link from "next/link";
import { redirect } from "next/navigation";
import { ButoniLlogarise } from "@/components/ButoniLlogarise";
import Hyrja from "@/components/Hyrja";
import { Ikona } from "@/components/Ikona";
import { Nav, PageTitle } from "@/components/Nav";
import { IKONA_E_STATUSIT, TONI } from "@/components/Statusi";
import { lexoRiparimetEMia } from "@/lib/klienti";
import { numeroPunen } from "@/lib/riparimet";
import { eshteStaf, profiliIm } from "@/lib/servisi";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = {
  kodi: "Ky link nuk është i vlefshëm. Kërkoja servisit linkun e riparimit.",
  "llogaria-fshire": "Llogaria u fshi. Linqet e riparimeve vazhdojnë të punojnë.",
};

// Klienti zakonisht hyn drejtpërdrejt nga linku që i dërgon servisi.
async function hapKodin(formData: FormData) {
  "use server";
  const v = String(formData.get("kodi") ?? "").trim();
  // Pranon edhe linkun e plotë, jo vetëm kodin.
  const kodi = v.match(/[0-9a-f]{32}/i)?.[0]?.toLowerCase();
  redirect(kodi ? `/r/${kodi}` : "/?m=kodi");
}

const PIKAT = [
  { ikona: "ore" as const, titulli: "Statusi në kohë reale", teksti: "Shiko kur telefoni hyn në riparim dhe kur del gati." },
  { ikona: "euro" as const, titulli: "Kosto shtesë pa telefonata", teksti: "Mirato ose refuzo me një prekje." },
  { ikona: "zile" as const, titulli: "Njoftim kur është gati", teksti: "Pa e hapur faqen dhe pa thirrur servisin." },
];

function Mesazhi({ m }: { m?: string }) {
  if (!m || !mesazhet[m]) return null;
  const ok = m === "llogaria-fshire";
  return <p className={`alert${ok ? " alert--ok" : ""}`} role="alert"><Ikona emri={ok ? "rregull" : "kujdes"} madhesia={18} />{mesazhet[m]}</p>;
}

function FushaELinkut({ dytesore = false }: { dytesore?: boolean }) {
  return (
    <form action={hapKodin}>
      <div className="group">
        {dytesore && <div className="group__head"><h2>Ke një link riparimi?</h2></div>}
        <div className="group__body">
          <div className={dytesore ? "inline-form" : "field"}>
            {!dytesore && <label htmlFor="kodi">Linku ose kodi i riparimit</label>}
            <input id="kodi" name="kodi" className={dytesore ? "input" : undefined} aria-label={dytesore ? "Linku ose kodi i riparimit" : undefined}
              autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              enterKeyHint="go" required placeholder="Ngjite linkun nga servisi" />
            {dytesore && <button className="btn btn--tinted btn--small" type="submit">Hap</button>}
          </div>
        </div>
      </div>
      {!dytesore && <button className="btn btn--primary btn--block btn--large" type="submit">Shiko riparimin</button>}
    </form>
  );
}

// Faqja e parë: pa llogari tregon ekranin e mirëseardhjes; me llogari, kush je dhe ku mund të shkosh.
export default async function Home({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const p = await profiliIm().catch(() => null);

  if (!p) {
    return (
      <main className="welcome">
        <div className="welcome__body">
          <header className="welcome__head">
            <span className="welcome__icon"><Ikona emri="telefonGati" madhesia={70} trashesia={1.5} /></span>
            <h1>Ku është telefoni yt tani?</h1>
            <p>Ndiq riparimin nga telefoni, pa e thirrur servisin.</p>
          </header>
          <div className="welcome__points">
            {PIKAT.map((x) => (
              <div key={x.titulli} className="welcome__point">
                <Ikona emri={x.ikona} madhesia={30} trashesia={1.8} />
                <div><strong>{x.titulli}</strong><span>{x.teksti}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="welcome__actions">
          <Mesazhi m={m} />
          <FushaELinkut />
          <div className="welcome__alt">
            <Link className="btn btn--plain" href="/llogaria"><Ikona emri="njeri" madhesia={18} />Riparimet e mia</Link>
            <Link className="btn btn--plain" href="/servisi"><Ikona emri="celes" madhesia={18} />Jam staf</Link>
          </div>
        </div>
      </main>
    );
  }

  const staf = eshteStaf(p);
  // Stafi sheh panelin e servisit; "Riparimet e mia" është vetëm për llogaritë e klientëve.
  const [puna, teMiat] = await Promise.all([
    staf ? numeroPunen().catch(() => null) : null,
    staf ? [] : lexoRiparimetEMia(p.id).catch(() => []),
  ]);
  const teHapura = teMiat.filter((r) => r.statusi !== "Marrë");
  const emri = p.emri.split(" ")[0];

  return (
    <main>
      <Nav djathtas={<ButoniLlogarise emri={p.emri} />} />
      <PageTitle sipër="TelefoniGati" titulli={`Përshëndetje, ${emri}`}
        nentitulli={staf ? (p.roli === "pronar" ? "Pronar i servisit" : "Staf i servisit") : "Llogari klienti"} />
      <Mesazhi m={m} />

      {staf && (
        <section className="card home-card" aria-label="Paneli i servisit">
          <div className="home-card__top">
            <span className="home-card__icon"><Ikona emri="celes" madhesia={22} /></span>
            <div>
              <h2>Paneli i servisit</h2>
              {puna && (
                <p className="card__sub">
                  {puna.neServis} në servis · {puna.gati} gati për marrje{puna.pret > 0 ? ` · ${puna.pret} presin klientin` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="btn-row">
            <Link className="btn btn--primary" href="/servisi">Hap panelin</Link>
            <Link className="btn btn--tinted" href="/servisi/i-ri"><Ikona emri="shto" madhesia={18} trashesia={2.6} />Riparim i ri</Link>
          </div>
        </section>
      )}

      {!staf && (
        <section className="group" aria-label="Riparimet e mia">
          <div className="group__head"><h2>Riparimet e mia</h2>{teMiat.length > 0 && <Link href="/llogaria" className="group__link">Të gjitha</Link>}</div>
          <div className="group__body">
            {teHapura.length === 0 ? (
              <div className="row row--icon">
                <span className="row__icon" style={{ "--icon-bg": "#8e8e93" } as React.CSSProperties}><Ikona emri="link" madhesia={16} /></span>
                <span className="row__main">
                  <span className="row__title">{teMiat.length ? "Asnjë riparim i hapur" : "Asnjë riparim i ruajtur"}</span>
                  <span className="row__sub">Hape linkun që të dërgoi servisi dhe prek “Ruaje te Riparimet e mia”.</span>
                </span>
              </div>
            ) : teHapura.slice(0, 4).map((r) => (
              <Link key={r.id} className={`row row--link repair tone--${TONI[r.statusi]}`} href={`/r/${r.kodi}`}>
                <span className="repair__icon"><Ikona emri={IKONA_E_STATUSIT[r.statusi]} madhesia={21} /></span>
                <span className="row__main">
                  <span className="repair__title">{r.pajisja}</span>
                  <span className="row__sub">{r.statusi}</span>
                </span>
                <span className="repair__price">{r.totali} €</span>
                <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <FushaELinkut dytesore />

      <section className="group" aria-label="Llogaria">
        <div className="group__body">
          <Link className="row row--link row--icon" href="/llogaria">
            <span className="avatar" aria-hidden="true">{[...p.emri][0]?.toUpperCase()}</span>
            <span className="row__main"><span className="row__title">{p.emri}</span><span className="row__sub">{p.email ?? ""}</span></span>
            <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
          </Link>
          <Hyrja brenda pas="/" />
        </div>
      </section>
    </main>
  );
}
