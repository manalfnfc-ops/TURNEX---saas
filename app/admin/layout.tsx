import Link from "next/link";
import LogoutButton from "./logout-button";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <>{children}</>; // deja pasar /admin/login sin sesión

  const { data: isSuper } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!isSuper) {
    const { data: business } = await supabase
      .from("businesses")
      .select("plan_status, name")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (business?.plan_status === "inactive") {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="card p-8 max-w-sm text-center">
            <p className="eyebrow mb-3">Cuenta desactivada</p>
            <h1 className="font-display text-2xl font-semibold text-white mb-3">
              Tu membresía venció
            </h1>
            <p className="text-muted text-sm mb-6">
              {business.name}, tu enlace público está pausado hasta que renueves tu plan.
              Tus datos y citas siguen guardados — no se pierde nada.
            </p>
            <a
              href="https://wa.me/57XXXXXXXXXX?text=Quiero%20renovar%20mi%20membresía%20de%20Turnex"
              target="_blank"
              className="btn-primary inline-block"
            >
              Renovar membresía
            </a>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-line p-5 hidden md:flex flex-col justify-between glass !rounded-none !border-y-0 !border-l-0">
        <div>
          <p className="eyebrow mb-1">MANALF</p>
          <p className="font-display font-semibold text-xl mb-8 bg-gradient-to-r from-accentSoft to-cyan bg-clip-text text-transparent">TURNEX</p>
          <nav className="space-y-1 text-sm">
            <Link href="/admin/citas" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition">📋 Citas</Link>
            <Link href="/admin/servicios" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition">🛠️ Servicios y equipo</Link>
            <Link href="/admin/onboarding" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition">🏠 Mi negocio</Link>
            <Link href="/admin/kpis" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition">📊 KPIs</Link>
            {isSuper && <Link href="/super-admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition text-accent">⚡ Super Admin</Link>}
          </nav>
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
