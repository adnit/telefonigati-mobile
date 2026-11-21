"use client";

import { useRef } from "react";

// Fletë që ngjitet nga poshtë (si në aplikacionet e telefonit), për veprime të shkurtra.
// Përdor <dialog>, prandaj fokusi, Escape dhe sfondi menaxhohen nga shfletuesi.
export function Sheet({ butoni, titulli, klasaButonit = "action action--quiet action--block", children }: {
  butoni: React.ReactNode;
  titulli: string;
  klasaButonit?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={klasaButonit} onClick={() => ref.current?.showModal()}>{butoni}</button>
      <dialog ref={ref} className="sheet" aria-label={titulli}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <div className="sheet__handle" aria-hidden="true" />
        <div className="sheet__head">
          <h2>{titulli}</h2>
          <button type="button" className="sheet__close" onClick={() => ref.current?.close()} aria-label="Mbyll">✕</button>
        </div>
        <div className="sheet__body">{children}</div>
      </dialog>
    </>
  );
}
