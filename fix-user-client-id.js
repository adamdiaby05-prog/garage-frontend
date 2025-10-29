const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'config.env' });

async function fixUserClientId() {
  let connection;
  
  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Connexion à la base de données établie');

    // Vérifier l'utilisateur ID 5
    const [users] = await connection.execute(
      'SELECT id, email, role, client_id FROM utilisateurs WHERE id = 5'
    );

    console.log('👤 Utilisateur ID 5:', users[0]);

    if (users.length === 0) {
      console.log('❌ Utilisateur ID 5 non trouvé');
      return;
    }

    const user = users[0];
    
    if (!user.client_id) {
      console.log('🔧 L\'utilisateur n\'a pas de client_id, création d\'un client...');
      
      // Créer un client pour cet utilisateur
      const [clientResult] = await connection.execute(
        'INSERT INTO clients (nom, prenom, email, telephone, adresse, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [user.email.split('@')[0], user.email.split('@')[0], user.email, '0000000000', 'Adresse par défaut']
      );

      const clientId = clientResult.insertId;
      console.log('✅ Client créé avec ID:', clientId);

      // Mettre à jour l'utilisateur avec le client_id
      await connection.execute(
        'UPDATE utilisateurs SET client_id = ? WHERE id = ?',
        [clientId, user.id]
      );

      console.log('✅ Utilisateur mis à jour avec client_id:', clientId);
    } else {
      console.log('✅ L\'utilisateur a déjà un client_id:', user.client_id);
    }

    // Vérifier les véhicules du client
    const [vehicules] = await connection.execute(
      'SELECT COUNT(*) as count FROM vehicules WHERE client_id = ?',
      [user.client_id || clientId]
    );

    console.log('🚗 Nombre de véhicules du client:', vehicules[0].count);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixUserClientId();
