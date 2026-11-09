import Link from "next/link";
import Hyrja from "@/components/Hyrja";
import { Marka } from "@/components/Marka";
import { KartaRiparimi } from "@/components/KartaRiparimi";
import { lexoRiparimet, type Riparim } from "@/lib/riparimet";
import { profiliIm } from "@/lib/servisi";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = {
  ndaluar: "Vetëm stafi i servisit mund ta bëjë këtë veprim.",
};

export default async function Servisi({ searchParams }: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  let p;
  let riparimet: Riparim[] = [];
  try {
    p = await profiliIm();
    if (p?.roli === "servis") riparimet = await lexoRiparimet();
  } catch {
    return (
      <main>
        <h1>Servisi</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link className="action" href="/servisi">Provo përsëri</Link>
      </main>
    );
  }

  if (!p) {
    return (
      <main>
        <Marka />
        <header className="hero">
          <p className="label">Për stafin</p>
          <h1 className="display">Hyrja për servisin</h1>
          <p className="lead">Regjistro riparimet në banak, ndrysho statusin dhe dërgoja klientit koston shtesë.</p>
        </header>
        <Hyrja brenda={false} />
        <p className="footer-link"><Link href="/">← Je klient? Hape linkun e riparimit</Link></p>
      </main>
    );
  }

  if (p.roli !== "servis") {
    return (
      <main>
        <Marka />
        <header className="hero">
          <h1>Llogaria nuk është ende e stafit</h1>
          <p className="lead">Përshëndetje, {p.emri}.</p>
        </header>
        <p className="muted">Pronari i servisit duhet ta aktivizojë llogarinë{p.email ? <> për <code>{p.email}</code></> : null}.</p>
        <Hyrja brenda />
      </main>
    );
  }

  const aktive = riparimet.filter((r) => r.statusi !== "Marrë");
  const mbyllura = riparimet.filter((r) => r.statusi === "Marrë");

  return (
    <main>
      <div className="title-row">
        <Marka href="/servisi" />
        <Hyrja brenda />
      </div>
      <header className="page-head">
        <h1>Riparimet</h1>
        <p className="muted">{aktive.length === 1 ? "1 telefon" : `${aktive.length} telefona`} në servis</p>
      </header>
      {m && mesazhet[m] && <p role="alert">{mesazhet[m]}</p>}
      <Link className="action action--block" href="/servisi/i-ri">+ Regjistro riparim</Link>
      {aktive.length === 0 ? (
        <p className="empty">Asnjë telefon në servis. Regjistro riparimin kur klienti sjell telefonin.</p>
      ) : (
        <div className="repair-list">
          {aktive.map((r) => <KartaRiparimi key={r.id} riparim={r} />)}
        </div>
      )}
      {mbyllura.length > 0 && (
        <section className="closed-list">
          <h2 className="label">Të mbyllura së fundmi</h2>
          <div className="repair-list repair-list--closed">
            {mbyllura.slice(0, 10).map((r) => <KartaRiparimi key={r.id} riparim={r} />)}
          </div>
        </section>
      )}
    </main>
  );
}
