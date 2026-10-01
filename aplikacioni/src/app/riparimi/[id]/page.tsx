import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejRiparimin } from "@/lib/riparimet";

export default async function Detajet({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const riparim = gjejRiparimin(id);
  if (!riparim) notFound();

  return (
    <main>
      <Link href="/">← Kthehu te lista</Link>
      <h1>{riparim.pajisja}</h1>
      <p>Problemi: {riparim.problemi}</p>
      <p>Dorëzuar në servis: {riparim.dorezuar}</p>
      <p>Statusi: {riparim.statusi}</p>
      <p>Çmimi i vlerësuar: {riparim.cmimi} €</p>
      {riparim.shtese ? (
        <>
          <p>
            Kosto shtesë: {riparim.shtese.arsyeja} (+{riparim.shtese.cmimi} €)
          </p>
          <Link className="action" href={`/riparimi/${id}/miratimi`}>
            Mirato koston shtesë
          </Link>
        </>
      ) : <button className="action" disabled>Nuk ka kosto shtesë</button>}
    </main>
  );
}
