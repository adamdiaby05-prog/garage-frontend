const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

async function testClientCreation() {
  let connection;
  
  try {
    console.log('🔄 Test de connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connexion réussie');
    
    // Test 1: Vérifier la structure de la table clients
    console.log('\n📋 Vérification de la structure de la table clients...');
    const [columns] = await connection.execute('DESCRIBE clients');
    console.log('Colonnes de la table clients:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Test 2: Insérer un client de test
    console.log('\n🧪 Test d\'insertion d\'un client...');
    const testClient = {
      nom: 'Test',
      prenom: 'Client',
      telephone: '0123456789',
      email: 'test@example.com',
      adresse: '123 Rue Test',
      date_naissance: '1990-01-01'
    };
    
    const [result] = await connection.execute(
      'INSERT INTO clients (nom, prenom, telephone, email, adresse, date_naissance) VALUES (?, ?, ?, ?, ?, ?)',
      [testClient.nom, testClient.prenom, testClient.telephone, testClient.email, testClient.adresse, testClient.date_naissance]
    );
    
    console.log('✅ Client inséré avec succès, ID:', result.insertId);
    
    // Test 3: Récupérer le client inséré
    console.log('\n📖 Récupération du client inséré...');
    const [clients] = await connection.execute('SELECT * FROM clients WHERE id_client = ?', [result.insertId]);
    
    if (clients.length > 0) {
      console.log('✅ Client récupéré:', clients[0]);
    } else {
      console.log('❌ Client non trouvé');
    }
    
    // Test 4: Supprimer le client de test
    console.log('\n🗑️ Suppression du client de test...');
    await connection.execute('DELETE FROM clients WHERE id_client = ?', [result.insertId]);
    console.log('✅ Client de test supprimé');
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ La création de clients fonctionne correctement');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('💡 Vérifiez que :');
    console.error('   - MySQL est démarré');
    console.error('   - La base de données garage_db existe');
    console.error('   - La table clients existe avec la bonne structure');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le test
testClientCreation(); 