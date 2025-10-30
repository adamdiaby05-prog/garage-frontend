/**
 * Utilitaires pour normaliser les données d'API
 */

/**
 * Normalise les données d'API pour s'assurer qu'elles sont toujours un tableau
 * @param {any} data - Les données reçues de l'API
 * @returns {Array} - Un tableau normalisé
 */
export const normalizeApiData = (data) => {
  // Si c'est déjà un tableau, le retourner
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si c'est un objet avec une propriété 'data' qui est un tableau
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // Si c'est un objet avec une propriété 'value' qui est un tableau
  if (data && Array.isArray(data.value)) {
    return data.value;
  }
  
  // Si c'est un objet, chercher le premier tableau dans ses valeurs
  if (data && typeof data === 'object') {
    const arrayValue = Object.values(data).find(val => Array.isArray(val));
    if (arrayValue) {
      return arrayValue;
    }
  }
  
  // Par défaut, retourner un tableau vide
  return [];
};

/**
 * Normalise les données d'API avec logging pour le debug
 * @param {any} data - Les données reçues de l'API
 * @param {string} apiName - Le nom de l'API pour le logging
 * @returns {Array} - Un tableau normalisé
 */
export const normalizeApiDataWithLogging = (data, apiName = 'API') => {
  console.log(`🔍 ${apiName} - Données reçues:`, data);
  
  const normalized = normalizeApiData(data);
  
  console.log(`📋 ${apiName} - Données normalisées:`, normalized);
  
  return normalized;
};
