import axios from 'axios';

// Détermination dynamique de l'URL de base de l'API
const resolveApiBaseUrl = () => {
  // Priorité: variable d'env → valeur persistée → port 5000
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('API_BASE_URL') : null;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();
  if (storedUrl && storedUrl.trim().length > 0) return storedUrl.trim();
  
  // Utiliser le port 5000 où le serveur tourne actuellement
  // Ne JAMAIS utiliser le proxy CRA qui cause les erreurs 500
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
    console.error('Erreur API:', error);
    
    // Améliorer les messages d'erreur
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Impossible de se connecter au serveur backend. Vérifiez que le serveur est démarré sur le port 5000.');
    } else if (error.message && error.message.includes('Network Error')) {
      console.error('🌐 Erreur réseau détectée.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Délai d\'attente dépassé. Le serveur met trop de temps à répondre.');
    } else if (error.response?.status === 500) {
      console.error('💥 Erreur serveur interne. Vérifiez les logs du serveur.');
    }

    // Pas de retry automatique - on force l'utilisation du port 5000
    console.warn('⚠️ Erreur API - Vérifiez que le serveur backend tourne sur le port 5000');

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
  getClientVehicules: () => api.get('/client/vehicules'),
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
  create: (factureData) => api.post('/factures', factureData),
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

// Services pour les services
export const servicesAPI = {
  getAll: () => api.get('/services'),
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

// Services pour le tableau de bord
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
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


