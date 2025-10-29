const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function checkGaragesTable() {
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
    
    console.log('🔍 Vérification de la table garages...');
    const [structure] = await pool.execute('DESCRIBE garages');
    console.log('Structure de la table garages:');
    structure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    const [rows] = await pool.execute('SELECT * FROM garages LIMIT 1');
    console.log('Exemple de données:', rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkGaragesTable();
