const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

// Pool de connexions MySQL
let pool;

// Initialisation de la connexion à la base de données
async function initializeDatabase() {
  try {
    console.log('🔄 Tentative de connexion à la base de données...');
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
    
    // Vérifier les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Nombre de tables trouvées: ${tables.length}`);
    
    if (tables.length === 0) {
      console.log('⚠️ Aucune table trouvée. L\'application fonctionnera avec des données par défaut.');
    }
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.log('⚠️ Le serveur démarrera sans base de données');
  }
}

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Garage fonctionne correctement!',
    timestamp: new Date().toISOString(),
    database: pool ? 'connecté' : 'non connecté'
  });
});

// Route pour les statistiques du tableau de bord (avec gestion d'erreurs)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    if (!pool) {
      return res.json({
        clients: 0,
        vehicules: 0,
        reparations: 0,
        factures: 0,
        reparationsEnCours: 0,
        reparationsTerminees: 0,
        message: 'Base de données non connectée'
      });
    }

    // Fonction pour compter de manière sécurisée
    async function safeCount(tableName, whereClause = '') {
      try {
        const query = whereClause ? 
          `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}` :
          `SELECT COUNT(*) as count FROM ${tableName}`;
        const [result] = await pool.execute(query);
        return result[0].count;
      } catch (error) {
        console.log(`⚠️ Erreur avec la table ${tableName}: ${error.message}`);
        return 0;
      }
    }

    // Récupération des statistiques avec gestion d'erreur
    const stats = {
      clients: await safeCount('clients'),
      vehicules: await safeCount('vehicules'),
      reparations: await safeCount('reparations'),
      factures: await safeCount('factures'),
      reparationsEnCours: await safeCount('reparations', "statut = 'en_cours'"),
      reparationsTerminees: await safeCount('reparations', "statut = 'termine'")
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.json({
      clients: 0,
      vehicules: 0,
      reparations: 0,
      factures: 0,
      reparationsEnCours: 0,
      reparationsTerminees: 0,
      error: 'Base de données en cours de réparation'
    });
  }
});

// Route pour les employés (avec gestion d'erreurs)
app.get('/api/employes', async (req, res) => {
  try {
    if (!pool) {
      return res.json([]);
    }
    const [rows] = await pool.execute('SELECT * FROM employes ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.json([]);
  }
});

// Route pour les clients (avec gestion d'erreurs)
app.get('/api/clients', async (req, res) => {
  try {
    if (!pool) {
      return res.json([]);
    }
    const [rows] = await pool.execute('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.json([]);
  }
});

// Route pour les véhicules (avec gestion d'erreurs)
app.get('/api/vehicules', async (req, res) => {
  try {
    if (!pool) {
      return res.json([]);
    }
    const [rows] = await pool.execute('SELECT * FROM vehicules ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.json([]);
  }
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  });
}

startServer().catch(console.error); 