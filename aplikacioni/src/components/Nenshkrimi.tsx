"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Ikona } from "@/components/Ikona";

// Fusha e nënshkrimit: klienti nënshkruan me gisht në ekranin e stafit.
// Vija ndjek gishtin pa vonesë dhe zbutet me kthesa; në fund ruhet si PNG i vogël (bojë e errët, sfond i tejdukshëm).
export function Nenshkrimi({ shuma }: { shuma: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [png, setPng] = useState("");
  const pikat = useRef<{ x: number; y: number }[]>([]);
  const vizaton = useRef(false);
  const { pending } = useFormStatus();

  // Kanavaca merr madhësinë kur fleta hapet (para kësaj është e fshehur dhe ka gjerësi 0).
  function pershtat() {
    const c = canvas.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = c.getBoundingClientRect();
    const w = Math.round(width * dpr), h = Math.round(height * dpr);
    if (!w || (c.width === w && c.height === h)) return;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#111318"; ctx.lineWidth = 2.6;
    setPng("");
  }

  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const vrojtuesi = new ResizeObserver(pershtat);
    vrojtuesi.observe(c);
    return () => vrojtuesi.disconnect();
  }, []);

  function pika(e: React.PointerEvent) {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function fillo(e: React.PointerEvent) {
    pershtat();
    canvas.current!.setPointerCapture(e.pointerId);
    vizaton.current = true;
    pikat.current = [pika(e)];
    const ctx = canvas.current!.getContext("2d")!;
    const p = pikat.current[0];
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2); ctx.fillStyle = "#111318"; ctx.fill();
  }
  function leviz(e: React.PointerEvent) {
    if (!vizaton.current) return;
    const ctx = canvas.current!.getContext("2d")!;
    // Për prekje të shpejta shfletuesi i grupon lëvizjet; i marrim të gjitha që vija të mos dalë me kënde.
    const ngjarjet = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const n of ngjarjet) {
      const r = canvas.current!.getBoundingClientRect();
      const p = { x: n.clientX - r.left, y: n.clientY - r.top };
      const v = pikat.current;
      v.push(p);
      if (v.length < 3) continue;
      const [a, b, c] = v.slice(-3);
      ctx.beginPath();
      ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
      ctx.stroke();
    }
  }
  function mbaro() {
    if (!vizaton.current) return;
    vizaton.current = false;
    // Kopje e zvogëluar (gjerësia 480 px) që PNG të mbetet i vogël në databazë.
    const c = canvas.current!;
    const k = document.createElement("canvas");
    k.width = 480; k.height = Math.round((480 * c.height) / c.width);
    k.getContext("2d")!.drawImage(c, 0, 0, k.width, k.height);
    setPng(k.toDataURL("image/png"));
  }
  function pastro() {
    const c = canvas.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setPng("");
  }

  return (
    <div className="signature-wrap">
      <div className="signature">
        <canvas ref={canvas} className="signature__pad" aria-label="Fusha e nënshkrimit të klientit"
          onPointerDown={fillo} onPointerMove={leviz} onPointerUp={mbaro} onPointerCancel={mbaro} />
        {!png && <span className="signature__hint" aria-hidden="true">Nënshkruaj këtu</span>}
        <span className="signature__line" aria-hidden="true"><Ikona emri="mbyll" madhesia={12} trashesia={2.6} /></span>
        {png && <button type="button" className="signature__clear" onClick={pastro}>Pastro</button>}
      </div>
      <input type="hidden" name="nenshkrimi" value={png} />
      <button type="submit" className="btn btn--success btn--block" disabled={!png || pending}>
        {pending ? <><span className="spinner" aria-hidden="true" />Po mbyllet…</> : <><Ikona emri="rregull" trashesia={2.6} />Konfirmo marrjen · {shuma} €</>}
      </button>
    </div>
  );
}
