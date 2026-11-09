# TelefoniGati — Java 8 · Device APIs (projekti individual)

## Çfarë ndërtova
Në vend të vendndodhjes (si te RideShare), për servisin zgjodha **kamerën**: kur klienti e lë telefonin, stafi bën një foto të gjendjes së tij (ekrani, cepat, gërvishtjet). Fotoja i shfaqet edhe klientit te linku i tij. Kjo ul mosmarrëveshjet “a ishte i gërvishtur më parë?”.

- src/components/FotoPranimi.tsx: butoni “Bëj foto” përdor `<input type="file" accept="image/*" capture="environment">`, që në telefon hap kamerën e pasme dhe në kompjuter zgjedhjen e skedarit. Kamera hapet vetëm pas prekjes; faqja nuk kërkon leje në hapje.
- Fotoja zvogëlohet në telefon (deri 1024 px, JPEG 70%) para dërgimit. Ri-kodimi në canvas heq edhe të dhënat EXIF, përfshirë vendndodhjen që mund të ketë fotoja.
- Fotoja është opsionale: një skedar që nuk lexohet shfaq mesazh dhe regjistrimi vazhdon pa foto.
- Serveri pranon vetëm JPEG brenda kufirit; databaza ka të njëjtin kufi (aplikacioni/schema-java08.sql). Fotoja shfaqet te faqja e stafit dhe te faqja e klientit me shënimin “Gjendja e telefonit kur u la në servis”.

## Provat që bëra
### Prova 1: Kamera hapet vetëm pas prekjes
Faqja /servisi/i-ri hapet pa kërkuar leje. Fusha ka capture="environment" dhe accept="image/*". Zgjodha një foto prove 4000×3000 (170 KB): pamja paraprake u shfaq në 1024×768.

### Prova 2: Gabimi nuk e bllokon regjistrimin
Zgjodha një skedar që nuk është foto: u shfaq “Fotoja nuk u lexua. Provo një tjetër ose vazhdo pa foto.” Regjistrova edhe një riparim pa foto dhe u ruajt normalisht, pa imazh në faqe.

### Prova 3: Ruajtja dhe privatësia
Riparimi me foto u ruajt si JPEG prej rreth 21 KB (nga 170 KB). Fotoja u shfaq te faqja e stafit dhe te linku i klientit. Fotoja nuk ka EXIF pas zvogëlimit, dhe në GitHub nuk ka asnjë foto reale: provat përdorën një imazh të gjeneruar dhe riparimet e provës u fshinë.

## Ku gjendet puna
- Repository: https://github.com/adnit/telefonigati-mobile
- src/components/FotoPranimi.tsx, aplikacioni/schema-java08.sql
- Ndryshuar: src/app/servisi/i-ri/page.tsx, src/app/servisi/actions.ts, src/lib/riparimet.ts, src/app/servisi/riparimi/[id]/page.tsx, src/app/r/[kodi]/page.tsx

## Çfarë mbetet për përmirësim
Fotoja ruhet si tekst në Neon; për shumë foto do të ishte më mirë një shërbim skedarësh. Vetëm një foto për riparim, dhe vetëm në pranim. Kamerën reale të telefonit nuk e kam provuar ende; në kompjuter u provua me skedar.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) propozoi kamerën në vend të vendndodhjes për këtë biznes, shkroi komponentin dhe ndryshimet në server dhe databazë, dhe i ekzekutoi provat në një shfletues automatik me foto të gjeneruar. Duhet ta provoj vetë në telefon me kamerën e vërtetë.
