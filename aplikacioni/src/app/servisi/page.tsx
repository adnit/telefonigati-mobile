import Link from "next/link";
import Hyrja from "@/components/Hyrja";
import { Ikona } from "@/components/Ikona";
import { Live } from "@/components/Live";
import { Nav, PageTitle } from "@/components/Nav";
import { Toast } from "@/components/Toast";
import { ListaRiparimeve } from "@/components/ListaRiparimeve";
import { PamjaListes } from "@/components/PamjaListes";
import { lexoRiparimet, versioniIListes, type Riparim } from "@/lib/riparimet";
import { eshteStaf, profiliIm } from "@/lib/servisi";

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
  let versioni = "";
  try {
    p = await profiliIm();
    if (eshteStaf(p)) [riparimet, versioni] = await Promise.all([lexoRiparimet(), versioniIListes()]);
  } catch {
    return (
      <main>
        <Nav />
        <div className="card card--center" style={{ marginTop: 40 }}>
          <h1 style={{ fontSize: "1.375rem" }}>Pa lidhje me databazën</h1>
          <p className="card__sub" role="alert">Provo përsëri pas pak.</p>
          <Link className="btn btn--primary" href="/servisi">Provo përsëri</Link>
        </div>
      </main>
    );
  }

  if (!p) {
    return (
      <main className="welcome">
        <div className="welcome__body">
          <header className="welcome__head">
            <span className="welcome__icon"><Ikona emri="celes" madhesia={40} trashesia={2.2} /></span>
            <h1>Hyrja për servisin</h1>
            <p>Regjistro riparimet në banak dhe mbaje klientin në dijeni pa telefonata.</p>
          </header>
          <div className="welcome__points">
            <div className="welcome__point"><Ikona emri="shto" madhesia={30} trashesia={1.8} /><div><strong>Pranimi në sekonda</strong><span>Marka, modeli dhe çmimi me disa prekje.</span></div></div>
            <div className="welcome__point"><Ikona emri="tabela" madhesia={30} trashesia={1.8} /><div><strong>Tabela e punës</strong><span>Çdo telefon, nga pranimi te marrja.</span></div></div>
            <div className="welcome__point"><Ikona emri="link" madhesia={30} trashesia={1.8} /><div><strong>Linku i klientit</strong><span>Me WhatsApp ose QR, pa llogari për klientin.</span></div></div>
          </div>
        </div>
        <div className="welcome__actions">
          <Hyrja brenda={false} />
          <Link className="btn btn--plain" href="/">Jam klient</Link>
        </div>
      </main>
    );
  }

  if (!eshteStaf(p)) {
    return (
      <main>
        <section className="hero" style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}>
          <span className="avatar avatar--lg" aria-hidden="true">{[...p.emri][0]?.toUpperCase()}</span>
          <h1>Llogaria nuk është ende e stafit</h1>
          <p>Përshëndetje, {p.emri}. Pronari i servisit duhet ta aktivizojë llogarinë{p.email ? <> për <strong>{p.email}</strong></> : null}.</p>
        </section>
        <div className="group"><div className="group__body"><Hyrja brenda /></div></div>
      </main>
    );
  }

  const aktive = riparimet.filter((r) => r.statusi !== "Marrë");
  const mbyllura = riparimet.filter((r) => r.statusi === "Marrë");
  const gati = aktive.filter((r) => r.statusi === "Gati për marrje").length;

  return (
    <main>
      <Live url="/api/servisi/versioni" versioni={versioni} />
      <Nav titulli="Riparimet" djathtas={
        <Link href="/servisi/i-ri" className="nav__icon nav__icon--filled" aria-label="Riparim i ri">
          <Ikona emri="shto" madhesia={20} trashesia={2.6} />
        </Link>
      } />
      <PageTitle titulli="Riparimet" nentitulli={
        <>{aktive.length === 1 ? "1 telefon" : `${aktive.length} telefona`} në servis{gati > 0 ? ` · ${gati} gati për marrje` : ""}</>
      } />
      {(aktive.length > 0 || mbyllura.length > 0) && <PamjaListes aktive="lista" />}
      <ListaRiparimeve aktive={aktive} mbyllura={mbyllura} />
      {m && mesazhet[m] && <Toast mesazhi={mesazhet[m]} ton="gabim" />}
    </main>
  );
}
