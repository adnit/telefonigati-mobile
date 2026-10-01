import { KartaRiparimi } from "@/components/KartaRiparimi";
import { riparimet } from "@/lib/riparimet";

export default function Home() {
  return (
    <main>
      <h1>TelefoniGati · Riparimet e mia</h1>
      <p>Shiko statusin e riparimit pa telefonuar në servis.</p>
      <div className="repair-list">
        {riparimet.map((riparim) => (
          <KartaRiparimi key={riparim.id} riparim={riparim} />
        ))}
      </div>
    </main>
  );
}
