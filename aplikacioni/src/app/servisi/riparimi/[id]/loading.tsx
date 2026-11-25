import { SkGrupi, SkNav, SkStatusi, SkTitulli } from "@/components/Skeleti";

// Faqja e një riparimi: kthimi dhe ndarja në shirit, karta e statusit me butonin e hapit tjetër, klienti dhe detajet.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <SkNav prapa djathtas={1} />
      <SkTitulli siper gjeresia={68} />
      <SkStatusi butoni />
      <SkGrupi rreshta={3} ikona="katror" dyRreshta={false} vlera={false} />
      <SkGrupi rreshta={3} dyRreshta={false} />
    </main>
  );
}
