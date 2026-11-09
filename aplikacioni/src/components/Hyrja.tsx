"use client";

import { signIn, signOut } from "next-auth/react";

export default function Hyrja({ brenda }: { brenda: boolean }) {
  return brenda
    ? <button className="action action--quiet" onClick={() => signOut({ callbackUrl: "/servisi" })}>Dil</button>
    : <button className="action" onClick={() => signIn("google", { callbackUrl: "/servisi" })}>Hyr me Google</button>;
}
