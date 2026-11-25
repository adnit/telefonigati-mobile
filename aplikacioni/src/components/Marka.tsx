import Link from "next/link";
import { Ikona } from "@/components/Ikona";

// Shenja e aplikacionit: e njëjta si ikona në ekranin e telefonit.
export function Marka({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="TelefoniGati, faqja kryesore">
      <span className="brand__mark" aria-hidden="true"><Ikona emri="telefonGati" madhesia={19} trashesia={2} /></span>
      TelefoniGati
    </Link>
  );
}
