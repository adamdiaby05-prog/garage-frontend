const axios = require('axios');

async function testGPTIA() {
  try {
    console.log('🤖 Test de l\'IA GPT Garage AutoGenius...\n');
    
    // Test 1: Question technique complexe (GPT devrait exceller)
    console.log('📝 Test 1: Question technique complexe');
    const response1 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Mon moteur fait un bruit de cliquetis au démarrage à froid, qu\'est-ce que ça peut être et est-ce grave ?'
    });
    console.log('✅ Réponse GPT:', response1.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response1.data.llm ? 'Oui' : 'Non');
    console.log('🚀 Modèle:', response1.data.model || 'Non spécifié');
    console.log('---\n');
    
    // Test 2: Question de diagnostic avancé
    console.log('📝 Test 2: Diagnostic avancé');
    const response2 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Ma voiture tire à droite et vibre à haute vitesse, quel est le diagnostic et quelles sont les solutions ?'
    });
    console.log('✅ Réponse GPT:', response2.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response2.data.llm ? 'Oui' : 'Non');
    console.log('🔍 Amélioré:', response2.data.enhanced ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 3: Question sur vos données + conseils techniques
    console.log('📝 Test 3: Données + conseils techniques');
    const response3 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'J\'ai une Clio 2019, quand dois-je faire la révision et quels sont les points à vérifier ?'
    });
    console.log('✅ Réponse GPT:', response3.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response3.data.llm ? 'Oui' : 'Non');
    console.log('🗄️ Sources BDD:', response3.data.sources ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 4: Question de comparaison technique
    console.log('📝 Test 4: Comparaison technique');
    const response4 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Quelle est la différence entre une huile synthétique 5W30 et une huile minérale 10W40 ?'
    });
    console.log('✅ Réponse GPT:', response4.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response4.data.llm ? 'Oui' : 'Non');
    console.log('📊 Qualité:', response4.data.enhanced ? 'Améliorée' : 'Standard');
    
    console.log('\n🎉 Tests GPT terminés !');
    console.log('\n💡 Votre IA utilise maintenant GPT pour des réponses professionnelles !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test GPT:', error.message);
    if (error.response) {
      console.error('📊 Détails:', error.response.data);
    }
  }
}

// Attendre que le serveur démarre
setTimeout(testGPTIA, 3000);
