"use client";

import { useMemo, useState } from "react";
import { generateDaySlots, type BusinessHour, type BusySlot } from "@/lib/availability";

type Service = { id: string; name: string; description: string | null; price: number; duration_minutes: number };
type Worker = { id: string; name: string };
type Business = { id: string; name: string; niche: string | null; description: string | null; address: string | null; phone: string | null; timezone: string };

export default function BookingFlow({
  business,
  services,
  workers,
  hours,
}: {
  business: Business;
  services: Service[];
  workers: Worker[];
  hours: BusinessHour[];
}) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [workerId, setWorkerId] = useState<string>("any");
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadSlots(date: string, svc: Service) {
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, date, durationMinutes: svc.duration_minutes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar disponibilidad");
      setSlots(data.slots);
    } catch (e: any) {
      setError(e.message);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function pickService(svc: Service) {
    setService(svc);
    setStep(2);
  }

  function goToSchedule() {
    setStep(3);
    if (service) loadSlots(dateStr, service);
  }

  async function submitBooking() {
    if (!service || !selectedSlot) return;
    if (!form.email && !form.phone) {
      setError("Deja al menos un correo o un teléfono para confirmarte la cita.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: service.id,
          workerId: workerId === "any" ? null : workerId,
          startsAt: selectedSlot,
          durationMinutes: service.duration_minutes,
          clientName: form.name,
          clientEmail: form.email || null,
          clientPhone: form.phone || null,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ese horario ya no está disponible, elige otro.");
      setTicket(data.appointment);
      setStep(5);
    } catch (e: any) {
      setError(e.message);
      // Refresca disponibilidad porque probablemente alguien más tomó el cupo
      if (service) loadSlots(dateStr, service);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`mx-auto px-4 py-10 transition-all ${step === 3 ? "max-w-3xl" : "max-w-2xl"}`}>
      <header className="mb-8">
        <p className="eyebrow">{business.niche || "Agenda de citas"}</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mt-1 text-white">{business.name}</h1>
        {business.description && <p className="text-muted mt-2 text-sm">{business.description}</p>}
      </header>

      <StepIndicator step={step} />

      {step === 1 && (
        <section className="space-y-3 mt-6">
          <h2 className="font-display text-lg font-semibold">Elige un servicio</h2>
          {services.length === 0 && <p className="text-muted text-sm">Este negocio aún no tiene servicios publicados.</p>}
          {services.map((s) => (
            <button key={s.id} onClick={() => pickService(s)} className="card w-full text-left p-4 flex justify-between items-center hover:border-accent transition">
              <div>
                <p className="font-medium">{s.name}</p>
                {s.description && <p className="text-muted text-sm mt-0.5">{s.description}</p>}
                <p className="text-muted text-xs mt-1">{s.duration_minutes} min</p>
              </div>
              <p className="font-display text-accent font-semibold">${s.price.toLocaleString("es-CO")}</p>
            </button>
          ))}
        </section>
      )}

      {step === 2 && service && (
        <section className="space-y-4 mt-6">
          <h2 className="font-display text-lg font-semibold">¿Con quién prefieres tu cita?</h2>
          <p className="text-muted text-sm">Es solo una preferencia informativa; no cambia los horarios disponibles.</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setWorkerId("any")} className={`slot-btn ${workerId === "any" ? "selected" : ""}`}>
              Cualquiera disponible
            </button>
            {workers.map((w) => (
              <button key={w.id} onClick={() => setWorkerId(w.id)} className={`slot-btn ${workerId === w.id ? "selected" : ""}`}>
                {w.name}
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="btn-ghost">Atrás</button>
            <button onClick={goToSchedule} className="btn-primary">Elegir horario</button>
          </div>
        </section>
      )}

      {step === 3 && service && (
        <section className="space-y-5 mt-6">
          <h2 className="font-display text-lg font-semibold">Elige día y hora</h2>

          <div className="card p-4 md:p-6">
            {/* Tira de próximos días — atajo visual, misma lógica de disponibilidad de siempre */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {nextDays(14).map((d) => {
                const isSelected = d.iso === dateStr;
                return (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setDateStr(d.iso);
                      setSelectedSlot(null);
                      loadSlots(d.iso, service);
                    }}
                    className={`flex flex-col items-center min-w-[56px] py-2.5 rounded-xl border transition ${
                      isSelected
                        ? "bg-gradient-to-b from-accent to-accent2 border-transparent text-white shadow-glow"
                        : "border-line hover:border-accent/50"
                    }`}
                  >
                    <span className="text-[0.65rem] uppercase text-muted font-mono">{d.dayLabel}</span>
                    <span className="font-display text-lg font-semibold">{d.dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-3">
              <input
                type="date"
                className="input w-auto text-sm"
                value={dateStr}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  setSelectedSlot(null);
                  loadSlots(e.target.value, service);
                }}
              />
            </div>

            <div className="border-t border-line my-5" />

            {loadingSlots && <p className="text-muted text-sm">Cargando horarios disponibles…</p>}
            {error && <p className="text-danger text-sm">{error}</p>}
            {!loadingSlots && slots.length === 0 && !error && (
              <p className="text-muted text-sm">No hay horarios disponibles este día. Prueba otra fecha.</p>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {slots.map((s) => {
                const label = new Date(s.time).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
                return (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    className={`slot-btn ${selectedSlot === s.time ? "selected" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="btn-ghost">Atrás</button>
            <button disabled={!selectedSlot} onClick={() => setStep(4)} className="btn-primary">Continuar</button>
          </div>
        </section>
      )}

      {step === 4 && service && selectedSlot && (
        <section className="space-y-4 mt-6">
          <h2 className="font-display text-lg font-semibold">Tus datos</h2>
          <div className="card p-4 text-sm">
            <p><span className="text-muted">Servicio:</span> {service.name}</p>
            <p><span className="text-muted">Fecha:</span> {new Date(selectedSlot).toLocaleString("es-CO")}</p>
          </div>
          <input className="input" placeholder="Nombre completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Correo (opcional si dejas teléfono)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Teléfono (opcional si dejas correo)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <textarea className="input" placeholder="Motivo o detalle breve de la cita" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(3)} className="btn-ghost">Atrás</button>
            <button disabled={submitting || !form.name} onClick={submitBooking} className="btn-primary">
              {submitting ? "Enviando…" : "Confirmar solicitud"}
            </button>
          </div>
        </section>
      )}

      {step === 5 && ticket && (
        <section className="mt-10 ticket-wrap max-w-sm mx-auto">
          <div className="ticket p-0 overflow-hidden">
            <div className="ticket-brand-strip" />
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="eyebrow">Comprobante de cita</p>
                  <h2 className="font-display text-2xl font-semibold mt-1 text-white">{business.name}</h2>
                </div>
                <span className="text-[10px] font-mono text-accentSoft tracking-widest">TURNEX</span>
              </div>
              <div className="text-sm text-muted mt-1 space-y-0.5">
                {business.niche && <p className="text-accentSoft text-xs uppercase tracking-wide">{business.niche}</p>}
                {business.address && <p>{business.address}</p>}
                {business.phone && <p>{business.phone}</p>}
              </div>

              <div className="ticket-perforation my-5">
                <div className="ticket-notch left" />
                <div className="ticket-notch right" />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted">Servicio</span>
                <span className="font-medium">{service?.name}</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-muted">Precio</span>
                <span className="font-medium">${service?.price.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-muted">Fecha</span>
                <span className="ticket-code text-sm">
                  {new Date(ticket.starts_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-muted">Atiende</span>
                <span className="font-medium">{workers.find((w) => w.id === workerId)?.name ?? "Cualquiera disponible"}</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-muted">A nombre de</span>
                <span className="font-medium">{form.name}</span>
              </div>

              <div className="flex justify-between items-end mt-6">
                <span className="ticket-code text-xs text-muted">N.º {ticket.id?.slice(0, 8).toUpperCase()}</span>
                <span className="badge-verified badge-pending">Pendiente</span>
              </div>
            </div>
          </div>
          <p className="text-muted text-xs text-center mt-4">
            Guarda una captura de este comprobante. Te avisaremos cuando el negocio la confirme.
          </p>
        </section>
      )}
    </main>
  );
}

function nextDays(count: number) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      dayLabel: d.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", ""),
      dayNum: d.getDate(),
    });
  }
  return out;
}

function StepIndicator({ step }: { step: number }) {
  const labels = ["Servicio", "Profesional", "Horario", "Datos", "Listo"];
  return (
    <div className="flex gap-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
      {labels.map((l, i) => (
        <span key={l} className={`flex-1 pb-2 border-b-2 ${i + 1 <= step ? "border-accent text-white" : "border-line"}`}>
          {l}
        </span>
      ))}
    </div>
  );
}
