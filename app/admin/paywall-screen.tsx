export default function PaywallScreen({ businessId }: { businessId: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glow-orb w-[400px] h-[400px] bg-accent -top-20 -left-20 fixed" />
      <div className="card card-glow p-8 max-w-sm text-center relative">
        <p className="eyebrow mb-2">Un solo plan, todo incluido</p>
        <h1 className="font-display text-2xl font-semibold mb-4">Activa tu negocio en Turnex</h1>
        <div className="flex items-baseline justify-center gap-1 mb-1">
          <span className="font-display text-4xl font-semibold">$35.000</span>
          <span className="text-muted text-sm">COP/mes</span>
        </div>
        <p className="text-muted text-xs mb-6">o $300.000 COP/año (3 meses gratis)</p>
        <a
          href={`https://checkout.wompi.co/p/?reference=${businessId}:monthly`}
          target="_blank"
          className="btn-primary inline-block w-full"
        >
          Pagar y activar
        </a>
        <p className="text-muted text-xs mt-4">
          Al pagar, tu negocio se activa automáticamente en unos segundos.
        </p>
      </div>
    </div>
  );
}
