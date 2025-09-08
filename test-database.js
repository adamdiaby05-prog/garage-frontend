const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

async function testDatabase() {
  let pool;
  
  try {
    console.log('🔄 Test de connexion à la base de données...');
    console.log(`📍 Configuration: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test de connexion
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données établie avec succès');
    connection.release();
    
    // Vérifier les tables
    console.log('\n📋 Vérification des tables...');
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('Tables disponibles:', tables.map(t => Object.values(t)[0]));
    
    // Vérifier la table clients
    console.log('\n👥 Vérification de la table clients...');
    const [clients] = await pool.execute('SELECT COUNT(*) as count FROM clients');
    console.log('Nombre de clients:', clients[0].count);
    
    // Vérifier la table reparations
    console.log('\n🔧 Vérification de la table reparations...');
    const [reparations] = await pool.execute('SELECT COUNT(*) as count FROM reparations');
    console.log('Nombre de réparations:', reparations[0].count);
    
    // Vérifier la table factures
    console.log('\n🧾 Vérification de la table factures...');
    try {
      const [factures] = await pool.execute('SELECT COUNT(*) as count FROM factures');
      console.log('Nombre de factures:', factures[0].count);
    } catch (error) {
      console.log('❌ Table factures n\'existe pas ou erreur:', error.message);
    }
    
    // Vérifier la structure de la table clients
    console.log('\n🔍 Structure de la table clients...');
    const [clientStructure] = await pool.execute('DESCRIBE clients');
    console.log('Colonnes clients:', clientStructure.map(col => col.Field));
    
    // Vérifier la structure de la table reparations
    console.log('\n🔍 Structure de la table reparations...');
    const [reparationStructure] = await pool.execute('DESCRIBE reparations');
    console.log('Colonnes reparations:', reparationStructure.map(col => col.Field));
    
  } catch (error) {
    console.error('❌ Erreur lors du test de la base de données:', error.message);
    console.error('💡 Vérifiez que:');
    console.error('   - MySQL est démarré');
    console.error('   - Les informations de connexion sont correctes dans config.env');
    console.error('   - La base de données "garage_db" existe');
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

testDatabase();
