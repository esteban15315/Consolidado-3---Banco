import { useState } from 'react';
import Loading from './Loading.jsx';

const config = {
  DEPOSITO: { boton: 'Depositar', estilo: 'bg-esmeralda-600 hover:bg-esmeralda-500' },
  RETIRO: { boton: 'Retirar', estilo: 'bg-marino-800 hover:bg-marino-700' },
  TRANSFERENCIA: { boton: 'Transferir', estilo: 'bg-esmeralda-600 hover:bg-esmeralda-500' },
};

const campoClase =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-esmeralda-500 focus:ring-2 focus:ring-esmeralda-500/30 disabled:bg-slate-100';

const formularioInicial = { monto: '', cuentaDestino: '', descripcion: '' };

export default function FormOperacion({ tipo, procesando, onSubmit }) {
  const [form, setForm] = useState(formularioInicial);
  const [error, setError] = useState('');
  const esTransferencia = tipo === 'TRANSFERENCIA';

  const cambiar = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (procesando) return;

    const monto = Number(form.monto);
    if (form.monto === '' || !Number.isFinite(monto)) return setError('Ingresa un monto numérico');
    if (monto <= 0) return setError('El monto debe ser mayor que cero');
    if (Math.round(monto * 100) / 100 !== monto) return setError('Máximo 2 decimales');
    if (esTransferencia && !form.cuentaDestino.trim()) return setError('Ingresa la cuenta destino');

    const exito = await onSubmit({
      monto,
      cuentaDestino: form.cuentaDestino.trim(),
      descripcion: form.descripcion.trim(),
    });
    if (exito) setForm(formularioInicial);
  };

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      {esTransferencia && (
        <div>
          <label htmlFor="cuentaDestino" className="mb-1 block text-sm font-medium text-slate-600">Cuenta destino</label>
          <input id="cuentaDestino" name="cuentaDestino" value={form.cuentaDestino} onChange={cambiar}
            placeholder="Ej. 1001-0002" disabled={procesando} className={`${campoClase} font-mono`} />
        </div>
      )}

      <div>
        <label htmlFor="monto" className="mb-1 block text-sm font-medium text-slate-600">Monto</label>
        <input id="monto" name="monto" type="number" inputMode="decimal" min="0" step="0.01"
          value={form.monto} onChange={cambiar} placeholder="0.00" disabled={procesando} className={campoClase} />
      </div>

      <div>
        <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-600">
          Descripción <span className="text-slate-400">(opcional)</span>
        </label>
        <input id="descripcion" name="descripcion" maxLength={200} value={form.descripcion} onChange={cambiar}
          placeholder="Motivo de la operación" disabled={procesando} className={campoClase} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}

      <button type="submit" disabled={procesando}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${config[tipo].estilo}`}>
        {procesando ? <><Loading pequeno /> Procesando...</> : config[tipo].boton}
      </button>
    </form>
  );
}
