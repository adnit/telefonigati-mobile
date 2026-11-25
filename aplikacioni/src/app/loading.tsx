import { SkGrupi, SkTitulli } from "@/components/Skeleti";

// Skeleti i përgjithshëm: titull dhe një grup rreshtash.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <div style={{ height: "calc(56px + env(safe-area-inset-top, 0px))" }} />
      <SkTitulli />
      <SkGrupi rreshta={3} />
    </main>
  );
}
