import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejRiparimin } from "@/lib/riparimet";

export const dynamic = "force-dynamic";

export default async function Miratimi({
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
      <Link href={`/riparimi/${id}`}>← Kthehu te detajet</Link>
      {riparim.shtese ? (
        <>
          <h1>Simulim: Miratuar</h1>
          <p>
            Miratimi i kostos shtesë (+{riparim.shtese.cmimi} €) për{" "}
            {riparim.pajisja} nuk është dërguar te servisi.
          </p>
          <p>Ruajtjen dhe statusin real do t’i shtojmë më vonë.</p>
        </>
      ) : <h1>Nuk ka kosto shtesë për miratim.</h1>}
    </main>
  );
}
