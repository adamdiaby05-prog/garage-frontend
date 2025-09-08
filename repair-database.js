const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

async function repairDatabase() {
  try {
    console.log('🔧 Réparation de la base de données...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Liste des tables à réparer
    const tables = [
      'clients', 'employes', 'factures', 'pieces', 'pieces_utilisees',
      'rendez_vous', 'reparations', 'services', 'vehicules'
    ];
    
    for (const table of tables) {
      try {
        console.log(`🔧 Réparation de la table ${table}...`);
        
        // Essayer de réparer la table
        await connection.execute(`REPAIR TABLE ${table}`);
        console.log(`✅ Table ${table} réparée`);
        
        // Vérifier que la table fonctionne
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${countResult[0].count} enregistrements`);
        
      } catch (error) {
        console.log(`❌ Erreur avec ${table}: ${error.message}`);
        
        // Si la réparation échoue, essayer de recréer la table
        if (error.message.includes("doesn't exist in engine")) {
          console.log(`🔄 Tentative de recréation de la table ${table}...`);
          try {
            // Supprimer la table si elle existe
            await connection.execute(`DROP TABLE IF EXISTS ${table}`);
            console.log(`🗑️ Table ${table} supprimée`);
          } catch (dropError) {
            console.log(`⚠️ Impossible de supprimer ${table}: ${dropError.message}`);
          }
        }
      }
    }
    
    await connection.end();
    console.log('\n🎉 Réparation terminée !');
    console.log('💡 Si des tables sont manquantes, importez le fichier garage_db.sql dans phpMyAdmin');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

repairDatabase(); 