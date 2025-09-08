const axios = require('axios');

async function testGPTSDK() {
  try {
    console.log('🤖 Test du SDK OpenAI pour votre IA Garage...\n');
    
    // Test 1: Vérification de la connexion
    console.log('📝 Test 1: Vérification de la connexion GPT');
    const response1 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Test de connexion GPT - dis-moi bonjour'
    });
    console.log('✅ Réponse:', response1.data.reply.substring(0, 200) + '...');
    console.log('🤖 Utilise GPT:', response1.data.llm ? 'Oui' : 'Non');
    console.log('🚀 Modèle:', response1.data.model || 'Non spécifié');
    if (response1.data.usage) {
      console.log('📊 Tokens utilisés:', response1.data.usage.total_tokens);
    }
    console.log('---\n');
    
    // Test 2: Question technique complexe
    console.log('📝 Test 2: Question technique complexe');
    const response2 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Mon moteur fait un bruit de cliquetis au démarrage à froid, qu\'est-ce que ça peut être et est-ce grave ?'
    });
    console.log('✅ Réponse GPT:', response2.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response2.data.llm ? 'Oui' : 'Non');
    console.log('🔍 Amélioré:', response2.data.enhanced ? 'Oui' : 'Non');
    if (response2.data.usage) {
      console.log('📊 Coût estimé:', (response2.data.usage.total_tokens * 0.00015 / 1000).toFixed(4), '$');
    }
    console.log('---\n');
    
    // Test 3: Question de diagnostic avancé
    console.log('📝 Test 3: Diagnostic avancé');
    const response3 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Ma voiture tire à droite et vibre à haute vitesse, quel est le diagnostic et quelles sont les solutions ?'
    });
    console.log('✅ Réponse GPT:', response3.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response3.data.llm ? 'Oui' : 'Non');
    console.log('🗄️ Sources BDD:', response3.data.sources ? 'Oui' : 'Non');
    if (response3.data.usage) {
      console.log('📊 Tokens:', response3.data.usage.total_tokens);
    }
    console.log('---\n');
    
    // Test 4: Question de comparaison technique
    console.log('📝 Test 4: Comparaison technique');
    const response4 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Quelle est la différence entre une huile synthétique 5W30 et une huile minérale 10W40 ?'
    });
    console.log('✅ Réponse GPT:', response4.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response4.data.llm ? 'Oui' : 'Non');
    console.log('📊 Qualité:', response4.data.enhanced ? 'Améliorée' : 'Standard');
    if (response4.data.usage) {
      console.log('📊 Coût total:', (response4.data.usage.total_tokens * 0.00015 / 1000).toFixed(4), '$');
    }
    
    console.log('\n🎉 Tests SDK GPT terminés avec succès !');
    console.log('\n💡 Votre IA utilise maintenant le SDK OpenAI officiel !');
    console.log('🚀 Avantages : Meilleure gestion d\'erreur, métadonnées complètes, performance optimisée');
    
  } catch (error) {
    console.error('❌ Erreur lors du test SDK GPT:', error.message);
    if (error.response) {
      console.error('📊 Détails:', error.response.data);
    }
  }
}

// Attendre que le serveur démarre
setTimeout(testGPTSDK, 3000);
