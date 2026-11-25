import { Sk, SkGrupi, SkNav, SkTitulli } from "@/components/Skeleti";

// Përmbledhja: katër pllaka, karta e hipotezës dhe grafiku.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <SkNav />
      <SkTitulli gjeresia={62} />
      <div className="tiles" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="tile sk-lines"><span className="sk" style={{ width: 28, height: 28, borderRadius: 8 }} /><Sk gjeresia={40} lartesia={26} /><Sk gjeresia={70} lartesia={11} /></div>
        ))}
      </div>
      <div className="card sk-lines" aria-hidden="true"><Sk gjeresia={35} lartesia={11} /><Sk gjeresia={85} lartesia={18} /><Sk gjeresia={100} lartesia={8} /></div>
      <div className="card" aria-hidden="true"><Sk gjeresia={60} lartesia={16} /><span className="sk" style={{ display: "block", height: 150, marginTop: 18, borderRadius: 12 }} /></div>
      <SkGrupi rreshta={3} dyRreshta={false} />
    </main>
  );
}
