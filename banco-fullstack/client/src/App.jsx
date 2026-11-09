import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import SaldoCard from './components/SaldoCard.jsx';
import FormOperacion from './components/FormOperacion.jsx';
import HistorialTransacciones from './components/HistorialTransacciones.jsx';
import Notificacion from './components/Notificacion.jsx';
import Loading from './components/Loading.jsx';
import { IconDeposito, IconRetiro, IconTransferencia } from './components/Icons.jsx';
import * as api from './services/cuentaService.js';

const CUENTAS_DEMO = (import.meta.env.VITE_CUENTAS_DEMO || '1001-0001,1001-0002,1001-0003')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

const pestanas = [
  { tipo: 'DEPOSITO', texto: 'Depósito', icono: IconDeposito },
  { tipo: 'RETIRO', texto: 'Retiro', icono: IconRetiro },
  { tipo: 'TRANSFERENCIA', texto: 'Transferencia', icono: IconTransferencia },
];

export default function App() {
  const [cuentaActual, setCuentaActual] = useState(CUENTAS_DEMO[0]);
  const [cuenta, setCuenta] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [operacion, setOperacion] = useState('DEPOSITO');
  const [notificacion, setNotificacion] = useState(null);
  const [intento, setIntento] = useState(0);

  const cerrarNotificacion = useCallback(() => setNotificacion(null), []);

  const cargarDatos = useCallback(async (id) => {
    const [resCuenta, resHistorial] = await Promise.all([api.obtenerCuenta(id), api.obtenerHistorial(id)]);
    setCuenta(resCuenta.cuenta);
    setHistorial(resHistorial.historial);
  }, []);

  // Carga inicial y al cambiar de cuenta
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setErrorCarga('');
    cargarDatos(cuentaActual)
      .catch((err) => {
        if (!cancelado) {
          setCuenta(null);
          setHistorial([]);
          setErrorCarga(err.message);
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [cuentaActual, cargarDatos, intento]);

  // Envía la operación, sincroniza saldo e historial y notifica. Devuelve true si tuvo éxito.
  const manejarOperacion = async ({ monto, cuentaDestino, descripcion }) => {
    if (procesando) return false;
    setProcesando(true);
    try {
      let respuesta;
      if (operacion === 'DEPOSITO') {
        respuesta = await api.depositar({ cuentaId: cuentaActual, monto, descripcion });
      } else if (operacion === 'RETIRO') {
        respuesta = await api.retirar({ cuentaId: cuentaActual, monto, descripcion });
      } else {
        respuesta = await api.transferir({ cuentaOrigen: cuentaActual, cuentaDestino, monto, descripcion });
      }
      await cargarDatos(cuentaActual);
      setNotificacion({ tipo: 'exito', mensaje: respuesta.mensaje });
      return true;
    } catch (err) {
      setNotificacion({ tipo: 'error', mensaje: err.message });
      return false;
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar
        cuentas={CUENTAS_DEMO}
        cuentaActual={cuentaActual}
        onCambiarCuenta={setCuentaActual}
        deshabilitado={procesando}
      />
      <Notificacion notificacion={notificacion} onCerrar={cerrarNotificacion} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
        {cargando && !cuenta ? (
          <Loading texto="Cargando cuenta..." />
        ) : errorCarga ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">No se pudo cargar la cuenta</p>
            <p className="mt-1 text-sm">{errorCarga}</p>
            <button
              onClick={() => setIntento((n) => n + 1)}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <SaldoCard cuenta={cuenta} />

            <div className="grid gap-6 lg:grid-cols-5">
              <section id="operaciones" className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-md sm:p-6 lg:col-span-2">
                <h2 className="text-lg font-bold text-marino-900">Operaciones bancarias</h2>

                <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist">
                  {pestanas.map((p) => (
                    <button
                      key={p.tipo}
                      role="tab"
                      aria-selected={operacion === p.tipo}
                      onClick={() => setOperacion(p.tipo)}
                      disabled={procesando}
                      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                        operacion === p.tipo ? 'bg-white text-marino-900 shadow' : 'text-slate-500 hover:text-marino-800'
                      }`}
                    >
                      <p.icono className="h-5 w-5" />
                      {p.texto}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  <FormOperacion key={operacion} tipo={operacion} procesando={procesando} onSubmit={manejarOperacion} />
                </div>
              </section>

              <div className="lg:col-span-3">
                <HistorialTransacciones
                  movimientos={historial}
                  cargando={cargando}
                  numeroCuenta={cuenta.numeroCuenta}
                  monedaCuenta={cuenta.moneda}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">Banco Nova · Proyecto académico</footer>
    </div>
  );
}
