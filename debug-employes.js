const mysql = require('mysql2/promise');

async function debugEmployes() {
  console.log('🔍 Debug de la table employés...\n');
  
  try {
    // Connexion à la base
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'garage_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('✅ Connexion établie');
    
    // Vérifier la structure de la table
    console.log('\n📋 Structure de la table employés:');
    const [structure] = await pool.execute('DESCRIBE employes');
    console.log(structure);
    
    // Vérifier le contenu
    console.log('\n📊 Contenu de la table employés:');
    const [rows] = await pool.execute('SELECT * FROM employes LIMIT 5');
    console.log('Nombre d\'employés:', rows.length);
    console.log('Données:', JSON.stringify(rows, null, 2));
    
    // Test de la requête utilisée par l'IA
    console.log('\n🔍 Test de la requête IA:');
    try {
      const [testRows] = await pool.execute(
        `SELECT nom, prenom, email, telephone, role, specialite, poste, statut
         FROM employes
         ORDER BY nom ASC, prenom ASC`
      );
      console.log('✅ Requête IA réussie, employés trouvés:', testRows.length);
      console.log('Premier employé:', testRows[0]);
    } catch (error) {
      console.log('❌ Erreur requête IA:', error.message);
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugEmployes(); 