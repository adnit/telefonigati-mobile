"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";
import { vetemPronari } from "@/lib/servisi";
import { normalizoTelefonin } from "@/lib/rregullat";

function fusha(formData: FormData, emri: string, max: number) {
  const v = String(formData.get(emri) ?? "").trim();
  return v ? v.slice(0, max) : null;
}

// Të dhënat që klienti i sheh te linku: emri, telefoni, orari dhe adresa e servisit.
export async function ruajServisin(formData: FormData) {
  if (!(await vetemPronari())) redirect("/servisi?m=ndaluar");
  const emri = fusha(formData, "emri", 60);
  const tel = normalizoTelefonin(String(formData.get("telefoni") ?? ""));
  if (!emri || tel === "gabim") redirect("/servisi/cilesimet?m=fushe");
  const sql = getSql();
  await sql`UPDATE servisi SET emri = ${emri}, telefoni = ${tel},
    orari = ${fusha(formData, "orari", 80)}, adresa = ${fusha(formData, "adresa", 120)}`;
  revalidatePath("/", "layout");
  redirect("/servisi/cilesimet?m=servisi");
}

// Pronari fton stafin me email; kur ai hyn me Google me këtë email, bëhet staf.
export async function ftoStafin(formData: FormData) {
  if (!(await vetemPronari())) redirect("/servisi?m=ndaluar");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) redirect("/servisi/cilesimet?m=email");
  const sql = getSql();
  // Nëse ka hyrë më parë, bëhet staf menjëherë; përndryshe ruhet ftesa.
  const rows = await sql`UPDATE profilet SET roli = 'servis'
    WHERE lower(email) = ${email} AND roli = 'vizitor' RETURNING llogaria_id`;
  if (rows.length === 0) {
    await sql`INSERT INTO ftesat (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
  }
  redirect(`/servisi/cilesimet?m=${rows.length ? "stafi-shtuar" : "ftesa"}`);
}

export async function hiqStafin(formData: FormData) {
  const pronari = await vetemPronari();
  if (!pronari) redirect("/servisi?m=ndaluar");
  const id = String(formData.get("id") ?? "");
  const sql = getSql();
  // Pronari nuk e heq dot veten, që servisi të mos mbetet pa pronar.
  await sql`UPDATE profilet SET roli = 'vizitor' WHERE llogaria_id = ${id} AND roli = 'servis'`;
  redirect("/servisi/cilesimet?m=stafi-hequr");
}

export async function anuloFtesen(formData: FormData) {
  if (!(await vetemPronari())) redirect("/servisi?m=ndaluar");
  const sql = getSql();
  await sql`DELETE FROM ftesat WHERE email = ${String(formData.get("email") ?? "")}`;
  redirect("/servisi/cilesimet?m=ftesa-anuluar");
}
