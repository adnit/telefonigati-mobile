import Link from "next/link";
import { redirect } from "next/navigation";
import { regjistroRiparimin } from "../actions";
import { FotoPranimi } from "@/components/FotoPranimi";
import { vetemServisi } from "@/lib/servisi";

export const dynamic = "force-dynamic";

export default async function RiparimIRi({ searchParams }: {
  searchParams: Promise<{ m?: string }>;
}) {
  if (!(await vetemServisi())) redirect("/servisi");
  const { m } = await searchParams;
  return (
    <main>
      <Link className="back" href="/servisi">← Riparimet</Link>
      <h1>Riparim i ri</h1>
      <p className="lead">Plotësoje në banak, kur klienti e lë telefonin.</p>
      <form action={regjistroRiparimin} className="panel form">
        <label htmlFor="pajisja">Pajisja</label>
        <input id="pajisja" name="pajisja" maxLength={80} required placeholder="p.sh. Samsung Galaxy A54" />
        <label htmlFor="problemi">Problemi</label>
        <textarea id="problemi" name="problemi" maxLength={200} rows={3} required placeholder="p.sh. Ekrani i thyer" />
        <label htmlFor="cmimi">Çmimi i vlerësuar (€)</label>
        <input id="cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="35" />
        <FotoPranimi />
        {m === "fushe" && <p role="alert">Plotëso pajisjen, problemin dhe një çmim në euro (0–9999).</p>}
        <button className="action action--block" type="submit">Regjistro dhe krijo linkun</button>
      </form>
    </main>
  );
}
