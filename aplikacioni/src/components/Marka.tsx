import Link from "next/link";

// Shenja e aplikacionit: e njëjta si ikona në ekranin e telefonit.
export function Marka({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="TelefoniGati, faqja kryesore">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5l5 5L19.5 7" /></svg>
      </span>
      TelefoniGati
    </Link>
  );
}
