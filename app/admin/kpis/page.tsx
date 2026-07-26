import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function KpisPage() {
  const supabase = createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userData.user!.id)
    .maybeSingle();

  if (!business) redirect("/admin/onboarding");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("starts_at, status, services(price)")
    .eq("business_id", business!.id);

  const list = appointments ?? [];
  const accepted = list.filter((a: any) => a.status === "accepted");
  const totalIngresos = accepted.reduce((sum: number, a: any) => sum + Number(a.services?.price ?? 0), 0);

  const porDia: Record<string, number> = {};
  for (const a of list) {
    const day = new Date(a.starts_at).toLocaleDateString("es-CO", { weekday: "long" });
    porDia[day] = (porDia[day] ?? 0) + 1;
  }
  const diaTop = Object.entries(porDia).sort((a, b) => b[1] - a[1])[0];

  const proximas = list
    .filter((a: any) => a.status === "accepted" && new Date(a.starts_at) > new Date())
    .sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold mb-6">KPIs del negocio</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Kpi label="Citas atendidas" value={accepted.length.toString()} />
        <Kpi label="Ingresos estimados" value={`$${totalIngresos.toLocaleString("es-CO")}`} />
        <Kpi label="Día más agendado" value={diaTop ? diaTop[0] : "—"} />
        <Kpi label="Total solicitudes" value={list.length.toString()} />
        <Kpi label="Pendientes" value={list.filter((a: any) => a.status === "pending").length.toString()} />
      </div>

      <h2 className="font-display font-semibold mb-3">Próximas citas confirmadas</h2>
      <div className="space-y-2">
        {proximas.length === 0 && <p className="text-muted text-sm">No hay citas confirmadas próximas.</p>}
        {proximas.map((a: any, i: number) => (
          <div key={i} className="card p-3 text-sm">
            {new Date(a.starts_at).toLocaleString("es-CO")}
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-muted text-xs">{label}</p>
      <p className="font-display text-2xl font-semibold text-accent mt-1">{value}</p>
    </div>
  );
}
