import React, { useState, useEffect } from 'react';
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
import { vehiculesAPI, clientsAPI } from '../../services/api';

const VehiculeForm = ({ open, onClose, onSuccess, vehicule = null, fixedClientId = null }) => {
  const [formData, setFormData] = useState({
    id_client: fixedClientId || vehicule?.id_client || '',
    marque: vehicule?.marque || '',
    modele: vehicule?.modele || '',
    numero_immatriculation: vehicule?.numero_immatriculation || '',
    numero_chassis: vehicule?.numero_chassis || '',
    couleur: vehicule?.couleur || '',
    annee: vehicule?.annee || '',
    kilometrage: vehicule?.kilometrage || '',
    carburant: vehicule?.carburant || 'essence'
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carburants = [
    { value: 'essence', label: 'Essence' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybride', label: 'Hybride' },
    { value: 'electrique', label: 'Électrique' }
  ];

  // Charger la liste des clients
  useEffect(() => {
    if (fixedClientId) {
      // Si un client est imposé, inutile de charger toute la liste
      setClients([]);
      setFormData(prev => ({ ...prev, id_client: fixedClientId }));
      return;
    }
    const fetchClients = async () => {
      try {
        const response = await clientsAPI.getAll();
        setClients(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des clients:', err);
      }
    };
    fetchClients();
  }, [fixedClientId]);

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
      // Normaliser l'immatriculation (trim + upper)
      const normalizedImmatriculation = (formData.numero_immatriculation || '')
        .trim()
        .toUpperCase();

      const dataToSend = {
        marque: formData.marque,
        modele: formData.modele,
        annee: formData.annee ? parseInt(formData.annee) : null,
        immatriculation: normalizedImmatriculation,
        numero_chassis: formData.numero_chassis,
        couleur: formData.couleur,
        kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : null,
        carburant: formData.carburant,
        client_id: formData.id_client || null
      };

      if (vehicule) {
        await vehiculesAPI.update(vehicule.id_vehicule || vehicule.id, dataToSend);
      } else {
        await vehiculesAPI.create(dataToSend);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      // Gestion dédiée des conflits (immatriculation dupliquée, etc.)
      if (err.response?.status === 409) {
        const apiMsg = err.response?.data?.error || 'Conflit de données';
        setError(
          apiMsg.includes('immatriculation')
            ? "Cette immatriculation existe déjà. Veuillez en saisir une autre."
            : apiMsg
        );
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'enregistrement du véhicule");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      id_client: '',
      marque: '',
      modele: '',
      numero_immatriculation: '',
      numero_chassis: '',
      couleur: '',
      annee: '',
      kilometrage: '',
      carburant: 'essence'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {vehicule ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            {!fixedClientId && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Client *</InputLabel>
                  <Select
                    name="id_client"
                    value={formData.id_client}
                    onChange={handleChange}
                  >
                    {clients.map((client) => {
                      const value = client.id ?? client.id_client;
                      const labelNom = [client.nom, client.prenom].filter(Boolean).join(' ').trim();
                      return (
                        <MenuItem key={value} value={value}>
                          {labelNom || `Client #${value}`} {client.telephone ? `- ${client.telephone}` : ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                name="marque"
                label="Marque *"
                value={formData.marque}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="modele"
                label="Modèle *"
                value={formData.modele}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="numero_immatriculation"
                label="Numéro d'immatriculation *"
                value={formData.numero_immatriculation}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="numero_chassis"
                label="Numéro de chassis"
                value={formData.numero_chassis}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="couleur"
                label="Couleur"
                value={formData.couleur}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="annee"
                label="Année"
                type="number"
                value={formData.annee}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="kilometrage"
                label="Kilométrage"
                type="number"
                value={formData.kilometrage}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Carburant</InputLabel>
                <Select
                  name="carburant"
                  value={formData.carburant}
                  onChange={handleChange}
                >
                  {carburants.map((carburant) => (
                    <MenuItem key={carburant.value} value={carburant.value}>
                      {carburant.label}
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
            disabled={
              loading ||
              (!fixedClientId && !formData.id_client) ||
              !formData.marque ||
              !formData.modele ||
              !formData.numero_immatriculation
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              minWidth: 120,
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            {loading ? 'En cours...' : (vehicule ? 'Modifier' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VehiculeForm; 