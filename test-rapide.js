const axios = require('axios');

async function testRapide() {
  console.log('🚀 Test rapide de l\'IA...\n');
  
  try {
    // Test simple
    console.log('📝 Question: Combien j\'ai de mécaniciens ?');
    
    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de mecaniciens ?'
    }, {
      timeout: 15000
    });
    
    console.log('✅ Réponse reçue !');
    console.log('📄 Contenu:', response.data.reply);
    console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
    console.log('📊 Sources:', Object.keys(response.data.sources || {}));
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    if (error.response) {
      console.log('📊 Détails:', error.response.data);
    }
  }
}

// Attendre 3 secondes
setTimeout(testRapide, 3000);
