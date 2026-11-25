import "server-only";
import { getSql } from "./db";
import type { Statusi } from "./riparimet";

// Riparimet që klienti ka ruajtur në llogarinë e vet. Linku hapet vetëm deri 30 ditë pas marrjes,
// si linku privat; pas kësaj lista tregon vetëm përmbledhjen.
export type RiparimIRuajtur = {
  id: string; kodi: string; pajisja: string; problemi: string; statusi: Statusi;
  dorezuar: string; marre: string | null; totali: number; linkAktiv: boolean;
};

export async function lexoRiparimetEMia(llogariaId: string): Promise<RiparimIRuajtur[]> {
  const sql = getSql();
  const rows = await sql`SELECT r.id, r.kodi, r.pajisja, r.problemi, r.statusi,
      to_char(r.dorezuar, 'DD.MM.YYYY') AS dorezuar,
      to_char(r.marre AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY') AS marre,
      r.cmimi + CASE WHEN r.vendimi = 'miratuar' THEN coalesce(r.shtese_cmimi, 0) ELSE 0 END AS totali,
      (r.marre IS NULL OR r.marre > now() - interval '30 days') AS "linkAktiv"
    FROM klientet_riparimet k JOIN riparimet r ON r.id = k.riparim_id
    WHERE k.llogaria_id = ${llogariaId}
    ORDER BY (r.statusi = 'Marrë'), k.ruajtur DESC`;
  return rows as RiparimIRuajtur[];
}

export async function eshteRuajtur(llogariaId: string, kodi: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`SELECT 1 FROM klientet_riparimet k JOIN riparimet r ON r.id = k.riparim_id
    WHERE k.llogaria_id = ${llogariaId} AND r.kodi = ${kodi}`;
  return rows.length > 0;
}
