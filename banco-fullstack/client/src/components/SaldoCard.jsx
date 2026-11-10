import { useState, useEffect, useRef } from 'react';
import { IconOjo, IconOjoCerrado } from './Icons.jsx';
import { moneda } from '../utils/movimientos.js';

// Anima el número desde su valor actual hasta el objetivo
function useContador(objetivo, duracion = 900) {
  const [valor, setValor] = useState(0);
  const actual = useRef(0);

  useEffect(() => {
    const desde = actual.current;
    const inicio = performance.now();
    let id;
    const paso = (ahora) => {
      const p = Math.min((ahora - inicio) / duracion, 1);
      const suavizado = 1 - Math.pow(1 - p, 3);
      actual.current = desde + (objetivo - desde) * suavizado;
      setValor(actual.current);
      if (p < 1) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [objetivo, duracion]);

  return valor;
}

const estado = {
  ACTIVA: { texto: 'Cuenta activa', punto: 'bg-lima-400' },
  INACTIVA: { texto: 'Cuenta inactiva', punto: 'bg-slate-400' },
  BLOQUEADA: { texto: 'Cuenta bloqueada', punto: 'bg-red-400' },
};

export default function SaldoCard({ cuenta }) {
  const [visible, setVisible] = useState(true);
  const saldoAnimado = useContador(cuenta.saldo);
  const ultimos4 = cuenta.numeroCuenta.replace(/\D/g, '').slice(-4).padStart(4, '•');
  const e = estado[cuenta.estado] || estado.INACTIVA;

  return (
    <section
      id="saldo"
      className="relative flex min-h-[220px] scroll-mt-24 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-bosque-900 to-bosque-800 p-6 text-white shadow-xl shadow-bosque-900/20 animate-fade-up"
    >
      <span className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border border-white/10" />
      <span className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full border border-white/10 bg-white/[0.03]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-lima-300/90">Saldo disponible</p>
          <p key={cuenta.saldo} className="mt-3 text-4xl font-extrabold tabular-nums tracking-tight animate-pop sm:text-[42px]">
            {visible ? moneda(saldoAnimado, cuenta.moneda) : '••••••'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
          className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {visible ? <IconOjo /> : <IconOjoCerrado />}
        </button>
      </div>

      <div className="relative mt-6">
        <p className="text-[11px] text-white/60">Cuenta principal · {cuenta.titular}</p>
        <p className="mt-1.5 font-mono text-sm font-bold tracking-[0.2em]">
          •••• •••• •••• {ultimos4}
        </p>
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <span className="flex items-center gap-2 text-[11px] text-white/70">
          <span className={`h-2 w-2 rounded-full ${e.punto}`} />
          {e.texto}
        </span>
        <span className="text-sm font-extrabold tracking-[0.25em] text-lima-400">NEXO</span>
      </div>
    </section>
  );
}
