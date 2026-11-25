import { expect, test } from "@playwright/test";
import { PREFIKSI, hyr, pastro, sql } from "./ndihma";

// Veçoritë e versionit 5: tabela, çmimorja me plotësim automatik dhe kufijtë e lejeve për të.
const PRONARI = "900000000000000000004";
const STAFI = "900000000000000000005";
const fillimi = new Date();
test.afterAll(async () => {
  await sql`DELETE FROM cmimet WHERE problemi LIKE ${PREFIKSI + "%"}`;
  await pastro(fillimi);
});

test("tabela: karta kalon në kolonën tjetër me → dhe me tërheqje", async ({ browser }) => {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Moto G54"}, 'Bateria', current_date, 'Pranuar', 30) RETURNING id`;
  const c = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await hyr(c, STAFI, "servis");
  const p = await c.newPage();
  await p.goto("/servisi/tabela");
  const kolona = (k: string) => p.locator(`[data-kolona="${k}"]`);
  await expect(kolona("Pranuar")).toContainText(PREFIKSI + "Moto G54");

  await kolona("Pranuar").getByRole("button", { name: `Kalo ${PREFIKSI}Moto G54 te Në riparim` }).click();
  await expect(kolona("Në riparim")).toContainText(PREFIKSI + "Moto G54");
  await expect.poll(async () => (await sql`SELECT statusi FROM riparimet WHERE id = ${r.id}`)[0].statusi).toBe("Në riparim");

  // Tërheqja nga doreza te kolona "Gati për marrje"
  const doreza = (await kolona("Në riparim").getByRole("button", { name: `Tërhiq ${PREFIKSI}Moto G54` }).boundingBox())!;
  const synimi = (await kolona("Gati për marrje").boundingBox())!;
  await p.mouse.move(doreza.x + 10, doreza.y + 10); await p.mouse.down();
  await p.mouse.move(synimi.x + synimi.width / 2, synimi.y + 200, { steps: 15 });
  await p.mouse.up();
  await expect(kolona("Gati për marrje")).toContainText(PREFIKSI + "Moto G54");
  await expect.poll(async () => (await sql`SELECT statusi FROM riparimet WHERE id = ${r.id}`)[0].statusi).toBe("Gati për marrje");
  const [n] = await sql`SELECT kush, veprimi FROM ngjarjet WHERE riparim_id = ${r.id} ORDER BY id DESC LIMIT 1`;
  expect(n.veprimi).toBe("Statusi → Gati për marrje");
});

test("çmimorja: pronari shton një çmim dhe pranimi e plotëson vetë", async ({ browser }) => {
  const c = await browser.newContext();
  await hyr(c, PRONARI, "pronar");
  const p = await c.newPage();
  await p.goto("/servisi/cilesimet");
  await p.fill("#c-problemi", PREFIKSI + "Xham kamere");
  await p.selectOption("#c-marka", "Google");
  await p.fill("#c-cmimi", "44");
  await p.fill("#c-dite", "3");
  await p.getByRole("button", { name: "Shto në çmimore" }).click();
  await expect(p.locator(".toast")).toContainText("Çmimi u ruajt");

  await p.goto("/servisi/i-ri");
  await p.getByRole("button", { name: /Google/ }).click();
  await p.getByRole("button", { name: "Pixel 8", exact: true }).click();
  await expect(p.locator("#pajisja")).toHaveValue("Google Pixel 8");
  await p.getByRole("button", { name: new RegExp(PREFIKSI + "Xham kamere") }).click();
  await expect(p.locator("#cmimi")).toHaveValue("44");
  const pas3 = new Date(); pas3.setDate(pas3.getDate() + 3);
  await expect(p.locator("#gati_deri")).toHaveValue(pas3.toLocaleDateString("en-CA"));
  // Çmimi i shkruar me dorë nuk mbishkruhet
  await p.fill("#cmimi", "50");
  await p.getByRole("group", { name: "Problemet e shpeshta" }).getByRole("button", { name: "Bateria" }).click();
  await expect(p.locator("#cmimi")).toHaveValue("50");
});

test("çmimorja: stafi nuk e sheh dhe nuk e ndryshon", async ({ browser }) => {
  const c = await browser.newContext();
  await hyr(c, STAFI, "servis");
  const p = await c.newPage();
  await p.goto("/servisi/cilesimet");
  await expect(p.locator("#cmimorja")).toHaveCount(0);
  await expect(p.locator("#c-problemi")).toHaveCount(0);
});
