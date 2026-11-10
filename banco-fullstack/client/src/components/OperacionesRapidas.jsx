import { IconDeposito, IconRetiro, IconTransferencia, IconMas, IconFlecha } from './Icons.jsx';

const acciones = [
  { tipo: 'DEPOSITO', titulo: 'Depositar', detalle: 'Agregar fondos', icono: IconDeposito, tile: 'bg-lima-300/50 text-bosque-700' },
  { tipo: 'RETIRO', titulo: 'Retirar', detalle: 'Retirar fondos', icono: IconRetiro, tile: 'bg-red-100 text-red-500' },
  { tipo: 'TRANSFERENCIA', titulo: 'Transferir', detalle: 'A otra cuenta', icono: IconTransferencia, tile: 'bg-sky-100 text-sky-600' },
  { tipo: 'MAS', titulo: 'Más opciones', detalle: 'Explorar servicios', icono: IconMas, tile: 'bg-violet-100 text-violet-500' },
];

export default function OperacionesRapidas({ onElegir, deshabilitado }) {
  return (
    <section id="operaciones" className="scroll-mt-24 animate-fade-up [animation-delay:200ms]">
      <h2 className="text-base font-bold">Operaciones rápidas</h2>
      <p className="text-xs text-bosque-900/50">Gestiona tu dinero en pocos pasos.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {acciones.map((a) => (
          <button
            key={a.tipo}
            type="button"
            onClick={() => onElegir(a.tipo)}
            disabled={deshabilitado}
            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            <span className={`rounded-xl p-3 transition group-hover:scale-110 ${a.tile}`}>
              <a.icono className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold">{a.titulo}</span>
              <span className="block text-[11px] text-bosque-900/50">{a.detalle}</span>
            </span>
            <IconFlecha className="h-4 w-4 text-bosque-900/30 transition group-hover:translate-x-0.5 group-hover:text-bosque-900" />
          </button>
        ))}
      </div>
    </section>
  );
}
