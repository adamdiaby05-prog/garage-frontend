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
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/pieces';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique pour l'image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'piece-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: function (req, file, cb) {
    // Vérifier le type de fichier
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Middleware
// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les images
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads')); // Servir les fichiers statiques

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

// Initialisation du client OpenAI
let openaiClient;
try {
  console.log('🔍 Vérification des variables d\'environnement...');
  console.log('🔑 OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurée' : '❌ Manquante');
  console.log('🤖 OPENAI_MODEL:', process.env.OPENAI_MODEL || 'gpt-4o-mini');
  
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // Spécifier explicitement l'URL de l'API
      baseURL: 'https://api.openai.com/v1',
    });
    console.log('🤖 Client OpenAI initialisé avec succès');
    console.log('🔑 Modèle configuré:', process.env.OPENAI_MODEL || 'gpt-4o-mini');
  } else {
    console.log('⚠️ OPENAI_API_KEY non configurée, GPT sera désactivé');
  }
} catch (error) {
  console.log('⚠️ Client OpenAI non initialisé:', error.message);
  openaiClient = null;
}

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
    connection.release();
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.error('💡 Vérifiez que:');
    console.error('   - MySQL est démarré');
    console.error('   - Les informations de connexion sont correctes dans config.env');
    console.error('   - La base de données "garage_db" existe');
    console.error('   - L\'utilisateur a les permissions nécessaires');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 MySQL n\'est pas accessible. Démarrez le service MySQL.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Erreur d\'authentification. Vérifiez le nom d\'utilisateur et le mot de passe.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗄️ La base de données n\'existe pas. Créez-la avec: CREATE DATABASE garage_db;');
    }
    
    console.log('🚫 MySQL n\'est pas accessible. Le mode GPT fonctionnera sans base de données.');
    pool = null; // Indique que la base de données n'est pas disponible
  }
}

// === AI Assistant (RAG) ===
// Utilise les données MySQL comme contexte + LLM (optionnel) si OPENAI_API_KEY est défini
async function searchRelevantData(queryText) {
  if (!pool) {
    console.log('📝 Mode GPT uniquement (base de données non disponible)');
    return { results: [], tables: {} };
  }

  const terms = (queryText || '')
    .toString()
    .toLowerCase()
    .split(/[^a-zA-Z0-9éèàùçôûïüâœ]+/)
    .filter(Boolean)
    .slice(0, 8);

  if (terms.length === 0) return { results: [], tables: {} };

  const likeClause = terms.map(() => '%'+''+'%'); // placeholder array length
  // Build conditions safely
  const buildWhere = (cols) => cols.map((c) => '(' + terms.map(() => `${c} LIKE ?`).join(' OR ') + ')').join(' OR ');
  const buildParams = (cols) => cols.flatMap(() => terms.map((t) => `%${t}%`));

  const queries = [
    {
      table: 'clients', cols: ['nom', 'prenom', 'email', 'telephone', 'adresse'], limit: 10,
      select: 'id, nom, prenom, email, telephone, adresse'
    },
    {
      table: 'employes', cols: ['nom', 'prenom', 'email', 'telephone', 'role', 'specialite', 'poste', 'statut'], limit: 10,
      select: 'id, nom, prenom, email, telephone, role, specialite, poste, statut'
    },
    {
      table: 'vehicules', cols: ['marque', 'modele', 'immatriculation', 'annee', 'couleur', 'vin'], limit: 10,
      select: 'id, client_id, marque, modele, immatriculation, annee, couleur, vin'
    },
    {
      table: 'reparations', cols: ['description_probleme', 'description_travaux', 'statut'], limit: 10,
      select: 'id_reparation, id_vehicule, description_probleme, description_travaux, statut, cout_main_oeuvre, cout_total, date_entree, date_sortie_prevue'
    },
    {
      table: 'factures', cols: ['description', 'statut', 'mode_paiement'], limit: 10,
      select: 'id, client_id, montant, statut, mode_paiement, date_facture, description'
    },
    {
      table: 'pieces', cols: ['nom', 'categorie', 'reference'], limit: 10,
      select: 'id, nom, categorie, reference, prix, stock'
    },
    {
      table: 'services', cols: ['nom', 'description'], limit: 10,
      select: 'id, nom, description, prix'
    },
    {
      table: 'rendez_vous', cols: ['objet', 'statut', 'notes'], limit: 10,
      select: 'id, client_id, vehicule_id, date_heure, objet, statut, notes'
    }
  ];

  const resultsByTable = {};
  await Promise.all(queries.map(async (q) => {
    try {
      const where = buildWhere(q.cols);
      const params = buildParams(q.cols);
      const scoreExpr = q.cols.map((c) => terms.map(() => `${c} LIKE ?`).join(' + ')).join(' + ');
      const scoreParams = q.cols.flatMap(() => terms.map((t) => `%${t}%`));
      const sql = `SELECT ${q.select}, (${scoreExpr}) AS _score FROM ${q.table} WHERE ${where} ORDER BY _score DESC, id DESC LIMIT ${q.limit}`;
      const [rows] = await pool.query(sql, [...params, ...scoreParams]);
      resultsByTable[q.table] = rows || [];
    } catch (e) {
      resultsByTable[q.table] = [];
    }
  }));

  const flattened = Object.entries(resultsByTable).flatMap(([table, rows]) => rows.map((r) => ({ table, row: r })));
  return { results: flattened, tables: resultsByTable };
}

function buildContextMarkdown(tables) {
  const sections = [];
  
  // Compter et lister les données de manière claire
  if (tables.clients?.length) {
    sections.push(`**CLIENTS (${tables.clients.length} total):**\n${tables.clients.map(c => `- ${c.prenom || ''} ${c.nom || ''} (${c.email || 'N/A'})`).join('\n')}`);
  }
  
  if (tables.employes?.length) {
    sections.push(`**EMPLOYÉS (${tables.employes.length} total):**\n${tables.employes.map(e => `- ${e.prenom || ''} ${e.nom || ''} (${e.role || 'N/A'}) - ${e.statut || 'N/A'}`).join('\n')}`);
  }
  
  if (tables.vehicules?.length) {
    sections.push(`**VÉHICULES (${tables.vehicules.length} total):**\n${tables.vehicules.map(v => `- ${v.marque || ''} ${v.modele || ''} (${v.immatriculation || 'N/A'})`).join('\n')}`);
  }
  
  if (tables.reparations?.length) {
    const enCours = tables.reparations.filter(r => (r.statut || '').toLowerCase().includes('cours')).length;
    const terminees = tables.reparations.filter(r => (r.statut || '').toLowerCase().includes('termin')).length;
    sections.push(`**RÉPARATIONS (${tables.reparations.length} total - ${enCours} en cours, ${terminees} terminées):**\n${tables.reparations.map(r => `- ${r.description_probleme || 'N/A'} (${r.statut || 'N/A'}) - ${r.cout_total || 'N/A'}€`).join('\n')}`);
  }
  
  if (tables.factures?.length) {
    const total = tables.factures.reduce((sum, f) => sum + (Number(f.montant) || 0), 0);
    sections.push(`**FACTURES (${tables.factures.length} total - ${total.toFixed(2)}€ total):**\n${tables.factures.map(f => `- ${f.description || 'N/A'} - ${f.montant || 'N/A'}€ (${f.statut || 'N/A'})`).join('\n')}`);
  }
  
  if (tables.pieces?.length) {
    const faibleStock = tables.pieces.filter(p => (Number(p.stock) || 0) <= 2).length;
    sections.push(`**PIÈCES (${tables.pieces.length} total - ${faibleStock} en faible stock):**\n${tables.pieces.map(p => `- ${p.nom || 'N/A'} (${p.categorie || 'N/A'}) - Stock: ${p.stock || 'N/A'} - ${p.prix || 'N/A'}€`).join('\n')}`);
  }
  
  if (tables.services?.length) {
    sections.push(`**SERVICES (${tables.services.length} total):**\n${tables.services.map(s => `- ${s.nom || 'N/A'} - ${s.prix || 'N/A'}€`).join('\n')}`);
  }
  
  if (tables.rendez_vous?.length) {
    sections.push(`**RENDEZ-VOUS (${tables.rendez_vous.length} total):**\n${tables.rendez_vous.map(r => `- ${r.objet || 'N/A'} (${r.statut || 'N/A'})`).join('\n')}`);
  }
  
  return sections.length > 0 ? sections.join('\n\n') : 'Aucune donnée trouvée dans la base.';
}

function toList(items, map) {
  return items.map(map).filter(Boolean).join(', ');
}

// Fonction pour faire des recherches web externes
async function searchWeb(query) {
  try {
    // Utiliser l'API DuckDuckGo (gratuite, pas besoin de clé API)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Abstract) {
      return {
        source: 'DuckDuckGo',
        abstract: data.Abstract,
        url: data.AbstractURL,
        title: data.AbstractSource
      };
    } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const firstTopic = data.RelatedTopics[0];
      return {
        source: 'DuckDuckGo',
        abstract: firstTopic.Text || 'Information trouvée',
        url: firstTopic.FirstURL,
        title: 'Résultat de recherche'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur recherche web:', error);
    return null;
  }
}

