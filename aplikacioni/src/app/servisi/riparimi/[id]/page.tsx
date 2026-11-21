import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LinkuKlientit } from "@/components/LinkuKlientit";
import { Live } from "@/components/Live";
import { StatusHapat } from "@/components/Statusi";
import { Dergo } from "@/components/Dergo";
import { headers } from "next/headers";
import { STATUSET, gjejRiparimin, lexoHistorikun, totali, versioniIRiparimit } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";
import { mbyllRiparimin, ndryshoStatusin, shtoKostoShtese } from "../../actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = {
  regjistruar: "Riparimi u regjistrua. Dërgoja linkun klientit.",
  statusi: "Statusi u ruajt. Klienti e sheh në linkun e vet.",
  shtese: "Kostoja shtesë u dërgua. Prit vendimin e klientit para se ta bësh punën.",
  "ka-shtese": "Ky riparim ka tashmë një kosto shtesë.",
  fushe: "Kontrollo fushat: arsyeja dhe një shumë në euro (1–9999).",
  ndaluar: "Vetëm stafi i servisit mund ta bëjë këtë veprim.",
  mbyllur: "Riparimi u mbyll. Klienti e sheh në linkun e vet.",
  "nuk-mbyllet": "Riparimi mbyllet vetëm kur është gati dhe klienti ka vendosur për koston shtesë.",
};

const vendimet = {
  pritje: "Pret vendimin e klientit",
  miratuar: "Klienti e miratoi",
  refuzuar: "Klienti e refuzoi",
};

export default async function RiparimiServisit({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  if (!(await vetemServisi())) redirect("/servisi");
  const { id } = await params;
  const { m } = await searchParams;
  const r = await gjejRiparimin(id);
  if (!r) notFound();
  const [versioni, kohet] = await Promise.all([versioniIRiparimit(r.kodi), lexoHistorikun(r.id)]);

  // Linku i plotë për WhatsApp: adresa e faqes ku po punon stafi (localhost ose Vercel).
  const h = await headers();
  const origjina = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const teksti = `Përshëndetje! Statusin e riparimit të ${r.pajisja} e sheh këtu: ${origjina}/r/${r.kodi}`;
  const whatsapp = `https://wa.me/${r.telefoni ? r.telefoni.replace("+", "") : ""}?text=${encodeURIComponent(teksti)}`;

  return (
    <main>
      {versioni && <Live url={`/api/r/${r.kodi}/versioni`} versioni={versioni} />}
      <Link className="back" href="/servisi">← Riparimet</Link>
      <header className="page-head">
        <p className="label">Nr. {r.id} · {r.dorezuar}</p>
        <h1>{r.pajisja}</h1>
        <p className="muted">{r.problemi}</p>
      </header>
      {m && mesazhet[m] && <p role="status" className="flash">{mesazhet[m]}</p>}

      {r.statusi === "Marrë" ? (
        <section className="panel panel--closed">
          <p className="label">Mbyllur</p>
          <h2>Klienti e mori telefonin më {r.marre}</h2>
          <dl className="facts">
            <div><dt>Paguar</dt><dd className="price">{totali(r)} €</dd></div>
          </dl>
        </section>
      ) : (
        <section className="panel">
          <h2 className="panel__title">Statusi</h2>
          <StatusHapat statusi={r.statusi} kohet={kohet} />
          <form action={ndryshoStatusin} className="segmented" aria-label="Ndrysho statusin">
            <input type="hidden" name="id" value={r.id} />
            {STATUSET.map((s) => (
              <Dergo key={s} className="" name="statusi" value={s} pritja={s}
                disabled={s === r.statusi} shtypur={s === r.statusi}>{s}</Dergo>
            ))}
          </form>
          {r.statusi === "Gati për marrje" && (
            r.shtese?.vendimi === "pritje" ? (
              <p className="muted close-note">Mbyllja pret vendimin e klientit për koston shtesë.</p>
            ) : (
              <form action={mbyllRiparimin} className="close-form">
                <input type="hidden" name="id" value={r.id} />
                <Dergo pritja="Po mbyllet…">Klienti e mori · {totali(r)} €</Dergo>
              </form>
            )
          )}
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
          <div><dt>Çmimi i vlerësuar</dt><dd className="price">{r.cmimi} €</dd></div>
          <div><dt>Përditësuar</dt><dd>{r.perditesuar}</dd></div>
        </dl>
      </section>

      {r.shtese ? (
        <section className="panel panel--notice">
          <h2>Kosto shtesë · {vendimet[r.shtese.vendimi]}</h2>
          <p>{r.shtese.arsyeja}</p>
          <dl className="facts">
            <div><dt>Shtesë</dt><dd className="price">+{r.shtese.cmimi} €</dd></div>
          </dl>
        </section>
      ) : r.statusi === "Marrë" ? null : (
        <form action={shtoKostoShtese} className="panel form">
          <h2>Gjete problem tjetër?</h2>
          <p className="muted">Klienti e miraton ose e refuzon nga telefoni, pa telefonatë.</p>
          <input type="hidden" name="id" value={r.id} />
          <label htmlFor="arsyeja">Arsyeja</label>
          <input id="arsyeja" name="arsyeja" maxLength={200} required placeholder="p.sh. Porta e karikimit është e dëmtuar" />
          <label htmlFor="cmimi">Shuma shtesë (€)</label>
          <input id="cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="15" />
          <Dergo pritja="Po dërgohet…">Dërgo koston klientit</Dergo>
        </form>
      )}

      <section className="panel">
        <h2>Linku i klientit</h2>
        {r.statusi === "Marrë" && <p className="muted">Linku mbyllet 30 ditë pas marrjes.</p>}
        <a className="action action--whatsapp action--block" href={whatsapp} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>
          {r.telefoni ? "Dërgo në WhatsApp" : "Dërgo në WhatsApp (zgjidh kontaktin)"}
        </a>
        <LinkuKlientit shtegu={`/r/${r.kodi}`} />
      </section>
    </main>
  );
}
