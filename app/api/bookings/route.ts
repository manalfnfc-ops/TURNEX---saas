import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    businessId, serviceId, workerId, startsAt, durationMinutes,
    clientName, clientEmail, clientPhone, notes,
  } = body;

  if (!businessId || !serviceId || !startsAt || !durationMinutes || !clientName) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }
  if (!clientEmail && !clientPhone) {
    return NextResponse.json({ error: "Deja al menos un correo o un teléfono" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // create_public_appointment inserta en "appointments". Si el horario ya está
  // ocupado, el EXCLUDE constraint de la base de datos rechaza el insert
  // con el código de error 23P01 (exclusion_violation) — así se evita la
  // doble-reserva incluso si dos personas confirman al mismo tiempo.
  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_business_id: businessId,
    p_service_id: serviceId,
    p_worker_id: workerId ?? null,
    p_client_name: clientName,
    p_client_email: clientEmail,
    p_client_phone: clientPhone,
    p_notes: notes ?? "",
    p_starts_at: startsAt,
    p_duration_minutes: durationMinutes,
  });

  if (error) {
    const isConflict = error.code === "23P01" || error.message?.includes("exclusion");
    return NextResponse.json(
      { error: isConflict ? "Ese horario ya no está disponible, elige otro." : error.message },
      { status: isConflict ? 409 : 500 }
    );
  }

  // Confirmación automática por correo, si el cliente dejó email
  if (clientEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "citas@turnex.app",
        to: clientEmail,
        subject: "Solicitud de cita recibida",
        html: `<p>Hola ${clientName}, recibimos tu solicitud de cita para el ${new Date(startsAt).toLocaleString("es-CO")}.</p>
               <p>Te confirmaremos pronto si fue aceptada.</p>`,
      });
    } catch (e) {
      // No bloquea la creación de la cita si el correo falla
      console.error("Error enviando email de confirmación:", e);
    }
  }

  return NextResponse.json({ appointment: data });
}
