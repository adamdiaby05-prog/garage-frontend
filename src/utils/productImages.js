// Configuration des images par défaut pour les produits
export const getProductImage = (produit) => {
  // Si le produit a une vraie image depuis la base de données, l'utiliser
  if (produit.image && produit.image.startsWith('/uploads/')) {
    return `http://localhost:5000${produit.image}`;
  }
  
  // Images par défaut selon la catégorie
  const defaultImages = {
    'filtres': '/images/filtres-default.jpg',
    'freinage': '/images/freinage-default.jpg',
    'moteur': '/images/moteur-default.jpg',
    'suspension': '/images/suspension-default.jpg',
    'carrosserie': '/images/carrosserie-default.jpg',
    'entretien': '/images/entretien-default.jpg',
    'électricité': '/images/electrique-default.jpg',
    'accessoires': '/images/accessoires-default.jpg'
  };
  
  const categorie = produit.categorie?.toLowerCase();
  return defaultImages[categorie] || '/images/produit-default.jpg';
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
