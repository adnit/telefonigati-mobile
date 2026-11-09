import "server-only";
import { getSql } from "./db";

// "Marrë" mbyll riparimin; tre të parët janë hapat që servisi i ndryshon gjatë punës.
export type Statusi = "Pranuar" | "Në riparim" | "Gati për marrje" | "Marrë";
export const STATUSET: Statusi[] = ["Pranuar", "Në riparim", "Gati për marrje"];
export type Vendimi = "pritje" | "miratuar" | "refuzuar";

export type Riparim = {
  id: string;
  kodi: string;
  pajisja: string;
  problemi: string;
  dorezuar: string;
  statusi: Statusi;
  // çmimi i vlerësuar që servisi e jep në banak
  cmimi: number;
  // problem i gjetur gjatë punës dhe vendimi i klientit për të
  shtese: { arsyeja: string; cmimi: number; vendimi: Vendimi } | null;
  perditesuar: string;
  // JPEG i zvogëluar nga pranimi; lexohet vetëm te faqja e një riparimi
  foto: string | null;
  // kur klienti e mori telefonin; null derisa riparimi të mbyllet
  marre: string | null;
};

type Rresht = Omit<Riparim, "shtese"> & {
  shtese_arsyeja: string | null;
  shtese_cmimi: number | null;
  vendimi: Vendimi | null;
  foto?: string | null;
  marre: string | null;
};

function neRiparim(r: Rresht): Riparim {
  return {
    id: r.id,
    kodi: r.kodi,
    pajisja: r.pajisja,
    problemi: r.problemi,
    dorezuar: r.dorezuar,
    statusi: r.statusi,
    cmimi: r.cmimi,
    shtese:
      r.shtese_arsyeja !== null && r.shtese_cmimi !== null && r.vendimi !== null
        ? { arsyeja: r.shtese_arsyeja, cmimi: r.shtese_cmimi, vendimi: r.vendimi }
        : null,
    perditesuar: r.perditesuar,
    foto: r.foto ?? null,
    marre: r.marre,
  };
}

// Vetëm për servisin: të gjitha riparimet, më i riu i pari.
// Datat formatohen në SQL me orën e Kosovës, që teksti të jetë i njëjtë kudo.
export async function lexoRiparimet(): Promise<Riparim[]> {
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar,
    to_char(marre AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY') AS marre
    FROM riparimet ORDER BY riparimet.dorezuar DESC, riparimet.perditesuar DESC`;
  return (rows as Rresht[]).map(neRiparim);
}

// Vetëm për servisin: një riparim sipas numrit.
export async function gjejRiparimin(id: string): Promise<Riparim | undefined> {
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar,
    to_char(marre AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY') AS marre
    , foto FROM riparimet WHERE id = ${id}`;
  const r = rows[0] as Rresht | undefined;
  return r ? neRiparim(r) : undefined;
}

// Për klientin: vetëm riparimi që i përket kodit të linkut të tij.
// 30 ditë pasi telefoni merret, linku nuk hapet më.
export async function gjejMeKod(kodi: string): Promise<Riparim | undefined> {
  if (!/^[0-9a-f]{32}$/.test(kodi)) return undefined;
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar,
    to_char(marre AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY') AS marre
    , foto FROM riparimet WHERE kodi = ${kodi}
      AND (riparimet.marre IS NULL OR riparimet.marre > now() - interval '30 days')`;
  const r = rows[0] as Rresht | undefined;
  return r ? neRiparim(r) : undefined;
}

// Shuma që klienti paguan: çmimi i vlerësuar plus kostoja shtesë vetëm nëse e ka miratuar.
export function totali(r: Riparim) {
  return r.cmimi + (r.shtese?.vendimi === "miratuar" ? r.shtese.cmimi : 0);
}

// Versioni = koha e ndryshimit të fundit. Faqet e krahasojnë për t'u rifreskuar vetë.
export async function versioniIRiparimit(kodi: string): Promise<string | null> {
  if (!/^[0-9a-f]{32}$/.test(kodi)) return null;
  const sql = getSql();
  const rows = await sql`SELECT (extract(epoch FROM perditesuar) * 1000)::bigint::text AS v
    FROM riparimet WHERE kodi = ${kodi}
      AND (marre IS NULL OR marre > now() - interval '30 days')`;
  return (rows[0]?.v as string | undefined) ?? null;
}

export async function versioniIListes(): Promise<string> {
  const sql = getSql();
  const rows = await sql`SELECT coalesce((extract(epoch FROM max(perditesuar)) * 1000)::bigint, 0)::text
    || '-' || count(*)::text AS v FROM riparimet`;
  return rows[0].v as string;
}
