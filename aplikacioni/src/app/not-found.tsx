import Link from "next/link";

export default function NukUGjet() {
  return (
    <main>
      <section className="panel panel--center">
        <h1>Faqja nuk u gjet</h1>
        <p className="muted">Kontrollo linkun ose kthehu te faqja kryesore.</p>
        <Link className="action" href="/">Faqja kryesore</Link>
      </section>
    </main>
  );
}
