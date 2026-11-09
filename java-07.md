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
Skedari: [PLOTËSO]
[PLOTËSO] Çfarë bën ky skedar, çfarë ndryshove dhe pse?

## Versionet
Para: [PLOTËSO]
Pas: [PLOTËSO]

## Provat që bëra
### Prova 1
Hapat: [PLOTËSO]
Pritshmëria: [PLOTËSO]
Vëzhgimi: [PLOTËSO]

### Prova 2
Hapat: [PLOTËSO]
Pritshmëria: [PLOTËSO]
Vëzhgimi: [PLOTËSO]

### Prova 3
Hapat: [PLOTËSO]
Pritshmëria: [PLOTËSO]
Vëzhgimi: [PLOTËSO]

## Ndryshimi i ri
[PLOTËSO]

## Ndihma nga AI
[PLOTËSO]
