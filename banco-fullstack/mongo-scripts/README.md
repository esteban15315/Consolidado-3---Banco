# Scripts de MongoDB

Flujo para MongoDB **sin servicio** (mongod arrancado a mano):

| Archivo | Uso |
|---|---|
| `start-mongod-rs.ps1` | Arranca mongod con `--replSet rs0` y datos en `C:\data\rs0`. Déjalo abierto en su terminal. |
| `init-rs-manual.ps1` | Una sola vez, con mongod corriendo: inicia `rs0` y muestra el estado (debe ser `PRIMARY`). |
| `rs-initiate.js` | Script de mongosh que usa `init-rs-manual.ps1`. |
| `mongod-manual.txt` | Los mismos pasos escritos a mano. |
| `init-replica-set.ps1` | Solo si MongoDB está instalado como servicio de Windows (edita `mongod.cfg`). |

Las rutas de mongod/mongosh están fijadas en los scripts; ajústalas si tu instalación es distinta.

Comprobación: `mongosh --eval "rs.status().members[0].stateStr"` debe devolver `PRIMARY`.
