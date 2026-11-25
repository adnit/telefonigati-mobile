import Link from "next/link";
import { redirect } from "next/navigation";
import { Ikona } from "@/components/Ikona";
import { Nav } from "@/components/Nav";

const mesazhet: Record<string, string> = {
  kodi: "Ky link nuk është i vlefshëm. Kërkoja servisit linkun e riparimit.",
  "llogaria-fshire": "Llogaria u fshi. Linqet e riparimeve vazhdojnë të punojnë.",
};

// Klienti zakonisht hyn drejtpërdrejt nga linku që i dërgon servisi.
async function hapKodin(formData: FormData) {
  "use server";
  const v = String(formData.get("kodi") ?? "").trim();
  // Pranon edhe linkun e plotë, jo vetëm kodin.
  const kodi = v.match(/[0-9a-f]{32}/i)?.[0]?.toLowerCase();
  redirect(kodi ? `/r/${kodi}` : "/?m=kodi");
}

const PIKAT = [
  { ikona: "ore" as const, titulli: "Statusi në kohë reale", teksti: "Shiko kur telefoni hyn në riparim dhe kur del gati." },
  { ikona: "euro" as const, titulli: "Kosto shtesë pa telefonata", teksti: "Mirato ose refuzo me një prekje." },
  { ikona: "zile" as const, titulli: "Njoftim kur është gati", teksti: "Pa e hapur faqen dhe pa thirrur servisin." },
];

export default async function Home({ searchParams }: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  return (
    <main className="welcome">
      <Nav djathtas={<Link href="/llogaria" className="nav__icon" aria-label="Riparimet e mia"><Ikona emri="njeri" madhesia={20} /></Link>} />
      <div className="welcome__body" style={{ paddingTop: 8 }}>
        <header className="welcome__head">
          <span className="welcome__icon"><Ikona emri="telefonGati" madhesia={52} trashesia={1.7} /></span>
          <h1>Ku është telefoni yt tani?</h1>
          <p>Ndiq riparimin nga telefoni, pa e thirrur servisin.</p>
        </header>
        <div className="welcome__points">
          {PIKAT.map((x) => (
            <div key={x.titulli} className="welcome__point">
              <Ikona emri={x.ikona} madhesia={30} trashesia={1.8} />
              <div><strong>{x.titulli}</strong><span>{x.teksti}</span></div>
            </div>
          ))}
        </div>
      </div>

      <form action={hapKodin} className="welcome__actions">
        {m && mesazhet[m] && <p className={`alert${m === "llogaria-fshire" ? " alert--ok" : ""}`} role="alert"><Ikona emri={m === "llogaria-fshire" ? "rregull" : "kujdes"} madhesia={18} />{mesazhet[m]}</p>}
        <div className="group">
          <div className="group__body">
            <div className="field">
              <label htmlFor="kodi">Linku ose kodi i riparimit</label>
              <input id="kodi" name="kodi" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                enterKeyHint="go" required placeholder="Ngjite linkun nga servisi" />
            </div>
          </div>
        </div>
        <button className="btn btn--primary btn--block btn--large" type="submit">Shiko riparimin</button>
        <Link className="btn btn--plain" href="/servisi">Jam staf i servisit</Link>
      </form>
    </main>
  );
}
