export const DURATION_UNITS: Record<string, number> = {
  minutos: 1,
  horas: 60,
  dias: 1440,
  semanas: 10080,
};

export function toMinutes(amount: number, unit: string): number {
  return Math.round(amount * (DURATION_UNITS[unit] ?? 1));
}

// Convierte minutos guardados a la unidad más legible posible (sin decimales raros)
export function fromMinutes(minutes: number): { amount: number; unit: string } {
  if (minutes % DURATION_UNITS.semanas === 0 && minutes >= DURATION_UNITS.semanas) {
    return { amount: minutes / DURATION_UNITS.semanas, unit: "semanas" };
  }
  if (minutes % DURATION_UNITS.dias === 0 && minutes >= DURATION_UNITS.dias) {
    return { amount: minutes / DURATION_UNITS.dias, unit: "dias" };
  }
  if (minutes % DURATION_UNITS.horas === 0 && minutes >= DURATION_UNITS.horas) {
    return { amount: minutes / DURATION_UNITS.horas, unit: "horas" };
  }
  return { amount: minutes, unit: "minutos" };
}
