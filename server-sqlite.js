const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de données SQLite en mémoire
const db = new sqlite3.Database(':memory:');

// Initialisation de la base de données
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Initialisation de la base de données SQLite en mémoire...');
    
    // Créer les tables
    db.serialize(() => {
      // Table clients
      db.run(`CREATE TABLE clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        email TEXT UNIQUE,
        telephone TEXT,
        adresse TEXT,
        ville TEXT,
        code_postal TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table employes
      db.run(`CREATE TABLE employes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        email TEXT UNIQUE,
        telephone TEXT,
        role TEXT DEFAULT 'mecanicien',
        salaire DECIMAL(10,2),
        date_embauche DATE,
        statut TEXT DEFAULT 'actif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table vehicules
      db.run(`CREATE TABLE vehicules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marque TEXT NOT NULL,
        modele TEXT NOT NULL,
        immatriculation TEXT UNIQUE,
        annee INTEGER,
        kilometrage INTEGER,
        carburant TEXT,
        client_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`);

      // Table reparations
      db.run(`CREATE TABLE reparations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE,
        client_id INTEGER,
        vehicule_id INTEGER,
        employe_id INTEGER,
        probleme TEXT,
        diagnostic TEXT,
        statut TEXT DEFAULT 'en_cours',
        date_debut DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_fin DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (vehicule_id) REFERENCES vehicules (id),
        FOREIGN KEY (employe_id) REFERENCES employes (id)
      )`);

      // Table factures
      db.run(`CREATE TABLE factures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE,
        client_id INTEGER,
        reparation_id INTEGER,
        montant_ht DECIMAL(10,2),
        montant_ttc DECIMAL(10,2),
        statut TEXT DEFAULT 'brouillon',
        date_facture DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (reparation_id) REFERENCES reparations (id)
      )`);

      // Table pieces
      db.run(`CREATE TABLE pieces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        reference TEXT UNIQUE,
        categorie TEXT,
        fournisseur TEXT,
        prix_achat DECIMAL(10,2),
        prix_vente DECIMAL(10,2),
        stock_actuel INTEGER DEFAULT 0,
        stock_minimum INTEGER DEFAULT 5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table services
      db.run(`CREATE TABLE services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        description TEXT,
        categorie TEXT,
        prix DECIMAL(10,2),
        duree_estimee INTEGER,
        statut TEXT DEFAULT 'actif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table rendez_vous
      db.run(`CREATE TABLE rendez_vous (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        vehicule_id INTEGER,
        employe_id INTEGER,
        service_id INTEGER,
        date_rdv DATETIME,
        motif TEXT,
        statut TEXT DEFAULT 'en_attente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (vehicule_id) REFERENCES vehicules (id),
        FOREIGN KEY (employe_id) REFERENCES employes (id),
        FOREIGN KEY (service_id) REFERENCES services (id)
      )`);

      // Insérer des données de test
      console.log('📊 Insertion de données de test...');
      
      // Clients de test
      db.run(`INSERT INTO clients (nom, prenom, email, telephone, adresse, ville, code_postal) VALUES 
        ('Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', '123 Rue de la Paix', 'Paris', '75001'),
        ('Martin', 'Marie', 'marie.martin@email.com', '0987654321', '456 Avenue des Champs', 'Lyon', '69001'),
        ('Bernard', 'Pierre', 'pierre.bernard@email.com', '0555666777', '789 Boulevard Central', 'Marseille', '13001')`);

      // Employés de test
      db.run(`INSERT INTO employes (nom, prenom, email, telephone, role, salaire) VALUES 
        ('Dubois', 'Michel', 'michel.dubois@garage.com', '0111222333', 'mecanicien', 2500.00),
        ('Leroy', 'Sophie', 'sophie.leroy@garage.com', '0444555666', 'secretaire', 2200.00),
        ('Moreau', 'Thomas', 'thomas.moreau@garage.com', '0777888999', 'mecanicien', 2400.00)`);

      // Véhicules de test
      db.run(`INSERT INTO vehicules (marque, modele, immatriculation, annee, kilometrage, carburant, client_id) VALUES 
        ('Peugeot', '308', 'AB-123-CD', 2020, 45000, 'Essence', 1),
        ('Renault', 'Clio', 'EF-456-GH', 2019, 32000, 'Diesel', 2),
        ('Citroën', 'C3', 'IJ-789-KL', 2021, 18000, 'Essence', 3)`);

      // Réparations de test
      db.run(`INSERT INTO reparations (numero, client_id, vehicule_id, employe_id, probleme, diagnostic, statut) VALUES 
        ('REP-2024-001', 1, 1, 1, 'Problème de démarrage', 'Batterie déchargée', 'termine'),
        ('REP-2024-002', 2, 2, 3, 'Bruit moteur', 'Vidange nécessaire', 'en_cours'),
        ('REP-2024-003', 3, 3, 1, 'Freins qui grincent', 'Plaquettes usées', 'en_cours')`);

      // Factures de test
      db.run(`INSERT INTO factures (numero, client_id, reparation_id, montant_ht, montant_ttc, statut) VALUES 
        ('FAC-2024-001', 1, 1, 120.00, 144.00, 'payee'),
        ('FAC-2024-002', 2, 2, 85.00, 102.00, 'brouillon'),
        ('FAC-2024-003', 3, 3, 95.00, 114.00, 'brouillon')`);

      // Pièces de test
      db.run(`INSERT INTO pieces (nom, reference, categorie, fournisseur, prix_achat, prix_vente, stock_actuel) VALUES 
        ('Filtre à huile', 'FIL-001', 'Filtres', 'Bosch', 8.50, 15.00, 25),
        ('Plaquettes de frein', 'PLA-001', 'Freinage', 'Valeo', 25.00, 45.00, 15),
        ('Batterie', 'BAT-001', 'Électricité', 'Varta', 65.00, 120.00, 8)`);

              // Services de test
        db.run(`INSERT INTO services (nom, description, categorie, prix, duree_estimee) VALUES 
          ('Vidange', 'Vidange d''huile et changement de filtre', 'Entretien', 45.00, 60),
          ('Diagnostic', 'Diagnostic électronique véhicule', 'Diagnostic', 35.00, 30),
          ('Révision complète', 'Révision complète du véhicule', 'Entretien', 120.00, 120)`);

      // Rendez-vous de test
      db.run(`INSERT INTO rendez_vous (client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut) VALUES 
        (1, 1, 1, 1, '2024-01-15 10:00:00', 'Vidange annuelle', 'confirme'),
        (2, 2, 3, 2, '2024-01-16 14:00:00', 'Bruit moteur', 'en_attente'),
        (3, 3, 1, 3, '2024-01-17 09:00:00', 'Révision complète', 'confirme')`);

      console.log('✅ Base de données initialisée avec succès');
      resolve();
    });
  });
}

