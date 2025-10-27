import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { AddAPhoto, AttachMoney } from '@mui/icons-material';

const VenteVehiculeForm = ({ open, onClose, onSuccess, vehicule }) => {
  const [formData, setFormData] = useState({
    prix_vente: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicule && open) {
      setFormData({
        prix_vente: '',
        description: `${vehicule.marque} ${vehicule.modele} ${vehicule.annee} - ${vehicule.couleur}`,
        image: null
      });
      setImagePreview('');
      setError('');
    }
  }, [vehicule, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      try {
        // Upload de l'image
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          const imageUrl = `http://localhost:5000${result.url}`;
          setImagePreview(imageUrl);
          setFormData(prev => ({ ...prev, image: imageUrl }));
          setError('');
        } else {
          throw new Error('Erreur lors de l\'upload');
        }
      } catch (error) {
        console.error('Erreur upload image:', error);
        setError('Erreur lors de l\'upload de l\'image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.prix_vente || formData.prix_vente <= 0) {
        throw new Error('Le prix de vente doit être supérieur à 0');
      }

      if (!formData.image) {
        throw new Error('Une photo est obligatoire pour mettre en vente');
      }

      // Récupérer les données utilisateur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        throw new Error('ID utilisateur non trouvé');
      }

      // Mettre en vente
      const response = await fetch('http://localhost:5000/api/vente/vehicules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicule_id: vehicule.id,
          user_id: user.id,
          prix_vente: parseFloat(formData.prix_vente),
          description: formData.description,
          image: formData.image
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise en vente');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      prix_vente: '',
      description: '',
      image: null
    });
    setImagePreview('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AttachMoney color="primary" />
          Mettre en vente : {vehicule?.marque} {vehicule?.modele} {vehicule?.annee}
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Prix de vente *"
            name="prix_vente"
            type="number"
            value={formData.prix_vente}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
            placeholder="Décrivez votre véhicule..."
          />

          {/* Upload d'image */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Photo du véhicule *
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload-vente"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload-vente">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddAPhoto />}
                sx={{ mb: 2 }}
              >
                Choisir une photo
              </Button>
            </label>

            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Informations du véhicule */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Informations du véhicule :
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Marque :</strong> {vehicule?.marque}<br />
              <strong>Modèle :</strong> {vehicule?.modele}<br />
              <strong>Année :</strong> {vehicule?.annee}<br />
              <strong>Couleur :</strong> {vehicule?.couleur}<br />
              <strong>Kilométrage :</strong> {vehicule?.kilometrage?.toLocaleString()} km<br />
              <strong>Carburant :</strong> {vehicule?.carburant}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.prix_vente || !formData.image}
            startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
          >
            {loading ? 'Mise en vente...' : 'Mettre en vente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VenteVehiculeForm;
