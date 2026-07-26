import { createServerSupabase } from "@/lib/supabase/server";
import OnboardingForm from "./form";

export const dynamic = "force-dynamic";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function OnboardingPage() {
  const supabase = createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();

  let { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", userData.user!.id)
    .maybeSingle();

  // Si el dueño aún no tiene negocio creado, se crea uno vacío para que lo complete
  if (!business) {
    const slug = "negocio-" + Math.random().toString(36).slice(2, 8);
    const { data: created, error } = await supabase
      .from("businesses")
      .insert({ owner_id: userData.user!.id, slug, name: "Mi negocio" })
      .select()
      .single();

    if (error || !created) {
      return (
        <div className="max-w-lg card p-6">
          <p className="eyebrow mb-2">No se pudo crear tu negocio</p>
          <p className="text-sm text-muted">
            Ocurrió un problema de permisos en la base de datos. Si eres tú, Manuel: revisa
            que exista la política <code>owner_insert_business</code> en la tabla{" "}
            <code>businesses</code> en Supabase (SQL Editor).
          </p>
          <p className="text-xs text-muted mt-3">Detalle técnico: {error?.message}</p>
        </div>
      );
    }
    business = created;
  }

  const { data: hours } = await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", business!.id)
    .order("weekday");

  const existingHours = DIAS.map((_, weekday) => {
    const found = hours?.find((h) => h.weekday === weekday);
    return found ?? { weekday, open_time: "09:00", close_time: "18:00", is_closed: weekday === 0 };
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Mi negocio</h1>
      <p className="text-muted text-sm mb-6">
        Enlace público: <span className="text-accent">turnex.app/{business!.slug}</span>
      </p>
      <OnboardingForm business={business} hours={existingHours} dias={DIAS} />
    </div>
  );
}
