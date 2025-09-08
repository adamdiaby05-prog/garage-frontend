// Produits de démonstration pour la boutique
export const demoProducts = [
  {
    id: 1,
    nom: 'Filtre à air sport',
    categorie: 'Filtres',
    prix: 45.99,
    stock: 15,
    note: 4.5,
    nombreAvis: 28,
    description: 'Filtre à air haute performance pour moteurs sportifs. Améliore la respiration du moteur et augmente la puissance.',
    reference: 'FIL-AIR-001',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    nom: 'Plaquettes de frein avant',
    categorie: 'Freinage',
    prix: 89.99,
    stock: 8,
    note: 4.8,
    nombreAvis: 42,
    description: 'Plaquettes de frein premium avec revêtement céramique. Performance et durabilité exceptionnelles.',
    reference: 'FREIN-PLAQ-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    nom: 'Bougie d\'allumage iridium',
    categorie: 'Moteur',
    prix: 12.99,
    stock: 25,
    note: 4.6,
    nombreAvis: 35,
    description: 'Bougies d\'allumage haute performance en iridium. Allumage optimal et longue durée de vie.',
    reference: 'MOTEUR-BOUG-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    nom: 'Amortisseurs sport',
    categorie: 'Suspension',
    prix: 299.99,
    stock: 6,
    note: 4.7,
    nombreAvis: 18,
    description: 'Amortisseurs sport haute performance. Tenue de route et confort optimisés.',
    reference: 'SUSP-AMORT-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    nom: 'Rétroviseur électrique',
    categorie: 'Carrosserie',
    prix: 75.50,
    stock: 12,
    note: 4.4,
    nombreAvis: 31,
    description: 'Rétroviseur électrique avec clignotant intégré. Installation facile et design moderne.',
    reference: 'CARRO-RETRO-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    nom: 'Huile moteur synthétique',
    categorie: 'Entretien',
    prix: 34.99,
    stock: 30,
    note: 4.9,
    nombreAvis: 67,
    description: 'Huile moteur synthétique 5W-30. Protection maximale et performance optimale.',
    reference: 'ENTRET-HUILE-001',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  }
];

// Fonction pour obtenir une image selon la catégorie
export const getImageByCategory = (categorie) => {
  // Vérification de sécurité
  if (!categorie || typeof categorie !== 'string') {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
  }
  
  const images = {
    'filtres': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
    'freinage': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'moteur': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'suspension': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'carrosserie': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'entretien': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'électricité': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  };
  
  const normalizedCategorie = categorie.toLowerCase().trim();
  return images[normalizedCategorie] || images['entretien'];
};
