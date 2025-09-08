@echo off
echo 🗄️ Démarrage de la base de données pour l'IA...
echo ================================================
echo.

echo 🔍 Vérification des services MySQL disponibles...
echo.

echo 📋 Services MySQL trouvés :
sc query | findstr /i "mysql"
echo.

echo 🔍 Vérification de XAMPP...
if exist "C:\xampp\mysql\bin\mysqld.exe" (
    echo ✅ XAMPP MySQL trouvé
    echo 🚀 Démarrage de XAMPP MySQL...
    start /B "C:\xampp\mysql\bin\mysqld.exe" --console
    timeout /t 3 /nobreak >nul
) else (
    echo ❌ XAMPP MySQL non trouvé
)

echo 🔍 Vérification de MySQL standard...
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" (
    echo ✅ MySQL Server 8.0 trouvé
    echo 🚀 Démarrage de MySQL Server...
    start /B "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --console
    timeout /t 3 /nobreak >nul
) else (
    echo ❌ MySQL Server 8.0 non trouvé
)

echo 🔍 Vérification de MySQL 5.7...
if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqld.exe" (
    echo ✅ MySQL Server 5.7 trouvé
    echo 🚀 Démarrage de MySQL Server...
    start /B "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqld.exe" --console
    timeout /t 3 /nobreak >nul
) else (
    echo ❌ MySQL Server 5.7 non trouvé
)

echo.
echo ⏳ Attente du démarrage de MySQL...
timeout /t 5 /nobreak >nul

echo 🧪 Test de connexion à la base de données...
node test-connection.js

echo.
echo 💡 Si MySQL ne démarre pas automatiquement :
echo 1. Ouvrez XAMPP Control Panel
echo 2. Cliquez sur "Start" à côté de MySQL
echo 3. Ou installez MySQL : https://dev.mysql.com/downloads/installer/
echo.
pause
