// Skeletet e ngarkimit: ndërtohen me të njëjtat klasa si faqet e vërteta (shiriti, kartat, rreshtat),
// që kur mbërrijnë të dhënat asgjë të mos kërcejë, vetëm vijat gri zëvendësohen me tekst.

type Gjeresi = number | string;
const w = (x: Gjeresi) => (typeof x === "number" ? `${x}%` : x);

export function Sk({ gjeresia = 60, lartesia = 14, rreth = false, className = "" }: {
  gjeresia?: Gjeresi; lartesia?: number; rreth?: boolean; className?: string;
}) {
  return <span className={`sk${rreth ? " sk--round" : ""} ${className}`} style={{ width: w(gjeresia), height: lartesia }} />;
}

// Shiriti i sipërm me butonat e xhamit (bosh).
export function SkNav({ prapa = false, djathtas = 0 }: { prapa?: boolean; djathtas?: number }) {
  return (
    <div className="nav" aria-hidden="true">
      <div className="nav__side">{prapa && <span className="nav__back" />}</div>
      <div />
      <div className="nav__side nav__side--end">{Array.from({ length: djathtas }, (_, i) => <span key={i} className="nav__icon" />)}</div>
    </div>
  );
}

export function SkTitulli({ siper = false, nentitulli = true, gjeresia = 55 }: { siper?: boolean; nentitulli?: boolean; gjeresia?: number }) {
  return (
    <div className="page-title sk-title" aria-hidden="true">
      {siper && <Sk gjeresia={38} lartesia={12} />}
      <Sk gjeresia={gjeresia} lartesia={34} />
      {nentitulli && <Sk gjeresia={70} lartesia={14} />}
    </div>
  );
}

// Grup rreshtash si te listat e iOS; me ikonë katrore (si te riparimet) ose rrethore (avatar).
export function SkGrupi({ rreshta = 3, ikona = "asnje", koka = true, dyRreshta = true, vlera = true }: {
  rreshta?: number; ikona?: "asnje" | "katror" | "i-madh" | "rreth"; koka?: boolean; dyRreshta?: boolean; vlera?: boolean;
}) {
  return (
    <div className="group" aria-hidden="true">
      {koka && <div className="group__head"><Sk gjeresia={30} lartesia={11} /></div>}
      <div className="group__body">
        {Array.from({ length: rreshta }, (_, i) => (
          <div key={i} className={`row${ikona !== "asnje" ? " row--icon" : ""}${ikona === "i-madh" ? " repair" : ""}`}>
            {ikona === "katror" && <span className="sk sk-icon" />}
            {ikona === "i-madh" && <span className="sk sk-icon sk-icon--lg" />}
            {ikona === "rreth" && <span className="sk sk--round" style={{ width: 36, height: 36 }} />}
            <span className="row__main sk-lines">
              <Sk gjeresia={[62, 48, 56, 44][i % 4]} lartesia={15} />
              {dyRreshta && <Sk gjeresia={[40, 52, 34, 46][i % 4]} lartesia={12} />}
            </span>
            {vlera && <Sk gjeresia={42} lartesia={14} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// Karta e statusit: ikona rrethore, statusi i madh, tri shiritat e hapave dhe (opsionale) butoni.
export function SkStatusi({ butoni = false, eta = false }: { butoni?: boolean; eta?: boolean }) {
  return (
    <div className="status-card" aria-hidden="true">
      <div className="status-card__top">
        <span className="sk sk--round" style={{ width: 52, height: 52, flex: "none" }} />
        <span className="sk-lines" style={{ flex: 1 }}>
          <Sk gjeresia={30} lartesia={11} />
          <Sk gjeresia={65} lartesia={26} />
          <Sk gjeresia={55} lartesia={11} />
        </span>
      </div>
      {eta && <span className="sk" style={{ display: "block", height: 58, marginTop: 16, borderRadius: 12 }} />}
      <div className="steps">{[0, 1, 2].map((i) => <span key={i} className="sk" style={{ height: 5, borderRadius: 999 }} />)}</div>
      {butoni && <span className="sk" style={{ display: "block", height: 50, marginTop: 18, borderRadius: 999 }} />}
    </div>
  );
}

export function SkKapsula({ lartesia = 40 }: { lartesia?: number }) {
  return <span className="sk sk-capsule" style={{ height: lartesia }} aria-hidden="true" />;
}
