import { createAdminSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Documentación de firma de eventos de Wompi:
// https://docs.wompi.co/docs/colombia/eventos/
// El evento llega con: { event, data: { transaction }, signature, timestamp }
// El "reference" de la transacción debe crearse en el checkout como el business_id
// (o "business_id:plan"), para saber a qué negocio activar aquí.

export async function POST(req: Request) {
  const body = await req.json();

  const isValid = verifyWompiSignature(body);
  if (!isValid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const transaction = body?.data?.transaction;
  if (!transaction || transaction.status !== "APPROVED") {
    return NextResponse.json({ ok: true }); // ignoramos eventos no aprobados
  }

  const [businessId, plan] = String(transaction.reference).split(":"); // ej. "uuid:monthly"
  const supabase = createAdminSupabase();

  const planExpiresAt = new Date();
  if (plan === "annual") planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
  else planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);

  await supabase
    .from("businesses")
    .update({ plan_status: "active", plan_expires_at: planExpiresAt.toISOString() })
    .eq("id", businessId);

  return NextResponse.json({ ok: true });
}

function verifyWompiSignature(body: any): boolean {
  try {
    const { signature, timestamp, data } = body;
    const secret = process.env.WOMPI_EVENTS_SECRET!;
    const properties = signature.properties as string[];
    const concatenated =
      properties.map((p: string) => getNested(data, p)).join("") + timestamp + secret;
    const hash = crypto.createHash("sha256").update(concatenated).digest("hex");
    return hash === signature.checksum;
  } catch {
    return false;
  }
}

function getNested(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
