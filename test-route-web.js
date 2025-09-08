const axios = require('axios');

async function testRouteWeb() {
  console.log('🔍 Test de la route web-search...\n');
  
  try {
    // Test simple de la route
    console.log('📝 Test: Question simple');
    
    const response = await axios.post('http://localhost:5000/api/ai/web-search', {
      message: 'Bonjour'
    }, {
      timeout: 10000
    });
    
    console.log('✅ Route accessible !');
    console.log('📄 Réponse:', response.data.reply);
    console.log('🤖 Mode:', response.data.webSearch ? 'Web' : 'Local');
    
  } catch (error) {
    console.log('❌ Erreur route web-search:');
    console.log('📝 Message:', error.message);
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Détails:', error.response.data);
    }
  }
}

testRouteWeb(); 