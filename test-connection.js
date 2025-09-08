const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'garage_db',
    port: process.env.DB_PORT || 3306
  };
  
  console.log('📍 Configuration:', `${config.host}:${config.port}/${config.database}`);
  console.log('👤 Utilisateur:', config.user);
  console.log('🔑 Mot de passe:', config.password ? '***' : '(vide)');
  console.log();
  
  try {
    // Test de connexion
    console.log('🔄 Tentative de connexion...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion réussie !');
    
    // Test des tables
    console.log('\n📊 Vérification des tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables trouvées:', tables.length);
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  - ${tableName}: ${count[0].count} enregistrements`);
    }
    
    // Test spécifique des employés (mécaniciens)
    console.log('\n🔧 Test des mécaniciens...');
    try {
      const [employes] = await connection.execute(`
        SELECT id, nom, prenom, email, telephone, role, specialite, poste, statut
        FROM employes
        WHERE LOWER(role) LIKE '%mec%'
           OR LOWER(specialite) LIKE '%mec%'
        ORDER BY nom ASC, prenom ASC
      `);
      console.log(`✅ Mécaniciens trouvés: ${employes.length}`);
      employes.forEach(emp => {
        console.log(`  - ${emp.prenom || ''} ${emp.nom || ''} (${emp.role || 'N/A'})`);
      });
    } catch (error) {
      console.log('❌ Erreur lors de la requête employés:', error.message);
    }
    
    await connection.end();
    console.log('\n🎉 Base de données prête pour l\'IA !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Solutions possibles :');
    console.log('1. Démarrer MySQL/XAMPP');
    console.log('2. Vérifier les informations de connexion dans config.env');
    console.log('3. Créer la base de données : CREATE DATABASE garage_db;');
    console.log('4. Vérifier les permissions utilisateur');
  }
}

testDatabaseConnection(); 