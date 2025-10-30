// Charger les variables d'environnement en premier
require('dotenv').config({ 
  path: process.env.NODE_ENV === 'production' ? './config.prod.env' : './config.env' 
});

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
  'https://garageci.geodaftar.com',
  'https://garage-frontend-teovym.dokploy.com',
  process.env.FRONTEND_ORIGIN || ''
].filter(Boolean));

const corsOptions = {
  origin: (origin, callback) => {
    console.log('🌐 CORS Origin reçue:', origin);
    
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Requête sans origin autorisée');
      return callback(null, true);
    }
    
    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.has(origin)) {
      console.log('✅ CORS: Origin autorisée:', origin);
      return callback(null, true);
    }
    
    // Autoriser les domaines Vercel
    const isVercel = /\.vercel\.app$/i.test(new URL(origin).hostname || '');
    if (isVercel) {
      console.log('✅ CORS: Vercel domain autorisé:', origin);
      return callback(null, true);
    }
    
    // Autoriser les domaines Dokploy
    const isDokploy = /\.dokploy\.com$/i.test(new URL(origin).hostname || '');
    if (isDokploy) {
      console.log('✅ CORS: Dokploy domain autorisé:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS: Origin refusée:', origin);
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

// ========== ROUTE DE TEST ==========
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API fonctionne correctement', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== ROUTES POUR SERVIR LES IMAGES ==========
// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== SERVIR L'APPLICATION REACT ==========
// Cette section sera déplacée à la fin du fichier, après toutes les routes API

// Servir les fichiers statiques en développement
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'src')));
}

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
  port: process.env.DB_PORT || 3306,
  // Configuration SSL si nécessaire
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

let pool;

