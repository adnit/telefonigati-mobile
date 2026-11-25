# TelefoniGati

Aplikacion mobil (Next.js PWA) për një servis lokal telefonash. Servisi regjistron riparimin në banak (me foto të telefonit), ndryshon statusin dhe shton koston shtesë; klienti merr një link privat, e sheh statusin edhe pa internet dhe e miraton ose e refuzon koston shtesë pa telefonuar.

Projekti individual në lëndën Programimi për Pajisje Mobile, Kolegji AAB, 2026/2027.

- [prd.md](prd.md) — problemi, biseda me pronarin, rrjedha dhe kriteret e pranimit
- [scope-contract.md](scope-contract.md) — tri veçoritë e MVP-së dhe çfarë mbetet jashtë
- [lighthouse.md](lighthouse.md) — auditimi i performancës dhe aksesueshmërisë, para dhe pas
- Raportet javore: [java-02.md](java-02.md), [java-03.md](java-03.md), [java-04.md](java-04.md), [java-05.md](java-05.md), [java-06.md](java-06.md), [java-07.md](java-07.md), [java-08.md](java-08.md), [java-09.md](java-09.md), [java-10.md](java-10.md)
- `aplikacioni/` — kodi Next.js

## Çfarë bën

Pamja ndjek temën e telefonit (e çelët ose e errët, me zgjedhje me dorë), me stil "Liquid Glass": shirit i poshtëm xhami që noton, butona të rrumbullakët xhami, fletë që ngjiten nga poshtë dhe mbyllen duke i tërhequr.

- **Servisi** (hyrje me Google): regjistron riparimin në banak me foto, IMEI (i skanuar me kamerë ose i shkruar, me kontrollin Luhn), numrin e klientit dhe datën e pritur; i jep klientit fletën me QR ose linkun në WhatsApp; ndryshon statusin nga një fletë që ngjitet nga poshtë (me “Zhbëj”), shton koston shtesë dhe shënime të brendshme, dhe e mbyll riparimin kur klienti e merr telefonin. Lista ka kërkim dhe filtra; “Përmbledhja” tregon javën e fundit dhe hipotezën e projektit: sa klientë thonë se linku u kurseu një telefonatë (pragu 80%). Çdo riparim ka regjistrin e veprimeve: kush ndryshoi çfarë dhe kur.
- **Pranimi në banak**: marka dhe modeli zgjidhen me një prekje; shabllonet nga çmimorja plotësojnë problemin, çmimin dhe datën e pritur. Çmimi i shkruar me dorë nuk mbishkruhet.
- **Tabela** (kanban): riparimet në tri kolona; karta tërhiqet te kolona tjetër ose kalon me →.
- **Marrja**: klienti nënshkruan në ekranin e stafit; nënshkrimi ruhet me riparimin dhe e sheh edhe klienti.
- **Pronari** menaxhon çmimoren, me ftesa me email dhe të dhënat e servisit (emri, telefoni, orari, adresa) te “Cilësimet”.
- **Klienti** (pa llogari, me link privat ose QR): kur statusi ndryshon me faqen të hapur, karta animohet dhe nga lart zbret njoftimi “Telefoni yt është gati!”; sheh statusin me kohën e secilit hap dhe datën e pritur, fotot e pranimit dhe shumën; miraton ose refuzon koston shtesë; merr njoftim kur telefoni është gati; telefonon servisin ose i shkruan në WhatsApp; e sheh statusin e fundit edhe pa internet. Pas marrjes përgjigjet me një prekje: “A të kurseu ky link një telefonatë?”
- **Llogaria e klientit (opsionale)**: klienti hyn me Google dhe ruan riparimet te “Riparimet e mia”, në çdo pajisje; i heq nga lista ose e fshin llogarinë kur të dojë. Pa llogari, linku punon njësoj.
- **Siguria**: rolet kontrollohen në server, linku i klientit është kod i rastësishëm 32-shifror dhe skadon 30 ditë pas marrjes, numri i klientit dhe shënimet nuk i shfaqen kurrë klientit, faqet nuk indeksohen dhe linku nuk dërgohet si Referer. Kodet e gabuara bllokohen pas 20 provave në 10 minuta për çdo IP (ruhet vetëm hash-i), dhe Content-Security-Policy lejon skripte e lidhje vetëm nga vetë aplikacioni.

## Nisja

```
cd aplikacioni
npm install
npm run dev
```

## Testet

```
npm test            # rregullat e validimit (telefoni, çmimi, data, IMEI); pa databazë, ~2 s
npm run test:e2e    # Playwright në telefon të simuluar: rrjedha e plotë, lejet dhe siguria
```

Testet end-to-end përdorin databazën nga `.env.local`, krijojnë riparime me emrin `E2E …` dhe i fshijnë në fund. Hyrja simulohet me një sesion të nënshkruar me `NEXTAUTH_SECRET`, pa Google. Në GitHub Actions testet e rregullave ekzekutohen në çdo push; ato end-to-end ekzekutohen kur shtohet sekreti `TEST_DATABASE_URL` (një degë e veçantë Neon).

## Demonstrimi

```
npm run demo                                         # riparim i ri realist + linku dhe QR në terminal
npm run demo -- https://telefonigati-mobile.vercel.app   # linku me adresën e publikuar
npm run demo:pastro                                  # fshin vetëm riparimet e demonstrimit
```

## Konfigurimi

`aplikacioni/.env.local` (nuk ngarkohet në GitHub):

```
DATABASE_URL="lidhja e Neon për databazën telefonigati"
GOOGLE_CLIENT_ID="Client ID nga Google Cloud"
GOOGLE_CLIENT_SECRET="Client secret nga Google Cloud"
VAPID_PUBLIC_KEY="çelësi publik për njoftimet"
VAPID_PRIVATE_KEY="çelësi privat për njoftimet"
VAPID_SUBJECT="mailto:emaili.yt@gmail.com"
NEXTAUTH_SECRET="vlerë e rastësishme"
NEXTAUTH_URL="http://localhost:3000"
```

Databaza: çdo skedar SQL ekzekutohet në një transaksion me `npm run db:migrate -- <skedari.sql>`. Ekzekuto me radhë `schema.sql`, `schema-java05.sql`, `schema-java05b.sql`, `schema-java08.sql`, `schema-mbyllja.sql`, `schema-njoftimet.sql`, `schema-perfundimi.sql`, `schema-v2.sql`, `schema-v3.sql`, `schema-v4.sql` dhe `schema-v5.sql` (ose ngjiti në Neon SQL Editor). Pas hyrjes së parë me Google, bëje llogarinë tënde pronar; stafin tjetër e fton pastaj nga “Cilësimet”:

```sql
UPDATE profilet SET roli = 'pronar' WHERE email = 'emaili.yt@gmail.com';
```

Çelësat VAPID krijohen një herë me `npx web-push generate-vapid-keys`. Në Vercel shtohen te Environment Variables bashkë me të tjerët.
