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
    <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-md sm:left-auto sm:right-6 sm:mx-0" role="alert">
      <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${
        exito ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
      }`}>
        <span className="mt-0.5">{exito ? <IconCheck /> : <IconError />}</span>
        <p className="flex-1 text-sm font-medium">{notificacion.mensaje}</p>
        <button onClick={onCerrar} aria-label="Cerrar" className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
      </div>
    </div>
  );
}
