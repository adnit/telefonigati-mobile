# TelefoniGati — Java 5 · Hyrja dhe lejet (projekti individual)

## Çfarë ndërtova
Ndava aplikacionin në dy pjesë, sipas asaj që tha pronari: shumica e klientëve vijnë vetë në servis.

- **Servisi** hyn me Google (NextAuth, src/lib/auth.ts). Zgjodha Google në vend të GitHub, sepse stafi i servisit ka llogari Google, jo GitHub. Roli ruhet në tabelën profilet: çdo hyrje e re është “vizitor” dhe vetëm pronari e bën “servis” në Neon SQL Editor. Stafi sheh të gjitha riparimet (/servisi), regjistron riparim në banak (/servisi/i-ri), ndryshon statusin dhe shton koston shtesë (/servisi/riparimi/[id]).
- **Klienti** nuk ka llogari. Kur regjistrohet riparimi, krijohet një kod i rastësishëm 32-shifror; klienti merr linkun /r/[kodi] (butoni “Dërgo linkun klientit” përdor ndarjen e telefonit ose kopjimin). Me atë link sheh vetëm riparimin e vet dhe e miraton ose e refuzon koston shtesë.
- **Kontrolli në server:** çdo veprim i stafit thërret vetemServisi() (src/lib/servisi.ts) para se të shkruajë në databazë. Vendimi i klientit ruhet vetëm kur kodi përputhet dhe vendimi është ende “pritje” (UPDATE … WHERE kodi = … AND vendimi = 'pritje'), prandaj klikimi i dytë nuk e ndryshon.
- Lista publike e të gjitha riparimeve te faqja kryesore u hoq: tani faqja kryesore pranon vetëm linkun ose kodin e klientit.

Ndryshimet në databazë janë te aplikacioni/schema-java05.sql (profilet, kodi, vendimi, perditesuar dhe numrat e rinj të riparimeve).

## Provat që bëra
### Prova 1: Pa hyrje dhe me hyrje
Pa hyrje, /servisi tregon vetëm “Hyr me Google” dhe /servisi/i-ri të kthen te /servisi. Me sesion stafi lista shfaq tri riparimet; regjistrova “PROVË Huawei P30” (25 €), u hap faqja e riparimit nr. 100 me mesazhin “Riparimi u regjistrua” dhe me linkun e klientit.

### Prova 2: Klienti vendos një herë
Stafi e kaloi statusin në “Në riparim” dhe dërgoi koston shtesë +10 €. Te linku i klientit u shfaqën statusi, arsyeja, +10 € dhe totali 35 €; klikova “Mirato” dhe u shfaq “Faleminderit…”, ndërsa stafi pa “Klienti e miratoi”. Nga një faqe e hapur më herët klikova “Refuzo”: u shfaq “Për këtë kosto është vendosur tashmë.” dhe në databazë mbeti “miratuar”.

### Prova 3: Leja kontrollohet në server
Me faqen e stafit të hapur, ia hoqa rolin “servis” profilit në databazë dhe klikova “Gati për marrje”: statusi mbeti “Në riparim” dhe faqja të kthen te /servisi me “Llogaria jote nuk është ende e stafit”. Një kod i gabuar (/r/000…0 ose /r/abc) shfaq “Riparimi nuk u gjet”.

## Ku gjendet puna
- Repository: https://github.com/adnit/telefonigati-mobile
- aplikacioni/schema-java05.sql
- aplikacioni/schema-java05b.sql (kalimi nga GitHub te Google)
- Hyrja dhe roli: src/lib/auth.ts, src/lib/servisi.ts, src/app/api/auth/[...nextauth]/route.ts, src/components/Hyrja.tsx
- Servisi: src/app/servisi/page.tsx, src/app/servisi/i-ri/page.tsx, src/app/servisi/riparimi/[id]/page.tsx, src/app/servisi/actions.ts
- Klienti: src/app/page.tsx, src/app/r/[kodi]/page.tsx, src/app/r/[kodi]/actions.ts, src/components/LinkuKlientit.tsx

## Çfarë mbetet për përmirësim
Pronari ende nuk e ka provuar në telefonin e vet: këtë e bëj kur të krijoj klientin OAuth në Google Cloud dhe t'ia aktivizoj rolin sipas email-it. Kush e ka linkun e sheh riparimin, prandaj linku duhet dërguar vetëm te klienti. Klienti ende nuk njoftohet kur ndryshon statusi.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) projektoi ndarjen servis/klient, shkroi kodin dhe ndryshimet në databazë, dhe i ekzekutoi provat në një shfletues automatik me një sesion stafi prove (i krijuar me NEXTAUTH_SECRET) dhe me riparime prove që u fshinë në fund. Hyrjen reale me Google nuk e provova ende, sepse klienti OAuth në Google Cloud nuk është krijuar.
