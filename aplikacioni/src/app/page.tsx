import Link from "next/link";
import { redirect } from "next/navigation";
import { Ikona } from "@/components/Ikona";
import { ZgjedhTemen } from "@/components/Tema";

const mesazhet: Record<string, string> = {
  kodi: "Ky link nuk është i vlefshëm. Kërkoja servisit linkun e riparimit.",
};

// Klienti zakonisht hyn drejtpërdrejt nga linku që i dërgon servisi.
async function hapKodin(formData: FormData) {
  "use server";
  const v = String(formData.get("kodi") ?? "").trim();
  // Pranon edhe linkun e plotë, jo vetëm kodin.
  const kodi = v.match(/[0-9a-f]{32}/i)?.[0]?.toLowerCase();
  redirect(kodi ? `/r/${kodi}` : "/?m=kodi");
}

export default async function Home({ searchParams }: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  return (
    <main>
      <section className="hero" style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}>
        <span className="hero__icon"><Ikona emri="rregull" madhesia={40} trashesia={2.6} /></span>
        <h1>Ku është telefoni yt tani?</h1>
        <p>Shiko statusin e riparimit dhe mirato koston shtesë nga telefoni, pa e thirrur servisin.</p>
      </section>

      <form action={hapKodin}>
        {m && mesazhet[m] && <p className="alert" role="alert"><Ikona emri="kujdes" madhesia={18} />{mesazhet[m]}</p>}
        <div className="group">
          <div className="group__body">
            <div className="field">
              <label htmlFor="kodi">Linku ose kodi i riparimit</label>
              <input id="kodi" name="kodi" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                enterKeyHint="go" required placeholder="Ngjite linkun që të dërgoi servisi" />
            </div>
          </div>
          <p className="group__foot">Zakonisht nuk të duhet: hape direkt linkun nga WhatsApp ose skano QR-në në fletë.</p>
        </div>
        <button className="btn btn--primary btn--block" type="submit">Shiko riparimin</button>
      </form>

      <Link className="footer-link" href="/servisi">Hyrja për servisin</Link>
      <div className="theme-pick"><ZgjedhTemen /></div>
    </main>
  );
}
