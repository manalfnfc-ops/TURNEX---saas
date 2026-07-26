import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-16 md:mb-24">
          <span className="eyebrow">MANALF · Turnex</span>
          <Link href="/admin/login" className="btn-ghost text-sm">Entrar al panel</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Columna de texto */}
          <div>
            <p className="eyebrow mb-4">Agenda de citas, sin llamadas ni mensajes cruzados</p>
            <h1 className="font-display text-[2.75rem] md:text-6xl leading-[1.05] font-semibold text-paper">
              Tu cliente reserva.
              <br />
              Tú solo confirmas.
            </h1>
            <p className="text-muted mt-6 text-base md:text-lg max-w-md leading-relaxed">
              Turnex le da a tu barbería o salón un enlace propio donde cada cliente ve
              los cupos reales del día y agenda solo. Tú aceptas, rechazas o pospones
              con un toque — el comprobante queda listo para que lo guarde como una
              boleta.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/admin/login" className="btn-primary">Crear mi negocio</Link>
              <Link href="#como-funciona" className="btn-ghost">Ver cómo funciona</Link>
            </div>

            <dl className="flex gap-8 mt-14 pt-8 border-t border-line">
              <div>
                <dt className="eyebrow mb-1">Sin doble reserva</dt>
                <dd className="text-sm text-muted">Bloqueado a nivel de base de datos</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">Un solo plan</dt>
                <dd className="text-sm text-muted">$35.000 COP/mes, todo incluido</dd>
              </div>
            </dl>
          </div>

          {/* El ticket — elemento firma */}
          <div className="ticket-wrap justify-self-center">
            <div className="ticket w-[300px] p-6 -rotate-2">
              <p className="eyebrow !text-[#8A7A55]">Comprobante de cita</p>
              <h2 className="font-display text-2xl font-semibold mt-1">Barbería El Corte</h2>
              <p className="text-sm text-[#5c5343] mt-0.5">Cra. 14 #23–08, Popayán</p>

              <div className="ticket-perforation my-5">
                <div className="ticket-notch left" />
                <div className="ticket-notch right" />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#5c5343]">Servicio</span>
                <span className="font-medium">Corte + barba</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-[#5c5343]">Fecha</span>
                <span className="ticket-code text-sm">10 JUL · 3:30 PM</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-[#5c5343]">Atiende</span>
                <span className="font-medium">Cualquiera disponible</span>
              </div>

              <div className="flex justify-between items-end mt-6">
                <span className="ticket-code text-xs text-[#8A7A55]">N.º 00842</span>
                <div className="stamp">
                  <span>Cita</span>
                  <span className="stamp-big">Confirmada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mt-28 md:mt-36 grid md:grid-cols-3 gap-6">
          <Step
            eyebrow="Paso 1"
            title="Comparte tu enlace"
            text="Cada negocio tiene una página propia: nombre, servicios, precios y horario. Se comparte como cualquier link."
          />
          <Step
            eyebrow="Paso 2"
            title="El cliente elige su cupo"
            text="Ve solo los horarios realmente libres, según la duración del servicio que escoja. Nada de agendas cruzadas."
          />
          <Step
            eyebrow="Paso 3"
            title="Tú decides"
            text="Aceptas, rechazas o pospones desde tu panel. Al aceptar, asignas quién atiende. El cliente recibe su comprobante."
          />
        </section>

        <footer className="mt-28 pt-8 border-t border-line flex justify-between text-xs text-muted">
          <span>MANALF © {new Date().getFullYear()}</span>
          <span>Hecho para barberías y salones de Colombia</span>
        </footer>
      </div>
    </main>
  );
}

function Step({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="card p-6">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h3 className="font-display text-xl font-semibold text-paper mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}
