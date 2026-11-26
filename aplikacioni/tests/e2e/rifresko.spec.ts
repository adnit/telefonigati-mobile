import { expect, test } from "@playwright/test";
import { PREFIKSI, hyr, pastro, sql } from "./ndihma";

// Rifresko duke tërhequr poshtë, me prekje të vërtetë: faqja merr të dhënat e reja pa u ringarkuar.
const KLIENTI = "900000000000000000012";
const fillimi = new Date();
test.afterAll(() => pastro(fillimi));

test("tërheqja poshtë nga maja rifreskon; tërheqja e shkurtër jo", async ({ browser }) => {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Moto G84"}, 'Bateria', current_date, 'Në riparim', 45) RETURNING id`;
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await hyr(c, KLIENTI, "vizitor", "Dita Provë");
  await sql`INSERT INTO klientet_riparimet (llogaria_id, riparim_id) VALUES (${KLIENTI}, ${r.id})`;
  const p = await c.newPage();
  await p.goto("/llogaria");
  const rreshti = p.getByRole("region", { name: "Në servis" });
  await expect(rreshti).toContainText("Në riparim");
  await sql`UPDATE riparimet SET statusi = 'Gati për marrje' WHERE id = ${r.id}`;

  const cdp = await c.newCDPSession(p);
  const prek = (type: string, y = 0) => cdp.send("Input.dispatchTouchEvent", { type: type as "touchStart", touchPoints: type === "touchEnd" ? [] : [{ x: 200, y }] });
  const terhiq = async (deri: number) => {
    await prek("touchStart", 250);
    for (let i = 1; i <= 20; i++) await prek("touchMove", 250 + (deri * i) / 20);
    await prek("touchEnd");
  };

  // E shkurtër: treguesi shfaqet dhe kthehet, faqja mbetet si ishte.
  await terhiq(60);
  await expect(p.locator(".ptr")).toHaveCount(0);
  await expect(rreshti).toContainText("Në riparim");

  // E gjatë: rifreskohet dhe shfaqet statusi i ri.
  await terhiq(320);
  await expect(p.locator(".ptr")).toBeVisible();
  await expect(p.getByRole("region", { name: "Gati për marrje" }).or(p.getByRole("region", { name: "Në servis" }))).toContainText("Gati për marrje");
  await expect(p.locator(".ptr")).toHaveCount(0);
});
