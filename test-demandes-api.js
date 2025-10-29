const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testAPI() {
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
    
    console.log('🔍 Test de la requête API des demandes de prestations...');
    
    const [rows] = await pool.execute(`
      SELECT 
        dp.id,
        dp.client_id,
        dp.vehicule_id,
        dp.service_id,
        dp.garage_id,
        dp.date_demande,
        dp.date_souhaitee,
        dp.description_probleme,
        dp.statut,
        dp.prix_estime,
        dp.duree_estimee,
        dp.created_at,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        c.telephone as client_telephone,
        v.marque as vehicule_marque,
        v.modele as vehicule_modele,
        v.immatriculation as vehicule_immatriculation,
        s.nom as service_nom,
        s.description as service_description,
        s.prix as service_prix,
        g.nom as garage_nom
      FROM demandes_prestations dp
      LEFT JOIN clients c ON dp.client_id = c.id
      LEFT JOIN vehicules v ON dp.vehicule_id = v.id
      LEFT JOIN services s ON dp.service_id = s.id
      LEFT JOIN garages g ON dp.garage_id = g.id
      ORDER BY dp.created_at DESC
    `);
    
    console.log('✅ Requête réussie');
    console.log('Nombre de demandes:', rows.length);
    console.log('Première demande:', rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();
