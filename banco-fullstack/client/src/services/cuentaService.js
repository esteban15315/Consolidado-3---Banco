const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function peticion(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // respuesta sin JSON
  }

  if (!respuesta.ok) {
    throw new Error(datos?.mensaje || `Error ${respuesta.status} del servidor`);
  }
  return datos;
}

const post = (ruta, cuerpo) => peticion(ruta, { method: 'POST', body: JSON.stringify(cuerpo) });

export const obtenerCuenta = (id) => peticion(`/cuenta/${encodeURIComponent(id)}`);
export const obtenerHistorial = (id, limit = 15) =>
  peticion(`/cuenta/${encodeURIComponent(id)}/historial?limit=${limit}`);
export const depositar = (datos) => post('/cuenta/deposito', datos);
export const retirar = (datos) => post('/cuenta/retiro', datos);
export const transferir = (datos) => post('/cuenta/transferencia', datos);
