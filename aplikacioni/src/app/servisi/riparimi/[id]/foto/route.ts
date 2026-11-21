import { lexoFoton } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

// Fotoja për stafin; kërkon hyrjen si te faqja e riparimit.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await vetemServisi())) return new Response(null, { status: 403 });
  const { id } = await params;
  const foto = await lexoFoton({ id }).catch(() => null);
  if (!foto) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(foto), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400, immutable" },
  });
}
