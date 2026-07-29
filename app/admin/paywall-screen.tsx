"use client";

import { useState } from "react";
import { ACTIVATION_WHATSAPP_LINK } from "@/lib/config";

const BENEFICIOS = [
  "Enlace público propio para que tus clientes agenden solos, 24/7",
  "Cero dobles reservas: el sistema bloquea los cruces de horario por ti",
  "Panel con KPIs reales: ingresos, citas atendidas, servicio más pedido",
  "Soporte directo por WhatsApp con el equipo de MANALF",
];

export default function PaywallScreen({ businessName }: { businessName?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="glow-orb w-[420px] h-[420px] bg-accent -top-24 -left-24 fixed animate-float" />
      <div className="glow-orb w-[360px] h-[360px] bg-cyan -bottom-24 -right-10 fixed animate-float-slow" />

      <div className="glass-strong max-w-md w-full p-8 relative text-center">
        {!expanded ? (
          <div className="animate-fade-in">
            <p className="eyebrow mb-2">Turnex · By MANALF</p>
            <h1 className="font-display text-2xl font-semibold text-white mb-3">
              {businessName ? `${businessName}, tu negocio está casi listo` : "Tu negocio está casi listo"}
            </h1>
            <p className="text-muted text-sm leading-relaxed mb-7">
              Para activar tu enlace público y el panel completo, primero necesitas registrar
              tu membresía con nosotros. Es un paso rápido.
            </p>
            <button className="btn-primary w-full" onClick={() => setExpanded(true)}>
              Ver beneficios y valor
            </button>
          </div>
        ) : (
          <div className="animate-fade-in text-left">
            <p className="eyebrow mb-2 text-center">Todo lo que obtienes con Turnex</p>
            <ul className="space-y-2.5 my-5">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm text-[#EDE9F7]">
                  <span className="text-accentSoft mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-line pt-5 text-center">
              <p className="font-display text-3xl font-semibold text-white">
                $35.000<span className="text-muted text-sm font-body font-normal"> COP/mes</span>
              </p>
              <p className="text-muted text-xs mt-1">≈ US$11 · o $300.000 COP/año (3 meses gratis)</p>
              <p className="text-muted text-xs mt-1">Un solo plan, todas las funciones activas.</p>
            </div>

            <a
              href={ACTIVATION_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block mt-6"
            >
              Solicitar mi usuario
            </a>
            <p className="text-muted text-xs text-center mt-3">
              Te contactaremos personalmente por WhatsApp para activar tu cuenta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
