// Script pour corriger l'URL de l'API dans le navigateur
console.log('🔧 Correction de l\'URL de l\'API...');

// Vérifier si nous sommes dans un navigateur
if (typeof window !== 'undefined') {
  // Forcer l'URL de production
  const productionURL = 'https://garageci.geodaftar.com/api';
  
  // Sauvegarder l'URL dans localStorage
  localStorage.setItem('API_BASE_URL', productionURL);
  
  console.log('✅ URL de l\'API mise à jour vers:', productionURL);
  console.log('🔄 Rechargez la page pour appliquer les changements');
  
  // Optionnel: recharger automatiquement
  // window.location.reload();
} else {
  console.log('❌ Ce script doit être exécuté dans un navigateur');
}
