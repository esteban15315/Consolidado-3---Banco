import mongoose from 'mongoose';

const transaccionSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'], required: true },
  monto: { type: Number, required: true, min: [0.01, 'El monto debe ser mayor que cero'] },
  cuentaOrigen: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta', required: true, index: true },
  cuentaDestino: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta', default: null, index: true },
  descripcion: { type: String, trim: true, maxlength: 200, default: '' },
  fecha: { type: Date, default: Date.now, index: true },
});

export default mongoose.model('Transaccion', transaccionSchema);
