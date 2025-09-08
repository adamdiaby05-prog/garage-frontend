// Script de test pour vérifier la connexion client
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testClientLogin() {
  console.log('🧪 Test de connexion CLIENT...\n');

  try {
    // Test de connexion client
    console.log('1️⃣ Connexion CLIENT...');
    const clientLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'client2@test.com',
      password: 'password123'
    });
    
    console.log('✅ Client connecté:');
    console.log('   - ID:', clientLogin.data.user.id);
    console.log('   - Email:', clientLogin.data.user.email);
    console.log('   - Rôle:', clientLogin.data.user.role);
    console.log('   - Type de compte:', clientLogin.data.user.type_compte);
    console.log('   - Token:', clientLogin.data.token ? 'Présent' : 'Absent');
    
    // Test de vérification du token
    console.log('\n2️⃣ Vérification du token...');
    const meResponse = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${clientLogin.data.token}`
      }
    });
    
    console.log('✅ Informations utilisateur récupérées:');
    console.log('   - Rôle:', meResponse.data.role);
    console.log('   - Type de compte:', meResponse.data.type_compte);
    
    console.log('\n🎉 Test de connexion client réussi !');
    console.log('📍 Redirection attendue: /dashboard/client');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testClientLogin();
