import { createAdminSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Se ejecuta automáticamente todos los días (ver vercel.json).
// Revisa dos cosas:
// 1. Negocios en demo cuya fecha de vencimiento ya pasó -> inactive
// 2. Negocios activos (pagando) cuyo plan_expires_at ya pasó y no se renovó -> inactive
export async function GET(req: Request) {
  // Protege el endpoint: solo Vercel Cron (o alguien con el secreto) puede llamarlo
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminSupabase();
  const now = new Date().toISOString();

  const { data: expiredDemo } = await supabase
    .from("businesses")
    .update({ plan_status: "inactive" })
    .eq("plan_status", "demo")
    .lt("demo_expires_at", now)
    .select("id, name");

  const { data: expiredPaid } = await supabase
    .from("businesses")
    .update({ plan_status: "inactive" })
    .eq("plan_status", "active")
    .lt("plan_expires_at", now)
    .select("id, name");

  return NextResponse.json({
    ok: true,
    demo_desactivados: expiredDemo?.length ?? 0,
    pagos_desactivados: expiredPaid?.length ?? 0,
  });
}
