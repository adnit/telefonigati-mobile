"use client";

import { Ikona } from "@/components/Ikona";

export function Printo() {
  return <button type="button" className="btn btn--primary btn--block" onClick={() => window.print()}><Ikona emri="printo" />Printo fletën</button>;
}
