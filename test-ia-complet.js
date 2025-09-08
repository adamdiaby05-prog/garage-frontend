const axios = require('axios');

async function testIAComplet() {
  try {
    console.log('🤖 Test complet de l\'IA avec base de données...\n');
    
    // Test 1: Vérification du serveur
    console.log('📡 Test 1: Vérification du serveur...');
    try {
      const response = await axios.get('http://localhost:5000/api');
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible, démarrage...');
      // Le serveur n'est pas démarré, on va le tester plus tard
    }
    
    // Test 2: Test de l'IA avec question simple
    console.log('\n📝 Test 2: Question simple à l\'IA...');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: 'Combien j\'ai de mécaniciens ?'
      }, {
        timeout: 10000
      });
      
      console.log('✅ Réponse reçue:');
      console.log('📄 Contenu:', response.data.reply.substring(0, 200) + '...');
      console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
      console.log('📊 Sources:', Object.keys(response.data.sources || {}));
      
    } catch (error) {
      console.log('❌ Erreur IA:', error.message);
      if (error.response) {
        console.log('📊 Détails:', error.response.data);
      }
    }
    
    // Test 3: Test avec question sur les clients
    console.log('\n📝 Test 3: Question sur les clients...');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: 'Combien j\'ai de clients ?'
      }, {
        timeout: 10000
      });
      
      console.log('✅ Réponse reçue:');
      console.log('📄 Contenu:', response.data.reply.substring(0, 200) + '...');
      console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
      
    } catch (error) {
      console.log('❌ Erreur IA:', error.message);
    }
    
    // Test 4: Test avec question technique
    console.log('\n📝 Test 4: Question technique...');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: 'Mon moteur fait un bruit de cliquetis au démarrage à froid'
      }, {
        timeout: 10000
      });
      
      console.log('✅ Réponse reçue:');
      console.log('📄 Contenu:', response.data.reply.substring(0, 200) + '...');
      console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
      
    } catch (error) {
      console.log('❌ Erreur IA:', error.message);
    }
    
    console.log('\n🎉 Test complet terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Attendre un peu avant de tester
setTimeout(testIAComplet, 3000);
