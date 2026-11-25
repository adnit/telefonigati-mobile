import Link from "next/link";
import { Ikona } from "@/components/Ikona";
import { NavScroll } from "@/components/NavScroll";

// Shiriti i sipërm: butoni i kthimit (rreth xhami) majtas, titulli i vogël në mes që shfaqet kur
// titulli i madh del nga ekrani, dhe veprimet djathtas.
export function Nav({ prapa, titulli, djathtas }: {
  prapa?: { href: string; emri: string };
  titulli?: string;
  djathtas?: React.ReactNode;
}) {
  return (
    <nav className="nav" aria-label="Navigimi">
      <NavScroll />
      <div className="nav__side">
        {prapa && (
          <Link href={prapa.href} className="nav__back" aria-label={`Kthehu te ${prapa.emri}`}>
            <Ikona emri="majtas" madhesia={22} trashesia={2.4} />
          </Link>
        )}
      </div>
      <div className="nav__title" aria-hidden="true">{titulli}</div>
      <div className="nav__side nav__side--end">{djathtas}</div>
    </nav>
  );
}

export function PageTitle({ titulli, nentitulli, sipër }: { titulli: string; nentitulli?: React.ReactNode; sipër?: React.ReactNode }) {
  return (
    <header className="page-title">
      {sipër && <p className="eyebrow">{sipër}</p>}
      <h1>{titulli}</h1>
      {nentitulli && <p>{nentitulli}</p>}
    </header>
  );
}
