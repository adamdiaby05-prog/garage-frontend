@echo off
echo ========================================
echo   Test de Connexion XAMPP MySQL
echo ========================================
echo.

echo 1. Test de la connexion MySQL...
echo    - Verification que MySQL repond sur le port 3306
echo.

echo 2. Test de la base de donnees garage_db...
echo    - Verification que la base existe
echo    - Test de la connexion avec les parametres configures
echo.

echo 3. Demarrage du test...
echo.
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

async function testConnection() {
  try {
    console.log('🔄 Test de connexion a MySQL...');
    console.log(\`📍 Configuration: \${dbConfig.host}:\${dbConfig.port}/\${dbConfig.database}\`);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion a MySQL reussie !');
    
    // Test d'une requete simple
    const [rows] = await connection.execute('SHOW TABLES');
    console.log(\`📊 Nombre de tables trouvees: \${rows.length}\`);
    
    if (rows.length > 0) {
      console.log('📋 Tables disponibles:');
      rows.forEach(row => {
        console.log(\`   - \${Object.values(row)[0]}\`);
      });
    }
    
    await connection.end();
    console.log('\\n🎉 Test de connexion reussi !');
    console.log('✅ Votre base de donnees est operationnelle');
    console.log('✅ Vous pouvez maintenant lancer start-xampp.bat');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('\\n💡 Solutions possibles:');
    console.error('   1. Demarrez MySQL dans XAMPP Control Panel');
    console.error('   2. Verifiez que le port 3306 est disponible');
    console.error('   3. Importez le fichier garage_db.sql dans phpMyAdmin');
    console.error('   4. Verifiez les parametres dans config.env');
  }
}

testConnection();
"

echo.
echo ========================================
echo   Test termine !
echo ========================================
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul 