# Script pour lier les utilisateurs role='garage' aux garages existants
# Ce script associe automatiquement les utilisateurs garage aux garages de la table garages

# Charger les variables d'environnement
$envFile = "config.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Configuration de la base de données
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$dbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "garage_db" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }

Write-Host "🔗 Liaison des utilisateurs garage aux garages existants..." -ForegroundColor Cyan

# Chemin vers mysql.exe
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
}
if (-not (Test-Path $mysqlPath)) {
    $mysqlPath = "mysql"
}

# Script SQL pour lier les utilisateurs garage aux garages
$sqlScript = @"
USE $dbName;

SELECT 'Utilisateurs garage sans garage_id:' as info;
SELECT id, nom, prenom, email, garage_id, role FROM utilisateurs WHERE role = 'garage' AND garage_id IS NULL;

SELECT 'Garages disponibles:' as info;
SELECT id, nom_garage, email, ville FROM garages ORDER BY id;

UPDATE utilisateurs u 
JOIN garages g ON u.email = g.email 
SET u.garage_id = g.id 
WHERE u.role = 'garage' AND u.garage_id IS NULL;

UPDATE utilisateurs u 
CROSS JOIN (SELECT MIN(id) as first_garage_id FROM garages) g
SET u.garage_id = g.first_garage_id 
WHERE u.role = 'garage' AND u.garage_id IS NULL;

SELECT 'Resultat final - Utilisateurs garage lies:' as info;
SELECT u.id, u.nom, u.prenom, u.email, u.garage_id, g.nom_garage, g.ville
FROM utilisateurs u 
LEFT JOIN garages g ON u.garage_id = g.id 
WHERE u.role = 'garage';

SELECT 'Statistiques:' as info;
SELECT 
    COUNT(*) as total_utilisateurs_garage,
    COUNT(garage_id) as utilisateurs_lies,
    COUNT(*) - COUNT(garage_id) as utilisateurs_non_lies
FROM utilisateurs 
WHERE role = 'garage';
"@

try {
    # Exécuter le script SQL
    $result = & $mysqlPath -h $dbHost -P $dbPort -u $dbUser -p$dbPassword -e $sqlScript 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Liaison des utilisateurs garage terminée avec succès!" -ForegroundColor Green
        Write-Host "📊 Résultats:" -ForegroundColor Yellow
        Write-Host $result
    } else {
        Write-Host "❌ Erreur lors de la liaison des utilisateurs garage:" -ForegroundColor Red
        Write-Host $result
    }
} catch {
    Write-Host "❌ Erreur d'exécution: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔗 Script de liaison terminé." -ForegroundColor Cyan
