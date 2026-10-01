# PRD (Product Requirements Document) — TelefoniGati
**Kursi:** Programimi për Pajisje Mobile (2026/2027) • **Kolegji AAB**
**Studenti:** Adnit Kamberi
**Versioni:** 1.0 (draft për MVP)

**Shkurtesat:** PRD (Product Requirements Document – dokumenti i kërkesave të produktit); MVP (Minimum Viable Product – produkti minimal i përdorshëm); PWA (Progressive Web App – aplikacion web progresiv); RLS (Row Level Security – siguri në nivel rreshti).

## 1. Përdoruesi dhe problemi
- **Kush e përjeton?** Pronari i një servisi lokal telefonash dhe klientët e tij. Emri i servisit nuk publikohet me kërkesë të pronarit.
- **Kur ndodh?** Gjatë ditëve kur telefoni është në servis: klienti nuk e di a është gati, pronari ndërpritet nga thirrjet.
- **Si e zgjidhin sot?** Riparimet shënohen në fletore. Klienti merr një çmim të vlerësuar në banak dhe pastaj telefonon për të pyetur.

## 2. Evidenca (biseda me pronarin)
Një bisedë me pronarin e servisit. Përgjigjet janë të përmbledhura, jo fjalë për fjalë.

| Pyetja | Përgjigjja |
| :--- | :--- |
| Si ju kontaktojnë klientët? | Me telefon ose vijnë vetë; shumica vijnë vetë. |
| Si i mbani shënim riparimet? | Në fletore. |
| Si e merr vesh klienti çmimin? | Në fillim i jap një vlerësim. Nëse gjatë punës dalin probleme të tjera, e telefonoj para se ta bëj riparimin. |
| A ju thërrasin për të pyetur “a u bë gati”? | Disa po, disa jo. Është e bezdisshme dhe krijon presion. |
| Çfarë shkon keq më së shpeshti? | Nuk ka shumë probleme. Zakonisht pajtohen me çmimin; nëse nuk u pëlqen, nuk e bëjnë riparimin. |
| Sa riparime keni në javë? | Varet nga sezona; mesatarisht rreth 20. |

Kufizim: kjo është vetëm një bisedë. Me klientë të servisit nuk kam biseduar ende.

## 3. Hipoteza e vlerës
> **Nëse** servisi e regjistron riparimin në aplikacion dhe klienti e sheh statusin dhe koston shtesë në telefon,
> **atëherë** klientët telefonojnë më rrallë për të pyetur “a u bë gati” dhe pronari nuk duhet të thërrasë për çdo kosto shtesë.

## 4. Rrjedha kryesore
1. **Regjistrimi:** pronari shënon pajisjen, problemin dhe çmimin e vlerësuar në banak.
2. **Linku:** klienti merr linkun e riparimit.
3. **Statusi:** pronari ndryshon statusin: Pranuar → Në riparim → Gati për marrje.
4. **Kostoja shtesë (kur ka):** pronari shënon arsyen dhe çmimin; klienti miraton ose refuzon.
5. **Marrja:** klienti sheh “Gati për marrje” dhe vjen në servis.

## 5. Kufijtë e MVP-së
- **Brenda:** regjistrimi i riparimit në banak; statusi i riparimit; miratimi i kostos shtesë.
- **Jashtë:** pagesat në aplikacion; kërkesa nga shtëpia dhe chat-i; shumë servise dhe vlerësimet.

Hollësitë janë te [scope-contract.md](scope-contract.md).

## 6. Kriteret e pranimit
- [ ] **AC-1:** Kur pronari regjistron një riparim, ai shfaqet në listë me statusin “Pranuar” dhe hapet nga linku i klientit.
- [ ] **AC-2:** Kur pronari ndryshon statusin, klienti e sheh statusin e ri pa rifreskuar faqen.
- [ ] **AC-3:** Klienti nuk mund ta ndryshojë statusin; serveri e refuzon kërkesën.
- [ ] **AC-4:** Kur klienti miraton koston shtesë, miratimi ruhet një herë, edhe nëse shtyp dy herë.
- [ ] **AC-5:** Pa internet, klienti sheh statusin e fundit të ruajtur dhe kohën e përditësimit.

## 7. Modeli minimal i të dhënave (Supabase PostgreSQL)
```sql
profiles (id, full_name, phone, role)            -- role: servis | klient
repairs (id, customer_id, device, problem, estimate_eur, status, created_at, updated_at)
extra_costs (id, repair_id, reason, amount_eur, decision, decided_at)  -- decision: pending | approved | refused
```

## 8. Rreziqet që duhen testuar
- **A do ta përdorë pronari aplikacionin në vend të fletores?** Shënimi në fletore zgjat pak sekonda. Testi: pronari regjistron një riparim në telefon; nëse zgjat më shumë se në fletore, formulari duhet shkurtuar.
- **A do ta hapin klientët linkun në vend që të telefonojnë?** Ende pa provë; duhet biseduar me disa klientë.
