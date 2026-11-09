const formatoMoneda = (valor, moneda) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda || 'USD' }).format(valor);

const colorEstado = {
  ACTIVA: 'bg-esmeralda-500/20 text-emerald-300',
  INACTIVA: 'bg-slate-400/20 text-slate-200',
  BLOQUEADA: 'bg-red-500/20 text-red-300',
};

export default function SaldoCard({ cuenta }) {
  return (
    <section id="dashboard" className="scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-marino-900 via-marino-800 to-marino-700 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-300">Saldo disponible</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {formatoMoneda(cuenta.saldo, cuenta.moneda)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorEstado[cuenta.estado] || colorEstado.INACTIVA}`}>
          {cuenta.estado}
        </span>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">Titular</dt>
          <dd className="mt-1 font-semibold">{cuenta.titular}</dd>
        </div>
        <div>
          <dt className="text-slate-400">N.º de cuenta</dt>
          <dd className="mt-1 font-mono font-semibold">{cuenta.numeroCuenta}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Moneda</dt>
          <dd className="mt-1 font-semibold">{cuenta.moneda}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Cliente desde</dt>
          <dd className="mt-1 font-semibold">{new Date(cuenta.fechaCreacion).toLocaleDateString('es-PE')}</dd>
        </div>
      </dl>
    </section>
  );
}
