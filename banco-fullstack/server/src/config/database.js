import mongoose from 'mongoose';

export async function conectarDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI (revisa tu archivo .env)');
  }

  mongoose.connection.on('disconnected', () => console.warn('MongoDB desconectado'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconectado'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}
