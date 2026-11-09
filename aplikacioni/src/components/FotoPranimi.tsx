"use client";

import { useState } from "react";

const MAX_ANA = 1024;   // piksele në anën më të gjatë
const CILESIA = 0.7;    // JPEG
const MAX_GJATESIA = 400_000; // e njëjta si në databazë

// Zvogëlon foton në telefon para dërgimit. Ri-kodimi në canvas heq edhe të dhënat EXIF (p.sh. vendndodhjen).
async function zvogelo(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const shkalla = Math.min(1, MAX_ANA / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * shkalla);
  canvas.height = Math.round(bitmap.height * shkalla);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", CILESIA);
}

export function FotoPranimi() {
  const [foto, setFoto] = useState("");
  const [gjendja, setGjendja] = useState<"bosh" | "duke" | "gati" | "gabim">("bosh");

  async function kurZgjidhet(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGjendja("duke");
    try {
      const data = await zvogelo(file);
      if (data.length > MAX_GJATESIA) throw new Error("e madhe");
      setFoto(data);
      setGjendja("gati");
    } catch {
      setFoto("");
      setGjendja("gabim");
    }
  }

  return (
    <div className="photo">
      <span className="photo__title">Foto e telefonit (opsionale)</span>
      <p className="muted">Fotografo vetëm pajisjen: ekranin, cepat, gërvishtjet. Jo dokumente ose fytyra.</p>
      {/* capture hap kamerën e pasme në telefon; në kompjuter hapet zgjedhja e skedarit. */}
      <input id="foto-input" className="visually-hidden" type="file" accept="image/*"
        capture="environment" onChange={kurZgjidhet} />
      <label htmlFor="foto-input" className="action action--quiet action--block">
        {foto ? "Bëj një foto tjetër" : "Bëj foto"}
      </label>
      <input type="hidden" name="foto" value={foto} />
      {gjendja === "duke" && <p className="muted" role="status">Po përgatitet fotoja…</p>}
      {gjendja === "gabim" && <p role="alert">Fotoja nuk u lexua. Provo një tjetër ose vazhdo pa foto.</p>}
      {foto && (
        <div className="photo__preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL lokale, jo imazh nga serveri */}
          <img src={foto} alt="Pamja e telefonit në pranim" />
          <button type="button" className="action action--quiet" onClick={() => { setFoto(""); setGjendja("bosh"); }}>
            Hiq foton
          </button>
        </div>
      )}
    </div>
  );
}
