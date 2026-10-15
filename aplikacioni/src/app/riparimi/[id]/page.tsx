import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejRiparimin } from "@/lib/riparimet";
import { StatusHapat } from "@/components/Statusi";

export const dynamic = "force-dynamic";

export default async function Detajet({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let riparim;
  try {
    riparim = await gjejRiparimin(id);
  } catch {
    return (
      <main>
        <h1>TelefoniGati</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link href="/">← Kthehu te lista</Link>
      </main>
    );
  }
  if (!riparim) notFound();

  return (
    <main>
      <Link className="back" href="/">← Kthehu te lista</Link>
      <h1>{riparim.pajisja}</h1>
      <p className="lead">{riparim.problemi}</p>

      <section className="panel">
        <StatusHapat statusi={riparim.statusi} />
      </section>

      <section className="panel">
        <dl className="facts">
          <div><dt>Dorëzuar në servis</dt><dd>{riparim.dorezuar}</dd></div>
          <div><dt>Statusi</dt><dd>{riparim.statusi}</dd></div>
          <div><dt>Çmimi i vlerësuar</dt><dd className="price">{riparim.cmimi} €</dd></div>
        </dl>
      </section>

      {riparim.shtese ? (
        <section className="panel panel--notice">
          <h2>Kosto shtesë</h2>
          <p>{riparim.shtese.arsyeja}</p>
          <dl className="facts">
            <div><dt>Shtesë</dt><dd className="price">+{riparim.shtese.cmimi} €</dd></div>
            <div><dt>Gjithsej pas miratimit</dt><dd className="price">{riparim.cmimi + riparim.shtese.cmimi} €</dd></div>
          </dl>
          <Link className="action action--block" href={`/riparimi/${id}/miratimi`}>
            Mirato koston shtesë
          </Link>
        </section>
      ) : (
        <button className="action action--block" disabled>Nuk ka kosto shtesë</button>
      )}
    </main>
  );
}
