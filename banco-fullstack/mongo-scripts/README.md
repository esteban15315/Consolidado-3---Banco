# Scripts de MongoDB (guardados para más adelante)

Nada de esta carpeta se ha ejecutado. Úsalos cuando instales MongoDB Community Server y mongosh.

| Archivo | Uso |
|---|---|
| `init-replica-set.ps1` | Automático (PowerShell como administrador): edita `mongod.cfg`, reinicia el servicio e inicia el replica set `rs0`. |
| `rs-initiate.js` | Manual: `mongosh --file rs-initiate.js` si ya arrancaste `mongod` con `replSetName: rs0`. |
| `mongod-manual.txt` | Alternativa sin servicio: arrancar `mongod` a mano con `--replSet rs0`. |

Comprobación: `mongosh --eval "rs.status().members[0].stateStr"` debe devolver `PRIMARY`.
