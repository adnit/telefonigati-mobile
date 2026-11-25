"use client";

import { useState } from "react";
import { Ikona } from "@/components/Ikona";

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

// Rreshti i fotos në formularin e pranimit: "Bëj foto" hap kamerën e pasme; pamja paraprake shfaqet poshtë.
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
    e.target.value = "";
  }

  return (
    <>
      {/* capture hap kamerën e pasme në telefon; në kompjuter hapet zgjedhja e skedarit. */}
      <input id="foto-input" className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={kurZgjidhet} />
      <input type="hidden" name="foto" value={foto} />
      {foto && (
        <div className="field">
          <div className="photo-preview">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL lokale, jo imazh nga serveri */}
            <img src={foto} alt="Pamja e telefonit në pranim" />
            <button type="button" onClick={() => { setFoto(""); setGjendja("bosh"); }} aria-label="Hiq foton">
              <Ikona emri="mbyll" madhesia={15} trashesia={2.6} />
            </button>
          </div>
        </div>
      )}
      <label htmlFor="foto-input" className="row row--button row--icon row--accent">
        <span className="row__icon" style={{ "--icon-bg": "#8e8e93" } as React.CSSProperties}><Ikona emri="kamera" madhesia={17} /></span>
        <span className="row__main">
          <span className="row__title">{gjendja === "duke" ? "Po përgatitet…" : foto ? "Bëj një foto tjetër" : "Bëj foto të telefonit"}</span>
          {gjendja === "gabim" && <span className="row__sub" role="alert">Fotoja nuk u lexua. Provo një tjetër ose vazhdo pa foto.</span>}
        </span>
      </label>
    </>
  );
}
