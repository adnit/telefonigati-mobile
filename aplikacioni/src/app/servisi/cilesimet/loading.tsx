import { Sk, SkGrupi, SkKapsula, SkNav, SkTitulli } from "@/components/Skeleti";

// Cilësimet: llogaria me avatar, pamja (zgjedhja e temës) dhe grupet e pronarit.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <SkNav />
      <SkTitulli nentitulli={false} gjeresia={52} />
      <div className="group" aria-hidden="true"><div className="group__body"><div className="row row--icon">
        <span className="sk sk--round" style={{ width: 56, height: 56, flex: "none" }} />
        <span className="row__main sk-lines"><Sk gjeresia={45} lartesia={16} /><Sk gjeresia={60} lartesia={12} /></span>
      </div></div></div>
      <div className="group" aria-hidden="true"><div className="group__head"><Sk gjeresia={18} lartesia={11} /></div>
        <div className="group__body"><div className="row"><SkKapsula lartesia={38} /></div></div></div>
      <SkGrupi rreshta={4} dyRreshta={false} vlera={false} />
    </main>
  );
}
