// Configuration de l'IA Garage AutoGenius
module.exports = {
  // Configuration des recherches web
  webSearch: {
    // API principale
    primaryAPI: 'duckduckgo',
    primaryURL: 'https://api.duckduckgo.com/',
    
    // Requêtes alternatives pour améliorer les résultats
    alternativeQueries: {
      'voiture': ['automobile', 'véhicule', 'auto'],
      'moteur': ['moteur automobile', 'moteur voiture', 'propulsion'],
      'frein': ['système de freinage', 'freinage automobile', 'plaquettes'],
      'pneu': ['pneus automobile', 'gommes voiture', 'roues'],
      'huile': ['lubrifiant moteur', 'huile moteur', 'vidange'],
      'batterie': ['accumulateur', 'batterie voiture', 'démarrage'],
      'climatisation': ['clim voiture', 'refroidissement', 'ventilation'],
      'électricité': ['circuit électrique', 'électronique automobile', 'câblage']
    },
    
    // Mots-clés qui déclenchent une recherche web
    webSearchTriggers: [
      'comment', 'pourquoi', 'quand', 'où', 'combien',
      'définition', 'signification', 'histoire', 'origine',
      'différence', 'comparaison', 'tutoriel', 'guide',
      'conseil', 'astuce', 'technique', 'procédure', 'méthode'
    ],
    
    // Mots-clés techniques automobiles
    technicalKeywords: [
      'moteur', 'frein', 'pneu', 'huile', 'filtre',
      'batterie', 'climatisation', 'électricité', 'diagnostic',
      'panne', 'dépannage', 'entretien', 'maintenance',
      'réparation', 'révision', 'vidange', 'remplacement'
    ],
    
    // Timeout pour les requêtes web (en ms)
    timeout: 10000,
    
    // Nombre maximum de tentatives
    maxRetries: 3,
    
    // Cache des résultats (en ms)
    cacheDuration: 300000 // 5 minutes
  },
  
  // Configuration des réponses intelligentes
  responses: {
    // Conseils personnalisés selon le type de question
    advice: {
      'comment': '💡 **Conseil:** Cette information provient du web et peut être complétée par nos mécaniciens experts. N\'hésitez pas à demander des détails spécifiques sur votre véhicule.',
      'prix': '💰 **Note sur les prix:** Ces informations sont indicatives et peuvent varier selon votre véhicule et votre région. Contactez-nous pour un devis personnalisé.',
      'panne': '⚠️ **Important:** Ces informations sont générales. Pour un diagnostic précis, consultez nos mécaniciens qui connaissent votre véhicule.',
      'entretien': '🔧 **Conseil d\'entretien:** Suivez les recommandations du constructeur et consultez nos experts pour un planning personnalisé.',
      'sécurité': '🛡️ **Sécurité:** Ces conseils sont généraux. Pour votre sécurité, faites vérifier votre véhicule régulièrement par nos professionnels.'
    },
    
    // Messages de synthèse
    synthesis: {
      'webAndDB': '💡 **Résumé intelligent:** J\'ai combiné les informations de votre base de données avec des recherches web pour vous donner une réponse complète.',
      'webOnly': '🌐 **Information web:** J\'ai trouvé ces informations sur le web pour vous aider.',
      'dbOnly': '🗄️ **Données de votre garage:** Voici les informations spécifiques à votre établissement.',
      'noResults': '❌ **Aucun résultat:** Je n\'ai pas trouvé d\'informations pertinentes. Essayez de reformuler votre question.'
    }
  },
  
  // Configuration des rapports
  reports: {
    // Formats supportés
    formats: ['csv', 'json'],
    
    // Tables à inclure dans les rapports
    tables: [
      'clients', 'employes', 'vehicules', 'reparations',
      'rendez_vous', 'factures', 'pieces', 'services'
    ],
    
    // Calculs spéciaux pour les rapports
    calculations: {
      'chiffre_affaires': 'SUM(montant) FROM factures',
      'reparations_en_cours': "COUNT(*) FROM reparations WHERE statut LIKE '%cours%'",
      'reparations_terminees': "COUNT(*) FROM reparations WHERE statut LIKE '%termin%'",
      'stock_faible': 'COUNT(*) FROM pieces WHERE COALESCE(stock,0) <= 2'
    }
  },
  
  // Configuration de performance
  performance: {
    // Limite de résultats par table
    maxResultsPerTable: 50,
    
    // Limite de caractères par réponse
    maxResponseLength: 2000,
    
    // Délai entre requêtes web (en ms)
    webRequestDelay: 100,
    
    // Activation du cache
    enableCache: true
  }
};
