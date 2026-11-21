import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getSql } from "./db";

export type Profil = { id: string; emri: string; email: string | null; roli: "vizitor" | "servis" | "pronar" };

// Kush është i kyçur, në një udhëtim të vetëm te databaza: krijon profilin në hyrjen e parë,
// përdor ftesën e stafit nëse ka një për këtë email, dhe kthen rolin.
// cache(): layout-i dhe faqja e pyesin të dy, por në një kërkesë lexohet vetëm një herë.
export const profiliIm = cache(async (): Promise<Profil | null> => {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id || !/^\d+$/.test(id)) return null;
  const sql = getSql();
  const email = session.user.email?.toLowerCase() ?? null;
  const rows = await sql`WITH ftesa AS (DELETE FROM ftesat WHERE email = ${email} RETURNING 1)
    INSERT INTO profilet AS p (llogaria_id, emri, email, roli)
    VALUES (${id}, ${session.user.name ?? "Punonjës"}, ${session.user.email ?? null},
      CASE WHEN EXISTS (SELECT 1 FROM ftesa) THEN 'servis' ELSE 'vizitor' END)
    ON CONFLICT (llogaria_id) DO UPDATE SET
      email = EXCLUDED.email,
      roli = CASE WHEN p.roli = 'vizitor' AND EXISTS (SELECT 1 FROM ftesa) THEN 'servis' ELSE p.roli END
    RETURNING llogaria_id AS id, emri, email, roli`;
  return (rows[0] as Profil) ?? null;
});

// Stafi i servisit: punonjësit dhe pronari. Një vend i vetëm për këtë rregull.
export function eshteStaf(p: Profil | null): boolean {
  return p?.roli === "servis" || p?.roli === "pronar";
}

// Çdo veprim i servisit e thërret këtë në server; fshehja e butonave nuk mjafton.
export async function vetemServisi(): Promise<Profil | null> {
  const p = await profiliIm();
  return eshteStaf(p) ? p : null;
}

// Vetëm pronari menaxhon stafin dhe të dhënat e servisit.
export async function vetemPronari(): Promise<Profil | null> {
  const p = await profiliIm();
  return p?.roli === "pronar" ? p : null;
}
