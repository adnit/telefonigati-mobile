# TelefoniGati — Java 4 · Neon dhe PostgreSQL (projekti individual)

## Çfarë ndërtova
Lista dhe detajet e riparimeve nuk përdorin më të dhëna të shkruara në kod. Faqet thërrasin lexoRiparimet dhe gjejRiparimin te src/lib/riparimet.ts, të cilat lexojnë tabelën riparimet në databazën telefonigati në Neon. Lidhja hapet te src/lib/db.ts me DATABASE_URL, që lexohet vetëm në server. Lista renditet sipas datës së dorëzimit, më i riu i pari.

Tabela ka tri rregulla që i zbaton vetë databaza: statusi lejohet vetëm Pranuar, Në riparim ose Gati për marrje; çmimet nuk mund të jenë negative; arsyeja dhe çmimi i kostos shtesë plotësohen të dyja bashkë ose mbeten të dyja bosh.

## Provat që bëra
### Prova 1: Ndryshimi në databazë shfaqet në aplikacion
Në SQL Editor ndryshova statusin e ID 2 (Samsung) nga “Në riparim” në “Gati për marrje”. Pas rifreskimit, karta në listë dhe detajet e /riparimi/2 treguan “Gati për marrje”, pa ndryshuar kodin.
Pastaj provova një status të palejuar: UPDATE ... SET statusi = 'Gati'. Neon e refuzoi me gabim check constraint dhe aplikacioni nuk ndryshoi. E ktheva statusin në “Në riparim” dhe të dyja faqet e treguan sërish.

### Prova 2: Lista bosh dhe rikthimi
Shtova përkohësisht WHERE false te pyetja e lexoRiparimet dhe nisa serverin. Lista shfaqi “Nuk ke riparime në servis për momentin.”, pa karta dhe pa mesazh gabimi; asnjë rresht nuk u fshi. E hoqa WHERE false dhe u kthyen tri kartat.

### Prova 3: Lidhja mungon, rikthimi dhe siguria
Nisa serverin me DATABASE_URL bosh. Lista dhe /riparimi/2 shfaqën “Nuk u lidhëm me databazën. Provo përsëri.” Me DATABASE_URL nga .env.local u kthyen tri kartat. Skedari .env.local nuk shfaqet te ndryshimet e git-it, sepse .gitignore ka rreshtin .env*.

## Ku gjendet puna
- Tabela dhe tri rreshtat: aplikacioni/schema.sql
- Skedar i ri: aplikacioni/src/lib/db.ts
- Skedarë të ndryshuar: src/lib/riparimet.ts, src/app/page.tsx, src/app/riparimi/[id]/page.tsx dhe src/app/riparimi/[id]/miratimi/page.tsx
- Paketa të reja në package.json: @neondatabase/serverless dhe server-only
- Repository: https://github.com/adnit/telefonigati-mobile

## Çfarë mbetet për përmirësim
Aplikacioni vetëm lexon: riparimet dhe statusi ndryshohen nga SQL Editor, jo nga servisi në aplikacion. Miratimi i kostos shtesë mbetet simulim. Hapi i ardhshëm është hyrja me role: vetëm servisi ndryshon statusin, ndërsa klienti sheh vetëm riparimin e vet dhe miraton vetëm koston e tij.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) më ndihmoi të testoj aplikacionin dhe shkrimin e këtij dokumenti.
