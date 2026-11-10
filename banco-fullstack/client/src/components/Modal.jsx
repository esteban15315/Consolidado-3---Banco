import { useEffect } from 'react';
import { IconCerrar } from './Icons.jsx';

export default function Modal({ titulo, subtitulo, icono: Icono, tile, onCerrar, children }) {
  useEffect(() => {
    const alPulsar = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bosque-950/50 p-4 backdrop-blur-sm animate-fade-in sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-pop">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`rounded-xl p-3 ${tile}`}><Icono className="h-5 w-5" /></span>
            <div>
              <h2 className="text-base font-bold">{titulo}</h2>
              <p className="text-xs text-bosque-900/50">{subtitulo}</p>
            </div>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-full p-1.5 text-bosque-900/40 transition hover:bg-lienzo hover:text-bosque-900">
            <IconCerrar className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
