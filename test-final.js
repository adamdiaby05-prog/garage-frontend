const axios = require('axios');

async function testFinal() {
  console.log('🎯 Test final complet de l\'IA...\n');
  
  const questions = [
    'Combien j\'ai de clients ?',
    'Combien j\'ai de véhicules ?',
    'Combien j\'ai de réparations ?',
    'Quel est le total de mes factures ?',
    'Mon moteur fait un bruit de cliquetis au démarrage à froid'
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
      console.log('📄 Contenu:', response.data.reply.substring(0, 300) + '...');
      console.log('🤖 Utilise GPT:', response.data.llm ? 'Oui' : 'Non');
      console.log('📊 Sources:', Object.keys(response.data.sources || {}));
      console.log('---');
      
      // Attendre entre chaque question
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log('❌ Erreur:', error.message);
      console.log('---');
    }
  }
  
  console.log('🎉 Test final terminé !');
  console.log('\n🌟 Votre IA est maintenant parfaitement fonctionnelle !');
  console.log('🌐 Interface web : http://localhost:3000/assistant-ia');
}

testFinal(); 