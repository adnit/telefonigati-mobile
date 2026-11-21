import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getSql } from "./db";

// Kufiri i provave me kode të gabuara: dikush që provon kode me radhë për të gjetur linqe të huaja
// bllokohet pas 20 gabimeve në 10 minuta. IP ruhet vetëm si hash, jo si adresë.
const MAX = 20;

async function ipHash() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokale";
  return createHash("sha256").update(ip + (process.env.NEXTAUTH_SECRET ?? "")).digest("hex").slice(0, 32);
}

export async function eshteBllokuar(): Promise<boolean> {
  const sql = getSql();
  const [r] = await sql`SELECT count(*)::int AS n FROM tentativat
    WHERE ip_hash = ${await ipHash()} AND koha > now() - interval '10 minutes'`;
  return r.n >= MAX;
}

export async function shenoKodTeGabuar() {
  const sql = getSql();
  // Pastron rreshtat e vjetër në të njëjtën kohë, që tabela të mbetet e vogël.
  await sql`WITH f AS (DELETE FROM tentativat WHERE koha < now() - interval '1 day')
    INSERT INTO tentativat (ip_hash) VALUES (${await ipHash()})`;
}
