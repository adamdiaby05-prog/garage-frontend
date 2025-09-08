const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables de la base de données...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Récupérer toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Nombre total de tables: ${tables.length}`);
    
    // Vérifier chaque table importante
    const importantTables = ['clients', 'vehicules', 'reparations', 'factures', 'employes', 'pieces', 'rendez_vous', 'services'];
    
    for (const tableName of importantTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${countResult[0].count} enregistrements`);
      } catch (error) {
        console.log(`❌ ${tableName}: Erreur - ${error.message}`);
      }
    }
    
    // Test des requêtes du dashboard
    console.log('\n🧪 Test des requêtes du dashboard:');
    
    try {
      const [clientsCount] = await connection.execute('SELECT COUNT(*) as count FROM clients');
      console.log(`✅ Clients: ${clientsCount[0].count}`);
    } catch (error) {
      console.log(`❌ Erreur clients: ${error.message}`);
    }
    
    try {
      const [vehiculesCount] = await connection.execute('SELECT COUNT(*) as count FROM vehicules');
      console.log(`✅ Véhicules: ${vehiculesCount[0].count}`);
    } catch (error) {
      console.log(`❌ Erreur véhicules: ${error.message}`);
    }
    
    try {
      const [reparationsCount] = await connection.execute('SELECT COUNT(*) as count FROM reparations');
      console.log(`✅ Réparations: ${reparationsCount[0].count}`);
    } catch (error) {
      console.log(`❌ Erreur réparations: ${error.message}`);
    }
    
    try {
      const [facturesCount] = await connection.execute('SELECT COUNT(*) as count FROM factures');
      console.log(`✅ Factures: ${facturesCount[0].count}`);
    } catch (error) {
      console.log(`❌ Erreur factures: ${error.message}`);
    }
    
    try {
      const [reparationsEnCours] = await connection.execute("SELECT COUNT(*) as count FROM reparations WHERE statut = 'en_cours'");
      console.log(`✅ Réparations en cours: ${reparationsEnCours[0].count}`);
    } catch (error) {
      console.log(`❌ Erreur réparations en cours: ${error.message}`);
    }
    
    try {
      const [reparationsTerminees] = await connection.execute("SELECT COUNT(*) as count FROM reparations WHERE statut = 'termine'");
      console.log(`✅ Réparations terminées: ${reparationsTerminees[0].count}`);
    } catch (error) {
      console.log(`❌ Erreur réparations terminées: ${error.message}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

checkTables(); 