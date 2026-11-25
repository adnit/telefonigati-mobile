import Link from "next/link";
import Hyrja from "@/components/Hyrja";
import { FshiLlogarine } from "@/components/FshiLlogarine";
import { Ikona } from "@/components/Ikona";
import { Nav, PageTitle } from "@/components/Nav";
import { IKONA_E_STATUSIT, TONI } from "@/components/Statusi";
import { ZgjedhTemen } from "@/components/Tema";
import { Toast } from "@/components/Toast";
import { lexoRiparimetEMia, type RiparimIRuajtur } from "@/lib/klienti";
import { eshteStaf, profiliIm } from "@/lib/servisi";
import { hiqRiparimin } from "./actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = { hequr: "U hoq nga lista. Linku i riparimit vazhdon të punojë." };

// Llogaria opsionale e klientit: "Riparimet e mia" në çdo pajisje. Pa llogari, linku privat punon njësoj.
export default async function Llogaria({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const p = await profiliIm().catch(() => null);

  if (!p) {
    return (
      <main className="welcome">
        <Nav prapa={{ href: "/", emri: "Faqja kryesore" }} />
        <div className="welcome__body" style={{ paddingTop: 0 }}>
          <header className="welcome__head">
            <span className="welcome__icon"><Ikona emri="njeri" madhesia={44} trashesia={1.8} /></span>
            <h1>Riparimet e mia</h1>
            <p>Llogaria është opsionale. Linku që të dërgon servisi punon edhe pa të.</p>
          </header>
          <div className="welcome__points">
            <div className="welcome__point"><Ikona emri="lista" madhesia={30} trashesia={1.8} /><div><strong>Të gjitha riparimet në një vend</strong><span>Edhe kur ke humbur mesazhin me linkun.</span></div></div>
            <div className="welcome__point"><Ikona emri="celular" madhesia={30} trashesia={1.8} /><div><strong>Në çdo pajisje</strong><span>Hyr nga telefoni ose kompjuteri dhe i gjen aty.</span></div></div>
            <div className="welcome__point"><Ikona emri="mbyll" madhesia={30} trashesia={1.8} /><div><strong>Ti vendos</strong><span>Ruan vetëm riparimet që zgjedh; llogarinë e fshin kur të duash.</span></div></div>
          </div>
        </div>
        <div className="welcome__actions">
          <Hyrja brenda={false} pas="/llogaria" />
          <Link className="btn btn--plain" href="/">Vazhdo pa llogari</Link>
        </div>
      </main>
    );
  }

  const riparimet = await lexoRiparimetEMia(p.id);
  const aktive = riparimet.filter((r) => r.statusi !== "Marrë");
  const mbyllura = riparimet.filter((r) => r.statusi === "Marrë");

  return (
    <main>
      <Nav prapa={{ href: "/", emri: "Faqja kryesore" }} titulli="Riparimet e mia" />
      <PageTitle titulli="Riparimet e mia" nentitulli={`Përshëndetje, ${p.emri.split(" ")[0]}.`} />

      {riparimet.length === 0 ? (
        <div className="empty">
          <Ikona emri="link" madhesia={40} trashesia={1.6} />
          <strong>Asnjë riparim i ruajtur</strong>
          <p>Hape linkun që të dërgoi servisi dhe prek “Ruaje te Riparimet e mia”.</p>
        </div>
      ) : (
        <>
          {aktive.length > 0 && <Lista titulli="Në servis" riparimet={aktive} />}
          {mbyllura.length > 0 && <Lista titulli="Të marra" riparimet={mbyllura} />}
        </>
      )}

      {eshteStaf(p) && (
        <section className="group" aria-label="Servisi">
          <div className="group__body">
            <Link className="row row--link row--icon" href="/servisi">
              <span className="row__icon" style={{ "--icon-bg": "#1b9440" } as React.CSSProperties}><Ikona emri="celes" madhesia={16} /></span>
              <span className="row__main"><span className="row__title">Paneli i servisit</span></span>
              <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
            </Link>
          </div>
        </section>
      )}

      <section className="group" aria-label="Pamja">
        <div className="group__head"><h2>Pamja</h2></div>
        <div className="group__body"><div className="row"><span className="row__main"><ZgjedhTemen /></span></div></div>
      </section>

      <section className="group" aria-label="Llogaria">
        <div className="group__head"><h2>Llogaria</h2></div>
        <div className="group__body">
          <div className="row"><span className="row__main"><span className="row__title">{p.emri}</span><span className="row__sub">{p.email ?? ""}</span></span></div>
          <Hyrja brenda pas="/llogaria" />
          {p.roli === "vizitor" && <FshiLlogarine />}
        </div>
        <p className="group__foot">Ruajmë vetëm emrin, email-in dhe riparimet që zgjedh. Fshirja e llogarisë nuk prek riparimet në servis.</p>
      </section>

      {m && mesazhet[m] && <Toast mesazhi={mesazhet[m]} />}
    </main>
  );
}

function Lista({ titulli, riparimet }: { titulli: string; riparimet: RiparimIRuajtur[] }) {
  return (
    <section className="group" aria-label={titulli}>
      <div className="group__head"><h2>{titulli}</h2><span className="group__count">{riparimet.length}</span></div>
      <div className="group__body">
        {riparimet.map((r) => {
          const permbajtja = (
            <>
              <span className="repair__icon"><Ikona emri={IKONA_E_STATUSIT[r.statusi]} madhesia={21} /></span>
              <span className="row__main">
                <span className="repair__title">{r.pajisja}</span>
                <span className="row__sub row__sub--clamp">{r.statusi === "Marrë" ? `E more më ${r.marre}` : r.statusi}</span>
                <span className="row__meta">Nr. {r.id} · {r.dorezuar}</span>
              </span>
              <span className="repair__price">{r.totali} €</span>
            </>
          );
          return (
            <div key={r.id} className={`repair-row tone--${TONI[r.statusi]}`}>
              {r.linkAktiv ? (
                <Link className="row row--link repair" href={`/r/${r.kodi}`}>{permbajtja}<Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" /></Link>
              ) : (
                <div className="row repair">{permbajtja}</div>
              )}
              <form action={hiqRiparimin} className="repair-row__remove">
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="btn btn--gray btn--small btn--icon" aria-label={`Hiqe ${r.pajisja} nga lista`}>
                  <Ikona emri="mbyll" madhesia={13} trashesia={2.8} />
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}
