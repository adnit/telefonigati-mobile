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

test("tabela në ekran të gjerë: karta kalon me → dhe me tërheqje te kolona", async ({ browser }) => {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Moto G54"}, 'Bateria', current_date, 'Pranuar', 30) RETURNING id`;
  const c = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await hyr(c, STAFI, "servis");
  const p = await c.newPage();
  await p.goto("/servisi/tabela");
  const kolona = (k: string) => p.locator(`section[data-kolona="${k}"]`);
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

test("tabela në telefon: një kolonë në një kohë, karta tërhiqet me gisht te skeda", async ({ browser }) => {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Nord 4"}, 'Ekrani', current_date, 'Pranuar', 60) RETURNING id`;
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await hyr(c, STAFI, "servis");
  const p = await c.newPage();
  await p.goto("/servisi/tabela");
  await expect(p.locator('section[data-kolona="Pranuar"]')).toBeVisible();
  await expect(p.locator('section[data-kolona="Në riparim"]')).toBeHidden();
  // Prekje e vërtetë (jo maus): nga doreza te skeda "Në riparim"
  const cdp = await c.newCDPSession(p);
  const prek = (type: string, x = 0, y = 0) => cdp.send("Input.dispatchTouchEvent", { type: type as "touchStart", touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  const d = (await p.getByRole("button", { name: `Tërhiq ${PREFIKSI}Nord 4` }).boundingBox())!;
  const t = (await p.getByRole("tab", { name: /Në riparim/ }).boundingBox())!;
  const [sx, sy, tx, ty] = [d.x + d.width / 2, d.y + d.height / 2, t.x + t.width / 2, t.y + t.height / 2];
  await prek("touchStart", sx, sy);
  for (let i = 1; i <= 20; i++) await prek("touchMove", sx + ((tx - sx) * i) / 20, sy + ((ty - sy) * i) / 20);
  await expect(p.locator(".board-tab--target")).toHaveCount(1);
  await prek("touchEnd");
  await expect(p.getByRole("tab", { name: /Në riparim/ })).toHaveAttribute("aria-selected", "true");
  await expect(p.locator('section[data-kolona="Në riparim"]')).toContainText(PREFIKSI + "Nord 4");
  await expect.poll(async () => (await sql`SELECT statusi FROM riparimet WHERE id = ${r.id}`)[0].statusi).toBe("Në riparim");
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
