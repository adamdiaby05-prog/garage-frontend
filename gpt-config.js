// Configuration avancée pour GPT dans le garage AutoSoft
module.exports = {
  // Configuration des modèles GPT
  models: {
    primary: 'gpt-4o-mini',      // Modèle principal (rapide et efficace)
    fallback: 'gpt-3.5-turbo',   // Modèle de secours si le principal échoue
    advanced: 'gpt-4o'           // Modèle avancé pour questions complexes
  },
  
  // Configuration des prompts système
  systemPrompts: {
    // Prompt principal pour toutes les questions
    main: `Tu es l'assistant IA expert du garage AutoSoft, spécialisé en automobile et mécanique.

RÈGLES IMPORTANTES :
1. Réponds TOUJOURS en français
2. Sois précis, technique et professionnel
3. Utilise le contexte de la base de données quand c'est pertinent
4. Donne des conseils pratiques et sécurisés
5. Mentionne toujours qu'il faut consulter un mécanicien professionnel pour les réparations
6. Sois concis mais complet
7. Utilise des emojis appropriés pour améliorer la lisibilité`,

    // Prompt pour questions techniques
    technical: `Tu es l'assistant IA expert du garage AutoSoft, spécialisé en automobile et mécanique.

INSTRUCTIONS TECHNIQUES SPÉCIALES :
1. Donne des explications claires et étape par étape
2. Mentionne les outils nécessaires
3. Explique les risques et précautions de sécurité
4. Donne des conseils de diagnostic
5. Insiste sur la nécessité d'un professionnel pour les réparations
6. Sois précis sur les procédures
7. Mentionne les normes de sécurité`,

    // Prompt pour questions de diagnostic
    diagnostic: `Tu es l'assistant IA expert du garage AutoSoft, spécialisé en diagnostic automobile.

INSTRUCTIONS DE DIAGNOSTIC :
1. Liste les symptômes possibles
2. Explique les causes probables
3. Donne des étapes de vérification simples
4. Mentionne les risques de sécurité
5. Conseille quand consulter un professionnel
6. Sois rassurant mais réaliste
7. Donne des conseils de prévention`,

    // Prompt pour questions de prix
    pricing: `Tu es l'assistant IA expert du garage AutoSoft, spécialisé en estimation de coûts.

INSTRUCTIONS POUR LES PRIX :
1. Donne des fourchettes de prix indicatives
2. Explique les facteurs qui influencent le prix
3. Mentionne que les prix varient selon la région et le véhicule
4. Conseille de demander un devis personnalisé
5. Explique les options disponibles
6. Mentionne les garanties possibles
7. Sois transparent sur les estimations`
  },
  
  // Configuration des paramètres GPT
  parameters: {
    temperature: {
      technical: 0.1,      // Très précis pour les questions techniques
      diagnostic: 0.2,     // Précision pour le diagnostic
      general: 0.3,        // Équilibré pour les questions générales
      creative: 0.5        // Plus créatif pour les conseils
    },
    
    maxTokens: {
      short: 400,          // Réponses courtes
      medium: 600,         // Réponses moyennes
      long: 800,           // Réponses longues
      detailed: 1000       // Réponses très détaillées
    },
    
    topP: 0.9,            // Contrôle de la diversité des réponses
    frequencyPenalty: 0.1, // Évite la répétition
    presencePenalty: 0.1   // Encourage la nouveauté
  },
  
  // Configuration des réponses intelligentes
  responseEnhancement: {
    // Ajout automatique d'informations selon le type de question
    autoEnhance: {
      'diagnostic': '🔍 **Diagnostic rapide** : Voici les points à vérifier...',
      'reparation': '🔧 **Conseil réparation** : Important de consulter un professionnel...',
      'entretien': '📅 **Planning d\'entretien** : Voici les recommandations...',
      'securite': '🛡️ **Sécurité** : Ces vérifications sont essentielles...',
      'prix': '💰 **Estimation** : Ces prix sont indicatifs...'
    },
    
    // Conseils automatiques selon le contexte
    autoAdvice: {
      'moteur': '⚠️ **Attention moteur** : Les problèmes moteur nécessitent un diagnostic professionnel.',
      'frein': '🛑 **Sécurité freinage** : Ne roulez jamais avec des freins défaillants.',
      'batterie': '⚡ **Batterie** : Une batterie faible peut causer des pannes inattendues.',
      'pneu': '🛞 **Pneus** : Des pneus usés compromettent votre sécurité.',
      'huile': '🛢️ **Huile moteur** : Une huile de qualité protège votre moteur.'
    }
  },
  
  // Configuration des fallbacks
  fallbacks: {
    // Si GPT échoue, utiliser ces alternatives
    strategies: [
      'recherche_web',           // Recherche web avec DuckDuckGo
      'base_donnees',            // Données de votre garage
      'reponses_predefinies',    // Réponses stockées
      'mode_hybride'             // Combinaison des sources
    ],
    
    // Messages d'erreur personnalisés
    errorMessages: {
      'api_unavailable': '🤖 **IA GPT temporairement indisponible** - Utilisation du mode hybride intelligent',
      'rate_limit': '⏳ **Limite de requêtes atteinte** - Retour au mode standard',
      'timeout': '⏰ **Délai d'attente dépassé** - Utilisation du mode rapide',
      'fallback': '🔄 **Mode de secours activé** - Réponse optimisée disponible'
    }
  },
  
  // Configuration de la personnalisation
  personalization: {
    // Adaptation selon le rôle de l'utilisateur
    roleBased: {
      'admin': '👨‍💼 **Mode Administrateur** : Accès complet aux données et rapports',
      'mecanicien': '🔧 **Mode Mécanicien** : Focus sur la technique et les procédures',
      'client': '👤 **Mode Client** : Conseils d'entretien et informations générales'
    },
    
    // Adaptation selon l'expérience
    experienceLevel: {
      'debutant': '📚 **Niveau Débutant** : Explications simples et conseils de base',
      'intermediaire': '📖 **Niveau Intermédiaire** : Détails techniques et procédures',
      'expert': '🎯 **Niveau Expert** : Informations avancées et optimisations'
    }
  }
};
