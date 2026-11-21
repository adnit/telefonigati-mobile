import { neon } from "@neondatabase/serverless";
import { encode } from "next-auth/jwt";
import type { BrowserContext } from "@playwright/test";

export const sql = neon(process.env.DATABASE_URL!);
export const PREFIKSI = "E2E ";

// Një sesion prove: i njëjti token që krijon NextAuth pas hyrjes me Google, i nënshkruar me NEXTAUTH_SECRET.
export async function hyr(context: BrowserContext, id: string, roli: "vizitor" | "servis" | "pronar", emri = "Provë E2E") {
  await sql`INSERT INTO profilet (llogaria_id, emri, email, roli) VALUES (${id}, ${emri}, ${id + "@example.com"}, ${roli})
    ON CONFLICT (llogaria_id) DO UPDATE SET roli = ${roli}, emri = ${emri}`;
  const token = await encode({ token: { sub: id, name: emri, email: id + "@example.com" }, secret: process.env.NEXTAUTH_SECRET! });
  await context.addCookies([{ name: "next-auth.session-token", value: token, url: "http://localhost:3100" }]);
}

export async function pastro(fillimi: Date) {
  await sql`DELETE FROM riparimet WHERE pajisja LIKE ${PREFIKSI + "%"}`;
  await sql`DELETE FROM profilet WHERE llogaria_id LIKE '9000000000000000000%'`;
  await sql`DELETE FROM tentativat WHERE koha >= ${fillimi.toISOString()}`;
}

export async function kodiI(id: string) {
  const [r] = await sql`SELECT kodi FROM riparimet WHERE id = ${id}`;
  return r.kodi as string;
}
