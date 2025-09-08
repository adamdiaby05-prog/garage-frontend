import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Container,
  Rating,
  IconButton,
  Zoom,
  Backdrop
} from '@mui/material';
import { ShoppingCart, Search, AutoAwesome, MyLocation, DirectionsCar, Close, ZoomIn, LocationOn, GpsFixed, Map } from '@mui/icons-material';

// Données de démonstration
const demoProducts = [
  { id: 1, nom: "Filtre à huile premium", description: "Filtre haute performance pour moteur", prix: 29.99, stock: 15, categorie: "filtres", reference: "FIL001", note: 4.8, nombreAvis: 42 },
  { id: 2, nom: "Plaquettes de frein", description: "Plaquettes céramique longue durée", prix: 89.99, stock: 8, categorie: "freinage", reference: "FREIN001", note: 4.6, nombreAvis: 38 },
  { id: 3, nom: "Ampoule LED H7", description: "Éclairage LED blanc pur 6000K", prix: 45.99, stock: 25, categorie: "électricité", reference: "LED001", note: 4.9, nombreAvis: 67 },
  { id: 4, nom: "Joint de culasse", description: "Joint haute résistance thermique", prix: 199.99, stock: 5, categorie: "moteur", reference: "MOT001", note: 4.7, nombreAvis: 23 },
  { id: 5, nom: "Amortisseur avant", description: "Amortisseur hydraulique sport", prix: 159.99, stock: 12, categorie: "suspension", reference: "SUSP001", note: 4.5, nombreAvis: 31 },
  { id: 6, nom: "Rétroviseur droit", description: "Rétroviseur électrique dégivrant", prix: 125.99, stock: 7, categorie: "carrosserie", reference: "CAR001", note: 4.3, nombreAvis: 19 },
  { id: 7, nom: "Huile moteur 5W30", description: "Huile synthétique haute performance", prix: 35.99, stock: 30, categorie: "entretien", reference: "ENT001", note: 4.8, nombreAvis: 89 },
  { id: 8, nom: "Filtre à air sport", description: "Filtre haute filtration réutilisable", prix: 79.99, stock: 18, categorie: "filtres", reference: "FIL002", note: 4.6, nombreAvis: 44 }
];

const getImageByCategory = (category) => {
  const createSVGImage = (color, text) => {
    const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="${color}"/>
      <text x="150" y="150" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white">${text}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  const images = {
    'filtres': createSVGImage('#10b981', 'Filtres'),
    'freinage': createSVGImage('#ef4444', 'Freinage'),
    'électricité': createSVGImage('#f59e0b', 'Électricité'),
    'moteur': createSVGImage('#8b5cf6', 'Moteur'),
    'suspension': createSVGImage('#06b6d4', 'Suspension'),
    'carrosserie': createSVGImage('#84cc16', 'Carrosserie'),
    'entretien': createSVGImage('#f97316', 'Entretien')
  };
  return images[category] || createSVGImage('#10b981', 'Auto Parts');
};

