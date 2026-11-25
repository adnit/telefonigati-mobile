import { Sk, SkKapsula, SkNav, SkTitulli } from "@/components/Skeleti";

// Tabela: ndërruesi Lista/Tabela, skedat e kolonave dhe një kolonë me karta.
export default function Duke() {
  return (
    <main className="main--wide" aria-busy="true" aria-label="Po ngarkohet">
      <SkNav djathtas={1} />
      <SkTitulli />
      <SkKapsula lartesia={40} />
      <SkKapsula lartesia={48} />
      <div className="board" aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <div key={k} className="board__col tone--marre" data-aktive={k === 0}>
            <div className="board__head"><Sk gjeresia={40} lartesia={14} /></div>
            <div className="board__cards">
              {[0, 1, 2].map((i) => (
                <div key={i} className="kcard"><div className="kcard__body">
                  <span className="sk" style={{ width: 30, height: 30, borderRadius: 9, flex: "none" }} />
                  <span className="kcard__main sk-lines" style={{ flex: 1 }}><Sk gjeresia={70} lartesia={14} /><Sk gjeresia={50} lartesia={11} /><Sk gjeresia={40} lartesia={11} /></span>
                </div></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
