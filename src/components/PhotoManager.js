import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add,
  Delete,
  Star,
  StarBorder,
  PhotoCamera,
  Image
} from '@mui/icons-material';

const PhotoManager = ({ produitId, produitNom, onClose, open }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Charger les photos du produit
  const fetchPhotos = async () => {
    if (!produitId) return;
    
    setLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/boutique/produits/${produitId}/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        setError('Erreur lors du chargement des photos');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && produitId) {
      fetchPhotos();
    }
  }, [open, produitId]);

  // Ajouter une photo
  const handleAddPhoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convertir l'image en base64
      const base64 = await convertToBase64(file);
      
      const photoData = {
        nom_fichier: file.name,
        type_mime: file.type,
        image_data: base64,
        est_principale: photos.length === 0 // Première photo = principale
      };

      const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/boutique/produits/${produitId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData)
      });

      if (response.ok) {
        await fetchPhotos(); // Recharger les photos
      } else {
        setError('Erreur lors de l\'ajout de la photo');
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout de la photo');
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une photo
  const handleDeletePhoto = async (photoId) => {
    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/boutique/photos/${photoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPhotos(); // Recharger les photos
      } else {
        setError('Erreur lors de la suppression de la photo');
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la photo');
    }
  };

  // Définir comme photo principale
  const handleSetMainPhoto = async (photoId) => {
    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/boutique/photos/${photoId}/principale`, {
        method: 'PUT'
      });

      if (response.ok) {
        await fetchPhotos(); // Recharger les photos
      } else {
        setError('Erreur lors de la définition de la photo principale');
      }
    } catch (err) {
      setError('Erreur lors de la définition de la photo principale');
    }
  };

  // Convertir un fichier en base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCamera sx={{ color: '#10b981' }} />
          <Typography variant="h6">
            Photos du produit: {produitNom}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Bouton d'ajout de photo */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="add-photo-button"
            type="file"
            onChange={handleAddPhoto}
            disabled={uploading}
          />
          <label htmlFor="add-photo-button">
            <Button
              variant="contained"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <Add />}
              disabled={uploading}
              sx={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #059669, #047857)'
                }
              }}
            >
              {uploading ? 'Ajout en cours...' : 'Ajouter une photo'}
            </Button>
          </label>
        </Box>

        {/* Grille des photos */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
            <Image sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">Aucune photo</Typography>
            <Typography variant="body2">
              Cliquez sur "Ajouter une photo" pour commencer
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={photo.id}>
                <Card sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.image_data}
                    alt={photo.nom_fichier}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  {/* Badge photo principale */}
                  {photo.est_principale && (
                    <Chip
                      label="Principale"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'rgba(16, 185, 129, 0.9)',
                        color: 'white'
                      }}
                    />
                  )}
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        color={photo.est_principale ? 'primary' : 'default'}
                      >
                        {photo.est_principale ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Box>
                    
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePhoto(photo.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoManager;