async function initializeDatabase() {
  try {
    console.log('🔄 Tentative de connexion à la base de données...');
    console.log(`📍 Configuration: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    console.log('🔧 Config détaillée:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      acquireTimeout: dbConfig.acquireTimeout,
      timeout: dbConfig.timeout
    });
    
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données établie avec succès');
    
    // Test d'une requête simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test de requête réussi:', rows);
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    pool = null;
  }
}

// Routes de santé

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
    console.error('❌ Erreur login détaillée:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    // Gestion spécifique des erreurs MySQL
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
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
    
    // Vérifier si le token est valide
    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    
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
    
    console.log('🔍 Utilisateur récupéré via /auth/me:', user);
    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
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
    let garageId = null;
    
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
    } else if (userType === 'garage') {
      // Si c'est un garage, créer aussi un enregistrement dans la table garages
      const [garageResult] = await pool.execute(
        'INSERT INTO garages (nom_garage, email, telephone, ville, statut, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [nom || 'Garage ' + email, email, telephone || '', 'Abidjan', 'actif']
      );
      
      garageId = garageResult.insertId;
      
      // Mettre à jour l'utilisateur avec le garage_id
      await pool.execute(
        'UPDATE utilisateurs SET garage_id = ? WHERE id = ?',
        [garageId, userId]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: userId,
      clientId: clientId,
      garageId: garageId,
      userType: userType
    });
  } catch (error) {
    console.error('❌ Erreur inscription détaillée:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    
    // Gestion spécifique des erreurs MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// ========== ROUTES BOUTIQUE ==========
// Récupérer toutes les pièces détachées
app.get('/api/boutique/pieces', async (req, res) => {
  try {
    console.log('🔧 Récupération des pièces détachées...');
    
    const [rows] = await pool.execute(`
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
        created_at,
        updated_at
      FROM pieces_detachees
      ORDER BY created_at DESC
    `);

    console.log(`✅ ${rows.length} pièces détachées trouvées`);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des pièces:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des pièces',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

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

    console.log(`✅ ${vehicules.length} véhicules et ${pieces.length} pièces trouvés`);
    
    res.json({
      success: true,
      data: allProducts,
      count: allProducts.length,
      vehicules: vehicules.length,
      pieces: pieces.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
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

// Route pour récupérer les véhicules (avec support client_id)
app.get('/api/vehicules', async (req, res) => {
  try {
    const { client_id, employe_id } = req.query;
    
    let query = `
      SELECT 
        id,
        marque,
        modele,
        immatriculation as numero_immatriculation,
        annee,
        kilometrage,
        carburant,
        couleur,
        created_at
      FROM vehicules
      WHERE 1=1
    `;
    const params = [];
    
    if (client_id) {
      query += ' AND client_id = ?';
      params.push(client_id);
    }
    
    if (employe_id) {
      query += ' AND employe_id = ?';
      params.push(employe_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération véhicules:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer un véhicule client
app.post('/api/vehicules', async (req, res) => {
  try {
    const { client_id, marque, modele, immatriculation, annee, kilometrage, carburant, couleur } = req.body;
    
    // Validation des champs obligatoires
    if (!client_id || !marque || !modele || !immatriculation) {
      return res.status(400).json({ error: 'Champs obligatoires manquants: client_id, marque, modele, immatriculation' });
    }
    
    // Vérifier que le client existe
    const [clientRows] = await pool.execute('SELECT id FROM clients WHERE id = ?', [client_id]);
    if (clientRows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Normaliser le carburant (mettre en minuscule pour correspondre à l'enum)
    const carburantNormalized = carburant ? carburant.toLowerCase() : 'essence';
    const validCarburants = ['essence', 'diesel', 'hybride', 'electrique'];
    const finalCarburant = validCarburants.includes(carburantNormalized) ? carburantNormalized : 'essence';
    
    // Insérer le véhicule
    const [result] = await pool.execute(
      `INSERT INTO vehicules (client_id, marque, modele, immatriculation, annee, kilometrage, carburant, couleur)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id,
        marque,
        modele,
        immatriculation,
        annee || null,
        kilometrage || 0,
        finalCarburant,
        couleur || null
      ]
    );
    
    // Récupérer le véhicule créé
    const [vehiculeRows] = await pool.execute(
      `SELECT id, marque, modele, immatriculation as numero_immatriculation, annee, kilometrage, carburant, couleur, created_at
       FROM vehicules WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(vehiculeRows[0]);
  } catch (error) {
    console.error('Erreur création véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du véhicule' });
  }
});

// Route pour mettre à jour un véhicule
app.put('/api/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { marque, modele, immatriculation, annee, kilometrage, carburant, couleur } = req.body;
    
    // Vérifier que le véhicule existe
    const [existingRows] = await pool.execute('SELECT id FROM vehicules WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    
    // Normaliser le carburant si fourni
    const carburantNormalized = carburant ? carburant.toLowerCase() : null;
    const validCarburants = ['essence', 'diesel', 'hybride', 'electrique'];
    const finalCarburant = carburantNormalized && validCarburants.includes(carburantNormalized) 
      ? carburantNormalized 
      : null;
    
    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const params = [];
    
    if (marque) { updates.push('marque = ?'); params.push(marque); }
    if (modele) { updates.push('modele = ?'); params.push(modele); }
    if (immatriculation) { updates.push('immatriculation = ?'); params.push(immatriculation); }
    if (annee !== undefined) { updates.push('annee = ?'); params.push(annee || null); }
    if (kilometrage !== undefined) { updates.push('kilometrage = ?'); params.push(kilometrage || 0); }
    if (finalCarburant) { updates.push('carburant = ?'); params.push(finalCarburant); }
    if (couleur !== undefined) { updates.push('couleur = ?'); params.push(couleur || null); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }
    
    params.push(id);
    await pool.execute(
      `UPDATE vehicules SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Récupérer le véhicule mis à jour
    const [vehiculeRows] = await pool.execute(
      `SELECT id, marque, modele, immatriculation as numero_immatriculation, annee, kilometrage, carburant, couleur, created_at
       FROM vehicules WHERE id = ?`,
      [id]
    );
    
    res.json(vehiculeRows[0]);
  } catch (error) {
    console.error('Erreur mise à jour véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du véhicule' });
  }
});

