# TelefoniGati

Aplikacion mobil (Next.js PWA) për një servis lokal telefonash. Servisi regjistron riparimin në banak (me foto të telefonit), ndryshon statusin dhe shton koston shtesë; klienti merr një link privat, e sheh statusin edhe pa internet dhe e miraton ose e refuzon koston shtesë pa telefonuar.

Projekti individual në lëndën Programimi për Pajisje Mobile, Kolegji AAB, 2026/2027.

- [prd.md](prd.md) — problemi, biseda me pronarin, rrjedha dhe kriteret e pranimit
- [scope-contract.md](scope-contract.md) — tri veçoritë e MVP-së dhe çfarë mbetet jashtë
- Raportet javore: [java-02.md](java-02.md), [java-03.md](java-03.md), [java-04.md](java-04.md), [java-05.md](java-05.md), [java-06.md](java-06.md), [java-07.md](java-07.md), [java-08.md](java-08.md)
- `aplikacioni/` — kodi Next.js

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

Databaza: ekzekuto me radhë `schema.sql`, `schema-java05.sql`, `schema-java05b.sql`, `schema-java08.sql`, `schema-mbyllja.sql` dhe `schema-njoftimet.sql` në Neon SQL Editor. Pas hyrjes së parë me Google, pronari e bën llogarinë staf:

```sql
UPDATE profilet SET roli = 'servis' WHERE email = 'emaili.i.stafit@gmail.com';
```

Çelësat VAPID krijohen një herë me `npx web-push generate-vapid-keys`. Në Vercel shtohen te Environment Variables bashkë me të tjerët.
