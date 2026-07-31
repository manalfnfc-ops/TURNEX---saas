"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ESTADO_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  postponed: "Pospuesta",
  cancelled: "Cancelada",
  completed: "Completada",
};

const ESTADO_COLOR: Record<string, string> = {
  pending: "text-warn",
  accepted: "text-cyan",
  rejected: "text-danger",
  postponed: "text-accent2",
  cancelled: "text-muted",
  completed: "text-ok",
};

export default function CitasClient({ businessId, initialAppointments, workers }: any) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const supabase = createClient();

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev: any) => prev.map((a: any) => (a.id === id ? { ...a, status } : a)));
  }

  async function assignWorker(id: string, workerId: string) {
    await supabase.from("appointments").update({ worker_id: workerId || null }).eq("id", id);
    setAppointments((prev: any) => prev.map((a: any) => (a.id === id ? { ...a, worker_id: workerId } : a)));
  }

  async function confirmPaidAmount(a: any) {
    const raw = amountDrafts[a.id] ?? a.paid_amount ?? a.services?.price ?? 0;
    const amount = Number(raw);
    if (isNaN(amount) || amount < 0) return;
    await supabase.from("appointments").update({ status: "completed", paid_amount: amount }).eq("id", a.id);
    setAppointments((prev: any) =>
      prev.map((x: any) => (x.id === a.id ? { ...x, status: "completed", paid_amount: amount } : x))
    );
  }

  async function markPending(a: any) {
    await supabase.from("appointments").update({ status: "accepted" }).eq("id", a.id);
    setAppointments((prev: any) => prev.map((x: any) => (x.id === a.id ? { ...x, status: "accepted" } : x)));
  }

  async function sendReminder(a: any) {
    if (!a.client_email) {
      alert("Este cliente no dejó correo; contáctalo por teléfono.");
      return;
    }
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: a.id }),
    });
    alert("Recordatorio enviado.");
  }

  // Agrupa por día para que se vea como una agenda de calendario, ordenada cronológicamente.
  const groups = useMemo(() => {
    const sorted = [...appointments].sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    const byDay: Record<string, any[]> = {};
    for (const a of sorted) {
      const key = new Date(a.starts_at).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
      (byDay[key] ??= []).push(a);
    }
    return byDay;
  }, [appointments]);

  return (
    <div>
      <p className="eyebrow mb-1">Agenda</p>
      <h1 className="font-display text-2xl font-semibold mb-6 text-white">Citas</h1>

      {appointments.length === 0 && <p className="text-muted text-sm">Aún no hay solicitudes de cita.</p>}

      <div className="space-y-8">
        {Object.entries(groups).map(([day, items]) => (
          <div key={day}>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge-verified badge-ok !text-accentSoft !border-accentSoft/40 !bg-accentSoft/10 capitalize">{day}</span>
              <span className="text-muted text-xs">{items.length} cita{items.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-3 border-l-2 border-line pl-4">
              {items.map((a: any) => (
                <div key={a.id} className="card p-4 flex flex-wrap justify-between gap-3 items-start relative">
                  <span className="absolute -left-[1.45rem] top-5 w-2.5 h-2.5 rounded-full bg-accent shadow-glow" />
                  <div>
                    <p className="ticket-code text-xs text-accentSoft mb-1">
                      {new Date(a.starts_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="font-medium text-white">{a.client_name} — {a.services?.name}</p>
                    <p className="text-xs mt-1">
                      {a.client_email && <span className="text-muted">{a.client_email} </span>}
                      {a.client_phone && <span className="text-muted">{a.client_phone}</span>}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${ESTADO_COLOR[a.status]}`}>{ESTADO_LABEL[a.status]}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      className="input w-auto text-sm"
                      value={a.worker_id || ""}
                      onChange={(e) => assignWorker(a.id, e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {workers.map((w: any) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>

                    {a.status === "pending" && (
                      <>
                        <button className="btn-primary text-sm" onClick={() => updateStatus(a.id, "accepted")}>Aceptar</button>
                        <button className="btn-ghost text-sm" onClick={() => updateStatus(a.id, "postponed")}>Posponer</button>
                        <button className="btn-ghost text-sm text-danger" onClick={() => updateStatus(a.id, "rejected")}>Rechazar</button>
                      </>
                    )}
                    {a.status === "accepted" && (
                      <button className="btn-ghost text-sm" onClick={() => sendReminder(a)}>Enviar recordatorio</button>
                    )}
                  </div>

                  {(a.status === "accepted" || a.status === "completed") && (
                    <div className="w-full border-t border-line mt-2 pt-3 flex flex-wrap items-center gap-2">
                      <span className={`badge-verified ${a.status === "completed" ? "badge-ok" : "badge-pending"}`}>
                        {a.status === "completed" ? "Finalizada" : "Pendiente de finalizar"}
                      </span>
                      <input
                        type="number"
                        className="input w-28 text-sm"
                        placeholder={String(a.services?.price ?? 0)}
                        defaultValue={a.paid_amount ?? a.services?.price ?? ""}
                        onChange={(e) => setAmountDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                      />
                      <button className="btn-primary text-sm" onClick={() => confirmPaidAmount(a)}>
                        {a.status === "completed" ? "Corregir valor" : "Marcar como finalizada"}
                      </button>
                      {a.status === "completed" && (
                        <button className="btn-ghost text-sm" onClick={() => markPending(a)}>Volver a pendiente</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
