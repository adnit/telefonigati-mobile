// Ekzekuton një skedar SQL në databazë brenda një transaksioni: ose të gjitha komandat, ose asnjëra.
//   npm run db:migrate -- schema-v4.sql
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const skedari = process.argv[2];
if (!skedari) { console.error("Përdorimi: npm run db:migrate -- <skedari.sql>"); process.exit(1); }

// Ndarja lexon shkronjë për shkronjë: ";" brenda '…', "…" ose $$ … $$ nuk e ndan komandën.
const teksti = readFileSync(skedari, "utf8");
const komandat = [];
let tani = "", thonjeza = null, i = 0;
while (i < teksti.length) {
  const c = teksti[i];
  if (!thonjeza && c === "-" && teksti[i + 1] === "-") { while (i < teksti.length && teksti[i] !== "\n") i++; continue; }
  if (!thonjeza && teksti.startsWith("$$", i)) { thonjeza = "$$"; tani += "$$"; i += 2; continue; }
  if (thonjeza === "$$" && teksti.startsWith("$$", i)) { thonjeza = null; tani += "$$"; i += 2; continue; }
  if (!thonjeza && (c === "'" || c === '"')) thonjeza = c;
  else if (thonjeza === c && c !== "$") thonjeza = null;
  if (!thonjeza && c === ";") { if (tani.trim()) komandat.push(tani.trim()); tani = ""; i++; continue; }
  tani += c; i++;
}
if (tani.trim()) komandat.push(tani.trim());

const sql = neon(process.env.DATABASE_URL);
await sql.transaction(komandat.map((k) => sql.query(k)));
console.log(`${skedari}: u ekzekutuan ${komandat.length} komanda në një transaksion.`);
