"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SuperAdminClient({ businesses, stats }: any) {
  const [list, setList] = useState(businesses);
  const supabase = createClient();

  async function setStatus(id: string, plan_status: string) {
    await supabase.from("businesses").update({ plan_status }).eq("id", id);
    setList((prev: any) => prev.map((b: any) => (b.id === id ? { ...b, plan_status } : b)));
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6">Panel Super Admin</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Kpi label="Negocios totales" value={stats.total} />
        <Kpi label="Activos" value={stats.activos} />
        <Kpi label="En demo" value={stats.demo} />
        <Kpi label="Inactivos" value={stats.inactivos} />
      </div>

      <div className="space-y-2">
        {list.map((b: any) => (
          <div key={b.id} className="card p-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="font-medium">{b.name} <span className="text-muted text-xs">/{b.slug}</span></p>
              <p className="text-muted text-xs">
                Estado: <span className={
                  b.plan_status === "active" ? "text-ok" : b.plan_status === "demo" ? "text-warn" : "text-danger"
                }>{b.plan_status}</span>
                {b.plan_status === "demo" && b.demo_expires_at && (
                  <> · demo vence {new Date(b.demo_expires_at).toLocaleDateString("es-CO")}</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-xs" onClick={() => setStatus(b.id, "active")}>Activar</button>
              <button className="btn-ghost text-xs" onClick={() => setStatus(b.id, "demo")}>Poner en demo</button>
              <button className="btn-ghost text-xs text-danger" onClick={() => setStatus(b.id, "inactive")}>Desactivar</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-muted text-xs">{label}</p>
      <p className="font-display text-2xl font-semibold text-accent mt-1">{value}</p>
    </div>
  );
}
