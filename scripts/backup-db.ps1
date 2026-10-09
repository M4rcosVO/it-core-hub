# Script de Backup Automatico do Banco PostgreSQL (it-core-db)
# Gellak IT Core Hub

$ErrorActionPreference = "Stop"

$baseDir = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $baseDir "backups"

if (-not (Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "Diretorio de backups criado em: $backupDir"
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$tempSqlFile = Join-Path $backupDir "it_core_hub_$timestamp.sql"
$zipFile = Join-Path $backupDir "it_core_hub_$timestamp.zip"

Write-Host "Iniciando dump do banco de dados no conteiner it-core-db..."
docker exec it-core-db pg_dump -U admin it_core_hub | Out-File -FilePath $tempSqlFile -Encoding utf8

if ((Test-Path -Path $tempSqlFile) -and ((Get-Item $tempSqlFile).Length -gt 0)) {
    Write-Host "Compactando arquivo de backup para ZIP..."
    Compress-Archive -Path $tempSqlFile -DestinationPath $zipFile -Force
    Remove-Item -Path $tempSqlFile -Force

    $fileSize = "{0:N2} KB" -f ((Get-Item $zipFile).Length / 1KB)
    Write-Host "Backup concluido com sucesso: $zipFile ($fileSize)"
} else {
    Write-Error "Falha ao gerar arquivo de dump SQL ou arquivo vazio."
}

# Politica de Retencao: Manter ultimos 7 dias e excluir mais antigos
Write-Host "Aplicando politica de retencao de 7 dias..."
$cutoffDate = (Get-Date).AddDays(-7)
$oldBackups = Get-ChildItem -Path $backupDir -Filter "it_core_hub_*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

foreach ($old in $oldBackups) {
    Write-Host "Removendo backup expirado: $($old.Name)"
    Remove-Item -Path $old.FullName -Force
}

Write-Host "Rotina de backup finalizada."
