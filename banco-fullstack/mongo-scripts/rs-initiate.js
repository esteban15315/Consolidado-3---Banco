// Alternativa manual (dentro de mongosh): mongosh --file rs-initiate.js
// Requiere que mongod ya esté iniciado con --replSet rs0 o replSetName: rs0 en mongod.cfg
rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] });
printjson(rs.status().members[0].stateStr);
