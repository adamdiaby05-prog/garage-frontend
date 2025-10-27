// Charger les variables d'environnement en premier
require('dotenv').config({ path: './config.env' });

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/images';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique pour l'image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: function (req, file, cb) {
    // Vérifier le type de fichier
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images (JPEG, PNG, GIF, WEBP) sont autorisées'), false);
    }
  }
});

// Middleware CORS
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.FRONTEND_ORIGIN || ''
].filter(Boolean));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    const isVercel = /\.vercel\.app$/i.test(new URL(origin).hostname || '');
    if (isVercel) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========== ROUTES POUR SERVIR LES IMAGES ==========
// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour télécharger une image directement
app.get('/api/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, 'uploads', 'images', filename);
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Image non trouvée' });
  }
  
  // Envoyer le fichier
  res.sendFile(filepath);
});

// Route pour uploader une seule image
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    
    // Construire l'URL complète de l'image
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      filename: req.file.filename,
      url: imageUrl,
      path: req.file.path,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erreur upload image:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// Route pour uploader plusieurs images
app.post('/api/upload/images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    
    const images = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/images/${file.filename}`,
      path: file.path,
      size: file.size
    }));
    
    res.json({
      success: true,
      message: `${images.length} image(s) uploadée(s) avec succès`,
      images: images
    });
  } catch (error) {
    console.error('Erreur upload images:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
  }
});

// Route pour supprimer une image
app.delete('/api/images/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, 'uploads', 'images', filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Image non trouvée' });
    }
    
    // Supprimer le fichier
    fs.unlinkSync(filepath);
    
    res.json({
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression image:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
  }
});

// ========== ROUTES POUR LES PRODUITS AVEC IMAGES ==========

// Créer un produit avec image
app.post('/api/boutique/produits', upload.single('image'), async (req, res) => {
  try {
    const { nom, description, prix, stock, categorie, reference, note, nombreAvis } = req.body;
    
    if (!nom || !prix || !stock) {
      return res.status(400).json({ error: 'Nom, prix et stock sont obligatoires' });
    }
    
    // URL de l'image uploadée
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO produits (nom_produit, description, prix, stock, categorie, reference, image, note, nombre_avis) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, description || null, parseFloat(prix), parseInt(stock), categorie || 'Général', 
       reference || null, imageUrl, parseFloat(note) || 4.0, parseInt(nombreAvis) || 0]
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Produit créé avec succès', 
      id: result.insertId,
      image: imageUrl
    });
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// Mettre à jour un produit avec nouvelle image
app.put('/api/boutique/produits/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, stock, categorie, reference } = req.body;
    
    // Récupérer l'ancienne image si elle existe
    const [oldRows] = await pool.execute('SELECT image FROM produits WHERE id = ?', [id]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    let imageUrl = oldRows[0].image;
    
    // Si nouvelle image uploadée
    if (req.file) {
      imageUrl = `/uploads/images/${req.file.filename}`;
      
      // Supprimer l'ancienne image si elle existe
      if (oldRows[0].image) {
        const oldImagePath = path.join(__dirname, oldRows[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    await pool.execute(
      `UPDATE produits SET nom_produit = ?, description = ?, prix = ?, stock = ?, 
       categorie = ?, reference = ?, image = ? WHERE id = ?`,
      [nom, description, parseFloat(prix), parseInt(stock), categorie, reference, imageUrl, id]
    );
    
    res.json({ 
      success: true,
      message: 'Produit modifié avec succès',
      image: imageUrl
    });
  } catch (error) {
    console.error('Erreur modification produit:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// ========== ROUTES POUR LES VÉHICULES BOUTIQUE AVEC IMAGES ==========

// Créer un véhicule avec image
app.post('/api/boutique/vehicules', upload.single('image'), async (req, res) => {
  try {
    const { type_produit, nom, marque, modele, annee, couleur, prix, stock,
            kilometrage, carburant, transmission, puissance, description,
            statut, type_vente, categorie, reference } = req.body;
    
    if (!type_produit || !nom || !marque || !prix) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;
    
    if (type_produit === 'voiture') {
      if (!modele || !annee) {
        return res.status(400).json({ error: 'Modèle et année obligatoires pour une voiture' });
      }
      
      const [result] = await pool.execute(`
        INSERT INTO vehicules_boutique 
        (marque, modele, annee, couleur, prix_vente, prix_location_jour, 
         kilometrage, carburant, transmission, puissance, description, 
         image_principale, statut, type_vente, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [marque, modele, annee, couleur, prix, prix,
          kilometrage || 0, carburant || 'Essence', transmission || 'Manuelle', 
          puissance || '', description || '', imageUrl, 
          statut || 'disponible', type_vente || 'vente']);
      
      res.json({ 
        success: true, 
        product_id: result.insertId,
        message: 'Véhicule créé avec succès',
        image: imageUrl
      });
    } else if (type_produit === 'piece') {
      const [result] = await pool.execute(`
        INSERT INTO pieces_detachees 
        (nom, description, prix, stock, categorie, marque, reference, 
         image_principale, type_produit, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [nom, description || '', prix, stock || 0, categorie || '', marque, 
          reference || '', imageUrl, 'piece']);
      
      res.json({ 
        success: true, 
        product_id: result.insertId,
        message: 'Pièce détachée créée avec succès',
        image: imageUrl
      });
    } else {
      return res.status(400).json({ error: 'Type de produit invalide' });
    }
  } catch (error) {
    console.error('Erreur création produit boutique:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// ========== HELPER POUR NETTOYER LES URLS D'IMAGES ==========
function normalizeImageUrl(url) {
  if (!url) return null;
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si ça commence par /uploads, c'est bon
  if (url.startsWith('/uploads/')) {
    return url;
  }
  
  // Si c'est juste un nom de fichier, ajouter le chemin complet
  if (!url.includes('/')) {
    return `/uploads/images/${url}`;
  }
  
  return url;
}

// ========== ROUTES DATABASE ET AUTRES ==========
// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garage_db',
  port: process.env.DB_PORT || 3306
};

let pool;

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
    
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données établie avec succès');
    connection.release();
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    pool = null;
  }
}

// Routes de santé
app.get('/', (req, res) => {
  res.send('Garage API backend is running - Images enabled');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    uptime: process.uptime(), 
    timestamp: Date.now(),
    uploads: fs.existsSync('uploads/images') ? 'enabled' : 'disabled'
  });
});

// Test upload
app.get('/api/test-upload', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads', 'images');
  const exists = fs.existsSync(uploadDir);
  
  res.json({
    uploadDir: uploadDir,
    exists: exists,
    writable: exists ? fs.accessSync(uploadDir, fs.constants.W_OK) === undefined : false,
    files: exists ? fs.readdirSync(uploadDir).length : 0
  });
});

// ========== ROUTES AUTHENTIFICATION ==========
// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne correctement' });
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const dbUser = rows[0];
    const isPasswordValid = await bcrypt.compare(mot_de_passe, dbUser.mot_de_passe);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      role: (dbUser.role && dbUser.role.trim()) || dbUser.type_compte || 'client',
      type_compte: dbUser.type_compte || 'client',
      nom: dbUser.nom || '',
      prenom: dbUser.prenom || '',
      client_id: dbUser.client_id || null,
      garage_id: dbUser.garage_id || null
    };
    
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les informations de l'utilisateur connecté
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Récupérer les données utilisateur depuis la base de données
    const [rows] = await pool.execute(
      'SELECT * FROM utilisateurs WHERE id = ?',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const dbUser = rows[0];
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      role: (dbUser.role && dbUser.role.trim()) || dbUser.type_compte || 'client',
      type_compte: dbUser.type_compte || 'client',
      nom: dbUser.nom || '',
      prenom: dbUser.prenom || '',
      client_id: dbUser.client_id || null,
      garage_id: dbUser.garage_id || null
    };
    
    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, mot_de_passe, nom, prenom, telephone, type_compte } = req.body;
    
    if (!email || !mot_de_passe || !nom || !prenom) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const userType = type_compte || 'client';
    
    // Créer l'utilisateur
    const [userResult] = await pool.execute(
      'INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, telephone, type_compte, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nom, prenom, telephone || '', userType, userType]
    );
    
    const userId = userResult.insertId;
    let clientId = null;
    
    // Si c'est un client, créer aussi un enregistrement dans la table clients
    if (userType === 'client') {
      const [clientResult] = await pool.execute(
        'INSERT INTO clients (nom, prenom, email, telephone, created_at) VALUES (?, ?, ?, ?, NOW())',
        [nom, prenom, email, telephone || '']
      );
      
      clientId = clientResult.insertId;
      
      // Mettre à jour l'utilisateur avec le client_id
      await pool.execute(
        'UPDATE utilisateurs SET client_id = ? WHERE id = ?',
        [clientId, userId]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: userId,
      clientId: clientId,
      userType: userType
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES BOUTIQUE ==========
// Récupérer tous les produits (véhicules + pièces)
app.get('/api/boutique/vehicules', async (req, res) => {
  try {
    // Récupérer les véhicules
    const [vehiculesRows] = await pool.execute(`
      SELECT
        id,
        marque,
        modele,
        annee,
        couleur,
        prix_vente as prix,
        kilometrage,
        carburant,
        transmission,
        puissance,
        statut,
        type_vente,
        image_principale as image,
        description,
        created_at,
        updated_at
      FROM vehicules_boutique
      ORDER BY created_at DESC
    `);

    // Récupérer les pièces détachées
    const [piecesRows] = await pool.execute(`
      SELECT
        id,
        nom,
        description,
        prix,
        stock,
        categorie,
        marque,
        reference,
        image_principale as image,
        type_produit,
        created_at,
        updated_at
      FROM pieces_detachees
      ORDER BY created_at DESC
    `);

    const vehicules = vehiculesRows.map(row => ({
      id: row.id,
      nom: `${row.marque} ${row.modele}`,
      marque: row.marque,
      modele: row.modele,
      annee: row.annee,
      couleur: row.couleur,
      prix: parseFloat(row.prix) || 0,
      kilometrage: row.kilometrage,
      carburant: row.carburant,
      transmission: row.transmission,
      puissance: row.puissance,
      statut: row.statut,
      type_vente: row.type_vente,
      image: row.image,
      description: row.description,
      type_produit: 'voiture',
      stock: row.statut === 'disponible' ? 1 : 0,
      categorie: `${row.marque} - ${row.annee}`,
      reference: `${row.marque}-${row.modele}-${row.annee}`,
      note: '4.5',
      nombreAvis: 0
    }));

    const pieces = piecesRows.map(row => ({
      id: row.id + 10000, // ID décalé pour éviter les conflits
      nom: row.nom,
      marque: row.marque,
      prix: parseFloat(row.prix) || 0,
      stock: row.stock || 0,
      categorie: row.categorie,
      reference: row.reference,
      image: row.image,
      description: row.description,
      type_produit: 'piece',
      note: '4.5',
      nombreAvis: 0
    }));

    // Combiner les deux listes
    const allProducts = [...vehicules, ...pieces];

    res.json(allProducts);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un produit (véhicule ou pièce)
app.put('/api/boutique/vehicules/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type_produit, nom, marque, modele, annee, couleur, prix, stock,
      kilometrage, carburant, transmission, puissance, description,
      image, statut, type_vente, categorie, reference
    } = req.body;
    
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : image;
    
    if (type_produit === 'voiture') {
      // Mettre à jour un véhicule
      const [existingRows] = await pool.execute(
        'SELECT id FROM vehicules_boutique WHERE id = ?',
        [id]
      );
      
      if (existingRows.length === 0) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
      }
      
      await pool.execute(`
        UPDATE vehicules_boutique SET 
          marque = ?, modele = ?, annee = ?, couleur = ?, 
          prix_vente = ?, prix_location_jour = ?, kilometrage = ?,
          carburant = ?, transmission = ?, puissance = ?, 
          description = ?, image_principale = ?, statut = ?, 
          type_vente = ?, updated_at = NOW()
        WHERE id = ?
      `, [marque, modele, annee, couleur, prix, prix, // prix_location_jour = prix
          kilometrage || 0, carburant || 'Essence', transmission || 'Manuelle', 
          puissance || '', description || '', imageUrl || '', 
          statut || 'disponible', type_vente || 'vente', id]);
      
      res.json({ message: 'Véhicule modifié avec succès' });
    } else if (type_produit === 'piece') {
      // Mettre à jour une pièce détachée
      const [existingRows] = await pool.execute(
        'SELECT id FROM pieces_detachees WHERE id = ?',
        [id]
      );
      
      if (existingRows.length === 0) {
        return res.status(404).json({ error: 'Pièce non trouvée' });
      }
      
      await pool.execute(`
        UPDATE pieces_detachees SET 
          nom = ?, description = ?, prix = ?, stock = ?, 
          categorie = ?, marque = ?, reference = ?, 
          image_principale = ?, updated_at = NOW()
        WHERE id = ?
      `, [nom, description || '', prix, stock || 0, categorie || '', 
          marque, reference || '', imageUrl || '', id]);
      
      res.json({ message: 'Pièce détachée modifiée avec succès' });
    } else {
      return res.status(400).json({ error: 'Type de produit invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un produit
app.delete('/api/boutique/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Essayer de supprimer un véhicule
    const [vehiculeRows] = await pool.execute(
      'SELECT id FROM vehicules_boutique WHERE id = ?',
      [id]
    );
    
    if (vehiculeRows.length > 0) {
      await pool.execute('DELETE FROM vehicules_boutique WHERE id = ?', [id]);
      res.json({ message: 'Véhicule supprimé avec succès' });
      return;
    }
    
    // Essayer de supprimer une pièce
    const [pieceRows] = await pool.execute(
      'SELECT id FROM pieces_detachees WHERE id = ?',
      [id]
    );
    
    if (pieceRows.length > 0) {
      await pool.execute('DELETE FROM pieces_detachees WHERE id = ?', [id]);
      res.json({ message: 'Pièce détachée supprimée avec succès' });
      return;
    }
    
    res.status(404).json({ error: 'Produit non trouvé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES DEMANDES ==========
// Créer une demande d'achat
app.post('/api/boutique/demandes/achat', async (req, res) => {
  try {
    const { vehicule_id, nom, email, telephone, message } = req.body;
    
    if (!vehicule_id || !nom || !email) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO demandes_achat (vehicule_id, nom, email, telephone, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [vehicule_id, nom, email, telephone || '', message || '']
    );
    
    res.json({
      success: true,
      message: 'Demande d\'achat envoyée avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création demande achat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une demande d'emprunt
app.post('/api/boutique/demandes/emprunt', async (req, res) => {
  try {
    const { vehicule_id, nom, email, telephone, localisation, revenus, profession, garant, telephoneGarant, dateDebutEmprunt, dateFinEmprunt } = req.body;
    
    if (!vehicule_id || !nom || !email) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO demandes_emprunt (vehicule_id, nom, email, telephone, localisation, revenus, profession, garant, telephoneGarant, dateDebutEmprunt, dateFinEmprunt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [vehicule_id, nom, email, telephone || '', localisation || '', revenus || '', profession || '', garant || '', telephoneGarant || '', dateDebutEmprunt || '', dateFinEmprunt || '']
    );
    
    res.json({
      success: true,
      message: 'Demande d\'emprunt envoyée avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création demande emprunt:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour les statistiques du dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Récupérer les statistiques générales
    const [vehiculesCount] = await pool.execute('SELECT COUNT(*) as count FROM vehicules_boutique');
    const [piecesCount] = await pool.execute('SELECT COUNT(*) as count FROM pieces_detachees');
    const [commandesCount] = await pool.execute('SELECT COUNT(*) as count FROM commandes_boutique');
    const [clientsCount] = await pool.execute('SELECT COUNT(*) as count FROM utilisateurs WHERE type_compte = "client"');
    
    res.json({
      vehicules: vehiculesCount[0].count,
      pieces: piecesCount[0].count,
      commandes: commandesCount[0].count,
      clients: clientsCount[0].count,
      totalProduits: vehiculesCount[0].count + piecesCount[0].count
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES VENTE VÉHICULES ==========
// Mettre un véhicule en vente
app.post('/api/vente/vehicules', upload.single('image'), async (req, res) => {
  try {
    const { vehicule_id, user_id, prix_vente, description } = req.body;
    
    if (!vehicule_id || !user_id || !prix_vente) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [user_id]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    // Vérifier que le véhicule appartient au client
    const [vehiculeRows] = await pool.execute(
      'SELECT id FROM vehicules WHERE id = ? AND client_id = ?',
      [vehicule_id, client_id]
    );
    
    if (vehiculeRows.length === 0) {
      return res.status(403).json({ error: 'Ce véhicule ne vous appartient pas' });
    }
    
    // Vérifier si le véhicule n'est pas déjà en vente
    const [existingRows] = await pool.execute(
      'SELECT id FROM vehicules_vente WHERE vehicule_id = ? AND statut = "en_vente"',
      [vehicule_id]
    );
    
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Ce véhicule est déjà en vente' });
    }
    
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      'INSERT INTO vehicules_vente (vehicule_id, client_id, prix_vente, description, image_principale) VALUES (?, ?, ?, ?, ?)',
      [vehicule_id, client_id, prix_vente, description || '', imageUrl || '']
    );
    
    res.json({
      success: true,
      message: 'Véhicule mis en vente avec succès',
      vente_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur mise en vente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les véhicules en vente d'un client
app.get('/api/vente/vehicules/client/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [user_id]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    const [rows] = await pool.execute(`
      SELECT 
        vv.*,
        v.marque,
        v.modele,
        v.annee,
        v.couleur,
        v.kilometrage,
        v.carburant
      FROM vehicules_vente vv
      JOIN vehicules v ON vv.vehicule_id = v.id
      WHERE vv.client_id = ?
      ORDER BY vv.date_mise_vente DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération véhicules en vente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer tous les véhicules en vente (pour la boutique)
app.get('/api/vente/vehicules', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        vv.*,
        v.marque,
        v.modele,
        v.annee,
        v.couleur,
        v.kilometrage,
        v.carburant,
        c.nom as client_nom,
        c.prenom as client_prenom
      FROM vehicules_vente vv
      JOIN vehicules v ON vv.vehicule_id = v.id
      JOIN clients c ON vv.client_id = c.id
      WHERE vv.statut = 'en_vente'
      ORDER BY vv.date_mise_vente DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération véhicules en vente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Retirer un véhicule de la vente
app.put('/api/vente/vehicules/:id/retirer', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [user_id]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    // Vérifier que le véhicule appartient au client
    const [rows] = await pool.execute(
      'SELECT id FROM vehicules_vente WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Ce véhicule ne vous appartient pas' });
    }
    
    await pool.execute(
      'UPDATE vehicules_vente SET statut = "retire" WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Véhicule retiré de la vente avec succès' });
  } catch (error) {
    console.error('Erreur retrait vente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES FACTURES ==========
// Route pour récupérer toutes les factures
app.get('/api/factures', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        r.probleme as reparation_description,
        v.marque,
        v.modele,
        v.immatriculation as numero_immatriculation
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      LEFT JOIN reparations r ON f.reparation_id = r.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      ORDER BY f.date_facture DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération factures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer une facture par ID
app.get('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        c.telephone as client_telephone,
        c.adresse as client_adresse,
        r.probleme as reparation_description,
        v.marque,
        v.modele,
        v.immatriculation as numero_immatriculation,
        v.annee,
        v.kilometrage
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      LEFT JOIN reparations r ON f.reparation_id = r.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      WHERE f.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les factures d'un client
app.get('/api/factures/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        r.probleme as reparation_description,
        v.marque,
        v.modele,
        v.immatriculation as numero_immatriculation
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      LEFT JOIN reparations r ON f.reparation_id = r.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      WHERE f.client_id = ?
      ORDER BY f.date_facture DESC
    `, [clientId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération factures client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les factures du client connecté
app.get('/api/client/factures', async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT ou les headers
    const authHeader = req.headers.authorization;
    let userId = req.headers['user-id'] || req.query.user_id;
    
    // Si pas d'ID utilisateur dans les headers, essayer de le récupérer du token
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (jwtError) {
        console.log('Erreur décodage JWT:', jwtError.message);
      }
    }
    
    // Si toujours pas d'ID, essayer de récupérer depuis le localStorage côté client
    if (!userId) {
      // Fallback: utiliser l'ID 5 pour les tests (utilisateur avec client_id)
      userId = 5;
      console.log('Aucun ID utilisateur fourni, utilisation de l\'ID 5 pour les tests');
    }
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        r.probleme as reparation_description,
        v.marque,
        v.modele,
        v.immatriculation as numero_immatriculation
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      LEFT JOIN reparations r ON f.reparation_id = r.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      WHERE f.client_id = ?
      ORDER BY f.date_facture DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération factures client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer une facture
app.post('/api/factures', async (req, res) => {
  try {
    const {
      client_id,
      reparation_id,
      numero,
      date_facture,
      total_ht,
      total_ttc,
      statut,
      mode_paiement,
      notes
    } = req.body;
    
    if (!client_id || !numero) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO factures 
      (client_id, reparation_id, numero, date_facture, total_ht, total_ttc, statut, mode_paiement, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [client_id, reparation_id, numero, date_facture || new Date(), total_ht, total_ttc, statut || 'brouillon', mode_paiement, notes]);
    
    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      facture_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour une facture
app.put('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero,
      date_facture,
      total_ht,
      total_ttc,
      statut,
      mode_paiement,
      notes
    } = req.body;
    
    await pool.execute(`
      UPDATE factures SET 
        numero = ?, date_facture = ?, total_ht = ?, total_ttc = ?, 
        statut = ?, mode_paiement = ?, notes = ?
      WHERE id = ?
    `, [numero, date_facture, total_ht, total_ttc, statut, mode_paiement, notes, id]);
    
    res.json({ message: 'Facture modifiée avec succès' });
  } catch (error) {
    console.error('Erreur modification facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour supprimer une facture
app.delete('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM factures WHERE id = ?', [id]);
    
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES RÉPARATIONS ==========
// Route pour récupérer toutes les réparations
app.get('/api/reparations', async (req, res) => {
  try {
    const { client_id, employe_id } = req.query;
    let query = `
      SELECT 
        r.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        v.marque,
        v.modele,
        v.immatriculation,
        e.nom as employe_nom,
        e.prenom as employe_prenom
      FROM reparations r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN employes e ON r.employe_id = e.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (client_id) {
      conditions.push('r.client_id = ?');
      params.push(client_id);
    }
    
    if (employe_id) {
      conditions.push('r.employe_id = ?');
      params.push(employe_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération réparations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer une réparation par ID
app.get('/api/reparations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        c.telephone as client_telephone,
        c.adresse as client_adresse,
        v.marque,
        v.modele,
        v.immatriculation,
        v.annee,
        v.kilometrage,
        e.nom as employe_nom,
        e.prenom as employe_prenom
      FROM reparations r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN employes e ON r.employe_id = e.id
      WHERE r.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Réparation non trouvée' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération réparation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les réparations du client connecté
app.get('/api/client/reparations', async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT ou les headers
    const authHeader = req.headers.authorization;
    let userId = req.headers['user-id'] || req.query.user_id;
    
    // Si pas d'ID utilisateur dans les headers, essayer de le récupérer du token
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (jwtError) {
        console.log('Erreur décodage JWT:', jwtError.message);
      }
    }
    
    // Si toujours pas d'ID, essayer de récupérer depuis le localStorage côté client
    if (!userId) {
      // Fallback: utiliser l'ID 5 pour les tests (utilisateur avec client_id)
      userId = 5;
      console.log('Aucun ID utilisateur fourni, utilisation de l\'ID 5 pour les tests');
    }
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        v.marque,
        v.modele,
        v.immatriculation,
        e.nom as employe_nom,
        e.prenom as employe_prenom
      FROM reparations r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN employes e ON r.employe_id = e.id
      WHERE r.client_id = ?
      ORDER BY r.created_at DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération réparations client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer une réparation
app.post('/api/reparations', async (req, res) => {
  try {
    const {
      client_id,
      vehicule_id,
      employe_id,
      probleme,
      diagnostic,
      statut,
      total_ht,
      total_ttc,
      notes
    } = req.body;
    
    if (!client_id || !vehicule_id) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    // Générer un numéro de réparation
    const numero = `REP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    
    const [result] = await pool.execute(`
      INSERT INTO reparations 
      (numero, client_id, vehicule_id, employe_id, probleme, diagnostic, statut, total_ht, total_ttc, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [numero, client_id, vehicule_id, employe_id, probleme, diagnostic, statut || 'ouvert', total_ht, total_ttc, notes]);
    
    res.status(201).json({
      success: true,
      message: 'Réparation créée avec succès',
      reparation_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création réparation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour une réparation
app.put('/api/reparations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      probleme,
      diagnostic,
      statut,
      total_ht,
      total_ttc,
      notes,
      date_fin
    } = req.body;
    
    await pool.execute(`
      UPDATE reparations SET 
        probleme = ?, diagnostic = ?, statut = ?, total_ht = ?, 
        total_ttc = ?, notes = ?, date_fin = ?
      WHERE id = ?
    `, [probleme, diagnostic, statut, total_ht, total_ttc, notes, date_fin, id]);
    
    res.json({ message: 'Réparation modifiée avec succès' });
  } catch (error) {
    console.error('Erreur modification réparation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour supprimer une réparation
app.delete('/api/reparations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM reparations WHERE id = ?', [id]);
    
    res.json({ message: 'Réparation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression réparation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES RENDEZ-VOUS ==========
// Route pour récupérer tous les rendez-vous
app.get('/api/rendez-vous', async (req, res) => {
  try {
    const { client_id, employe_id } = req.query;
    let query = `
      SELECT 
        r.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        v.marque,
        v.modele,
        v.immatriculation,
        s.nom as service_nom,
        e.nom as employe_nom,
        e.prenom as employe_prenom
      FROM rendez_vous r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN employes e ON r.employe_id = e.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (client_id) {
      conditions.push('r.client_id = ?');
      params.push(client_id);
    }
    
    if (employe_id) {
      conditions.push('r.employe_id = ?');
      params.push(employe_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.date_rdv DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer un rendez-vous par ID
app.get('/api/rendez-vous/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        c.telephone as client_telephone,
        v.marque,
        v.modele,
        v.immatriculation,
        s.nom as service_nom,
        s.description as service_description,
        e.nom as employe_nom,
        e.prenom as employe_prenom
      FROM rendez_vous r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN employes e ON r.employe_id = e.id
      WHERE r.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les rendez-vous du client connecté
app.get('/api/client/rendez-vous', async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT ou les headers
    const authHeader = req.headers.authorization;
    let userId = req.headers['user-id'] || req.query.user_id;
    
    // Si pas d'ID utilisateur dans les headers, essayer de le récupérer du token
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (jwtError) {
        console.log('Erreur décodage JWT:', jwtError.message);
      }
    }
    
    // Si toujours pas d'ID, essayer de récupérer depuis le localStorage côté client
    if (!userId) {
      // Fallback: utiliser l'ID 5 pour les tests (utilisateur avec client_id)
      userId = 5;
      console.log('Aucun ID utilisateur fourni, utilisation de l\'ID 5 pour les tests');
    }
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        v.marque,
        v.modele,
        v.immatriculation,
        s.nom as service_nom,
        e.nom as employe_nom,
        e.prenom as employe_prenom
      FROM rendez_vous r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN employes e ON r.employe_id = e.id
      WHERE r.client_id = ?
      ORDER BY r.date_rdv DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération rendez-vous client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES MANQUANTES ==========
// Route pour les services
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        nom as nom_service,
        description,
        prix,
        duree_minutes as duree_estimee,
        categorie,
        statut
      FROM services
      WHERE statut = 'actif'
      ORDER BY nom
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour les véhicules d'un client
app.get('/api/client/vehicules', async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis les headers ou query
    const userId = req.headers['user-id'] || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'ID utilisateur requis' });
    }
    
    // Récupérer le client_id depuis l'utilisateur
    const [userRows] = await pool.execute(
      'SELECT client_id FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const client_id = userRows[0].client_id;
    if (!client_id) {
      return res.status(400).json({ error: 'Aucun client associé à cet utilisateur' });
    }
    
    const [rows] = await pool.execute(`
      SELECT 
        id,
        marque,
        modele,
        immatriculation,
        annee,
        kilometrage,
        carburant,
        couleur,
        created_at
      FROM vehicules
      WHERE client_id = ?
      ORDER BY created_at DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération véhicules client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer une demande de prestation
app.post('/api/prestations/demandes', async (req, res) => {
  try {
    const {
      client_id,
      service_id,
      vehicule_id,
      description,
      date_souhaitee,
      adresse,
      telephone
    } = req.body;
    
    if (!client_id || !service_id || !vehicule_id) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO demandes_prestations 
      (client_id, service_id, vehicule_id, description, date_souhaitee, adresse, telephone, statut, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW())
    `, [client_id, service_id, vehicule_id, description || '', date_souhaitee, adresse || '', telephone || '']);
    
    res.json({
      success: true,
      message: 'Demande de prestation créée avec succès',
      demande_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création demande prestation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les demandes de prestations d'un client
app.get('/api/prestations/demandes/client/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        dp.*,
        s.nom as nom_service,
        s.description as service_description,
        s.prix as service_prix,
        v.marque,
        v.modele,
        v.immatriculation
      FROM demandes_prestations dp
      LEFT JOIN services s ON dp.service_id = s.id
      LEFT JOIN vehicules v ON dp.vehicule_id = v.id
      WHERE dp.client_id = ?
      ORDER BY dp.created_at DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération demandes prestations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les rendez-vous d'un client
app.get('/api/rendez-vous/client/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        s.nom as nom_service,
        v.marque,
        v.modele,
        v.immatriculation
      FROM rendez_vous r
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      WHERE r.client_id = ?
      ORDER BY r.date_rdv DESC
    `, [client_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer un rendez-vous
app.post('/api/rendez-vous', async (req, res) => {
  try {
    const {
      client_id,
      service_id,
      vehicule_id,
      date_rdv,
      heure_rdv,
      description,
      adresse,
      telephone
    } = req.body;
    
    if (!client_id || !service_id || !vehicule_id || !date_rdv || !heure_rdv) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO rendez_vous 
      (client_id, service_id, vehicule_id, date_rdv, heure_rdv, description, adresse, telephone, statut, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW())
    `, [client_id, service_id, vehicule_id, date_rdv, heure_rdv, description || '', adresse || '', telephone || '']);
    
    res.json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      rdv_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrage du serveur
async function startServer() {
  await initializeDatabase();
  
  // Créer le dossier uploads si nécessaire
  const uploadDir = path.join(__dirname, 'uploads', 'images');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Dossier uploads/images créé');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🖼️  Images disponibles sur http://localhost:${PORT}/uploads/images/`);
    console.log(`🌐 Accès LAN: http://0.0.0.0:${PORT}/api`);
  });
}

startServer().catch(console.error);