async function generateRuleBasedAnswer(message, tables) {
  const text = (message || '').toLowerCase();
  const parts = [];
  
  // Détecter si la question nécessite une recherche web
  const webSearchKeywords = ['comment', 'pourquoi', 'quand', 'où', 'combien', 'définition', 'défini', 'signification', 'histoire', 'origine', 'différence', 'comparaison', 'tutoriel', 'guide', 'conseil', 'astuce', 'technique', 'procédure', 'méthode'];
  const technicalKeywords = ['moteur', 'frein', 'pneu', 'huile', 'filtre', 'batterie', 'climatisation', 'électricité', 'diagnostic', 'panne', 'dépannage'];
  
  const needsWebSearch = webSearchKeywords.some(keyword => text.includes(keyword)) || 
                        technicalKeywords.some(keyword => text.includes(keyword)) ||
                        (text.includes('?') && !text.includes('mécanicien') && !text.includes('véhicule') && !text.includes('réparation') && !text.includes('facture') && !text.includes('pièce'));
  
  // Si la question semble nécessiter des informations externes, faire une recherche web
  if (needsWebSearch) {
    try {
      // Améliorer la requête de recherche pour les questions techniques
      let searchQuery = message;
      if (text.includes('voiture') || text.includes('véhicule') || text.includes('moteur') || text.includes('frein') || text.includes('pneu')) {
        searchQuery = `réparation automobile ${message}`;
      } else if (text.includes('entretien') || text.includes('maintenance')) {
        searchQuery = `entretien véhicule ${message}`;
      } else if (text.includes('panne') || text.includes('dépannage') || text.includes('diagnostic')) {
        searchQuery = `diagnostic panne automobile ${message}`;
      } else if (text.includes('prix') || text.includes('coût') || text.includes('tarif')) {
        searchQuery = `prix réparation automobile ${message}`;
      }
      
      let webResult = await searchWeb(searchQuery);
      
      // Si pas de résultat, essayer des requêtes alternatives
      if (!webResult && text.includes('voiture') || text.includes('véhicule')) {
        const alternativeQueries = [
          `entretien automobile ${message}`,
          `conseil mécanique ${message}`,
          `guide véhicule ${message}`
        ];
        
        for (const altQuery of alternativeQueries) {
          webResult = await searchWeb(altQuery);
          if (webResult) break;
        }
      }
      
      if (webResult) {
        parts.push(`🌐 **Information trouvée sur le web:**\n\n**${webResult.title}**\n${webResult.abstract}\n\n🔗 Source: [${webResult.source}](${webResult.url})`);
        
        // Ajouter des conseils généraux basés sur le type de question
        if (text.includes('comment') || text.includes('procédure')) {
          parts.push(`💡 **Conseil:** Cette information provient du web et peut être complétée par nos mécaniciens experts. N'hésitez pas à demander des détails spécifiques sur votre véhicule.`);
        } else if (text.includes('prix') || text.includes('coût')) {
          parts.push(`💰 **Note sur les prix:** Ces informations sont indicatives et peuvent varier selon votre véhicule et votre région. Contactez-nous pour un devis personnalisé.`);
        } else if (text.includes('panne') || text.includes('dépannage')) {
          parts.push(`⚠️ **Important:** Ces informations sont générales. Pour un diagnostic précis, consultez nos mécaniciens qui connaissent votre véhicule.`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche web:', error);
    }
  }

  // Rapport demandé explicitement
  if (text.includes('rapport') || text.includes('report')) {
    const nbClients = (tables.clients || []).length;
    const nbEmployes = (tables.employes || []).length;
    const nbVehicules = (tables.vehicules || []).length;
    const nbRep = (tables.reparations || []).length;
    const nbRdv = (tables.rendez_vous || []).length;
    const nbPieces = (tables.pieces || []).length;
    const nbServices = (tables.services || []).length;
    const repEnCours = (tables.reparations || []).filter(r => (r.statut || '').toLowerCase().includes('cours')).length;
    const repTerminees = (tables.reparations || []).filter(r => (r.statut || '').toLowerCase().includes('termin')).length;
    const totalFactures = (tables.factures || []).reduce((s,f)=> s + (Number(f.montant)||0), 0);
    const nbFactures = (tables.factures || []).length;
    const lowStock = (tables.pieces || []).filter(p => (Number(p.stock)||0) <= 2).length;

    const lignes = [
      `Clients: ${nbClients} | Employés: ${nbEmployes}`,
      `Véhicules: ${nbVehicules}`,
      `Réparations: ${nbRep} (en cours: ${repEnCours}, terminées: ${repTerminees})`,
      `Rendez‑vous: ${nbRdv}`,
      `Factures: ${nbFactures} | Total cumulé: ${totalFactures.toFixed(2)} €`,
      `Pièces: ${nbPieces} | Faible stock (≤2): ${lowStock}`,
      `Services: ${nbServices}`,
    ];

    parts.push(`Rapport synthétique:\n- ${lignes.join('\n- ')}`);
  }

  // Questions sur les mécaniciens
  const mechKeywords = ['mecanicien', 'mécanicien', 'mecaniciens', 'mécaniciens', 'mechanic', 'mechanics'];
  if (mechKeywords.some(k => text.includes(k))) {
    const all = tables.employes || [];
    const mecs = all.filter(e => (e.role || '').toLowerCase().includes('mec') || (e.specialite || '').toLowerCase().includes('mec'));
    
    if (text.includes('combien') || text.includes('nombre') || text.includes('quantité')) {
      // Réponse précise sur le nombre
      if (mecs.length > 0) {
        parts.push(`🔧 **Nombre de mécaniciens : ${mecs.length}**`);
        const list = mecs.map(e => {
          const full = `${e.prenom || ''} ${e.nom || ''}`.trim();
          const role = e.role ? ` (${e.role})` : '';
          const statut = e.statut ? ` - ${e.statut}` : '';
          return `• ${full}${role}${statut}`;
        }).join('\n');
        parts.push(`**Liste des mécaniciens :**\n${list}`);
      } else {
        parts.push(`🔧 **Nombre de mécaniciens : 0**`);
        if (all.length > 0) {
          parts.push(`ℹ️ Note : ${all.length} employé(s) trouvé(s) mais aucun n'est identifié comme mécanicien.`);
        }
      }
    } else {
      // Réponse détaillée
      if (mecs.length) {
        const list = mecs.map(e => {
          const full = `${e.prenom || ''} ${e.nom || ''}`.trim();
          const role = e.role ? ` (${e.role})` : '';
          const specialite = e.specialite ? ` - ${e.specialite}` : '';
          const statut = e.statut ? ` - ${e.statut}` : '';
          return `• ${full}${role}${specialite}${statut}`;
        }).join('\n');
        parts.push(`🔧 **Mécaniciens disponibles :**\n${list}`);
      } else if (all.length) {
        const list = all.map(e => `${(e.prenom || '').trim()} ${(e.nom || '').trim()}`.trim()).filter(Boolean).join(', ');
        parts.push(`ℹ️ Aucun mécanicien identifié via le rôle/spécialité. Employés trouvés : ${list}.`);
      } else {
        parts.push(`❌ Aucun mécanicien trouvé dans la base de données.`);
      }
    }
  }

  if (text.includes('vehicule') || text.includes('véhicule') || text.includes('voiture')) {
    if ((tables.vehicules || []).length) {
      parts.push(`Véhicules trouvés: ${toList(tables.vehicules, v => `${v.marque || ''} ${v.modele || ''} (${v.immatriculation || 'sans immatriculation'})`.trim())}.`);
    }
  }

  // Rendez-vous / programmer un rendez-vous
  if (text.includes('rendez') || text.includes('rdv') || text.includes('programmer')) {
    const liens = `Pour programmer: /prendre-rdv (client) ou /rendez-vous (admin/mécanicien)`;
    const exemples = (tables.rendez_vous || []).slice(0,3);
    if (exemples.length) {
      parts.push(`${liens}. Exemples récents: ${toList(exemples, r => `${r.objet || 'Rdv'} le ${(r.date_heure || '').toString().slice(0,16)}`)}.`);
    } else {
      parts.push(`${liens}. Aucun rendez‑vous récent trouvé dans l'extrait.`);
    }
  }

  if (text.includes('reparation') || text.includes('réparation')) {
    if ((tables.reparations || []).length) {
      const enCours = tables.reparations.filter(r => (r.statut || '').toLowerCase().includes('cours')).length;
      const terminees = tables.reparations.filter(r => (r.statut || '').toLowerCase().includes('termin')).length;
      parts.push(`Réparations: ${tables.reparations.length} résultats (en cours: ${enCours}, terminées: ${terminees}).`);
      parts.push(`Exemples: ${toList(tables.reparations.slice(0,3), r => r.description || r.statut)}`);
    }
  }

  if (text.includes('rendez') || text.includes('rdv')) {
    if ((tables.rendez_vous || []).length) {
      parts.push(`Rendez‑vous trouvés: ${tables.rendez_vous.length}. Exemples: ${toList(tables.rendez_vous.slice(0,3), r => `${r.objet || 'Rdv'} le ${(r.date_heure || '').toString().slice(0,16)}`)}.`);
    }
  }

  if (text.includes('facture') || text.includes('paiement')) {
    if ((tables.factures || []).length) {
      const total = tables.factures.reduce((s,f)=> s + (Number(f.montant)||0), 0).toFixed(2);
      parts.push(`Factures trouvées: ${tables.factures.length}. Montant cumulé: ${total} €.`);
    }
  }

  if (text.includes('piece') || text.includes('pièce') || text.includes('stock')) {
    if ((tables.pieces || []).length) {
      const low = tables.pieces.filter(p => (Number(p.stock)||0) <= 2);
      parts.push(`Pièces trouvées: ${tables.pieces.length}. Faible stock: ${toList(low, p => `${p.nom} (stock: ${p.stock})`) || 'aucune détectée'}.`);
    }
  }

  if (!parts.length) {
    const summary = [];
    const keys = ['clients','employes','vehicules','reparations','factures','pieces','services','rendez_vous'];
    keys.forEach(k => { if (tables[k]?.length) summary.push(`${k}: ${tables[k].length}`); });
    if (summary.length) {
      parts.push(`Voici ce que j'ai trouvé dans la base de données: ${summary.join(', ')}.`);
    } else if (needsWebSearch) {
      parts.push(`Je n'ai pas trouvé d'informations spécifiques dans la base de données, mais j'ai effectué une recherche web pour vous.`);
    } else {
      parts.push(`Je n'ai rien trouvé de pertinent dans la base pour votre question. Essayez de reformuler ou posez une question plus précise.`);
    }
  }

  // Si on a des informations web et de la base, faire un résumé intelligent
  if (needsWebSearch && parts.length > 1) {
    parts.push(`\n💡 **Résumé intelligent:** J'ai combiné les informations de votre base de données avec des recherches web pour vous donner une réponse complète.`);
  }

  // Questions sur les clients
  const clientKeywords = ['client', 'clients', 'clientèle'];
  if (clientKeywords.some(k => text.includes(k))) {
    const clients = tables.clients || [];
    if (text.includes('combien') || text.includes('nombre') || text.includes('quantité')) {
      parts.push(`👥 **Nombre de clients : ${clients.length}**`);
      if (clients.length > 0) {
        const list = clients.slice(0, 5).map(c => `• ${c.prenom || ''} ${c.nom || ''}`.trim()).join('\n');
        parts.push(`**Exemples de clients :**\n${list}${clients.length > 5 ? '\n...' : ''}`);
      }
    }
  }

  // Questions sur les véhicules
  const vehiculeKeywords = ['véhicule', 'vehicule', 'voiture', 'auto', 'moto'];
  if (vehiculeKeywords.some(k => text.includes(k))) {
    const vehicules = tables.vehicules || [];
    if (text.includes('combien') || text.includes('nombre') || text.includes('quantité')) {
      parts.push(`🚗 **Nombre de véhicules : ${vehicules.length}**`);
      if (vehicules.length > 0) {
        const list = vehicules.slice(0, 5).map(v => `• ${v.marque || ''} ${v.modele || ''} (${v.immatriculation || 'N/A'})`).join('\n');
        parts.push(`**Exemples de véhicules :**\n${list}${vehicules.length > 5 ? '\n...' : ''}`);
      }
    }
  }

  // Questions sur les réparations
  const reparationKeywords = ['réparation', 'reparation', 'réparations', 'reparations'];
  if (reparationKeywords.some(k => text.includes(k))) {
    const reparations = tables.reparations || [];
    if (text.includes('combien') || text.includes('nombre') || text.includes('quantité')) {
      const enCours = reparations.filter(r => (r.statut || '').toLowerCase().includes('cours')).length;
      const terminees = reparations.filter(r => (r.statut || '').toLowerCase().includes('termin')).length;
      parts.push(`🔧 **Nombre de réparations : ${reparations.length}**`);
      parts.push(`📊 **Détail :** ${enCours} en cours, ${terminees} terminées`);
    }
  }

  // Questions sur les factures
  const factureKeywords = ['facture', 'factures', 'billing'];
  if (factureKeywords.some(k => text.includes(k))) {
    const factures = tables.factures || [];
    if (text.includes('combien') || text.includes('nombre') || text.includes('quantité')) {
      const total = factures.reduce((sum, f) => sum + (Number(f.montant) || 0), 0);
      parts.push(`💰 **Nombre de factures : ${factures.length}**`);
      parts.push(`💵 **Total : ${total.toFixed(2)} €**`);
    }
  }

  // Questions sur les pièces
  const pieceKeywords = ['pièce', 'piece', 'pièces', 'pieces', 'stock'];
  if (pieceKeywords.some(k => text.includes(k))) {
    const pieces = tables.pieces || [];
    if (text.includes('combien') || text.includes('nombre') || text.includes('quantité')) {
      const faibleStock = pieces.filter(p => (Number(p.stock) || 0) <= 2).length;
      parts.push(`🔩 **Nombre de pièces : ${pieces.length}**`);
      parts.push(`⚠️ **Faible stock (≤2) : ${faibleStock} pièces**`);
    }
  }

  return parts.join('\n\n');
}

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message requis' });
    }

    // 1) Récupérer du contexte dans la base
    const { tables } = await searchRelevantData(message);

    // 1.b) Si la question mentionne les mécaniciens, récupérer toute la liste pour être exhaustif
    const msgLower = String(message).toLowerCase();
    const mechKeywords = ['mecanicien', 'mécanicien', 'mecaniciens', 'mécaniciens', 'mechanic', 'mechanics', 'employe', 'employés', 'employes'];
    if (mechKeywords.some(k => msgLower.includes(k)) && pool) {
      try {
        console.log('🔍 Recherche de mécaniciens dans la base...');
        const [rows] = await pool.query(
          `SELECT nom, prenom, email, telephone, poste, actif, salaire, date_embauche
           FROM employes
           WHERE actif = 1
           ORDER BY nom ASC, prenom ASC`
        );
        console.log(`✅ ${rows.length} employés trouvés:`, rows);
        if (Array.isArray(rows) && rows.length) {
          tables.employes = rows;
        }
      } catch (error) {
        console.error('❌ Erreur lors de la recherche des employés:', error.message);
      }
    }

    // 1.c) Si la question mentionne les réparations, récupérer toute la liste pour être exhaustif
    const repKeywords = ['reparations', 'réparations', 'reparation', 'réparation', 'reparer', 'réparer'];
    if (repKeywords.some(k => msgLower.includes(k)) && pool) {
      try {
        console.log('🔍 Recherche de réparations dans la base...');
        const [rows] = await pool.query(
          `SELECT r.*, 
                  c.nom as client_nom, c.prenom as client_prenom,
                  e.nom as employe_nom, e.prenom as employe_prenom,
                  v.marque, v.modele, v.immatriculation
           FROM reparations r
           JOIN vehicules v ON r.id_vehicule = v.id
           JOIN clients c ON v.client_id = c.id
           LEFT JOIN employes e ON r.id_employe = e.id
           ORDER BY r.date_entree DESC`
        );
        console.log(`✅ ${rows.length} réparations trouvées:`, rows);
        if (Array.isArray(rows) && rows.length) {
          tables.reparations = rows;
        }
      } catch (error) {
        console.error('❌ Erreur lors de la recherche des réparations:', error.message);
      }
    }
    const context = buildContextMarkdown(tables);

    // 2) Si client OpenAI disponible, utiliser le SDK officiel (priorité)
    if (openaiClient) {
      try {
        // Construire un prompt intelligent qui combine base de données + recherche web
        let enhancedContext = context || 'Aucun résultat pertinent trouvé dans la base de données.';
        
        // Si c'est une question technique, ajouter des instructions spéciales
        const isTechnicalQuestion = /comment|pourquoi|quand|où|combien|définition|procédure|diagnostic|panne|entretien/.test(message.toLowerCase());
        
        let systemPrompt = `Tu es l'assistant IA expert du garage AutoGenius. Tu DOIS utiliser les données de la base fournies ci-dessous.

RÈGLES OBLIGATOIRES :
1. Réponds TOUJOURS en français
2. **UTILISE OBLIGATOIREMENT les données de la base de données fournies**
3. Si on te demande "combien", "nombre", "quantité" - réponds AVEC LES CHIFFRES EXACTS de la base
4. **NE JAMAIS dire "je n'ai pas accès" ou "je ne dispose pas" - utilise les données fournies**
5. Sois précis et utilise les informations exactes de la base
6. Utilise des emojis appropriés
7. **IMPORTANT : Si tu vois des données dans la base, utilise-les OBLIGATOIREMENT**

DONNÉES DE LA BASE (UTILISE CES CHIFFRES EXACTS) :
${enhancedContext}

Question : ${message}

IMPORTANT : Réponds en utilisant les données de la base fournies ci-dessus. Ne dis jamais que tu n'as pas accès aux informations. Si tu vois des données, utilise-les !`;

        const response = await openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.2,
          max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 800
        });

        const reply = response.choices[0]?.message?.content || 'Réponse indisponible.';
        
        // Ajouter des métadonnées sur l'utilisation de GPT
        return res.json({ 
          reply, 
          sources: tables, 
          llm: true,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          enhanced: true,
          usage: response.usage
        });
        
      } catch (error) {
        console.error('Erreur API OpenAI:', error.message);
        
        // Fallback vers la recherche web + base de données
        console.log('🔄 Fallback vers recherche web + base de données...');
        const reply = await generateRuleBasedAnswer(message, tables);
        return res.json({ 
          reply, 
          sources: tables, 
          llm: false, 
          fallback: true,
          error: 'GPT temporairement indisponible, utilisation du mode hybride'
        });
      }
    }

    // 3) Fallback sans LLM: réponse en français basée sur les données
    const reply = await generateRuleBasedAnswer(message, tables);
    return res.json({ reply, sources: tables, llm: false });
  } catch (err) {
    console.error('Erreur /api/ai/chat:', err);
    // Répondre quand même pour éviter l'échec côté frontend
    return res.status(200).json({ reply: "Je n'ai pas pu interroger entièrement la base pour cette requête, mais le service IA reste disponible. Reformulez votre question (ex: 'liste des mécaniciens', 'réparations en cours pour la Clio', 'pièces en faible stock').", sources: {}, llm: false });
  }
});

