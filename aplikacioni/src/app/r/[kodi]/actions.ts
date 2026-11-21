"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";

// Klienti vendos vetëm për riparimin e linkut të vet dhe vetëm një herë.
// Kodi i linkut është leja: pa të nuk gjendet asnjë riparim.
export async function vendosKostoShtese(formData: FormData) {
  const kodi = String(formData.get("kodi") ?? "");
  const vendimi = String(formData.get("vendimi") ?? "");
  if (!/^[0-9a-f]{32}$/.test(kodi) || !["miratuar", "refuzuar"].includes(vendimi)) {
    redirect("/?m=kodi");
  }
  const sql = getSql();
  const rows = await sql`WITH u AS (UPDATE riparimet SET vendimi = ${vendimi}, perditesuar = now()
      WHERE kodi = ${kodi} AND vendimi = 'pritje'
      RETURNING id),
    n AS (INSERT INTO ngjarjet (riparim_id, kush, veprimi)
      SELECT id, 'Klienti', ${vendimi === "miratuar" ? "Miratoi koston shtesë" : "Refuzoi koston shtesë"} FROM u)
    SELECT id FROM u`;
  revalidatePath(`/r/${kodi}`);
  revalidatePath("/servisi");
  redirect(`/r/${kodi}?m=${rows.length === 1 ? vendimi : "vendosur"}`);
}

type Abonim = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

// Klienti lejon njoftimet për riparimin e linkut të vet. Ruhet vetëm adresa e njoftimeve të shfletuesit.
export async function ruajAbonimin(kodi: string, abonim: Abonim): Promise<"ok" | "gabim"> {
  const endpoint = typeof abonim?.endpoint === "string" ? abonim.endpoint : "";
  const p256dh = typeof abonim?.keys?.p256dh === "string" ? abonim.keys.p256dh : "";
  const auth = typeof abonim?.keys?.auth === "string" ? abonim.keys.auth : "";
  if (!/^[0-9a-f]{32}$/.test(kodi) || !endpoint.startsWith("https://") || endpoint.length > 1000
      || !p256dh || p256dh.length > 200 || !auth || auth.length > 100) return "gabim";
  const sql = getSql();
  const rows = await sql`INSERT INTO abonimet (kodi, endpoint, p256dh, auth)
    SELECT kodi, ${endpoint}, ${p256dh}, ${auth} FROM riparimet
      WHERE kodi = ${kodi} AND statusi <> 'Marrë'
    ON CONFLICT (kodi, endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
    RETURNING id`;
  return rows.length === 1 ? "ok" : "gabim";
}

// Pas marrjes: një pyetje e vetme që mat hipotezën e projektit (klientët telefonojnë më rrallë).
// Një përgjigje për riparim; vetëm për riparime të mbyllura.
export async function ruajPershtypjen(formData: FormData) {
  const kodi = String(formData.get("kodi") ?? "");
  const pergjigjja = String(formData.get("kurseu") ?? "");
  if (!/^[0-9a-f]{32}$/.test(kodi) || !["po", "jo"].includes(pergjigjja)) redirect("/?m=kodi");
  const po = pergjigjja === "po";
  const sql = getSql();
  await sql`WITH r AS (SELECT id FROM riparimet WHERE kodi = ${kodi} AND statusi = 'Marrë'),
    p AS (INSERT INTO pershtypjet (riparim_id, kurseu_telefonate)
      SELECT id, ${po} FROM r ON CONFLICT (riparim_id) DO NOTHING RETURNING riparim_id)
    INSERT INTO ngjarjet (riparim_id, kush, veprimi)
      SELECT riparim_id, 'Klienti', ${po ? "Linku i kurseu një telefonatë" : "Linku nuk i kurseu telefonatë"} FROM p`;
  revalidatePath(`/r/${kodi}`);
  redirect(`/r/${kodi}?m=pershtypja`);
}
