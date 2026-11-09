import { IconBanco } from './Icons.jsx';

const enlaces = [
  { href: '#dashboard', texto: 'Dashboard' },
  { href: '#operaciones', texto: 'Operaciones' },
  { href: '#historial', texto: 'Historial' },
];

export default function Navbar({ cuentas, cuentaActual, onCambiarCuenta, deshabilitado }) {
  return (
    <header className="sticky top-0 z-30 bg-marino-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <a href="#dashboard" className="flex items-center gap-2">
          <span className="rounded-xl bg-esmeralda-500 p-2 text-white">
            <IconBanco />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Banco <span className="text-esmeralda-500">Nova</span>
          </span>
        </a>

        <nav className="order-3 flex w-full justify-center gap-1 text-sm font-medium sm:order-none sm:w-auto">
          {enlaces.map((e) => (
            <a key={e.href} href={e.href} className="rounded-lg px-3 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white">
              {e.texto}
            </a>
          ))}
        </nav>

        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-slate-300 sm:inline">Cuenta</span>
          <select
            value={cuentaActual}
            onChange={(e) => onCambiarCuenta(e.target.value)}
            disabled={deshabilitado}
            className="rounded-lg border border-white/20 bg-marino-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-esmeralda-500 disabled:opacity-60"
          >
            {cuentas.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
