"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";
import { STATUSET, type Statusi } from "@/lib/riparimet";
import { dergoNjoftim } from "@/lib/njoftimet";
import { vetemServisi } from "@/lib/servisi";
import { euro, normalizoImei, normalizoTelefonin, validoDaten } from "@/lib/rregullat";

function tekst(formData: FormData, emri: string, max: number) {
  const v = String(formData.get(emri) ?? "").trim();
  return v.length > 0 && v.length <= max ? v : null;
}

function telefoni(formData: FormData) {
  return normalizoTelefonin(String(formData.get("telefoni") ?? ""));
}

function euroFusha(formData: FormData, emri: string) {
  return euro(String(formData.get(emri) ?? ""));
}

function data(formData: FormData) {
  return validoDaten(String(formData.get("gati_deri") ?? ""));
}

// Regjistrimi në banak: krijon riparimin dhe kodin privat të linkut të klientit.
export async function regjistroRiparimin(formData: FormData) {
  const p = await vetemServisi();
  if (!p) redirect("/servisi?m=ndaluar");
  const pajisja = tekst(formData, "pajisja", 80);
  const problemi = tekst(formData, "problemi", 200);
  const cmimi = euroFusha(formData, "cmimi");
  if (!pajisja || !problemi || cmimi === null) redirect("/servisi/i-ri?m=fushe");
  const tel = telefoni(formData);
  if (tel === "gabim") redirect("/servisi/i-ri?m=telefoni");
  const gatiDeri = data(formData);
  if (gatiDeri === "gabim") redirect("/servisi/i-ri?m=data");
  const imei = normalizoImei(String(formData.get("imei") ?? ""));
  if (imei === "gabim") redirect("/servisi/i-ri?m=imei");
  // Fotoja vjen e zvogëluar nga telefoni; pranohet vetëm JPEG brenda kufirit.
  const fotoV = String(formData.get("foto") ?? "");
  const foto = fotoV.startsWith("data:image/jpeg;base64,") && fotoV.length <= 400_000 ? fotoV : null;

  const sql = getSql();
  // Riparimi dhe rreshti i regjistrit krijohen në të njëjtën komandë: ose të dyja, ose asnjëra.
  const rows = await sql`WITH r AS (
      INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi, foto, telefoni, gati_deri, imei)
      VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''),
              ${pajisja}, ${problemi}, current_date, 'Pranuar', ${cmimi}, ${foto}, ${tel}, ${gatiDeri}, ${imei})
      RETURNING id),
    n AS (INSERT INTO ngjarjet (riparim_id, kush, veprimi) SELECT id, ${p.emri}, 'Regjistroi riparimin' FROM r)
    SELECT id FROM r`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${rows[0].id}?m=regjistruar`);
}

export async function ndryshoStatusin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const p = await vetemServisi();
  if (!p) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const statusi = String(formData.get("statusi") ?? "") as Statusi;
  if (!STATUSET.includes(statusi)) redirect(`/servisi/riparimi/${id}?m=fushe`);
  // "Zhbëj" nga mesazhi i konfirmimit: kthen statusin pa i dërguar njoftim klientit.
  const zhbej = formData.get("zhbej") === "1";

  const sql = getSql();
  // Një riparim i mbyllur nuk rihapet nga butonat e statusit.
  // Njoftojmë vetëm kur statusi ndryshon vërtet, jo kur shtypet i njëjti buton.
  // Statusi i mëparshëm kthehet që mesazhi të ofrojë "Zhbëj".
  const veprimi = (zhbej ? "Zhbëu statusin → " : "Statusi → ") + statusi;
  const rows = await sql`WITH u AS (
      UPDATE riparimet r SET statusi = ${statusi}, perditesuar = now()
      FROM (SELECT id, statusi AS para FROM riparimet WHERE id = ${id} FOR UPDATE) v
      WHERE r.id = v.id AND v.para <> 'Marrë' AND v.para <> ${statusi}
      RETURNING r.id, r.kodi, r.pajisja, v.para),
    n AS (INSERT INTO ngjarjet (riparim_id, kush, veprimi) SELECT id, ${p.emri}, ${veprimi} FROM u)
    SELECT kodi, pajisja, para FROM u`;
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

export async function ndryshoGatiDeri(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const p = await vetemServisi();
  if (!p) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const d = data(formData);
  if (d === "gabim") redirect(`/servisi/riparimi/${id}?m=data`);
  const sql = getSql();
  const veprimi = d ? `Data e pritur → ${d.slice(8, 10)}.${d.slice(5, 7)}` : "Hoqi datën e pritur";
  await sql`WITH u AS (UPDATE riparimet SET gati_deri = ${d}, perditesuar = now()
      WHERE id = ${id} AND statusi <> 'Marrë' RETURNING id)
    INSERT INTO ngjarjet (riparim_id, kush, veprimi) SELECT id, ${p.emri}, ${veprimi} FROM u`;
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
  const p = await vetemServisi();
  if (!p) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const arsyeja = tekst(formData, "arsyeja", 200);
  const cmimi = euroFusha(formData, "cmimi");
  if (!arsyeja || cmimi === null || cmimi === 0) redirect(`/servisi/riparimi/${id}?m=fushe`);

  const sql = getSql();
  const rows = await sql`WITH u AS (UPDATE riparimet
      SET shtese_arsyeja = ${arsyeja}, shtese_cmimi = ${cmimi}, vendimi = 'pritje', perditesuar = now()
      WHERE id = ${id} AND shtese_arsyeja IS NULL AND statusi <> 'Marrë'
      RETURNING id, kodi, pajisja),
    n AS (INSERT INTO ngjarjet (riparim_id, kush, veprimi)
      SELECT id, ${p.emri}, ${"Kosto shtesë +" + cmimi + " €"} FROM u)
    SELECT id, kodi, pajisja FROM u`;
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
  const p = await vetemServisi();
  if (!p) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const sql = getSql();
  const rows = await sql`WITH u AS (UPDATE riparimet SET statusi = 'Marrë', marre = now(), perditesuar = now()
      WHERE id = ${id} AND statusi = 'Gati për marrje' AND (vendimi IS NULL OR vendimi <> 'pritje')
      RETURNING id, cmimi + CASE WHEN vendimi = 'miratuar' THEN shtese_cmimi ELSE 0 END AS paguar),
    n AS (INSERT INTO ngjarjet (riparim_id, kush, veprimi)
      SELECT id, ${p.emri}, 'Mbylli riparimin · paguar ' || paguar || ' €' FROM u)
    SELECT id FROM u`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${id}?m=${rows.length === 1 ? "mbyllur" : "nuk-mbyllet"}`);
}
