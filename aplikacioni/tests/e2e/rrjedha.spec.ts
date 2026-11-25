import { expect, test } from "@playwright/test";
import { PREFIKSI, hyr, kodiI, pastro, sql } from "./ndihma";

// Rrjedha kryesore nga banaku te klienti dhe mbrapsht, si në Demo Day.
const PRONARI = "900000000000000000001";
const fillimi = new Date();
test.afterAll(() => pastro(fillimi));

test("pranimi → statusi → kosto shtesë → miratimi → mbyllja → përshtypja", async ({ browser }) => {
  const stafi = await browser.newContext();
  await hyr(stafi, PRONARI, "pronar");
  const s = await stafi.newPage();

  // Pranimi në banak me IMEI dhe datë
  await s.goto("/servisi/i-ri");
  await s.fill("#pajisja", PREFIKSI + "Galaxy S23");
  await s.fill("#problemi", "Ekrani nuk ndizet");
  await s.fill("#cmimi", "90");
  await s.fill("#imei", "490154203237518");
  await expect(s.getByText("IMEI i vlefshëm ✓")).toBeVisible();
  await s.getByRole("button", { name: "Nesër" }).click();
  await s.getByRole("button", { name: "Regjistro dhe krijo linkun" }).click();
  await expect(s.locator(".toast")).toContainText("Riparimi u regjistrua");
  const id = s.url().match(/riparimi\/(\d+)/)![1];
  const kodi = await kodiI(id);
  await expect(s.locator(".facts")).toContainText("490154203237518");

  // Statusi me fletën nga poshtë, me "Zhbëj"
  await s.getByRole("button", { name: "Ndrysho statusin" }).click();
  await s.locator("dialog[open] .option", { hasText: "Në riparim" }).click();
  await expect(s.locator(".toast")).toContainText("Statusi u ruajt");
  await s.getByRole("button", { name: "Zhbëj" }).click();
  await expect(s.locator(".toast")).toContainText("Statusi u kthye");
  expect((await sql`SELECT statusi FROM riparimet WHERE id = ${id}`)[0].statusi).toBe("Pranuar");

  // Kosto shtesë
  await s.getByRole("button", { name: "Kosto shtesë" }).click();
  await s.locator("dialog[open] #arsyeja").fill("Kablli i ekranit");
  await s.locator("dialog[open] #cmimi").fill("15");
  await s.locator("dialog[open]").getByRole("button", { name: "Dërgo koston klientit" }).click();
  await expect(s.locator(".toast")).toContainText("iu dërgua klientit");

  // Klienti miraton nga linku privat
  const k = await (await browser.newContext()).newPage();
  await k.goto(`/r/${kodi}`);
  await expect(k.locator(".status-hero__value")).toHaveText("Pranuar");
  await expect(k.locator(".eta")).toContainText("nesër");
  await k.getByRole("button", { name: "Mirato" }).click();
  await expect(k.locator(".toast")).toContainText("Faleminderit");

  // Hapi tjetër me një prekje: Fillo → Gati, pastaj mbyllja me shumën e plotë
  await s.reload();
  await s.getByRole("button", { name: "Fillo riparimin" }).click();
  await expect(s.locator(".toast")).toContainText("Statusi u ruajt");
  await s.getByRole("button", { name: "Shëno gati për marrje" }).click();
  await expect(s.locator(".status-hero__value")).toHaveText("Gati për marrje");
  // Marrja: klienti nënshkruan në ekran; pa nënshkrim butoni nuk punon
  await s.getByRole("button", { name: "Klienti e mori · 105 €" }).click();
  const konfirmo = s.locator("dialog[open]").getByRole("button", { name: /Konfirmo marrjen/ });
  await expect(konfirmo).toBeDisabled();
  // Fleta duhet të ketë mbaruar së ngjituri, përndryshe vija bie jashtë fushës.
  await expect(s.locator("dialog[open]")).toHaveCSS("animation-name", "none");
  const pad = (await s.locator("dialog[open] canvas").boundingBox())!;
  await s.mouse.move(pad.x + 30, pad.y + 100); await s.mouse.down();
  for (let i = 1; i <= 20; i++) await s.mouse.move(pad.x + 30 + i * 12, pad.y + 100 - Math.sin(i / 2) * 30);
  await s.mouse.up();
  await konfirmo.click();
  await expect(s.locator(".panel--closed")).toContainText("Paguar");
  await expect(s.locator(".signature-shown img")).toBeVisible();
  expect((await sql`SELECT nenshkrimi FROM riparimet WHERE id = ${id}`)[0].nenshkrimi).toMatch(/^data:image\/png;base64,/);

  // Klienti përgjigjet një herë; përgjigjja e dytë nuk ruhet
  await k.goto(`/r/${kodi}`);
  await k.getByRole("button", { name: "Po" }).click();
  await expect(k.locator(".toast")).toContainText("Faleminderit");
  await expect(k.getByRole("button", { name: "Po" })).toHaveCount(0);
  expect((await sql`SELECT count(*)::int AS n FROM pershtypjet WHERE riparim_id = ${id}`)[0].n).toBe(1);

  // Regjistri tregon kush bëri çfarë
  await s.goto(`/servisi/riparimi/${id}`);
  const aktiviteti = s.locator(".activity");
  for (const v of ["Regjistroi riparimin", "Zhbëu statusin", "Kosto shtesë +15 €", "Miratoi koston shtesë", "Mbylli riparimin · paguar 105 € · me nënshkrim", "Linku i kurseu një telefonatë"]) {
    await expect(aktiviteti).toContainText(v);
  }
});
