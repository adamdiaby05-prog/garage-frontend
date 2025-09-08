const mysql = require('mysql2/promise');
const express = require('express');
const http = require('http');
require('dotenv').config();

console.log('🔍 DIAGNOSTIC COMPLET - GARAGE ADMIN');
console.log('=====================================\n');

// 1. Vérification de la configuration
console.log('📋 1. VÉRIFICATION DE LA CONFIGURATION');
console.log('----------------------------------------');
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306,
  serverPort: process.env.PORT || 5000
};

console.log('Configuration détectée:');
console.log(`  - DB_HOST: ${config.host}`);
console.log(`  - DB_USER: ${config.user}`);
console.log(`  - DB_PASSWORD: ${config.password ? '***' : '(vide)'}`);
console.log(`  - DB_NAME: ${config.database}`);
console.log(`  - DB_PORT: ${config.port}`);
console.log(`  - SERVER_PORT: ${config.serverPort}`);
console.log('');

// 2. Test de connexion MySQL
async function testMySQLConnection() {
  console.log('🗄️ 2. TEST DE CONNEXION MYSQL');
  console.log('--------------------------------');
  
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port
    });
    
    console.log('✅ Connexion MySQL réussie');
    
    // Vérifier si la base de données existe
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === config.database);
    
    if (dbExists) {
      console.log(`✅ Base de données "${config.database}" existe`);
      
      // Utiliser la base de données
      await connection.execute(`USE ${config.database}`);
      
      // Vérifier les tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`✅ ${tables.length} tables trouvées:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`    - ${tableName}`);
      });
      
      // Vérifier la structure de la table clients
      if (tables.some(table => Object.values(table)[0] === 'clients')) {
        console.log('\n📋 Structure de la table clients:');
        const [columns] = await connection.execute('DESCRIBE clients');
        columns.forEach(col => {
          console.log(`    - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      }
      
    } else {
      console.log(`❌ Base de données "${config.database}" n'existe pas`);
      console.log('💡 Exécutez: node setup-database.js');
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ Erreur de connexion MySQL:', error.message);
    console.log('💡 Vérifiez que:');
    console.log('   - XAMPP est démarré');
    console.log('   - MySQL est en cours d\'exécution');
    console.log('   - Les paramètres de connexion sont corrects');
  }
  console.log('');
}

// 3. Test du serveur Express
async function testExpressServer() {
  console.log('🌐 3. TEST DU SERVEUR EXPRESS');
  console.log('--------------------------------');
  
  try {
    const app = express();
    app.use(express.json());
    
    // Route de test simple
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Serveur Express fonctionne !' });
    });
    
    // Démarrer le serveur
    const server = app.listen(config.serverPort, () => {
      console.log(`✅ Serveur Express démarré sur le port ${config.serverPort}`);
      
      // Tester la route
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: config.serverPort,
        path: '/api/test',
        method: 'GET'
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('✅ Route API testée avec succès:', response.message);
          } catch (e) {
            console.log('⚠️ Réponse reçue mais non-JSON:', data);
          }
          server.close();
        });
      });
      
      req.on('error', (error) => {
        console.log('❌ Erreur lors du test de la route:', error.message);
        server.close();
      });
      
      req.end();
      
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`❌ Port ${config.serverPort} déjà utilisé`);
        console.log('💡 Arrêtez l\'application qui utilise ce port ou changez le port dans config.env');
      } else {
        console.log('❌ Erreur serveur:', error.message);
      }
    });
    
  } catch (error) {
    console.log('❌ Erreur lors du test du serveur:', error.message);
  }
  console.log('');
}

// 4. Test des dépendances
function testDependencies() {
  console.log('📦 4. VÉRIFICATION DES DÉPENDANCES');
  console.log('------------------------------------');
  
  try {
    const mysql2 = require('mysql2/promise');
    console.log('✅ mysql2 installé');
  } catch (error) {
    console.log('❌ mysql2 non installé');
    console.log('💡 Exécutez: npm install mysql2');
  }
  
  try {
    const express = require('express');
    console.log('✅ express installé');
  } catch (error) {
    console.log('❌ express non installé');
    console.log('💡 Exécutez: npm install express');
  }
  
  try {
    const dotenv = require('dotenv');
    console.log('✅ dotenv installé');
  } catch (error) {
    console.log('❌ dotenv non installé');
    console.log('💡 Exécutez: npm install dotenv');
  }
  
  console.log('');
}

// 5. Recommandations
function showRecommendations() {
  console.log('💡 5. RECOMMANDATIONS');
  console.log('----------------------');
  
  console.log('Si vous avez des erreurs:');
  console.log('1. Démarrez XAMPP et MySQL');
  console.log('2. Exécutez: node setup-database.js');
  console.log('3. Démarrez le serveur: node server.js');
  console.log('4. Dans un autre terminal: npm start');
  console.log('');
  console.log('Ou utilisez le script automatique: start-complete.bat');
  console.log('');
}

// Exécuter tous les tests
async function runDiagnostic() {
  testDependencies();
  await testMySQLConnection();
  await testExpressServer();
  showRecommendations();
  
  console.log('🎯 DIAGNOSTIC TERMINÉ');
  console.log('======================');
}

runDiagnostic().catch(console.error); 