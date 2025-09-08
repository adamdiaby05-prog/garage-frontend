const axios = require('axios');

async function testAI() {
  try {
    console.log('🧪 Test de l\'IA avec recherche web...\n');
    
    // Test 1: Question technique qui devrait déclencher une recherche web
    console.log('📝 Test 1: Question technique sur les freins');
    const response1 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Comment changer les plaquettes de frein ?'
    });
    console.log('✅ Réponse:', response1.data.reply.substring(0, 200) + '...');
    console.log('🌐 Sources web:', response1.data.sources ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 2: Question sur les prix
    console.log('📝 Test 2: Question sur les prix');
    const response2 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien coûte une révision complète ?'
    });
    console.log('✅ Réponse:', response2.data.reply.substring(0, 200) + '...');
    console.log('🌐 Sources web:', response2.data.sources ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 3: Question sur la base de données
    console.log('📝 Test 3: Question sur la base de données');
    const response3 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Liste des mécaniciens'
    });
    console.log('✅ Réponse:', response3.data.reply.substring(0, 200) + '...');
    console.log('🗄️ Sources BDD:', response3.data.sources ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 4: Question mixte
    console.log('📝 Test 4: Question mixte');
    const response4 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Quels sont les symptômes d\'une panne de batterie et avez-vous des mécaniciens disponibles ?'
    });
    console.log('✅ Réponse:', response4.data.reply.substring(0, 200) + '...');
    console.log('🌐 Sources web:', response4.data.sources ? 'Oui' : 'Non');
    console.log('🗄️ Sources BDD:', response4.data.sources ? 'Oui' : 'Non');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📊 Détails:', error.response.data);
    }
  }
}

// Attendre que le serveur démarre
setTimeout(testAI, 3000);
