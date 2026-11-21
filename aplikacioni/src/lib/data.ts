// Data e pritur e riparimit në gjuhën e klientit: "e premte, 28.11 · pas 3 ditësh".
const DITET = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];

function sotNeKosove() {
  const t = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Belgrade" }).format(new Date());
  return new Date(t + "T00:00:00Z");
}

export function pershkrimiIDates(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  const ditet = Math.round((d.getTime() - sotNeKosove().getTime()) / 86_400_000);
  const dita = DITET[d.getUTCDay()];
  const data = `${dita[0].toUpperCase()}${dita.slice(1)}, ${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const relativ = ditet === 0 ? "sot" : ditet === 1 ? "nesër" : ditet > 1 ? `pas ${ditet} ditësh`
    : ditet === -1 ? "vonesë 1 ditë" : `vonesë ${-ditet} ditë`;
  return { data, relativ, vonese: ditet < 0 };
}
