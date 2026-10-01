export type Statusi = "Pranuar" | "Në riparim" | "Gati për marrje";

export type Riparim = {
  id: string;
  pajisja: string;
  problemi: string;
  dorezuar: string;
  statusi: Statusi;
  // çmimi i vlerësuar që servisi e jep në banak
  cmimi: number;
  // problem i gjetur gjatë punës; pret miratimin e klientit
  shtese: { arsyeja: string; cmimi: number } | null;
};

export const riparimet: Riparim[] = [
  { id: "1", pajisja: "iPhone 13", problemi: "Ekrani i thyer",
    dorezuar: "29.09.2026", statusi: "Gati për marrje", cmimi: 85,
    shtese: null },
  { id: "2", pajisja: "Samsung Galaxy A54", problemi: "Bateria mbaron shpejt",
    dorezuar: "30.09.2026", statusi: "Në riparim", cmimi: 35,
    shtese: { arsyeja: "Porta e karikimit është e dëmtuar", cmimi: 15 } },
  { id: "3", pajisja: "Xiaomi Redmi Note 12", problemi: "Nuk karikohet",
    dorezuar: "01.10.2026", statusi: "Pranuar", cmimi: 20,
    shtese: null },
];

export function gjejRiparimin(id: string) {
  return riparimet.find((riparim) => riparim.id === id);
}
