# TelefoniGati — Java 2 (projekti individual)

**Shkurtesat:** MVP (Minimum Viable Product – produkti minimal i përdorshëm); AI (Artificial Intelligence – inteligjencë artificiale).

> **Biznesi:** një servis lokal telefonash, rreth 20 riparime në javë. Pronari nuk dëshiron që emri të publikohet.

## 1. Problemi
Servisi i mban riparimet në fletore. Klienti nuk e di kur është gati telefoni, prandaj disa telefonojnë për të pyetur. Pronari thotë se këto thirrje janë të bezdisshme dhe i krijojnë presion gjatë punës. Kur gjatë riparimit del një problem tjetër, pronari duhet ta thërrasë klientin para se të vazhdojë.

## 2. Përdoruesit
- **Pronari i servisit:** dëshiron t'i ketë riparimet në një vend në vend të fletores, ta ndryshojë statusin me një prekje dhe të marrë miratimin për koston shtesë pa telefonuar.
- **Klienti:** dëshiron ta dijë çmimin e vlerësuar, ta shohë kur është gati telefoni pa thirrur dhe të vendosë vetë për koston shtesë.

## 3. Tri ekranet
1. Lista e riparimeve të mia: çdo kartë shfaq pajisjen, problemin, statusin dhe çmimin. Klienti shtyp “Shiko detajet”.
2. Detajet e riparimit: shfaq statusin (Pranuar → Në riparim → Gati për marrje) dhe çmimin e vlerësuar. Nëse servisi ka gjetur një problem tjetër, shfaqet arsyeja, çmimi shtesë dhe butoni “Mirato koston shtesë”. Pa kosto shtesë, butoni është i çaktivizuar.
3. Miratimi: klienti sheh se kostoja shtesë është miratuar dhe riparimi vazhdon.

## 4. MVP — vetëm tri veçori
1. Servisi regjistron riparimin në banak (pajisja, problemi, çmimi i vlerësuar) dhe klienti merr linkun.
2. Servisi ndryshon statusin dhe klienti e sheh pa telefonuar.
3. Servisi shton koston shtesë; klienti e miraton ose e refuzon nga telefoni.

## 5. Çfarë e lëmë për më vonë?
- Pagesat në aplikacion (paguhet në servis).
- Kërkesa për riparim nga shtëpia: shumica e klientëve vijnë vetë. Edhe chat-i dhe vlerësimet mund të presin.

## 6. Si e provoj?
- Kur servisi e ndryshon statusin në “Gati për marrje”, klienti e sheh në telefonin e vet. Klienti nuk mund ta ndryshojë statusin.
- Kur miratoj koston shtesë, servisi e sheh miratimin. Një klikim i dytë nuk e miraton dy herë.
- Nëse nuk ka kosto shtesë, butoni “Mirato koston shtesë” është i çaktivizuar.
- Nëse e refuzoj koston shtesë, servisi nuk e bën riparimin shtesë dhe çmimi mbetet ai i vlerësuar.

## 7. Prova me kolegun
Jorelevante

## 8. Ndihma nga AI
Përdora AI (Claude) për të përgatitur pyetjet e bisedës me pronarin dhe për të formuluar planin nga përgjigjet e tij. Vetë e bëra bisedën, vendosa çfarë hyn në MVP.
