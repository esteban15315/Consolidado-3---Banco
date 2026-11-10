import { useState } from 'react';
import Loading from './Loading.jsx';

const config = {
  DEPOSITO: { boton: 'Depositar' },
  RETIRO: { boton: 'Retirar' },
  TRANSFERENCIA: { boton: 'Transferir' },
};

const campoClase =
  'w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-bosque-900 outline-none transition placeholder:text-bosque-900/30 focus:border-bosque-700 focus:ring-2 focus:ring-lima-400/60 disabled:bg-lienzo';

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
          <label htmlFor="cuentaDestino" className="mb-1.5 block text-xs font-semibold text-bosque-900/70">Cuenta destino</label>
          <input id="cuentaDestino" name="cuentaDestino" value={form.cuentaDestino} onChange={cambiar}
            placeholder="Ej. 1001-0002" disabled={procesando} className={`${campoClase} font-mono`} autoFocus />
        </div>
      )}

      <div>
        <label htmlFor="monto" className="mb-1.5 block text-xs font-semibold text-bosque-900/70">Monto</label>
        <input id="monto" name="monto" type="number" inputMode="decimal" min="0" step="0.01"
          value={form.monto} onChange={cambiar} placeholder="0.00" disabled={procesando}
          className={campoClase} autoFocus={!esTransferencia} />
      </div>

      <div>
        <label htmlFor="descripcion" className="mb-1.5 block text-xs font-semibold text-bosque-900/70">
          Descripción <span className="font-normal text-bosque-900/40">(opcional)</span>
        </label>
        <input id="descripcion" name="descripcion" maxLength={200} value={form.descripcion} onChange={cambiar}
          placeholder="Motivo de la operación" disabled={procesando} className={campoClase} />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 animate-fade-in" role="alert">{error}</p>}

      <button type="submit" disabled={procesando}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-bosque-900 px-4 py-3 text-sm font-bold text-lima-400 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-bosque-800 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
        {procesando ? <><Loading pequeno /> Procesando...</> : config[tipo].boton}
      </button>
    </form>
  );
}
