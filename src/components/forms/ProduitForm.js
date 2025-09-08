import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  PhotoCamera,
  Delete
} from '@mui/icons-material';
import { fournisseursAPI } from '../../services/api';

const ProduitForm = ({ open, onClose, onSuccess, produit = null }) => {
  const [formData, setFormData] = useState({
    nom_piece: '',
    reference: '',
    description: '',
    categorie: '',
    fournisseur: '',
    prix_achat: '',
    prix_unitaire: '',
    stock_actuel: '',
    stock_minimum: '',
    image: null,
    imagePreview: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

  // Charger les fournisseurs
  useEffect(() => {
    if (open) {
      fetchFournisseurs();
    }
  }, [open]);

  // Initialiser le formulaire avec les données du produit existant
  useEffect(() => {
    if (produit) {
      setFormData({
        nom_piece: produit.nom_piece || produit.nom || '',
        reference: produit.reference || '',
        description: produit.description || '',
        categorie: produit.categorie || '',
        fournisseur: produit.id_fournisseur || produit.fournisseur || '',
        prix_achat: produit.prix_achat || '',
        prix_unitaire: produit.prix_unitaire || produit.prix_vente || '',
        stock_actuel: produit.stock_actuel || '',
        stock_minimum: produit.stock_minimum || '',
        image: null,
        imagePreview: produit.image || null
      });
    } else {
      setFormData({
        nom_piece: '',
        reference: '',
        description: '',
        categorie: '',
        fournisseur: '',
        prix_achat: '',
        prix_unitaire: '',
        stock_actuel: '',
        stock_minimum: '',
        image: null,
        imagePreview: null
      });
    }
    setErrors({});
  }, [produit]);

  // Charger les fournisseurs depuis la base de données
  const fetchFournisseurs = async () => {
    try {
      setLoadingFournisseurs(true);
      const response = await fournisseursAPI.getAll();
      setFournisseurs(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  // Gérer les changements dans les champs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Gérer la sélection d'image
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Veuillez sélectionner une image valide' }));
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'L\'image doit faire moins de 5MB' }));
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: null,
      imagePreview: null
    }));
  };

  // Compresser et redimensionner l'image
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Redimensionner l'image à une taille maximale de 300x300
        const maxWidth = 300;
        const maxHeight = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression PNG (meilleure qualité)
        const compressedDataUrl = canvas.toDataURL('image/png', 1.0);
        console.log('Image compressée - Taille:', compressedDataUrl.length, 'caractères');
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom_piece || !formData.nom_piece.trim()) {
      newErrors.nom_piece = 'Le nom du produit est obligatoire';
    }
    if (!formData.reference || !formData.reference.trim()) {
      newErrors.reference = 'La référence est obligatoire';
    }
    if (!formData.categorie) {
      newErrors.categorie = 'La catégorie est obligatoire';
    }
    if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
      newErrors.prix_unitaire = 'Le prix unitaire doit être supérieur à 0';
    }
    if (!formData.stock_actuel || parseInt(formData.stock_actuel) < 0) {
      newErrors.stock_actuel = 'Le stock doit être positif ou nul';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let imageData = null;
      if (formData.image) {
        try {
          // Compresser et redimensionner l'image avant de l'envoyer
          imageData = await compressImage(formData.image);
          console.log('Image compressée avec succès - Taille:', imageData.length, 'caractères');
          console.log('Début de l\'image:', imageData.substring(0, 50));
        } catch (imageError) {
          console.error('Erreur lors de la compression de l\'image:', imageError);
          // Continuer sans image si la compression échoue
          imageData = null;
        }
      }

      // Générer une référence unique
      let reference = formData.reference && formData.reference.trim() ? formData.reference.trim() : `REF-${Date.now()}`;
      
      // Si c'est une création (pas de modification), s'assurer que la référence est unique
      if (!produit) {
        // Ajouter un timestamp pour garantir l'unicité
        if (formData.reference && formData.reference.trim()) {
          reference = `${formData.reference.trim()}-${Date.now()}`;
        }
      }

      const produitData = {
        nom: (formData.nom_piece || '').trim(),
        reference: reference,
        description: (formData.description || '').trim(),
        prix: parseFloat(formData.prix_unitaire) || 0,
        stock: parseInt(formData.stock_actuel) || 0,
        categorie: formData.categorie || 'Général',
        image: imageData || null,
        note: 4.0,
        nombreAvis: 0
      };

      console.log('Données à envoyer:', produitData);
      console.log('URL de l\'API:', 'http://localhost:5000/api/boutique/produits');

      if (produit) {
        // Modification d'un produit existant
        const produitId = produit.id_piece || produit.id;
        const response = await fetch(`http://localhost:5000/api/boutique/produits/${produitId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(produitData)
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la modification');
        }
      } else {
        // Création d'un nouveau produit
        const response = await fetch('http://localhost:5000/api/boutique/produits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(produitData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la création');
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.response?.data?.message || 'Erreur lors de la sauvegarde' 
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fermer le formulaire
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const categories = [
    'filtres',
    'freinage',
    'électricité',
    'moteur',
    'suspension',
    'carrosserie',
    'entretien',
    'roues',
    'lubrifiant',
    'refroidissement'
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {produit ? 'Modifier le produit' : 'Nouveau produit'}
      </DialogTitle>
      
      <DialogContent>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Image du produit */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Image du produit
              </Typography>
              
              {formData.imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={formData.imagePreview}
                    alt="Aperçu"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'error.dark' }
                    }}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '200px',
                    height: '200px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <PhotoCamera sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Cliquez pour ajouter une image
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    JPG, PNG - Max 5MB
                  </Typography>
                </Box>
              )}
              
              {errors.image && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.image}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Informations de base */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom du produit *"
              value={formData.nom_piece}
                              onChange={(e) => handleChange('nom_piece', e.target.value)}
                              error={!!errors.nom_piece}
                helperText={errors.nom_piece}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Référence *"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              error={!!errors.reference}
              helperText={errors.reference}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.categorie}>
              <InputLabel>Catégorie *</InputLabel>
              <Select
                value={formData.categorie}
                onChange={(e) => handleChange('categorie', e.target.value)}
                label="Catégorie *"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    <Chip 
                      label={cat.charAt(0).toUpperCase() + cat.slice(1)} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              {errors.categorie && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.categorie}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={formData.fournisseur || ''}
                onChange={(e) => handleChange('fournisseur', e.target.value)}
                label="Fournisseur"
                disabled={loadingFournisseurs}
              >
                <MenuItem value="">Aucun fournisseur</MenuItem>
                {fournisseurs.map((fournisseur) => (
                  <MenuItem key={fournisseur.id_fournisseur || fournisseur.id || `fournisseur-${Math.random()}`} value={fournisseur.id_fournisseur || fournisseur.id || ''}>
                    {fournisseur.nom_fournisseur || fournisseur.nom || 'Nom non défini'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Prix et stock */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Prix d'achat (€)"
              type="number"
              value={formData.prix_achat}
              onChange={(e) => handleChange('prix_achat', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Prix de vente (€) *"
              type="number"
              value={formData.prix_unitaire}
                              onChange={(e) => handleChange('prix_unitaire', e.target.value)}
                error={!!errors.prix_unitaire}
                helperText={errors.prix_unitaire}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Stock actuel"
              type="number"
              value={formData.stock_actuel}
              onChange={(e) => handleChange('stock_actuel', e.target.value)}
              error={!!errors.stock_actuel}
              helperText={errors.stock_actuel}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Stock minimum"
              type="number"
              value={formData.stock_minimum}
              onChange={(e) => handleChange('stock_minimum', e.target.value)}
              inputProps={{ min: 0 }}
              helperText="Seuil d'alerte pour le réapprovisionnement"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={produit ? <Edit /> : <Add />}
          disabled={loading}
        >
          {loading ? 'Sauvegarde...' : (produit ? 'Modifier' : 'Ajouter')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProduitForm;