// Routes pour les clients
app.get('/api/clients', async (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des clients:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/clients', async (req, res) => {
  const { nom, prenom, email, telephone, adresse, ville, code_postal } = req.body;
  db.run(
    'INSERT INTO clients (nom, prenom, email, telephone, adresse, ville, code_postal) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nom, prenom, email, telephone, adresse, ville, code_postal],
    function(err) {
      if (err) {
        console.error('Erreur lors de l\'ajout du client:', err);
        res.status(500).json({ error: 'Erreur serveur' });
      } else {
        res.status(201).json({ id: this.lastID, message: 'Client ajouté avec succès' });
      }
    }
  );
});

// Routes pour les employés
app.get('/api/employes', async (req, res) => {
  db.all('SELECT * FROM employes ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des employés:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les véhicules
app.get('/api/vehicules', async (req, res) => {
  db.all(`
    SELECT v.*, c.nom || ' ' || c.prenom as client_nom 
    FROM vehicules v 
    JOIN clients c ON v.client_id = c.id 
    ORDER BY v.created_at DESC
  `, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des véhicules:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les réparations
app.get('/api/reparations', async (req, res) => {
  db.all(`
    SELECT r.*, 
           c.nom || ' ' || c.prenom as client_nom,
           e.nom || ' ' || e.prenom as employe_nom,
           v.marque || ' ' || v.modele || ' - ' || v.immatriculation as vehicule_info
    FROM reparations r
    JOIN clients c ON r.client_id = c.id
    LEFT JOIN employes e ON r.employe_id = e.id
    JOIN vehicules v ON r.vehicule_id = v.id
    ORDER BY r.date_debut DESC
  `, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des réparations:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les factures
app.get('/api/factures', async (req, res) => {
  db.all(`
    SELECT f.*, 
           c.nom || ' ' || c.prenom as client_nom,
           r.numero as reparation_numero
    FROM factures f
    JOIN clients c ON f.client_id = c.id
    LEFT JOIN reparations r ON f.reparation_id = r.id
    ORDER BY f.date_facture DESC
  `, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des factures:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les pièces
app.get('/api/pieces', async (req, res) => {
  db.all('SELECT * FROM pieces ORDER BY nom', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des pièces:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les services
app.get('/api/services', async (req, res) => {
  db.all('SELECT * FROM services ORDER BY nom', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des services:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les rendez-vous
app.get('/api/rendez-vous', async (req, res) => {
  db.all(`
    SELECT rv.*, 
           c.nom || ' ' || c.prenom as client_nom,
           e.nom || ' ' || e.prenom as employe_nom,
           v.marque || ' ' || v.modele || ' - ' || v.immatriculation as vehicule_info,
           s.nom as service_nom
    FROM rendez_vous rv
    JOIN clients c ON rv.client_id = c.id
    LEFT JOIN employes e ON rv.employe_id = e.id
    JOIN vehicules v ON rv.vehicule_id = v.id
    LEFT JOIN services s ON rv.service_id = s.id
    ORDER BY rv.date_rdv DESC
  `, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des rendez-vous:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Routes pour les statistiques du tableau de bord
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    db.get('SELECT COUNT(*) as count FROM clients', (err, clientsCount) => {
      if (err) throw err;
      
      db.get('SELECT COUNT(*) as count FROM vehicules', (err, vehiculesCount) => {
        if (err) throw err;
        
        db.get('SELECT COUNT(*) as count FROM reparations', (err, reparationsCount) => {
          if (err) throw err;
          
          db.get('SELECT COUNT(*) as count FROM factures', (err, facturesCount) => {
            if (err) throw err;
            
            db.get("SELECT COUNT(*) as count FROM reparations WHERE statut = 'en_cours'", (err, reparationsEnCours) => {
              if (err) throw err;
              
              db.get("SELECT COUNT(*) as count FROM reparations WHERE statut = 'termine'", (err, reparationsTerminees) => {
                if (err) throw err;
                
                res.json({
                  clients: clientsCount.count,
                  vehicules: vehiculesCount.count,
                  reparations: reparationsCount.count,
                  factures: facturesCount.count,
                  reparationsEnCours: reparationsEnCours.count,
                  reparationsTerminees: reparationsTerminees.count
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Garage avec SQLite fonctionne correctement!' });
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur SQLite démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`💾 Base de données SQLite en mémoire initialisée`);
      console.log(`📝 Données de test chargées`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
