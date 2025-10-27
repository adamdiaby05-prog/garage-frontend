// Services API pour les véhicules de la boutique
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Service pour les véhicules
export const vehiculesAPI = {
  // Récupérer tous les véhicules disponibles
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boutique/vehicules`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      throw error;
    }
  },

  // Récupérer un véhicule par ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boutique/vehicules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du véhicule:', error);
      throw error;
    }
  },

  // Créer un nouveau véhicule
  create: async (vehiculeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/boutique/vehicules`, vehiculeData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du véhicule:', error);
      throw error;
    }
  },

  // Mettre à jour un véhicule
  update: async (id, vehiculeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/boutique/vehicules/${id}`, vehiculeData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du véhicule:', error);
      throw error;
    }
  },

  // Supprimer un véhicule
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/boutique/vehicules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du véhicule:', error);
      throw error;
    }
  },

  // Créer une commande de véhicule
  createCommande: async (commandeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/boutique/vehicules/commande`, commandeData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  },

  // Récupérer les commandes d'un client
  getCommandesByClient: async (clientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boutique/vehicules/commandes/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }
};

// Service pour les couleurs
export const couleursAPI = {
  // Couleurs prédéfinies disponibles
  getCouleursDisponibles: () => {
    return [
      { nom: 'Blanc', code: '#FFFFFF', prix: 0 },
      { nom: 'Noir', code: '#000000', prix: 500000 },
      { nom: 'Gris', code: '#808080', prix: 300000 },
      { nom: 'Argent', code: '#C0C0C0', prix: 400000 },
      { nom: 'Rouge', code: '#FF0000', prix: 350000 },
      { nom: 'Bleu', code: '#0000FF', prix: 400000 },
      { nom: 'Vert', code: '#008000', prix: 300000 },
      { nom: 'Jaune', code: '#FFFF00', prix: 250000 },
      { nom: 'Orange', code: '#FFA500', prix: 300000 },
      { nom: 'Violet', code: '#800080', prix: 450000 }
    ];
  },

  // Calculer le prix supplémentaire pour une couleur
  getPrixSupplement: (couleurNom) => {
    const couleurs = couleursAPI.getCouleursDisponibles();
    const couleur = couleurs.find(c => c.nom === couleurNom);
    return couleur ? couleur.prix : 0;
  }
};

// Service pour les filtres
export const filtresAPI = {
  // Marques populaires
  getMarquesPopulaires: () => {
    return [
      'Toyota', 'BMW', 'Mercedes', 'Audi', 'Peugeot', 'Renault', 
      'Volkswagen', 'Ford', 'Nissan', 'Honda', 'Hyundai', 'Kia',
      'Mazda', 'Subaru', 'Lexus', 'Infiniti', 'Volvo', 'Jaguar'
    ];
  },

  // Types de carburant
  getTypesCarburant: () => {
    return [
      { value: 'Essence', label: 'Essence' },
      { value: 'Diesel', label: 'Diesel' },
      { value: 'Hybride', label: 'Hybride' },
      { value: 'Électrique', label: 'Électrique' },
      { value: 'GPL', label: 'GPL' }
    ];
  },

  // Types de transmission
  getTypesTransmission: () => {
    return [
      { value: 'Manuelle', label: 'Manuelle' },
      { value: 'Automatique', label: 'Automatique' },
      { value: 'Semi-automatique', label: 'Semi-automatique' }
    ];
  }
};

// Service pour les calculs de prix
export const prixAPI = {
  // Calculer le prix total d'un véhicule
  calculerPrixTotal: (vehicule, couleur, typeAchat, dureeLocation = 1) => {
    const prixBase = typeAchat === 'achat' ? vehicule.prix_vente : vehicule.prix_location_jour * dureeLocation;
    const supplementCouleur = couleursAPI.getPrixSupplement(couleur);
    return prixBase + supplementCouleur;
  },

  // Formater un prix en FCFA
  formaterPrix: (prix) => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
  },

  // Calculer les mensualités pour un crédit
  calculerMensualites: (prixTotal, dureeMois = 36, tauxInteret = 0.05) => {
    const tauxMensuel = tauxInteret / 12;
    const mensualite = (prixTotal * tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) / 
                      (Math.pow(1 + tauxMensuel, dureeMois) - 1);
    return Math.round(mensualite);
  }
};

// Service pour les caractéristiques des véhicules
export const caracteristiquesAPI = {
  // Caractéristiques communes
  getCaracteristiquesCommunes: () => {
    return [
      'Climatisation',
      'GPS',
      'Bluetooth',
      'Caméra de recul',
      'Airbags',
      'ABS',
      'ESP',
      'Direction assistée',
      'Vitres électriques',
      'Rétroviseurs électriques',
      'Sièges chauffants',
      'Toit ouvrant',
      'Système audio premium',
      'Connectivité USB',
      'Éclairage LED',
      'Freinage automatique',
      'Assistance au stationnement',
      'Détection d\'angle mort',
      'Régulateur de vitesse',
      'Limiteur de vitesse'
    ];
  },

  // Caractéristiques par catégorie
  getCaracteristiquesParCategorie: () => {
    return {
      'Sécurité': [
        'Airbags',
        'ABS',
        'ESP',
        'Freinage automatique',
        'Détection d\'angle mort',
        'Assistance au stationnement'
      ],
      'Confort': [
        'Climatisation',
        'Sièges chauffants',
        'Toit ouvrant',
        'Vitres électriques',
        'Rétroviseurs électriques',
        'Direction assistée'
      ],
      'Technologie': [
        'GPS',
        'Bluetooth',
        'Connectivité USB',
        'Écran tactile',
        'Système audio premium',
        'Éclairage LED'
      ],
      'Conduite': [
        'Régulateur de vitesse',
        'Limiteur de vitesse',
        'Assistance à la conduite',
        'Caméra de recul',
        '4x4',
        'Transmission automatique'
      ]
    };
  }
};

export default {
  vehiculesAPI,
  couleursAPI,
  filtresAPI,
  prixAPI,
  caracteristiquesAPI
};


