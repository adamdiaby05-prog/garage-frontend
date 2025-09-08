import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { servicesAPI } from '../../services/api';

const ServiceForm = ({ open, onClose, onSuccess, service = null }) => {
  const [formData, setFormData] = useState({
    nom: service?.nom || '',
    description: service?.description || '',
    categorie: service?.categorie || '',
    prix: service?.prix || '',
    duree_estimee: service?.duree_estimee || '',
    statut: service?.statut || 'actif'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'reparation',
    'entretien',
    'diagnostic',
    'nettoyage'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (service) {
        // Modification
        await servicesAPI.update(service.id, formData);
      } else {
        // Création
        await servicesAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du service');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: '',
      description: '',
      categorie: '',
      prix: '',
      duree_estimee: '',
      statut: 'actif'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {service ? 'Modifier le Service' : 'Nouveau Service'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom *"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  label="Catégorie"
                >
                  {categories.map((categorie) => (
                    <MenuItem key={categorie} value={categorie}>
                      {categorie.charAt(0).toUpperCase() + categorie.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="prix"
                label="Prix *"
                type="number"
                value={formData.prix}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="duree_estimee"
                label="Durée estimée (min) *"
                type="number"
                value={formData.duree_estimee}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: "0" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  label="Statut"
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
                </Select>
              </FormControl>
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
            disabled={loading || !formData.nom || !formData.categorie || !formData.prix}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {service ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceForm; 