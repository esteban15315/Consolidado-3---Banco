import mongoose from 'mongoose';

const cuentaSchema = new mongoose.Schema({
  titular: { type: String, required: [true, 'El titular es obligatorio'], trim: true },
  numeroCuenta: { type: String, required: true, unique: true, trim: true },
  saldo: { type: Number, required: true, default: 0, min: [0, 'El saldo no puede ser negativo'] },
  moneda: { type: String, default: 'USD', uppercase: true, trim: true },
  estado: { type: String, enum: ['ACTIVA', 'INACTIVA', 'BLOQUEADA'], default: 'ACTIVA' },
  fechaCreacion: { type: Date, default: Date.now },
});

export default mongoose.model('Cuenta', cuentaSchema);