// Route pour la recherche web via GPT
app.post('/api/ai/web-search', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message requis' });
    }

    console.log('🌐 Recherche web demandée:', message);

    if (!openaiClient) {
      return res.status(503).json({ 
        error: 'Service GPT non disponible',
        reply: 'Le service de recherche web est temporairement indisponible. Utilisez la recherche locale dans votre base de données.'
      });
    }

    try {
      // Construire un prompt pour la recherche web
      const systemPrompt = `Tu es un expert automobile qui peut faire des recherches en ligne. 
      
RÈGLES :
1. Réponds TOUJOURS en français
2. Sois précis et technique
3. Donne des conseils pratiques
4. Utilise des emojis appropriés
5. Si c'est une question technique, donne des solutions concrètes

Question : ${message}

IMPORTANT : Fais une recherche complète et donne une réponse détaillée et utile.`;

      const response = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000
      });

      const reply = response.choices[0]?.message?.content || 'Réponse indisponible.';
      
      return res.json({ 
        reply, 
        webSearch: true,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        usage: response.usage
      });
      
          } catch (error) {
        console.error('Erreur recherche web GPT:', error.message);
        
        // Gestion spécifique des erreurs OpenAI
        let errorMessage = 'Impossible de faire la recherche web pour le moment.';
        if (error.message.includes('401')) {
          errorMessage = 'Clé API OpenAI invalide. Vérifiez votre configuration.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Limite de requêtes OpenAI dépassée. Réessayez plus tard.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erreur serveur OpenAI. Réessayez plus tard.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Service OpenAI temporairement indisponible.';
        }
        
        return res.status(500).json({ 
          error: 'Erreur lors de la recherche web',
          reply: errorMessage,
          details: error.message
        });
      }
  } catch (err) {
    console.error('Erreur /api/ai/web-search:', err);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      reply: 'Erreur technique lors de la recherche web.'
    });
  }
});

// Rapport téléchargeable (CSV ou JSON)
async function computeReport() {
  const safeCount = async (table) => {
    try { const [r] = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`); return r[0]?.c || 0; } catch { return 0; }
  };
  const counts = {
    clients: await safeCount('clients'),
    employes: await safeCount('employes'),
    vehicules: await safeCount('vehicules'),
    reparations: await safeCount('reparations'),
    rendez_vous: await safeCount('rendez_vous'),
    pieces: await safeCount('pieces'),
    services: await safeCount('services'),
  };
  let factures = { total: 0, somme: 0 };
  try {
    const [r] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(montant),0) AS somme FROM factures');
    factures = { total: r[0]?.total || 0, somme: Number(r[0]?.somme || 0) };
  } catch {}
  let repStats = { en_cours: 0, terminees: 0 };
  try {
    const [r] = await pool.query("SELECT SUM(statut LIKE '%cours%') AS en_cours, SUM(statut LIKE '%termin%') AS terminees FROM reparations");
    repStats = { en_cours: Number(r[0]?.en_cours || 0), terminees: Number(r[0]?.terminees || 0) };
  } catch {}
  let lowStock = 0;
  try {
    const [r] = await pool.query('SELECT COUNT(*) AS low FROM pieces WHERE COALESCE(stock,0) <= 2');
    lowStock = Number(r[0]?.low || 0);
  } catch {}
  return { ...counts, factures, repStats, lowStock };
}

app.get('/api/ai/report', async (req, res) => {
  try {
    const fmt = (req.query.format || 'csv').toLowerCase();
    const data = await computeReport();
    if (fmt === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.json({ generatedAt: new Date().toISOString(), ...data });
    }
    // CSV par défaut
    const lines = [
      ['generatedAt', new Date().toISOString()].join(','),
      ['clients', data.clients].join(','),
      ['employes', data.employes].join(','),
      ['vehicules', data.vehicules].join(','),
      ['reparations_total', data.reparations].join(','),
      ['reparations_en_cours', data.repStats.en_cours].join(','),
      ['reparations_terminees', data.repStats.terminees].join(','),
      ['rendez_vous', data.rendez_vous].join(','),
      ['factures_total', data.factures.total].join(','),
      ['factures_somme_eur', data.factures.somme.toFixed(2)].join(','),
      ['pieces', data.pieces].join(','),
      ['pieces_low_stock', data.lowStock].join(','),
      ['services', data.services].join(','),
    ];
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rapport_garage.csv"');
    return res.send(csv);
  } catch (e) {
    console.error('Erreur /api/ai/report', e);
    res.status(500).json({ error: 'Impossible de générer le rapport' });
  }
});

// Créer la table utilisateurs si elle n'existe pas
async function ensureUsersTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('admin','gerant','mecanicien','vendeur','secretaire','client') DEFAULT 'client',
        employe_id INT NULL,
        actif TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    // Ajouter les colonnes manquantes si besoin
    try { await pool.execute("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS nom VARCHAR(100) NULL"); } catch {}
    try { await pool.execute("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS prenom VARCHAR(100) NULL"); } catch {}
    try { await pool.execute("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS telephone VARCHAR(30) NULL"); } catch {}
    try { await pool.execute("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS type_compte VARCHAR(20) NULL"); } catch {}
    try { await pool.execute("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS client_id INT NULL"); } catch {}
    console.log('✅ Table utilisateurs vérifiée/créée');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table utilisateurs:', error.message);
  }
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = payload; // { id, role }
    next();
  });
}

// Routes pour les clients
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, mot de passe et rôle sont requis' });
    }
    
    // Valider le rôle
    const validRoles = ['admin', 'mecanicien', 'client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Rôles autorisés: admin, mecanicien, client' });
    }
    
    const normalizedEmail = String(email).trim().toLowerCase();
    const [existing] = await pool.execute('SELECT id FROM utilisateurs WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Déterminer le type_compte selon le rôle
    let type_compte = 'client';
    if (role === 'admin') type_compte = 'admin';
    else if (role === 'mecanicien') type_compte = 'mecanicien';
    
    let clientId = null;
    let employeId = null;
    
    // Si c'est un client, créer un enregistrement dans la table clients
    if (role === 'client') {
      const [clientResult] = await pool.execute(
        'INSERT INTO clients (nom, prenom, email, telephone, adresse, date_creation) VALUES (?, ?, ?, ?, ?, NOW())',
        [nom || '', prenom || '', normalizedEmail, '', '']
      );
      clientId = clientResult.insertId;
    }
    
    // Si c'est un mécanicien, créer un enregistrement dans la table employes
    if (role === 'mecanicien') {
      try {
        const [employeResult] = await pool.execute(
          'INSERT INTO employes (nom, prenom, email, telephone, poste, date_embauche) VALUES (?, ?, ?, ?, ?, NOW())',
          [nom || '', prenom || '', normalizedEmail, '', 'Mécanicien']
        );
        employeId = employeResult.insertId;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // Réutiliser l'employé existant par email
          const [existingEmp] = await pool.execute('SELECT id FROM employes WHERE email = ?', [normalizedEmail]);
          if (existingEmp.length > 0) {
            employeId = existingEmp[0].id;
          } else {
            // Fallback sans la colonne poste
            const [employeResult] = await pool.execute(
              'INSERT INTO employes (nom, prenom, email, telephone, date_embauche) VALUES (?, ?, ?, ?, NOW())',
              [nom || '', prenom || '', normalizedEmail, '']
            );
            employeId = employeResult.insertId;
          }
        } else {
          console.error('Erreur création employé:', error);
          const [employeResult] = await pool.execute(
            'INSERT INTO employes (nom, prenom, email, telephone, date_embauche) VALUES (?, ?, ?, ?, NOW())',
            [nom || '', prenom || '', normalizedEmail, '']
          );
          employeId = employeResult.insertId;
        }
      }
    }
    
    const [result] = await pool.execute(
      'INSERT INTO utilisateurs (email, mot_de_passe, role, type_compte, client_id, employe_id, nom, prenom, telephone, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [normalizedEmail, passwordHash, role, type_compte, clientId, employeId, nom || '', prenom || '', '']
    );
    
    const user = { 
      id: result.insertId, 
      nom: nom || '', 
      prenom: prenom || '', 
      email: normalizedEmail, 
      role,
      type_compte,
      client_id: clientId
    };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email et mot de passe sont requis' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    // S'assurer que la table utilisateurs existe
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('admin','gerant','mecanicien','vendeur','secretaire','client') DEFAULT 'client',
        employe_id INT NULL,
        actif TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Si aucun utilisateur n'existe, créer un admin par défaut
    const [cntRows] = await pool.execute('SELECT COUNT(*) as c FROM utilisateurs');
    const usersCount = (cntRows && cntRows[0] && cntRows[0].c) || 0;
    if (usersCount === 0) {
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@local';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await pool.execute(
        'INSERT INTO utilisateurs (email, mot_de_passe, role, actif) VALUES (?, ?, ?, 1)',
        [defaultEmail, passwordHash, 'admin']
      );
      console.log(`✅ Admin par défaut créé: ${defaultEmail} / ${defaultPassword}`);
    }

    const [rows] = await pool.execute('SELECT * FROM utilisateurs WHERE email = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const dbUser = rows[0];
    const match = await bcrypt.compare(password, dbUser.mot_de_passe);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const user = { 
      id: dbUser.id, 
      email: dbUser.email, 
      role: dbUser.role,
      type_compte: dbUser.type_compte || 'client',
      nom: dbUser.nom || '',
      prenom: dbUser.prenom || '',
      client_id: dbUser.client_id || null
    };
    const token = signToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== Gestion des utilisateurs (admin) =====
// Liste des utilisateurs (id, nom, prenom, email, role)
app.get('/api/utilisateurs', authenticateToken, async (req, res) => {
  try {
    // Autoriser uniquement admin
    const [u] = await pool.execute('SELECT role FROM utilisateurs WHERE id = ?', [req.user.id]);
    if (!u.length || u[0].role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    const [rows] = await pool.execute('SELECT id, nom, prenom, email, telephone, role FROM utilisateurs ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour d'un utilisateur (nom, prenom, email, role, mot_de_passe)
app.put('/api/utilisateurs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, role, password } = req.body;
    const [u] = await pool.execute('SELECT role FROM utilisateurs WHERE id = ?', [req.user.id]);
    if (!u.length || u[0].role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, id]);
    }
    await pool.execute('UPDATE utilisateurs SET nom = ?, prenom = ?, email = ?, telephone = ?, role = ? WHERE id = ?', [nom || '', prenom || '', (email || '').toLowerCase(), telephone || '', role || 'client', id]);
    res.json({ message: 'Utilisateur mis à jour' });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, role, created_at FROM utilisateurs WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur /me:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { nom, prenom, telephone, email, adresse, date_naissance } = req.body;
    
    // Validation des champs obligatoires
    if (!nom || !prenom) {
      return res.status(400).json({ error: 'Le nom et le prénom sont obligatoires' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO clients (nom, prenom, telephone, email, adresse, date_naissance) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, telephone || null, email || null, adresse || null, date_naissance || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Client ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du client:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du client' });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, telephone, email, adresse, date_naissance } = req.body;
    
    // Validation des champs obligatoires
    if (!nom || !prenom) {
      return res.status(400).json({ error: 'Le nom et le prénom sont obligatoires' });
    }
    
    await pool.execute(
      'UPDATE clients SET nom = ?, prenom = ?, telephone = ?, email = ?, adresse = ?, date_naissance = ? WHERE id = ?',
      [nom, prenom, telephone || null, email || null, adresse || null, date_naissance || null, id]
    );
    res.json({ message: 'Client mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour gérer les erreurs de tables manquantes
function handleTableError(error, tableName, res) {
  console.error(`Erreur avec la table ${tableName}:`, error);
  if (error.message.includes("doesn't exist") || error.message.includes("Table")) {
    return res.json([]); // Retourner un tableau vide au lieu d'une erreur 500
  }
  return res.status(500).json({ error: 'Erreur serveur' });
}

// Routes pour les employés
app.get('/api/employes', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM employes ORDER BY date_embauche DESC');
    res.json(rows);
  } catch (error) {
    handleTableError(error, 'employes', res);
  }
});

app.post('/api/employes', async (req, res) => {
  try {
    const { nom, prenom, poste, telephone, email, salaire, date_embauche, actif } = req.body;
    
    // Debug: afficher les données reçues
    console.log('Données reçues pour création employé:', { nom, prenom, poste, actif });
    
    // Validation des champs requis
    if (!nom || !prenom || !poste) {
      return res.status(400).json({ 
        error: 'Les champs nom, prénom et poste sont obligatoires' 
      });
    }
    
    // Gestion des valeurs optionnelles
    const cleanTelephone = telephone || null;
    const cleanEmail = email || null;
    const cleanSalaire = salaire ? parseFloat(salaire) : null;
    const cleanDateEmbauche = date_embauche || new Date().toISOString().split('T')[0];
    const cleanActif = actif !== undefined ? (actif ? 1 : 0) : 1;
    console.log('Valeur actif finale:', cleanActif, '(actif reçu:', actif, ')');
    
    const [result] = await pool.execute(
      'INSERT INTO employes (nom, prenom, poste, telephone, email, salaire, date_embauche, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, poste, cleanTelephone, cleanEmail, cleanSalaire, cleanDateEmbauche, cleanActif]
    );
    res.status(201).json({ id: result.insertId, message: 'Employé ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'employé:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.put('/api/employes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, poste, telephone, email, salaire, date_embauche, actif } = req.body;
    
    // Validation des champs requis
    if (!nom || !prenom || !poste) {
      return res.status(400).json({ 
        error: 'Les champs nom, prénom et poste sont obligatoires' 
      });
    }
    
    // Gestion des valeurs optionnelles
    const cleanTelephone = telephone || null;
    const cleanEmail = email || null;
    const cleanSalaire = salaire ? parseFloat(salaire) : null;
    const cleanDateEmbauche = date_embauche || new Date().toISOString().split('T')[0];
    const cleanActif = actif !== undefined ? (actif ? 1 : 0) : 1;
    
    await pool.execute(
      'UPDATE employes SET nom = ?, prenom = ?, poste = ?, telephone = ?, email = ?, salaire = ?, date_embauche = ?, actif = ? WHERE id = ?',
      [nom, prenom, poste, cleanTelephone, cleanEmail, cleanSalaire, cleanDateEmbauche, cleanActif, id]
    );
    res.json({ message: 'Employé mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.delete('/api/employes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Tentative de suppression de l\'employé avec ID:', id);
    
    // Vérifier d'abord si l'employé existe
    const [checkRows] = await pool.execute('SELECT id, nom, prenom FROM employes WHERE id = ?', [id]);
    
    if (checkRows.length === 0) {
      console.log('Employé non trouvé avec ID:', id);
      return res.status(404).json({ error: `Employé avec l'ID ${id} non trouvé` });
    }
    
    console.log('Employé trouvé:', checkRows[0]);
    
    // Effectuer la suppression
    const [result] = await pool.execute('DELETE FROM employes WHERE id = ?', [id]);
    console.log('Résultat de la suppression:', result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Aucun employé supprimé avec l'ID ${id}` });
    }
    
    res.json({ 
      message: 'Employé supprimé avec succès',
      deletedEmploye: checkRows[0],
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la suppression de l\'employé:', error);
    console.error('Code d\'erreur MySQL:', error.code);
    console.error('Message d\'erreur MySQL:', error.message);
    console.error('SQL State:', error.sqlState);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet employé car il est référencé par d\'autres données (réparations, etc.)' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression',
      details: error.message,
      code: error.code
    });
  }
});