// Route pour supprimer un véhicule
app.delete('/api/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que le véhicule existe
    const [existingRows] = await pool.execute('SELECT id FROM vehicules WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    
    // Supprimer le véhicule
    await pool.execute('DELETE FROM vehicules WHERE id = ?', [id]);
    
    res.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du véhicule' });
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
      (client_id, service_id, vehicule_id, description_probleme, date_souhaitee, statut, date_demande)
      VALUES (?, ?, ?, ?, ?, 'en_attente', NOW())
    `, [client_id, service_id, vehicule_id, description || '', date_souhaitee]);
    
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
  
  // ========== ROUTES POUR LES CLIENTS ==========
  // Récupérer tous les clients
  app.get('/api/clients', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          c.id as id_client,
          c.nom,
          c.prenom,
          c.email,
          c.telephone,
          c.adresse,
          c.created_at,
          COUNT(v.id) as nombre_vehicules
        FROM clients c
        LEFT JOIN vehicules v ON c.id = v.client_id
        GROUP BY c.id, c.nom, c.prenom, c.email, c.telephone, c.adresse, c.created_at
        ORDER BY c.created_at DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération clients:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer un client par ID
  app.get('/api/clients/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [rows] = await pool.execute(`
        SELECT 
          c.id as id_client,
          c.nom,
          c.prenom,
          c.email,
          c.telephone,
          c.adresse,
          c.created_at
        FROM clients c
        WHERE c.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur récupération client:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Créer un nouveau client
  app.post('/api/clients', async (req, res) => {
    try {
      const { nom, prenom, email, telephone, adresse } = req.body;
      
      if (!nom || !prenom || !email) {
        return res.status(400).json({ error: 'Nom, prénom et email sont obligatoires' });
      }
      
      const [result] = await pool.execute(`
        INSERT INTO clients (nom, prenom, email, telephone, adresse, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [nom, prenom, email, telephone || '', adresse || '']);
      
      res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        client_id: result.insertId
      });
    } catch (error) {
      console.error('Erreur création client:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Mettre à jour un client
  app.put('/api/clients/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nom, prenom, email, telephone, adresse } = req.body;
      
      if (!nom || !prenom || !email) {
        return res.status(400).json({ error: 'Nom, prénom et email sont obligatoires' });
      }
      
      const [result] = await pool.execute(`
        UPDATE clients 
        SET nom = ?, prenom = ?, email = ?, telephone = ?, adresse = ?
        WHERE id = ?
      `, [nom, prenom, email, telephone || '', adresse || '', id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Client mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour client:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Supprimer un client
  app.delete('/api/clients/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Client supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression client:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ========== ROUTES POUR LES EMPLOYÉS ==========
  // Récupérer tous les employés
  app.get('/api/employes', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          e.id as id_employe,
          e.nom,
          e.prenom,
          e.email,
          e.telephone,
          e.role as specialite,
          e.date_embauche,
          e.salaire,
          e.statut,
          e.created_at
        FROM employes e
        ORDER BY e.created_at DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération employés:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer un employé par ID
  app.get('/api/employes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [rows] = await pool.execute(`
        SELECT 
          e.id as id_employe,
          e.nom,
          e.prenom,
          e.email,
          e.telephone,
          e.role as specialite,
          e.date_embauche,
          e.salaire,
          e.statut,
          e.created_at
        FROM employes e
        WHERE e.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Employé non trouvé' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur récupération employé:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Créer un nouvel employé
  app.post('/api/employes', async (req, res) => {
    try {
      const { nom, prenom, email, telephone, role, date_embauche, salaire, statut } = req.body;
      
      if (!nom || !prenom || !email) {
        return res.status(400).json({ error: 'Nom, prénom et email sont obligatoires' });
      }
      
      const [result] = await pool.execute(`
        INSERT INTO employes (nom, prenom, email, telephone, role, date_embauche, salaire, statut, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [nom, prenom, email, telephone || '', role || 'mecanicien', date_embauche, salaire || 0, statut || 'actif']);
      
      res.status(201).json({
        success: true,
        message: 'Employé créé avec succès',
        employe_id: result.insertId
      });
    } catch (error) {
      console.error('Erreur création employé:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Mettre à jour un employé
  app.put('/api/employes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nom, prenom, email, telephone, role, date_embauche, salaire, statut } = req.body;
      
      if (!nom || !prenom || !email) {
        return res.status(400).json({ error: 'Nom, prénom et email sont obligatoires' });
      }
      
      const [result] = await pool.execute(`
        UPDATE employes 
        SET nom = ?, prenom = ?, email = ?, telephone = ?, role = ?, 
            date_embauche = ?, salaire = ?, statut = ?
        WHERE id = ?
      `, [nom, prenom, email, telephone || '', role || 'mecanicien', date_embauche, salaire || 0, statut || 'actif', id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Employé non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Employé mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour employé:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Supprimer un employé
  app.delete('/api/employes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('DELETE FROM employes WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Employé non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Employé supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression employé:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ========== ROUTES POUR LES DEMANDES DE PRESTATIONS ==========
  // Récupérer toutes les demandes de prestations
  app.get('/api/prestations/demandes', async (req, res) => {
    try {
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
          g.nom_garage as garage_nom
        FROM demandes_prestations dp
        LEFT JOIN clients c ON dp.client_id = c.id
        LEFT JOIN vehicules v ON dp.vehicule_id = v.id
        LEFT JOIN services s ON dp.service_id = s.id
        LEFT JOIN garages g ON dp.garage_id = g.id
        ORDER BY dp.created_at DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération demandes prestations:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer une demande de prestation par ID
  app.get('/api/prestations/demandes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
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
          g.nom_garage as garage_nom
        FROM demandes_prestations dp
        LEFT JOIN clients c ON dp.client_id = c.id
        LEFT JOIN vehicules v ON dp.vehicule_id = v.id
        LEFT JOIN services s ON dp.service_id = s.id
        LEFT JOIN garages g ON dp.garage_id = g.id
        WHERE dp.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Demande non trouvée' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur récupération demande prestation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Accepter une demande de prestation
  app.patch('/api/prestations/demandes/:id/accept', async (req, res) => {
    try {
      const { id } = req.params;
      const { garage_id, prix_estime, duree_estimee } = req.body;
      
      const [result] = await pool.execute(`
        UPDATE demandes_prestations 
        SET garage_id = ?, prix_estime = ?, duree_estimee = ?, statut = 'acceptee'
        WHERE id = ?
      `, [garage_id, prix_estime || null, duree_estimee || null, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Demande non trouvée' });
      }
      
      res.json({
        success: true,
        message: 'Demande acceptée avec succès'
      });
    } catch (error) {
      console.error('Erreur acceptation demande:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Mettre à jour le statut d'une demande
  app.patch('/api/prestations/demandes/:id/statut', async (req, res) => {
    try {
      const { id } = req.params;
      const { statut } = req.body;
      
      const [result] = await pool.execute(`
        UPDATE demandes_prestations 
        SET statut = ?
        WHERE id = ?
      `, [statut, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Demande non trouvée' });
      }
      
      res.json({
        success: true,
        message: 'Statut mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Supprimer une demande de prestation
  app.delete('/api/prestations/demandes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('DELETE FROM demandes_prestations WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Demande non trouvée' });
      }
      
      res.json({
        success: true,
        message: 'Demande supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression demande:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ========== ROUTES POUR LES STATISTIQUES ADMIN ==========
  // Récupérer les statistiques du dashboard admin
  app.get('/api/admin/stats', async (req, res) => {
    try {
      // Compter les clients
      const [clientsResult] = await pool.execute('SELECT COUNT(*) as count FROM clients');
      const clientsCount = clientsResult[0].count;

      // Compter les véhicules
      const [vehiculesResult] = await pool.execute('SELECT COUNT(*) as count FROM vehicules');
      const vehiculesCount = vehiculesResult[0].count;

      // Compter les réparations
      const [reparationsResult] = await pool.execute('SELECT COUNT(*) as count FROM reparations');
      const reparationsCount = reparationsResult[0].count;

      // Compter les factures
      const [facturesResult] = await pool.execute('SELECT COUNT(*) as count FROM factures');
      const facturesCount = facturesResult[0].count;

      // Compter les employés
      const [employesResult] = await pool.execute('SELECT COUNT(*) as count FROM employes');
      const employesCount = employesResult[0].count;

      // Compter les demandes de prestations
      const [demandesResult] = await pool.execute('SELECT COUNT(*) as count FROM demandes_prestations');
      const demandesCount = demandesResult[0].count;

      // Compter les rendez-vous
      const [rendezVousResult] = await pool.execute('SELECT COUNT(*) as count FROM rendez_vous');
      const rendezVousCount = rendezVousResult[0].count;

      // Calculer le revenu total des factures
      const [revenuResult] = await pool.execute('SELECT SUM(total_ttc) as total FROM factures WHERE statut = "payee"');
      const revenuTotal = revenuResult[0].total || 0;

      // Statistiques des réparations par statut
      const [reparationsStats] = await pool.execute(`
        SELECT 
          statut,
          COUNT(*) as count
        FROM reparations 
        GROUP BY statut
      `);

      // Statistiques des factures par statut
      const [facturesStats] = await pool.execute(`
        SELECT 
          statut,
          COUNT(*) as count
        FROM factures 
        GROUP BY statut
      `);

      // Activités récentes (dernières 10)
      const [activitesRecentes] = await pool.execute(`
        SELECT 
          'client' as type,
          CONCAT('Nouveau client: ', c.nom, ' ', c.prenom) as description,
          c.created_at as date_creation
        FROM clients c
        WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'reparation' as type,
          CONCAT('Réparation: ', v.marque, ' ', v.modele) as description,
          r.created_at as date_creation
        FROM reparations r
        LEFT JOIN vehicules v ON r.vehicule_id = v.id
        WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'facture' as type,
          CONCAT('Facture: ', f.total_ttc, '€') as description,
          f.created_at as date_creation
        FROM factures f
        WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        ORDER BY date_creation DESC
        LIMIT 10
      `);

      res.json({
        clients: clientsCount,
        vehicules: vehiculesCount,
        reparations: reparationsCount,
        factures: facturesCount,
        employes: employesCount,
        demandes: demandesCount,
        rendezVous: rendezVousCount,
        revenuTotal: parseFloat(revenuTotal),
        reparationsStats: reparationsStats,
        facturesStats: facturesStats,
        activitesRecentes: activitesRecentes
      });
    } catch (error) {
      console.error('Erreur récupération stats admin:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ========== ROUTES POUR LES PIÈCES ==========
  // Récupérer toutes les pièces
  app.get('/api/pieces', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          p.id,
          p.nom as nom_piece,
          p.reference as numero_reference,
          p.categorie,
          p.prix_vente as prix,
          p.stock_actuel as stock,
          p.stock_minimum,
          p.fournisseur,
          p.image_url,
          p.created_at
        FROM pieces p
        ORDER BY p.created_at DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération pièces:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer une pièce par ID
  app.get('/api/pieces/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [rows] = await pool.execute(`
        SELECT 
          p.id,
          p.nom as nom_piece,
          p.reference as numero_reference,
          p.categorie,
          p.prix_vente as prix,
          p.stock_actuel as stock,
          p.stock_minimum,
          p.fournisseur,
          p.image_url,
          p.created_at
        FROM pieces p
        WHERE p.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Pièce non trouvée' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur récupération pièce:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Créer une nouvelle pièce
  app.post('/api/pieces', async (req, res) => {
    try {
      const { nom_piece, description, categorie, prix, stock, stock_minimum, fournisseur, numero_reference } = req.body;
      
      if (!nom_piece || !categorie || !prix) {
        return res.status(400).json({ error: 'Nom, catégorie et prix sont requis' });
      }
      
      const [result] = await pool.execute(`
        INSERT INTO pieces (nom_piece, description, categorie, prix, stock, stock_minimum, fournisseur, numero_reference, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [nom_piece, description || '', categorie, prix, stock || 0, stock_minimum || 0, fournisseur || '', numero_reference || '']);
      
      res.status(201).json({
        success: true,
        message: 'Pièce créée avec succès',
        id: result.insertId
      });
    } catch (error) {
      console.error('Erreur création pièce:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Mettre à jour une pièce
  app.put('/api/pieces/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nom_piece, description, categorie, prix, stock, stock_minimum, fournisseur, numero_reference } = req.body;
      
      const [result] = await pool.execute(`
        UPDATE pieces 
        SET nom_piece = ?, description = ?, categorie = ?, prix = ?, stock = ?, stock_minimum = ?, fournisseur = ?, numero_reference = ?, updated_at = NOW()
        WHERE id = ?
      `, [nom_piece, description, categorie, prix, stock, stock_minimum, fournisseur, numero_reference, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pièce non trouvée' });
      }
      
      res.json({
        success: true,
        message: 'Pièce mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour pièce:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Supprimer une pièce
  app.delete('/api/pieces/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('DELETE FROM pieces WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pièce non trouvée' });
      }
      
      res.json({
        success: true,
        message: 'Pièce supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression pièce:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ========== ROUTES POUR LES GARAGES ==========
  // Récupérer tous les garages
  app.get('/api/garages', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          g.id,
          g.nom_garage,
          g.adresse,
          g.ville,
          g.code_postal,
          g.telephone,
          g.email,
          g.siret,
          g.specialites,
          g.statut,
          g.created_at,
          g.updated_at,
          COUNT(d.id) as nombre_demandes
        FROM garages g
        LEFT JOIN demandes_prestations d ON g.id = d.garage_id
        GROUP BY g.id, g.nom_garage, g.adresse, g.ville, g.code_postal, g.telephone, g.email, g.siret, g.specialites, g.statut, g.created_at, g.updated_at
        ORDER BY g.created_at DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération garages:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer un garage par ID
  app.get('/api/garages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [rows] = await pool.execute(`
        SELECT 
          g.id,
          g.nom_garage,
          g.adresse,
          g.ville,
          g.code_postal,
          g.telephone,
          g.email,
          g.siret,
          g.specialites,
          g.statut,
          g.created_at,
          g.updated_at
        FROM garages g
        WHERE g.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Garage non trouvé' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur récupération garage:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Créer un nouveau garage
  app.post('/api/garages', async (req, res) => {
    try {
      const { nom_garage, adresse, ville, code_postal, telephone, email, siret, specialites, statut } = req.body;
      
      if (!nom_garage || !email) {
        return res.status(400).json({ error: 'Nom du garage et email sont requis' });
      }
      
      const [result] = await pool.execute(`
        INSERT INTO garages (nom_garage, adresse, ville, code_postal, telephone, email, siret, specialites, statut, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [nom_garage, adresse || '', ville || '', code_postal || '', telephone || '', email, siret || '', specialites || '', statut || 'actif']);
      
      res.status(201).json({
        success: true,
        message: 'Garage créé avec succès',
        id: result.insertId
      });
    } catch (error) {
      console.error('Erreur création garage:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Mettre à jour un garage
  app.put('/api/garages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nom_garage, adresse, ville, code_postal, telephone, email, siret, specialites, statut } = req.body;
      
      const [result] = await pool.execute(`
        UPDATE garages 
        SET nom_garage = ?, adresse = ?, ville = ?, code_postal = ?, telephone = ?, email = ?, siret = ?, specialites = ?, statut = ?, updated_at = NOW()
        WHERE id = ?
      `, [nom_garage, adresse, ville, code_postal, telephone, email, siret, specialites, statut, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Garage non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Garage mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour garage:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Supprimer un garage
  app.delete('/api/garages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('DELETE FROM garages WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Garage non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Garage supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression garage:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer les demandes d'un garage spécifique
  app.get('/api/garages/:id/demandes', async (req, res) => {
    try {
      const { id } = req.params;
      
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
          g.nom_garage as garage_nom
        FROM demandes_prestations dp
        LEFT JOIN clients c ON dp.client_id = c.id
        LEFT JOIN vehicules v ON dp.vehicule_id = v.id
        LEFT JOIN services s ON dp.service_id = s.id
        LEFT JOIN garages g ON dp.garage_id = g.id
        WHERE dp.garage_id = ?
        ORDER BY dp.created_at DESC
      `, [id]);
      
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération demandes garage:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ========== SERVIR L'APPLICATION REACT (APRÈS TOUTES LES ROUTES API) ==========
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Configuration des fichiers statiques React...');
    
    // Servir les fichiers statiques de React
    app.use(express.static(path.join(__dirname, 'build')));
    
    // Route catch-all pour React Router (doit être la dernière route)
    app.get('*', (req, res) => {
      console.log('🔄 Requête catch-all pour:', req.path);
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🖼️  Images disponibles sur http://localhost:${PORT}/uploads/images/`);
    console.log(`🌐 Accès LAN: http://0.0.0.0:${PORT}/api`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`🌐 Application React disponible sur http://0.0.0.0:${PORT}`);
    }
  });
}

startServer().catch(console.error);