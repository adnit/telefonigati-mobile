# TelefoniGati — Java 9 · Gjendja dhe pamja gjatë pritjes (projekti individual)

## Çfarë ndërtova
Në TelefoniGati veprimet e rëndësishme janë të stafit (regjistrimi, statusi, kostoja shtesë, mbyllja) dhe vendimi i klientit (Mirato / Refuzo). Për të gjitha shtova një buton dërgimi të përbashkët (src/components/Dergo.tsx, me useFormStatus): gjatë pritjes së serverit butoni çaktivizohet, tregon një rreth që rrotullohet dhe tekstin e veprimit (“Po regjistrohet…”, “Po ruhet…”, “Po mbyllet…”). Te butonat e statusit vetëm butoni i shtypur tregon pritjen.

Ndryshimi nga RideShare: këtu nuk e tregoj suksesin para përgjigjes. Statusi i ri, vendimi i klientit dhe mbyllja shfaqen vetëm pasi serveri i ruan dhe faqja rilexohet, sepse për klientin një status “Gati” i rremë do të thoshte të shkojë në servis kot. Pamja e pritjes tregon që veprimi u mor; rezultati vjen nga serveri.

Mbrojtja nga dyfishimi nuk varet nga butoni: vendimi ruhet vetëm kur është ende “pritje” (UPDATE … WHERE vendimi = 'pritje'), statusi njofton vetëm kur ndryshon vërtet, dhe mbyllja pranohet vetëm nga “Gati për marrje”.

## Provat që bëra
### Prova 1: Ruajtja e suksesshme mbetet pas rifreskimit.
Regjistrova një riparim me numër telefoni: butoni shfaqi “Po regjistrohet…” dhe pas përgjigjes u hap faqja e riparimit. Ndryshova statusin në “Në riparim”; pas rifreskimit statusi dhe koha e hapit (p.sh. 21.11 · 02:32) mbetën, sepse lexohen nga databaza.

### Prova 2: Gabimi i serverit nuk lë një sukses të rremë në ekran.
Dërgova një numër telefoni të pavlefshëm (“12ab”): serveri e refuzoi, riparimi nuk u krijua dhe u shfaq “Numri i telefonit nuk duket i saktë…”. Me një kosto shtesë që pret klientin, butoni i mbylljes nuk shfaqet dhe faqja thotë “Mbyllja pret vendimin e klientit”.

### Prova 3: Klikimet e përsëritura nuk krijojnë kopje.
Klienti miratoi koston shtesë; nga një faqe e hapur më herët klikova “Refuzo”: serveri ktheu “Për këtë kosto është vendosur tashmë.” dhe në databazë mbeti “miratuar”. Gjatë pritjes butonat janë të çaktivizuar, por kopjen e ndalon kushti në server.

## Ku gjendet puna
- src/components/Dergo.tsx (butoni me pritje), i përdorur te src/app/servisi/i-ri/page.tsx, src/app/servisi/riparimi/[id]/page.tsx dhe src/app/r/[kodi]/page.tsx
- Rregullat në server: src/app/servisi/actions.ts dhe src/app/r/[kodi]/actions.ts
- Repository: https://github.com/adnit/telefonigati-mobile

## Çfarë mbetet për përmirësim
Pa internet veprimet e stafit dështojnë me faqen e gabimit të shfletuesit; një mesazh i veçantë për stafin do të ishte më i qartë.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) shkroi butonin me pritje dhe rregullat në server, dhe i ekzekutoi provat në një shfletues automatik me një sesion stafi prove; riparimet e provës u fshinë. Unë e kontrollova raportin.
