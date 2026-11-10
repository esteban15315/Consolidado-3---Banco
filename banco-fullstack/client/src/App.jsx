import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import SaldoCard from './components/SaldoCard.jsx';
import BalanceMes from './components/BalanceMes.jsx';
import OperacionesRapidas from './components/OperacionesRapidas.jsx';
import FormOperacion from './components/FormOperacion.jsx';
import HistorialTransacciones from './components/HistorialTransacciones.jsx';
import Notificacion from './components/Notificacion.jsx';
import Modal from './components/Modal.jsx';
import Loading from './components/Loading.jsx';
import { IconDeposito, IconRetiro, IconTransferencia, IconDescarga } from './components/Icons.jsx';
import { descargarCSV } from './utils/movimientos.js';
import * as api from './services/cuentaService.js';

const CUENTAS_DEMO = (import.meta.env.VITE_CUENTAS_DEMO || '1001-0001,1001-0002,1001-0003')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

const operaciones = {
  DEPOSITO: { titulo: 'Depositar', subtitulo: 'Agrega fondos a tu cuenta', icono: IconDeposito, tile: 'bg-lima-300/50 text-bosque-700' },
  RETIRO: { titulo: 'Retirar', subtitulo: 'Retira fondos de tu cuenta', icono: IconRetiro, tile: 'bg-red-100 text-red-500' },
  TRANSFERENCIA: { titulo: 'Transferir', subtitulo: 'Envía dinero a otra cuenta', icono: IconTransferencia, tile: 'bg-sky-100 text-sky-600' },
};

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function App() {
  const [cuentaActual, setCuentaActual] = useState(CUENTAS_DEMO[0]);
  const [cuenta, setCuenta] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [operacion, setOperacion] = useState(null); // tipo de operación con el modal abierto
  const [notificacion, setNotificacion] = useState(null);
  const [intento, setIntento] = useState(0);

  const cerrarNotificacion = useCallback(() => setNotificacion(null), []);
  const cerrarModal = useCallback(() => setOperacion(null), []);

  const cargarDatos = useCallback(async (id) => {
    const [resCuenta, resHistorial] = await Promise.all([api.obtenerCuenta(id), api.obtenerHistorial(id, 50)]);
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

  // Abre el modal de una operación; "MAS" aún no tiene servicios asociados
  const elegirOperacion = (tipo) => {
    if (tipo === 'MAS') {
      setNotificacion({ tipo: 'exito', mensaje: 'Más servicios estarán disponibles próximamente.', id: Date.now() });
      return;
    }
    setOperacion(tipo);
  };

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
      setNotificacion({ tipo: 'exito', mensaje: respuesta.mensaje, id: Date.now() });
      setOperacion(null);
      return true;
    } catch (err) {
      setNotificacion({ tipo: 'error', mensaje: err.message, id: Date.now() });
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const nombre = cuenta?.titular?.split(' ')[0];
  const op = operacion ? operaciones[operacion] : null;

  return (
    <div className="min-h-screen">
      <Navbar
        cuentas={CUENTAS_DEMO}
        cuentaActual={cuentaActual}
        onCambiarCuenta={setCuentaActual}
        deshabilitado={procesando}
        titular={cuenta?.titular}
        onTransferir={() => cuenta && setOperacion('TRANSFERENCIA')}
      />
      <Notificacion notificacion={notificacion} onCerrar={cerrarNotificacion} />

      <main id="inicio" className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {cargando && !cuenta ? (
          <Loading texto="Cargando cuenta..." />
        ) : errorCarga ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 animate-pop">
            <p className="font-semibold">No se pudo cargar la cuenta</p>
            <p className="mt-1 text-sm">{errorCarga}</p>
            <button
              onClick={() => setIntento((n) => n + 1)}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-500 active:scale-95"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3 animate-fade-in">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{saludo()}, {nombre}</h1>
                <p className="mt-1 text-xs text-bosque-900/50">Aquí tienes el estado de tus finanzas al día de hoy.</p>
              </div>
              <button
                type="button"
                onClick={() => descargarCSV(historial, cuenta.numeroCuenta)}
                disabled={historial.length === 0}
                className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconDescarga /> Descargar estado
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <SaldoCard cuenta={cuenta} />
              <BalanceMes movimientos={historial} numeroCuenta={cuenta.numeroCuenta} monedaCuenta={cuenta.moneda} />
            </div>

            <OperacionesRapidas onElegir={elegirOperacion} deshabilitado={procesando} />

            <HistorialTransacciones
              movimientos={historial}
              cargando={cargando}
              numeroCuenta={cuenta.numeroCuenta}
              monedaCuenta={cuenta.moneda}
            />
          </>
        )}
      </main>

      {op && (
        <Modal titulo={op.titulo} subtitulo={op.subtitulo} icono={op.icono} tile={op.tile} onCerrar={cerrarModal}>
          <FormOperacion tipo={operacion} procesando={procesando} onSubmit={manejarOperacion} />
        </Modal>
      )}

      <footer className="py-8 text-center text-xs text-bosque-900/40">Nexo Banco · Proyecto académico</footer>
    </div>
  );
}
