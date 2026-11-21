# Auditimi Lighthouse

Data: 21.11.2026. Lighthouse 12, profili mobil (telefon i simuluar me rrjet 4G të ngadaltë), në `next start` lokal me databazën Neon.
Çdo vlerë është mesatarja e mesme (mediana) e 3 matjeve, sepse një matje e vetme ndryshon me disa pikë.
Faqja e klientit u mat te një riparim në status "Në riparim" me foto pranimi (JPEG 1024×768, ~19 KB).

## Rezultatet

| Faqja | Versioni | Performanca | Aksesueshmëria | Praktikat | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Ballina | para | 98 | 100 | 100 | 2.37 s | 0 | 34 ms |
| Ballina | pas | 97 | 100 | 100 | 2.53 s | 0 | 35 ms |
| Linku i klientit | para | 94 | 96 | 100 | 2.84 s | 0.085 | 51 ms |
| Linku i klientit | pas | **96** | **100** | 100 | 2.77 s | **0** | 31 ms |

Ballina nuk ndryshoi; dallimi 98/97 është brenda luhatjes së matjeve.

## Çfarë gjeti dhe çfarë u ndryshua

1. **Zhvendosja e faqes (CLS 0.085 → 0).** Karta "Merr njoftim kur të jetë gati" shfaqej vetëm pasi shfletuesi kontrollonte lejet e njoftimeve, dhe e shtynte poshtë foton dhe pjesën tjetër të faqes. Tani karta shfaqet menjëherë me butonin e çaktivizuar gjatë kontrollit.
2. **Kontrasti i tekstit (aksesueshmëria 96 → 100).** Etiketat e vogla (koha e hapave, "Gati deri", etiketat e kartave) kishin kontrast 3.1:1; WCAG AA kërkon 4.5:1. Ngjyra `--faint` u ndriçua nga `#5d6574` në `#7a8292` (4.8:1).
3. **Fotot jashtë faqes.** Më parë fotoja ruhej si data URL dhe futej brenda HTML-së dy herë (në faqe dhe në të dhënat e React-it): HTML e faqes së klientit ishte **66 KB**. Tani fotoja shërbehet nga `/r/[kodi]/foto` si imazh i veçantë me cache 24 orë dhe ngarkohet me `loading="lazy"`: HTML ra në **17 KB**. Lighthouse e numëron foton njësoj në të dyja rastet (bajtet totale ~265 KB), prandaj pikët nuk ndryshojnë nga kjo; fitimi është se faqja shfaqet pa pritur foton dhe rifreskimet nuk e shkarkojnë sërish.

## Si përsëritet

```
cd aplikacioni
npm run build && npx next start -p 3602
npx lighthouse http://localhost:3602/r/<kodi> --form-factor=mobile --only-categories=performance,accessibility,best-practices --view
```

Matjet u bënë lokalisht; në Vercel kohët varen edhe nga rrjeti deri në Frankfurt.
