# Inicia el replica set rs0 (una sola vez). Requiere mongod corriendo con start-mongod-rs.ps1.
$mongosh = "C:\Program Files\MongoDB\MongoDB\mongosh-2.14.1-win32-x64\bin\mongosh.exe"

if (-not (Test-Path $mongosh)) { Write-Error "No se encontró $mongosh. Ajusta la ruta en este script."; exit 1 }

& $mongosh --quiet --file "$PSScriptRoot\rs-initiate.js"
Start-Sleep -Seconds 3
& $mongosh --quiet --eval "rs.status().members[0].stateStr"
