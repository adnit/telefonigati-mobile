"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";
import { STATUSET, type Statusi } from "@/lib/riparimet";
import { dergoNjoftim } from "@/lib/njoftimet";
import { vetemServisi } from "@/lib/servisi";

function tekst(formData: FormData, emri: string, max: number) {
  const v = String(formData.get(emri) ?? "").trim();
  return v.length > 0 && v.length <= max ? v : null;
}

// Numrat e Kosovës shkruhen zakonisht 044 123 456; WhatsApp i do në formë ndërkombëtare (+38344123456).
function telefoni(formData: FormData): string | null | "gabim" {
  const v = String(formData.get("telefoni") ?? "").replace(/[\s\-().]/g, "");
  if (!v) return null;
  const n = v.startsWith("00") ? "+" + v.slice(2) : v.startsWith("0") ? "+383" + v.slice(1) : v;
  return /^\+?[0-9]{8,15}$/.test(n) ? n : "gabim";
}

function euro(formData: FormData, emri: string) {
  const v = String(formData.get(emri) ?? "").trim();
  if (!/^\d{1,4}$/.test(v)) return null;
  return Number(v);
}

// Regjistrimi në banak: krijon riparimin dhe kodin privat të linkut të klientit.
export async function regjistroRiparimin(formData: FormData) {
  if (!(await vetemServisi())) redirect("/servisi?m=ndaluar");
  const pajisja = tekst(formData, "pajisja", 80);
  const problemi = tekst(formData, "problemi", 200);
  const cmimi = euro(formData, "cmimi");
  if (!pajisja || !problemi || cmimi === null) redirect("/servisi/i-ri?m=fushe");
  const tel = telefoni(formData);
  if (tel === "gabim") redirect("/servisi/i-ri?m=telefoni");
  const gatiDeri = data(formData);
  if (gatiDeri === "gabim") redirect("/servisi/i-ri?m=data");
  // Fotoja vjen e zvogëluar nga telefoni; pranohet vetëm JPEG brenda kufirit.
  const fotoV = String(formData.get("foto") ?? "");
  const foto = fotoV.startsWith("data:image/jpeg;base64,") && fotoV.length <= 400_000 ? fotoV : null;

  const sql = getSql();
  const rows = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi, foto, telefoni, gati_deri)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''),
            ${pajisja}, ${problemi}, current_date, 'Pranuar', ${cmimi}, ${foto}, ${tel}, ${gatiDeri})
    RETURNING id`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${rows[0].id}?m=regjistruar`);
}

export async function ndryshoStatusin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!(await vetemServisi())) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const statusi = String(formData.get("statusi") ?? "") as Statusi;
  if (!STATUSET.includes(statusi)) redirect(`/servisi/riparimi/${id}?m=fushe`);
  // "Zhbëj" nga mesazhi i konfirmimit: kthen statusin pa i dërguar njoftim klientit.
  const zhbej = formData.get("zhbej") === "1";

  const sql = getSql();
  // Një riparim i mbyllur nuk rihapet nga butonat e statusit.
  // Njoftojmë vetëm kur statusi ndryshon vërtet, jo kur shtypet i njëjti buton.
  // Statusi i mëparshëm kthehet që mesazhi të ofrojë "Zhbëj".
  const rows = await sql`UPDATE riparimet r SET statusi = ${statusi}, perditesuar = now()
    FROM (SELECT id, statusi AS para FROM riparimet WHERE id = ${id} FOR UPDATE) v
    WHERE r.id = v.id AND v.para <> 'Marrë' AND v.para <> ${statusi}
    RETURNING r.kodi, r.pajisja, v.para`;
  const r = rows[0];
  if (r && !zhbej && statusi === "Gati për marrje") {
    await dergoNjoftim(r.kodi, { titulli: "Telefoni yt është gati", teksti: `${r.pajisja} · Kalo në servis për ta marrë.` });
  } else if (r && !zhbej && statusi === "Në riparim") {
    await dergoNjoftim(r.kodi, { titulli: "Riparimi filloi", teksti: `${r.pajisja} është tani në riparim.` });
  }
  revalidatePath("/servisi");
  if (!r) redirect(`/servisi/riparimi/${id}`);
  redirect(zhbej
    ? `/servisi/riparimi/${id}?m=zhbere`
    : `/servisi/riparimi/${id}?m=statusi&nga=${encodeURIComponent(r.para)}`);
}

// Data kur servisi pret që telefoni të jetë gati: sot ose deri në 60 ditë; bosh e heq.
function data(formData: FormData): string | null | "gabim" {
  const v = String(formData.get("gati_deri") ?? "").trim();
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "gabim";
  const d = new Date(v + "T12:00:00");
  const sot = new Date(); sot.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - sot.getTime()) / 86_400_000;
  return Number.isFinite(diff) && diff >= -0.5 && diff <= 60 ? v : "gabim";
}

export async function ndryshoGatiDeri(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!(await vetemServisi())) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const d = data(formData);
  if (d === "gabim") redirect(`/servisi/riparimi/${id}?m=data`);
  const sql = getSql();
  await sql`UPDATE riparimet SET gati_deri = ${d}, perditesuar = now()
    WHERE id = ${id} AND statusi <> 'Marrë'`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${id}?m=${d ? "data-ruajtur" : "data-hequr"}`);
}

// Shënim i brendshëm; autori merret nga sesioni.
export async function shtoShenim(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const p = await vetemServisi();
  if (!p) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const teksti = tekst(formData, "teksti", 500);
  if (!teksti) redirect(`/servisi/riparimi/${id}?m=shenim-bosh`);
  const sql = getSql();
  await sql`INSERT INTO shenimet (riparim_id, autori, teksti)
    SELECT id, ${p.emri}, ${teksti} FROM riparimet WHERE id = ${id}`;
  redirect(`/servisi/riparimi/${id}?m=shenim`);
}

// Një kosto shtesë për riparim; pasi klienti vendos, nuk mbishkruhet.
export async function shtoKostoShtese(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!(await vetemServisi())) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const arsyeja = tekst(formData, "arsyeja", 200);
  const cmimi = euro(formData, "cmimi");
  if (!arsyeja || cmimi === null || cmimi === 0) redirect(`/servisi/riparimi/${id}?m=fushe`);

  const sql = getSql();
  const rows = await sql`UPDATE riparimet
    SET shtese_arsyeja = ${arsyeja}, shtese_cmimi = ${cmimi}, vendimi = 'pritje', perditesuar = now()
    WHERE id = ${id} AND shtese_arsyeja IS NULL AND statusi <> 'Marrë'
    RETURNING id, kodi, pajisja`;
  if (rows[0]) {
    await dergoNjoftim(rows[0].kodi, {
      titulli: "Servisi kërkon miratimin tënd",
      teksti: `${rows[0].pajisja}: ${arsyeja} · +${cmimi} €`,
    });
  }
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${id}?m=${rows.length === 1 ? "shtese" : "ka-shtese"}`);
}

// Klienti e mori telefonin: mbyllet vetëm kur është gati dhe kostoja shtesë nuk pret vendim.
export async function mbyllRiparimin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!(await vetemServisi())) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const sql = getSql();
  const rows = await sql`UPDATE riparimet SET statusi = 'Marrë', marre = now(), perditesuar = now()
    WHERE id = ${id} AND statusi = 'Gati për marrje' AND (vendimi IS NULL OR vendimi <> 'pritje')
    RETURNING id`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${id}?m=${rows.length === 1 ? "mbyllur" : "nuk-mbyllet"}`);
}
