const mysql = require('mysql2/promise');

async function createRendezVousTableSimple() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'garage_db'
  });

  try {
    console.log('🔄 Création de la table rendez_vous (version simplifiée)...');

    // Supprimer la table si elle existe
    await pool.execute('DROP TABLE IF EXISTS `rendez_vous`');

    // Créer la table rendez_vous sans contraintes de clés étrangères
    await pool.execute(`
      CREATE TABLE \`rendez_vous\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`client_id\` int(11) NOT NULL,
        \`vehicule_id\` int(11) NOT NULL,
        \`employe_id\` int(11) DEFAULT NULL,
        \`service_id\` int(11) DEFAULT NULL,
        \`date_rdv\` datetime NOT NULL,
        \`motif\` text DEFAULT NULL,
        \`statut\` enum('en_attente','confirme','annule','termine') DEFAULT 'en_attente',
        \`date_creation\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Table rendez_vous créée avec succès (sans contraintes FK)');

    // Vérifier le contenu
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM rendez_vous');
    console.log('📊 Rendez-vous dans la base de données:', rows[0].count);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table rendez_vous:', error);
  } finally {
    await pool.end();
  }
}

createRendezVousTableSimple(); 