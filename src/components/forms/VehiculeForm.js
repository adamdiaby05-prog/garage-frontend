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
  CircularProgress,
  Alert
} from '@mui/material';
import { AddAPhoto, Image } from '@mui/icons-material';
import { vehiculesAPI } from '../../services/vehiculesAPI';
import { vehiculesAPI as clientVehiculesAPI } from '../../services/api';

const VehiculeForm = ({ open, onClose, onSuccess, vehicule = null, fixedClientId = null }) => {
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    couleur: '',
    prix_vente: '',
    prix_location_jour: '',
    kilometrage: '',
    carburant: 'Essence',
    transmission: 'Manuelle',
    puissance: '',
    description: '',
    image_principale: '',
    statut: 'disponible',
    type_vente: 'vente_et_location',
    immatriculation: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Options pour les selects
  const marques = [
    'Toyota', 'BMW', 'Mercedes', 'Audi', 'Peugeot', 'Renault', 
    'Volkswagen', 'Ford', 'Nissan', 'Honda', 'Hyundai', 'Kia'
  ];

  const couleurs = [
    'Blanc', 'Noir', 'Gris', 'Argent', 'Rouge', 'Bleu', 
    'Vert', 'Jaune', 'Orange', 'Marron', 'Beige'
  ];

  const carburants = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
  const transmissions = ['Manuelle', 'Automatique', 'Semi-automatique'];
  const statuts = ['disponible', 'vendu', 'loue', 'maintenance'];
  const typesVente = ['vente', 'location', 'vente_et_location'];

  // Charger les données du véhicule si en mode édition
  useEffect(() => {
    if (vehicule) {
      setFormData({
        marque: vehicule.marque || '',
        modele: vehicule.modele || '',
        annee: vehicule.annee || new Date().getFullYear(),
        couleur: vehicule.couleur || '',
        prix_vente: vehicule.prix_vente || '',
        prix_location_jour: vehicule.prix_location_jour || '',
        kilometrage: vehicule.kilometrage || '',
        carburant: vehicule.carburant || 'Essence',
        transmission: vehicule.transmission || 'Manuelle',
        puissance: vehicule.puissance || '',
        description: vehicule.description || '',
        image_principale: vehicule.image_principale || '',
        statut: vehicule.statut || 'disponible',
        type_vente: vehicule.type_vente || 'vente_et_location',
        immatriculation: vehicule.immatriculation || vehicule.numero_immatriculation || ''
      });
      setImagePreview(vehicule.image_principale || '');
    } else {
      // Réinitialiser le formulaire pour un nouveau véhicule
      setFormData({
        marque: '',
        modele: '',
        annee: new Date().getFullYear(),
        couleur: '',
        prix_vente: '',
        prix_location_jour: '',
        kilometrage: '',
        carburant: 'Essence',
        transmission: 'Manuelle',
        puissance: '',
        description: '',
        image_principale: '',
        statut: 'disponible',
        type_vente: 'vente_et_location',
        immatriculation: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
    setErrors({});
  }, [vehicule, open]);

  // Gérer les changements dans les champs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Gérer l'upload d'image depuis le PC
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Veuillez sélectionner un fichier image valide' }));
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'L\'image ne doit pas dépasser 5MB' }));
      return;
    }

      setImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({ ...prev, image_principale: e.target.result }));
      };
      reader.readAsDataURL(file);
      
      // Effacer l'erreur d'image
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  // Gérer le changement d'URL d'image
  const handleImageUrlChange = (url) => {
    setFormData(prev => ({ ...prev, image_principale: url }));
    setImagePreview(url);
    setImageFile(null);
    
    // Effacer l'erreur d'image
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.marque.trim()) newErrors.marque = 'La marque est requise';
    if (!formData.modele.trim()) newErrors.modele = 'Le modèle est requis';
    if (!formData.couleur.trim()) newErrors.couleur = 'La couleur est requise';
    
    // Si c'est un véhicule client, l'immatriculation est obligatoire
    if (fixedClientId && !formData.immatriculation.trim()) {
      newErrors.immatriculation = 'L\'immatriculation est requise';
    }
    
    // Si c'est un véhicule boutique, les prix sont obligatoires
    if (!fixedClientId) {
      if (!formData.prix_vente || formData.prix_vente <= 0) {
        newErrors.prix_vente = 'Le prix de vente doit être supérieur à 0';
      }
      if (!formData.prix_location_jour || formData.prix_location_jour <= 0) {
        newErrors.prix_location_jour = 'Le prix de location doit être supérieur à 0';
      }
    }
    
    if (formData.annee < 1900 || formData.annee > new Date().getFullYear() + 1) {
      newErrors.annee = 'L\'année doit être valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (fixedClientId) {
        // Création d'un véhicule client
        const clientVehiculeData = {
          client_id: fixedClientId,
          marque: formData.marque,
          modele: formData.modele,
          immatriculation: formData.immatriculation,
          annee: formData.annee,
          kilometrage: formData.kilometrage || 0,
          carburant: formData.carburant,
          couleur: formData.couleur
        };
        
        if (vehicule) {
          await clientVehiculesAPI.update(vehicule.id, clientVehiculeData);
        } else {
          await clientVehiculesAPI.create(clientVehiculeData);
        }
      } else {
        // Création d'un véhicule boutique
        if (vehicule) {
          await vehiculesAPI.update(vehicule.id, formData);
        } else {
          await vehiculesAPI.create(formData);
        }
      }
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde du véhicule' });
    } finally {
      setLoading(false);
    }
  };

  // Fermer le formulaire
  const handleClose = () => {
    setFormData({
      marque: '',
      modele: '',
      annee: new Date().getFullYear(),
      couleur: '',
      prix_vente: '',
      prix_location_jour: '',
      kilometrage: '',
      carburant: 'Essence',
      transmission: 'Manuelle',
      puissance: '',
      description: '',
      image_principale: '',
      statut: 'disponible',
      type_vente: 'vente_et_location',
      immatriculation: ''
    });
    setImagePreview('');
    setImageFile(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {vehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Marque */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.marque}>
                <InputLabel>Marque *</InputLabel>
                  <Select
                  value={formData.marque}
                  onChange={(e) => handleChange('marque', e.target.value)}
                  label="Marque *"
                >
                  {marques.map((marque) => (
                    <MenuItem key={marque} value={marque}>
                      {marque}
                        </MenuItem>
                  ))}
                  </Select>
                </FormControl>
              {errors.marque && (
                <Typography variant="caption" color="error">
                  {errors.marque}
                </Typography>
              )}
              </Grid>

            {/* Modèle */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modèle *"
                value={formData.modele}
                onChange={(e) => handleChange('modele', e.target.value)}
                error={!!errors.modele}
                helperText={errors.modele}
              />
            </Grid>

            {/* Immatriculation (seulement pour véhicules clients) */}
            {fixedClientId && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Immatriculation *"
                  value={formData.immatriculation}
                  onChange={(e) => handleChange('immatriculation', e.target.value.toUpperCase())}
                  error={!!errors.immatriculation}
                  helperText={errors.immatriculation}
                  placeholder="AB-123-CD"
                />
              </Grid>
            )}

            {/* Année */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Année *"
                type="number"
                value={formData.annee}
                onChange={(e) => handleChange('annee', parseInt(e.target.value) || '')}
                error={!!errors.annee}
                helperText={errors.annee}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>

            {/* Couleur */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.couleur}>
                <InputLabel>Couleur *</InputLabel>
                <Select
                  value={formData.couleur}
                  onChange={(e) => handleChange('couleur', e.target.value)}
                  label="Couleur *"
                >
                  {couleurs.map((couleur) => (
                    <MenuItem key={couleur} value={couleur}>
                      {couleur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.couleur && (
                <Typography variant="caption" color="error">
                  {errors.couleur}
                </Typography>
              )}
            </Grid>

            {/* Kilométrage */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kilométrage"
                type="number"
                value={formData.kilometrage}
                onChange={(e) => handleChange('kilometrage', parseInt(e.target.value) || '')}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Prix de vente */}
            {!fixedClientId && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix de vente (FCFA) *"
                  type="number"
                  value={formData.prix_vente}
                  onChange={(e) => handleChange('prix_vente', parseFloat(e.target.value) || '')}
                  error={!!errors.prix_vente}
                  helperText={errors.prix_vente}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            )}

            {/* Prix de location */}
            {!fixedClientId && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix de location/jour (FCFA) *"
                  type="number"
                  value={formData.prix_location_jour}
                  onChange={(e) => handleChange('prix_location_jour', parseFloat(e.target.value) || '')}
                  error={!!errors.prix_location_jour}
                  helperText={errors.prix_location_jour}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            )}

            {/* Carburant */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Carburant</InputLabel>
                <Select
                  value={formData.carburant}
                  onChange={(e) => handleChange('carburant', e.target.value)}
                  label="Carburant"
                >
                  {carburants.map((carburant) => (
                    <MenuItem key={carburant} value={carburant}>
                      {carburant}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Transmission */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Transmission</InputLabel>
                <Select
                  value={formData.transmission}
                  onChange={(e) => handleChange('transmission', e.target.value)}
                  label="Transmission"
                >
                  {transmissions.map((transmission) => (
                    <MenuItem key={transmission} value={transmission}>
                      {transmission}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Puissance */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Puissance (CV)"
                value={formData.puissance}
                onChange={(e) => handleChange('puissance', e.target.value)}
              />
            </Grid>

            {/* Statut */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.statut}
                  onChange={(e) => handleChange('statut', e.target.value)}
                  label="Statut"
                >
                  {statuts.map((statut) => (
                    <MenuItem key={statut} value={statut}>
                      {statut}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Type de vente */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de vente</InputLabel>
                <Select
                  value={formData.type_vente}
                  onChange={(e) => handleChange('type_vente', e.target.value)}
                  label="Type de vente"
                >
                  {typesVente.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>

            {/* Image */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00ff88' }}>
                Image du véhicule
              </Typography>
              
              {/* Aperçu de l'image */}
              {imagePreview && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '2px solid #00ff88',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
              
              {/* Upload depuis le PC */}
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddAPhoto />}
                    sx={{
                      borderColor: '#00ff88',
                      color: '#00ff88',
                      '&:hover': {
                        borderColor: '#00cc6a',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)'
                      }
                    }}
                  >
                    Choisir une image depuis votre PC
                  </Button>
                </label>
                {imageFile && (
                  <Typography variant="caption" sx={{ ml: 2, color: '#00ff88' }}>
                    Fichier sélectionné: {imageFile.name}
                  </Typography>
                )}
              </Box>
              
              {/* Ou URL */}
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                Ou entrez une URL d'image:
              </Typography>
              <TextField
                fullWidth
                label="URL de l'image"
                value={formData.image_principale}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                error={!!errors.image}
                helperText={errors.image}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #00ff88, #00cc6a)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00cc6a, #00aa55)'
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Sauvegarde...
              </Box>
            ) : (
              vehicule ? 'Modifier' : 'Créer'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VehiculeForm; 