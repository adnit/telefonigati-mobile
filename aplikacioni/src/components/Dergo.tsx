"use client";

import { useFormStatus } from "react-dom";

// Butoni i dërgimit të formularit: gjatë pritjes së serverit çaktivizohet dhe tregon që po punon,
// që një prekje e dytë të mos dërgojë sërish.
export function Dergo({ children, pritja = "Po ruhet…", className = "btn btn--primary btn--block", name, value, disabled = false, shtypur }: {
  children: React.ReactNode;
  pritja?: string;
  className?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  shtypur?: boolean;
}) {
  const { pending, data } = useFormStatus();
  // Në një formular me disa butone (p.sh. statuset), vetëm i shtypuri tregon pritjen.
  const kyButon = !name || data?.get(name) === value;
  return (
    <button className={className} type="submit" name={name} value={value}
      disabled={pending || disabled} aria-busy={pending && kyButon} aria-pressed={shtypur}>
      {pending && kyButon ? <><span className="spinner" aria-hidden="true" />{pritja}</> : children}
    </button>
  );
}
