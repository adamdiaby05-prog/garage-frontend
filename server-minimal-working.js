const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 5000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Serveur minimal fonctionne !' });
});

app.get('/api/boutique/produits', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id_produit as id,
        reference,
        nom_produit as nom,
        description,
        prix,
        stock,
        categorie,
        image,
        note,
        nombre_avis
      FROM produits 
      ORDER BY id_produit DESC
    `);
    res.json(rows);
  } catch (error) {
    console.warn('Erreur /api/commandes. Retour [] temporaire.', error);
    return res.json([]);
  }
});

app.post('/api/boutique/produits', async (req, res) => {
  try {
    const { nom, reference, description, prix, stock, categorie, image, note, nombreAvis } = req.body;
    
    if (!nom || !prix || stock < 0) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO produits (
        nom_produit, description, prix, stock, categorie, reference, image, note, nombre_avis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nom, description, prix, stock, categorie, reference, image, note || 4.0, nombreAvis || 0]);
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour un produit
app.put('/api/boutique/produits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, reference, description, prix, stock, categorie, image, note, nombreAvis } = req.body;
    
    const [result] = await pool.execute(`
      UPDATE produits SET 
        nom_produit = ?, description = ?, prix = ?, stock = ?, 
        categorie = ?, reference = ?, image = ?, note = ?, nombre_avis = ?
      WHERE id_produit = ?
    `, [nom, description, prix, stock, categorie, reference, image, note, nombreAvis, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ success: true, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour supprimer un produit
app.delete('/api/boutique/produits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM produits WHERE id_produit = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/boutique/produits/:produitId/photos', async (req, res) => {
  try {
    const { produitId } = req.params;
    const [rows] = await pool.execute(`
      SELECT * FROM photos_produits WHERE produit_id = ? ORDER BY est_principale DESC, date_creation ASC
    `, [produitId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/boutique/produits/:produitId/photos', async (req, res) => {
  try {
    const { produitId } = req.params;
    const { nom_fichier, type_mime, image_data, est_principale = false } = req.body;
    
    if (!nom_fichier || !type_mime || !image_data) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    const taille_fichier = image_data.length;
    
    if (est_principale) {
      await pool.execute('UPDATE photos_produits SET est_principale = FALSE WHERE produit_id = ?', [produitId]);
    }
    
    const [result] = await pool.execute(`
      INSERT INTO photos_produits (
        produit_id, nom_fichier, chemin_fichier, type_mime, 
        taille_fichier, image_data, est_principale
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      produitId,
      nom_fichier,
      `photos/produit_${produitId}/${nom_fichier}`,
      type_mime,
      taille_fichier,
      image_data,
      est_principale
    ]);
    
    res.json({ success: true, photo_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ---- List endpoints backed by DB when tables exist (fallback to []) ----
async function safeSelectAllByIdFallback(res, tableName) {
  try {
    const [rows] = await pool.execute(`SELECT * FROM ${tableName} ORDER BY id DESC`);
    return res.json(rows);
  } catch (error) {
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`Table absente: ${tableName}. Retour []`);
      return res.json([]);
    }
    if (error && error.code === 'ER_BAD_FIELD_ERROR') {
      try {
        const [rows2] = await pool.execute(`SELECT * FROM ${tableName} ORDER BY 1 DESC`);
        return res.json(rows2);
      } catch (error2) {
        if (error2 && (error2.code === 'ER_NO_SUCH_TABLE' || error2.code === 'ER_BAD_FIELD_ERROR')) {
          try {
            const [rows3] = await pool.execute(`SELECT * FROM ${tableName}`);
            return res.json(rows3);
          } catch (error3) {
            console.error('Erreur SELECT (fallback final):', error3);
            return res.status(500).json({ error: 'Erreur serveur' });
          }
        }
        console.error('Erreur SELECT (fallback 2):', error2);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
    }
    console.error('Erreur SELECT:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

app.get('/api/rendez-vous', (req, res) => safeSelectAllByIdFallback(res, 'rendez_vous'));
// Employés branchés sur la table users (fallback employes si présente)
app.get('/api/employes', async (req, res) => {
  try {
    // Source principale: users
    try {
      const [users] = await pool.execute('SELECT id, nom, prenom, email, role, created_at FROM users ORDER BY id DESC');
      const mapped = (users || []).map(u => ({
        id_employe: u.id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: '',
        poste: u.role, // admin/mecanicien/client
        salaire: null,
        actif: 1,
        date_embauche: u.created_at
      }));
      return res.json(mapped);
    } catch (e1) {
      if (!(e1 && (e1.code === 'ER_NO_SUCH_TABLE' || e1.code === 'ER_BAD_TABLE_ERROR'))) {
        console.warn('Lecture users pour employes:', e1.message || e1);
      }
    }

    // Fallback: table employes si disponible
    return safeSelectAllByIdFallback(res, 'employes');
  } catch (error) {
    console.error('/api/employes error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// Suppression d'un employé (hard delete) - ATTENTION: pas de vérif FK ici
app.delete('/api/employes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Priorité: supprimer dans users (branche principale)
    try {
      const [rUsers] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      if (rUsers.affectedRows > 0) {
        return res.json({ success: true });
      }
    } catch (eUsers) {
      if (!(eUsers && (eUsers.code === 'ER_NO_SUCH_TABLE' || eUsers.code === 'ER_BAD_TABLE_ERROR'))) {
        console.warn('Suppression users:', eUsers.message || eUsers);
      }
    }

    // Fallback: table employes (id_employe)
    try {
      const [rEmp] = await pool.execute('DELETE FROM employes WHERE id_employe = ?', [id]);
      if (rEmp.affectedRows > 0) {
        return res.json({ success: true });
      }
    } catch (eEmp) {
      if (eEmp && eEmp.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: "Impossible de supprimer: employé référencé par des réparations. Désactivez-le d'abord." });
      }
      if (!(eEmp && (eEmp.code === 'ER_NO_SUCH_TABLE' || eEmp.code === 'ER_BAD_TABLE_ERROR'))) {
        console.warn('Suppression employes:', eEmp.message || eEmp);
      }
    }

    return res.status(404).json({ error: 'Employé non trouvé' });
  } catch (error) {
    if (error && error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: "Impossible de supprimer: employé référencé par des réparations. Désactivez-le d'abord." });
    }
    console.error('Erreur suppression employé:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.get('/api/services', (req, res) => safeSelectAllByIdFallback(res, 'services'));
app.get('/api/fournisseurs', (req, res) => safeSelectAllByIdFallback(res, 'fournisseurs'));
app.get('/api/pieces', (req, res) => safeSelectAllByIdFallback(res, 'pieces'));
app.get('/api/reparations', (req, res) => safeSelectAllByIdFallback(res, 'reparations'));
app.get('/api/vehicules', (req, res) => safeSelectAllByIdFallback(res, 'vehicules'));
app.get('/api/factures', (req, res) => safeSelectAllByIdFallback(res, 'factures'));
// Clients branchés sur la table users (role = 'client')
app.get('/api/clients', async (req, res) => {
  try {
    // Source principale: users avec role = 'client'
    try {
      const [users] = await pool.execute("SELECT id, nom, prenom, email, role, created_at FROM users WHERE role = 'client' ORDER BY id DESC");
      const mapped = (users || []).map(u => ({
        id_client: u.id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: '',
        adresse: '',
        ville: '',
        code_postal: '',
        date_inscription: u.created_at,
        statut: 'actif'
      }));
      return res.json(mapped);
    } catch (e1) {
      if (!(e1 && (e1.code === 'ER_NO_SUCH_TABLE' || e1.code === 'ER_BAD_TABLE_ERROR'))) {
        console.warn('Lecture users pour clients:', e1.message || e1);
      }
    }

    // Fallback: table clients si disponible
    return safeSelectAllByIdFallback(res, 'clients');
  } catch (error) {
    console.error('/api/clients error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Création d'un client (dans la table users avec role = 'client')
app.post('/api/clients', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, adresse, ville, code_postal } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({ error: 'Nom, prénom et email requis' });
    }

    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer le client dans la table users
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10); // Mot de passe par défaut
    
    const [result] = await pool.execute(
      'INSERT INTO users (nom, prenom, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [nom, prenom, email, hashedPassword, 'client']
    );

    res.status(201).json({
      success: true,
      id_client: result.insertId,
      message: 'Client créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création' });
  }
});

// Modification d'un client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, adresse, ville, code_postal } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({ error: 'Nom, prénom et email requis' });
    }

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre client' });
    }

    // Mettre à jour dans la table users
    const [result] = await pool.execute(
      'UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ? AND role = "client"',
      [nom, prenom, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({ success: true, message: 'Client modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification client:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la modification' });
  }
});

// Suppression d'un client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supprimer de la table users (seulement les clients)
    const [result] = await pool.execute('DELETE FROM users WHERE id = ? AND role = "client"', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({ success: true, message: 'Client supprimé avec succès' });
  } catch (error) {
    if (error && error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: "Impossible de supprimer: client référencé par des commandes. Désactivez-le d'abord." });
    }
    console.error('Erreur suppression client:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  const getCount = async (table) => {
    try {
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
      return rows[0]?.count || 0;
    } catch (e) {
      if (e && (e.code === 'ER_NO_SUCH_TABLE' || e.code === 'ER_BAD_TABLE_ERROR')) {
        return 0;
      }
      console.error(`Erreur count ${table}:`, e);
      return 0;
    }
  };

  try {
    const [produits, commandes, clients, employes, vehicules, reparations, factures] = await Promise.all([
      getCount('produits'),
      getCount('commandes_boutique'),
      getCount('clients'),
      getCount('employes'),
      getCount('vehicules'),
      getCount('reparations'),
      getCount('factures')
    ]);

    res.json({
      produits,
      commandes,
      clients,
      employes,
      vehicules,
      reparations,
      factures,
      revenus: 0
    });
  } catch (error) {
    console.error('Erreur /api/dashboard/stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const user = users[0];
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      'dev_secret_change_me', 
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/commandes', async (req, res) => {
  try {
    const { produit, quantite, client, position } = req.body;
    
    if (!produit || !quantite || !client) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO commandes_boutique (
        id_produit, nom_produit, reference_produit, prix_produit, image_produit,
        quantite, nom_client, email_client, telephone_client, adresse_client,
        latitude, longitude, statut, date_commande
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      produit.id, produit.nom, produit.reference, produit.prix, produit.image,
      quantite, client.nom, client.email, client.telephone, client.adresse,
      position?.lat || null, position?.lng || null, 'en_attente'
    ]);
    
    res.json({ success: true, commande_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET commandes (manquant pour CommandesPage)
app.get('/api/commandes', async (req, res) => {
  try {
    console.log('🔍 Tentative de lecture des commandes...');
    const [rows] = await pool.execute(`
      SELECT 
        id_commande as id,
        id_produit,
        nom_produit,
        reference_produit,
        prix_produit,
        image_produit,
        quantite,
        nom_client,
        email_client,
        telephone_client,
        adresse_client,
        latitude,
        longitude,
        statut,
        date_commande
      FROM commandes_boutique
      ORDER BY date_commande DESC
    `);
    console.log(`✅ ${rows.length} commandes trouvées`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur /api/commandes:', error);
    if (error && (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_TABLE_ERROR')) {
      console.warn('Table commandes_boutique absente. Retour [] temporaire.');
      return res.json([]);
    }
    if (error && error.code === 'ER_BAD_FIELD_ERROR') {
      console.warn('Colonne manquante dans commandes_boutique. Retour [] temporaire.');
      return res.json([]);
    }
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ---- DB bootstrap to ensure required tables exist ----
async function initializeDatabase() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS commandes_boutique (
        id_commande INT AUTO_INCREMENT PRIMARY KEY,
        id_produit INT,
        nom_produit VARCHAR(255),
        reference_produit VARCHAR(255),
        prix_produit DECIMAL(10,2),
        image_produit LONGTEXT,
        quantite INT,
        nom_client VARCHAR(255),
        email_client VARCHAR(255),
        telephone_client VARCHAR(50),
        adresse_client VARCHAR(500),
        latitude DECIMAL(10,6) NULL,
        longitude DECIMAL(10,6) NULL,
        statut VARCHAR(50) DEFAULT 'en_attente',
        date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table commandes_boutique prête');
  } catch (err) {
    console.error('❌ Échec init DB:', err);
  }
}

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur minimal fonctionnel démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  });
});
