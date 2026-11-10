import { IconLogo, IconInicio, IconCuenta, IconTransferencia, IconLista } from './Icons.jsx';

const iniciales = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '··';

const claseEnlace =
  'relative flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/60 transition hover:text-white';

export default function Navbar({ cuentas, cuentaActual, onCambiarCuenta, deshabilitado, titular, onTransferir }) {
  return (
    <header className="sticky top-0 z-30 bg-bosque-900 text-white shadow-lg shadow-bosque-950/20 animate-slide-down">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <a href="#inicio" className="group flex items-center gap-2.5">
          <span className="rounded-xl bg-lima-400 p-1.5 text-bosque-900 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
            <IconLogo className="h-6 w-6" />
          </span>
          <span className="flex items-start gap-1 text-xl font-extrabold tracking-tight">
            Nexo
            <span className="mt-1 text-[8px] font-semibold uppercase tracking-widest text-white/60">Banco</span>
          </span>
        </a>

        <nav className="order-last flex w-full items-center overflow-x-auto pb-1 md:order-none md:w-auto md:overflow-visible md:pb-0">
          <a href="#inicio" className={`${claseEnlace} !text-white after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-lima-400`}>
            <IconInicio /> Inicio
          </a>
          <a href="#saldo" className={claseEnlace}>
            <IconCuenta /> Cuentas
          </a>
          <button type="button" onClick={onTransferir} className={claseEnlace}>
            <IconTransferencia className="h-4 w-4" /> Transferir
          </button>
          <a href="#movimientos" className={claseEnlace}>
            <IconLista /> Movimientos
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center">
            <span className="sr-only">Cuenta</span>
            <select
              value={cuentaActual}
              onChange={(e) => onCambiarCuenta(e.target.value)}
              disabled={deshabilitado}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white outline-none transition focus:ring-2 focus:ring-lima-400 disabled:opacity-60"
            >
              {cuentas.map((c) => (
                <option key={c} value={c} className="text-bosque-900">{c}</option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lima-400 text-xs font-extrabold text-bosque-900">
              {iniciales(titular)}
            </span>
            <span className="hidden leading-tight lg:block">
              <span className="block text-xs font-bold">{titular || 'Cliente'}</span>
              <span className="block text-[10px] text-white/50">Cliente personal</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
