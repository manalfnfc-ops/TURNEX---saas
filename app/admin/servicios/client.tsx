"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toMinutes, fromMinutes } from "@/lib/duration";

const UNIDADES = [
  { value: "minutos", label: "minutos" },
  { value: "horas", label: "horas" },
  { value: "dias", label: "días" },
  { value: "semanas", label: "semanas" },
];

const EMPTY_FORM = { name: "", description: "", price: "", durationAmount: "30", durationUnit: "minutos", allows_concurrent: false };

export default function ServiciosClient({ businessId, initialServices, initialWorkers }: any) {
  const [services, setServices] = useState(initialServices);
  const [workers, setWorkers] = useState(initialWorkers);
  const [newService, setNewService] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(EMPTY_FORM);
  const [newWorker, setNewWorker] = useState("");
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
        duration_minutes: toMinutes(Number(newService.durationAmount), newService.durationUnit),
        allows_concurrent: newService.allows_concurrent,
      })
      .select()
      .single();
    setServices([...services, data]);
    setNewService(EMPTY_FORM);
  }

  async function toggleService(id: string, active: boolean) {
    await supabase.from("services").update({ active: !active }).eq("id", id);
    setServices(services.map((s: any) => (s.id === id ? { ...s, active: !active } : s)));
  }

  function startEdit(s: any) {
    const { amount, unit } = fromMinutes(s.duration_minutes);
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      description: s.description || "",
      price: String(s.price),
      durationAmount: String(amount),
      durationUnit: unit,
      allows_concurrent: !!s.allows_concurrent,
    });
  }

  async function saveEdit(id: string) {
    const payload = {
      name: editForm.name,
      description: editForm.description,
      price: Number(editForm.price),
      duration_minutes: toMinutes(Number(editForm.durationAmount), editForm.durationUnit),
      allows_concurrent: editForm.allows_concurrent,
    };
    await supabase.from("services").update(payload).eq("id", id);
    setServices(services.map((s: any) => (s.id === id ? { ...s, ...payload } : s)));
    setEditingId(null);
  }

  async function addWorker() {
    if (!newWorker) return;
    const { data } = await supabase.from("workers").insert({ business_id: businessId, name: newWorker }).select().single();
    setWorkers([...workers, data]);
    setNewWorker("");
  }

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <p className="eyebrow mb-1">Catálogo</p>
        <h1 className="font-display text-2xl font-semibold mb-4 text-white">Servicios</h1>

        <div className="space-y-3 mb-5">
          {services.map((s: any) =>
            editingId === s.id ? (
              <div key={s.id} className="card card-glow p-4 space-y-2">
                <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nombre" />
                <input className="input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Descripción breve" />
                <div className="flex gap-2">
                  <input className="input" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Precio COP" />
                  <input className="input w-24" type="number" value={editForm.durationAmount} onChange={(e) => setEditForm({ ...editForm, durationAmount: e.target.value })} />
                  <select className="input" value={editForm.durationUnit} onChange={(e) => setEditForm({ ...editForm, durationUnit: e.target.value })}>
                    {UNIDADES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted pt-1">
                  <input type="checkbox" checked={editForm.allows_concurrent} onChange={(e) => setEditForm({ ...editForm, allows_concurrent: e.target.checked })} />
                  Se puede agendar a otro cliente en el mismo horario (ej. clase grupal)
                </label>
                <div className="flex gap-2 pt-1">
                  <button className="btn-primary text-sm" onClick={() => saveEdit(s.id)}>Guardar</button>
                  <button className="btn-ghost text-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div key={s.id} className="card p-4 flex justify-between items-center gap-3">
                <div>
                  <p className="font-medium text-white">{s.name} <span className="text-accentSoft">${Number(s.price).toLocaleString("es-CO")}</span></p>
                  {s.description && <p className="text-muted text-xs mt-0.5">{s.description}</p>}
                  <p className="text-muted text-xs mt-1 flex items-center gap-2">
                    <span>{formatDuration(s.duration_minutes)}</span>
                    {s.allows_concurrent && <span className="badge-verified badge-ok">Concurrente</span>}
                    {!s.active && <span className="badge-verified badge-pending">Inactivo</span>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-ghost text-xs" onClick={() => startEdit(s)}>Editar</button>
                  <button className="btn-ghost text-xs" onClick={() => toggleService(s.id, s.active)}>
                    {s.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="card card-glow p-4 space-y-2">
          <p className="font-display font-semibold text-sm mb-1 text-white">Agregar servicio</p>
          <input className="input" placeholder="Nombre" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
          <input className="input" placeholder="Descripción breve" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
          <div className="flex gap-2">
            <input className="input" type="number" placeholder="Precio COP" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
            <input className="input w-20" type="number" value={newService.durationAmount} onChange={(e) => setNewService({ ...newService, durationAmount: e.target.value })} />
            <select className="input" value={newService.durationUnit} onChange={(e) => setNewService({ ...newService, durationUnit: e.target.value })}>
              {UNIDADES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted pt-1">
            <input type="checkbox" checked={newService.allows_concurrent} onChange={(e) => setNewService({ ...newService, allows_concurrent: e.target.checked })} />
            Se puede agendar a otro cliente en el mismo horario (ej. clase grupal)
          </label>
          <button className="btn-primary mt-1" onClick={addService}>Agregar servicio</button>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-1">Equipo</p>
        <h2 className="font-display text-xl font-semibold mb-2 text-white">Trabajadores</h2>
        <p className="text-muted text-sm mb-4">Es solo información de preferencia para el cliente — no tienen horario propio ni afectan la disponibilidad.</p>
        <div className="space-y-2 mb-4">
          {workers.map((w: any) => (
            <div key={w.id} className="card p-3 text-white">{w.name}</div>
          ))}
          {workers.length === 0 && <p className="text-muted text-sm">Aún no has agregado trabajadores.</p>}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Nombre del trabajador" value={newWorker} onChange={(e) => setNewWorker(e.target.value)} />
          <button className="btn-primary" onClick={addWorker}>Agregar</button>
        </div>
      </section>
    </div>
  );
}

function formatDuration(minutes: number) {
  const { amount, unit } = fromMinutes(minutes);
  const label = { minutos: "min", horas: amount === 1 ? "hora" : "horas", dias: amount === 1 ? "día" : "días", semanas: amount === 1 ? "semana" : "semanas" }[unit];
  return `${amount} ${label}`;
}
