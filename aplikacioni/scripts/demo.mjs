// Demo Day: krijon një riparim të freskët dhe realist për demonstrim, dhe e shfaq linkun e klientit me QR.
//   npm run demo                      → riparim i ri në "Pranuar", gati nesër
//   npm run demo -- https://app.vercel.app   → linku me adresën e publikuar
//   npm run demo:pastro               → fshin vetëm riparimet e krijuara nga ky skript
// Riparimet e demonstrimit shënohen në regjistër me "Demo", jo në emër, që ekrani të duket si në përdorim real.
import { existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import QRCode from "qrcode";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const sql = neon(process.env.DATABASE_URL);
const pastro = process.argv.includes("--pastro");
const adresa = (process.argv.slice(2).find((a) => a.startsWith("http")) ?? "http://localhost:3000").replace(/\/$/, "");

if (pastro) {
  const rows = await sql`DELETE FROM riparimet WHERE id IN (SELECT riparim_id FROM ngjarjet WHERE kush = 'Demo') RETURNING id`;
  console.log(`U fshinë ${rows.length} riparime demonstrimi.`);
  process.exit(0);
}

const pajisjet = [
  ["Samsung Galaxy A35", "Ekrani i thyer në cepin e poshtëm", 75],
  ["iPhone 13", "Bateria mbaron brenda 3 orësh", 55],
  ["Xiaomi Redmi Note 13", "Nuk karikohet, porta e lirshme", 30],
];
const [pajisja, problemi, cmimi] = pajisjet[Math.floor(Math.random() * pajisjet.length)];

const [r] = await sql`WITH r AS (
    INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi, gati_deri)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${pajisja}, ${problemi},
            current_date, 'Pranuar', ${cmimi}, current_date + 1)
    RETURNING id, kodi),
  n AS (INSERT INTO ngjarjet (riparim_id, kush, veprimi) SELECT id, 'Demo', 'Regjistroi riparimin' FROM r)
  SELECT id, kodi FROM r`;

const linku = `${adresa}/r/${r.kodi}`;
console.log(`\nRiparimi nr. ${r.id} · ${pajisja} · ${cmimi} €`);
console.log(`Stafi:   ${adresa}/servisi/riparimi/${r.id}`);
console.log(`Klienti: ${linku}\n`);
console.log(await QRCode.toString(linku, { type: "terminal", small: true }));
console.log("Rrjedha e demonstrimit: Në riparim → kosto shtesë → klienti miraton → Gati → Klienti e mori.");
console.log("Pas demonstrimit: npm run demo:pastro\n");
