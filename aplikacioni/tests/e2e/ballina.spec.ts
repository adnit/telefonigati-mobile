import { expect, test } from "@playwright/test";
import { PREFIKSI, hyr, kodiI, pastro, sql } from "./ndihma";

// Faqja e parë ndryshon sipas kujt e hap: vizitor, staf ose klient me llogari.
const STAFI = "900000000000000000010";
const KLIENTI = "900000000000000000011";
const fillimi = new Date();
test.afterAll(() => pastro(fillimi));

test("pa llogari: linku dhe dy zgjedhjet, Riparimet e mia dhe Jam staf", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Shiko riparimin" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Riparimet e mia" })).toHaveAttribute("href", "/llogaria");
  await expect(page.getByRole("link", { name: "Jam staf" })).toHaveAttribute("href", "/servisi");
});

test("stafi: përshëndetja dhe paneli i servisit me numrat e punës", async ({ browser }) => {
  const c = await browser.newContext();
  await hyr(c, STAFI, "servis", "Arta Provë");
  const p = await c.newPage();
  await p.goto("/");
  await expect(p.locator("main h1")).toHaveText("Përshëndetje, Arta");
  await expect(p.getByRole("region", { name: "Paneli i servisit" })).toContainText("në servis");
  await expect(p.getByRole("link", { name: "Hap panelin" })).toHaveAttribute("href", "/servisi");
  await expect(p.getByRole("link", { name: "Riparim i ri" })).toBeVisible();
});

test("klienti: riparimet e ruajtura në faqen e parë; te /servisi merr rrugëdalje, jo rrugë pa krye", async ({ browser }) => {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Pixel 8"}, 'Kamera', current_date, 'Gati për marrje', 70) RETURNING id`;
  const c = await browser.newContext();
  await hyr(c, KLIENTI, "vizitor", "Blerta Provë");
  await sql`INSERT INTO klientet_riparimet (llogaria_id, riparim_id) VALUES (${KLIENTI}, ${r.id})`;
  const p = await c.newPage();
  await p.goto("/");
  await expect(p.locator("main h1")).toHaveText("Përshëndetje, Blerta");
  await expect(p.getByRole("region", { name: "Paneli i servisit" })).toHaveCount(0);
  const rreshti = p.getByRole("region", { name: "Riparimet e mia" }).getByRole("link", { name: new RegExp(PREFIKSI + "Pixel 8") });
  await expect(rreshti).toHaveAttribute("href", `/r/${await kodiI(r.id)}`);
  await p.goto("/servisi");
  await expect(p.getByRole("link", { name: "Riparimet e mia" })).toBeVisible();
  await expect(p.getByRole("button", { name: "Dil dhe hyr me llogari tjetër" })).toBeVisible();
});
