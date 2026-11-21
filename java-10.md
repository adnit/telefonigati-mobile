# TelefoniGati — Java 10 · Dy ekrane, një gjendje (projekti individual)

## Çfarë ndërtova
Stafi dhe klienti shohin të njëjtën gjendje pa Refresh manual. Faqja e klientit (/r/[kodi]), faqja e riparimit të stafit dhe lista e servisit pyesin serverin çdo 5 sekonda për një “version” (koha e ndryshimit të fundit): /api/r/[kodi]/versioni dhe /api/servisi/versioni. Kur versioni ndryshon, faqja rilexohet nga serveri (src/components/Live.tsx). Përgjigjja e versionit është vetëm një numër, pa të dhëna të riparimit, dhe lista e servisit kërkon rolin e stafit. Leximi ndalet kur faqja është në sfond ose pa internet.

Ndryshimi ndaj javës 9: atje rezultati shfaqej pas veprimit në të njëjtin ekran; tani ndryshimi i stafit arrin te telefoni i klientit dhe vendimi i klientit te stafi, në dy sesione të ndryshme. Klienti mund të marrë edhe njoftim në telefon kur riparimi është gati ose kërkon miratim (Web Push).

## Përgatitja e provës
Riparime prove (“PROVË …”) të regjistruara me një sesion stafi prove; klienti në një kontekst tjetër shfletuesi me linkun e riparimit. Pas provave riparimet dhe profili i provës u fshinë.

## Provat që bëra
### Prova 1: Rasti 1 · Ndryshimi i stafit mbërrin te klienti
- Hapat: klienti hapi linkun me statusin “Pranuar”; stafi e kaloi në “Në riparim”.
- Çfarë prisja: klienti e sheh statusin e ri pa rifreskuar.
- Çfarë pa realisht: statusi i klientit u bë “Në riparim” pas 4.7 sekondash; pas kostos shtesë, butonat “Mirato/Refuzo” u shfaqën pas 3.3 sekondash.
- Ku e verifikova ruajtjen: tabela riparimet (statusi, perditesuar) dhe historiku.

### Prova 2: Rasti 2 · Vendimi i klientit mbërrin te stafi
- Hapat: klienti klikoi “Mirato”.
- Çfarë pashë realisht: faqja e riparimit të stafit tregoi “Klienti e miratoi” pas 0.9 sekondash dhe lista e servisit hoqi shenjën “Pret klientin”. Mbyllja u lejua vetëm pas vendimit.

### Prova 3: Rasti 3 · Pa internet dhe rilidhja
- Hapat: hapa linkun e klientit me internet, pastaj e ndala serverin dhe e vendosa shfletuesin offline.
- Pamja gjatë ndërprerjes: kopja e ruajtur me “Pa internet · po sheh kopjen e ruajtur …” dhe butonat e vendimit të çaktivizuar.
- Pas rilidhjes: statusi i ri që stafi kishte ruajtur ndërkohë u shfaq dhe paralajmërimi u hoq.

## Ku gjendet puna
- src/components/Live.tsx, src/app/api/r/[kodi]/versioni/route.ts, src/app/api/servisi/versioni/route.ts
- src/lib/riparimet.ts (versioniIRiparimit, versioniIListes), src/components/Rrjeti.tsx
- Njoftimet: src/components/Njoftimet.tsx, src/lib/njoftimet.ts, public/sw.js

## Prova me kolegun
Nuk e kam bërë ende me kolegun ose me pronarin; do ta provoj me dy telefona në klasë.

## Çfarë mbetet për përmirësim
Neon nuk dërgon vetë ndryshimet, prandaj përditësimi arrin me vonesë deri në 5 sekonda. Njoftimet në telefon real nuk i kam provuar ende; shfletuesi automatik nuk mund të abonohet në shërbimin e njoftimeve.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) shkroi leximin periodik, rrugët e versionit dhe njoftimet, dhe i ekzekutoi provat në shfletues automatik me sesione prove; të dhënat e provës u fshinë. Unë e kontrollova raportin.
