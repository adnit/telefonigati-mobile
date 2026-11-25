import { expect, test } from "@playwright/test";
import { PREFIKSI, hyr, kodiI, pastro, sql } from "./ndihma";

// Llogaria opsionale e klientit: linku punon pa të; me të, riparimet ruhen te "Riparimet e mia".
const KLIENTI = "900000000000000000006";
const fillimi = new Date();
test.afterAll(() => pastro(fillimi));

async function riparim(emri: string) {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + emri}, 'Ekrani', current_date, 'Në riparim', 80) RETURNING id`;
  return r.id as string;
}

test("pa llogari: linku punon dhe hyrja është vetëm një ofertë", async ({ browser }) => {
  const kodi = await kodiI(await riparim("Galaxy A15"));
  const p = await (await browser.newContext()).newPage();
  await p.goto(`/r/${kodi}`);
  await expect(p.locator(".status-hero__value")).toHaveText("Në riparim");
  await expect(p.getByText("Ruaje në llogarinë tënde")).toBeVisible();
  await expect(p.getByRole("button", { name: "Hyr me Google" })).toBeVisible();
  await p.goto("/llogaria");
  await expect(p.getByRole("link", { name: "Vazhdo pa llogari" })).toBeVisible();
});

test("me llogari: ruan riparimin, e sheh në listë, e heq dhe e fshin llogarinë", async ({ browser }) => {
  const id = await riparim("iPhone 14");
  const kodi = await kodiI(id);
  const c = await browser.newContext();
  await hyr(c, KLIENTI, "vizitor", "Blerta Klientja");
  const p = await c.newPage();

  await p.goto(`/r/${kodi}`);
  await p.getByRole("button", { name: "Ruaje te Riparimet e mia" }).click();
  await expect(p.locator(".toast")).toContainText("U ruajt");
  await expect(p.getByRole("link", { name: "E ruajtur te Riparimet e mia" })).toBeVisible();

  await p.goto("/llogaria");
  await expect(p.locator("main h1")).toHaveText("Riparimet e mia");
  await expect(p.getByRole("region", { name: "Në servis" })).toContainText(PREFIKSI + "iPhone 14");
  // Klienti nuk ka qasje te servisi
  await expect(p.getByRole("link", { name: "Paneli i servisit" })).toHaveCount(0);

  await p.getByRole("button", { name: `Hiqe ${PREFIKSI}iPhone 14 nga lista` }).click();
  await expect(p.locator(".toast")).toContainText("U hoq");
  expect((await sql`SELECT count(*)::int AS n FROM klientet_riparimet WHERE llogaria_id = ${KLIENTI}`)[0].n).toBe(0);
  // Riparimi vetë nuk preket
  expect((await sql`SELECT count(*)::int AS n FROM riparimet WHERE id = ${id}`)[0].n).toBe(1);

  await p.goto(`/r/${kodi}`);
  await p.getByRole("button", { name: "Ruaje te Riparimet e mia" }).click();
  await expect(p.locator(".toast")).toContainText("U ruajt");
  await p.goto("/llogaria");
  p.once("dialog", (d) => d.accept());
  await p.getByRole("button", { name: "Fshi llogarinë" }).click();
  // Pas fshirjes NextAuth e çon te NEXTAUTH_URL (në teste një port tjetër), prandaj kontrollohet databaza.
  await expect.poll(async () => (await sql`SELECT count(*)::int AS n FROM profilet WHERE llogaria_id = ${KLIENTI}`)[0].n).toBe(0);
  expect((await sql`SELECT count(*)::int AS n FROM klientet_riparimet WHERE llogaria_id = ${KLIENTI}`)[0].n).toBe(0);
});
