import { redirect } from "next/navigation";
import { Dergo } from "@/components/Dergo";
import { Toast } from "@/components/Toast";
import { getSql } from "@/lib/db";
import { lexoServisin } from "@/lib/riparimet";
import { vetemPronari } from "@/lib/servisi";
import { anuloFtesen, ftoStafin, hiqStafin, ruajServisin } from "./actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, [string, "ok" | "gabim"]> = {
  servisi: ["Të dhënat e servisit u ruajtën.", "ok"],
  fushe: ["Emri është i detyrueshëm dhe telefoni duhet të jetë si 044 123 456.", "gabim"],
  email: ["Shkruaj një email të vlefshëm.", "gabim"],
  ftesa: ["Ftesa u ruajt. Bëhet staf kur hyn me Google me këtë email.", "ok"],
  "stafi-shtuar": ["U shtua në staf.", "ok"],
  "stafi-hequr": ["U hoq nga stafi.", "ok"],
  "ftesa-anuluar": ["Ftesa u anulua.", "ok"],
};

export default async function Cilesimet({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const pronari = await vetemPronari();
  if (!pronari) redirect("/servisi");
  const { m } = await searchParams;
  const sql = getSql();
  const [servisi, stafi, ftesat] = await Promise.all([
    lexoServisin(),
    sql`SELECT llogaria_id AS id, emri, email, roli FROM profilet WHERE roli IN ('servis', 'pronar') ORDER BY roli DESC, emri`,
    sql`SELECT email FROM ftesat ORDER BY krijuar`,
  ]);
  const toast = m ? mesazhet[m] : undefined;

  return (
    <main>
      <header className="page-head">
        <h1>Cilësimet</h1>
        <p className="muted">Vetëm pronari i sheh.</p>
      </header>

      <form action={ruajServisin} className="panel form">
        <h2>Servisi</h2>
        <p className="muted">Klienti i sheh te linku i riparimit dhe në fletën me QR.</p>
        <label htmlFor="emri">Emri</label>
        <input id="emri" name="emri" maxLength={60} required defaultValue={servisi.emri} />
        <label htmlFor="tel">Telefoni</label>
        <input id="tel" name="telefoni" type="tel" inputMode="tel" maxLength={20} defaultValue={servisi.telefoni ?? ""} placeholder="044 123 456" />
        <label htmlFor="orari">Orari</label>
        <input id="orari" name="orari" maxLength={80} defaultValue={servisi.orari ?? ""} placeholder="E hënë–e shtunë · 09:00–19:00" />
        <label htmlFor="adresa">Adresa</label>
        <input id="adresa" name="adresa" maxLength={120} defaultValue={servisi.adresa ?? ""} placeholder="Rruga dhe lagjja" />
        <Dergo>Ruaj</Dergo>
      </form>

      <section className="panel">
        <h2>Stafi</h2>
        <ul className="people">
          {(stafi as { id: string; emri: string; email: string | null; roli: string }[]).map((s) => (
            <li key={s.id}>
              <span className="avatar" aria-hidden="true">{[...s.emri][0]?.toUpperCase()}</span>
              <span className="people__who"><strong>{s.emri}</strong><span className="muted">{s.email ?? ""}</span></span>
              {s.roli === "pronar" ? <span className="tag tag--neutral">Pronar</span> : (
                <form action={hiqStafin}>
                  <input type="hidden" name="id" value={s.id} />
                  <Dergo className="action action--ghost" pritja="…">Hiq</Dergo>
                </form>
              )}
            </li>
          ))}
          {(ftesat as { email: string }[]).map((f) => (
            <li key={f.email}>
              <span className="avatar avatar--pending" aria-hidden="true">@</span>
              <span className="people__who"><strong>{f.email}</strong><span className="muted">Ftesë në pritje</span></span>
              <form action={anuloFtesen}>
                <input type="hidden" name="email" value={f.email} />
                <Dergo className="action action--ghost" pritja="…">Anulo</Dergo>
              </form>
            </li>
          ))}
        </ul>
        <form action={ftoStafin} className="note-form">
          <input name="email" type="email" required placeholder="email@gmail.com" aria-label="Email-i i stafit të ri" autoComplete="off" />
          <Dergo className="action" pritja="…">Fto</Dergo>
        </form>
        <p className="hint">Personi bëhet staf kur hyn me Google me këtë email.</p>
      </section>

      {toast && <Toast mesazhi={toast[0]} ton={toast[1]} />}
    </main>
  );
}