const BoutiqueClientPage = () => {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
  const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [referenceInput, setReferenceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState(1);

  // Champs client
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [position, setPosition] = useState({ lat: 5.345317, lng: -4.024429 });
  
  // États pour la géolocalisation et la carte
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  // États pour le modal d'image
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  
  // États pour les animations
  const [particles, setParticles] = useState([]);
  const [carAnimations, setCarAnimations] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [floatingElements, setFloatingElements] = useState([]);
  const containerRef = useRef(null);
  const particleIdCounter = useRef(0);
  const carIdCounter = useRef(0);

  // Chargement des produits depuis l'API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Charger depuis l'API backend
        const response = await fetch(`${API_BASE}/boutique/produits`);
        if (response.ok) {
          const data = await response.json();
          console.log('Produits reçus de la base:', data);
          
          // Nettoyer et améliorer les produits
          const cleanData = data
            .filter(produit => produit.nom && produit.nom.trim() !== '')
            .map(produit => {
              // Normaliser l'image
              const raw = typeof produit.image === 'string' ? produit.image : '';
              const trimmed = raw.trim();
              const cleaned = trimmed.replace(/\s+/g, '');
              const hasDataUrl = cleaned.startsWith('data:image/');
              const looksLikeBareBase64 = !!cleaned && !cleaned.startsWith('data:') && cleaned.length > 100 && /^[A-Za-z0-9+/=]+$/.test(cleaned.substring(0, 120));
              
              const isTruncated = hasDataUrl && !cleaned.endsWith('=') && cleaned.length % 4 !== 0;
              const normalizedImage = isTruncated
                ? ''
                : (hasDataUrl ? cleaned : (looksLikeBareBase64 ? `data:image/png;base64,${cleaned}` : (cleaned.startsWith('/') ? `${SERVER_BASE}${cleaned}` : '')));
              
              return {
                ...produit,
                image: normalizedImage || getImageByCategory(produit.categorie || 'default'),
                note: parseFloat(produit.note) || 4.0,
                nombreAvis: parseInt(produit.nombreAvis) || 0,
                prix: parseFloat(produit.prix) || 0,
                stock: parseInt(produit.stock) || 0
              };
            });
          
          console.log('Produits nettoyés:', cleanData);
          setProduits(cleanData);
        } else {
          throw new Error('Erreur API');
        }
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits depuis la base de données');
        // En cas d'erreur, utiliser les données de démonstration
        setProduits(demoProducts);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Animation des éléments flottants
  useEffect(() => {
    const generateFloatingElements = () => {
      const elements = [];
      for (let i = 0; i < 20; i++) {
        elements.push({
          id: `float-${i}`,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1
      });
    }
      setFloatingElements(elements);
    };

    generateFloatingElements();
    const interval = setInterval(() => {
      setFloatingElements(prev => prev.map(el => ({
        ...el,
        y: el.y > window.innerHeight ? -10 : el.y + el.speed,
        x: el.x + Math.sin(Date.now() * 0.001 + el.id.length) * 0.5
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Suivi de la souris pour les particules
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Particules suivant la souris
      if (Math.random() < 0.3) {
        const newParticle = {
          id: `trail-${++particleIdCounter.current}-${Date.now()}`,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 60,
          type: 'trail'
        };
        setParticles(prev => [...prev.slice(-30), newParticle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Nettoyage des particules et voitures
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles(prev => prev.filter(p => p.life > 0).map(p => ({ ...p, life: p.life - 1 })));
      setCarAnimations(prev => prev.filter(car => car.life > 0).map(car => ({ 
        ...car, 
        life: car.life - 1,
        x: car.x + car.vx,
        y: car.y + car.vy,
        rotation: car.rotation + car.rotationSpeed
      })));
    }, 16);

    return () => clearInterval(cleanup);
  }, []);

  const getProductImage = (produit) => {
    if (!produit) return getImageByCategory('default');
    
    // Si l'image de la base de données existe et n'est pas null, l'utiliser
    if (produit.image && produit.image !== null && produit.image !== 'null') {
      return produit.image;
    }
    
    // Sinon, utiliser l'image par catégorie
    if (produit.categorie && typeof produit.categorie === 'string') {
      return getImageByCategory(produit.categorie);
    }
    
    return getImageByCategory('default');
  };

  const filteredProduits = useMemo(() => {
    return produits.filter(produit => {
      const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           produit.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categorieFilter === 'all' || 
                             produit.categorie.toLowerCase() === categorieFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [produits, searchTerm, categorieFilter]);

  const handleImageClick = (produit) => {
    setSelectedImage(getProductImage(produit));
    setSelectedProductName(produit.nom);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage('');
    setSelectedProductName('');
  };

  // Fonction pour obtenir la géolocalisation actuelle avec adresse
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setPosition({ lat: latitude, lng: longitude });
        setShowMap(true);
        
        // Obtenir l'adresse à partir des coordonnées (géocodage inverse)
        setAddressLoading(true);
        try {
          const address = await getAddressFromCoordinates(latitude, longitude);
          if (address) {
            setClientAdresse(address);
          }
        } catch (error) {
          console.warn('Impossible d\'obtenir l\'adresse:', error);
        } finally {
          setAddressLoading(false);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        setLocationError('Impossible d\'obtenir votre position. Vérifiez les permissions.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  // Fonction pour obtenir l'adresse à partir des coordonnées (géocodage inverse)
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      // Utiliser l'API de géocodage inverse gratuite de Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AutoParts-Client/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erreur de géocodage');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Construire une adresse formatée avec focus sur quartier et rue
        const address = data.address || {};
        let formattedAddress = '';
        let streetInfo = '';
        let neighborhoodInfo = '';
        
        // Extraire les informations de rue
        if (address.house_number && address.road) {
          streetInfo = `${address.house_number} ${address.road}`;
        } else if (address.road) {
          streetInfo = address.road;
        } else if (address.pedestrian) {
          streetInfo = address.pedestrian;
        } else if (address.footway) {
          streetInfo = address.footway;
        }
        
        // Extraire les informations de quartier/neighbourhood (priorité aux plus spécifiques)
        if (address.neighbourhood) {
          neighborhoodInfo = address.neighbourhood;
        } else if (address.quarter) {
          neighborhoodInfo = address.quarter;
        } else if (address.suburb) {
          neighborhoodInfo = address.suburb;
        } else if (address.city_district) {
          neighborhoodInfo = address.city_district;
        } else if (address.district) {
          neighborhoodInfo = address.district;
        } else if (address.ward) {
          neighborhoodInfo = address.ward;
        } else if (address.hamlet) {
          neighborhoodInfo = address.hamlet;
        }
        
        // Construire l'adresse de manière structurée
        if (streetInfo) {
          formattedAddress += streetInfo;
        }
        
        if (neighborhoodInfo) {
          formattedAddress += formattedAddress ? `, ${neighborhoodInfo}` : neighborhoodInfo;
        }
        
        // Ajouter la ville/commune (priorité aux plus spécifiques)
        let cityInfo = '';
        if (address.city) {
          cityInfo = address.city;
        } else if (address.town) {
          cityInfo = address.town;
        } else if (address.municipality) {
          cityInfo = address.municipality;
        } else if (address.village) {
          cityInfo = address.village;
        } else if (address.locality) {
          cityInfo = address.locality;
        } else if (address.county) {
          cityInfo = address.county;
        }
        
        if (cityInfo) {
          formattedAddress += formattedAddress ? `, ${cityInfo}` : cityInfo;
        }
        
        // Ajouter le code postal
        if (address.postcode) {
          formattedAddress += formattedAddress ? `, ${address.postcode}` : address.postcode;
        }
        
        // Ajouter le pays
        if (address.country) {
          formattedAddress += formattedAddress ? `, ${address.country}` : address.country;
        }
        
        // Si pas d'adresse structurée, utiliser display_name
        if (!formattedAddress) {
          formattedAddress = data.display_name;
        }
        
        return formattedAddress;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
      return null;
    }
  };

  // Fonction pour ouvrir dans Google Maps
  const openInGoogleMaps = () => {
    if (currentLocation) {
      const { lat, lng } = currentLocation;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const handleOpenBuy = (produit) => {
    setSelectedProduit(produit);
    setReferenceInput(produit.reference || '');
    setQuantityInput(1);
    setBuyDialogOpen(true);
    
    // Animation de voiture qui démarre
    const startCar = {
      id: `car-${++carIdCounter.current}`,
      x: mousePos.x,
      y: mousePos.y,
      vx: (Math.random() - 0.5) * 8 + 5,
      vy: (Math.random() - 0.5) * 4,
      life: 120,
      rotation: 0,
      rotationSpeed: 3,
      size: 1
    };
    setCarAnimations(prev => [...prev, startCar]);

    // Explosion de particules
    const explosionParticles = Array.from({ length: 15 }, (_, i) => ({
      id: `explosion-${++particleIdCounter.current}-${Date.now()}-${i}`,
      x: mousePos.x,
      y: mousePos.y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      life: 100,
      type: 'explosion',
      color: `hsl(${120 + Math.random() * 60}, 80%, 60%)`
    }));
    setParticles(prev => [...prev, ...explosionParticles]);
  };

  const handleConfirmBuy = async () => {
    try {
      if (!clientNom || !clientEmail || !clientPhone) {
        setSnackbar({ open: true, severity: 'error', message: 'Veuillez remplir les informations obligatoires.' });
        return;
      }
      
      // Enregistrer la commande via l'API backend
      const orderData = {
        produit: {
          id: selectedProduit?.id,
          nom: selectedProduit?.nom,
          reference: selectedProduit?.reference,
          prix: selectedProduit?.prix,
          image: getProductImage(selectedProduit)
        },
        quantite: quantityInput,
        client: {
          nom: clientNom,
          email: clientEmail,
          telephone: clientPhone,
          adresse: clientAdresse || 'Adresse non spécifiée'
        },
        position: currentLocation ? { ...currentLocation } : { ...position },
        statut: 'en_attente'
      };

      const response = await fetch(`${API_BASE}/commandes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      const result = await response.json();
      
      setBuyDialogOpen(false);
      
      // Animation de succès avec voitures
      const successCars = Array.from({ length: 5 }, (_, i) => ({
        id: `success-car-${++carIdCounter.current}-${i}`,
        x: window.innerWidth / 2 + (i - 2) * 100,
        y: window.innerHeight - 100,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 2,
        life: 180,
        rotation: 0,
        rotationSpeed: 2,
        size: 1.5
      }));
      setCarAnimations(prev => [...prev, ...successCars]);
      
      setSnackbar({ 
        open: true, 
        severity: 'success', 
        message: `🚗💨 Commande confirmée ! ${selectedProduit?.nom} x${quantityInput} - Livraison en route !` 
      });
    } catch (err) {
      console.error('Erreur commande:', err);
      setSnackbar({ open: true, severity: 'error', message: 'Erreur lors de la commande' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1a2332 0%, #0f1419 100%)',
        position: 'relative'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <DirectionsCar sx={{ fontSize: 80, color: '#10b981', mb: 2, animation: 'drive 2s ease-in-out infinite' }} />
          <CircularProgress size={60} sx={{ color: '#10b981' }} />
          <Typography sx={{ color: 'white', mt: 2, fontSize: '1.2rem' }}>
            Démarrage du moteur...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1a2332 0%, #0f1419 100%)'
      }}>
        <Alert severity="error" sx={{ fontSize: '1.2rem', background: 'rgba(239, 68, 68, 0.1)' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      {/* Éléments flottants d'arrière-plan */}
      {floatingElements.map(element => (
        <Box
          key={element.id}
          sx={{
            position: 'fixed',
            left: element.x,
            top: element.y,
            width: element.size,
            height: element.size,
            background: `radial-gradient(circle, rgba(16, 185, 129, ${element.opacity}) 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      ))}

      {/* Particules */}
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'fixed',
            left: particle.x,
            top: particle.y,
            width: particle.type === 'explosion' ? 6 : 3,
            height: particle.type === 'explosion' ? 6 : 3,
            background: particle.color || 'rgba(16, 185, 129, 0.8)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1000,
            animation: particle.type === 'explosion' ? 'explode 2s ease-out forwards' : 'sparkle 1s ease-out forwards',
            boxShadow: particle.type === 'explosion' ? `0 0 10px ${particle.color || '#10b981'}` : 'none'
          }}
        />
      ))}

      {/* Animations de voitures */}
      {carAnimations.map(car => (
        <Box
          key={car.id}
          sx={{
            position: 'fixed',
            left: car.x,
            top: car.y,
            transform: `rotate(${car.rotation}deg) scale(${car.size})`,
            pointerEvents: 'none',
            zIndex: 999,
            transition: 'all 0.1s ease-out'
          }}
        >
          <DirectionsCar sx={{ 
            fontSize: 32, 
            color: '#10b981', 
            filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))'
          }} />
        </Box>
      ))}

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        {/* En-tête style Amazon */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          p: 6,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          border: '2px solid #10b981',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          animation: 'slideInDown 1s ease-out',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 30px 60px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)',
            animation: 'shimmer 3s infinite'
          }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <DirectionsCar sx={{ 
              fontSize: 48, 
              color: '#10b981', 
              mr: 2, 
              animation: 'bounce 2s infinite'
            }} />
          <Typography 
            variant="h2" 
            onClick={() => navigate('/')}
            sx={{ 
              color: '#ffffff', 
              fontWeight: '900', 
              textShadow: '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4), 2px 2px 8px rgba(0,0,0,0.8)', 
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #10b981 50%, #ffffff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textGlow 2s ease-in-out infinite alternate',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                textShadow: '0 0 30px rgba(16, 185, 129, 1), 0 0 60px rgba(16, 185, 129, 0.6), 2px 2px 8px rgba(0,0,0,0.8)',
                filter: 'brightness(1.2)'
              }
            }}
          >
              AutoParts Elite
          </Typography>
            <DirectionsCar sx={{ 
              fontSize: 48, 
              color: '#10b981', 
              ml: 2, 
              animation: 'bounce 2s infinite 0.5s'
            }} />
          </Box>
          
          <Typography variant="h6" sx={{ 
            color: '#10b981', 
            mb: 3,
            fontWeight: 600,
            fontSize: '1.3rem',
            animation: 'fadeIn 1.5s ease-out',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
          }}>
            🏎️ Pièces automobiles premium • ⚡ Livraison express • 🛡️ Garantie totale
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 3,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: '#34d399', animation: 'pulse 2s infinite' }} />
              <Typography variant="body1" sx={{ color: 'rgba(209,250,229,0.85)' }}>
                Livraison 24H
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: '#34d399', animation: 'pulse 2s infinite 0.5s' }} />
              <Typography variant="body1" sx={{ color: 'rgba(209,250,229,0.85)' }}>
                Installation Pro
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: '#34d399', animation: 'pulse 2s infinite 1s' }} />
              <Typography variant="body1" sx={{ color: 'rgba(209,250,229,0.85)' }}>
                Support 24/7
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Barre de recherche style Amazon */}
        <Paper sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 2, 
          background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)', 
          border: '2px solid #10b981', 
          boxShadow: '0 15px 35px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
          animation: 'slideInLeft 1s ease-out 0.2s both',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 25px 50px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="🔍 Rechercher votre pièce auto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#10b981', animation: 'rotate 4s linear infinite' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 2,
                    '& fieldset': { 
                      borderColor: 'rgba(16,185,129,0.6)',
                      borderWidth: 2
                    },
                    '&:hover fieldset': { 
                      borderColor: '#10b981',
                      boxShadow: '0 0 15px rgba(16,185,129,0.3)'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#10b981', 
                      boxShadow: '0 0 20px rgba(16,185,129,0.5)',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputBase-input::placeholder': { 
                    color: 'rgba(16,185,129,0.7)',
                    fontWeight: 500
                  }
                }
              }}
              sx={{ flex: 1, minWidth: 256 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <Select
                value={categorieFilter}
                onChange={(e) => setCategorieFilter(e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 2,
                    '& fieldset': { 
                      borderColor: 'rgba(16,185,129,0.6)',
                      borderWidth: 2
                    },
                    '&:hover fieldset': { 
                      borderColor: '#10b981',
                      boxShadow: '0 0 15px rgba(16,185,129,0.3)'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#10b981',
                      boxShadow: '0 0 20px rgba(16,185,129,0.5)',
                      borderWidth: 2
                    }
                  },
                  '& .MuiSvgIcon-root': { color: '#10b981' }
                }}
              >
                <MenuItem value="all">🌟 Toutes catégories</MenuItem>
                <MenuItem value="filtres">🔧 Filtres</MenuItem>
                <MenuItem value="freinage">🛞 Freinage</MenuItem>
                <MenuItem value="électricité">💡 Électricité</MenuItem>
                <MenuItem value="moteur">⚙️ Moteur</MenuItem>
                <MenuItem value="suspension">🔩 Suspension</MenuItem>
                <MenuItem value="carrosserie">🚗 Carrosserie</MenuItem>
                <MenuItem value="entretien">🛢️ Entretien</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Grille des produits avec animations */}
        <Grid container spacing={4}>
          {filteredProduits.map((produit, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id}>
              <Card sx={{ 
                position: 'relative',
                background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
                borderRadius: 3,
                border: '2px solid #10b981',
                boxShadow: '0 15px 35px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                overflow: 'hidden',
                animation: `slideInUp 0.8s ease-out ${index * 0.1}s both`,
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.03)',
                  boxShadow: '0 25px 50px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                  '& .product-image': {
                    transform: 'scale(1.15)'
                  },
                  '& .buy-button': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.5)'
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.8s ease'
                },
                '&:hover::before': {
                  transform: 'translateX(100%)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                          src={getProductImage(produit)} 
                        alt={produit.nom}
                          className="product-image"
                          onClick={() => handleImageClick(produit)}
                          onError={(e) => {
                            console.error('Erreur de chargement image:', produit.nom);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        sx={{
                            width: 100, 
                            height: 100, 
                          objectFit: 'cover',
                          borderRadius: 3,
                            border: '3px solid #10b981',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'brightness(1.2) contrast(1.1)',
                            cursor: 'pointer',
                            boxShadow: '0 8px 25px rgba(16,185,129,0.3)',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              border: '3px solid #34d399',
                              boxShadow: '0 15px 35px rgba(16,185,129,0.6)'
                            }
                          }} 
                        />
                        <IconButton
                          onClick={() => handleImageClick(produit)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'rgba(16,185,129,0.9)',
                            color: 'white',
                            width: 24,
                            height: 24,
                            '&:hover': {
                              backgroundColor: '#10b981',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ZoomIn sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      {/* Fallback si pas d'image ou erreur */}
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#10b981',
                          color: 'white',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          border: '2px solid rgba(16,185,129,0.4)'
                        }}
                      >
                        {produit.categorie ? produit.categorie.charAt(0).toUpperCase() : 'P'}
                      </Box>
                    <Chip 
                      label={produit.categorie} 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        animation: 'glow 2s ease-in-out infinite alternate',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          boxShadow: '0 6px 20px rgba(16,185,129,0.6)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} 
                    />
                  </Box>

                  <Typography variant="h6" sx={{ 
                    color: 'white', 
                    mb: 1, 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    '&:hover': { 
                      color: '#10b981',
                      textShadow: '0 0 15px rgba(16, 185, 129, 0.8)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {produit.nom}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    mb: 2, 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {produit.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating 
                      value={produit.note || 4} 
                      readOnly 
                      precision={0.5} 
                      size="small" 
                      sx={{ 
                        mr: 1,
                        '& .MuiRating-iconFilled': {
                          color: '#fbbf24'
                        }
                      }} 
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      ({produit.nombreAvis || 25} avis)
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: '900',
                      color: '#10b981',
                      fontSize: '1.8rem',
                      textShadow: '0 0 20px rgba(16, 185, 129, 0.8), 0 2px 4px rgba(0,0,0,0.8)',
                      background: 'linear-gradient(135deg, #10b981, #34d399)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {parseFloat(produit.prix || 0).toFixed(2)} €
                    </Typography>
                    <Chip 
                      label={produit.stock > 0 ? 'En stock' : 'Rupture'} 
                      size="small" 
                      color={produit.stock > 0 ? 'success' : 'error'} 
                      sx={{ fontWeight: 'bold' }} 
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<ShoppingCart />}
                    onClick={() => handleOpenBuy(produit)}
                    className="buy-button"
                    sx={{ 
                      background: 'linear-gradient(135deg, #10b981, #34d399)',
                      fontWeight: 'bold',
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      '&:hover': { 
                        boxShadow: '0 15px 35px rgba(16, 185, 129, 0.6)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Acheter
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Modal d'achat simplifié */}
        <Dialog 
          open={buyDialogOpen} 
          onClose={() => setBuyDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,78,59,0.15) 100%)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: 4,
              border: '1px solid rgba(16,185,129,0.3)', 
              boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.2)', 
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🛒 Commander {selectedProduit?.nom}
          </DialogTitle>
          
          <DialogContent sx={{ color: 'white' }}>
            <TextField
              label="Nom complet" 
              value={clientNom} 
              onChange={(e) => setClientNom(e.target.value)} 
              fullWidth
              sx={{ mb: 2 }} 
              InputProps={{
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  } 
                } 
              }} 
            />
            <TextField
              type="email" 
              label="Email" 
              value={clientEmail} 
              onChange={(e) => setClientEmail(e.target.value)} 
              fullWidth
              sx={{ mb: 2 }} 
              InputProps={{
                sx: {
                    color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  } 
                }
              }}
            />
            <TextField 
              type="tel" 
              label="Téléphone" 
              value={clientPhone} 
              onChange={(e) => setClientPhone(e.target.value)} 
              fullWidth 
              sx={{ mb: 2 }} 
              InputProps={{ 
                sx: { 
                  color: 'white',
                  '& .MuiOutlinedInput-root': { 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  } 
                } 
              }} 
            />
            <TextField 
              label={addressLoading ? "Adresse (détection en cours...)" : "Adresse (optionnelle)"} 
              value={clientAdresse} 
              onChange={(e) => setClientAdresse(e.target.value)} 
              fullWidth 
              multiline 
              rows={2}
              sx={{ mb: 2 }} 
              InputProps={{ 
                endAdornment: addressLoading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} sx={{ color: '#10b981' }} />
                  </InputAdornment>
                ) : null,
                sx: { 
                    color: 'white',
                  '& .MuiOutlinedInput-root': { 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  } 
                }
              }}
              helperText={addressLoading ? "📍 Détection de votre rue, quartier et ville en cours..." : "💡 Cliquez sur 'Obtenir ma position' pour détecter automatiquement votre rue, quartier et ville"}
              FormHelperTextProps={{
                sx: { color: addressLoading ? '#10b981' : 'rgba(255,255,255,0.6)' }
              }}
            />
            <TextField
              type="number"
              label="Quantité"
              value={quantityInput}
              onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value || '1', 10)))}
              inputProps={{ min: 1 }}
              fullWidth 
              sx={{ mb: 3 }} 
              InputProps={{
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }
              }}
            />

            {/* Section Géolocalisation */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#10b981' }} />
                📍 Votre Localisation
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={locationLoading ? <CircularProgress size={20} color="inherit" /> : <GpsFixed />}
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  sx={{
                    backgroundColor: '#10b981',
                    '&:hover': { backgroundColor: '#059669' },
                    flex: '1 1 auto',
                    minWidth: 200
                  }}
                >
                  {locationLoading ? 'Localisation...' : 'Obtenir ma position'}
                </Button>
                
                {currentLocation && (
                  <Button
                    variant="outlined"
                    startIcon={<Map />}
                    onClick={openInGoogleMaps}
                    sx={{
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': { 
                        borderColor: '#059669',
                        backgroundColor: 'rgba(16,185,129,0.1)'
                      }
                    }}
                  >
                    Ouvrir dans Google Maps
                  </Button>
                )}
              </Box>

              {locationError && (
                <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  {locationError}
                </Alert>
              )}

              {currentLocation && (
                <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    📍 Position GPS détectée avec précision :
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      Lat: {currentLocation.lat.toFixed(8)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      Lng: {currentLocation.lng.toFixed(8)}
                    </Typography>
                  </Box>
                  {clientAdresse && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                        🏠 Adresse détectée :
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', mt: 0.5, lineHeight: 1.4 }}>
                        {clientAdresse}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {clientAdresse.includes(',') && (
                          <>
                            {clientAdresse.split(',')[0] && (
                              <Chip 
                                label={`📍 ${clientAdresse.split(',')[0].trim()}`} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(16,185,129,0.2)', 
                                  color: '#10b981',
                                  fontSize: '0.7rem'
                                }} 
                              />
                            )}
                            {clientAdresse.split(',')[1] && (
                              <Chip 
                                label={`🏘️ ${clientAdresse.split(',')[1].trim()}`} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(16,185,129,0.2)', 
                                  color: '#10b981',
                                  fontSize: '0.7rem'
                                }} 
                              />
                            )}
                            {clientAdresse.split(',')[2] && (
                              <Chip 
                                label={`🏙️ ${clientAdresse.split(',')[2].trim()}`} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(16,185,129,0.2)', 
                                  color: '#10b981',
                                  fontSize: '0.7rem'
                                }} 
                              />
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Carte simple avec iframe Google Maps (sans clé API) */}
              {showMap && currentLocation && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      🗺️ Carte de votre position :
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Map />}
                      onClick={openInGoogleMaps}
                      sx={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        fontSize: '0.75rem',
                        '&:hover': { 
                          borderColor: '#059669',
                          backgroundColor: 'rgba(16,185,129,0.1)'
                        }
                      }}
                    >
                      Ouvrir dans Google Maps
                    </Button>
                  </Box>
                  <Box
                    component="iframe"
                    src={`https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=18&output=embed&maptype=roadmap`}
                    sx={{
                      width: '100%',
                      height: 250,
                      border: '2px solid rgba(16,185,129,0.4)',
                      borderRadius: 2,
                      filter: 'brightness(0.9)'
                    }}
                    title="Carte de localisation"
                    onError={() => {
                      console.log('Erreur de chargement de la carte iframe');
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, display: 'block' }}>
                    💡 Si la carte ne s'affiche pas, cliquez sur "Ouvrir dans Google Maps" ci-dessus
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setBuyDialogOpen(false)}
              sx={{ 
                flex: 1,
                background: '#6b7280',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': { background: '#4b5563' }
              }}
            >
              Annuler
            </Button>
            <Button 
              variant="contained"
              onClick={handleConfirmBuy}
              sx={{ 
                flex: 1,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 15px 30px -5px rgba(16, 185, 129, 0.4)'
                }
              }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Modal d'agrandissement d'image */}
        <Dialog
          open={imageModalOpen}
          onClose={handleCloseImageModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 4
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: 'white',
            borderBottom: '1px solid rgba(16,185,129,0.3)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedProductName}
            </Typography>
            <IconButton 
              onClick={handleCloseImageModal}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, textAlign: 'center' }}>
            <Zoom in={imageModalOpen} timeout={300}>
              <Box
                component="img"
                src={selectedImage}
                alt={selectedProductName}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                  border: '2px solid rgba(16,185,129,0.4)',
                  boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 35px 60px -12px rgba(16, 185, 129, 0.5)'
                  }
                }}
              />
            </Zoom>
          </DialogContent>
        </Dialog>
      </Container>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes drive {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(10px) rotate(2deg); }
          75% { transform: translateX(-10px) rotate(-2deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sparkle {
          0% { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0) rotate(180deg); }
        }
        @keyframes explode {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes slideInDown {
          from { transform: translateY(-100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glow {
          from { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
          to { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes textGlow {
          from { 
            textShadow: '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4), 2px 2px 8px rgba(0,0,0,0.8)';
          }
          to { 
            textShadow: '0 0 30px rgba(16, 185, 129, 1), 0 0 60px rgba(16, 185, 129, 0.6), 2px 2px 8px rgba(0,0,0,0.8)';
          }
        }
      `}</style>
    </Box>
  );
};

export default BoutiqueClientPage;
