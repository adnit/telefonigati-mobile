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
  // data e pritur kur telefoni del gati (YYYY-MM-DD); null kur servisi nuk e ka caktuar
  gatiDeri: string | null;
};

type Rresht = Omit<Riparim, "shtese"> & {
  shtese_arsyeja: string | null;
  shtese_cmimi: number | null;
  vendimi: Vendimi | null;
  foto?: string | null;
  marre: string | null;
  gati_deri: string | null;
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
    gatiDeri: r.gati_deri,
  };
}

// Vetëm për servisin: të gjitha riparimet, më i riu i pari.
// Datat formatohen në SQL me orën e Kosovës, që teksti të jetë i njëjtë kudo.
export async function lexoRiparimet(): Promise<Riparim[]> {
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar,
    to_char(gati_deri, 'YYYY-MM-DD') AS gati_deri,
    to_char(marre AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY') AS marre
    FROM riparimet ORDER BY riparimet.dorezuar DESC, riparimet.perditesuar DESC`;
  return (rows as Rresht[]).map(neRiparim);
}

// Vetëm për servisin: një riparim sipas numrit.
// Vetëm për stafin: riparimi me numrin e telefonit të klientit (për WhatsApp).
// Numri nuk lexohet kurrë nga faqja e klientit (gjejMeKod).
export async function gjejRiparimin(id: string): Promise<(Riparim & { telefoni: string | null }) | undefined> {
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar,
    to_char(gati_deri, 'YYYY-MM-DD') AS gati_deri,
    to_char(marre AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY') AS marre
    , foto, telefoni FROM riparimet WHERE id = ${id}`;
  const r = rows[0] as (Rresht & { telefoni: string | null }) | undefined;
  return r ? { ...neRiparim(r), telefoni: r.telefoni } : undefined;
}

// Për klientin: vetëm riparimi që i përket kodit të linkut të tij.
// 30 ditë pasi telefoni merret, linku nuk hapet më.
export async function gjejMeKod(kodi: string): Promise<Riparim | undefined> {
  if (!/^[0-9a-f]{32}$/.test(kodi)) return undefined;
  const sql = getSql();
  const rows = await sql`SELECT id, kodi, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
    statusi, cmimi, shtese_arsyeja, shtese_cmimi, vendimi,
    to_char(perditesuar AT TIME ZONE 'Europe/Belgrade', 'DD.MM.YYYY HH24:MI') AS perditesuar,
    to_char(gati_deri, 'YYYY-MM-DD') AS gati_deri,
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

export type Hap = { statusi: Statusi; koha: string };

// Kur ndodhi secili hap (shkruhet nga databaza me trigger, shih schema-perfundimi.sql).
// Për çdo status mbahet koha e fundit, që një rikthim të mos e ngatërrojë shiritin.
export async function lexoHistorikun(riparimId: string): Promise<Partial<Record<Statusi, string>>> {
  const sql = getSql();
  const rows = await sql`SELECT DISTINCT ON (statusi) statusi,
      to_char(koha AT TIME ZONE 'Europe/Belgrade', 'DD.MM · HH24:MI') AS koha
    FROM historiku WHERE riparim_id = ${riparimId}
    ORDER BY statusi, koha DESC`;
  return Object.fromEntries((rows as Hap[]).map((h) => [h.statusi, h.koha]));
}

export type Shenim = { id: string; autori: string; teksti: string; koha: string };

// Shënimet e brendshme të stafit; nuk lexohen kurrë nga faqja e klientit.
export async function lexoShenimet(riparimId: string): Promise<Shenim[]> {
  const sql = getSql();
  const rows = await sql`SELECT id::text, autori, teksti,
      to_char(koha AT TIME ZONE 'Europe/Belgrade', 'DD.MM · HH24:MI') AS koha
    FROM shenimet WHERE riparim_id = ${riparimId} ORDER BY shenimet.koha DESC`;
  return rows as Shenim[];
}

export type Servisi = { emri: string; telefoni: string | null; orari: string | null; adresa: string | null };

export async function lexoServisin(): Promise<Servisi> {
  const sql = getSql();
  const [r] = await sql`SELECT emri, telefoni, orari, adresa FROM servisi LIMIT 1`;
  return (r as Servisi) ?? { emri: "Servisi", telefoni: null, orari: null, adresa: null };
}

export type Permbledhja = {
  javaRiparime: number;
  neServis: number;
  sipasStatusit: { statusi: Statusi; numri: number }[];
  hyrjaJava: number;
  shteseMiratuar: number;
  diteMesatare: number | null;
  ditet: { dita: string; numri: number }[];
};

const DITET = ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"];

// Përmbledhja e pronarit: java e fundit, gjendja tani dhe shpejtësia e riparimeve.
export async function lexoPermbledhjen(): Promise<Permbledhja> {
  const sql = getSql();
  const [[a], statuset, ditet] = await Promise.all([
    sql`SELECT
        count(*) FILTER (WHERE dorezuar > current_date - 7)::int AS java_riparime,
        count(*) FILTER (WHERE statusi <> 'Marrë')::int AS ne_servis,
        coalesce(sum(cmimi + CASE WHEN vendimi = 'miratuar' THEN shtese_cmimi ELSE 0 END)
          FILTER (WHERE statusi = 'Marrë' AND marre > now() - interval '7 days'), 0)::int AS hyrja_java,
        coalesce(sum(shtese_cmimi) FILTER (WHERE vendimi = 'miratuar'), 0)::int AS shtese_miratuar,
        -- ditët nga hyrja në historik deri te "Gati për marrje", për riparimet që kanë arritur aty
        round(avg(extract(epoch FROM (h.koha - k.krijuar)) / 86400)::numeric, 1)::float AS dite_mesatare
      FROM riparimet r
      LEFT JOIN LATERAL (SELECT min(koha) AS koha FROM historiku
        WHERE riparim_id = r.id AND statusi = 'Gati për marrje') h ON true
      LEFT JOIN LATERAL (SELECT min(koha) AS krijuar FROM historiku WHERE riparim_id = r.id) k ON true`,
    sql`SELECT statusi, count(*)::int AS numri FROM riparimet WHERE statusi <> 'Marrë'
      GROUP BY statusi ORDER BY array_position(ARRAY['Pranuar', 'Në riparim', 'Gati për marrje'], statusi)`,
    sql`SELECT extract(isodow FROM d)::int AS dow, count(r.id)::int AS numri
      FROM generate_series(current_date - 6, current_date, interval '1 day') d
      LEFT JOIN riparimet r ON r.dorezuar = d::date
      GROUP BY d ORDER BY d`,
  ]);
  return {
    javaRiparime: a.java_riparime, neServis: a.ne_servis, hyrjaJava: a.hyrja_java,
    shteseMiratuar: a.shtese_miratuar, diteMesatare: a.dite_mesatare,
    sipasStatusit: statuset as Permbledhja["sipasStatusit"],
    ditet: (ditet as { dow: number; numri: number }[]).map((d) => ({ dita: DITET[d.dow - 1], numri: d.numri })),
  };
}

// Historiku sipas kodit të klientit, që faqja e klientit t'i lexojë të gjitha njëherësh.
export async function lexoHistorikunMeKod(kodi: string): Promise<Partial<Record<Statusi, string>>> {
  if (!/^[0-9a-f]{32}$/.test(kodi)) return {};
  const sql = getSql();
  const rows = await sql`SELECT DISTINCT ON (h.statusi) h.statusi,
      to_char(h.koha AT TIME ZONE 'Europe/Belgrade', 'DD.MM · HH24:MI') AS koha
    FROM historiku h JOIN riparimet r ON r.id = h.riparim_id
    WHERE r.kodi = ${kodi}
    ORDER BY h.statusi, h.koha DESC`;
  return Object.fromEntries((rows as Hap[]).map((h) => [h.statusi, h.koha]));
}

// Versioni sipas numrit, që faqja e stafit të mos presë fillimisht riparimin.
export async function versioniSipasNumrit(id: string): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`SELECT (extract(epoch FROM perditesuar) * 1000)::bigint::text AS v
    FROM riparimet WHERE id = ${id}`;
  return (rows[0]?.v as string | undefined) ?? null;
}
