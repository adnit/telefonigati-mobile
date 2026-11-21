import Link from "next/link";
import { redirect } from "next/navigation";
import { regjistroRiparimin } from "../actions";
import { FotoPranimi } from "@/components/FotoPranimi";
import { Dergo } from "@/components/Dergo";
import { DataGati } from "@/components/DataGati";
import { SkanoImei } from "@/components/SkanoImei";
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
      <header className="page-head">
        <h1>Riparim i ri</h1>
        <p className="muted">Plotësoje në banak, kur klienti e lë telefonin.</p>
      </header>
      <form action={regjistroRiparimin} className="panel form">
        <label htmlFor="pajisja">Pajisja</label>
        <input id="pajisja" name="pajisja" maxLength={80} required placeholder="p.sh. Samsung Galaxy A54" />
        <label htmlFor="problemi">Problemi</label>
        <textarea id="problemi" name="problemi" maxLength={200} rows={3} required placeholder="p.sh. Ekrani i thyer" />
        <label htmlFor="cmimi">Çmimi i vlerësuar (€)</label>
        <input id="cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="35" />
        <SkanoImei />
        <DataGati />
        <label htmlFor="telefoni">Telefoni i klientit (opsional)</label>
        <input id="telefoni" name="telefoni" type="tel" inputMode="tel" autoComplete="off"
          maxLength={20} placeholder="p.sh. 044 123 456" />
        <p className="hint">Për t&apos;i dërguar linkun në WhatsApp. E sheh vetëm stafi.</p>
        <FotoPranimi />
        {m === "fushe" && <p role="alert">Plotëso pajisjen, problemin dhe një çmim në euro (0–9999).</p>}
        {m === "imei" && <p role="alert">IMEI duhet të ketë 15 shifra dhe shifrën e kontrollit të saktë.</p>}
        {m === "data" && <p role="alert">Data e pritur duhet të jetë nga sot deri në 60 ditë.</p>}
        {m === "telefoni" && <p role="alert">Numri i telefonit nuk duket i saktë. Shkruaje si 044 123 456 ose +383 44 123 456.</p>}
        <Dergo pritja="Po regjistrohet…">Regjistro dhe krijo linkun</Dergo>
      </form>
    </main>
  );
}
