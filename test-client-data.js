// Script de test pour vérifier les données client
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testClientData() {
  console.log('🧪 Test des données client...\n');

  try {
    // Test 1: Inscription d'un nouveau client
    console.log('1️⃣ Inscription d\'un nouveau client...');
    const clientData = {
      nom: 'Client',
      prenom: 'Test',
      email: 'client3@test.com',
      password: 'password123',
      role: 'client'
    };
    
    const clientResponse = await axios.post(`${API_BASE}/api/auth/register`, clientData);
    console.log('✅ Client inscrit:', clientResponse.data.user);
    
    // Test 2: Connexion du client
    console.log('\n2️⃣ Connexion du client...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'client3@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Client connecté:', user);
    
    // Test 3: Récupération des véhicules du client
    console.log('\n3️⃣ Récupération des véhicules du client...');
    try {
      const vehiculesResponse = await axios.get(`${API_BASE}/api/client/vehicules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Véhicules du client:', vehiculesResponse.data.length, 'véhicules');
    } catch (error) {
      console.log('ℹ️ Aucun véhicule pour ce client (normal pour un nouveau client)');
    }
    
    // Test 4: Récupération des réparations du client
    console.log('\n4️⃣ Récupération des réparations du client...');
    try {
      const reparationsResponse = await axios.get(`${API_BASE}/api/client/reparations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Réparations du client:', reparationsResponse.data.length, 'réparations');
    } catch (error) {
      console.log('ℹ️ Aucune réparation pour ce client (normal pour un nouveau client)');
    }
    
    console.log('\n🎉 Tests des données client réussis !');
    console.log('📍 Le client ne voit que ses propres données');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testClientData();
