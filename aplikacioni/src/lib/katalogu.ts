// Katalogu i pajisjeve më të shpeshta në servis: markat dhe modelet që zgjidhen me një prekje në banak.
// Çdo emër tjetër mund të shkruhet me dorë; katalogu vetëm shkurton shkrimin.
export const KATALOGU: { marka: string; ngjyra: string; modelet: string[] }[] = [
  { marka: "Apple", ngjyra: "#1d1d1f", modelet: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro", "iPhone 16", "iPhone 16 Pro Max", "iPhone SE"] },
  { marka: "Samsung", ngjyra: "#1428a0", modelet: ["Galaxy A15", "Galaxy A25", "Galaxy A35", "Galaxy A54", "Galaxy A55", "Galaxy S23", "Galaxy S24", "Galaxy S24 Ultra", "Galaxy Z Flip6"] },
  { marka: "Xiaomi", ngjyra: "#ff6900", modelet: ["Redmi 13C", "Redmi Note 12", "Redmi Note 13", "Redmi Note 13 Pro", "Xiaomi 14", "Poco X6"] },
  { marka: "Google", ngjyra: "#4285f4", modelet: ["Pixel 7", "Pixel 7a", "Pixel 8", "Pixel 8 Pro", "Pixel 9"] },
  { marka: "Huawei", ngjyra: "#c7000b", modelet: ["P30", "P30 Lite", "P40 Lite", "Nova 11", "Y9a"] },
  { marka: "Motorola", ngjyra: "#5c2d91", modelet: ["Moto G54", "Moto G84", "Edge 40", "Moto E13"] },
  { marka: "OnePlus", ngjyra: "#eb0029", modelet: ["Nord CE 3", "Nord 4", "OnePlus 12"] },
];

// Emri i plotë i pajisjes: "iPhone" dhe "Pixel" e kanë markën brenda emrit, të tjerët jo.
export function emriIPajisjes(marka: string, modeli: string) {
  if (marka === "Apple" || modeli.toLowerCase().startsWith(marka.toLowerCase())) return modeli;
  if (marka === "Google") return `Google ${modeli}`;
  return `${marka} ${modeli}`;
}

// Gjen markën nga teksti i lirë (p.sh. "iphone 13" → Apple, "galaxy a54" → Samsung).
export function gjejMarken(pajisja: string): string | null {
  const t = pajisja.toLowerCase();
  if (/iphone|apple/.test(t)) return "Apple";
  if (/samsung|galaxy/.test(t)) return "Samsung";
  if (/xiaomi|redmi|poco/.test(t)) return "Xiaomi";
  if (/pixel|google/.test(t)) return "Google";
  if (/huawei|nova/.test(t)) return "Huawei";
  if (/motorola|moto/.test(t)) return "Motorola";
  if (/oneplus|nord/.test(t)) return "OnePlus";
  return null;
}

export type Cmim = { id: string; marka: string | null; modeli: string | null; problemi: string; cmimi: number; dite: number | null };

// Çmimi më i saktë për pajisjen dhe problemin: modeli > marka > çdo telefon.
export function gjejCmimin(cmimet: Cmim[], pajisja: string, problemi: string): Cmim | null {
  const p = problemi.trim().toLowerCase();
  if (!p) return null;
  const marka = gjejMarken(pajisja);
  const emri = pajisja.trim().toLowerCase();
  const kandidatet = cmimet.filter((c) => p.includes(c.problemi.toLowerCase()));
  const pikët = (c: Cmim) =>
    c.modeli && emri.includes(c.modeli.toLowerCase()) ? 3
      : c.modeli ? -1
      : c.marka && c.marka === marka ? 2
      : c.marka ? -1
      : 1;
  const renditur = kandidatet.map((c) => [pikët(c), c] as const).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]);
  return renditur[0]?.[1] ?? null;
}
