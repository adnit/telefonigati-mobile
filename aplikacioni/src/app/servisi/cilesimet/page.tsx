import { redirect } from "next/navigation";
import { Dergo } from "@/components/Dergo";
import { Toast } from "@/components/Toast";
import { getSql } from "@/lib/db";
import { lexoCmimet, lexoServisin } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";
import Hyrja from "@/components/Hyrja";
import { Nav, PageTitle } from "@/components/Nav";
import { ZgjedhTemen } from "@/components/Tema";
import { anuloFtesen, fshiCmimin, ftoStafin, hiqStafin, ruajServisin, shtoCmimin } from "./actions";
import { Ikona } from "@/components/Ikona";
import { KATALOGU } from "@/lib/katalogu";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, [string, "ok" | "gabim"]> = {
  servisi: ["Të dhënat e servisit u ruajtën.", "ok"],
  fushe: ["Emri është i detyrueshëm dhe telefoni duhet të jetë si 044 123 456.", "gabim"],
  email: ["Shkruaj një email të vlefshëm.", "gabim"],
  ftesa: ["Ftesa u ruajt. Bëhet staf kur hyn me Google me këtë email.", "ok"],
  "stafi-shtuar": ["U shtua në staf.", "ok"],
  "stafi-hequr": ["U hoq nga stafi.", "ok"],
  "ftesa-anuluar": ["Ftesa u anulua.", "ok"],
  cmimi: ["Çmimi u ruajt në çmimore.", "ok"],
  "cmimi-fshire": ["Çmimi u hoq nga çmimorja.", "ok"],
  "cmimi-fushe": ["Shkruaj problemin, një çmim 0–9999 € dhe ditët 0–60.", "gabim"],
};

