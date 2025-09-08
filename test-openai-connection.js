const OpenAI = require('openai');
require('dotenv').config({ path: './config.env' });

async function testOpenAIConnection() {
  console.log('🔍 Test de connexion OpenAI...\n');
  
  try {
    // Vérifier la configuration
    console.log('📋 Configuration:');
    console.log('🔑 API Key:', process.env.OPENAI_API_KEY ? '✅ Configurée' : '❌ Manquante');
    console.log('🤖 Modèle:', process.env.OPENAI_MODEL || 'gpt-4o-mini');
    console.log('🌡️ Température:', process.env.OPENAI_TEMPERATURE || '0.2');
    console.log('📝 Max Tokens:', process.env.OPENAI_MAX_TOKENS || '800');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('\n❌ OPENAI_API_KEY manquante dans config.env');
      return;
    }
    
    // Initialiser le client
    console.log('\n🚀 Initialisation du client OpenAI...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
    });
    
    console.log('✅ Client OpenAI initialisé');
    
    // Test de connexion simple
    console.log('\n🧪 Test de connexion...');
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Dis-moi bonjour en français en une phrase.' }
      ],
      max_tokens: 50,
      temperature: 0.1
    });
    
    console.log('✅ Connexion réussie !');
    console.log('📄 Réponse:', response.choices[0]?.message?.content);
    console.log('📊 Usage:', response.usage);
    
  } catch (error) {
    console.log('\n❌ Erreur de connexion:');
    console.log('📝 Message:', error.message);
    console.log('🔍 Code:', error.code);
    console.log('📊 Status:', error.status);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Solution: Vérifiez que votre clé API OpenAI est valide');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Solution: Vous avez dépassé la limite de requêtes');
    } else if (error.message.includes('500')) {
      console.log('\n💡 Solution: Erreur serveur OpenAI, réessayez plus tard');
    }
  }
}

testOpenAIConnection(); 