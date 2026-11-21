import Link from "next/link";
import { notFound } from "next/navigation";
import { PaInternet, VetemMeRrjet } from "@/components/Rrjeti";
import { Live } from "@/components/Live";
import { Marka } from "@/components/Marka";
import { Njoftimet } from "@/components/Njoftimet";
import { StatusHapat, StatusKryesor } from "@/components/Statusi";
import { gjejMeKod, kaPershtypje, lexoHistorikunMeKod, lexoServisin, totali as llogaritTotalin, versioniIRiparimit } from "@/lib/riparimet";
import { pershkrimiIDates } from "@/lib/data";
import { Toast } from "@/components/Toast";
import { eshteBllokuar, shenoKodTeGabuar } from "@/lib/kufiri";
import { Dergo } from "@/components/Dergo";
import { ruajPershtypjen, vendosKostoShtese } from "./actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, [string, "ok" | "gabim"]> = {
  miratuar: ["Faleminderit. Servisi e sheh miratimin dhe vazhdon punën.", "ok"],
  refuzuar: ["U ruajt. Riparimi shtesë nuk bëhet; çmimi mbetet ai i vlerësuar.", "ok"],
  vendosur: ["Për këtë kosto është vendosur tashmë.", "gabim"],
  pershtypja: ["Faleminderit! Përgjigjja jote e ndihmon servisin.", "ok"],
};

export default async function RiparimiIm({ params, searchParams }: {
  params: Promise<{ kodi: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const { kodi } = await params;
  const { m } = await searchParams;
  if (await eshteBllokuar().catch(() => false)) {
    return (
      <main>
        <section className="panel panel--center">
          <h1>Shumë prova</h1>
          <p className="muted">Ky telefon provoi shumë linqe të gabuara. Provo sërish pas 10 minutash ose kërkoja servisit linkun e saktë.</p>
        </section>
      </main>
    );
  }
  let r;
  let versioni: string | null = null;
  let kohet: Partial<Record<string, string>> = {};
  let servisi: Awaited<ReturnType<typeof lexoServisin>> | null = null;
  try {
    // Të katër leximet njëherësh: një pritje e vetme te databaza, jo katër me radhë.
    [r, versioni, kohet, servisi] = await Promise.all([
      gjejMeKod(kodi), versioniIRiparimit(kodi), lexoHistorikunMeKod(kodi), lexoServisin().catch(() => null),
    ]);
  } catch {
    return (
      <main>
        <h1>TelefoniGati</h1>
        <p role="alert">Nuk u lidhëm me servisin. Provo përsëri pak më vonë.</p>
        <Link className="action" href={`/r/${kodi}`}>Provo përsëri</Link>
      </main>
    );
  }
  if (!r) {
    await shenoKodTeGabuar().catch(() => {});
    notFound();
  }
  const eta = r.gatiDeri && (r.statusi === "Pranuar" || r.statusi === "Në riparim") ? pershkrimiIDates(r.gatiDeri) : null;
  const toast = m ? mesazhet[m] : undefined;
  const telServisi = servisi?.telefoni ?? null;
  const totali = llogaritTotalin(r);
  const pyetPershtypjen = r.statusi === "Marrë" && !(await kaPershtypje(kodi).catch(() => true));

  return (
    <main>
      {versioni && r.statusi !== "Marrë" && <Live url={`/api/r/${kodi}/versioni`} versioni={versioni} />}
      <Marka />
      <header className="page-head">
        <p className="label">Riparimi nr. {r.id}</p>
        <h1>{r.pajisja}</h1>
        <p className="muted">{r.problemi}</p>
      </header>
      <PaInternet perditesuar={r.perditesuar} />

      <section className="panel">
        {r.statusi === "Marrë" ? (
          <div className="status-hero status-hero--marre">
            <p className="label">Riparimi u mbyll</p>
            <p className="status-hero__value"><span className="status-hero__dot" aria-hidden="true" />E more më {r.marre}</p>
            <p className="status-hero__time">Faleminderit që zgjodhe servisin tonë.</p>
          </div>
        ) : (
          <StatusKryesor statusi={r.statusi} perditesuar={r.perditesuar} />
        )}
        {eta && (
          <p className={`eta${eta.vonese ? " eta--late" : ""}`}>
            <span className="eta__label">Gati deri më</span>
            <span className="eta__date">{eta.data}</span>
            <span className="eta__rel">{eta.vonese ? "pak vonesë" : eta.relativ}</span>
          </p>
        )}
        <StatusHapat statusi={r.statusi} kohet={kohet} />
      </section>

      {pyetPershtypjen && (
        <section className="panel feedback">
          <h2>A të kurseu ky link një telefonatë në servis?</h2>
          <p className="muted">Një prekje. Na ndihmon të kuptojmë nëse aplikacioni vlen.</p>
          <form action={ruajPershtypjen} className="choice">
            <input type="hidden" name="kodi" value={r.kodi} />
            <Dergo className="action" name="kurseu" value="po" pritja="…">Po</Dergo>
            <Dergo className="action action--quiet" name="kurseu" value="jo" pritja="…">Jo</Dergo>
          </form>
        </section>
      )}

      {r.statusi !== "Marrë" && process.env.VAPID_PUBLIC_KEY && (
        <Njoftimet kodi={r.kodi} celesi={process.env.VAPID_PUBLIC_KEY} />
      )}

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
                <Dergo className="action" name="vendimi" value="miratuar" pritja="Po ruhet…">Mirato</Dergo>
                <Dergo className="action action--quiet" name="vendimi" value="refuzuar" pritja="Po ruhet…">Refuzo</Dergo>
              </div>
            </VetemMeRrjet>
          </form>
        </section>
      )}

      {r.kaFoto && (
        <figure className="panel photo-shown">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotoja ruhet si data URL në databazë */}
          <img src={`/r/${r.kodi}/foto`} alt={`${r.pajisja} në pranim`} loading="lazy" decoding="async" width={1024} height={768} />
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
          <div><dt>{r.statusi === "Marrë" ? "Paguar" : "Për të paguar në servis"}</dt><dd className="price">{totali} €</dd></div>
        </dl>
      </section>

      {servisi && (
        <section className="panel shop">
          <p className="label">Servisi</p>
          <h2>{servisi.emri}</h2>
          {(servisi.adresa || servisi.orari) && (
            <p className="muted">{[servisi.adresa, servisi.orari].filter(Boolean).join(" · ")}</p>
          )}
          {telServisi && (
            <div className="actions-row actions-row--two">
              <a className="action action--quiet" href={`tel:${telServisi}`}>Telefono</a>
              <a className="action action--quiet" href={`https://wa.me/${telServisi.replace("+", "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          )}
        </section>
      )}

      {toast && <Toast mesazhi={toast[0]} ton={toast[1]} />}
    </main>
  );
}
