import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { appointmentId } = await req.json();
  const supabase = createServerSupabase();

  const { data: appt } = await supabase
    .from("appointments")
    .select("*, businesses(name, address)")
    .eq("id", appointmentId)
    .single();

  if (!appt?.client_email) {
    return NextResponse.json({ error: "Sin correo registrado" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "citas@turnex.app",
    to: appt.client_email,
    subject: `Recordatorio de tu cita en ${appt.businesses.name}`,
    html: `<p>Hola ${appt.client_name}, te recordamos tu cita el ${new Date(appt.starts_at).toLocaleString("es-CO")} en ${appt.businesses.address ?? appt.businesses.name}.</p>`,
  });

  return NextResponse.json({ ok: true });
}
