import { versioniIListes } from "@/lib/riparimet";
import { vetemServisi } from "@/lib/servisi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await vetemServisi())) return Response.json({ error: "ndaluar" }, { status: 403 });
    return Response.json({ v: await versioniIListes() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "databaza" }, { status: 503 });
  }
}
