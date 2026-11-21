"use client";

import Link from "next/link";

// Çdo gabim i papritur shfaq një rrugëdalje, jo një faqe të bardhë.
export default function Gabim({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <section className="panel panel--center">
        <h1>Diçka nuk shkoi mirë</h1>
        <p className="muted">Provo përsëri. Nëse vazhdon, kontrollo lidhjen me internet.</p>
        <button className="action" onClick={reset}>Provo përsëri</button>
        <Link href="/" className="footer-link">Faqja kryesore</Link>
      </section>
    </main>
  );
}
