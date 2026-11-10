import { useState } from 'react';
import Loading from './Loading.jsx';
import { IconDeposito, IconRetiro, IconTransferencia, IconFlecha } from './Icons.jsx';
import { moneda, fechaCorta, signo, describir } from '../utils/movimientos.js';

const iconos = {
  DEPOSITO: { icono: IconDeposito, tile: 'bg-lima-300/50 text-bosque-700' },
  RETIRO: { icono: IconRetiro, tile: 'bg-red-100 text-red-500' },
  TRANSFERENCIA: { icono: IconTransferencia, tile: 'bg-sky-100 text-sky-600' },
};

const VISIBLES = 6;

export default function HistorialTransacciones({ movimientos, cargando, numeroCuenta, monedaCuenta }) {
  const [verTodos, setVerTodos] = useState(false);
  const lista = verTodos ? movimientos : movimientos.slice(0, VISIBLES);

  return (
    <section id="movimientos" className="scroll-mt-24 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm animate-fade-up [animation-delay:300ms]">
      <div className="flex items-start justify-between p-6 pb-4">
        <div>
          <h2 className="text-base font-bold">Últimos movimientos</h2>
          <p className="text-xs text-bosque-900/50">Tus transacciones más recientes</p>
        </div>
        {movimientos.length > VISIBLES && (
          <button
            type="button"
            onClick={() => setVerTodos((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold text-bosque-700 transition hover:text-bosque-950"
          >
            {verTodos ? 'Ver menos' : 'Ver todos'} <IconFlecha className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {cargando && movimientos.length === 0 ? (
        <Loading texto="Cargando historial..." />
      ) : movimientos.length === 0 ? (
        <p className="border-t border-black/5 py-10 text-center text-sm text-bosque-900/50">Aún no hay movimientos en esta cuenta.</p>
      ) : (
        <>
          <div className="hidden grid-cols-[1fr_140px_150px_120px_24px] gap-4 border-t border-black/5 bg-lienzo/60 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-bosque-900/40 md:grid">
            <span className="pl-[52px]">Descripción</span>
            <span>Fecha</span>
            <span>Monto</span>
            <span>Estado</span>
            <span />
          </div>

          <ul className="divide-y divide-black/5 border-t border-black/5 md:border-t-0">
            {lista.map((m, i) => {
              const { icono: Icono, tile } = iconos[m.tipo];
              const s = signo(m, numeroCuenta);
              const { titulo, detalle } = describir(m, numeroCuenta);
              return (
                <li
                  key={m._id}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-6 py-4 transition-colors animate-row hover:bg-lienzo/60 md:grid-cols-[1fr_140px_150px_120px_24px]"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`shrink-0 rounded-xl p-2.5 ${tile}`}><Icono className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{titulo}</p>
                      <p className="truncate text-[11px] text-bosque-900/50">{detalle}</p>
                    </div>
                  </div>

                  <p className="order-3 text-[11px] text-bosque-900/50 md:order-none">{fechaCorta(m.fecha)}</p>

                  <p className={`text-xs font-bold tabular-nums md:text-left ${s > 0 ? 'text-bosque-700' : 'text-red-600'}`}>
                    {s > 0 ? '+' : '−'} {moneda(m.monto, monedaCuenta)}
                  </p>

                  <span className="hidden w-fit items-center gap-1.5 rounded-full bg-lima-300/40 px-2.5 py-1 text-[10px] font-semibold text-bosque-700 md:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-lima-500" /> Completada
                  </span>

                  <IconFlecha className="hidden h-4 w-4 text-bosque-900/30 md:block" />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
