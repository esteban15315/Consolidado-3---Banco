import { useMemo } from 'react';
import { IconDeposito, IconRetiro } from './Icons.jsx';
import { moneda, resumenMes } from '../utils/movimientos.js';

export default function BalanceMes({ movimientos, numeroCuenta, monedaCuenta }) {
  const { ingresos, gastos, dias } = useMemo(() => resumenMes(movimientos, numeroCuenta), [movimientos, numeroCuenta]);
  const maximo = Math.max(...dias.map((d) => d.volumen), 1);
  const mes = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const diaCorto = (f) => f.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).replace('.', '');

  return (
    <section className="flex flex-col rounded-3xl border border-black/5 bg-white p-6 shadow-sm animate-fade-up [animation-delay:100ms]">
      <p className="text-xs text-bosque-900/50">Balance del mes</p>
      <h2 className="text-base font-bold capitalize">{mes}</h2>

      <div className="mt-4 flex flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-lima-300/50 p-2.5 text-bosque-700"><IconDeposito className="h-5 w-5" /></span>
          <div>
            <p className="text-[11px] text-bosque-900/50">Ingresos</p>
            <p className="text-sm font-bold tabular-nums">+ {moneda(ingresos, monedaCuenta)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-red-100 p-2.5 text-red-600"><IconRetiro className="h-5 w-5" /></span>
          <div>
            <p className="text-[11px] text-bosque-900/50">Gastos</p>
            <p className="text-sm font-bold tabular-nums">− {moneda(gastos, monedaCuenta)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-24 flex-1 items-end gap-2" role="img" aria-label="Movimientos de los últimos 12 días">
        {dias.map((d, i) => {
          const altura = d.volumen === 0 ? 6 : Math.max((d.volumen / maximo) * 100, 12);
          const color = d.volumen === 0 ? 'bg-bosque-900/10' : d.neto >= 0 ? 'bg-lima-400' : 'bg-bosque-900/15';
          return (
            <div
              key={i}
              title={`${diaCorto(d.fecha)}: ${moneda(d.neto, monedaCuenta)}`}
              className={`flex-1 origin-bottom rounded-md animate-bar ${color}`}
              style={{ height: `${altura}%`, animationDelay: `${i * 40}ms` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-bosque-900/40">
        <span>{diaCorto(dias[0].fecha)}</span>
        <span>Hoy</span>
      </div>
    </section>
  );
}
