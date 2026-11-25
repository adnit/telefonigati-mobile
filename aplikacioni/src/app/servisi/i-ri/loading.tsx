import { Sk, SkNav, SkTitulli } from "@/components/Skeleti";

// Pranimi: fushat e formularit në grupe, me etiketën e vogël sipër secilës.
function Fushat({ n }: { n: number }) {
  return (
    <div className="group" aria-hidden="true">
      <div className="group__head"><Sk gjeresia={24} lartesia={11} /></div>
      <div className="group__body">
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="field sk-lines"><Sk gjeresia={22} lartesia={10} /><Sk gjeresia={[60, 45, 70][i % 3]} lartesia={16} /></div>
        ))}
      </div>
    </div>
  );
}

export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <SkNav prapa />
      <SkTitulli gjeresia={50} />
      <Fushat n={4} />
      <Fushat n={2} />
    </main>
  );
}
