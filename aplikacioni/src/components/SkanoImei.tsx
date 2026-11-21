"use client";

import { useEffect, useRef, useState } from "react";
import { imeiVlefshem } from "@/lib/rregullat";

// BarcodeDetector nuk është ende në tipet e TypeScript-it.
type Barkod = { rawValue: string };
type Detektor = { detect(burimi: HTMLVideoElement): Promise<Barkod[]> };
declare global {
  interface Window { BarcodeDetector?: new (o?: { formats: string[] }) => Detektor }
}

// Nga barkodet e kutisë (IMEI, numri serial, EAN) merr vetëm atë që është IMEI i vlefshëm.
function gjejImei(barkodet: Barkod[]) {
  for (const b of barkodet) {
    for (const m of b.rawValue.match(/\d{15}/g) ?? []) if (imeiVlefshem(m)) return m;
  }
  return null;
}

export function SkanoImei() {
  const [vlera, setVlera] = useState("");
  const [kamera, setKamera] = useState(false);
  const [mbeshtetet, setMbeshtetet] = useState(false);
  const [mesazhi, setMesazhi] = useState("");
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Kontrolli bëhet pas renderimit, që serveri dhe shfletuesi të shfaqin të njëjtën faqe fillimisht.
    const id = window.setTimeout(() => setMbeshtetet(Boolean(window.BarcodeDetector && navigator.mediaDevices?.getUserMedia)), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!kamera || !window.BarcodeDetector) return;
    let aktiv = true;
    let rryma: MediaStream | null = null;
    const detektori = new window.BarcodeDetector({ formats: ["code_128", "code_39", "ean_13", "qr_code", "data_matrix"] });
    (async () => {
      try {
        rryma = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!aktiv || !video.current) return;
        video.current.srcObject = rryma;
        await video.current.play();
        while (aktiv) {
          const imei = gjejImei(await detektori.detect(video.current).catch(() => []));
          if (imei) { setVlera(imei); setMesazhi("IMEI u skanua."); setKamera(false); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch {
        setMesazhi("Kamera nuk u hap. Shkruaje IMEI-n vetë.");
        setKamera(false);
      }
    })();
    // Kamera fiket sapo mbyllet pamja, që të mos mbetet e ndezur.
    return () => { aktiv = false; rryma?.getTracks().forEach((t) => t.stop()); };
  }, [kamera]);

  const shifrat = vlera.replace(/\D/g, "");
  const gjendja = !shifrat ? "" : shifrat.length < 15 ? `${shifrat.length}/15 shifra` : imeiVlefshem(shifrat) ? "IMEI i vlefshëm ✓" : "Shifra e kontrollit nuk përputhet";

  return (
    <div className="imei">
      <label htmlFor="imei">IMEI (opsional)</label>
      <div className="imei__row">
        <input id="imei" name="imei" inputMode="numeric" autoComplete="off" maxLength={17}
          value={vlera} onChange={(e) => setVlera(e.target.value)} placeholder="15 shifra" className="mono" />
        {mbeshtetet && (
          <button type="button" className="action action--quiet" onClick={() => { setMesazhi(""); setKamera(true); }}>
            Skano
          </button>
        )}
      </div>
      <p className={`hint${gjendja.includes("✓") ? " hint--ok" : gjendja.includes("nuk") ? " hint--bad" : ""}`} aria-live="polite">
        {mesazhi || gjendja || "Në telefonin e klientit: *#06# e shfaq IMEI-n; ose skano barkodin në kuti."}
      </p>
      {kamera && (
        <div className="scanner" role="dialog" aria-label="Skano IMEI-n">
          <div className="scanner__view">
            <video ref={video} playsInline muted />
            <span className="scanner__frame" aria-hidden="true" />
          </div>
          <p>Drejtoje kamerën te barkodi IMEI në kuti ose në etiketë.</p>
          <button type="button" className="action action--quiet" onClick={() => setKamera(false)}>Mbyll</button>
        </div>
      )}
    </div>
  );
}
