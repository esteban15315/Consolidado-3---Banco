import mongoose from 'mongoose';
import Cuenta from '../models/Cuenta.js';
import Transaccion from '../models/Transaccion.js';
import { HttpError } from '../middleware/errorHandler.js';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const NUMERO_CUENTA = /^[0-9A-Za-z-]{4,20}$/;

// ---------- Validaciones ----------

function filtroCuenta(identificador, campo = 'id') {
  if (typeof identificador !== 'string' || !identificador.trim()) {
    throw new HttpError(400, `El campo "${campo}" es obligatorio`);
  }
  const valor = identificador.trim();
  if (OBJECT_ID.test(valor)) return { _id: valor };
  if (NUMERO_CUENTA.test(valor)) return { numeroCuenta: valor };
  throw new HttpError(400, `El campo "${campo}" no es un identificador de cuenta válido`);
}

function validarMonto(monto) {
  if (monto === undefined || monto === null || monto === '' || typeof monto === 'boolean') {
    throw new HttpError(400, 'El monto es obligatorio');
  }
  const numero = typeof monto === 'string' ? Number(monto.trim()) : monto;
  if (typeof numero !== 'number' || !Number.isFinite(numero)) {
    throw new HttpError(400, 'El monto debe ser numérico');
  }
  if (numero <= 0) throw new HttpError(400, 'El monto debe ser mayor que cero');
  if (Math.round(numero * 100) / 100 !== numero) {
    throw new HttpError(400, 'El monto admite como máximo 2 decimales');
  }
  if (numero > 1_000_000_000) throw new HttpError(400, 'El monto excede el máximo permitido');
  return numero;
}

function validarDescripcion(descripcion, porDefecto) {
  if (descripcion === undefined || descripcion === null || descripcion === '') return porDefecto;
  if (typeof descripcion !== 'string') throw new HttpError(400, 'La descripción debe ser texto');
  if (descripcion.length > 200) throw new HttpError(400, 'La descripción no puede superar 200 caracteres');
  return descripcion.trim();
}

// ---------- Helpers ----------

async function obtenerCuentaActiva(identificador, campo, session = null) {
  const cuenta = await Cuenta.findOne(filtroCuenta(identificador, campo)).session(session);
  if (!cuenta) throw new HttpError(404, `La cuenta indicada en "${campo}" no existe`);
  if (cuenta.estado !== 'ACTIVA') throw new HttpError(400, `La cuenta indicada en "${campo}" no está activa`);
  return cuenta;
}

// Ejecuta fn dentro de una transacción de MongoDB (requiere replica set).
async function enTransaccion(fn) {
  const session = await mongoose.startSession();
  try {
    let resultado;
    await session.withTransaction(async () => {
      resultado = await fn(session);
    });
    return resultado;
  } finally {
    await session.endSession();
  }
}

const formatearCuenta = (c) => ({
  id: c._id,
  titular: c.titular,
  numeroCuenta: c.numeroCuenta,
  saldo: c.saldo,
  moneda: c.moneda,
  estado: c.estado,
  fechaCreacion: c.fechaCreacion,
});

// ---------- Controladores ----------

export async function obtenerCuenta(req, res, next) {
  try {
    const cuenta = await Cuenta.findOne(filtroCuenta(req.params.id, 'id'));
    if (!cuenta) throw new HttpError(404, 'La cuenta no existe');
    res.json({ ok: true, cuenta: formatearCuenta(cuenta) });
  } catch (err) {
    next(err);
  }
}

export async function depositar(req, res, next) {
  try {
    const { cuentaId, monto, descripcion } = req.body ?? {};
    const valor = validarMonto(monto);
    const desc = validarDescripcion(descripcion, 'Depósito en cuenta');

    const { cuenta, transaccion } = await enTransaccion(async (session) => {
      const existente = await obtenerCuentaActiva(cuentaId, 'cuentaId', session);
      const cuenta = await Cuenta.findOneAndUpdate(
        { _id: existente._id },
        { $inc: { saldo: valor } },
        { new: true, session },
      );
      const [transaccion] = await Transaccion.create(
        [{ tipo: 'DEPOSITO', monto: valor, cuentaOrigen: cuenta._id, descripcion: desc }],
        { session },
      );
      return { cuenta, transaccion };
    });

    res.status(201).json({ ok: true, mensaje: 'Depósito realizado con éxito', cuenta: formatearCuenta(cuenta), transaccion });
  } catch (err) {
    next(err);
  }
}

