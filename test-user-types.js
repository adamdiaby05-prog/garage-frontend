// Script de test pour vérifier les types d'utilisateurs
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testUserTypes() {
  console.log('🧪 Test des types d\'utilisateurs...\n');

  try {
    // Test 1: Inscription d'un client
    console.log('1️⃣ Test inscription CLIENT...');
    const clientData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'client@test.com',
      password: 'password123',
      type_compte: 'client'
    };
    
    const clientResponse = await axios.post(`${API_BASE}/api/auth/register`, clientData);
    console.log('✅ Client inscrit:', clientResponse.data.user);
    
    // Test 2: Inscription d'un mécanicien
    console.log('\n2️⃣ Test inscription MÉCANICIEN...');
    const mecanicienData = {
      nom: 'Martin',
      prenom: 'Pierre',
      email: 'mecanicien@test.com',
      password: 'password123',
      type_compte: 'mecanicien'
    };
    
    const mecanicienResponse = await axios.post(`${API_BASE}/api/auth/register`, mecanicienData);
    console.log('✅ Mécanicien inscrit:', mecanicienResponse.data.user);
    
    // Test 3: Inscription d'un admin
    console.log('\n3️⃣ Test inscription ADMIN...');
    const adminData = {
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@test.com',
      password: 'password123',
      type_compte: 'admin'
    };
    
    const adminResponse = await axios.post(`${API_BASE}/api/auth/register`, adminData);
    console.log('✅ Admin inscrit:', adminResponse.data.user);
    
    // Test 4: Connexion client
    console.log('\n4️⃣ Test connexion CLIENT...');
    const clientLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'client@test.com',
      password: 'password123'
    });
    console.log('✅ Client connecté:', clientLogin.data.user);
    
    // Test 5: Connexion mécanicien
    console.log('\n5️⃣ Test connexion MÉCANICIEN...');
    const mecanicienLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'mecanicien@test.com',
      password: 'password123'
    });
    console.log('✅ Mécanicien connecté:', mecanicienLogin.data.user);
    
    // Test 6: Connexion admin
    console.log('\n6️⃣ Test connexion ADMIN...');
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    console.log('✅ Admin connecté:', adminLogin.data.user);
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testUserTypes();
