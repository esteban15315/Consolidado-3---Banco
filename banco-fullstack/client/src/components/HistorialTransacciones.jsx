import Loading from './Loading.jsx';
import { IconDeposito, IconRetiro, IconTransferencia } from './Icons.jsx';

const estilos = {
  DEPOSITO: { etiqueta: 'Depósito', icono: IconDeposito, badge: 'bg-emerald-100 text-emerald-700' },
  RETIRO: { etiqueta: 'Retiro', icono: IconRetiro, badge: 'bg-red-100 text-red-700' },
  TRANSFERENCIA: { etiqueta: 'Transferencia', icono: IconTransferencia, badge: 'bg-blue-100 text-blue-700' },
};

const moneda = (v, c) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: c || 'USD' }).format(v);
const fechaHora = (f) => new Date(f).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
const etiquetaCuenta = (c) => (c ? c.numeroCuenta : '—');

// Signo del movimiento desde el punto de vista de la cuenta actual
function signo(mov, numeroCuenta) {
  if (mov.tipo === 'DEPOSITO') return 1;
  if (mov.tipo === 'RETIRO') return -1;
  return mov.cuentaOrigen?.numeroCuenta === numeroCuenta ? -1 : 1;
}

export default function HistorialTransacciones({ movimientos, cargando, numeroCuenta, monedaCuenta }) {
  return (
    <section id="historial" className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-md sm:p-6">
      <h2 className="text-lg font-bold text-marino-900">Últimos movimientos</h2>

      {cargando && movimientos.length === 0 ? (
        <Loading texto="Cargando historial..." />
      ) : movimientos.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Aún no hay movimientos en esta cuenta.</p>
      ) : (
        <>
          {/* Tabla en pantallas medianas y grandes */}
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Tipo</th>
                  <th className="py-3 pr-4">Fecha y hora</th>
                  <th className="py-3 pr-4">Origen</th>
                  <th className="py-3 pr-4">Destino</th>
                  <th className="py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientos.map((m) => {
                  const e = estilos[m.tipo];
                  const s = signo(m, numeroCuenta);
                  return (
                    <tr key={m._id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${e.badge}`}>
                          <e.icono className="h-4 w-4" /> {e.etiqueta}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{fechaHora(m.fecha)}</td>
                      <td className="py-3 pr-4 font-mono">{etiquetaCuenta(m.cuentaOrigen)}</td>
                      <td className="py-3 pr-4 font-mono">{etiquetaCuenta(m.cuentaDestino)}</td>
                      <td className={`py-3 text-right font-bold ${s > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {s > 0 ? '+' : '−'}{moneda(m.monto, monedaCuenta)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lista de tarjetas en móviles */}
          <ul className="mt-4 space-y-3 md:hidden">
            {movimientos.map((m) => {
              const e = estilos[m.tipo];
              const s = signo(m, numeroCuenta);
              return (
                <li key={m._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${e.badge}`}>
                      <e.icono className="h-4 w-4" /> {e.etiqueta}
                    </span>
                    <span className={`font-bold ${s > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {s > 0 ? '+' : '−'}{moneda(m.monto, monedaCuenta)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{fechaHora(m.fecha)}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    <span className="font-mono">{etiquetaCuenta(m.cuentaOrigen)}</span>
                    {m.cuentaDestino && <> → <span className="font-mono">{etiquetaCuenta(m.cuentaDestino)}</span></>}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
