"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

export default function OnboardingForm({ business, hours, dias }: { business: any; hours: any[]; dias: string[] }) {
  const [form, setForm] = useState({
    name: business.name || "",
    niche: business.niche || "",
    description: business.description || "",
    address: business.address || "",
    phone: business.phone || "",
    email: business.email || "",
    instagram: business.instagram || "",
    website: business.website || "",
    notes: business.notes || "",
  });
  const [slug, setSlug] = useState(business.slug || "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [dayHours, setDayHours] = useState(hours);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${slug}` : `/${slug}`;

  const fieldsToCheck = [form.name, form.niche, form.description, form.address, form.phone];
  const completion = Math.round((fieldsToCheck.filter(Boolean).length / fieldsToCheck.length) * 100);

  function handleNameChange(value: string) {
    setForm({ ...form, name: value });
    // Mientras el dueño no edite el enlace a mano, se genera solo desde el nombre real.
    if (!slugTouched) setSlug(slugify(value));
  }

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    setSlugError(null);
    const supabase = createClient();
    const cleanSlug = slugify(slug) || business.slug;

    const { error: businessError } = await supabase
      .from("businesses")
      .update({ ...form, slug: cleanSlug })
      .eq("id", business.id);

    if (businessError) {
      setSaving(false);
      if (businessError.code === "23505") {
        setSlugError("Ese enlace ya está en uso, prueba con otro.");
      } else {
        setSlugError("No se pudo guardar: " + businessError.message);
      }
      return;
    }

    setSlug(cleanSlug);

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

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: form.name || "Mi negocio en Turnex", url: publicUrl });
      } catch {
        // el usuario cerró el cuadro de compartir, no hay nada que hacer
      }
    } else {
      copyLink();
    }
  }

  function updateDay(weekday: number, patch: Partial<any>) {
    setDayHours((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted">Perfil del negocio</span>
            <span className="font-mono text-accentSoft">{completion}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent2 via-accent to-cyan transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        {completion === 100 && <span className="badge-verified badge-ok">Listo</span>}
      </div>

      <div className="card card-glow p-5 text-center">
        <p className="eyebrow mb-2">Tu enlace público</p>
        <h2 className="font-display text-lg font-semibold text-white mb-2">Comparte tu negocio con tus clientes</h2>
        <p className="text-muted text-sm mb-4 max-w-sm mx-auto">
          Al compartir este enlace, cualquier persona puede ver tus servicios, tus horarios
          y agendar una cita sola — sin necesidad de crear una cuenta.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button className="btn-primary" onClick={copyLink} type="button">
            {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
          <button className="btn-ghost" onClick={shareLink} type="button">
            Compartir
          </button>
        </div>

        <details className="mt-5 text-left">
          <summary className="text-xs text-muted cursor-pointer select-none">Personalizar enlace</summary>
          <div className="flex gap-2 items-center mt-2">
            <span className="text-muted text-xs hidden sm:inline">{typeof window !== "undefined" ? window.location.origin : ""}/</span>
            <input
              className="input flex-1"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="mi-negocio"
            />
          </div>
          {slugError && <p className="text-danger text-xs mt-1">{slugError}</p>}
          <p className="text-muted text-xs mt-1">Solo letras, números y guiones. Se ajusta automáticamente al guardar.</p>
        </details>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-display font-semibold text-white">Datos generales</h2>
        <input className="input" placeholder="Nombre del negocio" value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
        <input className="input" placeholder="Tipo de negocio (ej. barbería, spa, clínica, taller)" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
        <textarea className="input" placeholder="Descripción breve" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input className="input" placeholder="Teléfono de contacto" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Correo de contacto" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-display font-semibold text-white">Presencia digital <span className="text-muted text-xs font-body font-normal">(opcional)</span></h2>
        <input className="input" placeholder="Instagram (ej. @minegocio)" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
        <input className="input" placeholder="Sitio web" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <textarea className="input" placeholder="Notas internas (solo las ves tú, no el cliente)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-display font-semibold mb-2 text-white">Horario de atención</h2>
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
