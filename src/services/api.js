import axios from 'axios';

// Détermination dynamique de l'URL de base de l'API
const resolveApiBaseUrl = () => {
  // Priorité: variable d'env → valeur persistée → port 5000
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('API_BASE_URL') : null;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();
  if (storedUrl && storedUrl.trim().length > 0) return storedUrl.trim();
  
  // Utiliser l'URL de production ou localhost selon l'environnement
  if (process.env.NODE_ENV === 'production') {
    return 'https://garageci.geodaftar.com/api'; // URL complète en production
  }
  return 'http://localhost:5000/api';
};

let API_BASE_URL = resolveApiBaseUrl();

// Log pour debug - confirmer l'URL utilisée
console.log('🔗 API Base URL utilisée:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes de timeout pour GPT
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log sécurisé de l'erreur
    console.error('Erreur API:', {
      message: error.message || 'Erreur inconnue',
      status: error.response?.status,
      statusText: error.response?.statusText,
      code: error.code,
      url: error.config?.url
    });
    
    // Améliorer les messages d'erreur
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Impossible de se connecter au serveur backend. Vérifiez que le serveur est démarré sur le port 5000.');
    } else if (error.message && error.message.includes('Network Error')) {
      console.error('🌐 Erreur réseau détectée.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Délai d\'attente dépassé. Le serveur met trop de temps à répondre.');
    } else if (error.response?.status === 500) {
      console.error('💥 Erreur serveur interne. Vérifiez les logs du serveur.');
    } else if (error.response?.status === 404) {
      console.error('🔍 Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
    } else if (error.response?.status === 400) {
      console.error('📝 Requête invalide. Vérifiez les données envoyées.');
    }

    return Promise.reject(error);
  }
);

// Attacher automatiquement le token si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services pour les clients
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (clientData) => api.post('/clients', clientData),
  update: (id, clientData) => api.put(`/clients/${id}`, clientData),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Services pour les employés
export const employesAPI = {
  getAll: () => api.get('/employes'),
  getMecaniciens: () => api.get('/employes/mecaniciens'),
  getById: (id) => api.get(`/employes/${id}`),
  create: (employeData) => api.post('/employes', employeData),
  update: (id, employeData) => api.put(`/employes/${id}`, employeData),
  delete: (id) => api.delete(`/employes/${id}`),
};

// Utilisateurs (admin)
export const usersAPI = {
  getAll: () => api.get('/utilisateurs'),
  update: (id, data) => api.put(`/utilisateurs/${id}`, data),
};

// Services pour les véhicules
export const vehiculesAPI = {
  getAll: () => api.get('/vehicules'),
  getById: (id) => api.get(`/vehicules/${id}`),
  getByClient: (clientId) => api.get(`/vehicules?client_id=${clientId}`),
  getClientVehicules: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      console.error('Aucun utilisateur connecté');
      return Promise.reject(new Error('Utilisateur non connecté'));
    }
    return api.get(`/client/vehicules?user_id=${user.id}`).then((r) => r.data);
  },
  getMecanicienVehicules: () => api.get('/mecanicien/vehicules'),
  create: (vehiculeData) => api.post('/vehicules', vehiculeData),
  update: (id, vehiculeData) => api.put(`/vehicules/${id}`, vehiculeData),
  delete: (id) => api.delete(`/vehicules/${id}`),
};

// Services pour les réparations
export const reparationsAPI = {
  getAll: () => api.get('/reparations'),
  getById: (id) => api.get(`/reparations/${id}`),
  getByClient: (clientId) => api.get(`/reparations?client_id=${clientId}`),
  getByEmploye: (employeId) => api.get(`/reparations?employe_id=${employeId}`),
  getClientReparations: () => api.get('/client/reparations'),
  getMecanicienReparations: () => api.get('/mecanicien/reparations'),
  create: (reparationData) => api.post('/reparations', reparationData),
  update: (id, reparationData) => api.put(`/reparations/${id}`, reparationData),
  delete: (id) => api.delete(`/reparations/${id}`),
  updateStatus: (id, status) => api.patch(`/reparations/${id}/status`, { status }),
};

// Services pour les factures
export const facturesAPI = {
  getAll: () => api.get('/factures'),
  getById: (id) => api.get(`/factures/${id}`),
  getByClient: (clientId) => api.get(`/factures/client/${clientId}`),
  getClientFactures: () => api.get('/client/factures'),
  create: (factureData) => api.post('/factures', factureData).then((r) => r.data),
  update: (id, factureData) => api.put(`/factures/${id}`, factureData),
  delete: (id) => api.delete(`/factures/${id}`),
};

