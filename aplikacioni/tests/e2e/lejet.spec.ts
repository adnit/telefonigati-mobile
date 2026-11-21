import { expect, test } from "@playwright/test";
import { PREFIKSI, hyr, kodiI, pastro, sql } from "./ndihma";

// Rregullat e lejeve dhe të sigurisë provohen në server, jo vetëm duke fshehur butonat.
const STAFI = "900000000000000000002";
const VIZITORI = "900000000000000000003";
const fillimi = new Date();
test.afterAll(() => pastro(fillimi));

async function riparimProve() {
  const [r] = await sql`INSERT INTO riparimet (id, kodi, pajisja, problemi, dorezuar, statusi, cmimi, telefoni, shtese_arsyeja, shtese_cmimi, vendimi)
    VALUES (nextval('riparimet_nr')::text, replace(gen_random_uuid()::text, '-', ''), ${PREFIKSI + "Pixel 7"}, 'Bateria',
      current_date, 'Në riparim', 40, '+38344999888', 'Porta', 10, 'pritje') RETURNING id`;
  await sql`INSERT INTO shenimet (riparim_id, autori, teksti) VALUES (${r.id}, 'Stafi', 'Shënim sekret i stafit')`;
  return r.id as string;
}

test("vizitori nuk hyn në faqet e stafit", async ({ browser }) => {
  const c = await browser.newContext();
  await hyr(c, VIZITORI, "vizitor");
  const p = await c.newPage();
  for (const u of ["/servisi", "/servisi/i-ri", "/servisi/permbledhja", "/servisi/cilesimet"]) {
    await p.goto(u);
    await expect(p.locator("main h1").first()).toHaveText("Llogaria nuk është ende e stafit");
  }
});

test("stafi nuk hap cilësimet e pronarit", async ({ browser }) => {
  const c = await browser.newContext();
  await hyr(c, STAFI, "servis");
  const p = await c.newPage();
  await p.goto("/servisi/cilesimet");
  await expect(p).toHaveURL(/\/servisi$/);
  await expect(p.locator(".tabbar")).not.toContainText("Cilësimet");
});

test("roli i hequr gjatë punës: serveri e refuzon veprimin nga faqja e hapur", async ({ browser }) => {
  const id = await riparimProve();
  const c = await browser.newContext();
  await hyr(c, STAFI, "servis");
  const p = await c.newPage();
  await p.goto(`/servisi/riparimi/${id}`);
  await sql`UPDATE profilet SET roli = 'vizitor' WHERE llogaria_id = ${STAFI}`;
  await p.getByRole("button", { name: "Ndrysho statusin" }).click();
  await p.locator("dialog[open] .option", { hasText: "Gati për marrje" }).click();
  await p.waitForLoadState("networkidle");
  expect((await sql`SELECT statusi FROM riparimet WHERE id = ${id}`)[0].statusi).toBe("Në riparim");
});

test("klienti nuk sheh telefonin, IMEI-n as shënimet; vendos vetëm një herë", async ({ browser }) => {
  const id = await riparimProve();
  const kodi = await kodiI(id);
  const p = await (await browser.newContext()).newPage();
  await p.goto(`/r/${kodi}`);
  const html = await p.content();
  expect(html).not.toContain("999888");
  expect(html).not.toContain("Shënim sekret");
  const eVjeter = await (await browser.newContext()).newPage();
  await eVjeter.goto(`/r/${kodi}`);
  await p.getByRole("button", { name: "Mirato" }).click();
  await expect(p.locator(".toast")).toContainText("Faleminderit");
  await eVjeter.getByRole("button", { name: "Refuzo" }).click();
  await expect(eVjeter.locator(".toast")).toContainText("vendosur tashmë");
  expect((await sql`SELECT vendimi FROM riparimet WHERE id = ${id}`)[0].vendimi).toBe("miratuar");
});

test("kodet e gabuara bllokohen pas 20 provave", async ({ browser }) => {
  // IP e veçantë që blloku të mos prekë testet e tjera.
  const c = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": "203.0.113.77" } });
  const p = await c.newPage();
  for (let i = 0; i < 20; i++) {
    const r = await p.request.get(`/api/r/${i.toString(16).padStart(32, "0")}/versioni`);
    expect(r.status()).toBe(404);
  }
  expect((await p.request.get(`/api/r/${"f".repeat(32)}/versioni`)).status()).toBe(429);
  await p.goto(`/r/${"e".repeat(32)}`);
  await expect(p.locator("main h1")).toHaveText("Shumë prova");
});

test("kokat e sigurisë dhe fotoja e stafit pa hyrje", async ({ request }) => {
  const r = await request.get("/");
  expect(r.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(r.headers()["referrer-policy"]).toBe("no-referrer");
  const id = await riparimProve();
  expect((await request.get(`/servisi/riparimi/${id}/foto`)).status()).toBe(403);
});
