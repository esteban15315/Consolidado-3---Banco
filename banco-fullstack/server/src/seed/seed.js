import 'dotenv/config';
import mongoose from 'mongoose';
import Cuenta from '../models/Cuenta.js';
import Transaccion from '../models/Transaccion.js';
import { conectarDB } from '../config/database.js';

const cuentas = [
  { titular: 'Esteban Yupanqui', numeroCuenta: '1001-0001', saldo: 5000, moneda: 'USD' },
  { titular: 'Carlos Mendoza', numeroCuenta: '1001-0002', saldo: 2500.5, moneda: 'USD' },
  { titular: 'Lucía Fernández', numeroCuenta: '1001-0003', saldo: 10000, moneda: 'USD' },
  { titular: 'Miguel Rojas', numeroCuenta: '1001-0004', saldo: 150, moneda: 'USD' },
];

const reset = process.argv.includes('--reset');

async function ejecutar() {
  await conectarDB();

  if (reset) {
    await Transaccion.deleteMany({});
    await Cuenta.deleteMany({});
    console.log('Datos anteriores eliminados (--reset)');
  }

  for (const datos of cuentas) {
    const existe = await Cuenta.exists({ numeroCuenta: datos.numeroCuenta });
    if (existe) {
      console.log(`- ${datos.numeroCuenta} ya existe, se omite`);
    } else {
      await Cuenta.create(datos);
      console.log(`+ ${datos.numeroCuenta} ${datos.titular} creada con saldo ${datos.saldo}`);
    }
  }

  console.log('Seed finalizado. Para reiniciar los datos: npm run seed:reset');
}

ejecutar()
  .catch((err) => {
    console.error('Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
