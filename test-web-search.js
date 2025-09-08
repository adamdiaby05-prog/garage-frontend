const axios = require('axios');

async function testWebSearch() {
  console.log('🌐 Test de la recherche web via GPT...\n');
  
  try {
    // Test 1: Recherche web technique
    console.log('📝 Question 1: Moteur qui tousse à froid, diagnostic ?');
    
    const response1 = await axios.post('http://localhost:5000/api/ai/web-search', {
      message: 'Mon moteur tousse à froid, quel est le diagnostic et les solutions ?'
    }, {
      timeout: 20000
    });
    
    console.log('✅ Réponse web reçue !');
    console.log('📄 Contenu:', response1.data.reply.substring(0, 300) + '...');
    console.log('🤖 Mode:', response1.data.webSearch ? 'Web' : 'Local');
    console.log('📊 Modèle:', response1.data.model);
    console.log('---');
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Recherche web sur les freins
    console.log('📝 Question 2: Diagnostic freins ABS qui clignotent ?');
    
    const response2 = await axios.post('http://localhost:5000/api/ai/web-search', {
      message: 'Mon voyant ABS clignote, que faire ?'
    }, {
      timeout: 20000
    });
    
    console.log('✅ Réponse web reçue !');
    console.log('📄 Contenu:', response2.data.reply.substring(0, 300) + '...');
    console.log('🤖 Mode:', response2.data.webSearch ? 'Web' : 'Local');
    console.log('📊 Modèle:', response2.data.model);
    console.log('---');
    
    console.log('🎉 Test de recherche web terminé !');
    console.log('🌟 Votre IA peut maintenant faire des recherches web via GPT !');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    if (error.response) {
      console.log('📊 Détails:', error.response.data);
    }
  }
}

// Attendre 5 secondes que le serveur démarre
setTimeout(testWebSearch, 5000); 