import Link from "next/link";

export default function RiparimiNukUGjet() {
  return (
    <main>
      <div className="card card--center" style={{ marginTop: "calc(60px + env(safe-area-inset-top, 0px))" }}>
        <h1 style={{ fontSize: "1.375rem" }}>Riparimi nuk u gjet</h1>
        <p className="card__sub">Ky link nuk përputhet me asnjë riparim. Kërkoja servisit linkun e saktë.</p>
        <Link className="btn btn--primary btn--block" href="/">Faqja kryesore</Link>
      </div>
    </main>
  );
}
