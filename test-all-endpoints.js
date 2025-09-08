const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testEndpoint(name, url) {
  try {
    console.log(`🔍 Test de ${name}...`);
    const response = await axios.get(url);
    console.log(`✅ ${name}: OK (${response.data.length || 0} éléments)`);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      console.log(`❌ ${name}: Erreur 500 - Table manquante`);
    } else {
      console.log(`❌ ${name}: Erreur ${error.response?.status || 'connexion'}`);
    }
    return false;
  }
}

async function testAllEndpoints() {
  console.log('🧪 Test de tous les endpoints de l\'API...\n');
  
  const endpoints = [
    { name: 'Dashboard Stats', url: `${API_BASE}/dashboard/stats` },
    { name: 'Employés', url: `${API_BASE}/employes` },
    { name: 'Clients', url: `${API_BASE}/clients` },
    { name: 'Véhicules', url: `${API_BASE}/vehicules` },
    { name: 'Réparations', url: `${API_BASE}/reparations` },
    { name: 'Factures', url: `${API_BASE}/factures` },
    { name: 'Pièces', url: `${API_BASE}/pieces` },
    { name: 'Services', url: `${API_BASE}/services` },
    { name: 'Rendez-vous', url: `${API_BASE}/rendez-vous` }
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.name, endpoint.url);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Pause entre les tests
  }
  
  console.log(`\n📊 Résumé: ${successCount}/${endpoints.length} endpoints fonctionnent`);
  
  if (successCount === 0) {
    console.log('\n💡 SOLUTION:');
    console.log('1. Double-cliquez sur recreate-database-simple.bat');
    console.log('2. Suivez les instructions pour recréer la base de données');
    console.log('3. Relancez l\'application avec start-xampp.bat');
  } else if (successCount < endpoints.length) {
    console.log('\n⚠️ Certaines tables sont manquantes');
    console.log('💡 Importez le fichier garage_db.sql dans phpMyAdmin');
  } else {
    console.log('\n🎉 Tous les endpoints fonctionnent !');
  }
}

// Test de connexion au serveur
async function testServerConnection() {
  try {
    console.log('🔌 Test de connexion au serveur...');
    await axios.get(`${API_BASE}/test`);
    console.log('✅ Serveur connecté et opérationnel\n');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible');
    console.log('💡 Démarrez le serveur avec: npm run server\n');
    return false;
  }
}

async function main() {
  const serverOk = await testServerConnection();
  if (serverOk) {
    await testAllEndpoints();
  }
}

main().catch(console.error); 