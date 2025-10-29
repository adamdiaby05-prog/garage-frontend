const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testTable() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('🔍 Vérification de la table demandes_prestations...');
    const [tables] = await pool.execute('SHOW TABLES LIKE "demandes_prestations"');
    console.log('Tables trouvées:', tables);
    
    if (tables.length > 0) {
      console.log('✅ Table demandes_prestations existe');
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM demandes_prestations');
      console.log('Nombre de demandes:', rows[0].count);
      
      // Vérifier la structure de la table
      const [structure] = await pool.execute('DESCRIBE demandes_prestations');
      console.log('Structure de la table:');
      structure.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('❌ Table demandes_prestations n\'existe pas');
      
      // Créer la table
      console.log('🔧 Création de la table demandes_prestations...');
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS demandes_prestations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          client_id INT NOT NULL,
          vehicule_id INT,
          service_id INT,
          garage_id INT,
          date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
          date_souhaitee DATETIME,
          description_probleme TEXT,
          statut ENUM('en_attente', 'acceptee', 'refusee', 'en_cours', 'terminee') DEFAULT 'en_attente',
          prix_estime DECIMAL(10,2),
          duree_estimee INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
          FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE SET NULL,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
          FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE SET NULL
        )
      `);
      console.log('✅ Table demandes_prestations créée');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testTable();
