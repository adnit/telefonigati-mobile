import Link from "next/link";
import { redirect } from "next/navigation";
import { Ikona } from "@/components/Ikona";
import { Live } from "@/components/Live";
import { Nav, PageTitle } from "@/components/Nav";
import { PamjaListes } from "@/components/PamjaListes";
import { Tabela } from "@/components/Tabela";
import { lexoRiparimet, versioniIListes } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

export const dynamic = "force-dynamic";

// Tabela (kanban) e riparimeve në punë: e njëjta listë si "Riparimet", e ndarë në kolona sipas statusit.
export default async function TabelaFaqe() {
  if (!(await vetemServisi())) redirect("/servisi");
  const [riparimet, versioni] = await Promise.all([lexoRiparimet(), versioniIListes()]);
  const aktive = riparimet.filter((r) => r.statusi !== "Marrë");
  return (
    <main className="main--wide">
      <Live url="/api/servisi/versioni" versioni={versioni} />
      <Nav titulli="Tabela" djathtas={
        <Link href="/servisi/i-ri" className="nav__icon nav__icon--filled" aria-label="Riparim i ri"><Ikona emri="shto" madhesia={20} trashesia={2.6} /></Link>
      } />
      <PageTitle titulli="Riparimet" nentitulli="Tërhiq kartën nga ⋮⋮ te kolona tjetër, ose prek → për hapin tjetër." />
      <PamjaListes aktive="tabela" />
      <Tabela riparimet={aktive} />
    </main>
  );
}
