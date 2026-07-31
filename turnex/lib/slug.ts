// Genera un slug legible a partir del nombre del negocio (kebab-case,
// sin tildes ni caracteres especiales) y le agrega un sufijo corto
// aleatorio solo si hace falta para evitar choques.
export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita tildes
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "negocio"
  );
}

export function randomSuffix(length = 4): string {
  return Math.random().toString(36).slice(2, 2 + length);
}

// URL pública real del sitio, tomada de variable de entorno.
// Si no está configurada, se deja vacía (el componente que la use
// debe manejar ese caso, ej. mostrando solo la ruta relativa).
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
}
