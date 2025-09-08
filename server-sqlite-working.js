const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration SQLite
const dbPath = path.join(__dirname, 'garage.db');
let db;

// Initialiser la base de données SQLite
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur lors de l\'ouverture de la base de données:', err.message);
        reject(err);
      } else {
        console.log('✅ Connexion à la base de données SQLite réussie');
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

// Créer les tables
function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS clients (
        id_client INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        email TEXT,
        telephone TEXT,
        adresse TEXT,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS employes (
        id_employe INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        poste TEXT NOT NULL,
        salaire REAL,
        date_embauche DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut TEXT DEFAULT 'actif'
      )`,
      
      `CREATE TABLE IF NOT EXISTS vehicules (
        id_vehicule INTEGER PRIMARY KEY AUTOINCREMENT,
        id_client INTEGER,
        marque TEXT NOT NULL,
        modele TEXT NOT NULL,
        annee INTEGER,
        numero_immatriculation TEXT NOT NULL,
        kilometrage INTEGER,
        couleur TEXT,
        date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_client) REFERENCES clients (id_client)
      )`,
      
      `CREATE TABLE IF NOT EXISTS reparations (
        id_reparation INTEGER PRIMARY KEY AUTOINCREMENT,
        id_vehicule INTEGER,
        id_employe INTEGER,
        description TEXT NOT NULL,
        cout REAL,
        date_debut DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_fin DATETIME,
        statut TEXT DEFAULT 'en_cours',
        FOREIGN KEY (id_vehicule) REFERENCES vehicules (id_vehicule),
        FOREIGN KEY (id_employe) REFERENCES employes (id_employe)
      )`,
      
      `CREATE TABLE IF NOT EXISTS factures (
        id_facture INTEGER PRIMARY KEY AUTOINCREMENT,
        id_client INTEGER,
        id_reparation INTEGER,
        montant REAL NOT NULL,
        date_facture DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut TEXT DEFAULT 'en_attente',
        FOREIGN KEY (id_client) REFERENCES clients (id_client),
        FOREIGN KEY (id_reparation) REFERENCES reparations (id_reparation)
      )`,
      
      `CREATE TABLE IF NOT EXISTS commandes_boutique (
        id_commande INTEGER PRIMARY KEY AUTOINCREMENT,
        id_client INTEGER,
        produit TEXT NOT NULL,
        quantite INTEGER DEFAULT 1,
        prix REAL NOT NULL,
        date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut TEXT DEFAULT 'en_attente',
        FOREIGN KEY (id_client) REFERENCES clients (id_client)
      )`,
      
      `CREATE TABLE IF NOT EXISTS rendez_vous (
        id_rendez_vous INTEGER PRIMARY KEY AUTOINCREMENT,
        id_client INTEGER,
        id_vehicule INTEGER,
        date_rendez_vous DATETIME NOT NULL,
        type_service TEXT NOT NULL,
        statut TEXT DEFAULT 'planifie',
        notes TEXT,
        FOREIGN KEY (id_client) REFERENCES clients (id_client),
        FOREIGN KEY (id_vehicule) REFERENCES vehicules (id_vehicule)
      )`
    ];

    let completed = 0;
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`❌ Erreur lors de la création de la table ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Table ${index + 1} créée avec succès`);
        }
        completed++;
        if (completed === tables.length) {
          resolve();
        }
      });
    });
  });
}

// Routes API

// Dashboard - Statistiques
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  let completed = 0;
  const total = 7;

  const queries = [
    { key: 'clients', sql: 'SELECT COUNT(*) as count FROM clients' },
    { key: 'vehicules', sql: 'SELECT COUNT(*) as count FROM vehicules' },
    { key: 'reparations', sql: 'SELECT COUNT(*) as count FROM reparations' },
    { key: 'factures', sql: 'SELECT COUNT(*) as count FROM factures' },
    { key: 'employes', sql: 'SELECT COUNT(*) as count FROM employes' },
    { key: 'commandes', sql: 'SELECT COUNT(*) as count FROM commandes_boutique' },
    { key: 'rendezVous', sql: 'SELECT COUNT(*) as count FROM rendez_vous' }
  ];

  queries.forEach(query => {
    db.get(query.sql, (err, row) => {
      if (err) {
        console.error(`Erreur pour ${query.key}:`, err);
        stats[query.key] = 0;
      } else {
        stats[query.key] = row.count;
      }
      completed++;
      if (completed === total) {
        // Ajouter des statistiques supplémentaires
        stats.reparationsEnCours = stats.reparations;
        stats.reparationsTerminees = 0;
        res.json(stats);
      }
    });
  });
});

// Clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY date_creation DESC', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des clients:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/clients', (req, res) => {
  const { nom, prenom, email, telephone, adresse } = req.body;
  const sql = 'INSERT INTO clients (nom, prenom, email, telephone, adresse) VALUES (?, ?, ?, ?, ?)';
  
  db.run(sql, [nom, prenom, email, telephone, adresse], function(err) {
    if (err) {
      console.error('Erreur lors de l\'ajout du client:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ id: this.lastID, message: 'Client ajouté avec succès' });
    }
  });
});

app.put('/api/clients/:id', (req, res) => {
  const { nom, prenom, email, telephone, adresse } = req.body;
  const sql = 'UPDATE clients SET nom = ?, prenom = ?, email = ?, telephone = ?, adresse = ? WHERE id_client = ?';
  
  db.run(sql, [nom, prenom, email, telephone, adresse, req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la modification du client:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ message: 'Client modifié avec succès' });
    }
  });
});

app.delete('/api/clients/:id', (req, res) => {
  const sql = 'DELETE FROM clients WHERE id_client = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du client:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ message: 'Client supprimé avec succès' });
    }
  });
});

// Employés
app.get('/api/employes', (req, res) => {
  db.all('SELECT * FROM employes ORDER BY date_embauche DESC', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des employés:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/employes', (req, res) => {
  const { nom, prenom, poste, salaire, statut } = req.body;
  const sql = 'INSERT INTO employes (nom, prenom, poste, salaire, statut) VALUES (?, ?, ?, ?, ?)';
  
  db.run(sql, [nom, prenom, poste, salaire, statut], function(err) {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'employé:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ id: this.lastID, message: 'Employé ajouté avec succès' });
    }
  });
});

app.put('/api/employes/:id', (req, res) => {
  const { nom, prenom, poste, salaire, statut } = req.body;
  const sql = 'UPDATE employes SET nom = ?, prenom = ?, poste = ?, salaire = ?, statut = ? WHERE id_employe = ?';
  
  db.run(sql, [nom, prenom, poste, salaire, statut, req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la modification de l\'employé:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ message: 'Employé modifié avec succès' });
    }
  });
});

app.delete('/api/employes/:id', (req, res) => {
  const sql = 'DELETE FROM employes WHERE id_employe = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'employé:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ message: 'Employé supprimé avec succès' });
    }
  });
});

// Véhicules
app.get('/api/vehicules', (req, res) => {
  const sql = `
    SELECT v.*, c.nom as client_nom, c.prenom as client_prenom 
    FROM vehicules v 
    LEFT JOIN clients c ON v.id_client = c.id_client 
    ORDER BY v.date_ajout DESC
  `;
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des véhicules:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/vehicules', (req, res) => {
  const { id_client, marque, modele, annee, numero_immatriculation, kilometrage, couleur } = req.body;
  const sql = 'INSERT INTO vehicules (id_client, marque, modele, annee, numero_immatriculation, kilometrage, couleur) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.run(sql, [id_client, marque, modele, annee, numero_immatriculation, kilometrage, couleur], function(err) {
    if (err) {
      console.error('Erreur lors de l\'ajout du véhicule:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ id: this.lastID, message: 'Véhicule ajouté avec succès' });
    }
  });
});

app.put('/api/vehicules/:id', (req, res) => {
  const { id_client, marque, modele, annee, numero_immatriculation, kilometrage, couleur } = req.body;
  const sql = 'UPDATE vehicules SET id_client = ?, marque = ?, modele = ?, annee = ?, numero_immatriculation = ?, kilometrage = ?, couleur = ? WHERE id_vehicule = ?';
  
  db.run(sql, [id_client, marque, modele, annee, numero_immatriculation, kilometrage, couleur, req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la modification du véhicule:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ message: 'Véhicule modifié avec succès' });
    }
  });
});

app.delete('/api/vehicules/:id', (req, res) => {
  const sql = 'DELETE FROM vehicules WHERE id_vehicule = ?';
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du véhicule:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json({ message: 'Véhicule supprimé avec succès' });
    }
  });
});

// Réparations
app.get('/api/reparations', (req, res) => {
  const sql = `
    SELECT r.*, v.marque, v.modele, v.numero_immatriculation, 
           e.nom as employe_nom, e.prenom as employe_prenom,
           c.nom as client_nom, c.prenom as client_prenom
    FROM reparations r
    LEFT JOIN vehicules v ON r.id_vehicule = v.id_vehicule
    LEFT JOIN employes e ON r.id_employe = e.id_employe
    LEFT JOIN clients c ON v.id_client = c.id_client
    ORDER BY r.date_debut DESC
  `;
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des réparations:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Factures
app.get('/api/factures', (req, res) => {
  const sql = `
    SELECT f.*, c.nom as client_nom, c.prenom as client_prenom,
           r.description as reparation_description
    FROM factures f
    LEFT JOIN clients c ON f.id_client = c.id_client
    LEFT JOIN reparations r ON f.id_reparation = r.id_reparation
    ORDER BY f.date_facture DESC
  `;
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des factures:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Commandes
app.get('/api/commandes', (req, res) => {
  const sql = `
    SELECT co.*, c.nom as client_nom, c.prenom as client_prenom
    FROM commandes_boutique co
    LEFT JOIN clients c ON co.id_client = c.id_client
    ORDER BY co.date_commande DESC
  `;
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Boutique - Produits
app.get('/api/boutique/produits', (req, res) => {
  // Simuler des produits pour la boutique
  const produits = [
    { id: 1, nom: 'Huile moteur 5W30', prix: 25.99, stock: 50, categorie: 'Lubrifiants' },
    { id: 2, nom: 'Filtre à air', prix: 15.50, stock: 30, categorie: 'Filtres' },
    { id: 3, nom: 'Plaquettes de frein', prix: 45.00, stock: 20, categorie: 'Freinage' },
    { id: 4, nom: 'Bougies d\'allumage', prix: 8.99, stock: 100, categorie: 'Allumage' },
    { id: 5, nom: 'Courroie de distribution', prix: 35.75, stock: 15, categorie: 'Moteur' }
  ];
  
  res.json(produits);
});

// Rendez-vous
app.get('/api/rendez-vous', (req, res) => {
  const sql = `
    SELECT rv.*, c.nom as client_nom, c.prenom as client_prenom,
           v.marque, v.modele, v.numero_immatriculation
    FROM rendez_vous rv
    LEFT JOIN clients c ON rv.id_client = c.id_client
    LEFT JOIN vehicules v ON rv.id_vehicule = v.id_vehicule
    ORDER BY rv.date_rendez_vous ASC
  `;
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des rendez-vous:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Serveur SQLite fonctionnel !', timestamp: new Date().toISOString() });
});

// Démarrer le serveur
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log('🚀 Serveur SQLite démarré sur le port', PORT);
      console.log('📊 API disponible sur http://localhost:' + PORT + '/api');
      console.log('✅ Tous les boutons devraient maintenant fonctionner !');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données:', err.message);
      } else {
        console.log('✅ Base de données fermée.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

startServer();




