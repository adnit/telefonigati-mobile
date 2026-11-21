import { Skeda } from "@/components/Skeda";
import { vetemServisi } from "@/lib/servisi";

// Stafi ka shiritin e poshtëm; vizitorët dhe faqja e hyrjes jo.
export default async function ServisiLayout({ children }: { children: React.ReactNode }) {
  const p = await vetemServisi().catch(() => null);
  return (
    <div className={p ? "has-tabbar" : undefined}>
      {children}
      {p && <Skeda pronar={p.roli === "pronar"} />}
    </div>
  );
}
