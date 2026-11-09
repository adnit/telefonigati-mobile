import Link from "next/link";
import { notFound } from "next/navigation";
import { PaInternet, VetemMeRrjet } from "@/components/Rrjeti";
import { Marka } from "@/components/Marka";
import { StatusHapat, StatusKryesor } from "@/components/Statusi";
import { gjejMeKod } from "@/lib/riparimet";
import { vendosKostoShtese } from "./actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = {
  miratuar: "Faleminderit. Servisi e sheh miratimin dhe vazhdon punën.",
  refuzuar: "U ruajt. Servisi nuk e bën riparimin shtesë; çmimi mbetet ai i vlerësuar.",
  vendosur: "Për këtë kosto është vendosur tashmë.",
};

export default async function RiparimiIm({ params, searchParams }: {
  params: Promise<{ kodi: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const { kodi } = await params;
  const { m } = await searchParams;
  let r;
  try {
    r = await gjejMeKod(kodi);
  } catch {
    return (
      <main>
        <h1>TelefoniGati</h1>
        <p role="alert">Nuk u lidhëm me servisin. Provo përsëri pak më vonë.</p>
        <Link className="action" href={`/r/${kodi}`}>Provo përsëri</Link>
      </main>
    );
  }
  if (!r) notFound();
  const totali = r.cmimi + (r.shtese?.vendimi === "miratuar" ? r.shtese.cmimi : 0);

  return (
    <main>
      <Marka />
      <header className="page-head">
        <p className="label">Riparimi nr. {r.id}</p>
        <h1>{r.pajisja}</h1>
        <p className="muted">{r.problemi}</p>
      </header>
      <PaInternet perditesuar={r.perditesuar} />
      {m && mesazhet[m] && <p role="status" className="flash">{mesazhet[m]}</p>}

      <section className="panel">
        <StatusKryesor statusi={r.statusi} perditesuar={r.perditesuar} />
        <StatusHapat statusi={r.statusi} />
      </section>

      {r.shtese?.vendimi === "pritje" && (
        <section className="panel panel--notice">
          <h2>Servisi gjeti një problem tjetër</h2>
          <p>{r.shtese.arsyeja}</p>
          <dl className="facts">
            <div><dt>Shtesë</dt><dd className="price">+{r.shtese.cmimi} €</dd></div>
            <div><dt>Gjithsej nëse e miraton</dt><dd className="price">{r.cmimi + r.shtese.cmimi} €</dd></div>
          </dl>
          <form action={vendosKostoShtese}>
            <input type="hidden" name="kodi" value={r.kodi} />
            <VetemMeRrjet>
              <div className="choice">
                <button className="action" name="vendimi" value="miratuar">Mirato</button>
                <button className="action action--quiet" name="vendimi" value="refuzuar">Refuzo</button>
              </div>
            </VetemMeRrjet>
          </form>
        </section>
      )}

      {r.foto && (
        <figure className="panel photo-shown">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotoja ruhet si data URL në databazë */}
          <img src={r.foto} alt={`${r.pajisja} në pranim`} />
          <figcaption className="muted">Gjendja e telefonit kur u la në servis · {r.dorezuar}</figcaption>
        </figure>
      )}
      <section className="panel">
        <dl className="facts">
          <div><dt>Dorëzuar</dt><dd>{r.dorezuar}</dd></div>
          <div><dt>Çmimi i vlerësuar</dt><dd className="price">{r.cmimi} €</dd></div>
          {r.shtese && r.shtese.vendimi !== "pritje" && (
            <div>
              <dt>Kosto shtesë</dt>
              <dd>{r.shtese.vendimi === "miratuar" ? `+${r.shtese.cmimi} € · e miratuar` : "e refuzuar"}</dd>
            </div>
          )}
          <div><dt>Për të paguar në servis</dt><dd className="price">{totali} €</dd></div>
        </dl>
      </section>
    </main>
  );
}
