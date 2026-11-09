import Link from "next/link";
import Hyrja from "@/components/Hyrja";
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
        <Link className="back" href="/">← Faqja kryesore</Link>
        <h1>Hyrja për servisin</h1>
        <p className="lead">Riparimet dhe statusin i sheh vetëm stafi i servisit.</p>
        <Hyrja brenda={false} />
      </main>
    );
  }

  if (p.roli !== "servis") {
    return (
      <main>
        <h1>Servisi</h1>
        <p className="lead">Përshëndetje, {p.emri}. Llogaria jote nuk është ende e stafit.</p>
        <p className="muted">Pronari i servisit duhet ta aktivizojë llogarinë. ID GitHub: <code>{p.id}</code></p>
        <Hyrja brenda />
      </main>
    );
  }

  return (
    <main>
      <div className="title-row">
        <h1>Riparimet</h1>
        <Hyrja brenda />
      </div>
      {m && mesazhet[m] && <p role="alert">{mesazhet[m]}</p>}
      <Link className="action action--block" href="/servisi/i-ri">+ Regjistro riparim</Link>
      {riparimet.length === 0 ? (
        <p className="empty">Nuk ka riparime ende. Regjistro të parin kur klienti sjell telefonin.</p>
      ) : (
        <div className="repair-list">
          {riparimet.map((r) => <KartaRiparimi key={r.id} riparim={r} />)}
        </div>
      )}
    </main>
  );
}
