const USD_RATE = 3219; // referencial, tasa COP/USD del día en que se escribió esto

function usd(cop: number) {
  return (cop / USD_RATE).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function PricingCards({ businessId }: { businessId: string }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
      <PlanCard
        label="Mensual"
        cop={35000}
        note="Pago recurrente cada mes"
        href={`https://checkout.wompi.co/p/?reference=${businessId}:monthly`}
      />
      <PlanCard
        label="Anual"
        cop={300000}
        note="3 meses gratis frente al mensual"
        featured
        href={`https://checkout.wompi.co/p/?reference=${businessId}:annual`}
      />
    </div>
  );
}

function PlanCard({
  label,
  cop,
  note,
  href,
  featured,
}: {
  label: string;
  cop: number;
  note: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div className={`card p-6 relative ${featured ? "card-glow" : ""}`}>
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-verified badge-ok">
          Mejor precio
        </span>
      )}
      <p className="eyebrow mb-3">{label}</p>
      <p className="font-display text-3xl font-semibold text-white">
        ${cop.toLocaleString("es-CO")}
        <span className="text-muted text-sm font-body font-normal"> COP</span>
      </p>
      <p className="text-muted text-xs mt-1">
        ≈ US${usd(cop)} <span className="opacity-70">(referencial)</span>
      </p>
      <p className="text-muted text-xs mt-3">{note}</p>
      <a href={href} target="_blank" className="btn-primary inline-block w-full text-center mt-5">
        Pagar y activar
      </a>
    </div>
  );
}
