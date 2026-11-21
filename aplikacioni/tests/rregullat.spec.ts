import { expect, test } from "@playwright/test";
import { euro, imeiVlefshem, normalizoImei, normalizoTelefonin, validoDaten } from "../src/lib/rregullat";

// Rregullat e validimit pa shfletues dhe pa databazë: të shpejta, ekzekutohen në çdo push.
test.describe("rregullat", () => {
  test("numri i telefonit kthehet në formën ndërkombëtare", () => {
    expect(normalizoTelefonin("044 123 456")).toBe("+38344123456");
    expect(normalizoTelefonin("049-111-222")).toBe("+38349111222");
    expect(normalizoTelefonin("+383 44 123 456")).toBe("+38344123456");
    expect(normalizoTelefonin("0038344123456")).toBe("+38344123456");
    expect(normalizoTelefonin("")).toBeNull();
    expect(normalizoTelefonin("12ab")).toBe("gabim");
  });

  test("çmimi pranon 0–9999 euro", () => {
    expect(euro("35")).toBe(35);
    expect(euro(" 0 ")).toBe(0);
    expect(euro("10000")).toBeNull();
    expect(euro("-5")).toBeNull();
    expect(euro("3.5")).toBeNull();
  });

  test("data e pritur: nga sot deri në 60 ditë", () => {
    const sot = new Date("2026-11-21T10:00:00");
    expect(validoDaten("2026-11-21", sot)).toBe("2026-11-21");
    expect(validoDaten("2027-01-20", sot)).toBe("2027-01-20");
    expect(validoDaten("2027-01-21", sot)).toBe("gabim");
    expect(validoDaten("2026-11-20", sot)).toBe("gabim");
    expect(validoDaten("2026-02-30", sot)).toBe("gabim");
    expect(validoDaten("", sot)).toBeNull();
  });

  test("IMEI kontrollohet me shifrën Luhn", () => {
    expect(imeiVlefshem("490154203237518")).toBe(true);
    expect(imeiVlefshem("490154203237519")).toBe(false);
    expect(imeiVlefshem("49015420323751")).toBe(false);
    expect(normalizoImei("49-015420-323751-8")).toBe("490154203237518");
    expect(normalizoImei("123")).toBe("gabim");
    expect(normalizoImei("")).toBeNull();
  });
});
