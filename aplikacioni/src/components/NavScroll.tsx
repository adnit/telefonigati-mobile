"use client";

import { useEffect, useRef } from "react";

// Kur titulli i madh i faqes del sipër ekranit, shiriti i sipërm shfaq titullin e vogël dhe mjegullën e buzës.
export function NavScroll() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const nav = ref.current?.parentElement;
    const titulli = document.querySelector(".page-title h1");
    if (!nav) return;
    if (!titulli) {
      const kontrollo = () => nav.setAttribute("data-scrolled", String(window.scrollY > 8));
      kontrollo();
      window.addEventListener("scroll", kontrollo, { passive: true });
      return () => window.removeEventListener("scroll", kontrollo);
    }
    const vrojtuesi = new IntersectionObserver(([e]) => nav.setAttribute("data-scrolled", String(!e.isIntersecting)),
      { rootMargin: "-56px 0px 0px 0px" });
    vrojtuesi.observe(titulli);
    return () => vrojtuesi.disconnect();
  }, []);
  return <span ref={ref} hidden />;
}