// Routes pour les véhicules
app.get('/api/vehicules', async (req, res) => {
  try {
    const { client_id } = req.query;
    let query = `
      SELECT v.*, CONCAT(c.nom, ' ', c.prenom) as client_nom 
      FROM vehicules v 
      LEFT JOIN clients c ON v.client_id = c.id 
    `;
    const params = [];
    if (client_id) {
      query += ' WHERE v.client_id = ? ';
      params.push(client_id);
    }
    // Tri sur l'identifiant existant
    query += ' ORDER BY v.id DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    handleTableError(error, 'vehicules', res);
  }
});

// Route spécifique pour les clients - ne montre que leurs véhicules
app.get('/api/client/vehicules', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer le client_id de l'utilisateur
    const [userRows] = await pool.execute('SELECT client_id FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || !userRows[0].client_id) {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non lié à un client' });
    }
    
    const clientId = userRows[0].client_id;
    
    const query = `
      SELECT v.*, CONCAT(c.nom, ' ', c.prenom) as client_nom 
      FROM vehicules v 
      LEFT JOIN clients c ON v.client_id = c.id 
      WHERE v.client_id = ?
      ORDER BY v.id DESC
    `;
    
    const [rows] = await pool.execute(query, [clientId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération véhicules client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/vehicules', async (req, res) => {
  try {
    const { marque, modele, annee, immatriculation, numero_chassis, couleur, kilometrage, carburant, client_id } = req.body;
    
    // Validation des champs requis
    if (!marque || !modele || !immatriculation) {
      return res.status(400).json({ 
        error: 'Les champs marque, modèle et numéro d\'immatriculation sont obligatoires' 
      });
    }
    
    // Gestion des valeurs optionnelles
    const cleanAnnee = annee || null;
    const cleanNumeroChassis = numero_chassis || null;
    const cleanCouleur = couleur || null;
    const cleanKilometrage = kilometrage ? parseFloat(kilometrage) : null;
    const cleanCarburant = carburant || null;
    const cleanClientId = client_id || null;

    // Si un client est fourni, vérifier qu'il existe
    if (cleanClientId) {
      const [clientRows] = await pool.execute('SELECT id FROM clients WHERE id = ?', [cleanClientId]);
      if (clientRows.length === 0) {
        return res.status(400).json({ error: `Client introuvable (id=${cleanClientId})` });
      }
    }
    
    const [result] = await pool.execute(
      'INSERT INTO vehicules (marque, modele, annee, immatriculation, numero_chassis, couleur, kilometrage, carburant, client_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [marque, modele, cleanAnnee, immatriculation, cleanNumeroChassis, cleanCouleur, cleanKilometrage, cleanCarburant, cleanClientId]
    );
    res.status(201).json({ id: result.insertId, message: 'Véhicule ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du véhicule:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: `Numéro d'immatriculation déjà utilisé (${req.body.immatriculation}).` });
    }
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.put('/api/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { marque, modele, annee, immatriculation, numero_chassis, couleur, kilometrage, carburant, client_id } = req.body;
    
    // Validation des champs requis
    if (!marque || !modele || !immatriculation) {
      return res.status(400).json({ 
        error: 'Les champs marque, modèle et numéro d\'immatriculation sont obligatoires' 
      });
    }
    
    // Gestion des valeurs optionnelles
    const cleanAnnee = annee || null;
    const cleanNumeroChassis = numero_chassis || null;
    const cleanCouleur = couleur || null;
    const cleanKilometrage = kilometrage ? parseFloat(kilometrage) : null;
    const cleanCarburant = carburant || null;
    const cleanClientId = client_id || null;

    if (cleanClientId) {
      const [clientRows] = await pool.execute('SELECT id FROM clients WHERE id = ?', [cleanClientId]);
      if (clientRows.length === 0) {
        return res.status(400).json({ error: `Client introuvable (id=${cleanClientId})` });
      }
    }
    
    await pool.execute(
      'UPDATE vehicules SET marque = ?, modele = ?, annee = ?, immatriculation = ?, numero_chassis = ?, couleur = ?, kilometrage = ?, carburant = ?, client_id = ? WHERE id = ?',
      [marque, modele, cleanAnnee, immatriculation, cleanNumeroChassis, cleanCouleur, cleanKilometrage, cleanCarburant, cleanClientId, id]
    );
    res.json({ message: 'Véhicule mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.delete('/api/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM vehicules WHERE id = ?', [id]);
    res.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les réparations
app.get('/api/reparations', async (req, res) => {
  try {
    const { employe_id, client_id } = req.query;
    let query = `
      SELECT r.*, 
             c.id as client_id,
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             CONCAT(e.nom, ' ', e.prenom) as employe_nom,
             CONCAT(v.marque, ' ', v.modele, ' - ', v.immatriculation) as vehicule_info
      FROM reparations r
      JOIN vehicules v ON r.vehicule_id = v.id
      JOIN clients c ON v.client_id = c.id
      LEFT JOIN employes e ON r.employe_id = e.id
    `;
    const conditions = [];
    const params = [];
    if (employe_id) {
      conditions.push('r.employe_id = ?');
      params.push(employe_id);
    }
    if (client_id) {
      conditions.push('c.id = ?');
      params.push(client_id);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY r.date_debut DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des réparations:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

// Route spécifique pour les clients - ne montre que leurs réparations
app.get('/api/client/reparations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer le client_id de l'utilisateur
    const [userRows] = await pool.execute('SELECT client_id FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || !userRows[0].client_id) {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non lié à un client' });
    }
    
    const clientId = userRows[0].client_id;
    
    const query = `
      SELECT r.*, 
             c.id as client_id,
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             CONCAT(e.nom, ' ', e.prenom) as employe_nom,
             CONCAT(v.marque, ' ', v.modele, ' - ', v.immatriculation) as vehicule_info
      FROM reparations r
      JOIN vehicules v ON r.vehicule_id = v.id
      JOIN clients c ON v.client_id = c.id
      LEFT JOIN employes e ON r.employe_id = e.id
      WHERE c.id = ?
      ORDER BY r.date_debut DESC
    `;
    
    const [rows] = await pool.execute(query, [clientId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération réparations client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/reparations', async (req, res) => {
  try {
    const { vehicule_id, employe_id, description_probleme, description_travaux, statut } = req.body;
    
    // Validation des champs requis
    if (!vehicule_id || !description_probleme) {
      return res.status(400).json({ 
        error: 'Les champs véhicule et description du problème sont obligatoires' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO reparations (vehicule_id, employe_id, description_probleme, description_travaux, date_debut, statut) VALUES (?, ?, ?, ?, NOW(), ?)',
      [vehicule_id, employe_id || null, description_probleme, description_travaux || null, statut || 'ouvert']
    );
    res.status(201).json({ id: result.insertId, message: 'Réparation créée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création de la réparation:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.put('/api/reparations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicule_id, employe_id, description_probleme, description_travaux, statut, duree_heures, validee_par_mecanicien, date_validation_mecanicien, confirme_par_client, date_confirmation_client, validee_par_client } = req.body;
    
    // Assurer la présence des colonnes nécessaires pour les mises à jour partielles du rapport
    try {
      const [columns] = await pool.execute('SHOW COLUMNS FROM reparations');
      const columnNames = columns.map(col => col.Field);
      const alters = [];
      if (!columnNames.includes('description_travaux')) {
        alters.push('ADD COLUMN description_travaux TEXT NULL');
      }
      if (!columnNames.includes('duree_heures')) {
        alters.push('ADD COLUMN duree_heures DECIMAL(5,2) DEFAULT 0');
      }
      if (!columnNames.includes('validee_par_mecanicien')) {
        alters.push('ADD COLUMN validee_par_mecanicien TINYINT(1) DEFAULT 0');
      }
      if (!columnNames.includes('date_validation_mecanicien')) {
        alters.push('ADD COLUMN date_validation_mecanicien DATETIME NULL');
      }
      if (!columnNames.includes('confirme_par_client')) {
        alters.push('ADD COLUMN confirme_par_client TINYINT(1) DEFAULT 0');
      }
      if (!columnNames.includes('date_confirmation_client')) {
        alters.push('ADD COLUMN date_confirmation_client DATETIME NULL');
      }
      if (!columnNames.includes('validee_par_client')) {
        alters.push('ADD COLUMN validee_par_client TINYINT(1) DEFAULT 0');
      }
      if (alters.length > 0) {
        await pool.execute(`ALTER TABLE reparations ${alters.join(', ')}`);
      }
    } catch (schemaErr) {
      console.warn('Avertissement: échec de la vérification/ajout des colonnes reparations:', schemaErr.message || schemaErr);
    }
    
    console.log('Données reçues pour mise à jour réparation:', { id, vehicule_id, employe_id, description_probleme, description_travaux, statut, duree_heures, validee_par_mecanicien });
    
    // Déterminer le type de mise à jour
    const hasRapportData = description_travaux !== undefined || duree_heures !== undefined;
    const hasFullData = vehicule_id && description_probleme;
    
    console.log('🔍 Analyse du type de mise à jour:', {
      hasRapportData,
      hasFullData,
      hasVehiculeId: !!vehicule_id,
      hasDescriptionProbleme: !!description_probleme,
      hasDescriptionTravaux: description_travaux !== undefined,
      hasDureeHeures: duree_heures !== undefined
    });
    
    if (hasRapportData && !hasFullData) {
      // Mise à jour du rapport seulement (travaux + durée)
      console.log('📋 Mise à jour du rapport seulement');
      await pool.execute(
        'UPDATE reparations SET description_travaux = ?, duree_heures = ? WHERE id = ?',
        [description_travaux || null, duree_heures || 0, id]
      );
    } else if (statut && !hasFullData && !hasRapportData) {
      // Mise à jour du statut seulement
      console.log('🔄 Mise à jour du statut seulement');
      await pool.execute(
        'UPDATE reparations SET statut = ? WHERE id = ?',
        [statut, id]
      );
    } else {
      // Mise à jour complète - validation des champs requis
      console.log('🔄 Mise à jour complète');
      if (!vehicule_id || !description_probleme) {
        return res.status(400).json({ 
          error: 'Les champs véhicule et description du problème sont obligatoires pour une mise à jour complète' 
        });
      }
      
      await pool.execute(
        'UPDATE reparations SET vehicule_id = ?, employe_id = ?, description_probleme = ?, description_travaux = ?, statut = ?, duree_heures = ?, validee_par_mecanicien = ?, date_validation_mecanicien = ?, confirme_par_client = ?, date_confirmation_client = ?, validee_par_client = ? WHERE id = ?',
        [vehicule_id, employe_id || null, description_probleme, description_travaux || null, statut || 'En attente', duree_heures || 0, validee_par_mecanicien || false, date_validation_mecanicien || null, confirme_par_client || false, date_confirmation_client || null, validee_par_client || false, id]
      );
    }
    
    // Générer automatiquement une facture dès qu'une réparation passe au statut "termine"
    // (que ce soit validée par mécanicien ou confirmée par le client)
    if (statut === 'termine') {
      try {
        await generateFactureAutomatique(id);
        console.log(`Facture générée automatiquement pour la réparation ${id}`);
      } catch (factureError) {
        console.error('Erreur lors de la génération automatique de la facture:', factureError);
        // On ne fait pas échouer la mise à jour de la réparation si la facture échoue
      }
    }
    
    res.json({ message: 'Réparation mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réparation:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.delete('/api/reparations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM reparations WHERE id_reparation = ?', [id]);
    res.json({ message: 'Réparation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réparation:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

// Route de test pour vérifier la base de données
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Test de la base de données...');
    
    // Vérifier les tables
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('Tables disponibles:', tables.map(t => Object.values(t)[0]));
    
    // Vérifier la table clients
    const [clients] = await pool.execute('SELECT COUNT(*) as count FROM clients');
    console.log('Nombre de clients:', clients[0].count);
    
    // Vérifier la table reparations
    const [reparations] = await pool.execute('SELECT COUNT(*) as count FROM reparations');
    console.log('Nombre de réparations:', reparations[0].count);
    
    // Vérifier la table factures
    const [factures] = await pool.execute('SELECT COUNT(*) as count FROM factures');
    console.log('Nombre de factures:', factures[0].count);
    
    res.json({
      tables: tables.map(t => Object.values(t)[0]),
      clients: clients[0].count,
      reparations: reparations[0].count,
      factures: factures[0].count
    });
  } catch (error) {
    console.error('Erreur lors du test de la base de données:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fonction pour générer automatiquement une facture
async function generateFactureAutomatique(reparationId) {
  try {
    console.log(`Génération de facture automatique pour la réparation ${reparationId}`);
    
    // Récupérer les informations de la réparation
    const [reparationRows] = await pool.execute(`
      SELECT r.*, 
             c.id as id_client, c.nom as client_nom, c.prenom as client_prenom, c.email as client_email,
             v.marque, v.modele, v.immatriculation
      FROM reparations r
      JOIN vehicules v ON r.vehicule_id = v.id
      JOIN clients c ON v.client_id = c.id
      WHERE r.id = ?
    `, [reparationId]);
    
    if (reparationRows.length === 0) {
      throw new Error(`Réparation ${reparationId} non trouvée`);
    }
    
    const reparation = reparationRows[0];
    
    // Calculer le montant basé sur la durée (30€/heure par défaut)
    const tarifHoraire = 30.00;
    const dureeHeures = parseFloat(reparation.duree_heures) || 1.0; // Minimum 1 heure
    const totalHT = dureeHeures * tarifHoraire;
    const totalTTC = totalHT * 1.20; // TVA 20%
    
    // Générer un numéro de facture unique
    const numero = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Créer la facture
    const [result] = await pool.execute(`
      INSERT INTO factures (numero, client_id, reparation_id, date_facture, total_ht, total_ttc, statut, notes)
      VALUES (?, ?, ?, CURDATE(), ?, ?, 'brouillon', ?)
    `, [
      numero,
      reparation.id_client,
      reparationId,
      totalHT,
      totalTTC,
      `Facture automatique pour réparation ${reparationId} - ${dureeHeures}h de main d'œuvre`
    ]);
    
    console.log(`Facture ${numero} créée avec succès pour la réparation ${reparationId}`);
    return { id: result.insertId, numero, totalTTC };
    
  } catch (error) {
    console.error('Erreur lors de la génération automatique de la facture:', error);
    throw error;
  }
}

// Générer les factures manquantes pour toutes les réparations terminées
async function generateFacturesManquantes() {
  try {
    const [rows] = await pool.execute(`
      SELECT r.id_reparation
      FROM reparations r
      LEFT JOIN factures f ON f.reparation_id = r.id_reparation
      WHERE (LOWER(r.statut) = 'termine' OR LOWER(r.statut) = 'terminé' OR LOWER(r.statut) = 'terminee' OR LOWER(r.statut) = 'terminée')
        AND f.id IS NULL
    `);
    let created = 0;
    for (const row of rows) {
      try {
        await generateFactureAutomatique(row.id_reparation);
        created += 1;
      } catch (e) {
        console.error('Erreur génération facture manquante pour', row.id_reparation, e.message);
      }
    }
    return { created };
  } catch (error) {
    console.error('Erreur lors de la génération des factures manquantes:', error);
    throw error;
  }
}

// Routes pour les factures
app.get('/api/factures', async (req, res) => {
  try {
    console.log('Tentative de récupération des factures...');
    
    // Vérifier si la table factures existe
    const [tables] = await pool.execute('SHOW TABLES LIKE "factures"');
    
    if (tables.length === 0) {
      console.log('Table factures n\'existe pas, retour d\'un tableau vide');
      return res.json([]);
    }
    
    // Générer à la volée les factures manquantes pour réparations déjà terminées
    try {
      const result = await generateFacturesManquantes();
      if (result.created > 0) {
        console.log(`✅ ${result.created} facture(s) manquante(s) créée(s) automatiquement.`);
      }
    } catch (e) {
      console.warn('⚠️ Impossible de générer les factures manquantes:', e.message);
    }

    // Récupérer les factures avec les bonnes jointures
    // Déterminer la colonne nom de pièce existante
    const [pieceCols] = await pool.execute('SHOW COLUMNS FROM pieces');
    const pieceNames = pieceCols.map(c => c.Field);
    const pieceNameCol = pieceNames.includes('nom_piece') ? 'p.nom_piece' : 'p.nom';

    const sqlAll = `
      SELECT f.*, 
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             c.email as client_email,
             v.marque, v.modele, v.immatriculation,
             r.duree_heures, r.description_travaux,
             GROUP_CONCAT(CONCAT(pu.quantite, ' x ', ${pieceNameCol}, ' @ ', pu.prix_unitaire) SEPARATOR '\n') AS lignes_pieces
      FROM factures f
      JOIN clients c ON f.client_id = c.id
      LEFT JOIN reparations r ON f.reparation_id = r.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN pieces_utilisees pu ON pu.reparation_id = r.id
      LEFT JOIN pieces p ON p.id = pu.piece_id
      GROUP BY f.id
      ORDER BY f.date_facture DESC
    `;
    const [rows] = await pool.execute(sqlAll);
    
    console.log('Factures récupérées avec succès:', rows.length, 'factures');
    res.json(rows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les factures d'un client spécifique
app.get('/api/factures/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    // Générer d'abord les factures manquantes au cas où
    try {
      const result = await generateFacturesManquantes();
      if (result.created > 0) {
        console.log(`✅ ${result.created} facture(s) manquante(s) créée(s) pour les réparations terminées.`);
      }
    } catch (e) {
      console.warn('⚠️ Impossible de générer les factures manquantes (client):', e.message);
    }
    
    // Déterminer la colonne nom de pièce existante
    const [pieceCols] = await pool.execute('SHOW COLUMNS FROM pieces');
    const pieceNames = pieceCols.map(c => c.Field);
    const pieceNameCol = pieceNames.includes('nom_piece') ? 'p.nom_piece' : 'p.nom';

    const sqlClient = `
      SELECT f.*, 
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             c.email as client_email,
             v.marque, v.modele, v.immatriculation,
             r.duree_heures, r.description_travaux,
             GROUP_CONCAT(CONCAT(pu.quantite, ' x ', ${pieceNameCol}, ' @ ', pu.prix_unitaire) SEPARATOR '\n') AS lignes_pieces
      FROM factures f
      JOIN clients c ON f.client_id = c.id
      LEFT JOIN reparations r ON f.reparation_id = r.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN pieces_utilisees pu ON pu.reparation_id = r.id
      LEFT JOIN pieces p ON p.id = pu.piece_id
      WHERE f.client_id = ?
      GROUP BY f.id
      ORDER BY f.date_facture DESC
    `;
    const [rows] = await pool.execute(sqlClient, [clientId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route spécifique pour les clients - ne montre que leurs factures
app.get('/api/client/factures', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer le client_id de l'utilisateur
    const [userRows] = await pool.execute('SELECT client_id FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || !userRows[0].client_id) {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non lié à un client' });
    }
    
    const clientId = userRows[0].client_id;
    
    // Générer d'abord les factures manquantes au cas où
    try {
      const result = await generateFacturesManquantes();
      if (result.created > 0) {
        console.log(`✅ ${result.created} facture(s) manquante(s) créée(s) pour les réparations terminées.`);
      }
    } catch (e) {
      console.warn('⚠️ Impossible de générer les factures manquantes (client):', e.message);
    }
    
    const [rows] = await pool.execute(`
      SELECT f.*, 
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             c.email as client_email,
             v.marque, v.modele, v.immatriculation
      FROM factures f
      JOIN clients c ON f.client_id = c.id
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

app.post('/api/factures', async (req, res) => {
  try {
    const { client_id, reparation_id, total_ht, total_ttc, statut } = req.body;
    
    console.log('Données reçues pour création facture:', { client_id, reparation_id, total_ht, total_ttc, statut });
    
    // Validation des champs requis
    if (!client_id) {
      return res.status(400).json({ error: 'client_id est requis' });
    }
    if (!reparation_id) {
      return res.status(400).json({ error: 'reparation_id est requis' });
    }
    
    const numero = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [result] = await pool.execute(
      'INSERT INTO factures (numero, client_id, reparation_id, total_ht, total_ttc, statut, date_facture) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [numero, client_id, reparation_id, total_ht, total_ttc, statut || 'brouillon']
    );
    res.status(201).json({ id: result.insertId, numero, message: 'Facture créée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, reparation_id, total_ht, total_ttc, statut } = req.body;
    await pool.execute(
      'UPDATE factures SET client_id = ?, reparation_id = ?, total_ht = ?, total_ttc = ?, statut = ? WHERE id = ?',
      [client_id, reparation_id, total_ht, total_ttc, statut, id]
    );
    res.json({ message: 'Facture mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const factureId = parseInt(id, 10);
    if (Number.isNaN(factureId)) {
      return res.status(400).json({ error: 'ID de facture invalide' });
    }

    // Vérifier l'existence
    const [existRows] = await pool.execute('SELECT id FROM factures WHERE id = ?', [factureId]);
    if (!existRows || existRows.length === 0) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }

    const [result] = await pool.execute('DELETE FROM factures WHERE id = ?', [factureId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    // Gestion d'erreurs MySQL courantes
    const code = error && (error.code || error.errno);
    if (code === 'ER_ROW_IS_REFERENCED_2' || code === 1451) {
      return res.status(409).json({ error: 'Suppression impossible: facture référencée par une autre table.' });
    }
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Helpers schéma pièces
async function inspectPiecesSchema(connection) {
  const [cols] = await connection.execute('SHOW COLUMNS FROM pieces');
  const names = cols.map(c => c.Field);
  return {
    hasIdPiece: names.includes('id_piece'),
    hasId: names.includes('id'),
    hasNomPiece: names.includes('nom_piece'),
    hasNom: names.includes('nom'),
    hasPrixUnitaire: names.includes('prix_unitaire'),
    hasPrixVente: names.includes('prix_vente'),
    hasStockActuel: names.includes('stock_actuel'),
    hasStock: names.includes('stock'),
    hasStockMinimum: names.includes('stock_minimum'),
    hasDescription: names.includes('description'),
    hasReference: names.includes('reference'),
    hasIdFournisseur: names.includes('id_fournisseur'),
    hasFournisseur: names.includes('fournisseur'),
    hasImage: names.includes('image')
  };
}

function mapPieceRow(row, s) {
  return {
    id_piece: s.hasIdPiece ? row.id_piece : (s.hasId ? row.id : undefined),
    id: s.hasId ? row.id : (s.hasIdPiece ? row.id_piece : undefined),
    nom_piece: s.hasNomPiece ? row.nom_piece : (s.hasNom ? row.nom : undefined),
    reference: row.reference,
    description: s.hasDescription ? row.description : null,
    prix_unitaire: s.hasPrixUnitaire ? row.prix_unitaire : (s.hasPrixVente ? row.prix_vente : null),
    stock_actuel: s.hasStockActuel ? row.stock_actuel : (s.hasStock ? row.stock : 0),
    stock_minimum: s.hasStockMinimum ? row.stock_minimum : 0,
    id_fournisseur: s.hasIdFournisseur ? row.id_fournisseur : null,
    nom_fournisseur: (row.nom_fournisseur !== undefined ? row.nom_fournisseur : (s.hasFournisseur ? row.fournisseur : null)),
    image: s.hasImage ? row.image : null
  };
}

// Routes pour les pièces
app.get('/api/pieces', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const s = await inspectPiecesSchema(connection);
    const orderCol = s.hasNomPiece ? 'p.nom_piece' : (s.hasNom ? 'p.nom' : (s.hasReference ? 'p.reference' : 'p.id'));
    let sql = `SELECT p.*`;
    if (s.hasIdFournisseur) {
      sql += `, f.nom_fournisseur AS nom_fournisseur`;
    } else if (s.hasFournisseur) {
      sql += `, p.fournisseur AS nom_fournisseur`;
    }
    sql += ` FROM pieces p`;
    if (s.hasIdFournisseur) {
      sql += ` LEFT JOIN fournisseurs f ON f.id_fournisseur = p.id_fournisseur`;
    }
    sql += ` ORDER BY ${orderCol}`;
    const [rows] = await connection.execute(sql);
    const normalized = rows.map(r => mapPieceRow(r, s));
    res.json(normalized);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    try { connection.release(); } catch {}
  }
});

// Assurer la table pieces_utilisees et logique d'ajout sur réparation
async function ensurePiecesUtiliseesSchema() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pieces_utilisees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reparation_id INT NOT NULL,
        piece_id INT NOT NULL,
        quantite INT DEFAULT 1,
        prix_unitaire DECIMAL(10,2) NOT NULL,
        client_request_id VARCHAR(64) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (reparation_id),
        INDEX (piece_id),
        UNIQUE KEY uniq_client_req (client_request_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Si la table existait déjà sans la colonne/index, les ajouter
    const [cols] = await pool.execute('SHOW COLUMNS FROM pieces_utilisees');
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('client_request_id')) {
      await pool.execute('ALTER TABLE pieces_utilisees ADD COLUMN client_request_id VARCHAR(64) DEFAULT NULL');
    }
    const [idx] = await pool.execute("SHOW INDEX FROM pieces_utilisees WHERE Key_name = 'uniq_client_req'");
    if (!idx || idx.length === 0) {
      await pool.execute('ALTER TABLE pieces_utilisees ADD UNIQUE KEY uniq_client_req (client_request_id)');
    }
  } catch (e) {
    console.warn('Avertissement ensurePiecesUtiliseesSchema:', e.message || e);
  }
}

// Ajouter une pièce à une réparation et mettre à jour la facture
app.post('/api/reparations/:id/pieces', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await ensurePiecesUtiliseesSchema();
    const { id } = req.params; // reparation id
    const { piece_id, quantite, client_request_id } = req.body;
    const qty = Math.max(1, parseInt(quantite || 1, 10));
    console.log('📦 [REQ] prendre_piece', { reparation_id: id, piece_id, quantite: qty, client_request_id });

    // Vérifier réparation
    const [repRows] = await connection.execute('SELECT id, client_id FROM reparations WHERE id = ? OR id_reparation = ?', [id, id]);
    if (repRows.length === 0) {
      return res.status(404).json({ error: 'Réparation introuvable' });
    }
    const reparationId = repRows[0].id || id;
    const clientId = repRows[0].client_id || null;

    // Récupérer la pièce et vérifier le stock (compat id/id_piece)
    const [pieceCols] = await connection.execute('SHOW COLUMNS FROM pieces');
    const pieceColNames = pieceCols.map(c => c.Field);
    const hasIdPiece = pieceColNames.includes('id_piece');
    const hasId = pieceColNames.includes('id');
    let pieceRows;
    if (hasIdPiece) {
      [pieceRows] = await connection.execute('SELECT * FROM pieces WHERE id_piece = ?', [piece_id]);
    } else if (hasId) {
      [pieceRows] = await connection.execute('SELECT * FROM pieces WHERE id = ?', [piece_id]);
    } else {
      throw new Error('Schéma pièces invalide: colonne ID manquante');
    }
    if (pieceRows.length === 0) {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    const piece = pieceRows[0];
    const pieceId = (hasIdPiece ? piece.id_piece : piece.id);
    const unitPrice = parseFloat((piece.prix_unitaire ?? piece.prix_vente ?? 0));
    const stock = parseInt((piece.stock_actuel ?? piece.stock ?? 0), 10);
    console.log('📦 [STATE BEFORE]', { pieceId, stock, unitPrice });
    if (stock < qty) {
      return res.status(400).json({ error: `Stock insuffisant (disponible: ${stock})` });
    }

    await connection.beginTransaction();

    // Verrouiller la ligne pièce pour sérialiser les décréments concurrents
    {
      const idCol = hasIdPiece ? 'id_piece' : 'id';
      await connection.execute(`SELECT ${idCol} FROM pieces WHERE ${idCol} = ? FOR UPDATE`, [pieceId]);
    }

    // Idempotence simple: ignorer un double-clic/renvoi immédiat (<=10s) avec mêmes paramètres
    const [lastRows] = await connection.execute(
      'SELECT id, quantite, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age_s FROM pieces_utilisees WHERE reparation_id = ? AND piece_id = ? ORDER BY id DESC LIMIT 1',
      [reparationId, pieceId]
    );
    if (lastRows.length > 0 && lastRows[0].quantite === qty && lastRows[0].age_s !== null && lastRows[0].age_s <= 10) {
      console.log('🛡️ [IDEMP] doublon détecté (<=10s), annulation décrément');
      await connection.rollback();
      return res.json({ message: 'Requête déjà traitée (idempotent)', idempotent: true });
    }

    // Insérer la consommation
    try {
      if (client_request_id) {
        await connection.execute(
          'INSERT INTO pieces_utilisees (reparation_id, piece_id, quantite, prix_unitaire, client_request_id) VALUES (?, ?, ?, ?, ?)',
          [reparationId, pieceId, qty, unitPrice, client_request_id]
        );
      } else {
        await connection.execute(
          'INSERT INTO pieces_utilisees (reparation_id, piece_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
          [reparationId, pieceId, qty, unitPrice]
        );
      }
    } catch (e) {
      if (e && e.code === 'ER_DUP_ENTRY') {
        console.log('🛡️ [IDEMP] collision client_request_id, insertion ignorée');
        await connection.rollback();
        return res.json({ message: 'Requête déjà traitée (nonce)', idempotent: true });
      }
      throw e;
    }

    // Décrémenter le stock sur la bonne colonne (stock ou stock_actuel)
    const hasStockCol = pieceColNames.includes('stock');
    const hasStockActuelCol = pieceColNames.includes('stock_actuel');
    const stockCol = hasStockCol ? 'stock' : (hasStockActuelCol ? 'stock_actuel' : null);
    if (!stockCol) throw new Error('Schéma pièces invalide: colonne stock manquante');
    const idCol = hasIdPiece ? 'id_piece' : 'id';
    await connection.execute(`UPDATE pieces SET ${stockCol} = ${stockCol} - ? WHERE ${idCol} = ?`, [qty, pieceId]);
    const [afterStockRows] = await connection.execute(`SELECT ${stockCol} AS stock_after FROM pieces WHERE ${idCol} = ?`, [pieceId]);
    const stockAfter = afterStockRows?.[0]?.stock_after ?? null;

    // Rechercher/Créer une facture pour la réparation
    let factureId = null;
    const [factRows] = await connection.execute('SELECT id, total_ht FROM factures WHERE reparation_id = ? ORDER BY id DESC LIMIT 1', [reparationId]);
    const addHT = unitPrice * qty;
    if (factRows.length === 0) {
      if (!clientId) {
        // Récupérer client depuis réparation si manquant
        const [rep2] = await connection.execute('SELECT client_id FROM reparations WHERE id = ?', [reparationId]);
        if (rep2.length > 0) {
          factureId = null; // continue
        }
      }
      const numero = `FAC-${Date.now()}`;
      const totalHT = addHT;
      const totalTTC = +(totalHT * 1.2).toFixed(2);
      const [ins] = await connection.execute(
        'INSERT INTO factures (numero, client_id, reparation_id, date_facture, total_ht, total_ttc, statut) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
        [numero, clientId, reparationId, totalHT, totalTTC, 'brouillon']
      );
      factureId = ins.insertId;
    } else {
      factureId = factRows[0].id;
      const newHT = parseFloat(factRows[0].total_ht || 0) + addHT;
      const newTTC = +(newHT * 1.2).toFixed(2);
      await connection.execute('UPDATE factures SET total_ht = ?, total_ttc = ? WHERE id = ?', [newHT, newTTC, factureId]);
    }

    await connection.commit();
    console.log('📦 [STATE AFTER]', { pieceId, qty, stockAfter, factureId });
    return res.json({ message: 'Pièce ajoutée à la réparation et facture mise à jour', facture_id: factureId, stock_after: stockAfter });
  } catch (error) {
    try { await connection.rollback(); } catch {}
    console.error('Erreur lors de l\'ajout de pièce à la réparation:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    try { connection.release(); } catch {}
  }
});

// Nouvelle route pour la boutique client
app.get('/api/boutique/produits', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id_produit,
        reference,
        nom_produit,
        description,
        prix,
        stock,
        categorie,
        image,
        note,
        nombre_avis
      FROM produits 
      ORDER BY id_produit
    `);
    
    // Transformer les données pour correspondre au format attendu par le frontend
    const produits = rows.map(row => ({
      id: row.id_produit,
      reference: row.reference,
      nom: row.nom_produit,
      description: row.description,
      prix: parseFloat(row.prix) || 0,
      stock: row.stock || 0,
      categorie: row.categorie || 'Général',
      image: row.image,
      note: parseFloat(row.note) || 4.0,
      nombreAvis: row.nombre_avis || 0
    }));
    
    res.json(produits);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits de la boutique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint DELETE pour supprimer un produit de la boutique
app.delete('/api/boutique/produits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que le produit existe
    const [existingRows] = await pool.execute(
      'SELECT id_produit FROM produits WHERE id_produit = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Supprimer le produit
    await pool.execute(
      'DELETE FROM produits WHERE id_produit = ?',
      [id]
    );
    
    console.log(`Produit ${id} supprimé avec succès`);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
});

// Endpoint PUT pour modifier un produit de la boutique
app.put('/api/boutique/produits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, stock, categorie, reference, image, note, nombreAvis } = req.body;
    
    // Vérifier que le produit existe
    const [existingRows] = await pool.execute(
      'SELECT id_produit FROM produits WHERE id_produit = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Mettre à jour le produit
    await pool.execute(
      `UPDATE produits SET 
        nom_produit = ?, 
        description = ?, 
        prix = ?, 
        stock = ?, 
        categorie = ?, 
        reference = ?, 
        image = ?, 
        note = ?, 
        nombre_avis = ?
      WHERE id_produit = ?`,
      [nom, description, prix, stock, categorie, reference, image, note, nombreAvis, id]
    );
    
    console.log(`Produit ${id} modifié avec succès`);
    res.json({ message: 'Produit modifié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la modification' });
  }
});

// Endpoint de test pour diagnostiquer le problème
app.post('/api/boutique/test', async (req, res) => {
  try {
    console.log('Test endpoint appelé');
    console.log('Données reçues:', req.body);
    
    // Test de connexion à la base de données
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM produits');
    console.log('Nombre de produits dans la base:', rows[0].count);
    
    // Test d'insertion simple
    const [result] = await pool.execute(
      'INSERT INTO produits (nom_produit, prix, stock, categorie) VALUES (?, ?, ?, ?)',
      ['Test Diagnostic', 1.99, 1, 'test']
    );
    
    console.log('Test d\'insertion réussi, ID:', result.insertId);
    
    res.json({ 
      message: 'Test réussi', 
      count: rows[0].count,
      insertId: result.insertId 
    });
  } catch (error) {
    console.error('Erreur dans le test:', error);
    res.status(500).json({ 
      error: 'Erreur de test: ' + error.message,
      stack: error.stack 
    });
  }
});

// Endpoint POST pour créer un nouveau produit de la boutique
app.post('/api/boutique/produits', async (req, res) => {
  try {
    const { nom, description, prix, stock, categorie, reference, image, note, nombreAvis } = req.body;
    
    console.log('Données reçues pour création produit:', req.body);
    
    // Validation des champs obligatoires
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ error: 'Le nom du produit est obligatoire' });
    }
    
    if (!prix || isNaN(prix)) {
      return res.status(400).json({ error: 'Le prix est obligatoire et doit être un nombre' });
    }
    
    if (!stock || isNaN(stock)) {
      return res.status(400).json({ error: 'Le stock est obligatoire et doit être un nombre' });
    }
    
    // Nettoyer et valider les données
    const cleanData = [
      nom.trim(),
      description ? description.trim() : null,
      parseFloat(prix),
      parseInt(stock),
      categorie || 'Général',
      reference || null,
      image || null,
      note ? parseFloat(note) : 4.0,
      nombreAvis ? parseInt(nombreAvis) : 0
    ];
    
    console.log('Données nettoyées:', cleanData);
    
    // Créer le nouveau produit avec une requête SQL complète
    const [result] = await pool.execute(
      `INSERT INTO produits (nom_produit, description, prix, stock, categorie, reference, image, note, nombre_avis) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      cleanData
    );
    
    console.log(`Nouveau produit créé avec l'ID: ${result.insertId}`);
    res.status(201).json({ 
      message: 'Produit créé avec succès', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création: ' + error.message,
      details: error.stack 
    });
  }
});

app.post('/api/pieces', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Accepter les noms de champs du formulaire
    const { nom_piece, nom, reference, description, prix_unitaire, prix_vente, stock_actuel, stock, stock_minimum, id_fournisseur, fournisseur, image } = req.body;

    console.log('Données reçues pour création pièce:', req.body);

    const s = await inspectPiecesSchema(connection);
    const finalNom = (nom_piece || nom || '').trim();
    if (!finalNom) return res.status(400).json({ error: 'Le nom de la pièce est obligatoire' });
    if (!reference || reference.trim() === '') return res.status(400).json({ error: 'La référence est obligatoire' });

    const prixValue = s.hasPrixUnitaire ? parseFloat(prix_unitaire ?? prix_vente) : parseFloat(prix_vente ?? prix_unitaire);
    if (isNaN(prixValue)) return res.status(400).json({ error: 'Le prix est obligatoire et doit être un nombre' });

    const stockValue = parseInt((stock_actuel ?? stock ?? 0), 10) || 0;
    const stockMin = parseInt((stock_minimum ?? 5), 10) || 5;

    // Construire requête selon schéma
    // Construire dynamiquement colonnes/valeurs selon schéma
    const columns = [];
    const values = [];
    const placeholders = [];
    const canLegacy = s.hasNomPiece && s.hasPrixUnitaire && s.hasStockActuel;
    if (canLegacy) {
      columns.push('nom_piece'); values.push(finalNom); placeholders.push('?');
      columns.push('reference'); values.push(reference.trim()); placeholders.push('?');
      if (s.hasDescription) { columns.push('description'); values.push(description || null); placeholders.push('?'); }
      columns.push('prix_unitaire'); values.push(prixValue); placeholders.push('?');
      columns.push('stock_actuel'); values.push(stockValue); placeholders.push('?');
      if (s.hasStockMinimum) { columns.push('stock_minimum'); values.push(stockMin); placeholders.push('?'); }
      if (s.hasIdFournisseur) { columns.push('id_fournisseur'); values.push(id_fournisseur || null); placeholders.push('?'); }
      if (s.hasImage) { columns.push('image'); values.push(image || null); placeholders.push('?'); }
    } else {
      columns.push('nom'); values.push(finalNom); placeholders.push('?');
      columns.push('reference'); values.push(reference.trim()); placeholders.push('?');
      if (s.hasDescription) { columns.push('description'); values.push(description || null); placeholders.push('?'); }
      columns.push('prix_vente'); values.push(prixValue); placeholders.push('?');
      if (s.hasStock) { columns.push('stock'); values.push(stockValue); placeholders.push('?'); }
      else if (s.hasStockActuel) { columns.push('stock_actuel'); values.push(stockValue); placeholders.push('?'); }
      if (s.hasStockMinimum) { columns.push('stock_minimum'); values.push(stockMin); placeholders.push('?'); }
      if (s.hasFournisseur) {
        // Si on reçoit un id_fournisseur mais pas de colonne id_fournisseur, mapper vers le nom
        let fournisseurValue = fournisseur || null;
        if (!fournisseurValue && id_fournisseur) {
          try {
            const [fr] = await connection.execute('SELECT nom_fournisseur FROM fournisseurs WHERE id_fournisseur = ?', [id_fournisseur]);
            if (fr.length > 0) fournisseurValue = fr[0].nom_fournisseur;
          } catch {}
        }
        columns.push('fournisseur'); values.push(fournisseurValue); placeholders.push('?');
      }
      if (s.hasImage) { columns.push('image'); values.push(image || null); placeholders.push('?'); }
    }

    const sql = `INSERT INTO pieces (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const [result] = await connection.execute(sql, values);
    res.status(201).json({ id: result.insertId, message: 'Pièce ajoutée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la pièce:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'La référence existe déjà' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    try { connection.release(); } catch {}
  }
});

app.put('/api/pieces/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { nom_piece, nom, reference, description, prix_unitaire, prix_vente, stock_actuel, stock, stock_minimum, id_fournisseur, fournisseur, image } = req.body;
    const s = await inspectPiecesSchema(connection);

    const setParts = [];
    const params = [];
    const canLegacy = s.hasNomPiece && s.hasPrixUnitaire && s.hasStockActuel;
    if (canLegacy) {
      setParts.push('nom_piece = ?'); params.push(nom_piece || nom || null);
      setParts.push('reference = ?'); params.push(reference || null);
      if (s.hasDescription) { setParts.push('description = ?'); params.push(description || null); }
      setParts.push('prix_unitaire = ?'); params.push((typeof prix_unitaire !== 'undefined' ? prix_unitaire : prix_vente) || null);
      setParts.push('stock_actuel = ?'); params.push((typeof stock_actuel !== 'undefined' ? stock_actuel : stock) || null);
      if (s.hasStockMinimum) { setParts.push('stock_minimum = ?'); params.push(stock_minimum || null); }
      if (s.hasIdFournisseur) { setParts.push('id_fournisseur = ?'); params.push(id_fournisseur || null); }
      if (s.hasImage) { setParts.push('image = ?'); params.push(image || null); }
      const idCol = s.hasIdPiece ? 'id_piece' : 'id';
      params.push(id);
      const sql = `UPDATE pieces SET ${setParts.join(', ')} WHERE ${idCol} = ?`;
      await connection.execute(sql, params);
    } else {
      setParts.push('nom = ?'); params.push(nom || nom_piece || null);
      setParts.push('reference = ?'); params.push(reference || null);
      if (s.hasDescription) { setParts.push('description = ?'); params.push(description || null); }
      setParts.push('prix_vente = ?'); params.push((typeof prix_vente !== 'undefined' ? prix_vente : prix_unitaire) || null);
      if (s.hasStock) { setParts.push('stock = ?'); params.push((typeof stock !== 'undefined' ? stock : stock_actuel) || null); }
      else if (s.hasStockActuel) { setParts.push('stock_actuel = ?'); params.push((typeof stock_actuel !== 'undefined' ? stock_actuel : stock) || null); }
      if (s.hasStockMinimum) { setParts.push('stock_minimum = ?'); params.push(stock_minimum || null); }
      if (s.hasFournisseur) {
        let fournisseurValue = fournisseur || null;
        if (!fournisseurValue && id_fournisseur) {
          try {
            const [fr] = await connection.execute('SELECT nom_fournisseur FROM fournisseurs WHERE id_fournisseur = ?', [id_fournisseur]);
            if (fr.length > 0) fournisseurValue = fr[0].nom_fournisseur;
          } catch {}
        }
        setParts.push('fournisseur = ?'); params.push(fournisseurValue);
      }
      if (s.hasImage) { setParts.push('image = ?'); params.push(image || null); }
      params.push(id);
      const sql = `UPDATE pieces SET ${setParts.join(', ')} WHERE id = ?`;
      await connection.execute(sql, params);
    }
    res.json({ message: 'Pièce mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la pièce:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    try { connection.release(); } catch {}
  }
});

app.delete('/api/pieces/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const s = await inspectPiecesSchema(connection);
    const whereCol = s.hasIdPiece ? 'id_piece' : (s.hasId ? 'id' : null);
    if (!whereCol) return res.status(500).json({ error: 'Schéma pièces invalide' });
    await connection.execute(`DELETE FROM pieces WHERE ${whereCol} = ?`, [id]);
    res.json({ message: 'Pièce supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce:', error);
    if (error && error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Impossible de supprimer: pièce utilisée dans des réparations' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    try { connection.release(); } catch {}
  }
});

// Routes pour les fournisseurs
app.get('/api/fournisseurs', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM fournisseurs ORDER BY nom_fournisseur');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/fournisseurs', async (req, res) => {
  try {
    const { nom_fournisseur, adresse, telephone, email, contact_principal } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO fournisseurs (nom_fournisseur, adresse, telephone, email, contact_principal) VALUES (?, ?, ?, ?, ?)',
      [nom_fournisseur, adresse, telephone, email, contact_principal]
    );
    res.status(201).json({ id: result.insertId, message: 'Fournisseur ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du fournisseur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/fournisseurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_fournisseur, adresse, telephone, email, contact_principal } = req.body;
    await pool.execute(
      'UPDATE fournisseurs SET nom_fournisseur = ?, adresse = ?, telephone = ?, email = ?, contact_principal = ? WHERE id_fournisseur = ?',
      [nom_fournisseur, adresse, telephone, email, contact_principal, id]
    );
    res.json({ message: 'Fournisseur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fournisseur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/fournisseurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM fournisseurs WHERE id_fournisseur = ?', [id]);
    res.json({ message: 'Fournisseur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les articles de la boutique
app.get('/api/boutique/articles', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT a.*, c.nom_categorie 
      FROM boutique_articles a 
      LEFT JOIN categories_boutique c ON a.id_categorie = c.id_categorie 
      WHERE a.actif = 1 
      ORDER BY a.nom_article
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/boutique/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories_boutique WHERE actif = 1 ORDER BY nom_categorie');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== ROUTES POUR LES PHOTOS DES PRODUITS ====================

// Récupérer toutes les photos d'un produit
app.get('/api/boutique/produits/:produitId/photos', async (req, res) => {
  try {
    const { produitId } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        id,
        produit_id,
        nom_fichier,
        chemin_fichier,
        type_mime,
        taille_fichier,
        image_data,
        est_principale,
        date_creation
      FROM photos_produits 
      WHERE produit_id = ? 
      ORDER BY est_principale DESC, date_creation ASC
    `, [produitId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des photos:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter une photo à un produit
app.post('/api/boutique/produits/:produitId/photos', async (req, res) => {
  try {
    const { produitId } = req.params;
    const { nom_fichier, type_mime, image_data, est_principale = false } = req.body;
    
    if (!nom_fichier || !type_mime || !image_data) {
      return res.status(400).json({ error: 'Données de photo manquantes' });
    }
    
    // Calculer la taille du fichier
    const taille_fichier = image_data.length;
    
    // Si c'est la photo principale, désactiver les autres photos principales
    if (est_principale) {
      await pool.execute(`
        UPDATE photos_produits 
        SET est_principale = FALSE 
        WHERE produit_id = ?
      `, [produitId]);
    }
    
    // Insérer la nouvelle photo
    const [result] = await pool.execute(`
      INSERT INTO photos_produits (
        produit_id, nom_fichier, chemin_fichier, type_mime, 
        taille_fichier, image_data, est_principale
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      produitId,
      nom_fichier,
      `photos/produit_${produitId}/${nom_fichier}`,
      type_mime,
      taille_fichier,
      image_data,
      est_principale
    ]);
    
    res.json({ 
      success: true, 
      photo_id: result.insertId,
      message: 'Photo ajoutée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la photo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une photo
app.delete('/api/boutique/photos/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const [result] = await pool.execute(`
      DELETE FROM photos_produits WHERE id = ?
    `, [photoId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }
    
    res.json({ success: true, message: 'Photo supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Définir une photo comme principale
app.put('/api/boutique/photos/:photoId/principale', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Récupérer l'ID du produit
    const [photoRows] = await pool.execute(`
      SELECT produit_id FROM photos_produits WHERE id = ?
    `, [photoId]);
    
    if (photoRows.length === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }
    
    const produitId = photoRows[0].produit_id;
    
    // Désactiver toutes les photos principales du produit
    await pool.execute(`
      UPDATE photos_produits 
      SET est_principale = FALSE 
      WHERE produit_id = ?
    `, [produitId]);
    
    // Activer cette photo comme principale
    await pool.execute(`
      UPDATE photos_produits 
      SET est_principale = TRUE 
      WHERE id = ?
    `, [photoId]);
    
    res.json({ success: true, message: 'Photo définie comme principale' });
  } catch (error) {
    console.error('Erreur lors de la définition de la photo principale:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les commandes de la boutique
app.post('/api/commandes', async (req, res) => {
  try {
    const { produit, quantite, client, position } = req.body;
    
    // Insérer la commande dans la base de données
    const [result] = await pool.execute(`
      INSERT INTO commandes_boutique (
        id_produit, nom_produit, reference_produit, prix_produit, image_produit,
        quantite, nom_client, email_client, telephone_client, adresse_client,
        latitude, longitude, statut, date_commande
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Nouveau', NOW())
    `, [
      produit.id,
      produit.nom,
      produit.reference,
      produit.prix,
      produit.image,
      quantite,
      client.nom,
      client.email,
      client.telephone,
      client.adresse,
      position.lat,
      position.lng
    ]);
    
    res.json({ 
      success: true, 
      message: 'Commande enregistrée avec succès',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/commandes', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
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
    
    // Transformer les données pour correspondre au format attendu par le frontend
    const commandes = rows.map(row => ({
      id: `cmd_${row.id}`,
      date: row.date_commande,
      produit: {
        id: row.id_produit,
        nom: row.nom_produit,
        reference: row.reference_produit,
        prix: row.prix_produit,
        image: row.image_produit
      },
      quantite: row.quantite,
      client: {
        nom: row.nom_client,
        email: row.email_client,
        telephone: row.telephone_client,
        adresse: row.adresse_client
      },
      position: {
        lat: parseFloat(row.latitude) || 0,
        lng: parseFloat(row.longitude) || 0
      },
      statut: row.statut
    }));
    
    res.json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une commande de la boutique
app.delete('/api/commandes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID requis' });
    const [exist] = await pool.execute('SELECT id FROM commandes_boutique WHERE id = ?', [id]);
    if (!exist || exist.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    const [result] = await pool.execute('DELETE FROM commandes_boutique WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Commande introuvable' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression commande:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les services (vérification/auto-correction du schéma)
async function ensureServicesSchema() {
  try {
    // Créer la table si elle n'existe pas
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        description TEXT NULL,
        categorie VARCHAR(50) NULL,
        prix DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        duree_estimee INT NULL,
        statut ENUM('actif','inactif') DEFAULT 'actif',
        date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Assurer la présence des colonnes attendues
    const [cols] = await pool.execute('SHOW COLUMNS FROM services');
    const names = cols.map(c => c.Field);
    const alters = [];
    if (!names.includes('description')) alters.push('ADD COLUMN description TEXT NULL');
    if (!names.includes('categorie')) alters.push("ADD COLUMN categorie VARCHAR(50) NULL");
    if (!names.includes('prix')) alters.push("ADD COLUMN prix DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    if (!names.includes('duree_estimee')) alters.push('ADD COLUMN duree_estimee INT NULL');
    if (!names.includes('statut')) alters.push("ADD COLUMN statut ENUM('actif','inactif') DEFAULT 'actif'");
    if (!names.includes('date_creation')) alters.push('ADD COLUMN date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
    if (alters.length > 0) {
      await pool.execute(`ALTER TABLE services ${alters.join(', ')}`);
    }
  } catch (e) {
    console.warn('Avertissement ensureServicesSchema:', e.message || e);
  }
}
app.get('/api/services', async (req, res) => {
  try {
    await ensureServicesSchema();
    const [rows] = await pool.execute('SELECT * FROM services ORDER BY nom');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    await ensureServicesSchema();
    const { nom, description, categorie, prix, duree_estimee, statut } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO services (nom, description, categorie, prix, duree_estimee, statut) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, description, categorie, prix, duree_estimee, statut || 'actif']
    );
    res.status(201).json({ id: result.insertId, message: 'Service ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    await ensureServicesSchema();
    const { id } = req.params;
    const { nom, description, categorie, prix, duree_estimee, statut } = req.body;
    await pool.execute(
      'UPDATE services SET nom = ?, description = ?, categorie = ?, prix = ?, duree_estimee = ?, statut = ? WHERE id = ?',
      [nom, description, categorie, prix, duree_estimee, statut, id]
    );
    res.json({ message: 'Service mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les rendez-vous
app.get('/api/rendez-vous', async (req, res) => {
  try {
    const { client_id, employe_id } = req.query;
    let query = `
      SELECT rv.*, 
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             CONCAT(e.nom, ' ', e.prenom) as employe_nom,
             CONCAT(v.marque, ' ', v.modele, ' - ', v.immatriculation) as vehicule_info,
             s.nom as service_nom
      FROM rendez_vous rv
      JOIN clients c ON rv.client_id = c.id
      LEFT JOIN employes e ON rv.employe_id = e.id
      JOIN vehicules v ON rv.vehicule_id = v.id
      LEFT JOIN services s ON rv.service_id = s.id
    `;
    const params = [];
    const conditions = [];
    if (client_id) {
      conditions.push('rv.client_id = ?');
      params.push(client_id);
    }
    if (employe_id) {
      conditions.push('rv.employe_id = ?');
      params.push(employe_id);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY rv.date_rdv DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route spécifique pour les clients - ne montre que leurs rendez-vous
app.get('/api/client/rendez-vous', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer le client_id de l'utilisateur
    const [userRows] = await pool.execute('SELECT client_id FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || !userRows[0].client_id) {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non lié à un client' });
    }
    
    const clientId = userRows[0].client_id;
    
    const query = `
      SELECT rv.*, 
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             CONCAT(e.nom, ' ', e.prenom) as employe_nom,
             CONCAT(v.marque, ' ', v.modele, ' - ', v.immatriculation) as vehicule_info,
             s.nom as service_nom
      FROM rendez_vous rv
      JOIN clients c ON rv.client_id = c.id
      LEFT JOIN employes e ON rv.employe_id = e.id
      JOIN vehicules v ON rv.vehicule_id = v.id
      LEFT JOIN services s ON rv.service_id = s.id
      WHERE rv.client_id = ?
      ORDER BY rv.date_rdv DESC
    `;
    
    const [rows] = await pool.execute(query, [clientId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération rendez-vous client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/rendez-vous', async (req, res) => {
  try {
    const { client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut } = req.body;
    
    // Validation des données
    if (!client_id || !vehicule_id || !date_rdv) {
      return res.status(400).json({ error: 'Client, véhicule et date sont obligatoires' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO rendez_vous (client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client_id, vehicule_id, employe_id || null, service_id || null, date_rdv, motif || null, statut || 'en_attente']
    );
    res.status(201).json({ id: result.insertId, message: 'Rendez-vous créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer automatiquement une réparation à partir d'un rendez-vous (utilisé par le mécanicien)
app.post('/api/rendez-vous/:id/to-reparation', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let { employe_id, description_probleme, duree_estimee_heures } = req.body;
    // Récupérer le rendez-vous
    const [rows] = await pool.execute('SELECT * FROM rendez_vous WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous introuvable' });
    }
    const rdv = rows[0];

    // Si aucun employe_id fourni et l'utilisateur est mécanicien, déduire via son email
    if (!employe_id) {
      const [userRows] = await pool.execute('SELECT role FROM utilisateurs WHERE id = ?', [req.user.id]);
      if (userRows.length > 0 && userRows[0].role === 'mecanicien') {
        const [employeRows] = await pool.execute('SELECT id FROM employes WHERE email = (SELECT email FROM utilisateurs WHERE id = ?)', [req.user.id]);
        if (employeRows.length > 0) {
          employe_id = employeRows[0].id;
        }
      }
    }

    // Créer la réparation liée au véhicule du RDV selon le schéma actuel (numero, client_id, vehicule_id, employe_id, date_debut, probleme, statut)
    const numero = `REP-${Date.now()}`;
    const probleme = description_probleme || rdv.motif || 'Problème issu du rendez-vous';
    const statut = 'en_cours';
    const insertSql = `
      INSERT INTO reparations (numero, client_id, vehicule_id, employe_id, date_debut, probleme, statut)
      VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `;
    const [result] = await pool.execute(insertSql, [numero, rdv.client_id, rdv.vehicule_id, employe_id || null, probleme, statut]);
    // Marquer le rendez-vous comme confirmé et en traitement
    await pool.execute('UPDATE rendez_vous SET statut = ? WHERE id = ?', ['confirme', id]);
    res.status(201).json({ id_reparation: result.insertId, message: 'Réparation créée depuis le rendez-vous' });
  } catch (error) {
    console.error('Erreur lors de la création de la réparation depuis le rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/rendez-vous/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut } = req.body;
    
    // Mise à jour du statut seulement
    if (statut && !client_id && !vehicule_id && !date_rdv) {
      await pool.execute('UPDATE rendez_vous SET statut = ? WHERE id = ?', [statut, id]);
      return res.json({ message: 'Statut du rendez-vous mis à jour avec succès' });
    }
    
    // Validation des données complètes
    if (!client_id || !vehicule_id || !date_rdv) {
      return res.status(400).json({ error: 'Client, véhicule et date sont obligatoires' });
    }
    
    await pool.execute(
      'UPDATE rendez_vous SET client_id = ?, vehicule_id = ?, employe_id = ?, service_id = ?, date_rdv = ?, motif = ?, statut = ? WHERE id = ?',
      [client_id, vehicule_id, employe_id || null, service_id || null, date_rdv, motif || null, statut || 'en_attente', id]
    );
    res.json({ message: 'Rendez-vous mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Assigner/désassigner un mécanicien à un rendez-vous (mise à jour partielle)
app.patch('/api/rendez-vous/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { employe_id } = req.body;
    await pool.execute('UPDATE rendez_vous SET employe_id = ? WHERE id = ?', [employe_id || null, id]);
    res.json({ message: 'Mécanicien assigné avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'assignation du mécanicien:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste des mécaniciens basée sur la table utilisateurs (rôle = mecanicien)
app.get('/api/employes/mecaniciens', async (req, res) => {
  try {
    // Stratégie principale: joindre employes à utilisateurs via email et filtrer role = mecanicien
    const query = `
      SELECT e.*
      FROM employes e
      JOIN utilisateurs u ON u.email = e.email
      WHERE u.role = 'mecanicien'
      ORDER BY e.nom, e.prenom
    `;
    const [rows] = await pool.execute(query);
    if (rows.length > 0) {
      return res.json(rows);
    }

    // Fallback: si aucune correspondance par email, utiliser les champs locaux d'employes
    const [fallback] = await pool.execute(
      "SELECT * FROM employes WHERE LOWER(role) = 'mecanicien' OR LOWER(COALESCE(poste, '')) LIKE '%mecanicien%' ORDER BY nom, prenom"
    );
    return res.json(fallback);
  } catch (error) {
    console.error('Erreur récupération mécaniciens:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.delete('/api/rendez-vous/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM rendez_vous WHERE id = ?', [id]);
    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les statistiques du tableau de bord
app.get('/api/dashboard/stats', async (req, res) => {
  try {
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
      employes: await safeCount('employes'),
      commandes: await safeCount('commandes_boutique'),
      reparationsEnCours: await safeCount('reparations', "statut = 'en_cours'"),
      reparationsTerminees: await safeCount('reparations', "statut = 'termine'"),
      rendezVous: await safeCount('rendez_vous')
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    // Retourner des valeurs par défaut au lieu d'une erreur 500
    res.json({
      clients: 0,
      vehicules: 0,
      reparations: 0,
      factures: 0,
      employes: 0,
      reparationsEnCours: 0,
      reparationsTerminees: 0,
      rendezVous: 0,
      error: 'Base de données en cours de réparation'
    });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Garage fonctionne correctement!' });
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
// ===== ROUTES SPÉCIFIQUES AUX MÉCANICIENS =====

// Helper: garantir qu'un enregistrement employé existe pour l'utilisateur mécanicien
async function ensureEmployeForMecanicien(userId) {
  // Récupérer l'email de l'utilisateur (certains schémas n'ont pas nom/prenom dans utilisateurs)
  const [userInfoRows] = await pool.execute(
    'SELECT email FROM utilisateurs WHERE id = ? AND role = "mecanicien"',
    [userId]
  );
  if (userInfoRows.length === 0) {
    return null;
  }
  const { email } = userInfoRows[0];
  const nom = 'Mécanicien';
  const prenom = '';

  // Chercher un employé existant par email
  const [existingEmploye] = await pool.execute(
    'SELECT id FROM employes WHERE email = ?',
    [email]
  );
  if (existingEmploye.length > 0) {
    return existingEmploye[0].id;
  }

  // Créer un employé minimal si manquant
  const insertQuery = `
    INSERT INTO employes (nom, prenom, email, role, statut)
    VALUES (?, ?, ?, 'mecanicien', 'actif')
  `;
  const [insertResult] = await pool.execute(insertQuery, [nom, prenom, email]);
  return insertResult.insertId;
}

// Route pour récupérer les véhicules assignés à un mécanicien
app.get('/api/mecanicien/vehicules', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est un mécanicien
    const [userRows] = await pool.execute('SELECT role FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || userRows[0].role !== 'mecanicien') {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non autorisé' });
    }
    
    // Récupérer/assurer l'ID de l'employé correspondant
    let [employeRows] = await pool.execute('SELECT id FROM employes WHERE email = (SELECT email FROM utilisateurs WHERE id = ?)', [userId]);
    let employeId;
    if (employeRows.length === 0) {
      try {
        employeId = await ensureEmployeForMecanicien(userId);
      } catch (e) {
        console.error('Erreur création employé mécanicien manquant:', e);
        return res.status(500).json({ error: "Erreur lors de la création de l'employé pour ce mécanicien" });
      }
    } else {
      employeId = employeRows[0].id;
    }
    
    // Récupérer les véhicules assignés à ce mécanicien via les réparations
    const query = `
      SELECT DISTINCT v.*, 
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             c.telephone as client_telephone,
             c.email as client_email
      FROM vehicules v
      JOIN reparations r ON v.id = r.vehicule_id
      JOIN clients c ON v.client_id = c.id
      WHERE r.employe_id = ?
      ORDER BY v.id DESC
    `;
    const [rows] = await pool.execute(query, [employeId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération véhicules mécanicien:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les réparations assignées à un mécanicien
app.get('/api/mecanicien/reparations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est un mécanicien
    const [userRows] = await pool.execute('SELECT role FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || userRows[0].role !== 'mecanicien') {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non autorisé' });
    }
    
    // Récupérer/assurer l'ID de l'employé correspondant
    let [employeRows] = await pool.execute('SELECT id FROM employes WHERE email = (SELECT email FROM utilisateurs WHERE id = ?)', [userId]);
    let employeId;
    if (employeRows.length === 0) {
      try {
        employeId = await ensureEmployeForMecanicien(userId);
      } catch (e) {
        console.error('Erreur création employé mécanicien manquant:', e);
        return res.status(500).json({ error: "Erreur lors de la création de l'employé pour ce mécanicien" });
      }
    } else {
      employeId = employeRows[0].id;
    }
    
    const query = `
      SELECT r.*,
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             c.telephone as client_telephone,
             c.email as client_email,
             CONCAT(e.nom, ' ', e.prenom) as employe_nom,
             CONCAT(v.marque, ' ', v.modele, ' - ', v.immatriculation) as vehicule_info
      FROM reparations r
      JOIN vehicules v ON r.vehicule_id = v.id
      JOIN clients c ON v.client_id = c.id
      LEFT JOIN employes e ON r.employe_id = e.id
      WHERE r.employe_id = ?
      ORDER BY r.date_debut DESC
    `;
    const [rows] = await pool.execute(query, [employeId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération réparations mécanicien:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les rendez-vous assignés à un mécanicien
app.get('/api/mecanicien/rendez-vous', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est un mécanicien
    const [userRows] = await pool.execute('SELECT role FROM utilisateurs WHERE id = ?', [userId]);
    if (userRows.length === 0 || userRows[0].role !== 'mecanicien') {
      return res.status(403).json({ error: 'Accès refusé - utilisateur non autorisé' });
    }
    
    // Récupérer/assurer l'ID de l'employé correspondant
    let [employeRows] = await pool.execute('SELECT id FROM employes WHERE email = (SELECT email FROM utilisateurs WHERE id = ?)', [userId]);
    let employeId;
    if (employeRows.length === 0) {
      try {
        employeId = await ensureEmployeForMecanicien(userId);
      } catch (e) {
        console.error('Erreur création employé mécanicien manquant:', e);
        return res.status(500).json({ error: "Erreur lors de la création de l'employé pour ce mécanicien" });
      }
    } else {
      employeId = employeRows[0].id;
    }
    
    const query = `
      SELECT rv.*,
             CONCAT(c.nom, ' ', c.prenom) as client_nom,
             c.telephone as client_telephone,
             c.email as client_email,
             CONCAT(e.nom, ' ', e.prenom) as employe_nom,
             CONCAT(v.marque, ' ', v.modele, ' - ', v.immatriculation) as vehicule_info,
             s.nom as service_nom
      FROM rendez_vous rv
      JOIN clients c ON rv.client_id = c.id
      LEFT JOIN employes e ON rv.employe_id = e.id
      JOIN vehicules v ON rv.vehicule_id = v.id
      LEFT JOIN services s ON rv.service_id = s.id
      WHERE rv.employe_id = ?
      ORDER BY rv.date_rdv DESC
    `;
    const [rows] = await pool.execute(query, [employeId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération rendez-vous mécanicien:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

async function startServer() {
  await initializeDatabase();
  await ensureUsersTable();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);

