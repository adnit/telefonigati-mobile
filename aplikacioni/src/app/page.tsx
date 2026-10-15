import { KartaRiparimi } from "@/components/KartaRiparimi";
import { lexoRiparimet, type Riparim } from "@/lib/riparimet";

// Lexo bazën përsëri në çdo kërkesë për këtë faqe.
export const dynamic = "force-dynamic";

export default async function Home() {
  let riparimet: Riparim[];
  try {
    riparimet = await lexoRiparimet();
  } catch {
    return (
      <main>
        <h1>TelefoniGati</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        {/* <a> e rifreskon faqen plotësisht dhe provon lidhjen përsëri. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="action" href="/">Provo përsëri</a>
      </main>
    );
  }

  return (
    <main>
      <h1>TelefoniGati · Riparimet e mia</h1>
      <p>Shiko statusin e riparimit pa telefonuar në servis.</p>
      {riparimet.length === 0 ? (
        <p>Nuk ke riparime në servis për momentin.</p>
      ) : (
        <div className="repair-list">
          {riparimet.map((riparim) => (
            <KartaRiparimi key={riparim.id} riparim={riparim} />
          ))}
        </div>
      )}
    </main>
  );
}
