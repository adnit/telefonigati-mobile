import Link from "next/link";

export default function RiparimiNukUGjet() {
  return (
    <main>
      <h1>Riparimi nuk u gjet</h1>
      <p>Kjo adresë nuk përputhet me një riparim në listë.</p>
      <Link className="action" href="/">Kthehu te lista</Link>
    </main>
  );
}