// Services pour les pièces
export const piecesAPI = {
  getAll: () => api.get('/pieces'),
  getById: (id) => api.get(`/pieces/${id}`),
  create: (pieceData) => api.post('/pieces', pieceData),
  update: (id, pieceData) => api.put(`/pieces/${id}`, pieceData),
  delete: (id) => api.delete(`/pieces/${id}`),
  updateStock: (id, quantity) => api.patch(`/pieces/${id}/stock`, { quantity }),
};

// Services pour les fournisseurs
export const fournisseursAPI = {
  getAll: () => api.get('/fournisseurs'),
  getById: (id) => api.get(`/fournisseurs/${id}`),
  create: (fournisseurData) => api.post('/fournisseurs', fournisseurData),
  update: (id, fournisseurData) => api.put(`/fournisseurs/${id}`, fournisseurData),
  delete: (id) => api.delete(`/fournisseurs/${id}`),
};

// Services pour la boutique
export const boutiqueAPI = {
  getArticles: () => api.get('/boutique/articles'),
  getCategories: () => api.get('/boutique/categories'),
  getArticleById: (id) => api.get(`/boutique/articles/${id}`),
  createArticle: (articleData) => api.post('/boutique/articles', articleData),
  updateArticle: (id, articleData) => api.put(`/boutique/articles/${id}`, articleData),
  deleteArticle: (id) => api.delete(`/boutique/articles/${id}`),
};

// Boutique Client simple produits
export const boutiqueClientAPI = {
  listProduits: () => api.get('/boutique/produits').then(r => r.data),
  createProduit: (produit) => api.post('/boutique/produits', produit).then(r => r.data),
  deleteProduit: (id) => api.delete(`/boutique/produits/${id}`).then(r => r.data),
  updateProduit: (id, produit) => api.put(`/boutique/produits/${id}`, produit).then(r => r.data),
};

// Services pour les services
export const servicesAPI = {
  getAll: () => api.get('/services').then((r) => r.data),
  getById: (id) => api.get(`/services/${id}`),
  create: (serviceData) => api.post('/services', serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
};

// Services pour les rendez-vous
export const rendezVousAPI = {
  getAll: () => api.get('/rendez-vous'),
  getById: (id) => api.get(`/rendez-vous/${id}`),
  getByClient: (clientId) => api.get(`/rendez-vous?client_id=${clientId}`),
  getByEmploye: (employeId) => api.get(`/rendez-vous?employe_id=${employeId}`),
  getClientRendezVous: () => api.get('/client/rendez-vous'),
  getMecanicienRendezVous: () => api.get('/mecanicien/rendez-vous'),
  create: (rdvData) => api.post('/rendez-vous', rdvData),
  update: (id, rdvData) => api.put(`/rendez-vous/${id}`, rdvData),
  delete: (id) => api.delete(`/rendez-vous/${id}`),
  assignMechanic: (id, employeId) => api.patch(`/rendez-vous/${id}/assign`, { employe_id: employeId }),
  toReparation: (id, payload) => api.post(`/rendez-vous/${id}/to-reparation`, payload),
};

// Services pour les garages
export const garagesAPI = {
  getAll: () => api.get('/garages').then((r) => r.data),
  getById: (id) => api.get(`/garages/${id}`),
  create: (garageData) => api.post('/garages', garageData),
  update: (id, garageData) => api.put(`/garages/${id}`, garageData),
  delete: (id) => api.delete(`/garages/${id}`),
  getDemandes: (id) => api.get(`/garages/${id}/demandes`).then((r) => r.data),
};

// Services pour les demandes de prestations
export const demandesPrestationsAPI = {
  getAll: () => api.get('/prestations/demandes').then((r) => r.data),
  getById: (id) => api.get(`/prestations/demandes/${id}`).then((r) => r.data),
  getByClient: (clientId) => api.get(`/prestations/demandes/client/${clientId}`).then((r) => r.data),
  getByGarage: (garageId) => api.get(`/garages/${garageId}/demandes`).then((r) => r.data),
  create: (demandeData) => api.post('/prestations/demandes', demandeData).then((r) => r.data),
  update: (id, demandeData) => api.put(`/prestations/demandes/${id}`, demandeData).then((r) => r.data),
  delete: (id) => api.delete(`/prestations/demandes/${id}`).then((r) => r.data),
  accept: (id, acceptData) => api.patch(`/prestations/demandes/${id}/accept`, acceptData).then((r) => r.data),
  updateStatut: (id, statutData) => api.patch(`/prestations/demandes/${id}/statut`, statutData).then((r) => r.data),
};

// Services pour le tableau de bord
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

// Factures pour garage
export const facturesGarageAPI = {
  getByGarage: (garageId) => api.get(`/factures?garage_id=${garageId}`).then(r => r.data),
};

// AI Chat (RAG)
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  webSearch: (message) => api.post('/ai/web-search', { message }),
};

// Service de test de connexion
export const testAPI = {
  testConnection: () => api.get('/test'),
};

// Auth API
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
};


