import Link from "next/link";
import { Ikona } from "@/components/Ikona";

// Butoni i llogarisë në cep: inicialja kur je i kyçur (si te aplikacionet e Apple), ikona e personit kur jo.
export function ButoniLlogarise({ emri }: { emri?: string | null }) {
  return (
    <Link href="/llogaria" className="nav__icon nav__icon--account" aria-label={emri ? `Llogaria e ${emri}` : "Riparimet e mia"}>
      {emri ? <span className="avatar avatar--nav" aria-hidden="true">{[...emri][0]?.toUpperCase()}</span> : <Ikona emri="njeri" madhesia={20} />}
    </Link>
  );
}
