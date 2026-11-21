"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const IKONA = {
  lista: <path d="M4 6h16M4 12h16M4 18h10" />,
  shto: <path d="M12 5v14M5 12h14" />,
  grafik: <path d="M5 20V10M12 20V4M19 20v-7" />,
  cilesime: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
};

// Shiriti i poshtëm i stafit: tri ose katër vende kryesore, gjithmonë nën gisht.
export function Skeda({ pronar }: { pronar: boolean }) {
  const pathname = usePathname();
  const skedat = [
    { href: "/servisi", emri: "Riparimet", ikona: IKONA.lista, aktive: pathname === "/servisi" || pathname.startsWith("/servisi/riparimi") },
    { href: "/servisi/i-ri", emri: "I ri", ikona: IKONA.shto, aktive: pathname === "/servisi/i-ri" },
    { href: "/servisi/permbledhja", emri: "Përmbledhja", ikona: IKONA.grafik, aktive: pathname === "/servisi/permbledhja" },
    ...(pronar ? [{ href: "/servisi/cilesimet", emri: "Cilësimet", ikona: IKONA.cilesime, aktive: pathname === "/servisi/cilesimet" }] : []),
  ];
  return (
    <nav className="tabbar" aria-label="Menyja e servisit">
      {skedat.map((s) => (
        <Link key={s.href} href={s.href} className="tabbar__item" aria-current={s.aktive ? "page" : undefined}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.ikona}</svg>
          <span>{s.emri}</span>
        </Link>
      ))}
    </nav>
  );
}
