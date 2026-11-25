"use client";

import { useMemo, useState } from "react";
import { DataGati, pasDitesh } from "@/components/DataGati";
import { Ikona } from "@/components/Ikona";
import { SkanoImei } from "@/components/SkanoImei";
import { KATALOGU, emriIPajisjes, gjejCmimin, gjejMarken, type Cmim } from "@/lib/katalogu";

const PROBLEMET = ["Ekrani i thyer", "Bateria", "Nuk karikohet", "Kamera", "Ra në ujë", "Nuk ndizet", "Altoparlanti", "Softueri"];

// Pjesa e parë e pranimit në banak: pajisja me markë e model me një prekje, problemi me çipa,
// dhe çmimi e data që plotësohen vetë nga çmimorja e servisit (por mund të ndryshohen me dorë).
export function FormaPranimit({ cmimet }: { cmimet: Cmim[] }) {
  const [marka, setMarka] = useState<string | null>(null);
  const [pajisja, setPajisja] = useState("");
  const [problemi, setProblemi] = useState("");
  const [cmimi, setCmimi] = useState("");
  const [data, setData] = useState("");
  // Kur stafi e shkruan çmimin ose datën vetë, çmimorja nuk e mbishkruan më.
  const [cmimiMeDore, setCmimiMeDore] = useState(false);
  const [dataMeDore, setDataMeDore] = useState(false);

  const markaAktive = marka ?? gjejMarken(pajisja);
  const modelet = KATALOGU.find((k) => k.marka === markaAktive)?.modelet ?? [];
  const sugjerimi = useMemo(() => gjejCmimin(cmimet, pajisja, problemi), [cmimet, pajisja, problemi]);
  const cmimiShfaqur = cmimiMeDore ? cmimi : sugjerimi ? String(sugjerimi.cmimi) : cmimi;
  const dataShfaqur = dataMeDore ? data : sugjerimi?.dite != null ? pasDitesh(sugjerimi.dite) : data;

  // Shabllonet e shpejta: çmimet e çmimores që vlejnë për markën e zgjedhur (ose për çdo telefon).
  const shabllonet = cmimet
    .filter((c) => !c.modeli && (!c.marka || c.marka === markaAktive))
    .sort((a, b) => Number(Boolean(b.marka)) - Number(Boolean(a.marka)))
    .slice(0, 8);

  function shtoProblemin(p: string) {
    setProblemi((s) => {
      if (s.toLocaleLowerCase("sq").includes(p.toLocaleLowerCase("sq"))) return s;
      return s.trim() ? `${s.trim().replace(/[.,]$/, "")}, ${p.toLocaleLowerCase("sq")}` : p;
    });
  }
  function zgjidhShabllonin(c: Cmim) {
    shtoProblemin(c.problemi);
    if (c.marka && !markaAktive) setMarka(c.marka);
    setCmimiMeDore(false); setDataMeDore(false);
  }

  return (
    <>
      <section className="group" aria-label="Telefoni">
        <div className="group__head"><h2>Telefoni</h2></div>
        <div className="group__body">
          <div className="field">
            <span className="field__label">Marka</span>
            <div className="chips chips--scroll" role="group" aria-label="Marka">
              {KATALOGU.map((k) => (
                <button key={k.marka} type="button" className="chip chip--brand" aria-pressed={markaAktive === k.marka}
                  style={{ "--brand": k.ngjyra } as React.CSSProperties}
                  onClick={() => { setMarka(markaAktive === k.marka ? null : k.marka); if (gjejMarken(pajisja) !== k.marka) setPajisja(""); }}>
                  <span className="chip__mono" aria-hidden="true">{k.marka[0]}</span>{k.marka}
                </button>
              ))}
            </div>
            {modelet.length > 0 && (
              <div className="chips chips--scroll chips--models" role="group" aria-label={`Modelet ${markaAktive}`}>
                {modelet.map((m) => {
                  const emri = emriIPajisjes(markaAktive!, m);
                  return <button key={m} type="button" className="chip" aria-pressed={pajisja === emri} onClick={() => setPajisja(emri)}>{m}</button>;
                })}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="pajisja">Pajisja</label>
            <input id="pajisja" name="pajisja" maxLength={80} required placeholder="Zgjidh sipër ose shkruaj modelin"
              value={pajisja} onChange={(e) => setPajisja(e.target.value)} autoComplete="off" autoCapitalize="words" />
          </div>
          <div className="field">
            <label htmlFor="problemi">Problemi</label>
            <textarea id="problemi" name="problemi" maxLength={200} rows={2} required value={problemi}
              onChange={(e) => setProblemi(e.target.value)} placeholder="Çfarë nuk punon?" />
            <div className="chips" style={{ marginTop: 6 }} role="group" aria-label="Problemet e shpeshta">
              {PROBLEMET.map((p) => (
                <button key={p} type="button" className="chip" onClick={() => shtoProblemin(p)}
                  aria-pressed={problemi.toLocaleLowerCase("sq").includes(p.toLocaleLowerCase("sq"))}>{p}</button>
              ))}
            </div>
          </div>
          <SkanoImei />
        </div>
      </section>

      {shabllonet.length > 0 && (
        <section className="group" aria-label="Shabllone nga çmimorja">
          <div className="group__head"><h2>Shabllone nga çmimorja{markaAktive ? ` · ${markaAktive}` : ""}</h2></div>
          <div className="templates">
            {shabllonet.map((c) => (
              <button key={c.id} type="button" className="template" onClick={() => zgjidhShabllonin(c)}
                aria-pressed={problemi.toLowerCase().includes(c.problemi.toLowerCase())}>
                <span className="template__title">{c.problemi}</span>
                <span className="template__sub">{c.marka ?? "Çdo telefon"}{c.dite != null ? ` · ${c.dite === 0 ? "sot" : `${c.dite} ditë`}` : ""}</span>
                <span className="template__price">{c.cmimi} €</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="group" aria-label="Çmimi dhe afati">
        <div className="group__head"><h2>Çmimi dhe afati</h2></div>
        <div className="group__body">
          <div className="field">
            <label htmlFor="cmimi">Çmimi i vlerësuar</label>
            <span className="field__affix">
              <input id="cmimi" name="cmimi" inputMode="numeric" pattern="\d{1,4}" maxLength={4} required placeholder="35"
                value={cmimiShfaqur} onChange={(e) => { setCmimi(e.target.value); setCmimiMeDore(true); }} />
              <span>€</span>
            </span>
            {sugjerimi && !cmimiMeDore && (
              <span className="field__hint field__hint--accent"><Ikona emri="euro" madhesia={13} /> Nga çmimorja: {sugjerimi.problemi}{sugjerimi.marka ? ` · ${sugjerimi.modeli ?? sugjerimi.marka}` : ""}</span>
            )}
          </div>
          <DataGati vlera={dataShfaqur} ndrysho={(v) => { setData(v); setDataMeDore(true); }} />
        </div>
        <p className="group__foot">Klienti i sheh të dyja te linku i vet.</p>
      </section>
    </>
  );
}