export default async function Cilesimet({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const p = await vetemServisi();
  if (!p) redirect("/servisi");
  const pronar = p.roli === "pronar";
  const { m } = await searchParams;
  const sql = getSql();
  const [servisi, stafi, ftesat, cmimet] = pronar ? await Promise.all([
    lexoServisin(),
    sql`SELECT llogaria_id AS id, emri, email, roli FROM profilet WHERE roli IN ('servis', 'pronar') ORDER BY roli DESC, emri`,
    sql`SELECT email FROM ftesat ORDER BY krijuar`,
    lexoCmimet(),
  ]) : [null, [], [], []];
  const toast = m ? mesazhet[m] : undefined;

  return (
    <main>
      <Nav />
      <PageTitle titulli="Cilësimet" />

      <section className="group" aria-label="Llogaria">
        <div className="group__body">
          <div className="row row--icon" style={{ "--sep-inset": "16px" } as React.CSSProperties}>
            <span className="avatar avatar--lg" aria-hidden="true">{[...p.emri][0]?.toUpperCase()}</span>
            <span className="row__main">
              <span className="row__title row__title--strong">{p.emri}</span>
              <span className="row__sub">{p.email ?? ""}</span>
            </span>
            <span className="badge tone--accent">{pronar ? "Pronar" : "Staf"}</span>
          </div>
        </div>
      </section>

      <section className="group" aria-label="Pamja">
        <div className="group__head"><h2>Pamja</h2></div>
        <div className="group__body"><div className="row"><span className="row__main"><ZgjedhTemen /></span></div></div>
        <p className="group__foot">“Automatike” ndjek temën e telefonit. Zgjedhja ruhet në këtë pajisje.</p>
      </section>

      {pronar && servisi && (
        <form action={ruajServisin} className="group" aria-label="Servisi">
          <div className="group__head"><h2>Servisi</h2></div>
          <div className="group__body">
            <div className="field"><label htmlFor="emri">Emri</label><input id="emri" name="emri" maxLength={60} required defaultValue={servisi.emri} /></div>
            <div className="field"><label htmlFor="tel">Telefoni</label><input id="tel" name="telefoni" type="tel" inputMode="tel" maxLength={20} defaultValue={servisi.telefoni ?? ""} placeholder="044 123 456" /></div>
            <div className="field"><label htmlFor="orari">Orari</label><input id="orari" name="orari" maxLength={80} defaultValue={servisi.orari ?? ""} placeholder="E hënë–e shtunë · 09:00–19:00" /></div>
            <div className="field"><label htmlFor="adresa">Adresa</label><input id="adresa" name="adresa" maxLength={120} defaultValue={servisi.adresa ?? ""} placeholder="Rruga dhe lagjja" /></div>
            <Dergo className="row row--button row--accent row--center">Ruaj</Dergo>
          </div>
          <p className="group__foot">Klienti i sheh te linku i riparimit dhe në fletën me QR.</p>
        </form>
      )}

      {pronar && (
        <section className="group people" aria-label="Stafi">
          <div className="group__head"><h2>Stafi</h2></div>
          <div className="group__body">
            {(stafi as { id: string; emri: string; email: string | null; roli: string }[]).map((s) => (
              <div key={s.id} className="row row--icon" style={{ "--sep-inset": "64px" } as React.CSSProperties}>
                <span className="avatar" aria-hidden="true">{[...s.emri][0]?.toUpperCase()}</span>
                <span className="row__main"><span className="row__title">{s.emri}</span><span className="row__sub row__sub--clamp">{s.email ?? ""}</span></span>
                {s.roli === "pronar" ? <span className="row__value" style={{ fontSize: "0.9375rem" }}>Pronar</span> : (
                  <form action={hiqStafin}>
                    <input type="hidden" name="id" value={s.id} />
                    <Dergo className="btn btn--danger btn--small" pritja="…">Hiq</Dergo>
                  </form>
                )}
              </div>
            ))}
            {(ftesat as { email: string }[]).map((f) => (
              <div key={f.email} className="row row--icon" style={{ "--sep-inset": "64px" } as React.CSSProperties}>
                <span className="avatar avatar--pending" aria-hidden="true">@</span>
                <span className="row__main"><span className="row__title row__sub--clamp">{f.email}</span><span className="row__sub">Ftesë në pritje</span></span>
                <form action={anuloFtesen}>
                  <input type="hidden" name="email" value={f.email} />
                  <Dergo className="btn btn--gray btn--small" pritja="…">Anulo</Dergo>
                </form>
              </div>
            ))}
            <form action={ftoStafin} className="inline-form">
              <input className="input" name="email" type="email" required placeholder="email@gmail.com" aria-label="Email-i i stafit të ri" autoComplete="off" autoCapitalize="none" />
              <Dergo className="btn btn--tinted btn--small" pritja="…">Fto</Dergo>
            </form>
          </div>
          <p className="group__foot">Personi bëhet staf kur hyn me Google me këtë email.</p>
        </section>
      )}

      {pronar && (
        <section className="group" id="cmimorja" aria-label="Çmimorja">
          <div className="group__head"><h2>Çmimorja</h2><span className="group__count">{cmimet.length}</span></div>
          <div className="group__body">
            {cmimet.map((c) => (
              <div key={c.id} className="row">
                <span className="row__main">
                  <span className="row__title">{c.problemi}</span>
                  <span className="row__sub">{c.modeli ?? c.marka ?? "Çdo telefon"}{c.dite != null ? ` · ${c.dite === 0 ? "gati sot" : `${c.dite} ditë`}` : ""}</span>
                </span>
                <span className="row__value row__value--strong">{c.cmimi} €</span>
                <form action={fshiCmimin}>
                  <input type="hidden" name="id" value={c.id} />
                  <Dergo className="btn btn--gray btn--small btn--icon" pritja="…"><Ikona emri="mbyll" madhesia={13} trashesia={2.8} /><span className="visually-hidden">Hiq {c.problemi}</span></Dergo>
                </form>
              </div>
            ))}
          </div>
          <p className="group__foot">Te pranimi, çmimi dhe data plotësohen vetë kur problemi dhe marka përputhen. Modeli i saktë ka përparësi para markës.</p>
        </section>
      )}

      {pronar && (
        <form action={shtoCmimin} className="group" aria-label="Shto në çmimore">
          <div className="group__head"><h2>Shto në çmimore</h2></div>
          <div className="group__body">
            <div className="field"><label htmlFor="c-problemi">Problemi</label><input id="c-problemi" name="problemi" maxLength={60} required placeholder="p.sh. Ekrani i thyer" list="c-problemet" />
              <datalist id="c-problemet">{["Ekrani i thyer", "Bateria", "Nuk karikohet", "Kamera", "Ra në ujë", "Nuk ndizet", "Altoparlanti", "Softueri"].map((x) => <option key={x} value={x} />)}</datalist></div>
            <div className="field"><label htmlFor="c-marka">Marka</label>
              <select id="c-marka" name="marka" defaultValue=""><option value="">Çdo telefon</option>{KATALOGU.map((k) => <option key={k.marka} value={k.marka}>{k.marka}</option>)}</select></div>
            <div className="field"><label htmlFor="c-modeli">Modeli (opsional)</label><input id="c-modeli" name="modeli" maxLength={80} placeholder="p.sh. Galaxy A54" /></div>
            <div className="field"><label htmlFor="c-cmimi">Çmimi</label><span className="field__affix"><input id="c-cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="85" /><span>€</span></span></div>
            <div className="field"><label htmlFor="c-dite">Gati pas (ditë, opsionale)</label><input id="c-dite" name="dite" inputMode="numeric" pattern="\d{1,2}" maxLength={2} placeholder="2" /></div>
            <Dergo className="row row--button row--accent row--center">Shto në çmimore</Dergo>
          </div>
        </form>
      )}

      <section className="group" aria-label="Dalja"><div className="group__body"><Hyrja brenda /></div></section>

      {toast && <Toast mesazhi={toast[0]} ton={toast[1]} />}
    </main>
  );
}
