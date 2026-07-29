// Muro de pago: cuando esté en "true", no se puede crear/usar un negocio sin
// una membresía activa. Por ahora queda en false para poder probar el sistema
// sin pagar. Actívalo poniendo la variable de entorno PAYWALL_ENABLED=true en Vercel.
export const PAYWALL_ENABLED = process.env.PAYWALL_ENABLED === "true";
