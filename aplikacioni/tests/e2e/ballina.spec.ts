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

test("stafi nuk ka Riparimet e mia: as në faqen e parë, as te llogaria, as te linku i klientit", async ({ browser }) => {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Galaxy S24"}, 'Ekrani', current_date, 'Pranuar', 90) RETURNING id`;
  const c = await browser.newContext();
  await hyr(c, STAFI, "servis", "Arta Provë");
  // Edhe nëse llogaria ka ruajtur diçka para se të bëhej staf, nuk i shfaqet.
  await sql`INSERT INTO klientet_riparimet (llogaria_id, riparim_id) VALUES (${STAFI}, ${r.id}) ON CONFLICT DO NOTHING`;
  const p = await c.newPage();
  await p.goto("/");
  await expect(p.getByRole("region", { name: "Riparimet e mia" })).toHaveCount(0);
  await p.goto("/llogaria");
  await expect(p.locator("main h1")).toHaveText("Llogaria");
  await expect(p.getByText(PREFIKSI + "Galaxy S24")).toHaveCount(0);
  await expect(p.getByRole("link", { name: "Paneli i servisit" })).toBeVisible();
  await p.goto(`/r/${await kodiI(r.id)}`);
  await expect(p.getByRole("button", { name: "Ruaje te Riparimet e mia" })).toHaveCount(0);
  await expect(p.getByRole("link", { name: /Hape në panelin e servisit/ })).toBeVisible();
  await sql`DELETE FROM klientet_riparimet WHERE llogaria_id = ${STAFI}`;
});

test("hyrja me Google kthehet te faqja kryesore; nga faqja e riparimit, te riparimi", async ({ context }) => {
  // Klikimi nis kalimin te Google; çdo rast në skedë të vet, që ngarkimet të mos përplasen.
  async function callbackNga(faqja: string) {
    const page = await context.newPage();
    await page.goto(faqja);
    const kerkesa = page.waitForRequest((r) => r.url().includes("/api/auth/signin/google") && r.method() === "POST");
    await page.getByRole("button", { name: "Hyr me Google" }).click();
    const callback = new URLSearchParams((await kerkesa).postData() ?? "").get("callbackUrl");
    await page.close();
    return callback;
  }
  expect(await callbackNga("/servisi")).toBe("/");
  expect(await callbackNga("/llogaria")).toBe("/");
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Nova 11"}, 'Ekrani', current_date, 'Pranuar', 50) RETURNING kodi`;
  expect(await callbackNga(`/r/${r.kodi}`)).toBe(`/r/${r.kodi}`);
});
