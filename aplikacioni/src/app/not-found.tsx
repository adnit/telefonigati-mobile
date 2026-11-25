import Link from "next/link";

export default function NukUGjet() {
  return (
    <main>
      <div className="card card--center" style={{ marginTop: "calc(60px + env(safe-area-inset-top, 0px))" }}>
        <h1 style={{ fontSize: "1.375rem" }}>Faqja nuk u gjet</h1>
        <p className="card__sub">Kontrollo linkun ose kthehu te faqja kryesore.</p>
        <Link className="btn btn--primary btn--block" href="/">Faqja kryesore</Link>
      </div>
    </main>
  );
}
