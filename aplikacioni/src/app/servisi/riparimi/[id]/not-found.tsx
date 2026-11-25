import Link from "next/link";

export default function NukUGjet() {
  return (
    <main>
      <div className="card card--center" style={{ marginTop: "calc(60px + env(safe-area-inset-top, 0px))" }}>
        <h1 style={{ fontSize: "1.375rem" }}>Riparimi nuk u gjet</h1>
        <Link className="btn btn--primary btn--block" href="/servisi">Kthehu te riparimet</Link>
      </div>
    </main>
  );
}
