import { lexoFoton } from "@/lib/riparimet";

// Fotoja e pranimit për klientin. Nuk ndryshon pas regjistrimit, prandaj shfletuesi e mban në cache.
export async function GET(_req: Request, { params }: { params: Promise<{ kodi: string }> }) {
  const { kodi } = await params;
  if (!/^[0-9a-f]{32}$/.test(kodi)) return new Response(null, { status: 404 });
  const foto = await lexoFoton({ kodi }).catch(() => null);
  if (!foto) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(foto), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400, immutable" },
  });
}
