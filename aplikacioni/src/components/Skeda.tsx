"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ikona, type EmriIkones } from "@/components/Ikona";

// Shiriti i poshtëm i stafit: kapsulë xhami me tri vende kryesore. "Lentja" rrëshqet te skeda aktive.
export function Skeda() {
  const pathname = usePathname();
  const skedat: { href: string; emri: string; ikona: EmriIkones; aktive: boolean }[] = [
    { href: "/servisi", emri: "Riparimet", ikona: "lista", aktive: pathname === "/servisi" || pathname.startsWith("/servisi/riparimi") || pathname === "/servisi/i-ri" || pathname === "/servisi/tabela" },
    { href: "/servisi/permbledhja", emri: "Përmbledhja", ikona: "grafik", aktive: pathname === "/servisi/permbledhja" },
    { href: "/servisi/cilesimet", emri: "Cilësimet", ikona: "cilesime", aktive: pathname === "/servisi/cilesimet" },
  ];
  const i = Math.max(0, skedat.findIndex((s) => s.aktive));
  return (
    <nav className="tabbar" aria-label="Menyja e servisit" style={{ "--i": i, "--n": skedat.length } as React.CSSProperties}>
      <span className="tabbar__lens" aria-hidden="true" />
      {skedat.map((s) => (
        <Link key={s.href} href={s.href} className="tabbar__item" aria-current={s.aktive ? "page" : undefined}>
          <Ikona emri={s.ikona} madhesia={24} trashesia={s.aktive ? 2.3 : 1.9} />
          <span>{s.emri}</span>
        </Link>
      ))}
    </nav>
  );
}
