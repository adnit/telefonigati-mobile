# TelefoniGati — Java 6 · PWA dhe puna offline (projekti individual)

## Çfarë ndërtova
- **Manifesti** (src/app/manifest.ts) me emrin TelefoniGati, pamjen standalone dhe dy ikonat (public/icons/icon-192.png, icon-512.png), që klienti ta shtojë në ekranin e telefonit.
- **Service worker** (public/sw.js), i regjistruar nga src/components/Pwa.tsx vetëm në versionin e publikuar. Ruan në cache telefonigati-v1 vetëm: faqen e riparimit të klientit /r/[kodi] (provon fillimisht serverin dhe ruan përgjigjen e mirë), skedarët statikë të Next.js dhe faqen offline.html. Paneli i servisit, hyrja dhe veprimet nuk ruhen.
- **Pa internet** faqja e klientit hapet nga kopja e fundit dhe shfaq “Pa internet · po sheh kopjen e ruajtur (koha e përditësimit). Statusi mund të ketë ndryshuar.” Butonat “Mirato/Refuzo” çaktivizohen (src/components/Rrjeti.tsx), sepse vendimi kërkon serverin.
- Nëse linku nuk është hapur ndonjëherë me internet në atë telefon, shfaqet offline.html me shpjegimin.

Zgjodha faqen e klientit sepse pronari tha se thirrjet “a u bë gati?” krijojnë presion: klienti duhet ta shohë statusin e fundit edhe me rrjet të dobët.

## Provat që bëra
### Prova 1: Manifesti dhe vizita online
/manifest.webmanifest kthen “TelefoniGati” me ikonat 192×192 dhe 512×512. Pas hapjes së /r/[kodi] me internet, worker-i u aktivizua dhe cache telefonigati-v1 përmbante /offline.html, dy ikonat, faqen e riparimit dhe 10 skedarë statikë; asnjë faqe e /servisi ose /api.

### Prova 2: Pa internet dhe pas rifreskimit
Ndala serverin dhe e vendosa shfletuesin offline, pastaj ndryshova statusin e riparimit nr. 2 në databazë në “Gati për marrje”. Pas rifreskimit faqja u hap nga kopja: statusi i vjetër “Në riparim”, paralajmërimi “Pa internet…” me kohën e kopjes dhe butoni “Mirato” i çaktivizuar.

### Prova 3: Lidhja rikthehet
Nisa sërish serverin dhe rifreskova: u shfaq statusi i ri “Gati për marrje”, paralajmërimi u zhduk dhe butonat u aktivizuan. Pastaj e riktheva statusin në “Në riparim”. Në një shfletues pa kopje, linku offline hapi faqen “Pa internet” me shpjegimin.

## Ku gjendet puna
- Repository: https://github.com/adnit/telefonigati-mobile
- src/app/manifest.ts, public/sw.js, public/offline.html, public/icons/, src/components/Pwa.tsx, src/components/Rrjeti.tsx
- Ndryshuar: src/app/layout.tsx, src/app/r/[kodi]/page.tsx

## Çfarë mbetet për përmirësim
Kopja ruhet vetëm pasi linku hapet një herë me internet, dhe shfletuesi mund ta fshijë. Offline vetëm lexohet; vendimi për koston shtesë pret lidhjen. Klienti nuk njoftohet vetë kur ndryshon statusi.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) shkroi manifestin, service worker-in dhe pjesët offline, krijoi ikonat dhe i ekzekutoi provat në një shfletues automatik. Për provën offline, Playwright nuk e ndal rrjetin e service worker-it, prandaj serveri u ndal vërtet gjatë provës. Në telefon real nuk e kam provuar ende.
