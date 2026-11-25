import Link from "next/link";
import { headers } from "next/headers";
import { Ikona, IkonaWhatsApp } from "@/components/Ikona";
import { Nav, PageTitle } from "@/components/Nav";
import { notFound, redirect } from "next/navigation";
import { DataGati } from "@/components/DataGati";
import { Dergo } from "@/components/Dergo";
import { Nenshkrimi } from "@/components/Nenshkrimi";
import { LinkuKlientit } from "@/components/LinkuKlientit";
import { Live } from "@/components/Live";
import { Sheet } from "@/components/Sheet";
import { HAPI_TJETER, IKONA_E_STATUSIT, StatusHapat, StatusKryesor, TONI } from "@/components/Statusi";
import { Toast } from "@/components/Toast";
import { pershkrimiIDates } from "@/lib/data";
import {
  STATUSET, type Statusi, gjejRiparimin, lexoHistorikun, lexoNenshkrimin, lexoNgjarjet, lexoShenimet, totali, versioniSipasNumrit,
} from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";
import {
  mbyllRiparimin, ndryshoGatiDeri, ndryshoStatusin, shtoKostoShtese, shtoShenim,
} from "../../actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, [string, "ok" | "gabim"]> = {
  regjistruar: ["Riparimi u regjistrua. Dërgoja linkun klientit.", "ok"],
  statusi: ["Statusi u ruajt.", "ok"],
  zhbere: ["Statusi u kthye.", "ok"],
  shtese: ["Kostoja shtesë iu dërgua klientit.", "ok"],
  "ka-shtese": ["Ky riparim ka tashmë një kosto shtesë.", "gabim"],
  fushe: ["Kontrollo fushat: arsyeja dhe një shumë 1–9999 €.", "gabim"],
  ndaluar: ["Vetëm stafi mund ta bëjë këtë veprim.", "gabim"],
  mbyllur: ["Riparimi u mbyll.", "ok"],
  "nuk-mbyllet": ["Mbyllet vetëm kur është gati dhe klienti ka vendosur.", "gabim"],
  "data-ruajtur": ["Data e pritur u ruajt. Klienti e sheh.", "ok"],
  "data-hequr": ["Data e pritur u hoq.", "ok"],
  data: ["Zgjidh një datë nga sot deri në 60 ditë.", "gabim"],
  shenim: ["Shënimi u ruajt.", "ok"],
  "shenim-bosh": ["Shënimi është bosh.", "gabim"],
};

const vendimet = { pritje: "pret klientin", miratuar: "e miratuar", refuzuar: "e refuzuar" };

const ngjyra = (c: string) => ({ "--icon-bg": c }) as React.CSSProperties;

