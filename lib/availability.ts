// Motor de calendario: genera los horarios disponibles de un día,
// según el horario de atención del negocio y la duración del servicio elegido.
// No depende de trabajadores — es un solo calendario general por negocio.

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
  const date = new Date(dateISO + "T00:00:00");
  const weekday = date.getDay();
  const dayHours = hours.find((h) => h.weekday === weekday);

  if (!dayHours || dayHours.is_closed) return [];

  const [openH, openM] = dayHours.open_time.split(":").map(Number);
  const [closeH, closeM] = dayHours.close_time.split(":").map(Number);

  const open = new Date(date);
  open.setHours(openH, openM, 0, 0);
  const close = new Date(date);
  close.setHours(closeH, closeM, 0, 0);

  const busyRanges = busySlots.map((b) => ({
    start: new Date(b.starts_at).getTime(),
    end: new Date(b.ends_at).getTime(),
  }));

  const slots: { time: string; available: boolean }[] = [];
  const now = new Date();

  let cursor = new Date(open);
  while (cursor.getTime() + durationMinutes * 60000 <= close.getTime()) {
    const slotStart = cursor.getTime();
    const slotEnd = slotStart + durationMinutes * 60000;

    const overlaps = busyRanges.some((b) => slotStart < b.end && slotEnd > b.start);
    const isPast = slotStart < now.getTime();

    slots.push({
      time: cursor.toISOString(),
      available: !overlaps && !isPast,
    });

    cursor = new Date(cursor.getTime() + stepMinutes * 60000);
  }

  return slots;
}
