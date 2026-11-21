// Rregullat e validimit, të ndara nga databaza që të provohen me teste të shpejta (tests/rregullat.test.ts).
// I përdorin si veprimet e serverit, ashtu edhe formularët.

// Numrat e Kosovës shkruhen zakonisht 044 123 456; WhatsApp i do në formë ndërkombëtare (+38344123456).
export function normalizoTelefonin(hyrja: string): string | null | "gabim" {
  const v = hyrja.replace(/[\s\-().]/g, "");
  if (!v) return null;
  const n = v.startsWith("00") ? "+" + v.slice(2) : v.startsWith("0") ? "+383" + v.slice(1) : v;
  return /^\+?[0-9]{8,15}$/.test(n) ? n : "gabim";
}

// Shuma në euro: 0–9999, vetëm shifra.
export function euro(hyrja: string): number | null {
  const v = hyrja.trim();
  return /^\d{1,4}$/.test(v) ? Number(v) : null;
}

// Data e pritur: nga sot deri në 60 ditë; bosh do të thotë "pa datë".
// Krahasohen ditët e kalendarit (pa orë), që data e 60-të të pranohet dhe 30 shkurti të refuzohet.
export function validoDaten(hyrja: string, sot: Date = new Date()): string | null | "gabim" {
  const v = hyrja.trim();
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "gabim";
  const dita = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  if (new Date(dita).toISOString().slice(0, 10) !== v) return "gabim";
  const diteNgaSot = Math.round((dita - Date.UTC(sot.getFullYear(), sot.getMonth(), sot.getDate())) / 86_400_000);
  return diteNgaSot >= 0 && diteNgaSot <= 60 ? v : "gabim";
}

// IMEI: 15 shifra me shifrën e fundit të kontrollit sipas algoritmit Luhn.
// Kështu një shifër e gabuar gjatë shkrimit ose skanimit zbulohet menjëherë.
export function imeiVlefshem(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  let shuma = 0;
  for (let i = 0; i < 15; i++) {
    let d = Number(imei[i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    shuma += d;
  }
  return shuma % 10 === 0;
}

export function normalizoImei(hyrja: string): string | null | "gabim" {
  const v = hyrja.replace(/\D/g, "");
  if (!v) return null;
  return imeiVlefshem(v) ? v : "gabim";
}
