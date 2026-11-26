import Link from "next/link";
import { notFound } from "next/navigation";
import { PaInternet, VetemMeRrjet } from "@/components/Rrjeti";
import { Live } from "@/components/Live";
import { Marka } from "@/components/Marka";
import { Ikona, IkonaWhatsApp } from "@/components/Ikona";
import { PageTitle } from "@/components/Nav";
import { ZgjedhTemen } from "@/components/Tema";
import { StatusLive } from "@/components/StatusLive";
import { Njoftimet } from "@/components/Njoftimet";
import { StatusHapat, StatusKryesor } from "@/components/Statusi";
import { gjejMeKod, kaPershtypje, lexoNenshkrimin, lexoHistorikunMeKod, lexoServisin, totali as llogaritTotalin, versioniIRiparimit } from "@/lib/riparimet";
import { pershkrimiIDates } from "@/lib/data";
import { Toast } from "@/components/Toast";
import { eshteBllokuar, shenoKodTeGabuar } from "@/lib/kufiri";
import { Dergo } from "@/components/Dergo";
import { ruajPershtypjen, vendosKostoShtese } from "./actions";
import { ruajRiparimin } from "@/app/llogaria/actions";
import { eshteRuajtur } from "@/lib/klienti";
import { profiliIm } from "@/lib/servisi";
import Hyrja from "@/components/Hyrja";
import { ButoniLlogarise } from "@/components/ButoniLlogarise";
import { eshteStaf } from "@/lib/servisi";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, [string, "ok" | "gabim"]> = {
  miratuar: ["Faleminderit. Servisi e sheh miratimin dhe vazhdon punën.", "ok"],
  refuzuar: ["U ruajt. Riparimi shtesë nuk bëhet; çmimi mbetet ai i vlerësuar.", "ok"],
  vendosur: ["Për këtë kosto është vendosur tashmë.", "gabim"],
  pershtypja: ["Faleminderit! Përgjigjja jote e ndihmon servisin.", "ok"],
  ruajtur: ["U ruajt te Riparimet e mia.", "ok"],
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
        <div className="card card--center" style={{ marginTop: "calc(60px + env(safe-area-inset-top, 0px))" }}>
          <h1 style={{ fontSize: "1.375rem" }}>Shumë prova</h1>
          <p className="card__sub">Ky telefon provoi shumë linqe të gabuara. Provo sërish pas 10 minutash ose kërkoja servisit linkun e saktë.</p>
        </div>
      </main>
    );
  }
  let r;
  let versioni: string | null = null;
  let kohet: Partial<Record<string, string>> = {};
  let servisi: Awaited<ReturnType<typeof lexoServisin>> | null = null;
  let nenshkrimi: string | null = null;
  try {
    // Të katër leximet njëherësh: një pritje e vetme te databaza, jo katër me radhë.
    [r, versioni, kohet, servisi, nenshkrimi] = await Promise.all([
      gjejMeKod(kodi), versioniIRiparimit(kodi), lexoHistorikunMeKod(kodi), lexoServisin().catch(() => null),
      lexoNenshkrimin({ kodi }).catch(() => null),
    ]);
  } catch {
    return (
      <main>
        <div className="card card--center" style={{ marginTop: "calc(60px + env(safe-area-inset-top, 0px))" }}>
          <h1 style={{ fontSize: "1.375rem" }}>Pa lidhje me servisin</h1>
          <p className="card__sub" role="alert">Provo përsëri pak më vonë.</p>
          <Link className="btn btn--primary" href={`/r/${kodi}`}>Provo përsëri</Link>
        </div>
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
  const [kaPershtypjeJo, profili] = await Promise.all([kaPershtypje(kodi).catch(() => true), profiliIm().catch(() => null)]);
  const pyetPershtypjen = r.statusi === "Marrë" && !kaPershtypjeJo;
  const ruajtur = profili ? await eshteRuajtur(profili.id, kodi).catch(() => false) : false;

  const mbyllur = r.statusi === "Marrë";
  // Servisi pa emër të vendosur ("Servisi") dhe pa kontakte nuk i tregohet klientit si kartë bosh.
  const kaServis = Boolean(servisi && (servisi.emri !== "Servisi" || servisi.telefoni || servisi.adresa || servisi.orari));
  const ngjyra = (c: string) => ({ "--icon-bg": c }) as React.CSSProperties;

  return (
    <main>
      {versioni && !mbyllur && <Live url={`/api/r/${kodi}/versioni`} versioni={versioni} intervali={3000} />}
      <StatusLive statusi={r.statusi} />
      <div className="brandbar">
        <Marka />
        <ButoniLlogarise emri={profili?.emri} />
      </div>
      <PageTitle sipër={`Riparimi nr. ${r.id}${kaServis ? ` · ${servisi!.emri}` : ""}`} titulli={r.pajisja} nentitulli={r.problemi} />
      <PaInternet perditesuar={r.perditesuar} />

      <section className="status-card" aria-label="Statusi">
        {mbyllur ? (
<>
          <StatusKryesor statusi="Marrë" etiketa="Riparimi u mbyll" vlera={`E more më ${r.marre}`} koha="Faleminderit që zgjodhe servisin tonë." />
          {nenshkrimi && (
            <>
              <p className="signature-label">Marrja u konfirmua me nënshkrimin tënd</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- PNG i vogël nga databaza */}
              <div className="signature-shown"><img src={nenshkrimi} alt="Nënshkrimi në marrje" /></div>
            </>
          )}
          </>
        ) : (
          <StatusKryesor statusi={r.statusi} koha={<>Përditësuar {r.perditesuar} · përditësohet vetë</>} live />
        )}
        {eta && (
          <div className={`eta${eta.vonese ? " eta--late" : ""}`}>
            <Ikona emri="kalendar" madhesia={20} />
            <span className="eta__text"><span className="eta__label">Gati deri më</span><span className="eta__date">{eta.data}</span></span>
            <span className="eta__rel">{eta.vonese ? "pak vonesë" : eta.relativ}</span>
          </div>
        )}
        <StatusHapat statusi={r.statusi} kohet={kohet} />
      </section>

      {r.shtese?.vendimi === "pritje" && (
        <section className="decision" aria-label="Kosto shtesë">
          <span className="decision__tag"><Ikona emri="kujdes" madhesia={15} />Kërkon vendimin tënd</span>
          <h2>Servisi gjeti një problem tjetër</h2>
          <p className="decision__reason">{r.shtese.arsyeja}</p>
          <div className="decision__sum">
            <span>Shtesë <strong>+{r.shtese.cmimi} €</strong></span>
            <small>Gjithsej {r.cmimi + r.shtese.cmimi} €</small>
          </div>
          <form action={vendosKostoShtese}>
            <input type="hidden" name="kodi" value={r.kodi} />
            <VetemMeRrjet>
              <div className="btn-row">
                <Dergo className="btn btn--gray" name="vendimi" value="refuzuar" pritja="Po ruhet…">Refuzo</Dergo>
                <Dergo className="btn btn--primary" name="vendimi" value="miratuar" pritja="Po ruhet…">Mirato</Dergo>
              </div>
            </VetemMeRrjet>
          </form>
          <p className="card__sub" style={{ marginTop: 12, fontSize: "0.8125rem" }}>Nëse e refuzon, riparimi shtesë nuk bëhet dhe çmimi mbetet {r.cmimi} €.</p>
        </section>
      )}

      {pyetPershtypjen && (
        <section className="card feedback" aria-label="Përshtypja">
          <h2>A të kurseu ky link një telefonatë në servis?</h2>
          <p className="card__sub">Një prekje. Na ndihmon të kuptojmë nëse aplikacioni vlen.</p>
          <form action={ruajPershtypjen} className="btn-row">
            <input type="hidden" name="kodi" value={r.kodi} />
            <Dergo className="btn btn--gray" name="kurseu" value="jo" pritja="…">Jo</Dergo>
            <Dergo className="btn btn--primary" name="kurseu" value="po" pritja="…">Po</Dergo>
          </form>
        </section>
      )}

      {!mbyllur && process.env.VAPID_PUBLIC_KEY && (
        <Njoftimet kodi={r.kodi} celesi={process.env.VAPID_PUBLIC_KEY} />
      )}

      <section className="group" aria-label="Pagesa">
        <div className="group__head"><h2>Pagesa</h2></div>
        <div className="group__body">
          <div className="row"><span className="row__main"><span className="row__title">Çmimi i vlerësuar</span></span><span className="row__value">{r.cmimi} €</span></div>
          {r.shtese && r.shtese.vendimi !== "pritje" && (
            <div className="row">
              <span className="row__main"><span className="row__title">Kosto shtesë</span><span className="row__sub">{r.shtese.vendimi === "miratuar" ? "e miratuar" : "e refuzuar"}</span></span>
              <span className="row__value">{r.shtese.vendimi === "miratuar" ? `+${r.shtese.cmimi} €` : "–"}</span>
            </div>
          )}
          <div className="row row--total"><span className="row__main"><span className="row__title">{mbyllur ? "Paguar" : "Për të paguar në servis"}</span></span><span className="row__value">{totali} €</span></div>
        </div>
        <p className="group__foot">Dorëzuar më {r.dorezuar}. Paguhet në servis kur e merr telefonin.</p>
      </section>

      {r.kaFoto && (
        <figure className="photo-card">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotoja shërbehet nga databaza përmes rrugës /foto */}
          <img src={`/r/${r.kodi}/foto`} alt={`${r.pajisja} në pranim`} loading="lazy" decoding="async" width={1024} height={768} />
          <figcaption>Gjendja e telefonit kur u la në servis · {r.dorezuar}</figcaption>
        </figure>
      )}

      {kaServis && servisi && (
        <section className="group shop" aria-label="Servisi">
          <div className="group__head"><h2>Servisi</h2></div>
          <div className="group__body">
            <div className="row row--icon">
              <span className="row__icon" style={ngjyra("linear-gradient(180deg, #34c759, #1f9d45)")}><Ikona emri="celes" madhesia={16} /></span>
              <span className="row__main">
                <span className="row__title row__title--strong">{servisi.emri}</span>
                {(servisi.adresa || servisi.orari) && <span className="row__sub">{[servisi.adresa, servisi.orari].filter(Boolean).join(" · ")}</span>}
              </span>
            </div>
            {telServisi && (
              <>
                <a className="row row--link row--icon" href={`tel:${telServisi}`}>
                  <span className="row__icon" style={ngjyra("#34c759")}><Ikona emri="telefon" madhesia={16} /></span>
                  <span className="row__main"><span className="row__title">Telefono</span></span>
                  <span className="row__value">{telServisi}</span>
                </a>
                <a className="row row--link row--icon" href={`https://wa.me/${telServisi.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                  <span className="row__icon" style={ngjyra("#25d366")}><IkonaWhatsApp madhesia={18} /></span>
                  <span className="row__main"><span className="row__title">Shkruaj në WhatsApp</span></span>
                  <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
                </a>
              </>
            )}
          </div>
        </section>
      )}

      <section className="group" aria-label="Riparimet e mia">
        <div className="group__body">
          {profili && eshteStaf(profili) ? (
            <Link className="row row--link row--icon" href={`/servisi/riparimi/${r.id}`}>
              <span className="row__icon" style={ngjyra("linear-gradient(180deg, #3fd46b, #1b9440)")}><Ikona emri="celes" madhesia={16} /></span>
              <span className="row__main"><span className="row__title">Hape në panelin e servisit</span><span className="row__sub">E sheh këtë sepse je staf.</span></span>
              <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
            </Link>
          ) : ruajtur ? (
            <Link className="row row--link row--icon" href="/llogaria">
              <span className="row__icon" style={ngjyra("var(--gati-fill)")}><Ikona emri="rregull" madhesia={16} trashesia={2.6} /></span>
              <span className="row__main"><span className="row__title">E ruajtur te Riparimet e mia</span></span>
              <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
            </Link>
          ) : profili ? (
            <form action={ruajRiparimin}>
              <input type="hidden" name="kodi" value={r.kodi} />
              <Dergo className="row row--button row--icon row--accent" pritja="Po ruhet…">
                <span className="row__icon" style={ngjyra("#0a84ff")}><Ikona emri="shto" madhesia={16} trashesia={2.6} /></span>
                <span className="row__main"><span className="row__title">Ruaje te Riparimet e mia</span></span>
              </Dergo>
            </form>
          ) : (
            <div className="row row--stack">
              <span className="row__main">
                <span className="row__title">Ruaje në llogarinë tënde</span>
                <span className="row__sub">Opsionale: i gjen riparimet në çdo pajisje. Pa llogari, ky link punon njësoj.</span>
              </span>
              <Hyrja brenda={false} pas={`/r/${r.kodi}`} />
            </div>
          )}
        </div>
      </section>

      <div className="theme-pick"><p>Pamja</p><ZgjedhTemen /></div>

      {toast && <Toast mesazhi={toast[0]} ton={toast[1]} />}
    </main>
  );
}
