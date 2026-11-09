# TelefoniGati · Java 7 (projekti individual)

## Rasti im
GitHub: adnit
Skenari i zgjedhur: të dhëna të vështira në pranim. Servisi shkruan në banak çfarë i thotë klienti, prandaj emri i pajisjes dhe problemi mund të jenë të gjatë ose të përmbajnë IMEI dhe numra serial pa hapësira.
Riparimet e provës (u shtuan përkohësisht në Neon dhe u fshinë pas provës):
- “Samsung Galaxy Z Fold6 5G Enterprise Edition 512GB Silver Shadow (SM-F956B)”, problem me 180 shkronja, 9999 € dhe kosto shtesë 9999 €
- “LG”, problemi “X”, 0 €
- “iPhone”, problemi “IMEI:356938035643809/SN:F2LXK7QJHG7F/kodi-i-ekranit-0000-1111-2222”, kosto shtesë 1 €
Gjerësitë: 320 px dhe 375 px, plus teksti në 200%.

## Parashikimi
Lista e servisit, faqja e riparimit dhe linku i klientit duhet të mbeten brenda ekranit pa lëvizje anash. Emrat e gjatë mbështillen në disa rreshta, statusi mbetet në një rresht pranë emrit, dhe çmimet 0 € e 9999 € lexohen pa u prerë. Riparimi “LG” me problemin “X” duhet të duket normal.

## Dy probleme
1. Një IMEI ose numër serial pa hapësira e shtyn faqen anash. Hapat: shtova riparimin “iPhone” me problemin “IMEI:356938035643809/SN:F2LXK7QJHG7F/…” dhe hapa /servisi, /servisi/riparimi/[id] dhe /r/[kodi] në 320 px dhe 375 px. Te lista e servisit faqja u bë 108 px më e gjerë se ekrani në 320 px (53 px në 375 px), kështu që të gjitha kartat dalin jashtë ekranit; te detajet dhe te linku i klientit teksti i problemit del 74 px jashtë.
2. Te lista e servisit përshkrimi i gjatë i problemit shfaqet i plotë (4–5 rreshta për kartë), prandaj lista bëhet e gjatë dhe vështirë për t’u kaluar shpejt në banak. Nuk prish asgjë, por i dobëson listën.

## Korrigjimi
Skedari: aplikacioni/src/app/globals.css
Ky skedar mban stilet e të gjitha faqeve. Lista e servisit është grid; një fëmijë i grid-it nuk ngushtohet nën gjatësinë e fjalës më të gjatë, prandaj IMEI-ja pa hapësira e zgjeronte gjithë listën. Ndryshova kolonën e listës në minmax(0, 1fr) dhe shtova overflow-wrap: anywhere te titujt, teksti i problemit dhe vlerat e detajeve. anywhere e thyen një fjalë vetëm kur nuk ka hapësirë tjetër, kështu që tekstet normale mbeten njësoj.

## Versionet
Para: https://github.com/adnit/telefonigati-mobile/commit/1e28f7bd78e03f698892741d488fbd4f7ddb8b66
Pas: https://github.com/adnit/telefonigati-mobile/commit/9b75a068b068f9fce74d77780e6209e6adb57c4d

## Provat që bëra
### Prova 1
Hapat: Me tri riparimet e provës hapa /servisi, pastaj faqen e riparimit të Samsung-ut të gjatë dhe linkun e tij të klientit, në 320 px dhe 375 px.
Pritshmëria: Asnjë faqe nuk lëviz anash; emri i gjatë mbështillet, statusi mbetet në një rresht, 0 € dhe 9999 € lexohen.
Vëzhgimi: Para korrigjimit lista lëvizte anash (108 px në 320 px). Pas korrigjimit asnjë nga gjashtë faqet nuk lëviz anash në 320 ose 375 px; emri i Samsung-ut mbështillet në katër rreshta, “Gati për marrje” mbetet pranë tij dhe 9999 € lexohet i plotë.

### Prova 2
Hapat: Hapa riparimin “iPhone” me IMEI-në te /servisi/riparimi/[id] dhe /r/[kodi] në 320 px.
Pritshmëria: IMEI-ja thyhet brenda ekranit dhe nuk shtyn faqen anash.
Vëzhgimi: Para: teksti dilte 74 px jashtë ekranit. Pas: IMEI-ja ndahet në dy rreshta (“…SN:F2LXK7Q / JHG7F/kodi-i-ekranit…”) dhe faqja ka gjerësinë e ekranit. Korrigjimi punoi.

### Prova 3
Hapat: Hyrje tjetër: e rrita madhësinë e tekstit në 200% te linku i klientit të Samsung-ut, në 375 px.
Pritshmëria: Parashikim: tekstet më të mëdha mbështillen më shumë, por faqja mbetet pa lëvizje anash.
Vëzhgimi: Faqja mbeti pa lëvizje anash (0 px). Doli si u parashikua, sepse thyerja tani varet nga hapësira e lirë dhe jo nga një gjerësi fikse.

## Ndryshimi i ri
Nuk e kam demonstruar ende me kolegun. Problemin e dytë (karta të gjata në listë) nuk e korrigjova në këtë javë; e kam shënuar për më vonë. Përgatitem ta shpjegoj pse lista dilte anash dhe çfarë bën minmax(0, 1fr).

## Ndihma nga AI
AI (Claude) zgjodhi të dhënat e vështira, gjeti dy problemet me një shfletues automatik, bëri korrigjimin dhe i ekzekutoi tri provat; riparimet e provës u fshinë nga Neon pas provës. Unë e kontrollova raportin.
