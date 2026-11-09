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
  const rows = await sql`UPDATE riparimet SET vendimi = ${vendimi}, perditesuar = now()
    WHERE kodi = ${kodi} AND vendimi = 'pritje'
    RETURNING id`;
  revalidatePath(`/r/${kodi}`);
  revalidatePath("/servisi");
  redirect(`/r/${kodi}?m=${rows.length === 1 ? vendimi : "vendosur"}`);
}
