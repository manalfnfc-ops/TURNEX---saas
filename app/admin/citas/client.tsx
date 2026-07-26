"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ESTADO_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  postponed: "Pospuesta",
  cancelled: "Cancelada",
};

const ESTADO_COLOR: Record<string, string> = {
  pending: "text-warn",
  accepted: "text-ok",
  rejected: "text-danger",
  postponed: "text-accent2",
  cancelled: "text-muted",
};

export default function CitasClient({ businessId, initialAppointments, workers }: any) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const supabase = createClient();

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev: any) => prev.map((a: any) => (a.id === id ? { ...a, status } : a)));
  }

  async function assignWorker(id: string, workerId: string) {
    await supabase.from("appointments").update({ worker_id: workerId || null }).eq("id", id);
    setAppointments((prev: any) => prev.map((a: any) => (a.id === id ? { ...a, worker_id: workerId } : a)));
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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-4">Citas</h1>
      <div className="space-y-3">
        {appointments.length === 0 && <p className="text-muted text-sm">Aún no hay solicitudes de cita.</p>}
        {appointments.map((a: any) => (
          <div key={a.id} className="card p-4 flex flex-wrap justify-between gap-3 items-center">
            <div>
              <p className="font-medium">{a.client_name} — {a.services?.name}</p>
              <p className="text-muted text-sm">{new Date(a.starts_at).toLocaleString("es-CO")}</p>
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
          </div>
        ))}
      </div>
    </div>
  );
}
