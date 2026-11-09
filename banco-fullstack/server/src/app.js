import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { conectarDB } from './config/database.js';
import cuentaRoutes from './routes/cuentaRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const origenes = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: origenes }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true, mensaje: 'API bancaria operativa' }));
app.use('/api/cuenta', cuentaRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function iniciar() {
  try {
    await conectarDB();
    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

iniciar();
