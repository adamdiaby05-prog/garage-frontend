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
  res.json({ message: 'Serveur ultra simple fonctionne !' });
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
    res.status(500).json({ error: 'Erreur serveur' });
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

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [produitsCount] = await pool.execute('SELECT COUNT(*) as count FROM produits');
    res.json({
      produits: produitsCount[0].count,
      commandes: 0,
      users: 0,
      revenus: 0
    });
  } catch (error) {
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

app.listen(PORT, () => {
  console.log(`🚀 Serveur ultra simple démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
});

console.log('🔍 Serveur en cours de démarrage...');
