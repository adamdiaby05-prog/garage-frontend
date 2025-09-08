import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  ShoppingCart,
  Star,
  Visibility,
  Store,
  PhotoCamera
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import ProduitForm from '../components/forms/ProduitForm';
import ModernPageTemplate from '../components/ModernPageTemplate';
import PhotoManager from '../components/PhotoManager';

const BoutiquePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isAdmin, setIsAdmin] = useState(false);
  
  // États pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  
  // États pour le gestionnaire de photos
  const [photoManagerOpen, setPhotoManagerOpen] = useState(false);
  const [selectedProduitForPhotos, setSelectedProduitForPhotos] = useState(null);

  // Charger les produits depuis la base de données
  useEffect(() => {
    fetchProduits();
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin((u?.role || '').toLowerCase() === 'admin');
    } catch {}
  }, []);

  // Fonction pour générer une image SVG par défaut
  const generateDefaultImage = (categorie, nom) => {
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
    
    const color = colors[categorie?.toLowerCase()] || '#6b7280';
    const initial = (categorie || nom || 'P').charAt(0).toUpperCase();
    
    const svg = `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="60" fill="${color}" rx="8"/>
      <text x="30" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white">${initial}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  const fetchProduits = async () => {
    try {
      setLoading(true);
      // Utiliser l'API backend directe
      const response = await fetch('http://localhost:5000/api/boutique/produits');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des produits');
      }
      
      console.log('Produits reçus de la base:', data);
      
      // Nettoyer et améliorer les produits
      const cleanData = data
        .filter(produit => produit.nom && produit.nom !== 'adaad') // Filtrer seulement les vrais problèmes
        .map(produit => {
          const raw = typeof produit.image === 'string' ? produit.image : '';
          const trimmed = raw.trim();
          const cleaned = trimmed.replace(/\s+/g, ''); // supprime espaces/nouvelles lignes
          const hasDataUrl = cleaned.startsWith('data:image/');
          const looksLikeBareBase64 = !!cleaned && !cleaned.startsWith('data:') && cleaned.length > 100 && /^[A-Za-z0-9+/=]+$/.test(cleaned.substring(0, 120));

          // Couper si la data URL est tronquée (erreur navigateur) et ignorer
          const isTruncated = hasDataUrl && !cleaned.endsWith('=') && cleaned.length % 4 !== 0;
          const normalizedImage = isTruncated
            ? ''
            : (hasDataUrl ? cleaned : (looksLikeBareBase64 ? `data:image/png;base64,${cleaned}` : ''));

          console.log(`Produit ${produit.nom}:`, {
            hasImage: !!cleaned,
            imageType: cleaned ? cleaned.substring(0, 30) : 'null',
            normalized: normalizedImage ? normalizedImage.substring(0, 30) : 'none'
          });

          return {
            ...produit,
            image: normalizedImage || generateDefaultImage(produit.categorie, produit.nom)
          };
        });
      
      console.log('Produits nettoyés:', cleanData);
      
      setProduits(cleanData);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };


  const filteredProduits = useMemo(() => produits.filter(produit => {
    const matchesSearch = 
      produit.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === 'all' || produit.categorie === categorieFilter;
    return matchesSearch && matchesCategorie;
  }), [produits, searchTerm, categorieFilter]);

  // Gérer l'ajout d'un nouveau produit
  const handleAddProduit = () => {
    setSelectedProduit(null);
    setShowForm(true);
  };

  // Gérer la modification d'un produit
  const handleEditProduit = (produit) => {
    setSelectedProduit(produit);
    setShowForm(true);
  };

  // Gérer la suppression d'un produit
  const handleDeleteProduit = async (id) => {
    try {
      const response = await fetch(`/api/boutique/produits/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          // Le produit n'existe plus, rafraîchir la liste
          console.warn(`Produit ${id} non trouvé, rafraîchissement de la liste...`);
          fetchProduits();
          setSnackbar({ open: true, message: 'Produit déjà supprimé, liste mise à jour', severity: 'warning' });
          return;
        }
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
      
      setProduits(produits.filter(produit => produit.id !== id));
      setSnackbar({ open: true, message: 'Produit supprimé avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  // Gérer la fermeture du formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduit(null);
  };

  // Gestion des photos
  const handleOpenPhotoManager = (produit) => {
    setSelectedProduitForPhotos(produit);
    setPhotoManagerOpen(true);
  };

  const handleClosePhotoManager = () => {
    setPhotoManagerOpen(false);
    setSelectedProduitForPhotos(null);
  };

  // Gérer le succès du formulaire
  const handleFormSuccess = () => {
    fetchProduits();
    setSnackbar({ 
      open: true, 
      message: selectedProduit ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 
      severity: 'success' 
    });
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel pour les produits de la boutique
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = produits.map(produit => ({
        'ID': produit.id_produit || produit.id,
        'Nom': produit.nom || 'N/A',
        'Description': produit.description || 'N/A',
        'Prix': produit.prix || 'N/A',
        'Stock': produit.stock || 'N/A',
        'Catégorie': produit.categorie || 'N/A',
        'Marque': produit.marque || 'N/A',
        'Référence': produit.reference || 'N/A',
        'Statut': produit.statut || 'N/A',
        'Date de création': produit.date_creation ? new Date(produit.date_creation).toLocaleDateString('fr-FR') : 'N/A'
      }));

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // Nom
        { wch: 40 },  // Description
        { wch: 12 },  // Prix
        { wch: 10 },  // Stock
        { wch: 15 },  // Catégorie
        { wch: 15 },  // Marque
        { wch: 15 },  // Référence
        { wch: 12 },  // Statut
        { wch: 15 }   // Date de création
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Produits Boutique');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `produits_boutique_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${produits.length} produits exportés.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des produits.',
        severity: 'error'
      });
    }
  };

  const getCategorieColor = (categorie) => {
    switch (categorie?.toLowerCase()) {
      case 'filtres': return 'success';
      case 'freinage': return 'error';
      case 'électricité': return 'warning';
      case 'moteur': return 'primary';
      case 'suspension': return 'info';
      case 'carrosserie': return 'secondary';
      case 'entretien': return 'default';
      default: return 'default';
    }
  };

  const getCategorieLabel = (categorie) => {
    switch (categorie?.toLowerCase()) {
      case 'filtres': return 'Filtres';
      case 'freinage': return 'Freinage';
      case 'électricité': return 'Électricité';
      case 'moteur': return 'Moteur';
      case 'suspension': return 'Suspension';
      case 'carrosserie': return 'Carrosserie';
      case 'entretien': return 'Entretien';
      default: return categorie;
    }
  };

  const statCards = [
    {
      title: 'Total Produits',
      value: produits.length,
      icon: <Store />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+6%',
      trendUp: true
    },
    {
      title: 'En stock',
      value: produits.filter(p => (p.stock || 0) > 0).length,
      icon: <ShoppingCart />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Catégories',
      value: new Set(produits.map(p => (p.categorie || '').toLowerCase())).size,
      icon: <Star />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+1%',
      trendUp: true
    }
  ];

  return (
    <ModernPageTemplate
      title="Boutique du Garage"
      subtitle="Gestion des produits et stock"
      icon={Store}
      statCards={statCards}
      loading={loading}
      error={error}
      onAdd={handleAddProduit}
      onRefresh={fetchProduits}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.8)' }} />
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtrer par catégorie</InputLabel>
            <Select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              label="Filtrer par catégorie"
            >
              <MenuItem value="all">Toutes les catégories</MenuItem>
              <MenuItem value="filtres">Filtres</MenuItem>
              <MenuItem value="freinage">Freinage</MenuItem>
              <MenuItem value="électricité">Électricité</MenuItem>
              <MenuItem value="moteur">Moteur</MenuItem>
              <MenuItem value="suspension">Suspension</MenuItem>
              <MenuItem value="carrosserie">Carrosserie</MenuItem>
              <MenuItem value="entretien">Entretien</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduit}
            sx={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
          >
            Nouveau Produit
          </Button>
        </Box>
      </Paper>

      {/* Affichage en grille */}
      <Grid container spacing={3}>
        {filteredProduits.map((produit, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id || `produit-${index}`}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  {/* Afficher l'image */}
                  <img
                    src={produit.image}
                    alt={produit.nom}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid rgba(16,185,129,0.3)'
                    }}
                    onError={(e) => {
                      console.error('Erreur de chargement image:', produit.nom, 'Image src:', produit.image.substring(0, 50));
                      // En cas d'erreur, générer une image de fallback
                      e.target.src = generateDefaultImage(produit.categorie, produit.nom);
                    }}
                    onLoad={() => {
                      console.log('Image chargée avec succès:', produit.nom, 'Image src:', produit.image.substring(0, 50));
                    }}
                  />
                  <Chip 
                    label={getCategorieLabel(produit.categorie)}
                    color={getCategorieColor(produit.categorie)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {produit.nom}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {produit.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="h6" 
                    color={produit.prix ? "primary" : "text.primary"} 
                    fontWeight="bold"
                    sx={{ 
                      color: !produit.prix && isAdmin ? '#000000' : undefined,
                      fontWeight: 'bold'
                    }}
                  >
                    {produit.prix ? `${parseFloat(produit.prix).toFixed(2)} €` : 'Prix non défini'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ fontSize: 16, color: 'gold', mr: 0.5 }} />
                    <Typography variant="body2">
                      {produit.note}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2, gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: '#ff9800',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#f57c00',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditProduit(produit)}
                    sx={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#388e3c',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteProduit(produit.id)}
                    sx={{ 
                      mr: 1,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenPhotoManager(produit)}
                    sx={{
                      backgroundColor: '#9c27b0',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#7b1fa2',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    title="Gérer les photos"
                  >
                    <PhotoCamera />
                  </IconButton>
                </Box>
                {!isAdmin && (
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<ShoppingCart />}
                    sx={{ backgroundColor: '#2e7d32' }}
                  >
                    Ajouter
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {filteredProduits.length} produit(s) trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`Total: ${produits.length}`}
            color="default"
            size="small"
          />
        </Box>
      </Box>

      {/* Formulaire de produit */}
      <ProduitForm
        open={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        produit={selectedProduit}
      />

      {/* Gestionnaire de photos */}
      <PhotoManager
        open={photoManagerOpen}
        onClose={handleClosePhotoManager}
        produitId={selectedProduitForPhotos?.id}
        produitNom={selectedProduitForPhotos?.nom}
      />

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ModernPageTemplate>
  );
};

export default BoutiquePage; 