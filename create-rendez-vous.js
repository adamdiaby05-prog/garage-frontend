const mysql = require('mysql2/promise');

async function createRendezVousTable() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'garage_db'
  });

  try {
    console.log('🔄 Création de la table rendez_vous...');

    // Créer la table rendez_vous
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`rendez_vous\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`client_id\` int(11) NOT NULL,
        \`vehicule_id\` int(11) NOT NULL,
        \`employe_id\` int(11) DEFAULT NULL,
        \`service_id\` int(11) DEFAULT NULL,
        \`date_rdv\` datetime NOT NULL,
        \`motif\` text DEFAULT NULL,
        \`statut\` enum('en_attente','confirme','annule','termine') DEFAULT 'en_attente',
        \`date_creation\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`fk_rdv_client\` (\`client_id\`),
        KEY \`fk_rdv_vehicule\` (\`vehicule_id\`),
        KEY \`fk_rdv_employe\` (\`employe_id\`),
        KEY \`fk_rdv_service\` (\`service_id\`),
        CONSTRAINT \`fk_rdv_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id_client\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_rdv_vehicule\` FOREIGN KEY (\`vehicule_id\`) REFERENCES \`vehicules\` (\`id_vehicule\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_rdv_employe\` FOREIGN KEY (\`employe_id\`) REFERENCES \`employes\` (\`id_employe\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_rdv_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Table rendez_vous créée avec succès');

    // Vérifier le contenu
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM rendez_vous');
    console.log('📊 Rendez-vous dans la base de données:', rows[0].count);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table rendez_vous:', error);
  } finally {
    await pool.end();
  }
}

createRendezVousTable(); 