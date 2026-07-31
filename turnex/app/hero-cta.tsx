"use client";

import { useState } from "react";
import Link from "next/link";
import { ACTIVATION_WHATSAPP_LINK } from "@/lib/config";

const BENEFICIOS = [
  "Enlace público propio para que tus clientes agenden solos, 24/7",
  "Cero dobles reservas: el sistema bloquea los cruces de horario por ti",
  "Panel con KPIs reales: ingresos, citas atendidas, servicio más pedido",
  "Soporte directo por WhatsApp con el equipo de MANALF",
];

export default function HeroCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Crear mi negocio
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-strong max-w-md w-full p-8 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-muted hover:text-white text-sm"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <p className="eyebrow mb-2 text-center">Turnex · By MANALF</p>
            <h2 className="font-display text-2xl font-semibold text-white mb-3 text-center">
              Activemos tu negocio
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-5 text-center">
              Turnex funciona con activación personalizada: nosotros mismos preparamos tu
              cuenta para que empieces sin fricciones.
            </p>

            <ul className="space-y-2.5 mb-6">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm text-[#EDE9F7]">
                  <span className="text-accentSoft mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-line pt-4 text-center mb-6">
              <p className="font-display text-2xl font-semibold text-white">
                $35.000<span className="text-muted text-sm font-body font-normal"> COP/mes</span>
              </p>
              <p className="text-muted text-xs mt-1">≈ US$11 · o $300.000 COP/año (3 meses gratis)</p>
            </div>

            <a
              href={ACTIVATION_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block"
            >
              Solicitar mi usuario
            </a>
            <Link href="/admin/login" className="btn-ghost w-full text-center block mt-3">
              Ya tengo usuario — Acceder
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
