"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";
import { STATUSET, type Statusi } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

function tekst(formData: FormData, emri: string, max: number) {
  const v = String(formData.get(emri) ?? "").trim();
  return v.length > 0 && v.length <= max ? v : null;
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
  // Fotoja vjen e zvogëluar nga telefoni; pranohet vetëm JPEG brenda kufirit.
  const fotoV = String(formData.get("foto") ?? "");
  const foto = fotoV.startsWith("data:image/jpeg;base64,") && fotoV.length <= 400_000 ? fotoV : null;

  const sql = getSql();
  const rows = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi, foto)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''),
            ${pajisja}, ${problemi}, current_date, 'Pranuar', ${cmimi}, ${foto})
    RETURNING id`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${rows[0].id}?m=regjistruar`);
}

export async function ndryshoStatusin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!(await vetemServisi())) redirect(`/servisi/riparimi/${id}?m=ndaluar`);
  const statusi = String(formData.get("statusi") ?? "") as Statusi;
  if (!STATUSET.includes(statusi)) redirect(`/servisi/riparimi/${id}?m=fushe`);

  const sql = getSql();
  await sql`UPDATE riparimet SET statusi = ${statusi}, perditesuar = now() WHERE id = ${id}`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${id}?m=statusi`);
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
    WHERE id = ${id} AND shtese_arsyeja IS NULL
    RETURNING id`;
  revalidatePath("/servisi");
  redirect(`/servisi/riparimi/${id}?m=${rows.length === 1 ? "shtese" : "ka-shtese"}`);
}
