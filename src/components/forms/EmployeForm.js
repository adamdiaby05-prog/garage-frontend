import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
} from '@mui/material';
import { employesAPI } from '../../services/api';

const EmployeForm = ({ open, onClose, onSuccess, employe = null }) => {
  const [formData, setFormData] = useState({
    nom: employe?.nom || '',
    prenom: employe?.prenom || '',
    poste: employe?.poste || 'mecanicien',
    telephone: employe?.telephone || '',
    email: employe?.email || '',
    salaire: employe?.salaire || '',
    date_embauche: employe?.date_embauche ? employe.date_embauche.split('T')[0] : '',
    actif: employe?.actif !== undefined ? employe.actif : true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const postes = [
    { value: 'gerant', label: 'Gérant' },
    { value: 'mecanicien', label: 'Mécanicien' },
    { value: 'vendeur', label: 'Vendeur' },
    { value: 'secretaire', label: 'Secrétaire' }
  ];

  const statutsActif = [
    { value: true, label: 'Actif' },
    { value: false, label: 'Inactif' }
  ];

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
      const dataToSend = {
        ...formData,
        salaire: parseFloat(formData.salaire) || null
      };

      if (employe) {
        await employesAPI.update(employe.id_employe || employe.id, dataToSend);
      } else {
        await employesAPI.create(dataToSend);
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
        setError('Erreur lors de l\'enregistrement de l\'employé');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: '',
      prenom: '',
      poste: 'mecanicien',
      telephone: '',
      email: '',
      salaire: '',
      date_embauche: '',
      actif: true
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {employe ? 'Modifier l\'Employé' : 'Nouvel Employé'}
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
                label="Prénom *"
                value={formData.prenom}
                onChange={handleChange}
                fullWidth
                required
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Poste *</InputLabel>
                <Select
                  name="poste"
                  value={formData.poste}
                  onChange={handleChange}
                >
                  {postes.map((poste) => (
                    <MenuItem key={poste.value} value={poste.value}>
                      {poste.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="salaire"
                label="Salaire (€)"
                type="number"
                value={formData.salaire}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date_embauche"
                label="Date d'embauche"
                type="date"
                value={formData.date_embauche}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="actif"
                  value={formData.actif}
                  onChange={handleChange}
                >
                  {statutsActif.map((statut) => (
                    <MenuItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </MenuItem>
                  ))}
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
            disabled={loading || !formData.nom || !formData.prenom || !formData.poste}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              minWidth: 120,
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            {loading ? 'En cours...' : (employe ? 'Modifier' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeForm; 