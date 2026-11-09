import Link from "next/link";
import { redirect } from "next/navigation";

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
      <h1>TelefoniGati</h1>
      <p className="lead">Statusi i riparimit të telefonit, pa telefonuar në servis.</p>

      <section className="panel">
        <h2>Ke lënë telefonin në servis?</h2>
        <p className="muted">Hape linkun që të dërgoi servisi, ose ngjite këtu.</p>
        <form action={hapKodin} className="form">
          <label htmlFor="kodi">Linku ose kodi i riparimit</label>
          <input id="kodi" name="kodi" autoComplete="off" autoCapitalize="none" autoCorrect="off"
            enterKeyHint="go" required />
          {m && mesazhet[m] && <p role="alert">{mesazhet[m]}</p>}
          <button className="action action--block" type="submit">Shiko riparimin</button>
        </form>
      </section>

      <p className="footer-link"><Link href="/servisi">Hyrja për servisin →</Link></p>
    </main>
  );
}
