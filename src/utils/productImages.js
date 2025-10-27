// Configuration des images par défaut pour les produits
export const getProductImage = (produit) => {
  // Si le produit a une vraie image depuis la base de données, l'utiliser
  if (produit.image && produit.image.startsWith('/uploads/')) {
    const SERVER_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/api\/?$/, '');
    return `${SERVER_BASE}${produit.image}`;
  }
  
  // Images par défaut selon la catégorie ou marque
  const defaultImages = {
    // Pièces auto
    'filtres': '/images/filtres-default.jpg',
    'freinage': '/images/freinage-default.jpg',
    'moteur': '/images/moteur-default.jpg',
    'suspension': '/images/suspension-default.jpg',
    'carrosserie': '/images/carrosserie-default.jpg',
    'entretien': '/images/entretien-default.jpg',
    'électricité': '/images/electrique-default.jpg',
    'accessoires': '/images/accessoires-default.jpg',
    
    // Marques de véhicules
    'Toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    'Mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
    'Audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    'Peugeot': 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop',
    'Renault': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
    'Volkswagen': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
    'Ford': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    'Nissan': 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop',
    'Honda': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    'Hyundai': 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop',
    'Kia': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop'
  };
  
  // Utiliser la marque pour les véhicules, sinon la catégorie
  const key = produit.marque || produit.categorie?.toLowerCase();
  return defaultImages[key] || '/images/produit-default.jpg';
};

// Images de démonstration avec des URLs d'images gratuites
export const demoImages = {
  'filtres': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
  'freinage': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'moteur': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'suspension': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'carrosserie': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'entretien': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'électricité': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'accessoires': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
};

// Fonction pour obtenir une image de démonstration
export const getDemoImage = (categorie) => {
  const cat = categorie?.toLowerCase();
  return demoImages[cat] || demoImages['accessoires'];
};
