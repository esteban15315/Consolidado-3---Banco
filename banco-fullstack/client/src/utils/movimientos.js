export const moneda = (valor, codigo) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: codigo || 'PEN' }).format(valor);

const mismoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// "Hoy, 09:42" · "Ayer, 18:20" · "12 mar, 14:05"
export function fechaCorta(fecha) {
  const f = new Date(fecha);
  const ahora = new Date();
  const ayer = new Date();
  ayer.setDate(ahora.getDate() - 1);
  const hora = f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (mismoDia(f, ahora)) return `Hoy, ${hora}`;
  if (mismoDia(f, ayer)) return `Ayer, ${hora}`;
  const dia = f.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '');
  return `${dia}, ${hora}`;
}

// +1 si el dinero entra a la cuenta actual, -1 si sale
export function signo(mov, numeroCuenta) {
  if (mov.tipo === 'DEPOSITO') return 1;
  if (mov.tipo === 'RETIRO') return -1;
  return mov.cuentaOrigen?.numeroCuenta === numeroCuenta ? -1 : 1;
}

export function describir(mov, numeroCuenta) {
  const s = signo(mov, numeroCuenta);
  const otra = s < 0 ? mov.cuentaDestino : mov.cuentaOrigen;
  if (mov.tipo === 'DEPOSITO') return { titulo: 'Depósito recibido', detalle: mov.descripcion || 'Cuenta propia' };
  if (mov.tipo === 'RETIRO') return { titulo: 'Retiro de fondos', detalle: mov.descripcion || 'Cuenta propia' };
  const quien = otra ? `${otra.titular} · ${otra.numeroCuenta}` : '';
  return {
    titulo: s < 0 ? 'Transferencia enviada' : 'Transferencia recibida',
    detalle: [quien, mov.descripcion].filter(Boolean).join(' · '),
  };
}

// Ingresos/gastos del mes actual y barras de los últimos 12 días
export function resumenMes(movimientos, numeroCuenta) {
  const ahora = new Date();
  let ingresos = 0;
  let gastos = 0;
  const dias = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(ahora);
    d.setDate(ahora.getDate() - (11 - i));
    return { fecha: d, neto: 0, volumen: 0 };
  });

  for (const m of movimientos) {
    const f = new Date(m.fecha);
    const s = signo(m, numeroCuenta);
    if (f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()) {
      if (s > 0) ingresos += m.monto;
      else gastos += m.monto;
    }
    const dia = dias.find((d) => mismoDia(d.fecha, f));
    if (dia) {
      dia.neto += s * m.monto;
      dia.volumen += m.monto;
    }
  }
  return { ingresos, gastos, dias };
}

export function descargarCSV(movimientos, numeroCuenta) {
  const filas = [['Fecha', 'Tipo', 'Descripcion', 'Monto']];
  for (const m of movimientos) {
    const { titulo, detalle } = describir(m, numeroCuenta);
    filas.push([new Date(m.fecha).toISOString(), titulo, detalle, (signo(m, numeroCuenta) * m.monto).toFixed(2)]);
  }
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `estado-${numeroCuenta}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