export default async function RiparimiServisit({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ m?: string; nga?: string }>;
}) {
  if (!(await vetemServisi())) redirect("/servisi");
  const { id } = await params;
  const { m, nga } = await searchParams;
  // Të gjitha leximet sipas numrit, njëherësh.
  const [r, versioni, kohet, shenimet, ngjarjet, nenshkrimi] = await Promise.all([
    gjejRiparimin(id), versioniSipasNumrit(id), lexoHistorikun(id), lexoShenimet(id), lexoNgjarjet(id), lexoNenshkrimin({ id }),
  ]);
  if (!r) notFound();

  // Linku i plotë për WhatsApp: adresa e faqes ku po punon stafi (localhost ose Vercel).
  const h = await headers();
  const origjina = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const teksti = `Përshëndetje! Statusin e riparimit të ${r.pajisja} e sheh këtu: ${origjina}/r/${r.kodi}`;
  const whatsapp = `https://wa.me/${r.telefoni ? r.telefoni.replace("+", "") : ""}?text=${encodeURIComponent(teksti)}`;
  const mbyllur = r.statusi === "Marrë";
  const eta = r.gatiDeri ? pershkrimiIDates(r.gatiDeri) : null;
  const toast = m ? mesazhet[m] : undefined;

  const tjetri = HAPI_TJETER[r.statusi];
  const presKlientin = r.shtese?.vendimi === "pritje";

  return (
    <main>
      {versioni && <Live url={`/api/r/${r.kodi}/versioni`} versioni={versioni} />}
      <Nav prapa={{ href: "/servisi", emri: "Riparimet" }} titulli={`Nr. ${r.id}`}
        djathtas={<LinkuKlientit shtegu={`/r/${r.kodi}`} si="ikone" />} />
      <PageTitle sipër={`Nr. ${r.id} · dorëzuar ${r.dorezuar}`} titulli={r.pajisja} nentitulli={r.problemi} />

      {mbyllur ? (
        <section className="status-card panel--closed" aria-label="Statusi">
          <StatusKryesor statusi="Marrë" etiketa="Mbyllur" vlera="Klienti e mori" koha={`më ${r.marre} · Paguar ${totali(r)} €`} />
          {nenshkrimi && (
            <>
              <p className="signature-label">Nënshkrimi i klientit</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- PNG i vogël nga databaza */}
              <div className="signature-shown"><img src={nenshkrimi} alt="Nënshkrimi i klientit në marrje" /></div>
            </>
          )}
        </section>
      ) : (
        <section className="status-card" aria-label="Statusi">
          <StatusKryesor statusi={r.statusi} koha={eta ? <>Gati deri {eta.data} · <span style={{ color: eta.vonese ? "var(--danger)" : undefined }}>{eta.relativ}</span></> : "Pa datë të pritur"} />
          <StatusHapat statusi={r.statusi} kohet={kohet} />
          <div className="status-actions">
            {tjetri && (
              <form action={ndryshoStatusin}>
                <input type="hidden" name="id" value={r.id} />
                <Dergo name="statusi" value={tjetri.statusi} pritja="Po ruhet…">
                  {tjetri.statusi === "Gati për marrje" ? <Ikona emri="rregull" trashesia={2.6} /> : <Ikona emri="celes" />}
                  {tjetri.emri}
                </Dergo>
              </form>
            )}
            {r.statusi === "Gati për marrje" && (
              presKlientin ? (
                <p className="status-note close-note">Mbyllja pret vendimin e klientit për koston shtesë.</p>
              ) : (
                <Sheet titulli="Marrja e telefonit" klasaButonit="btn btn--success btn--block" butoni={<><Ikona emri="qese" />Klienti e mori · {totali(r)} €</>}>
                  <form action={mbyllRiparimin}>
                    <input type="hidden" name="id" value={r.id} />
                    <div className="group">
                      <div className="group__body">
                        <div className="row"><span className="row__main"><span className="row__title">{r.pajisja}</span><span className="row__sub">{r.problemi}</span></span></div>
                        <div className="row row--total"><span className="row__main"><span className="row__title">Për të paguar</span></span><span className="row__value">{totali(r)} €</span></div>
                      </div>
                    </div>
                    <Nenshkrimi shuma={totali(r)} />
                    <p className="group__foot" style={{ textAlign: "center" }}>Klienti konfirmon që e mori telefonin. Nënshkrimi ruhet me riparimin.</p>
                  </form>
                </Sheet>
              )
            )}
            <Sheet titulli="Ndrysho statusin" butoni="Ndrysho statusin" klasaButonit="btn btn--plain">
              <form action={ndryshoStatusin} className="group">
                <input type="hidden" name="id" value={r.id} />
                <div className="group__body option-list">
                  {STATUSET.map((s) => (
                    <Dergo key={s} className="option" name="statusi" value={s} pritja={s}
                      disabled={s === r.statusi} shtypur={s === r.statusi}>
                      <StatusIkone statusi={s} />
                      <span className="option__text">{s}</span>
                      {s === r.statusi && <span className="option__now"><Ikona emri="rregull" trashesia={2.6} /></span>}
                    </Dergo>
                  ))}
                </div>
                <p className="group__foot">Klienti e sheh menjëherë dhe merr njoftim kur riparimi fillon ose del gati.</p>
              </form>
            </Sheet>
          </div>
        </section>
      )}

      {r.shtese && (
        <section className={`decision${presKlientin ? "" : " decision--done"}`} aria-label="Kosto shtesë">
          <span className="decision__tag"><Ikona emri={presKlientin ? "ore" : "rregull"} madhesia={15} />Kosto shtesë · {vendimet[r.shtese.vendimi]}</span>
          <h2>+{r.shtese.cmimi} €</h2>
          <p className="decision__reason">{r.shtese.arsyeja}</p>
        </section>
      )}

      <section className="group" aria-label="Klienti">
        <div className="group__head"><h2>Klienti</h2></div>
        <div className="group__body">
          <a className="row row--link row--icon" href={whatsapp} target="_blank" rel="noopener noreferrer">
            <span className="row__icon" style={ngjyra("#25d366")}><IkonaWhatsApp madhesia={18} /></span>
            <span className="row__main">
              <span className="row__title">Dërgo linkun në WhatsApp</span>
              {!r.telefoni && <span className="row__sub">Zgjidh kontaktin në WhatsApp</span>}
            </span>
            <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
          </a>
          <LinkuKlientit shtegu={`/r/${r.kodi}`} />
          <Link className="row row--link row--icon" href={`/servisi/riparimi/${r.id}/fleta`}>
            <span className="row__icon" style={ngjyra("#5856d6")}><Ikona emri="qr" madhesia={17} /></span>
            <span className="row__main"><span className="row__title">Fleta me QR</span></span>
            <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" />
          </Link>
          {r.telefoni && (
            <a className="row row--link row--icon" href={`tel:${r.telefoni}`}>
              <span className="row__icon" style={ngjyra("#34c759")}><Ikona emri="telefon" madhesia={16} /></span>
              <span className="row__main"><span className="row__title">Telefono klientin</span></span>
              <span className="row__value">{r.telefoni}</span>
            </a>
          )}
        </div>
        {mbyllur && <p className="group__foot">Linku i klientit mbyllet 30 ditë pas marrjes.</p>}
      </section>

      <section className="group facts" aria-label="Detajet">
        <div className="group__head"><h2>Detajet</h2></div>
        <div className="group__body">
          <div className="row"><span className="row__main"><span className="row__title">Çmimi i vlerësuar</span></span><span className="row__value">{r.cmimi} €</span></div>
          {r.shtese ? (
            <div className="row"><span className="row__main"><span className="row__title">Kosto shtesë</span><span className="row__sub">{vendimet[r.shtese.vendimi]}</span></span><span className="row__value">+{r.shtese.cmimi} €</span></div>
          ) : !mbyllur && (
            <Sheet titulli="Kosto shtesë" klasaButonit="row row--button row--accent" butoni={
              <><span className="row__main"><span className="row__title">Kosto shtesë</span></span><Ikona emri="shto" madhesia={20} /></>
            }>
              <form action={shtoKostoShtese}>
                <input type="hidden" name="id" value={r.id} />
                <div className="group">
                  <div className="group__body">
                    <div className="field">
                      <label htmlFor="arsyeja">Arsyeja</label>
                      <input id="arsyeja" name="arsyeja" maxLength={200} required placeholder="p.sh. Porta e karikimit është e dëmtuar" />
                    </div>
                    <div className="field">
                      <label htmlFor="cmimi">Shuma shtesë</label>
                      <span className="field__affix"><input id="cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="15" /><span>€</span></span>
                    </div>
                  </div>
                  <p className="group__foot">Klienti e miraton ose e refuzon nga telefoni, pa telefonatë.</p>
                </div>
                <Dergo pritja="Po dërgohet…">Dërgo koston klientit</Dergo>
              </form>
            </Sheet>
          )}
          {mbyllur ? (
            <div className="row"><span className="row__main"><span className="row__title">Paguar</span></span><span className="row__value row__value--strong">{totali(r)} €</span></div>
          ) : (
            <Sheet titulli="Data e pritur" klasaButonit="row row--button" butoni={
              <><span className="row__main"><span className="row__title">Gati deri më</span></span>
                <span className={`row__value${eta?.vonese ? " row__value--late" : ""}`}>{eta ? `${eta.data}` : "Cakto"}</span>
                <Ikona emri="djathtas" madhesia={18} trashesia={2.4} className="chev" /></>
            }>
              <form action={ndryshoGatiDeri}>
                <input type="hidden" name="id" value={r.id} />
                <div className="group">
                  <div className="group__body"><DataGati fillestare={r.gatiDeri ?? ""} /></div>
                  <p className="group__foot">Lëre bosh për ta hequr. Klienti e sheh te linku i vet.</p>
                </div>
                <Dergo>Ruaj datën</Dergo>
              </form>
            </Sheet>
          )}
          {r.imei && <div className="row"><span className="row__main"><span className="row__title">IMEI</span></span><span className="row__value mono">{r.imei}</span></div>}
        </div>
      </section>

      {r.kaFoto && (
        <figure className="photo-card">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotoja shërbehet nga databaza përmes rrugës /foto */}
          <img src={`/servisi/riparimi/${r.id}/foto`} alt={`${r.pajisja} në pranim`} loading="lazy" decoding="async" width={1024} height={768} />
          <figcaption>Gjendja kur u la në servis · {r.dorezuar}</figcaption>
        </figure>
      )}

      <section className="group" aria-label="Shënime të brendshme">
        <div className="group__head"><h2>Shënime të brendshme</h2></div>
        <div className="group__body">
          <form action={shtoShenim} className="inline-form">
            <input type="hidden" name="id" value={r.id} />
            <input className="input" name="teksti" maxLength={500} required placeholder="p.sh. Porositëm ekranin, vjen të enjten"
              aria-label="Shënim i ri" autoComplete="off" enterKeyHint="send" />
            <Dergo className="btn btn--tinted btn--small" pritja="…">Shto</Dergo>
          </form>
          {shenimet.map((s) => (
            <div key={s.id} className="row note">
              <span className="row__main"><p>{s.teksti}</p><span className="row__meta">{s.autori} · {s.koha}</span></span>
            </div>
          ))}
        </div>
        <p className="group__foot">I sheh vetëm stafi, jo klienti.</p>
      </section>

      {ngjarjet.length > 0 && (
        <section className="group" aria-label="Aktiviteti">
          <div className="group__head"><h2>Aktiviteti</h2></div>
          <div className="group__body">
            <ol className="timeline activity">
              {ngjarjet.map((n, i) => (
                <li key={i}>
                  <span className="timeline__dot" aria-hidden="true" />
                  <span className="timeline__what">{n.veprimi}</span>
                  <span className="timeline__meta">{n.kush} · {n.koha}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="group__foot">Regjistri nuk fshihet dhe nuk ndryshohet.</p>
        </section>
      )}

      {toast && (
        <Toast mesazhi={toast[0]} ton={toast[1]}>
          {m === "statusi" && nga && STATUSET.includes(nga as never) && (
            <form action={ndryshoStatusin}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="statusi" value={nga} />
              <input type="hidden" name="zhbej" value="1" />
              <button className="toast__action" type="submit">Zhbëj</button>
            </form>
          )}
        </Toast>
      )}
    </main>
  );
}

function StatusIkone({ statusi }: { statusi: Statusi }) {
  return (
    <span className={`row__icon tone--${TONI[statusi]}`} style={ngjyra("var(--tone)")}>
      <Ikona emri={IKONA_E_STATUSIT[statusi]} madhesia={17} />
    </span>
  );
}
