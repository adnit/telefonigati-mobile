"use client";

import Link from "next/link";

// Çdo gabim i papritur shfaq një rrugëdalje, jo një faqe të bardhë.
export default function Gabim({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <div className="card card--center" style={{ marginTop: "calc(60px + env(safe-area-inset-top, 0px))" }}>
        <h1 style={{ fontSize: "1.375rem" }}>Diçka nuk shkoi mirë</h1>
        <p className="card__sub">Provo përsëri. Nëse vazhdon, kontrollo lidhjen me internet.</p>
        <button type="button" className="btn btn--primary btn--block" onClick={reset}>Provo përsëri</button>
        <Link href="/" className="footer-link">Faqja kryesore</Link>
      </div>
    </main>
  );
}
