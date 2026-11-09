import "server-only";
import { getSql } from "./db";

export type Statusi = "Pranuar" | "Në riparim" | "Gati për marrje";
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
};

type Rresht = Omit<Riparim, "shtese"> & {
  shtese_arsyeja: string | null;
  shtese_cmimi: number | null;
  vendimi: Vendimi | null;
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
  };
}

// Vetëm për servisin: të gjitha riparimet, më i riu i pari.
// Datat formatohen në SQL me orën e Kosovës, që teksti të jetë i njëjtë kudo.
export async function lexoRiparimet(): Promise<Riparim[]> {
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar
    FROM riparimet ORDER BY riparimet.dorezuar DESC, riparimet.perditesuar DESC`;
  return (rows as Rresht[]).map(neRiparim);
}

// Vetëm për servisin: një riparim sipas numrit.
export async function gjejRiparimin(id: string): Promise<Riparim | undefined> {
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar
    FROM riparimet WHERE id = ${id}`;
  const r = rows[0] as Rresht | undefined;
  return r ? neRiparim(r) : undefined;
}

// Për klientin: vetëm riparimi që i përket kodit të linkut të tij.
export async function gjejMeKod(kodi: string): Promise<Riparim | undefined> {
  if (!/^[0-9a-f]{32}$/.test(kodi)) return undefined;
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar
    FROM riparimet WHERE kodi = ${kodi}`;
  const r = rows[0] as Rresht | undefined;
  return r ? neRiparim(r) : undefined;
}
