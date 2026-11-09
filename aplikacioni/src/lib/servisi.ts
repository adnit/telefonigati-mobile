import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getSql } from "./db";

export type Profil = { id: string; emri: string; roli: "vizitor" | "servis" };

// Kush është i kyçur. Hyrja e parë krijon profil "vizitor"; rolin "servis" e jep pronari në SQL.
export async function profiliIm(): Promise<Profil | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id || !/^\d+$/.test(id)) return null;
  const sql = getSql();
  await sql`INSERT INTO profilet (github_id, emri) VALUES (${id}, ${session.user.name ?? "Punonjës"})
    ON CONFLICT (github_id) DO NOTHING`;
  const rows = await sql`SELECT github_id AS id, emri, roli FROM profilet WHERE github_id = ${id}`;
  return (rows[0] as Profil) ?? null;
}

// Çdo veprim i servisit e thërret këtë në server; fshehja e butonave nuk mjafton.
export async function vetemServisi(): Promise<Profil | null> {
  const p = await profiliIm();
  return p?.roli === "servis" ? p : null;
}
