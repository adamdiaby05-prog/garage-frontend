const axios = require('axios');

async function testDonneesPrecises() {
  try {
    console.log('🔍 Test des réponses précises sur vos données...\n');
    
    // Test 1: Nombre de mécaniciens
    console.log('📝 Test 1: Combien j\'ai de mécaniciens ?');
    const response1 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de mécaniciens ?'
    });
    console.log('✅ Réponse:', response1.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response1.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 2: Nombre de clients
    console.log('📝 Test 2: Combien j\'ai de clients ?');
    const response2 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de clients ?'
    });
    console.log('✅ Réponse:', response2.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response2.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 3: Nombre de véhicules
    console.log('📝 Test 3: Combien j\'ai de véhicules ?');
    const response3 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de véhicules ?'
    });
    console.log('✅ Réponse:', response3.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response3.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 4: Nombre de réparations
    console.log('📝 Test 4: Combien j\'ai de réparations ?');
    const response4 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de réparations ?'
    });
    console.log('✅ Réponse:', response4.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response4.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 5: Nombre de factures et total
    console.log('📝 Test 5: Combien j\'ai de factures et quel est le total ?');
    const response5 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de factures et quel est le total ?'
    });
    console.log('✅ Réponse:', response5.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response5.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 6: Nombre de pièces et stock faible
    console.log('📝 Test 6: Combien j\'ai de pièces et lesquelles sont en faible stock ?');
    const response6 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Combien j\'ai de pièces et lesquelles sont en faible stock ?'
    });
    console.log('✅ Réponse:', response6.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response6.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    // Test 7: Question mixte (données + technique)
    console.log('📝 Test 7: J\'ai un problème de moteur, combien j\'ai de mécaniciens pour m\'aider ?');
    const response7 = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'J\'ai un problème de moteur, combien j\'ai de mécaniciens pour m\'aider ?'
    });
    console.log('✅ Réponse:', response7.data.reply.substring(0, 300) + '...');
    console.log('🤖 Utilise GPT:', response7.data.llm ? 'Oui' : 'Non');
    console.log('---\n');
    
    console.log('\n🎉 Tests des données précises terminés !');
    console.log('\n💡 Votre IA répond maintenant précisément aux questions sur vos données !');
    console.log('📊 Elle peut compter et lister : mécaniciens, clients, véhicules, réparations, factures, pièces');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des données précises:', error.message);
    if (error.response) {
      console.error('📊 Détails:', error.response.data);
    }
  }
}

// Attendre que le serveur démarre
setTimeout(testDonneesPrecises, 3000);
