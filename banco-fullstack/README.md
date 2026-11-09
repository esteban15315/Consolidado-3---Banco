# Banco Nova – Aplicación bancaria Full-Stack

Aplicación web para gestionar cuentas bancarias: consulta de saldo, depósitos, retiros, transferencias **atómicas** (transacciones MongoDB) e historial de movimientos.

## Tecnologías
- **Backend:** Node.js, Express, Mongoose, dotenv, cors (API REST, JavaScript ES6+).
- **Base de datos:** MongoDB local con replica set (necesario para transacciones).
- **Frontend:** React 18, Vite, Tailwind CSS 4, Hooks `useState` / `useEffect`, fetch.

## Requisitos previos
- Node.js 18 o superior y npm.
- MongoDB Community Server y mongosh instalados localmente.
- Git (opcional).

## Estructura
```
banco-fullstack/
├── server/         API REST (src/config, models, controllers, routes, middleware, seed)
├── client/         React + Vite (src/components, services)
└── mongo-scripts/  Scripts para configurar el replica set
```

## 1. Configurar MongoDB con replica set
Las transacciones multidocumento **solo funcionan en un replica set**. Un replica set de un nodo es suficiente.

**Opción automática** (PowerShell como administrador): `mongo-scripts/init-replica-set.ps1`.

**Opción manual:**
1. `net stop MongoDB`
2. En `C:\Program Files\MongoDB\Server\<versión>\bin\mongod.cfg` agrega:
   ```yaml
   replication:
     replSetName: rs0
   ```
3. `net start MongoDB`
4. `mongosh --eval "rs.initiate({_id:'rs0', members:[{_id:0, host:'127.0.0.1:27017'}]})"`
5. Verifica: `mongosh --eval "rs.status().members[0].stateStr"` → `PRIMARY`.

Sin servicio: ver `mongo-scripts/mongod-manual.txt`.

## 2. Backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```
Variables de `.env`:
| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (4000). |
| `MONGODB_URI` | Cadena de conexión; debe incluir `?replicaSet=rs0`. |
| `CORS_ORIGIN` | URL(s) del frontend permitidas, separadas por coma. |

Comprobación: abre `http://localhost:4000/api/salud`.

## 3. Seed (cuentas de prueba)
- `npm run seed` inserta las cuentas que no existan (no duplica).
- `npm run seed:reset` borra cuentas y movimientos y vuelve a crearlas.

| Titular | N.º de cuenta | Saldo inicial |
|---|---|---|
| Ana Torres | 1001-0001 | 5000.00 |
| Carlos Mendoza | 1001-0002 | 2500.50 |
| Lucía Fernández | 1001-0003 | 10000.00 |
| Miguel Rojas | 1001-0004 | 150.00 |

## 4. Frontend
```bash
cd client
npm install
copy .env.example .env
npm run dev
```
Abre `http://localhost:5173`.

## API REST
| Método | Ruta | Cuerpo |
|---|---|---|
| GET | `/api/cuenta/:id` | — (`:id` = `_id` o número de cuenta) |
| POST | `/api/cuenta/deposito` | `{ cuentaId, monto, descripcion? }` |
| POST | `/api/cuenta/retiro` | `{ cuentaId, monto, descripcion? }` |
| POST | `/api/cuenta/transferencia` | `{ cuentaOrigen, cuentaDestino, monto, descripcion? }` |
| GET | `/api/cuenta/:id/historial?limit=20` | — |

Códigos: `201` operación creada, `200` consulta, `400` datos inválidos / saldo insuficiente / misma cuenta, `404` cuenta inexistente, `500` error interno. Errores: `{ "ok": false, "status": 400, "mensaje": "..." }`.

Ejemplo:
```bash
curl -X POST http://localhost:4000/api/cuenta/transferencia -H "Content-Type: application/json" \
  -d "{\"cuentaOrigen\":\"1001-0001\",\"cuentaDestino\":\"1001-0002\",\"monto\":100}"
```

## Cómo usar la aplicación
1. Elige una cuenta en el selector de la barra superior.
2. En **Operaciones** selecciona Depósito, Retiro o Transferencia, completa el formulario y pulsa el botón.
3. El saldo y el historial se actualizan solos y aparece una notificación.

## Solución de errores comunes
| Error | Causa / solución |
|---|---|
| `Transaction numbers are only allowed on a replica set member` | MongoDB sin replica set. Sigue la sección 1. |
| `MongooseServerSelectionError` | MongoDB no está en ejecución: `net start MongoDB`. |
| La URI funciona pero la app tarda en conectar | Falta `?replicaSet=rs0` o no se hizo `rs.initiate`. |
| Error CORS en el navegador | Ajusta `CORS_ORIGIN` al puerto real del frontend. |
| "No se pudo conectar con el servidor" | El backend no está corriendo o `VITE_API_URL` es incorrecta. |
| `La cuenta ... no existe` | Ejecuta `npm run seed`. |
