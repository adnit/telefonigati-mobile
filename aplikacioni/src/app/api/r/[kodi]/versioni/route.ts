import { eshteBllokuar, shenoKodTeGabuar } from "@/lib/kufiri";
import { versioniIRiparimit } from "@/lib/riparimet";

export const dynamic = "force-dynamic";

// Vetëm një numër (koha e ndryshimit të fundit): asnjë e dhënë e riparimit.
// Edhe kjo rrugë numëron kodet e gabuara, që linqet të mos hamendësohen përmes saj.
export async function GET(_req: Request, { params }: { params: Promise<{ kodi: string }> }) {
  const { kodi } = await params;
  try {
    if (await eshteBllokuar()) return Response.json({ error: "shume-prova" }, { status: 429 });
    const v = await versioniIRiparimit(kodi);
    if (!v) {
      await shenoKodTeGabuar();
      return Response.json({ error: "nuk-u-gjet" }, { status: 404 });
    }
    return Response.json({ v }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "databaza" }, { status: 503 });
  }
}
