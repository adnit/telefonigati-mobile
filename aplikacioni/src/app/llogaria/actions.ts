"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";
import { profiliIm } from "@/lib/servisi";

// Klienti ruan riparimin nga faqja e tij: kush ka linkun privat (kodin) mund ta lidhë me llogarinë e vet.
// Linku duhet të jetë ende aktiv (riparim i hapur ose i marrë brenda 30 ditëve).
// Vetëm llogaritë e klientëve ruajnë riparime; llogaritë e stafit janë llogari pune.
export async function ruajRiparimin(formData: FormData) {
  const kodi = String(formData.get("kodi") ?? "");
  if (!/^[0-9a-f]{32}$/.test(kodi)) redirect("/?m=kodi");
  const p = await profiliIm();
  if (!p || p.roli !== "vizitor") redirect(`/r/${kodi}`);
  const sql = getSql();
  await sql`INSERT INTO klientet_riparimet (llogaria_id, riparim_id)
    SELECT ${p.id}, id FROM riparimet WHERE kodi = ${kodi} AND (marre IS NULL OR marre > now() - interval '30 days')
    ON CONFLICT DO NOTHING`;
  revalidatePath("/llogaria");
  redirect(`/r/${kodi}?m=ruajtur`);
}

// Heq një riparim nga lista; vetë riparimi dhe linku nuk preken.
export async function hiqRiparimin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const p = await profiliIm();
  if (!p) redirect("/llogaria");
  const sql = getSql();
  await sql`DELETE FROM klientet_riparimet WHERE llogaria_id = ${p.id} AND riparim_id = ${id}`;
  revalidatePath("/llogaria");
  redirect("/llogaria?m=hequr");
}

// Klienti fshin llogarinë: profili dhe lista e riparimeve të ruajtura (lidhjet fshihen me CASCADE).
// Stafi nuk e fshin llogarinë nga këtu, që servisi të mos mbetet pa pronar ose pa punonjës.
export async function fshiLlogarine(): Promise<{ ok: boolean }> {
  const p = await profiliIm();
  if (!p || p.roli !== "vizitor") return { ok: false };
  const sql = getSql();
  await sql`DELETE FROM profilet WHERE llogaria_id = ${p.id} AND roli = 'vizitor'`;
  return { ok: true };
}
