"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ServiciosClient({ businessId, initialServices, initialWorkers }: any) {
  const [services, setServices] = useState(initialServices);
  const [workers, setWorkers] = useState(initialWorkers);
  const [newService, setNewService] = useState({ name: "", description: "", price: "", duration_minutes: "30" });
  const [newWorker, setNewWorker] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function addService() {
    if (!newService.name || !newService.price) return;
    const { data } = await supabase
      .from("services")
      .insert({
        business_id: businessId,
        name: newService.name,
        description: newService.description,
        price: Number(newService.price),
        duration_minutes: Number(newService.duration_minutes),
      })
      .select()
      .single();
    setServices([...services, data]);
    setNewService({ name: "", description: "", price: "", duration_minutes: "30" });
  }

  async function toggleService(id: string, active: boolean) {
    await supabase.from("services").update({ active: !active }).eq("id", id);
    setServices(services.map((s: any) => (s.id === id ? { ...s, active: !active } : s)));
  }

  async function addWorker() {
    if (!newWorker) return;
    const { data } = await supabase.from("workers").insert({ business_id: businessId, name: newWorker }).select().single();
    setWorkers([...workers, data]);
    setNewWorker("");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h1 className="font-display text-2xl font-semibold mb-4">Servicios</h1>
        <div className="space-y-2 mb-4">
          {services.map((s: any) => (
            <div key={s.id} className="card p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{s.name} — ${Number(s.price).toLocaleString("es-CO")}</p>
                <p className="text-muted text-xs">{s.duration_minutes} min</p>
              </div>
              <button className="btn-ghost text-xs" onClick={() => toggleService(s.id, s.active)}>
                {s.active ? "Desactivar" : "Activar"}
              </button>
            </div>
          ))}
        </div>
        <div className="card p-4 space-y-2">
          <p className="font-display font-semibold text-sm mb-1">Agregar servicio</p>
          <input className="input" placeholder="Nombre" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
          <input className="input" placeholder="Descripción breve" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
          <div className="flex gap-2">
            <input className="input" type="number" placeholder="Precio COP" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
            <input className="input" type="number" placeholder="Duración (min)" value={newService.duration_minutes} onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={addService}>Agregar</button>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Equipo (informativo)</h2>
        <p className="text-muted text-sm mb-3">No tienen horario propio; solo se muestran como preferencia al agendar.</p>
        <div className="space-y-2 mb-4">
          {workers.map((w: any) => (
            <div key={w.id} className="card p-3">{w.name}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Nombre del trabajador" value={newWorker} onChange={(e) => setNewWorker(e.target.value)} />
          <button className="btn-primary" onClick={addWorker}>Agregar</button>
        </div>
      </section>
    </div>
  );
}
