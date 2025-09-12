import React, { useEffect, useState } from 'react';
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
  InputAdornment,
  Rating,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  
} from '@mui/material';
import { 
  ShoppingCart, 
  Search, 
  AutoAwesome, 
  DirectionsCar, 
  Star,
  Verified,
  Speed,
  Shield,
  Bolt,
  Menu as MenuIcon,
  Close,
  FilterList,
  ZoomIn,
  ZoomOut
} from '@mui/icons-material';
import { boutiqueAPI } from '../services/api';

const BoutiqueClientPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({ nom: '', email: '', telephone: '', adresse: '' });
  const [orderQty, setOrderQty] = useState(1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Données de démonstration (fallback si API vide)
  const demoProducts = [
    { 
      id: 1, 
      nom: "Filtre à huile premium", 
      description: "Filtre haute performance pour moteur avec technologie nano-filtration", 
      prix: 29.99, 
      stock: 15, 
      categorie: "filtres", 
      reference: "FIL001", 
      note: 4.8, 
      nombreAvis: 42,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Premium"
    },
    { 
      id: 2, 
      nom: "Plaquettes de frein", 
      description: "Plaquettes céramique longue durée avec système anti-bruit", 
      prix: 89.99, 
      stock: 8, 
      categorie: "freinage", 
      reference: "FREIN001", 
      note: 4.6, 
      nombreAvis: 38,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Sport"
    },
    { 
      id: 3, 
      nom: "Ampoule LED H7", 
      description: "Éclairage LED blanc pur 6000K avec durée de vie 50 000h", 
      prix: 45.99, 
      stock: 25, 
      categorie: "électricité", 
      reference: "LED001", 
      note: 4.9, 
      nombreAvis: 67,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "LED"
    },
    { 
      id: 4, 
      nom: "Joint de culasse", 
      description: "Joint haute résistance thermique pour moteurs haute performance", 
      prix: 199.99, 
      stock: 5, 
      categorie: "moteur", 
      reference: "MOT001", 
      note: 4.7, 
      nombreAvis: 23,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Pro"
    },
    { 
      id: 5, 
      nom: "Amortisseur avant", 
      description: "Amortisseur hydraulique sport avec réglage de dureté", 
      prix: 159.99, 
      stock: 12, 
      categorie: "suspension", 
      reference: "SUSP001", 
      note: 4.5, 
      nombreAvis: 31,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Sport"
    },
    { 
      id: 6, 
      nom: "Rétroviseur droit", 
      description: "Rétroviseur électrique dégivrant avec indicateur de direction", 
      prix: 125.99, 
      stock: 7, 
      categorie: "carrosserie", 
      reference: "CAR001", 
      note: 4.3, 
      nombreAvis: 19,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Smart"
    },
    { 
      id: 7, 
      nom: "Huile moteur 5W30", 
      description: "Huile synthétique haute performance pour tous types de moteurs", 
      prix: 35.99, 
      stock: 30, 
      categorie: "entretien", 
      reference: "ENT001", 
      note: 4.8, 
      nombreAvis: 89,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Synthétique"
    },
    { 
      id: 8, 
      nom: "Filtre à air sport", 
      description: "Filtre haute filtration réutilisable avec gain de puissance", 
      prix: 79.99, 
      stock: 18, 
      categorie: "filtres", 
      reference: "FIL002", 
      note: 4.6, 
      nombreAvis: 44,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      badge: "Performance"
    }
  ];

  const categories = [
    { value: 'all', label: 'Tous les produits', icon: <DirectionsCar /> },
    { value: 'filtres', label: 'Filtres', icon: <FilterList /> },
    { value: 'freinage', label: 'Freinage', icon: <Shield /> },
    { value: 'électricité', label: 'Électricité', icon: <Bolt /> },
    { value: 'moteur', label: 'Moteur', icon: <AutoAwesome /> },
    { value: 'suspension', label: 'Suspension', icon: <Speed /> },
    { value: 'carrosserie', label: 'Carrosserie', icon: <Verified /> },
    { value: 'entretien', label: 'Entretien', icon: <Star /> }
  ];

  const [products, setProducts] = useState([]);

  // Charger les produits depuis l'API boutique (identique à BoutiquePage)
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        setError('');
        const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
        const response = await fetch(`${API_BASE}/boutique/produits`);
          const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des produits');
        }
        const cleanData = (Array.isArray(data) ? data : [])
          .filter(produit => produit.nom && produit.nom !== 'adaad')
          .map((produit, idx) => {
              const raw = typeof produit.image === 'string' ? produit.image : '';
              const trimmed = raw.trim();
              const cleaned = trimmed.replace(/\s+/g, '');
              const hasDataUrl = cleaned.startsWith('data:image/');
              const looksLikeBareBase64 = !!cleaned && !cleaned.startsWith('data:') && cleaned.length > 100 && /^[A-Za-z0-9+/=]+$/.test(cleaned.substring(0, 120));
              const isTruncated = hasDataUrl && !cleaned.endsWith('=') && cleaned.length % 4 !== 0;
            const normalizedImage = isTruncated ? '' : (hasDataUrl ? cleaned : (looksLikeBareBase64 ? `data:image/png;base64,${cleaned}` : ''));
              return {
                ...produit,
              id: produit.id ?? (produit.id_produit ?? idx + 1),
              image: normalizedImage || getDefaultImage(produit.categorie, produit.nom)
              };
            });
        setProducts(cleanData.length > 0 ? cleanData : demoProducts);
      } catch (e) {
        console.error('Erreur chargement produits boutique-client:', e);
        setError('Erreur lors du chargement des produits');
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  const getDefaultImage = (categorie, nom) => {
    const colors = {
      'filtres': '#10b981',
      'freinage': '#ef4444',
      'électricité': '#f59e0b',
      'moteur': '#8b5cf6',
      'suspension': '#06b6d4',
      'carrosserie': '#84cc16',
      'entretien': '#f97316',
      'test': '#6b7280'
    };
    const color = colors[(categorie || '').toLowerCase()] || '#6b7280';
    const initial = (categorie || nom || 'P').charAt(0).toUpperCase();
    const svg = `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="${color}" rx="8"/><text x="30" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">${initial}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  // Badges 3D avec animations
  const badges3D = [
    { icon: <Verified />, title: 'Garantie', subtitle: '2 ans', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)', rotation: '12deg' },
    { icon: <Speed />, title: 'Livraison', subtitle: '24h', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)', rotation: '-8deg' },
    { icon: <Shield />, title: 'Sécurisé', subtitle: 'SSL', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)', rotation: '15deg' }
  ];

  // Initialisation des particules
  useEffect(() => {
    const initialParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#00ff88', '#00cc6a', '#00aa55'][Math.floor(Math.random() * 3)]
    }));
    setParticles(initialParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(p => {
        const nextX = p.x + p.speedX;
        const nextY = p.y + p.speedY;
        return {
          ...p,
          x: nextX > window.innerWidth ? 0 : nextX < 0 ? window.innerWidth : nextX,
          y: nextY > window.innerHeight ? 0 : nextY < 0 ? window.innerHeight : nextY
        };
      }));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Filtrer et trier les produits
  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const name = (product?.nom ?? '').toString();
    const description = (product?.description ?? '').toString();
    const category = (product?.categorie ?? '').toString();
    const q = (searchTerm ?? '').toString().toLowerCase();
    const matchesSearch = name.toLowerCase().includes(q) || description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const aName = (a?.nom ?? '').toString();
    const bName = (b?.nom ?? '').toString();
    const aPrice = Number(a?.prix ?? 0);
    const bPrice = Number(b?.prix ?? 0);
    const aRating = Number(a?.note ?? 0);
    const bRating = Number(b?.note ?? 0);
    switch (sortBy) {
      case 'price-asc': return aPrice - bPrice;
      case 'price-desc': return bPrice - aPrice;
      case 'rating': return bRating - aRating;
      default: return aName.localeCompare(bName);
    }
  });

  const openOrderModal = (product) => {
    setOrderProduct(product);
    setOrderQty(1);
    setOrderForm({ nom: '', email: '', telephone: '', adresse: '' });
    setOrderOpen(true);
  };

  const addToCart = (product) => {
    openOrderModal(product);
  };

  const submitOrder = async () => {
    try {
      setOrderSubmitting(true);
      // Tentative de géolocalisation
      const getPosition = () => new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
      const position = (await getPosition()) || { lat: null, lng: null };
      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const payload = {
        produit: {
          id: orderProduct.id,
          nom: orderProduct.nom,
          reference: orderProduct.reference,
          prix: orderProduct.prix,
          image: orderProduct.image,
        },
        quantite: Number(orderQty) || 1,
        client: { ...orderForm },
        position: { lat: position.lat, lng: position.lng },
      };
      const res = await fetch(`${API_BASE}/commandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l\'envoi de la commande');
      }
      setSnackbar({ open: true, message: 'Commande envoyée avec succès ✅', severity: 'success' });
      setOrderOpen(false);
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: e.message || 'Erreur de commande', severity: 'error' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const openPreview = (src) => {
    setPreviewSrc(src);
    setIsZoomed(false);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => setPreviewSrc(''), 200);
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Premium': '#00ff88',
      'Sport': '#ff6b6b',
      'LED': '#4ecdc4',
      'Pro': '#45b7d1',
      'Smart': '#96ceb4',
      'Synthétique': '#feca57',
      'Performance': '#ff9ff3'
    };
    return colors[badge] || '#00ff88';
  };

  return (
    <div className="boutique-container">
      {/* Particules flottantes */}
      {particles.map(particle => (
        <div 
          key={particle.id} 
          className="particle" 
          style={{ 
            left: particle.x, 
            top: particle.y, 
            width: particle.size, 
            height: particle.size, 
            backgroundColor: particle.color, 
            opacity: particle.opacity, 
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}` 
          }} 
        />
      ))}

      {/* Effet de cursor glow */}
      <div 
        className="cursor-glow" 
        style={{ 
          left: mousePosition.x - 150, 
          top: mousePosition.y - 150, 
        }} 
      />

      {/* Header avec animation */}
      <header className={`header ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo-section" onClick={() => navigate('/')}>
              <div className="logo-icon">
                <div className="logo-inner">
                  <ShoppingCart className="logo-car" />
                </div>
              </div>
              <div className="logo-text">
                <h1>AutoGenius</h1>
                <span>Boutique Premium</span>
              </div>
            </div>
            
            <nav className="desktop-nav">
              {['Accueil', 'Services', 'À propos', 'Contact'].map(item => (
                <button key={item} className="nav-link" onClick={() => console.log(`Navigate to ${item}`)}>{item}</button>
              ))}
            </nav>
            
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <Close /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="mobile-menu">
            {['Accueil', 'Services', 'À propos', 'Contact'].map(item => (
              <button key={item} className="mobile-nav-link" onClick={() => console.log(`Navigate to ${item}`)}>{item}</button>
            ))}
          </div>
        )}
      </header>

      {/* Section principale */}
      <main className="main-section">
        <div className="container">
          {/* Hero section */}
          <div className="hero-section">
            <div className="hero-content">
              {/* Badges 3D flottants */}
              <div className="badges-container">
                {badges3D.map((badge, index) => (
                  <div 
                    key={index}
                    className="badge-3d"
                    style={{
                      transform: `rotate(${badge.rotation}) translateY(${Math.sin(Date.now() / 1000 + index) * 10}px)`,
                      boxShadow: `0 20px 40px ${badge.glow}, inset 0 0 20px rgba(255,255,255,0.1)`
                    }}
                  >
                    <div className="badge-icon" style={{ color: badge.color }}>
                      {badge.icon}
                    </div>
                    <div className="badge-text">
                      <div className="badge-title">{badge.title}</div>
                      <div className="badge-subtitle">{badge.subtitle}</div>
                    </div>
                    <div className="badge-glow" style={{ background: badge.glow }} />
                  </div>
                ))}
              </div>

              <div className="hero-text">
                <div className="welcome-badge">
                  <Star className="star-icon" />
                  <span>Boutique Premium AutoGenius</span>
                </div>
                
                <h1 className="hero-title">
                  <span className="title-line">Pièces & Accessoires</span>
                  <span className="title-line neon">de Qualité Premium</span>
                </h1>
                
                <p className="hero-description">
                  Découvrez notre sélection exclusive de 
                  <span className="highlight"> pièces automobiles premium </span> 
                  et d'accessoires 
                  <span className="highlight"> haute performance</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="filters-section">
            <div className="filters-container">
              <TextField
                fullWidth
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search style={{ color: '#00ff88' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '25px',
                    '& fieldset': {
                      borderColor: 'rgba(0, 255, 136, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00ff88',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00ff88',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                }}
              />
              
              <div className="filters-row">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Trier par nom</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating">Meilleures notes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grille des produits */}
          <div className="products-grid">
            {filteredProducts.map((product, index) => (
              <Fade in={true} timeout={300 + index * 100} key={product.id}>
                <Card 
                  className={`product-card ${hoveredCard === product.id ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="product-image-container">
                    <img 
                      src={product.image} 
                      alt={product.nom}
                      className="product-image"
                      onClick={() => openPreview(product.image)}
                      style={{ cursor: 'zoom-in' }}
                    />
                    <div 
                      className="product-badge"
                      style={{ backgroundColor: getBadgeColor(product.badge) }}
                    >
                      {product.badge}
                    </div>
                    {/* Bouton zoom sur la badge */}
                    <button 
                      className="zoom-btn" 
                      aria-label="Zoomer l'image"
                      onClick={(e) => { e.stopPropagation(); openPreview(product.image); }}
                      title="Zoomer"
                    >
                      <ZoomIn style={{ color: '#fff' }} />
                    </button>
                    <div className="product-overlay">
                      <IconButton 
                        className="quick-view-btn"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart />
                      </IconButton>
                    </div>
                  </div>
                  
                  <CardContent className="product-content">
                    <Typography variant="h6" className="product-title">
                      {product.nom}
                    </Typography>
                    
                    <Typography variant="body2" className="product-description">
                      {product.description}
                    </Typography>
                    
                    <div className="product-rating">
                      <Rating value={product.note} precision={0.1} readOnly size="small" />
                      <span className="rating-text">({product.nombreAvis})</span>
                    </div>
                    
                    <div className="product-info">
                      <Chip 
                        label={product.categorie} 
                        size="small" 
                        className="category-chip"
                      />
                      <span className="product-stock">
                        {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardActions className="product-actions">
                    <div className="price-container">
                      <span className="product-price">{product.prix}€</span>
                      <span className="product-reference">Ref: {product.reference}</span>
                    </div>
                    
                    <Button 
                      variant="contained" 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      startIcon={<ShoppingCart />}
                    >
                      {product.stock > 0 ? 'Ajouter' : 'Indisponible'}
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <Typography variant="h5" className="no-products-title">
                Aucun produit trouvé
              </Typography>
              <Typography variant="body1" className="no-products-text">
                Essayez de modifier vos critères de recherche
              </Typography>
            </div>
          )}
        </div>
      </main>
      {loading && (
        <div className="container" style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span>Chargement des articles...</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <ShoppingCart />
            </div>
            <span>AutoGenius Boutique</span>
          </div>
          <p>© 2024 AutoGenius - L'avenir du garage management 🚗</p>
        </div>
      </footer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Preview image dialog (popup) */}
      {previewOpen && (
        <div className="image-preview-backdrop" onClick={closePreview}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewSrc} 
              alt="Aperçu produit"
              className={`image-preview ${isZoomed ? 'zoomed' : ''}`}
              onClick={() => setIsZoomed(!isZoomed)}
              style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
            />
            <button className="close-preview" onClick={closePreview}>✕</button>
            <button className="zoom-toggle" onClick={() => setIsZoomed(!isZoomed)} aria-label="Basculer le zoom">
              {isZoomed ? <ZoomOut style={{ color: '#fff' }} /> : <ZoomIn style={{ color: '#fff' }} />}
            </button>
          </div>
        </div>
      )}

      {/* Order dialog */}
      <Dialog open={orderOpen} onClose={() => setOrderOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Finaliser l'achat</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {orderProduct && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src={orderProduct.image} alt={orderProduct.nom} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{orderProduct.nom}</Typography>
                  <Typography variant="body2">Ref: {orderProduct.reference} — {orderProduct.prix}€</Typography>
                </Box>
              </Box>
            )}
            <TextField label="Nom complet" fullWidth required value={orderForm.nom} onChange={(e) => setOrderForm({ ...orderForm, nom: e.target.value })} />
            <TextField label="Email" type="email" fullWidth required value={orderForm.email} onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })} />
            <TextField label="Téléphone" fullWidth required value={orderForm.telephone} onChange={(e) => setOrderForm({ ...orderForm, telephone: e.target.value })} />
            <TextField label="Adresse complète" fullWidth required value={orderForm.adresse} onChange={(e) => setOrderForm({ ...orderForm, adresse: e.target.value })} />
            <TextField label="Quantité" type="number" inputProps={{ min: 1, step: 1 }} fullWidth value={orderQty} onChange={(e) => setOrderQty(e.target.value)} />
            <Alert severity="info">Votre localisation sera récupérée automatiquement (si autorisée) pour faciliter la livraison.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={submitOrder} disabled={orderSubmitting}>{orderSubmitting ? 'Envoi...' : 'Confirmer la commande'}</Button>
        </DialogActions>
      </Dialog>

      <style>{`
        .boutique-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: white;
          overflow-x: hidden;
          position: relative;
        }

        /* Particules */
        .particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: float 6s ease-in-out infinite;
        }

        .cursor-glow {
          position: fixed;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.15), transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 2;
          filter: blur(30px);
          transition: all 0.1s ease;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
          transition: all 0.3s ease;
        }

        .header.scrolled {
          background: rgba(10, 10, 10, 0.95);
          border-bottom: 1px solid rgba(0, 255, 136, 0.4);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #00ff88, #00aa55);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(12deg);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
          animation: logoFloat 4s ease-in-out infinite;
        }

        .logo-inner {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 8px;
        }

        .logo-car {
          color: #00aa55;
        }

        .logo-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(90deg, #fff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-text span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .desktop-nav {
          display: flex;
          gap: 30px;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease, transform 0.2s ease;
          position: relative;
          background: transparent;
          border: none;
          padding: 6px 0;
        }

        .nav-link:hover {
          color: #00ff88;
          transform: translateY(-2px);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: #00ff88;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }

        .mobile-menu {
          background: transparent;
          border-top: none;
          padding: 20px;
        }

        .mobile-nav-link {
          display: block;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          padding: 12px 0;
          border: none;
          background: transparent;
          text-align: left;
        }

        /* Section principale */
        .main-section {
          padding-top: 120px;
          min-height: 100vh;
          position: relative;
          z-index: 10;
        }

        /* Hero section */
        .hero-section {
          padding: 60px 0;
          position: relative;
        }

        .hero-content {
          position: relative;
          text-align: center;
        }

        /* Badges 3D */
        .badges-container {
          position: absolute;
          top: -50px;
          right: -50px;
          z-index: 5;
        }

        .badge-3d {
          position: absolute;
          width: 120px;
          height: 80px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 170, 85, 0.2));
          border-radius: 15px;
          border: 1px solid rgba(0, 255, 136, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          animation: badgeFloat 6s ease-in-out infinite;
        }

        .badge-3d:nth-child(1) {
          top: 0;
          right: 0;
          animation-delay: 0s;
        }

        .badge-3d:nth-child(2) {
          top: 100px;
          right: 80px;
          animation-delay: 2s;
        }

        .badge-3d:nth-child(3) {
          top: 200px;
          right: 20px;
          animation-delay: 4s;
        }

        .badge-icon {
          font-size: 24px;
        }

        .badge-text {
          flex: 1;
        }

        .badge-title {
          font-size: 11px;
          font-weight: 800;
          color: #00ff88;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
          line-height: 1.2;
        }

        .badge-subtitle {
          font-size: 9px;
          color: #ffffff;
          font-weight: 600;
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
          line-height: 1.1;
        }

        .badge-glow {
          position: absolute;
          inset: -5px;
          border-radius: 20px;
          filter: blur(15px);
          opacity: 0.3;
          z-index: -1;
        }

        /* Hero content */
        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, rgba(0, 255, 136, 0.2), rgba(0, 170, 85, 0.2));
          border: 1px solid rgba(0, 255, 136, 0.4);
          border-radius: 50px;
          padding: 10px 20px;
          margin-bottom: 30px;
          animation: glow 2s ease-in-out infinite alternate;
        }

        .star-icon {
          color: #ffff00;
          animation: twinkle 1.5s ease-in-out infinite;
        }

        .hero-title {
          font-size: 64px;
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 30px 0;
          position: relative;
          z-index: 15;
        }

        .title-line {
          display: block;
          background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-line.neon {
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
          z-index: 10;
          position: relative;
        }

        .hero-description {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .highlight {
          color: #00ff88;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        /* Filtres */
        .filters-section {
          padding: 40px 0;
        }

        .filters-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .filters-row {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .category-select, .sort-select {
          padding: 12px 20px;
          border-radius: 25px;
          border: 1px solid rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .category-select:focus, .sort-select:focus {
          outline: none;
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }

        .category-select option, .sort-select option {
          background: #1a1a1a;
          color: white;
        }

        /* Grille des produits */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          padding: 40px 0;
        }

        .product-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: #00ff88;
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
        }

        .product-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.1);
        }

        .product-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .zoom-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.3);
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: transform 0.15s ease, background 0.2s ease;
          z-index: 3;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        }

        .zoom-btn:hover {
          transform: scale(1.06);
          background: rgba(0,0,0,0.6);
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 2;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .quick-view-btn {
          background: rgba(0, 255, 136, 0.9);
          color: white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
        }

        .quick-view-btn:hover {
          background: #00ff88;
          transform: scale(1.1);
        }

        .product-content {
          padding: 20px;
        }

        .product-title {
          font-size: 18px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 10px;
        }

        .product-description {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .rating-text {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .product-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-chip {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .product-stock {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .product-actions {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-container {
          display: flex;
          flex-direction: column;
        }

        .product-price {
          font-size: 24px;
          font-weight: 700;
          color: #00ff88;
        }

        .product-reference {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .add-to-cart-btn {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
          border-radius: 25px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-to-cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
        }

        .add-to-cart-btn:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }

        /* No products */
        .no-products {
          text-align: center;
          padding: 60px 20px;
        }

        .no-products-title {
          color: #00ff88;
          margin-bottom: 20px;
        }

        .no-products-text {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Footer */
        .footer {
          border-top: 1px solid rgba(0, 255, 136, 0.2);
          background: rgba(0, 0, 0, 0.3);
          padding: 30px 0;
          position: relative;
          z-index: 10;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #00ff88;
        }

        /* Image preview */
        .image-preview-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .image-preview-container {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }
        .image-preview {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          transition: transform 0.2s ease;
        }
        .image-preview.zoomed {
          transform: scale(1.8);
        }
        .close-preview {
          position: absolute;
          top: -10px;
          right: -10px;
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 10px;
          border-radius: 20px;
          cursor: pointer;
          backdrop-filter: blur(6px);
        }
        .zoom-toggle {
          position: absolute;
          right: -10px;
          bottom: -10px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          padding: 6px 10px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: rotate(12deg) translateY(0px); }
          50% { transform: rotate(12deg) translateY(-10px); }
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
          100% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.6); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .hero-title {
            font-size: 48px;
          }

          .badges-container {
            display: none;
          }

          .filters-row {
            flex-direction: column;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BoutiqueClientPage;
