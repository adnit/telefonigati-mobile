import "server-only";
import webpush from "web-push";
import { getSql } from "./db";

let gati = false;
function konfiguro() {
  if (gati) return true;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  gati = true;
  return true;
}

export type Njoftim = { titulli: string; teksti: string };

// I dërgon njoftimin çdo telefoni që klienti e ka lejuar për këtë riparim.
// Një njoftim që dështon nuk e ndal kurrë ruajtjen e statusit.
export async function dergoNjoftim(kodi: string, n: Njoftim) {
  if (!konfiguro()) return;
  const sql = getSql();
  const abonimet = await sql`SELECT id, endpoint, p256dh, auth FROM abonimet WHERE kodi = ${kodi}`;
  const payload = JSON.stringify({ title: n.titulli, body: n.teksti, url: `/r/${kodi}` });
  await Promise.allSettled(abonimet.map(async (a) => {
    try {
      await webpush.sendNotification(
        { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
        payload,
        { TTL: 60 * 60 * 24, timeout: 5000 },
      );
    } catch (e) {
      // 404/410: telefoni e hoqi lejen ose aplikacionin; abonimi nuk vlen më.
      const kodiHTTP = (e as { statusCode?: number }).statusCode;
      if (kodiHTTP === 404 || kodiHTTP === 410) await sql`DELETE FROM abonimet WHERE id = ${a.id}`;
    }
  }));
}
