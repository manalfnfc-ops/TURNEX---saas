"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingForm({ business, hours, dias }: { business: any; hours: any[]; dias: string[] }) {
  const [form, setForm] = useState({
    name: business.name || "",
    niche: business.niche || "",
    description: business.description || "",
    address: business.address || "",
    phone: business.phone || "",
    email: business.email || "",
  });
  const [dayHours, setDayHours] = useState(hours);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    const supabase = createClient();

    await supabase.from("businesses").update(form).eq("id", business.id);

    await supabase
      .from("business_hours")
      .upsert(
        dayHours.map((h) => ({ ...h, business_id: business.id })),
        { onConflict: "business_id,weekday" }
      );

    setSaving(false);
    setSavedMsg("Guardado.");
    router.refresh();
  }

  function updateDay(weekday: number, patch: Partial<any>) {
    setDayHours((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-3">
        <h2 className="font-display font-semibold">Datos generales</h2>
        <input className="input" placeholder="Nombre del negocio" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Nicho (ej. barbería, salón de uñas)" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
        <textarea className="input" placeholder="Descripción breve" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input className="input" placeholder="Teléfono de contacto" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Correo de contacto" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-display font-semibold mb-2">Horario de atención</h2>
        {dayHours.map((h) => (
          <div key={h.weekday} className="flex items-center gap-3 text-sm">
            <span className="w-24 text-muted">{dias[h.weekday]}</span>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={!h.is_closed} onChange={(e) => updateDay(h.weekday, { is_closed: !e.target.checked })} />
              Abierto
            </label>
            {!h.is_closed && (
              <>
                <input type="time" className="input w-28" value={h.open_time?.slice(0, 5)} onChange={(e) => updateDay(h.weekday, { open_time: e.target.value })} />
                <span className="text-muted">a</span>
                <input type="time" className="input w-28" value={h.close_time?.slice(0, 5)} onChange={(e) => updateDay(h.weekday, { close_time: e.target.value })} />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={saving} onClick={save}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {savedMsg && <span className="text-ok text-sm">{savedMsg}</span>}
      </div>
    </div>
  );
}
