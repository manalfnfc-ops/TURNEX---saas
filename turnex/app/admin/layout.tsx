import Link from "next/link";
import LogoutButton from "./logout-button";
import { createServerSupabase } from "@/lib/supabase/server";
import { ACTIVATION_WHATSAPP_LINK } from "@/lib/config";

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
            <a href={ACTIVATION_WHATSAPP_LINK} target="_blank" className="btn-primary inline-block">
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

  const NAV_ITEMS = [
    { href: "/admin/citas", icon: "📋", label: "Citas" },
    { href: "/admin/servicios", icon: "🛠️", label: "Servicios" },
    { href: "/admin/onboarding", icon: "🏠", label: "Mi negocio" },
    { href: "/admin/kpis", icon: "📊", label: "KPIs" },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-line p-5 hidden md:flex flex-col justify-between glass !rounded-none !border-y-0 !border-l-0">
        <div>
          <p className="eyebrow mb-1">MANALF</p>
          <p className="font-display font-semibold text-xl mb-8 bg-gradient-to-r from-accentSoft to-cyan bg-clip-text text-transparent">TURNEX</p>
          <nav className="space-y-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition">
                {item.icon} {item.label === "Servicios" ? "Servicios y equipo" : item.label}
              </Link>
            ))}
            {isSuper && <Link href="/super-admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition text-accent">⚡ Super Admin</Link>}
          </nav>
        </div>
        <LogoutButton />
      </aside>

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">{children}</main>

      {/* Navegación rápida móvil: siempre visible, acceso directo a las 4 secciones */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass !rounded-none border-t border-line flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[0.65rem] text-muted hover:text-white transition">
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
