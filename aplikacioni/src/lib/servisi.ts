import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getSql } from "./db";

export type Profil = { id: string; emri: string; email: string | null; roli: "vizitor" | "servis" | "pronar" };

// Kush është i kyçur. Hyrja e parë krijon profil "vizitor"; rolin "servis" e jep pronari në SQL.
export async function profiliIm(): Promise<Profil | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id || !/^\d+$/.test(id)) return null;
  const sql = getSql();
  const email = session.user.email ?? null;
  await sql`INSERT INTO profilet (llogaria_id, emri, email) VALUES (${id}, ${session.user.name ?? "Punonjës"}, ${email})
    ON CONFLICT (llogaria_id) DO UPDATE SET email = EXCLUDED.email`;
  // Një email i ftuar nga pronari bëhet staf në hyrjen e parë; ftesa përdoret një herë.
  if (email) {
    await sql`WITH ftesa AS (DELETE FROM ftesat WHERE email = ${email.toLowerCase()} RETURNING email)
      UPDATE profilet SET roli = 'servis'
      WHERE llogaria_id = ${id} AND roli = 'vizitor' AND EXISTS (SELECT 1 FROM ftesa)`;
  }
  const rows = await sql`SELECT llogaria_id AS id, emri, email, roli FROM profilet WHERE llogaria_id = ${id}`;
  return (rows[0] as Profil) ?? null;
}

// Çdo veprim i servisit e thërret këtë në server; fshehja e butonave nuk mjafton.
export async function vetemServisi(): Promise<Profil | null> {
  const p = await profiliIm();
  return p?.roli === "servis" || p?.roli === "pronar" ? p : null;
}

// Vetëm pronari menaxhon stafin dhe të dhënat e servisit.
export async function vetemPronari(): Promise<Profil | null> {
  const p = await profiliIm();
  return p?.roli === "pronar" ? p : null;
}
