import { Nav } from "@/components/Nav";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { Printo } from "@/components/Printo";
import { pershkrimiIDates } from "@/lib/data";
import { gjejRiparimin, lexoServisin } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

export const dynamic = "force-dynamic";

// Fleta e pranimit: klienti skanon QR-në në banak (ose e merr të printuar) dhe hap linkun e vet.
export default async function Fleta({ params }: { params: Promise<{ id: string }> }) {
  if (!(await vetemServisi())) redirect("/servisi");
  const { id } = await params;
  const [r, servisi] = await Promise.all([gjejRiparimin(id), lexoServisin()]);
  if (!r) notFound();
  const h = await headers();
  const url = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}/r/${r.kodi}`;
  // QR si SVG në server: pa skript në shfletues dhe i qartë në çdo printer.
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0a0b0e", light: "#ffffff" } });
  const eta = r.gatiDeri ? pershkrimiIDates(r.gatiDeri) : null;

  return (
    <main>
      <Nav prapa={{ href: `/servisi/riparimi/${r.id}`, emri: "Riparimi" }} titulli="Fleta me QR" />
      <article className="slip">
        <header className="slip__head">
          <p className="slip__shop">{servisi.emri}</p>
          <p className="slip__nr">Nr. {r.id}</p>
        </header>
        <h1 className="slip__device">{r.pajisja}</h1>
        <p className="slip__problem">{r.problemi}</p>
        <div className="slip__qr" dangerouslySetInnerHTML={{ __html: qr }} aria-label="QR për statusin e riparimit" role="img" />
        <p className="slip__scan">Skano për ta ndjekur statusin nga telefoni</p>
        <dl className="slip__facts">
          <div><dt>Dorëzuar</dt><dd>{r.dorezuar}</dd></div>
          <div><dt>Çmimi i vlerësuar</dt><dd>{r.cmimi} €</dd></div>
          {eta && <div><dt>Gati deri më</dt><dd>{eta.data}</dd></div>}
        </dl>
        {(servisi.telefoni || servisi.adresa || servisi.orari) && (
          <footer className="slip__foot">
            {[servisi.adresa, servisi.orari, servisi.telefoni].filter(Boolean).join(" · ")}
          </footer>
        )}
      </article>
      <div className="no-print">
        <Printo />
        <p className="group__foot" style={{ textAlign: "center", marginTop: 8 }}>Ose ktheje ekranin nga klienti që ta skanojë direkt.</p>
      </div>
    </main>
  );
}
