import { createServerSupabase } from "@/lib/supabase/server";
import { generateDaySlots } from "@/lib/availability";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { businessId, date, durationMinutes } = await req.json();

  if (!businessId || !date || !durationMinutes) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Mismo ajuste que en availability.ts: el día "de Colombia" no es el día
  // UTC del servidor, así que el rango se calcula con el offset explícito.
  const dayStart = new Date(`${date}T00:00:00-05:00`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59-05:00`).toISOString();

  const [{ data: hours, error: hoursErr }, { data: busy, error: busyErr }] = await Promise.all([
    supabase.rpc("get_hours_public", { p_business_id: businessId }),
    supabase.rpc("get_busy_slots", { p_business_id: businessId, p_from: dayStart, p_to: dayEnd }),
  ]);

  if (hoursErr || busyErr) {
    return NextResponse.json({ error: "No se pudo calcular disponibilidad" }, { status: 500 });
  }

  const slots = generateDaySlots(date, hours ?? [], busy ?? [], durationMinutes);

  return NextResponse.json({ slots });
}
