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
import { clientsAPI } from '../../services/api';

const ClientForm = ({ open, onClose, onSuccess, client = null }) => {
  const [formData, setFormData] = useState({
    nom: client?.nom || '',
    prenom: client?.prenom || '',
    email: client?.email || '',
    telephone: client?.telephone || '',
    adresse: client?.adresse || '',
    date_naissance: client?.date_naissance || ''
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
    setLoading(true);
    setError('');

    try {
      if (client) {
        // Modification
        await clientsAPI.update(client.id_client, formData);
      } else {
        // Création
        await clientsAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      // Améliorer la gestion des erreurs
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Erreur lors de l\'enregistrement du client');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      date_naissance: ''
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {client ? 'Modifier le Client' : 'Nouveau Client'}
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
              <TextField
                name="prenom"
                label="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
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
                name="date_naissance"
                label="Date de naissance"
                type="date"
                value={formData.date_naissance}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
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
            disabled={loading || !formData.nom || !formData.prenom}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              minWidth: 120,
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            {loading ? 'En cours...' : (client ? 'Modifier' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClientForm; 