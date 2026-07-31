// Motor de calendario: genera los horarios disponibles de un día,
// según el horario de atención del negocio y la duración del servicio elegido.
// No depende de trabajadores — es un solo calendario general por negocio.
//
// IMPORTANTE: el servidor (Vercel) corre en UTC, pero los horarios del
// negocio están en hora de Colombia (UTC-5, sin horario de verano). Por eso
// las horas se construyen con el offset "-05:00" explícito, en vez de dejar
// que JavaScript use la zona horaria del servidor — si no, se corre 5 horas.
const COLOMBIA_OFFSET = "-05:00";

export type BusinessHour = {
  weekday: number;
  open_time: string; // "09:00:00"
  close_time: string; // "18:00:00"
  is_closed: boolean;
};

export type BusySlot = { starts_at: string; ends_at: string };

export function generateDaySlots(
  dateISO: string, // "2026-07-10"
  hours: BusinessHour[],
  busySlots: BusySlot[],
  durationMinutes: number,
  stepMinutes = 15
): { time: string; available: boolean }[] {
  // Día de la semana calculado en UTC puro (matemática de calendario, no
  // depende de ninguna zona horaria del servidor).
  const [y, m, d] = dateISO.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const dayHours = hours.find((h) => h.weekday === weekday);

  if (!dayHours || dayHours.is_closed) return [];

  const open = new Date(`${dateISO}T${dayHours.open_time}${COLOMBIA_OFFSET}`);
  const close = new Date(`${dateISO}T${dayHours.close_time}${COLOMBIA_OFFSET}`);

  const busyRanges = busySlots.map((b) => ({
    start: new Date(b.starts_at).getTime(),
    end: new Date(b.ends_at).getTime(),
  }));

  const slots: { time: string; available: boolean }[] = [];
  const now = Date.now();

  let cursor = open.getTime();
  while (cursor + durationMinutes * 60000 <= close.getTime()) {
    const slotStart = cursor;
    const slotEnd = slotStart + durationMinutes * 60000;

    const overlaps = busyRanges.some((b) => slotStart < b.end && slotEnd > b.start);
    const isPast = slotStart < now;

    slots.push({
      time: new Date(slotStart).toISOString(),
      available: !overlaps && !isPast,
    });

    cursor += stepMinutes * 60000;
  }

  return slots;
}
