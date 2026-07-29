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
    .select("id, starts_at, status, paid_amount, client_name, client_email, client_phone, notes, services(name, price), workers(name)")
    .eq("business_id", business!.id);

  const list = appointments ?? [];
  const accepted = list.filter((a: any) => a.status === "accepted");
  const completed = list.filter((a: any) => a.status === "completed");
  const rejected = list.filter((a: any) => a.status === "rejected");

  const ingresosReales = completed.reduce((sum: number, a: any) => sum + Number(a.paid_amount ?? 0), 0);
  const ticketPromedio = completed.length ? ingresosReales / completed.length : 0;

  const now = new Date();
  const ingresosMes = completed
    .filter((a: any) => {
      const d = new Date(a.starts_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, a: any) => sum + Number(a.paid_amount ?? 0), 0);

  const totalDecididas = accepted.length + completed.length + rejected.length;
  const tasaAceptacion = totalDecididas ? Math.round(((accepted.length + completed.length) / totalDecididas) * 100) : 0;

  const porServicio: Record<string, number> = {};
  for (const a of list) {
    const nombre = (a as any).services?.name;
    if (nombre) porServicio[nombre] = (porServicio[nombre] ?? 0) + 1;
  }
  const servicioTop = Object.entries(porServicio).sort((a, b) => b[1] - a[1])[0];

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
    <div className="max-w-4xl">
      <p className="eyebrow mb-1">Panel de resultados</p>
      <h1 className="font-display text-2xl font-semibold mb-6">KPIs del negocio</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Kpi icon="✅" label="Citas completadas" value={completed.length.toString()} highlight />
        <Kpi icon="💰" label="Ingresos reales" value={`$${ingresosReales.toLocaleString("es-CO")}`} highlight />
        <Kpi icon="📆" label="Ingresos este mes" value={`$${ingresosMes.toLocaleString("es-CO")}`} highlight />
        <Kpi icon="🎯" label="Ticket promedio" value={`$${Math.round(ticketPromedio).toLocaleString("es-CO")}`} />
        <Kpi icon="📈" label="Tasa de aceptación" value={`${tasaAceptacion}%`} />
        <Kpi icon="⭐" label="Servicio más pedido" value={servicioTop ? servicioTop[0] : "—"} />
        <Kpi icon="📅" label="Día más agendado" value={diaTop ? diaTop[0] : "—"} />
        <Kpi icon="📨" label="Total solicitudes" value={list.length.toString()} />
        <Kpi icon="⏳" label="Pendientes" value={list.filter((a: any) => a.status === "pending").length.toString()} />
      </div>

      <h2 className="font-display font-semibold mb-3">Próximas citas confirmadas</h2>
      <div className="space-y-3">
        {proximas.length === 0 && <p className="text-muted text-sm">No hay citas confirmadas próximas.</p>}
        {proximas.map((a: any) => (
          <div key={a.id} className="card p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ok" />
                <span className="ticket-code text-sm text-accentSoft">
                  {new Date(a.starts_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <span className="font-medium text-sm">{a.services?.name}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-muted">
              <p><span className="text-white/70">Cliente:</span> {a.client_name}</p>
              <p><span className="text-white/70">Atiende:</span> {a.workers?.name ?? "Sin asignar"}</p>
              {a.client_email && <p><span className="text-white/70">Correo:</span> {a.client_email}</p>}
              {a.client_phone && <p><span className="text-white/70">Teléfono:</span> {a.client_phone}</p>}
              {a.services?.price && <p><span className="text-white/70">Precio:</span> ${Number(a.services.price).toLocaleString("es-CO")}</p>}
            </div>
            {a.notes && <p className="text-muted text-xs mt-2 italic">"{a.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? "card-glow" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-muted text-xs">{label}</p>
      </div>
      <p className="font-display text-2xl font-semibold bg-gradient-to-r from-accentSoft to-cyan bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
}
