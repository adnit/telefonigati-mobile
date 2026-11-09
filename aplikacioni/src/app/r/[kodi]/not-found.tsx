import Link from "next/link";

export default function RiparimiNukUGjet() {
  return (
    <main>
      <section className="panel panel--center">
        <h1>Riparimi nuk u gjet</h1>
        <p className="muted">Ky link nuk përputhet me asnjë riparim. Kërkoja servisit linkun e saktë.</p>
        <Link className="action" href="/">Faqja kryesore</Link>
      </section>
    </main>
  );
}
