const axios = require('axios');

async function testIADirect() {
  console.log('🎯 Test direct de l\'IA avec données forcées...\n');
  
  try {
    // Test avec question très spécifique
    console.log('📝 Question: Combien j\'ai de mécaniciens exactement ?');
    
    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de mécaniciens exactement ? Donne-moi le nombre exact et la liste complète.'
    }, {
      timeout: 20000
    });
    
    console.log('✅ Réponse reçue !');
    console.log('📄 Contenu:', response.data.reply);
    console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
    console.log('📊 Sources disponibles:', Object.keys(response.data.sources || {}));
    
    // Afficher les données des employés si disponibles
    if (response.data.sources && response.data.sources.employes) {
      console.log('\n👥 Données des employés dans la base:');
      console.log(JSON.stringify(response.data.sources.employes, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    if (error.response) {
      console.log('📊 Détails:', error.response.data);
    }
  }
}

testIADirect(); 