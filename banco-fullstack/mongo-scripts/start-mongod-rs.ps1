# Arranca mongod SIN servicio, con replica set rs0. Deja esta terminal abierta.
# Uso: powershell -ExecutionPolicy Bypass -File .\start-mongod-rs.ps1
$mongod = "C:\Program Files\MongoDB\MongoDB\Server\9.0\bin\mongod.exe"
$dbpath = "C:\data\rs0"

if (-not (Test-Path $mongod)) { Write-Error "No se encontró $mongod. Ajusta la ruta en este script."; exit 1 }
if (-not (Test-Path $dbpath)) { New-Item -ItemType Directory -Path $dbpath | Out-Null }

& $mongod --replSet rs0 --dbpath $dbpath --port 27017 --bind_ip 127.0.0.1
