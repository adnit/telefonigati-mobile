import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Dergo } from "@/components/Dergo";
import { LinkuKlientit } from "@/components/LinkuKlientit";
import { Live } from "@/components/Live";
import { Sheet } from "@/components/Sheet";
import { StatusHapat, StatusPill } from "@/components/Statusi";
import { Toast } from "@/components/Toast";
import { pershkrimiIDates } from "@/lib/data";
import {
  STATUSET, gjejRiparimin, lexoHistorikun, lexoShenimet, totali, versioniIRiparimit,
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

const vendimet = { pritje: "Pret klientin", miratuar: "E miratuar", refuzuar: "E refuzuar" };

export default async function RiparimiServisit({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ m?: string; nga?: string }>;
}) {
  if (!(await vetemServisi())) redirect("/servisi");
  const { id } = await params;
  const { m, nga } = await searchParams;
  const r = await gjejRiparimin(id);
  if (!r) notFound();
  const [versioni, kohet, shenimet] = await Promise.all([
    versioniIRiparimit(r.kodi), lexoHistorikun(r.id), lexoShenimet(r.id),
  ]);

  // Linku i plotë për WhatsApp: adresa e faqes ku po punon stafi (localhost ose Vercel).
  const h = await headers();
  const origjina = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const teksti = `Përshëndetje! Statusin e riparimit të ${r.pajisja} e sheh këtu: ${origjina}/r/${r.kodi}`;
  const whatsapp = `https://wa.me/${r.telefoni ? r.telefoni.replace("+", "") : ""}?text=${encodeURIComponent(teksti)}`;
  const mbyllur = r.statusi === "Marrë";
  const eta = r.gatiDeri ? pershkrimiIDates(r.gatiDeri) : null;
  const toast = m ? mesazhet[m] : undefined;

  return (
    <main>
      {versioni && <Live url={`/api/r/${r.kodi}/versioni`} versioni={versioni} />}
      <Link className="back" href="/servisi">← Riparimet</Link>
      <header className="page-head">
        <div className="page-head__row">
          <p className="label">Nr. {r.id} · {r.dorezuar}</p>
          <StatusPill statusi={r.statusi} />
        </div>
        <h1>{r.pajisja}</h1>
        <p className="muted">{r.problemi}</p>
      </header>

      {mbyllur ? (
        <section className="panel panel--closed">
          <p className="label">Mbyllur</p>
          <h2>Klienti e mori telefonin më {r.marre}</h2>
          <dl className="facts">
            <div><dt>Paguar</dt><dd className="price">{totali(r)} €</dd></div>
          </dl>
        </section>
      ) : (
        <section className="panel">
          <StatusHapat statusi={r.statusi} kohet={kohet} />
          <div className="actions-row">
            <Sheet titulli="Ndrysho statusin" butoni="Ndrysho statusin" klasaButonit="action action--block">
              <form action={ndryshoStatusin} className="option-list">
                <input type="hidden" name="id" value={r.id} />
                {STATUSET.map((s, i) => (
                  <Dergo key={s} className="option" name="statusi" value={s} pritja={s}
                    disabled={s === r.statusi} shtypur={s === r.statusi}>
                    <span className="option__num">{i + 1}</span>
                    <span className="option__text">{s}</span>
                    {s === r.statusi && <span className="option__now">tani</span>}
                  </Dergo>
                ))}
              </form>
              <p className="hint">Klienti e sheh menjëherë dhe merr njoftim kur riparimi fillon ose del gati.</p>
            </Sheet>
          </div>
          {r.statusi === "Gati për marrje" && (
            r.shtese?.vendimi === "pritje" ? (
              <p className="muted close-note">Mbyllja pret vendimin e klientit për koston shtesë.</p>
            ) : (
              <form action={mbyllRiparimin} className="close-form">
                <input type="hidden" name="id" value={r.id} />
                <Dergo className="action action--success action--block" pritja="Po mbyllet…">
                  Klienti e mori · {totali(r)} €
                </Dergo>
              </form>
            )
          )}
        </section>
      )}

      <section className="panel">
        <dl className="facts">
          <div><dt>Çmimi i vlerësuar</dt><dd className="price">{r.cmimi} €</dd></div>
          {r.shtese && (
            <div><dt>Kosto shtesë · {vendimet[r.shtese.vendimi]}</dt><dd className="price">+{r.shtese.cmimi} €</dd></div>
          )}
          <div>
            <dt>Gati deri më</dt>
            <dd className={eta?.vonese ? "late" : undefined}>{eta ? `${eta.data} · ${eta.relativ}` : "pa datë"}</dd>
          </div>
          {r.telefoni && <div><dt>Telefoni i klientit</dt><dd><a href={`tel:${r.telefoni}`}>{r.telefoni}</a></dd></div>}
        </dl>
        {!mbyllur && (
          <div className="actions-row actions-row--two">
            <Sheet titulli="Data e pritur" butoni={r.gatiDeri ? "Ndrysho datën" : "Cakto datën"}>
              <form action={ndryshoGatiDeri} className="form">
                <input type="hidden" name="id" value={r.id} />
                <label htmlFor="gati_deri">Gati deri më</label>
                <input id="gati_deri" name="gati_deri" type="date" defaultValue={r.gatiDeri ?? ""} />
                <p className="hint">Lëre bosh për ta hequr. Klienti e sheh te linku i vet.</p>
                <Dergo>Ruaj datën</Dergo>
              </form>
            </Sheet>
            {!r.shtese && (
              <Sheet titulli="Kosto shtesë" butoni="Kosto shtesë">
                <form action={shtoKostoShtese} className="form">
                  <p className="muted">Klienti e miraton ose e refuzon nga telefoni, pa telefonatë.</p>
                  <input type="hidden" name="id" value={r.id} />
                  <label htmlFor="arsyeja">Arsyeja</label>
                  <input id="arsyeja" name="arsyeja" maxLength={200} required placeholder="p.sh. Porta e karikimit është e dëmtuar" />
                  <label htmlFor="cmimi">Shuma shtesë (€)</label>
                  <input id="cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="15" />
                  <Dergo pritja="Po dërgohet…">Dërgo koston klientit</Dergo>
                </form>
              </Sheet>
            )}
          </div>
        )}
      </section>

      {r.shtese && (
        <section className="panel panel--notice">
          <h2>Kosto shtesë · {vendimet[r.shtese.vendimi]}</h2>
          <p>{r.shtese.arsyeja}</p>
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
        <h2>Klienti</h2>
        {mbyllur && <p className="muted">Linku mbyllet 30 ditë pas marrjes.</p>}
        <a className="action action--whatsapp action--block" href={whatsapp} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>
          {r.telefoni ? "Dërgo në WhatsApp" : "Dërgo në WhatsApp (zgjidh kontaktin)"}
        </a>
        <div className="actions-row actions-row--two">
          <Link className="action action--quiet" href={`/servisi/riparimi/${r.id}/fleta`}>Fleta me QR</Link>
          <LinkuKlientit shtegu={`/r/${r.kodi}`} kompakt />
        </div>
      </section>

      <section className="panel">
        <h2>Shënime të brendshme</h2>
        <p className="muted">I sheh vetëm stafi.</p>
        <form action={shtoShenim} className="note-form">
          <input type="hidden" name="id" value={r.id} />
          <input name="teksti" maxLength={500} required placeholder="p.sh. Porositëm ekranin, vjen të enjten"
            aria-label="Shënim i ri" autoComplete="off" />
          <Dergo className="action" pritja="…">Shto</Dergo>
        </form>
        {shenimet.length > 0 && (
          <ol className="notes">
            {shenimet.map((s) => (
              <li key={s.id}>
                <p>{s.teksti}</p>
                <span className="notes__meta">{s.autori} · {s.koha}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

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
