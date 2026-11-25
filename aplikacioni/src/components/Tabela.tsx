"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { levizKarten } from "@/app/servisi/actions";
import { Ikona } from "@/components/Ikona";
import { IKONA_E_STATUSIT, TONI } from "@/components/Statusi";
import type { Riparim, Statusi } from "@/lib/riparimet";

const KOLONAT: Statusi[] = ["Pranuar", "Në riparim", "Gati për marrje"];
const TJETRA: Partial<Record<Statusi, Statusi>> = { Pranuar: "Në riparim", "Në riparim": "Gati për marrje" };

type Terheqje = { id: string; x0: number; y0: number; dx: number; dy: number; mbi: Statusi | null };

// Tabela e punës: tri kolona sipas statusit. Karta tërhiqet nga doreza (⋮⋮) në kolonën tjetër;
// pjesa tjetër e kartës hap riparimin, kështu që faqja lëviz normalisht me gisht.
// Ndryshimi shfaqet menjëherë (optimist) dhe kthehet mbrapsht nëse serveri e refuzon.
export function Tabela({ riparimet }: { riparimet: Riparim[] }) {
  const router = useRouter();
  const [statuset, setStatuset] = useState<Record<string, Statusi>>({});
  const [terheqja, setTerheqja] = useState<Terheqje | null>(null);
  const [iLevizur, setILevizur] = useState<string | null>(null);
  const [gabim, setGabim] = useState("");
  const kolonat = useRef<HTMLDivElement>(null);

  const statusiI = (r: Riparim) => statuset[r.id] ?? r.statusi;

  async function leviz(r: Riparim, ne: Statusi) {
    const para = statusiI(r);
    if (para === ne) return;
    setStatuset((s) => ({ ...s, [r.id]: ne }));
    setILevizur(r.id);
    try { navigator.vibrate?.(15); } catch {}
    const rez = await levizKarten(r.id, ne).catch(() => ({ ok: false }));
    if (!rez.ok) {
      setStatuset((s) => ({ ...s, [r.id]: para }));
      setGabim(`${r.pajisja} nuk u zhvendos. Provo përsëri.`);
      window.setTimeout(() => setGabim(""), 4000);
      return;
    }
    router.refresh();
  }

  function kolonaNen(x: number, y: number): Statusi | null {
    for (const el of document.elementsFromPoint(x, y)) {
      const k = (el as HTMLElement).dataset?.kolona;
      if (k) return k as Statusi;
    }
    return null;
  }

  function fillo(e: React.PointerEvent, r: Riparim) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setTerheqja({ id: r.id, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, mbi: statusiI(r) });
    try { navigator.vibrate?.(8); } catch {}
  }
  function terhiq(e: React.PointerEvent) {
    if (!terheqja) return;
    // Afër buzëve, kolonat rrëshqasin vetë që karta të arrijë kolonën që nuk duket.
    const k = kolonat.current;
    if (k) {
      const b = k.getBoundingClientRect();
      if (e.clientX > b.right - 40) k.scrollBy({ left: 14 });
      else if (e.clientX < b.left + 40) k.scrollBy({ left: -14 });
    }
    setTerheqja({ ...terheqja, dx: e.clientX - terheqja.x0, dy: e.clientY - terheqja.y0, mbi: kolonaNen(e.clientX, e.clientY) });
  }
  function lesho(r: Riparim) {
    const t = terheqja;
    setTerheqja(null);
    if (t?.mbi && t.mbi !== statusiI(r)) void leviz(r, t.mbi);
  }

  return (
    <>
      <div className="board" ref={kolonat}>
        {KOLONAT.map((k) => {
          const lista = riparimet.filter((r) => statusiI(r) === k);
          const eSynuar = terheqja?.mbi === k && riparimet.find((r) => r.id === terheqja.id && statusiI(r) !== k);
          return (
            <section key={k} className={`board__col tone--${TONI[k]}${eSynuar ? " board__col--target" : ""}`} data-kolona={k} aria-label={k}>
              <header className="board__head">
                <span className="board__dot" aria-hidden="true" />
                <h2>{k}</h2>
                <span className="board__count">{lista.length}</span>
              </header>
              <div className="board__cards">
                {lista.length === 0 && <p className="board__empty">{terheqja ? "Lëshoje këtu" : "Bosh"}</p>}
                {lista.map((r) => {
                  const kjo = terheqja?.id === r.id;
                  const tjetra = TJETRA[k];
                  return (
                    <article key={r.id} className={`kcard${kjo ? " kcard--drag" : ""}${iLevizur === r.id ? " kcard--dropped" : ""}`}
                      style={kjo ? { transform: `translate(${terheqja.dx}px, ${terheqja.dy}px) rotate(${Math.max(-4, Math.min(4, terheqja.dx / 40))}deg) scale(1.04)` } : undefined}
                      onAnimationEnd={() => setILevizur(null)}>
                      <Link href={`/servisi/riparimi/${r.id}`} className="kcard__body" draggable={false}>
                        <span className="kcard__icon"><Ikona emri={IKONA_E_STATUSIT[k]} madhesia={16} /></span>
                        <span className="kcard__main">
                          <strong>{r.pajisja}</strong>
                          <span>{r.problemi}</span>
                          <span className="kcard__meta">Nr. {r.id} · {r.cmimi} €{r.shtese?.vendimi === "pritje" ? " · pret klientin" : ""}</span>
                        </span>
                      </Link>
                      <div className="kcard__tools">
                        <button type="button" className="kcard__grip" aria-label={`Tërhiq ${r.pajisja}`}
                          onPointerDown={(e) => fillo(e, r)} onPointerMove={terhiq} onPointerUp={() => lesho(r)} onPointerCancel={() => setTerheqja(null)}>
                          <Ikona emri="kapje" madhesia={18} />
                        </button>
                        {tjetra && (
                          <button type="button" className="kcard__next" onClick={() => leviz(r, tjetra)} aria-label={`Kalo ${r.pajisja} te ${tjetra}`}>
                            <Ikona emri="djathtas" madhesia={16} trashesia={2.6} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {gabim && <div className="toast toast--gabim" role="status"><span className="toast__icon">!</span><span className="toast__text">{gabim}</span></div>}
    </>
  );
}
