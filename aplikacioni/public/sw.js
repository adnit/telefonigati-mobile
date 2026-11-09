// TelefoniGati: ruan vetëm faqen e riparimit të klientit (/r/…), skedarët statikë dhe faqen offline.
// Paneli i servisit, hyrja dhe veprimet nuk ruhen kurrë.
const CACHE = "telefonigati-v2";
const SHELL = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys
      .filter((k) => k.startsWith("telefonigati-") && k !== CACHE)
      .map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Faqja e riparimit: provo serverin; nëse s'ka rrjet, kthe kopjen e fundit të ruajtur.
async function faqjaERiparimit(request) {
  const url = new URL(request.url);
  const key = url.origin + url.pathname; // pa ?m=…, që mesazhi i fundit të mos ruhet si kopje
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      try { await cache.put(key, response.clone()); } catch { /* hapësira plot: faqja shfaqet prapë */ }
    }
    return response;
  } catch {
    return (await cache.match(key)) || (await cache.match("/offline.html"));
  }
}

// Skedarët e Next.js kanë hash në emër, prandaj një kopje e ruajtur mbetet e saktë.
async function statike(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone()).catch(() => {});
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate" && /^\/r\/[0-9a-f]{32}$/.test(url.pathname)) {
    event.respondWith(faqjaERiparimit(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(statike(request));
  } else if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
  }
});

// Njoftimet: servisi ndryshoi statusin ose kërkon miratim.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* tekst i thjeshtë */ }
  const url = typeof data.url === "string" && data.url.startsWith("/r/") ? data.url : "/";
  event.waitUntil(self.registration.showNotification(data.title || "TelefoniGati", {
    body: data.body || "Ka një ndryshim në riparimin tënd.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: url, // një njoftim për riparim: i riu zëvendëson të vjetrin
    renotify: true,
    data: { url },
  }));
});

// Prekja e njoftimit hap (ose sjell përpara) faqen e riparimit.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
    const w = wins.find((c) => c.url.split("?")[0] === url);
    return w ? w.focus() : self.clients.openWindow(url);
  }));
});