export async function retirar(req, res, next) {
  try {
    const { cuentaId, monto, descripcion } = req.body ?? {};
    const valor = validarMonto(monto);
    const desc = validarDescripcion(descripcion, 'Retiro de cuenta');

    const { cuenta, transaccion } = await enTransaccion(async (session) => {
      const existente = await obtenerCuentaActiva(cuentaId, 'cuentaId', session);
      // La condición saldo >= monto se evalúa de forma atómica junto con el descuento.
      const cuenta = await Cuenta.findOneAndUpdate(
        { _id: existente._id, saldo: { $gte: valor } },
        { $inc: { saldo: -valor } },
        { new: true, session },
      );
      if (!cuenta) throw new HttpError(400, 'Saldo insuficiente para realizar el retiro');
      const [transaccion] = await Transaccion.create(
        [{ tipo: 'RETIRO', monto: valor, cuentaOrigen: cuenta._id, descripcion: desc }],
        { session },
      );
      return { cuenta, transaccion };
    });

    res.status(201).json({ ok: true, mensaje: 'Retiro realizado con éxito', cuenta: formatearCuenta(cuenta), transaccion });
  } catch (err) {
    next(err);
  }
}

export async function transferir(req, res, next) {
  try {
    const { cuentaOrigen, cuentaDestino, monto, descripcion } = req.body ?? {};
    const valor = validarMonto(monto);
    const desc = validarDescripcion(descripcion, 'Transferencia entre cuentas');
    // Valida el formato antes de abrir la transacción
    filtroCuenta(cuentaOrigen, 'cuentaOrigen');
    filtroCuenta(cuentaDestino, 'cuentaDestino');

    const resultado = await enTransaccion(async (session) => {
      const origen = await obtenerCuentaActiva(cuentaOrigen, 'cuentaOrigen', session);
      const destino = await obtenerCuentaActiva(cuentaDestino, 'cuentaDestino', session);

      if (origen._id.equals(destino._id)) {
        throw new HttpError(400, 'No se puede transferir a la misma cuenta');
      }
      if (origen.moneda !== destino.moneda) {
        throw new HttpError(400, 'Las cuentas tienen monedas distintas');
      }

      const origenActualizada = await Cuenta.findOneAndUpdate(
        { _id: origen._id, saldo: { $gte: valor } },
        { $inc: { saldo: -valor } },
        { new: true, session },
      );
      if (!origenActualizada) throw new HttpError(400, 'Saldo insuficiente para realizar la transferencia');

      const destinoActualizada = await Cuenta.findOneAndUpdate(
        { _id: destino._id },
        { $inc: { saldo: valor } },
        { new: true, session },
      );

      const [transaccion] = await Transaccion.create(
        [{ tipo: 'TRANSFERENCIA', monto: valor, cuentaOrigen: origen._id, cuentaDestino: destino._id, descripcion: desc }],
        { session },
      );
      return { origenActualizada, destinoActualizada, transaccion };
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Transferencia realizada con éxito',
      cuentaOrigen: formatearCuenta(resultado.origenActualizada),
      cuentaDestino: formatearCuenta(resultado.destinoActualizada),
      transaccion: resultado.transaccion,
    });
  } catch (err) {
    next(err);
  }
}

export async function obtenerHistorial(req, res, next) {
  try {
    const cuenta = await Cuenta.findOne(filtroCuenta(req.params.id, 'id'));
    if (!cuenta) throw new HttpError(404, 'La cuenta no existe');

    const limite = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const movimientos = await Transaccion.find({
      $or: [{ cuentaOrigen: cuenta._id }, { cuentaDestino: cuenta._id }],
    })
      .sort({ fecha: -1, _id: -1 })
      .limit(limite)
      .populate('cuentaOrigen', 'titular numeroCuenta')
      .populate('cuentaDestino', 'titular numeroCuenta')
      .lean();

    res.json({ ok: true, total: movimientos.length, historial: movimientos });
  } catch (err) {
    next(err);
  }
}
