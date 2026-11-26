"use client";

import { useEffect, useRef } from "react";
import { Ikona } from "@/components/Ikona";

// Fletë që ngjitet nga poshtë, si në aplikacionet e telefonit. Përdor <dialog>, prandaj fokusi,
// Escape dhe sfondi menaxhohen nga shfletuesi. Mbyllet me ✕, me prekje jashtë, ose duke e tërhequr poshtë:
// fleta ndjek gishtin 1:1 dhe mbyllet kur lëshohet larg ose me shpejtësi; përndryshe kthehet në vend.
// hapur: fleta hapet vetë sapo shfaqet faqja (p.sh. "Klienti e mori" nga tabela hap menjëherë nënshkrimin).
export function Sheet({ butoni, titulli, klasaButonit = "btn btn--gray btn--block", hapur = false, children }: {
  butoni: React.ReactNode;
  titulli: string;
  klasaButonit?: string;
  hapur?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const terheqja = useRef<{ y0: number; y: number; t: number; v: number } | null>(null);

  // Pasi hyn, animacioni i hyrjes çaktivizohet: përndryshe rinis kur mbaron tërheqja dhe lufton me gishtin.
  function hap() {
    const d = ref.current; if (!d) return;
    d.style.animation = "";
    d.showModal();
    d.addEventListener("animationend", () => { d.style.animation = "none"; }, { once: true });
  }

  useEffect(() => {
    if (!hapur) return;
    hap();
    // Parametri që e hapi hiqet nga adresa, që rifreskimi të mos e hapë sërish.
    const u = new URL(window.location.href);
    if (u.searchParams.has("marrja")) { u.searchParams.delete("marrja"); window.history.replaceState(null, "", u.pathname + u.search); }
  }, [hapur]);

  function mbyll() {
    const d = ref.current;
    if (!d || !d.open || d.classList.contains("is-closing")) return;
    // Animacioni i daljes nis nga pozicioni aktual (edhe kur fleta është tërhequr përgjysmë).
    const kaLevizje = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    d.style.animation = "";
    if (!kaLevizje) { d.close(); return; }
    d.classList.add("is-closing");
    d.addEventListener("animationend", () => { d.classList.remove("is-closing"); d.style.transform = ""; d.close(); }, { once: true });
  }

  function poshte(e: React.PointerEvent) {
    const d = ref.current; if (!d) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    terheqja.current = { y0: e.clientY, y: 0, t: e.timeStamp, v: 0 };
    d.classList.add("is-dragging");
  }
  function leviz(e: React.PointerEvent) {
    const s = terheqja.current, d = ref.current; if (!s || !d) return;
    const dy = e.clientY - s.y0;
    // Lart rezistencë (si gome), poshtë 1:1 me gishtin.
    const y = dy < 0 ? -Math.sqrt(-dy) * 2 : dy;
    const dt = Math.max(1, e.timeStamp - s.t);
    s.v = (y - s.y) / dt; s.y = y; s.t = e.timeStamp;
    d.style.transform = `translateY(${y}px)`;
  }
  function lesho() {
    const s = terheqja.current, d = ref.current; terheqja.current = null; if (!s || !d) return;
    d.classList.remove("is-dragging");
    if (s.y > d.offsetHeight * 0.3 || s.v > 0.6) {
      d.style.transition = "transform 260ms cubic-bezier(0.32, 0.72, 0, 1)";
      d.style.transform = "translateY(100%)";
      d.addEventListener("transitionend", () => { d.style.transition = ""; d.style.transform = ""; d.close(); }, { once: true });
    } else {
      d.style.transition = "transform 380ms cubic-bezier(0.32, 0.72, 0, 1)";
      d.style.transform = "";
      d.addEventListener("transitionend", () => { d.style.transition = ""; }, { once: true });
    }
  }

  return (
    <>
      <button type="button" className={klasaButonit} onClick={hap}>{butoni}</button>
      <dialog ref={ref} className="sheet" aria-label={titulli}
        onCancel={(e) => { e.preventDefault(); mbyll(); }}
        onClick={(e) => { if (e.target === ref.current) mbyll(); }}>
        <div className="sheet__grab" onPointerDown={poshte} onPointerMove={leviz} onPointerUp={lesho} onPointerCancel={lesho}>
          <div className="sheet__handle" aria-hidden="true" />
          <div className="sheet__head">
            <h2>{titulli}</h2>
            <button type="button" className="sheet__close" onPointerDown={(e) => e.stopPropagation()} onClick={mbyll} aria-label="Mbyll">
              <Ikona emri="mbyll" madhesia={15} trashesia={2.6} />
            </button>
          </div>
        </div>
        <div className="sheet__body">{children}</div>
      </dialog>
    </>
  );
}
