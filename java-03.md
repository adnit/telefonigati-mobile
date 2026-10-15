# TelefoniGati — Java 3 (projekti individual)

## Çfarë ndërtova
Tri ekrane me të dhëna fiktive: lista e riparimeve me tri karta, detajet e riparimit me statusin dhe çmimin, dhe faqja e miratimit të simuluar të kostos shtesë. Shtova edhe faqen “Riparimi nuk u gjet”.

## Provat që bëra
### Prova 1: Lista në telefon
Hapa faqen kryesore në pamjen e telefonit (375 px); prisja tri karta pa lëvizje anash; pashë tri kartat e riparimeve të lexueshme dhe faqja nuk lëviz anash.

### Prova 2: Detajet e riparimit të dytë
Hapa kartën 2; prisja adresën /riparimi/2 me statusin “Në riparim”, çmimin 35 € dhe koston shtesë +15 €; pashë pikërisht këto dhe butonin “Mirato koston shtesë”.
Te karta 3 (pa kosto shtesë) butoni është i çaktivizuar dhe shkruan “Nuk ka kosto shtesë”. Adresa /riparimi/99 kthen 404.

### Prova 3: Miratimi i kostos shtesë
Hapa /riparimi/2/miratimi; prisja “Simulim: Miratuar”, pa ruajtje reale; pashë këtë mesazh dhe lidhjen “Kthehu te detajet”. Te /riparimi/3/miratimi shfaqet “Nuk ka kosto shtesë për miratim”.

## Çfarë do të përmirësoj
Mungon pamja e servisit: regjistrimi i riparimit në banak dhe ndryshimi i statusit. Këto i shtoj kur të vijë databaza në javën 4.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) shkroi dokumentimin e kësaj faqeje
