"use client";

// Gabim në vetë layout-in kryesor: faqja nuk ka as stilet e aplikacionit, prandaj ka stilin e vet të thjeshtë.
export default function GabimGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="sq">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f2f2f7", color: "#000" }}>
        <main style={{ maxWidth: 380, textAlign: "center", background: "#fff", borderRadius: 24, padding: "28px 22px" }}>
          <h1 style={{ fontSize: "1.375rem", margin: "0 0 8px" }}>TelefoniGati nuk u hap</h1>
          <p style={{ color: "#6c6c70", margin: "0 0 20px" }}>Diçka shkoi keq. Provo përsëri; nëse vazhdon, kontrollo internetin.</p>
          <button type="button" onClick={reset} style={{ width: "100%", minHeight: 50, border: 0, borderRadius: 999,
            background: "#0062cc", color: "#fff", font: "inherit", fontWeight: 600, fontSize: "1.0625rem" }}>Provo përsëri</button>
        </main>
      </body>
    </html>
  );
}
