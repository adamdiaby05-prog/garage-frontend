const axios = require('axios');

async function testPrecision() {
  console.log('🎯 Test de précision de l\'IA...\n');
  
  const questions = [
    'Combien j\'ai de mécaniciens exactement ?',
    'Combien j\'ai de clients ?',
    'Combien j\'ai de véhicules ?',
    'Combien j\'ai de réparations ?',
    'Quel est le total de mes factures ?'
  ];
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`📝 Question ${i + 1}: ${question}`);
    
    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: question
      }, {
        timeout: 15000
      });
      
      console.log('✅ Réponse:');
      console.log('📄 Contenu:', response.data.reply);
      console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
      console.log('---');
      
      // Attendre entre chaque question
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log('❌ Erreur:', error.message);
      console.log('---');
    }
  }
  
  console.log('🎉 Test de précision terminé !');
}

testPrecision(); 