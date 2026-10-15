import "server-only";
import { getSql } from "./db";

export type Statusi = "Pranuar" | "Në riparim" | "Gati për marrje";

export type Riparim = {
  id: string;
  pajisja: string;
  problemi: string;
  dorezuar: string;
  statusi: Statusi;
  // çmimi i vlerësuar që servisi e jep në banak
  cmimi: number;
  // problem i gjetur gjatë punës; pret miratimin e klientit
  shtese: { arsyeja: string; cmimi: number } | null;
};

type Rresht = Omit<Riparim, "shtese"> & {
  shtese_arsyeja: string | null;
  shtese_cmimi: number | null;
};

function neRiparim(r: Rresht): Riparim {
  return {
    id: r.id,
    pajisja: r.pajisja,
    problemi: r.problemi,
    dorezuar: r.dorezuar,
    statusi: r.statusi,
    cmimi: r.cmimi,
    shtese:
      r.shtese_arsyeja !== null && r.shtese_cmimi !== null
        ? { arsyeja: r.shtese_arsyeja, cmimi: r.shtese_cmimi }
        : null,
  };
}

export async function lexoRiparimet(): Promise<Riparim[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
           statusi, cmimi, shtese_arsyeja, shtese_cmimi
    FROM riparimet ORDER BY riparimet.dorezuar DESC, id
  `;
  return (rows as Rresht[]).map(neRiparim);
}

export async function gjejRiparimin(id: string): Promise<Riparim | undefined> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, pajisja, problemi, to_char(dorezuar, 'DD.MM.YYYY') AS dorezuar,
           statusi, cmimi, shtese_arsyeja, shtese_cmimi
    FROM riparimet WHERE id = ${id}
  `;
  const rresht = rows[0] as Rresht | undefined;
  return rresht ? neRiparim(rresht) : undefined;
}
