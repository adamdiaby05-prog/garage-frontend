const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

async function recreateDatabase() {
  try {
    console.log('🔄 Recréation de la base de données...');
    
    // Connexion sans spécifier de base de données
    const connection = await mysql.createConnection(dbConfig);
    
    // Supprimer la base de données si elle existe
    console.log('🗑️ Suppression de l\'ancienne base de données...');
    await connection.execute('DROP DATABASE IF EXISTS garage_db');
    
    // Créer une nouvelle base de données
    console.log('🏗️ Création de la nouvelle base de données...');
    await connection.execute('CREATE DATABASE garage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    // Utiliser la nouvelle base de données
    await connection.execute('USE garage_db');
    
    // Lire le fichier SQL
    console.log('📖 Lecture du fichier garage_db.sql...');
    const sqlFile = path.join(__dirname, 'garage_db.sql');
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error('Fichier garage_db.sql non trouvé');
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Diviser le contenu SQL en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--') && !query.startsWith('/*'));
    
    console.log(`🔧 Exécution de ${queries.length} requêtes SQL...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          await connection.execute(query);
          if (i % 10 === 0) {
            console.log(`   Progression: ${i + 1}/${queries.length}`);
          }
        } catch (error) {
          console.log(`⚠️ Erreur sur la requête ${i + 1}: ${error.message}`);
          // Continuer avec les autres requêtes
        }
      }
    }
    
    // Vérifier que les tables ont été créées
    console.log('\n📊 Vérification des tables créées...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ ${tables.length} tables créées:`);
    tables.forEach(row => {
      console.log(`   - ${Object.values(row)[0]}`);
    });
    
    await connection.end();
    console.log('\n🎉 Base de données recréée avec succès !');
    console.log('✅ Vous pouvez maintenant relancer votre application');
    
  } catch (error) {
    console.error('❌ Erreur lors de la recréation:', error.message);
    console.error('💡 Vérifiez que MySQL est démarré et que vous avez les permissions nécessaires');
  }
}

recreateDatabase(); 