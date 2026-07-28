import Link from "next/link";

const BENEFICIOS = [
  { titulo: "Sin doble reserva", texto: "Bloqueado a nivel de base de datos: dos clientes nunca pueden tomar el mismo cupo." },
  { titulo: "Tu cliente se agenda solo", texto: "Ve tus horarios reales y reserva sin llamadas ni mensajes cruzados." },
  { titulo: "Tú decides", texto: "Aceptas, rechazas o pospones cada solicitud con un toque, desde cualquier lugar." },
  { titulo: "Números claros", texto: "Ingresos, citas atendidas y horarios más pedidos, en un panel simple." },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-14 md:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        <div className="flex items-center justify-between mb-16 md:mb-24">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent shadow-glow" />
            <span className="eyebrow">TURNEX · By MANALF</span>
          </div>
          <Link href="/admin/login" className="btn-ghost text-sm">Entrar al panel</Link>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] gradient-text">
            Agenda de citas para cualquier negocio con turnos
          </h1>
          <p className="text-muted mt-6 text-base md:text-lg leading-relaxed">
            Un enlace propio, un calendario que se cuida solo, y un panel donde controlas
            cada solicitud. Barbería, spa, consultorio, taller o estudio — Turnex se adapta.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-9">
            <Link href="/admin/login" className="btn-primary">Crear mi negocio</Link>
            <Link href="#beneficios" className="btn-ghost">Ver beneficios</Link>
          </div>
        </div>

        {/* Vista previa del ticket, como pieza visual */}
        <div className="ticket-wrap max-w-xs mx-auto mb-20 -rotate-2">
          <div className="ticket p-5">
            <p className="eyebrow">Comprobante de cita</p>
            <h3 className="font-display text-lg font-semibold mt-1">Estudio Aurora</h3>
            <div className="ticket-perforation my-4">
              <div className="ticket-notch left" />
              <div className="ticket-notch right" />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>10 JUL · 3:30 PM</span>
              <span className="badge-verified badge-pending">Pendiente</span>
            </div>
          </div>
        </div>

        <section id="beneficios" className="grid sm:grid-cols-2 gap-5">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="card p-5">
              <h3 className="font-display text-lg font-semibold text-white mb-1.5">{b.titulo}</h3>
              <p className="text-sm text-muted leading-relaxed">{b.texto}</p>
            </div>
          ))}
        </section>

        <footer className="mt-24 pt-8 border-t border-line flex justify-between text-xs text-muted">
          <span>MANALF © {new Date().getFullYear()}</span>
          <span>TURNEX — agendamiento sin fricción</span>
        </footer>
      </div>
    </main>
  );
}
