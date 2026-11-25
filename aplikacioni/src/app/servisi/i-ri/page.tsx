import { redirect } from "next/navigation";
import { regjistroRiparimin } from "../actions";
import { Dergo } from "@/components/Dergo";
import { FotoPranimi } from "@/components/FotoPranimi";
import { Ikona } from "@/components/Ikona";
import { Nav, PageTitle } from "@/components/Nav";
import { FormaPranimit } from "@/components/FormaPranimit";
import { lexoCmimet } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

export const dynamic = "force-dynamic";

const gabimet: Record<string, string> = {
  fushe: "Plotëso pajisjen, problemin dhe një çmim në euro (0–9999).",
  imei: "IMEI duhet të ketë 15 shifra dhe shifrën e kontrollit të saktë.",
  data: "Data e pritur duhet të jetë nga sot deri në 60 ditë.",
  telefoni: "Numri i telefonit nuk duket i saktë. Shkruaje si 044 123 456 ose +383 44 123 456.",
};

export default async function RiparimIRi({ searchParams }: {
  searchParams: Promise<{ m?: string }>;
}) {
  if (!(await vetemServisi())) redirect("/servisi");
  const { m } = await searchParams;
  const cmimet = await lexoCmimet().catch(() => []);
  return (
    <main>
      <Nav prapa={{ href: "/servisi", emri: "Riparimet" }} titulli="Riparim i ri" />
      <PageTitle titulli="Riparim i ri" nentitulli="Plotësoje në banak, kur klienti e lë telefonin." />
      <form action={regjistroRiparimin}>
        {m && gabimet[m] && <p className="alert" role="alert"><Ikona emri="kujdes" madhesia={18} />{gabimet[m]}</p>}

        <FormaPranimit cmimet={cmimet} />

        <section className="group" aria-label="Klienti">
          <div className="group__head"><h2>Klienti</h2></div>
          <div className="group__body">
            <div className="field">
              <label htmlFor="telefoni">Numri i telefonit</label>
              <input id="telefoni" name="telefoni" type="tel" inputMode="tel" autoComplete="off" maxLength={20} placeholder="044 123 456 (opsional)" />
            </div>
            <FotoPranimi />
          </div>
          <p className="group__foot">Numri përdoret vetëm për t&apos;i dërguar linkun në WhatsApp; e sheh vetëm stafi. Fotografo vetëm pajisjen, jo dokumente ose fytyra.</p>
        </section>

        <Dergo pritja="Po regjistrohet…">Regjistro dhe krijo linkun</Dergo>
      </form>
    </main>
  );
}
