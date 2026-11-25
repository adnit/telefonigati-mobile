"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { levizKarten } from "@/app/servisi/actions";
import { Ikona } from "@/components/Ikona";
import { IKONA_E_STATUSIT, TONI } from "@/components/Statusi";
import type { Riparim, Statusi } from "@/lib/riparimet";

const KOLONAT: Statusi[] = ["Pranuar", "Në riparim", "Gati për marrje"];
const SHKURT: Record<string, string> = { Pranuar: "Pranuar", "Në riparim": "Në riparim", "Gati për marrje": "Gati" };
const TJETRA: Partial<Record<Statusi, Statusi>> = { Pranuar: "Në riparim", "Në riparim": "Gati për marrje" };
const PARA: Partial<Record<Statusi, Statusi>> = { "Në riparim": "Pranuar", "Gati për marrje": "Në riparim" };

// Karta që tërhiqet: pozicioni fillestar dhe zhvendosja e gishtit.
type Terheqje = { id: string; x: number; y: number; w: number; dx: number; dy: number; x0: number; y0: number; mbi: Statusi | null };

// Tabela e punës. Në telefon shfaqet një kolonë në një kohë, me skedat e kolonave sipër;
// gjatë tërheqjes karta noton nën gisht dhe lëshohet mbi skedën e kolonës tjetër.
// Në ekran të gjerë kolonat janë krah për krah dhe karta lëshohet mbi kolonë.
// Ndryshimi shfaqet menjëherë dhe kthehet mbrapsht nëse serveri e refuzon.
export function Tabela({ riparimet }: { riparimet: Riparim[] }) {
  const router = useRouter();
  const [statuset, setStatuset] = useState<Record<string, Statusi>>({});
  const [aktive, setAktive] = useState<Statusi>("Pranuar");
  const [terheqja, setTerheqja] = useState<Terheqje | null>(null);
  const [iLevizur, setILevizur] = useState<string | null>(null);
  const [mesazhi, setMesazhi] = useState<{ teksti: string; ton: "ok" | "gabim" } | null>(null);

  const statusiI = (r: Riparim) => statuset[r.id] ?? r.statusi;
  const numri = (k: Statusi) => riparimet.filter((r) => statusiI(r) === k).length;

  function trego(teksti: string, ton: "ok" | "gabim") {
    setMesazhi({ teksti, ton });
    window.setTimeout(() => setMesazhi(null), 3000);
  }

  async function leviz(r: Riparim, ne: Statusi) {
    const para = statusiI(r);
    if (para === ne) return;
    setStatuset((s) => ({ ...s, [r.id]: ne }));
    setILevizur(r.id);
    try { navigator.vibrate?.(15); } catch {}
    const rez = await levizKarten(r.id, ne).catch(() => ({ ok: false }));
    if (!rez.ok) {
      setStatuset((s) => ({ ...s, [r.id]: para }));
      trego(`${r.pajisja} nuk u zhvendos. Provo përsëri.`, "gabim");
      return;
    }
    trego(`${r.pajisja} → ${ne}`, "ok");
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
    const karta = (e.currentTarget as HTMLElement).closest(".kcard") as HTMLElement;
    const b = karta.getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setTerheqja({ id: r.id, x: b.left, y: b.top, w: b.width, dx: 0, dy: 0, x0: e.clientX, y0: e.clientY, mbi: null });
    try { navigator.vibrate?.(8); } catch {}
  }
  function terhiq(e: React.PointerEvent) {
    if (!terheqja) return;
    setTerheqja({ ...terheqja, dx: e.clientX - terheqja.x0, dy: e.clientY - terheqja.y0, mbi: kolonaNen(e.clientX, e.clientY) });
  }
  function lesho(r: Riparim) {
    const t = terheqja;
    setTerheqja(null);
    if (t?.mbi && t.mbi !== statusiI(r)) {
      void leviz(r, t.mbi);
      setAktive(t.mbi);
    }
  }

  const tërhequr = terheqja ? riparimet.find((r) => r.id === terheqja.id) : null;

  return (
    <>
      <div className={`board-tabs${terheqja ? " board-tabs--drop" : ""}`} role="tablist" aria-label="Kolonat">
        {KOLONAT.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={aktive === k} data-kolona={k}
            className={`board-tab tone--${TONI[k]}${terheqja?.mbi === k && tërhequr && statusiI(tërhequr) !== k ? " board-tab--target" : ""}`}
            onClick={() => setAktive(k)}>
            <span className="board__dot" aria-hidden="true" />{SHKURT[k]}<span className="board-tab__n">{numri(k)}</span>
          </button>
        ))}
      </div>

      <div className="board">
        {KOLONAT.map((k) => {
          const lista = riparimet.filter((r) => statusiI(r) === k);
          const eSynuar = terheqja?.mbi === k && tërhequr && statusiI(tërhequr) !== k;
          return (
            <section key={k} className={`board__col tone--${TONI[k]}${eSynuar ? " board__col--target" : ""}`}
              data-kolona={k} data-aktive={aktive === k} aria-label={k}>
              <header className="board__head">
                <span className="board__dot" aria-hidden="true" />
                <h2>{k}</h2>
                <span className="board__count">{lista.length}</span>
              </header>
              <div className="board__cards">
                {lista.length === 0 && <p className="board__empty">{terheqja ? "Lëshoje këtu" : "Asnjë telefon"}</p>}
                {lista.map((r) => {
                  const kjo = terheqja?.id === r.id;
                  const tjetra = TJETRA[k];
                  const para = PARA[k];
                  return (
                    <article key={r.id} className={`kcard${kjo ? " kcard--placeholder" : ""}${iLevizur === r.id ? " kcard--dropped" : ""}`}
                      onAnimationEnd={() => setILevizur(null)}>
                      <KartaPermbajtja r={r} k={k} />
                      <div className="kcard__tools">
                        <button type="button" className="kcard__grip" aria-label={`Tërhiq ${r.pajisja}`}
                          onPointerDown={(e) => fillo(e, r)} onPointerMove={terhiq} onPointerUp={() => lesho(r)} onPointerCancel={() => setTerheqja(null)}>
                          <Ikona emri="kapje" madhesia={18} />
                        </button>
                        <div className="kcard__arrows">
                          {para && (
                            <button type="button" className="kcard__next kcard__next--back" onClick={() => { void leviz(r, para); }} aria-label={`Kthe ${r.pajisja} te ${para}`}>
                              <Ikona emri="majtas" madhesia={16} trashesia={2.6} />
                            </button>
                          )}
                          {tjetra && (
                            <button type="button" className="kcard__next" onClick={() => { void leviz(r, tjetra); }} aria-label={`Kalo ${r.pajisja} te ${tjetra}`}>
                              <Ikona emri="djathtas" madhesia={16} trashesia={2.6} />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Karta që noton nën gisht: "fixed", që të mos e presë asnjë kolonë dhe të mos lëvizë me faqen. */}
      {terheqja && tërhequr && (
        <article className="kcard kcard--ghost" aria-hidden="true"
          style={{ left: terheqja.x, top: terheqja.y, width: terheqja.w,
            transform: `translate(${terheqja.dx}px, ${terheqja.dy}px) rotate(${Math.max(-3, Math.min(3, terheqja.dx / 50))}deg) scale(1.03)` }}>
          <KartaPermbajtja r={tërhequr} k={statusiI(tërhequr)} />
        </article>
      )}

      {mesazhi && (
        <div className={`toast toast--${mesazhi.ton}`} role="status">
          <span className="toast__icon" aria-hidden="true">{mesazhi.ton === "ok" ? "✓" : "!"}</span>
          <span className="toast__text">{mesazhi.teksti}</span>
        </div>
      )}
    </>
  );
}

function KartaPermbajtja({ r, k }: { r: Riparim; k: Statusi }) {
  return (
    <Link href={`/servisi/riparimi/${r.id}`} className="kcard__body" draggable={false}>
      <span className="kcard__icon"><Ikona emri={IKONA_E_STATUSIT[k]} madhesia={16} /></span>
      <span className="kcard__main">
        <strong>{r.pajisja}</strong>
        <span>{r.problemi}</span>
        <span className="kcard__meta">Nr. {r.id} · {r.cmimi} €{r.shtese?.vendimi === "pritje" ? " · pret klientin" : ""}</span>
      </span>
    </Link>
  );
}
