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
  CircularProgress
} from '@mui/material';

const GarageForm = ({ open, onClose, onSuccess, garage = null }) => {
  const [formData, setFormData] = useState({
    nom_garage: garage?.nom_garage || '',
    adresse: garage?.adresse || '',
    ville: garage?.ville || '',
    code_postal: garage?.code_postal || '',
    telephone: garage?.telephone || '',
    email: garage?.email || '',
    siret: garage?.siret || '',
    specialites: garage?.specialites || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Validation basique
      if (!formData.nom_garage || !formData.email) {
        setError('Le nom du garage et l\'email sont requis');
        return;
      }

      await onSuccess(formData);
      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setError('Erreur lors de l\'enregistrement du garage');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nom_garage: '',
      adresse: '',
      ville: '',
      code_postal: '',
      telephone: '',
      email: '',
      siret: '',
      specialites: ''
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {garage ? 'Modifier le garage' : 'Nouveau garage'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="nom_garage"
                label="Nom du garage *"
                value={formData.nom_garage}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="adresse"
                label="Adresse"
                value={formData.adresse}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="ville"
                label="Ville"
                value={formData.ville}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="code_postal"
                label="Code postal"
                value={formData.code_postal}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="telephone"
                label="Téléphone"
                value={formData.telephone}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email *"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="siret"
                label="SIRET"
                value={formData.siret}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="14 chiffres"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="specialites"
                label="Spécialités / Services proposés"
                value={formData.specialites}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Ex: Vidange, Révision, Diagnostic, Réparation moteur, Contrôle technique..."
                helperText="Listez les services que votre garage propose"
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
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Enregistrement...' : (garage ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GarageForm;








