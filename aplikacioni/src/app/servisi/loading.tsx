import { SkGrupi, SkKapsula, SkNav, SkTitulli } from "@/components/Skeleti";

// Lista e riparimeve: "+" në shirit, titulli, Lista/Tabela, kërkimi dhe seksionet sipas statusit.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <SkNav djathtas={1} />
      <SkTitulli />
      <SkKapsula lartesia={40} />
      <SkKapsula lartesia={42} />
      <SkGrupi rreshta={2} ikona="i-madh" />
      <SkGrupi rreshta={3} ikona="i-madh" />
    </main>
  );
}
