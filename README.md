# TelefoniGati

Aplikacion mobil (Next.js PWA) për një servis lokal telefonash. Servisi regjistron riparimin në banak (me foto të telefonit), ndryshon statusin dhe shton koston shtesë; klienti merr një link privat, e sheh statusin edhe pa internet dhe e miraton ose e refuzon koston shtesë pa telefonuar.

Projekti individual në lëndën Programimi për Pajisje Mobile, Kolegji AAB, 2026/2027.

- [prd.md](prd.md) — problemi, biseda me pronarin, rrjedha dhe kriteret e pranimit
- [scope-contract.md](scope-contract.md) — tri veçoritë e MVP-së dhe çfarë mbetet jashtë
- Raportet javore: [java-02.md](java-02.md), [java-03.md](java-03.md), [java-04.md](java-04.md), [java-05.md](java-05.md), [java-06.md](java-06.md), [java-07.md](java-07.md), [java-08.md](java-08.md), [java-09.md](java-09.md), [java-10.md](java-10.md)
- `aplikacioni/` — kodi Next.js

## Çfarë bën

- **Servisi** (hyrje me Google): regjistron riparimin në banak me foto, numrin e klientit dhe datën e pritur; i jep klientit fletën me QR ose linkun në WhatsApp; ndryshon statusin nga një fletë që ngjitet nga poshtë (me “Zhbëj”), shton koston shtesë dhe shënime të brendshme, dhe e mbyll riparimin kur klienti e merr telefonin. Lista ka kërkim dhe filtra; “Përmbledhja” tregon javën e fundit.
- **Pronari** menaxhon stafin me ftesa me email dhe të dhënat e servisit (emri, telefoni, orari, adresa) te “Cilësimet”.
- **Klienti** (pa llogari, me link privat ose QR): sheh statusin me kohën e secilit hap dhe datën e pritur, fotot e pranimit dhe shumën; miraton ose refuzon koston shtesë; merr njoftim kur telefoni është gati; telefonon servisin ose i shkruan në WhatsApp; e sheh statusin e fundit edhe pa internet.
- **Siguria**: rolet kontrollohen në server, linku i klientit është kod i rastësishëm 32-shifror dhe skadon 30 ditë pas marrjes, numri i klientit dhe shënimet nuk i shfaqen kurrë klientit, faqet nuk indeksohen dhe linku nuk dërgohet si Referer.

## Nisja

```
cd aplikacioni
npm install
npm run dev
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

Databaza: ekzekuto me radhë `schema.sql`, `schema-java05.sql`, `schema-java05b.sql`, `schema-java08.sql`, `schema-mbyllja.sql`, `schema-njoftimet.sql`, `schema-perfundimi.sql` dhe `schema-v2.sql` në Neon SQL Editor. Pas hyrjes së parë me Google, bëje llogarinë tënde pronar; stafin tjetër e fton pastaj nga “Cilësimet”:

```sql
UPDATE profilet SET roli = 'pronar' WHERE email = 'emaili.yt@gmail.com';
```

Çelësat VAPID krijohen një herë me `npx web-push generate-vapid-keys`. Në Vercel shtohen te Environment Variables bashkë me të tjerët.
