import { Sk, SkGrupi, SkStatusi, SkTitulli } from "@/components/Skeleti";

// Faqja e klientit: marka, titulli i pajisjes, karta e statusit, pagesa dhe servisi.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <div className="brandbar" aria-hidden="true">
        <span className="brand"><span className="brand__mark" /><Sk gjeresia={110} lartesia={16} /></span>
      </div>
      <SkTitulli siper gjeresia={70} />
      <SkStatusi eta />
      <SkGrupi rreshta={2} dyRreshta={false} />
      <SkGrupi rreshta={2} ikona="katror" dyRreshta={false} vlera={false} />
    </main>
  );
}
