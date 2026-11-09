import Link from "next/link";

export default function NukUGjet() {
  return (
    <main>
      <section className="panel panel--center">
        <h1>Riparimi nuk u gjet</h1>
        <Link className="action" href="/servisi">Kthehu te riparimet</Link>
      </section>
    </main>
  );
}
