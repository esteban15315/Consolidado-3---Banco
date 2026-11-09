# GUARDADO PARA DESPUÉS - NO se ha ejecutado.
# Ejecutar en PowerShell como ADMINISTRADOR, después de instalar MongoDB Community y mongosh.
# Configura un replica set de un solo nodo (necesario para transacciones).

$cfg = Get-ChildItem "C:\Program Files\MongoDB\Server\*\bin\mongod.cfg" | Select-Object -Last 1
if (-not $cfg) { Write-Error "No se encontró mongod.cfg. ¿Está instalado MongoDB como servicio?"; exit 1 }

net stop MongoDB

$contenido = Get-Content $cfg.FullName -Raw
if ($contenido -notmatch 'replSetName') {
    Add-Content -Path $cfg.FullName -Value "`r`nreplication:`r`n  replSetName: rs0"
    Write-Host "replSetName agregado a $($cfg.FullName)"
}

net start MongoDB
Start-Sleep -Seconds 3

mongosh --quiet --eval "try { rs.status().ok } catch (e) { rs.initiate({_id:'rs0', members:[{_id:0, host:'127.0.0.1:27017'}]}) }"
Start-Sleep -Seconds 3
mongosh --quiet --eval "rs.status().members[0].stateStr"   # Debe mostrar PRIMARY
