import { useEffect } from 'react';
import { IconCheck, IconError } from './Icons.jsx';

export default function Notificacion({ notificacion, onCerrar }) {
  useEffect(() => {
    if (!notificacion) return undefined;
    const temporizador = setTimeout(onCerrar, 5000);
    return () => clearTimeout(temporizador);
  }, [notificacion, onCerrar]);

  if (!notificacion) return null;
  const exito = notificacion.tipo === 'exito';

  return (
    <div className="fixed inset-x-4 top-20 z-[60] mx-auto max-w-md sm:left-auto sm:right-6 sm:mx-0" role="alert">
      <div
        key={notificacion.mensaje + (notificacion.id ?? '')}
        className={`relative overflow-hidden rounded-2xl border shadow-xl animate-slide-in ${
          exito ? 'border-lima-500/40 bg-white text-bosque-900' : 'border-red-200 bg-red-50 text-red-800'
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <span className={`mt-0.5 animate-pop ${exito ? 'text-bosque-700' : ''}`}>{exito ? <IconCheck /> : <IconError />}</span>
          <p className="flex-1 text-sm font-medium">{notificacion.mensaje}</p>
          <button onClick={onCerrar} aria-label="Cerrar" className="text-lg leading-none opacity-50 transition hover:rotate-90 hover:opacity-100">×</button>
        </div>
        <span className={`absolute bottom-0 left-0 h-1 w-full origin-left animate-shrink ${exito ? 'bg-lima-400' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}
